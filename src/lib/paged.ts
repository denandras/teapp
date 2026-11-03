"use client";

import { supabase } from "./supabaseClient";

// Supabase's hosted REST API (PostgREST) silently truncates any un-paginated
// response to 1000 rows (server-side `db.max_rows` default). Every multi-row
// fetch must go through this helper — a bare `.select("*")` quietly loses
// everything past row 1000.
export const MAX_PAGE_SIZE = 1000;

export interface PagedResult<T> {
  rows: T[];
  /** Server-reported total row count; -1 if the server did not report one. */
  total: number;
  /** True when rows.length covers every row the server reported. */
  complete: boolean;
}

export interface FetchAllOpts {
  /** Columns to select (default "*" — never narrow by default). */
  select?: string;
  /** Extra filters, e.g. (q) => q.eq("user_id", userId). */
  filters?: (q: any) => any;
  /** Primary sort column. Paging correctness requires a deterministic order. */
  orderBy?: string;
  ascending?: boolean;
  /** Tiebreaker column appended after orderBy so pages never dup/skip rows. */
  tiebreak?: string;
  /** Rows per page (clamped to MAX_PAGE_SIZE — the server's hard limit). */
  pageSize?: number;
}

/**
 * Fetch every row of a Supabase table query in offset pages.
 *
 * Contract (see kanban t_17e5485d / audit teapp-1000-cap-audit.md):
 * - Offset/Range pagination via `.range(start, end)`, PAGE_SIZE = 1000 (server max).
 * - Ordering is mandatory: `orderBy` (+ `tiebreak` = "id") so the sort is
 *   stable and deterministic — without it page boundaries are undefined and
 *   pages can duplicate or skip rows.
 * - Total comes from the first page's `count: "exact"` (Content-Range header);
 *   the loop stops when a page returns fewer rows than requested OR the
 *   reported total is reached. Both branches converge even if the server
 *   silently clamps the page below the requested size.
 * - Nothing is kept in memory beyond the assembled result array; each page
 *   request is rebuilt from scratch (no cursor, read-mostly single-sync use).
 */
export async function fetchAllPaged<T = any>(
  table: string,
  opts: FetchAllOpts = {}
): Promise<PagedResult<T>> {
  const {
    select = "*",
    filters,
    orderBy,
    ascending = true,
    tiebreak = "id",
    pageSize = MAX_PAGE_SIZE,
  } = opts;

  const size = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const rows: T[] = [];
  let total = -1;
  let offset = 0;

  for (;;) {
    // Only the first request asks the server for an exact count (Prefer:
    // count=exact / Content-Range) — later pages don't need it.
    let q = supabase
      .from(table)
      .select(select, total === -1 ? { count: "exact" } : undefined);
    if (filters) q = filters(q);
    // A stable ordering is required for offset paging: primary key + tiebreak.
    const sortCol = orderBy ?? tiebreak;
    q = q.order(sortCol, { ascending });
    if (tiebreak !== sortCol) q = q.order(tiebreak, { ascending: true });
    q = q.range(offset, offset + size - 1);

    const { data, error, count } = await q;
    if (error) {
      throw new Error(`fetchAllPaged(${table}): ${error.message}`);
    }
    if (total === -1 && count != null) total = count;

    const page = (data ?? []) as T[];
    rows.push(...page);

    // Converge when the page came back short, or we've covered the total.
    if (page.length < size) break;
    if (total !== -1 && rows.length >= total) break;
    offset += size;
  }

  return { rows, total, complete: total === -1 ? true : rows.length >= total };
}