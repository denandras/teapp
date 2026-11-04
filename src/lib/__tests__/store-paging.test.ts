/**
 * Store-level regression tests for the >1000-tea truncation cap
 * (kanban t_53bb5a0b, frontend side t_9ed62cbf).
 *
 * Exercises BOTH store paths that previously used bare, un-paginated
 * .select("*") (silently truncated at 1000 rows by PostgREST):
 *   - loadDemoData (demo mode, ordered by name + id)
 *   - syncFromSupabase (signed-in; also pages user_teas and tea_logs, which
 *     each carry >1000 rows here)
 *
 * The mock client (see fakeSupabase.ts) enforces the same silent-cap
 * behaviour the real server has. If anyone reverts the store to unpaged
 * fetches, these fail.
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import {
  buildTeaDataset,
  buildUserTeaRows,
  buildTeaLogRows,
  USER_ID,
} from "./fixtures";

const holder: { fake: any } = vi.hoisted(() => ({ fake: null as any }));

vi.mock("@/lib/supabaseClient", async () => {
  const { createFakeServer } = await import("./fakeSupabase");
  const { buildTeaDataset } = await import("./fixtures");
  // Default dataset; tests reseed via holder.fake before each store call.
  holder.fake = createFakeServer({ teas: buildTeaDataset(1500) });
  return {
    supabase: {
      from: (table: string) => holder.fake.client.from(table),
      rpc: () => ({ data: null, error: null }),
    },
  };
});

let useTeaStore: any;

async function seedSignedInServer() {
  const teas = buildTeaDataset(1500);
  const { createFakeServer } = await import("./fakeSupabase");
  const fake = createFakeServer({
    teas,
    user_teas: buildUserTeaRows(teas, USER_ID, 120),
    tea_logs: buildTeaLogRows(teas, USER_ID, 1100), // >1000: must also page
    user_preferences: [{ user_id: USER_ID, theme: "cozy-light", accent_color: "#123abc" }],
  });
  holder.fake = fake;
  return fake;
}

beforeAll(async () => {
  await seedSignedInServer();
  useTeaStore = (await import("@/lib/store")).useTeaStore;
});

beforeEach(async () => {
  await seedSignedInServer();
});

afterEach(() => {
  useTeaStore.setState({
    allTeas: [],
    allTeasTotal: 0,
    teaStates: {},
    teaLogs: {},
    customTeas: [],
    hiddenTeas: [],
  });
});

describe("demo mode — loadDemoData pages through the full tea table", () => {
  it("assembles all 1500 teas, no duplicates, no truncation at 1000", async () => {
    await useTeaStore.getState().loadDemoData();
    await vi.waitFor(() => {
      expect(useTeaStore.getState().allTeas.length).toBe(1500);
    });

    const state = useTeaStore.getState();
    expect(state.allTeasTotal).toBe(1500);
    expect(state.allTeas.length).toBeGreaterThan(1000); // the regression line itself
    expect(state.allTeasTotal).not.toBe(1000);

    const ids = state.allTeas.map((t: any) => String(t.id));
    expect(new Set(ids).size).toBe(1500); // no duplicates appended
    const slugs = state.allTeas.map((t: any) => t.slug);
    expect(new Set(slugs).size).toBe(1500); // no gaps either
    const byName = state.allTeas.map((t: any) => t.name as string);
    const sorted = [...byName].sort((a: string, b: string) =>
      a < b ? -1 : a > b ? 1 : 0
    );
    // Ordered by (name, id) — the requested sort for the demo path.
    expect(byName).toEqual(sorted);
    expect(state.allTeas.every((t: any) => t.source_type === "default")).toBe(true);
  });

  it("a continuation page actually happened (the paged load-more trigger)", async () => {
    await useTeaStore.getState().loadDemoData();
    await vi.waitFor(() => {
      expect(useTeaStore.getState().allTeas.length).toBe(1500);
    });
    const teaRequests = holder.fake.server.requests.filter(
      (r: any) => r.table === "teas"
    );
    // 1500 @ 1000/page → page 1 (0-999) + continuation page (1000-1999).
    expect(teaRequests.length).toBe(2);
    expect(teaRequests[0].range).toEqual([0, 999]);
    expect(teaRequests[1].range).toEqual([1000, 1999]);
  });
});

describe("signed-in mode — syncFromSupabase pages teas, user_teas and tea_logs", () => {
  it("syncs all 1500 teas with full status/log coverage and no duplicates", async () => {
    const fake = await seedSignedInServer();
    await useTeaStore.getState().syncFromSupabase(USER_ID);
    await vi.waitFor(() => {
      expect(useTeaStore.getState().allTeas.length).toBe(1500);
    });

    const state = useTeaStore.getState();
    expect(state.allTeas.length).toBe(1500);
    expect(state.allTeasTotal).toBe(1500);
    expect(new Set(state.allTeas.map((t: any) => String(t.id))).size).toBe(1500);

    // Every seeded user status row resolved to a slug → a teaState.
    for (const row of fake.server.tables.user_teas) {
      expect(state.teaStates[`test-tea-${row.tea_id}`]).toBe(row.status);
    }
    expect(Object.keys(state.teaStates)).toHaveLength(fake.server.tables.user_teas.length);

    // All 1100 logs (>1000 — the old unpaged path would have dropped the tail).
    const logArrays = Object.values(state.teaLogs as Record<string, any[]>);
    expect(logArrays.length).toBeGreaterThan(0);
    const totalLogs = logArrays.reduce((n, arr) => n + arr.length, 0);
    expect(totalLogs).toBe(1100);
    const loggedIds = new Set(logArrays.flat().map((l: any) => Number(l.id)));
    expect(loggedIds.size).toBe(1100); // no logs lost or duplicated while paging
  });

  it("falls back to the paged id/slug fetch when the full select fails", async () => {
    const { createFakeServer } = await import("./fakeSupabase");
    const fake = createFakeServer({ teas: buildTeaDataset(1500) });
    fake.server.errorTable = "teas";
    fake.server.errorOnce = true; // full select errors once, fallback succeeds
    holder.fake = fake;
    await useTeaStore.getState().syncFromSupabase(USER_ID);
    const state = useTeaStore.getState();
    expect(state.allTeas.length).toBe(1500);
    expect(new Set(state.allTeas.map((t: any) => String(t.id))).size).toBe(1500);
  });
});