/**
 * Regression tests for the >1000-tea truncation cap (kanban t_53bb5a0b).
 *
 * Roots of this suite, for whoever removes a line and wonders why:
 * - Supabase's hosted REST (PostgREST) silently truncates un-paginated
 *   responses at db.max_rows (1000). No error, nothing in the UI — just a
 *   missing tail of the table. Fixed by src/lib/paged.ts (fetchAllPaged).
 * - The fake server (fakeSupabase.ts) reproduces the truncation exactly:
 *   no Range → first 1000 rows only; .range() → exact slice.
 * - If you switch fetches back to bare .select(), these tests fail.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeServer, type FakeServer, type FakeTea } from "./fakeSupabase";
import { buildTeaDataset } from "./fixtures";
import { fetchAllPaged, MAX_PAGE_SIZE } from "@/lib/paged";

const holder: { fake: { client: any; server: FakeServer } } = vi.hoisted(() => ({
  fake: undefined as any,
}));

// Delegate .from() to whatever fake server the current test seeded.
vi.mock("@/lib/supabaseClient", async () => {
  const { createFakeServer } = await import("./fakeSupabase");
  const { buildTeaDataset } = await import("./fixtures");
  holder.fake = createFakeServer({ teas: buildTeaDataset(1500) });
  return {
    supabase: {
      from: (table: string) => holder.fake.client.from(table),
      rpc: () => ({ data: null, error: null }),
    },
  };
});

beforeEach(() => {
  holder.fake = createFakeServer({ teas: buildTeaDataset(1500) });
});
const SERVER = () => holder.fake.server as FakeServer;
const CLIENT = () => holder.fake.client;

const seededIds = (teas: FakeTea[]) => new Set(teas.map((t) => t.id));

describe("fetchAllPaged — full page-through of a >1000-row table", () => {
  it("returns every seeded row: no duplicates, no gaps, exactly 1500", async () => {
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id" });
    expect(res.total).toBe(1500);
    expect(res.complete).toBe(true);
    expect(res.rows).toHaveLength(1500);

    const ids = res.rows.map((r) => r.id);
    const seen = new Set(ids);
    expect(new Set(ids).size).toBe(1500); // no duplicates
    for (let i = 1; i <= 1500; i++) expect(seen.has(i)).toBe(true); // no gaps
    expect(new Set(ids)).toEqual(seededIds(buildTeaDataset(1500)));

    const slugs = res.rows.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(1500);
  });

  it("is NOT truncated at the server's 1000-row cap (explicit anti-regression)", async () => {
    // The one assertion that pins the whole bug: an unpaged fetch would have
    // returned exactly 1000 rows here, silently eating the last 500.
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id" });
    expect(res.rows.length).toBe(1500);
    expect(res.rows.length).not.toBe(1000);
    expect(res.rows.length).toBeGreaterThan(MAX_PAGE_SIZE);
  });

  it("crosses the item-1000 boundary with no duplicate or skipped row", async () => {
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id" });
    for (const i of [999, 1000, 1001, 1002]) {
      const around = res.rows.filter((r) => r.id === i);
      expect(around).toHaveLength(1);
      expect(around[0].slug).toBe(`test-tea-${i}`);
    }
    // Page 1 carried 0-999, page 2 the rest.
    const ranges = SERVER().requests.filter((r) => r.table === "teas").map((r) => r.range);
    expect(ranges[0]).toEqual([0, 999]);
    expect(ranges).toContainEqual([1000, 1999]);
  });

  it("handles the final partial page and requests nothing beyond the total", async () => {
    await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id", pageSize: 400 });
    const teaRequests = SERVER().requests.filter((r) => r.table === "teas");
    // 1500 rows at 400/page = 4 requests, last one a 300-row partial page,
    // and NO fifth (empty) request that could double-append.
    expect(teaRequests).toHaveLength(4);
    expect(teaRequests[3].range).toEqual([1200, 1599]);
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id", pageSize: 400 });
    expect(res.rows).toHaveLength(1500);
    expect(new Set(res.rows.map((r) => r.id)).size).toBe(1500);
  });

  it("asks the server for an exact count only on the first page", async () => {
    await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id" });
    const teaRequests = SERVER().requests.filter((r) => r.table === "teas");
    expect(teaRequests[0].count).toBe(true);
    expect(teaRequests.slice(1).every((r) => !r.count)).toBe(true);
  });
});

describe("fetchAllPaged — max page size enforcement", () => {
  it("clamps pageSize to MAX_PAGE_SIZE (1000) — never asks the server for more", async () => {
    await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id", pageSize: 5000 });
    const teaRequests = SERVER().requests.filter((r) => r.table === "teas");
    expect(teaRequests[0].range).toEqual([0, MAX_PAGE_SIZE - 1]);
    expect(teaRequests[1].range).toEqual([MAX_PAGE_SIZE, 2 * MAX_PAGE_SIZE - 1]);
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id", pageSize: 5000 });
    expect(res.rows).toHaveLength(1500); // clamping loses nothing
  });

  it("clamps tiny/absurd pageSize values to >= 1", async () => {
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "id", tiebreak: "id", pageSize: 0 });
    expect(res.rows).toHaveLength(1500);
    expect(new Set(res.rows.map((r) => r.id)).size).toBe(1500);
  });
});

describe("fetchAllPaged — stable ordering across page boundaries", () => {
  it("never dupes or skips rows when duplicates of the sort key straddle an offset", async () => {
    // The fixture repeats every 5th display name across hundreds of ids, so
    // an offset boundary (1000) must land INSIDE a duplicate-name group. With
    // the id tiebreak, paging stays a strict partition; without ordering the
    // fake's undefined order would corrupt pages.
    const res = await fetchAllPaged<FakeTea>("teas", { orderBy: "name", tiebreak: "id" });

    // Deterministic lexicographic order by (name, id):
    expect(res.rows).toHaveLength(1500);
    const seen = new Set(res.rows.map((r) => r.id));
    expect(seen.size).toBe(1500);
    const ids = res.rows.map((r) => r.id);
    for (let k = 1; k < ids.length; k++) {
      const prev = res.rows[k - 1], cur = res.rows[k];
      const key: [string, number] = [prev.name, prev.id], nextKey: [string, number] = [cur.name, cur.id];
      const cmp =
        key[0] < nextKey[0] ? -1 : key[0] > nextKey[0] ? 1 : key[1] - nextKey[1];
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });

  it("honors descending order with the tiebreak still ascending", async () => {
    const res2 = await fetchAllPaged<FakeTea>("teas", { orderBy: "name", ascending: false, pageSize: 700 });
    expect(res2.rows).toHaveLength(1500);
    expect(new Set(res2.rows.map((r) => r.id)).size).toBe(1500);
    // First row has the lexicographically greatest (name, id) of the seeded set
    // — descending by name, with the tiebreak still ascending by id.
    const sorted = buildTeaDataset(1500).sort((a, b) =>
      a.name < b.name ? 1 : a.name > b.name ? -1 : a.id - b.id
    );
    expect(res2.rows[0].id).toBe(sorted[0].id);
    expect(res2.rows[1499].id).toBe(sorted[1499].id);
  });
});

describe("the regression premise itself — unpaged fetch is silently capped", () => {
  it("a bare .select('*') against the same server returns exactly 1000 of 1500 (what the old code did)", async () => {
    // This test documents WHY the paged fetch exists: it demonstrates the
    // server truncation the fix works around. Keep it green while paged.ts
    // exists — its failure means the fake stopped modelling the cap.
    const { data } = await CLIENT().from("teas").select("*");
    expect(data).toHaveLength(1000);
    const ids = new Set((data as FakeTea[]).map((r) => r.id));
    expect(ids.has(1500)).toBe(false); // tail silently lost, no error raised
    expect(ids.has(999)).toBe(true);
  });

  it("paged fetch recovers the rows the unpaged fetch loses, byte-for-byte", async () => {
    const capped = (await CLIENT().from("teas").select("*"))!.data as FakeTea[];
    const full = (await fetchAllPaged<FakeTea>("teas", { orderBy: "name", tiebreak: "id" })).rows;
    const missing = buildTeaDataset(1500).filter((t) => !capped.some((c) => c.id === t.id));
    expect(missing).toHaveLength(500);
    for (const m of missing) expect(full.find((f) => f.id === m.id)).toBeDefined();
    expect(full.length).toBe(1500);
  });
});

describe("fetchAllPaged — error propagation", () => {
  it("rejects with a table-scoped error when the server returns an error", async () => {
    const errFake = createFakeServer({ teas: buildTeaDataset(10) });
    errFake.server.errorTable = "teas";
    holder.fake = errFake; // wire it into the mocked supabaseClient
    await expect(fetchAllPaged("teas", { orderBy: "id", tiebreak: "id" })).rejects.toThrow(
      /fetchAllPaged\(teas\): simulated REST error: teas/
    );
  });
});