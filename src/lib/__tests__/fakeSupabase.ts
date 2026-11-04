/**
 * In-memory fake of the Supabase JS client's query surface, built to mirror
 * the one server behaviour that caused the 1000-tea cap bug (kanban t_53bb5a0b):
 *
 *   PostgREST silently truncates any response without an explicit Range to
 *   `maxRows` (Supabase default 1000) — no error, no signal. An un-paginated
 *   `.select("*")` therefore loses every row past 1000.
 *
 * The fake reproduces this: a query with `.range(start, end)` returns exactly
 * that slice (plus `count` when requested); a query without `.range()` returns
 * only the first `maxRows` rows. Any regression back to unpaged fetches is
 * caught by tests asserting more than `maxRows` rows are returned.
 *
 * Only the ops used by src/lib (store.ts, paged.ts, admin) are implemented.
 */
import type { createClient } from "@supabase/supabase-js";

export interface FakeTea {
  id: number;
  slug: string;
  name: string;
  original_name: string;
  translation: string;
  description: string;
  tea_type: string;
  category: string;
  origin: string;
  caffeine_level: string;
  source_type: string;
  source: string;
  is_public: boolean;
  is_custom: boolean;
  owner_id: string | null;
  characteristics: string[];
  flavor_x: number;
  flavor_y: number;
}

type Filter = { col: string; op: "eq" | "ne" | "is" | "in"; val: any };
type OrderSpec = { col: string; ascending: boolean };
export interface RecordedRequest {
  table: string;
  range: [number, number] | null;
  count: boolean;
  orders: { col: string; ascending: boolean }[];
}

export class FakeSupabaseError extends Error {}

export class Query<T = any> {
  private filters: Filter[] = [];
  private orders: OrderSpec[] = [];
  private rangeSpec: [number, number] | null = null;
  private wantsCount = false;
  private singleMode = false;
  private resolved = false;

  constructor(private server: FakeServer, private table: string) {}

  select(_cols?: string, opts?: { count?: "exact" | "planned" | "estimated" }) {
    if (opts?.count === "exact") this.wantsCount = true;
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, ascending: opts?.ascending !== false });
    return this;
  }
  range(start: number, end: number) {
    this.rangeSpec = [start, end];
    return this;
  }
  eq(col: string, val: any) { this.filters.push({ col, op: "eq", val }); return this; }
  ne(col: string, val: any) { this.filters.push({ col, op: "ne", val }); return this; }
  is(col: string, val: any) { this.filters.push({ col, op: "is", val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ col, op: "in", val: vals }); return this; }

  single() { this.singleMode = true; return this; }

  // --- in-memory execution ---
  private matches(row: any): boolean {
    for (const f of this.filters) {
      const v = row[f.col];
      const ok =
        f.op === "eq" ? v === f.val :
        f.op === "ne" ? v !== f.val :
        f.op === "is" ? v === null || v === f.val :
        f.op === "in" ? (f.val as any[]).includes(v) : false;
      if (!ok) return false;
    }
    return true;
  }

  private sort(rows: any[]): any[] {
    const sorted = [...rows];
    for (const o of [...this.orders].reverse()) {
      sorted.sort((a, b) => {
        const av = a[o.col], bv = b[o.col];
        if (av === bv) return 0;
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return o.ascending ? cmp : -cmp;
      });
    }
    return sorted;
  }

  private execute() {
    if (this.resolved) throw new FakeSupabaseError("Query consumed twice");
    this.resolved = true;
    if (this.server.errorTable && this.table === this.server.errorTable) {
      const msg = `simulated REST error: ${this.table}`;
      if (this.server.errorOnce) this.server.errorTable = null;
      return { data: null, error: { message: msg }, count: null };
    }
    const rows = (this.server.tables[this.table] ?? []).filter((r) => this.matches(r));
    let slice = this.sort(rows);
    let count: number | null = this.wantsCount ? slice.length : null;

    if (this.rangeSpec) {
      const [start, end] = this.rangeSpec;
      slice = slice.slice(start, end + 1);
    } else {
      // THE BUG being guarded against: no explicit Range → PostgREST returns
      // only the first maxRows rows, silently.
      slice = slice.slice(0, this.server.maxRows);
    }
    this.server.requests.push({
      table: this.table,
      range: this.rangeSpec,
      count: this.wantsCount,
      orders: [...this.orders],
    });

    if (this.singleMode) {
      if (slice.length === 0) return { data: null, error: { message: "no rows" }, count };
      return { data: slice[0], error: null, count };
    }
    return { data: slice, error: null, count };
  }

  then(resolve: (v: any) => any, reject: (e: any) => any): Promise<any> {
    return Promise.resolve().then(() => {
      try { return resolve(this.execute()); } catch (e) { return reject(e); }
    });
  }
}

export interface FakeServer {
  tables: Record<string, any[]>;
  maxRows: number;
  requests: RecordedRequest[];
  /** When set, every query against this table returns { error } — for testing error propagation. */
  errorTable: string | null;
  /** When true, the error table errors only ONCE, then clears itself (first-fetch-fails scenarios). */
  errorOnce: boolean;
  /** Server-side total rows available for a table (tests use this to set up data). */
  seedTable(name: string, rows: any[]): void;
}

export function createFakeServer(tables: Record<string, any[]> = {}, maxRows = 1000) {
  const server: FakeServer = {
    tables: { ...tables },
    maxRows,
    requests: [],
    errorTable: null,
    errorOnce: false,
    seedTable(name, rows) { this.tables[name] = rows; },
  };
  const client = {
    from(table: string) {
      return new Query(server, table);
    },
    // Minimal stubs for anything the imported modules touch at call time.
    rpc() { return { data: null, error: null }; },
    channel() { return { on() { return this; }, subscribe() { return this; } }; },
  };
  return { client, server };
}