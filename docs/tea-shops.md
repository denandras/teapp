# Tea shops (vendors) and non-default tea semantics

## 1. Where "default" is defined today

The curated default set is **not** a list — it is a value of `teas.source_type`:

- Column: `teas.source_type TEXT NOT NULL DEFAULT 'default'` (plain text, not an enum — no ALTER TYPE needed).
- All curated/seed teas have `source_type = 'default'`; the DB currently has 614 rows, all `default`.
- The frontend treats `source_type === 'default'` as the default set everywhere (see §4).
- RLS: `teas_select` (`USING (true)`, role `public`) makes all teas readable, so no new SELECT policy is needed; anon visibility relies on the app filtering by `source_type` before rendering.
- Seed/source history is in `scripts/migrate-teas-to-db.sql` and the Data hygiene log in `~/projects/.meta/teapp.md`; there is no `is_default` flag.

## 2. Schema addition (migration `scripts/2026-11-03_tea_shops.sql`)

New table `tea_shops`:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK, default `uuid_generate_v4()` | |
| `name` | text NOT NULL | Display name, e.g. `White2Tea` |
| `slug` | text NOT NULL UNIQUE | e.g. `white2tea` |
| `url` | text | Shop URL |
| `is_manual` | boolean NOT NULL default true | true = manually created vendor record, not auto-scraped |
| `created_at` | timestamptz default now() | |

Link from tea → shop: `teas.shop_id uuid NULL REFERENCES tea_shops(id)` + index `teas_shop_id_idx`. A join table is unnecessary: a tea comes from one vendor.

**Exclusion mechanism.** `ALTER TABLE teas ADD CONSTRAINT teas_shop_requires_shop_type CHECK (shop_id IS NULL OR source_type = 'shop')`.
Shop teas are inserted with `source_type = 'shop'` **and** `shop_id` set. This means the "default" set is automatically every tea with `shop_id IS NULL` / `source_type = 'default'` — no query change is required to keep defaults untouched, and the DB enforces that a shop tea can never be a plain default tea.

Why `source_type = 'shop'` rather than keeping `default` and filtering `shop_id IS NULL`: the whole codebase (store, modals, filters, counts, RLS mindset) keys on `source_type`, so a third-party-shop tea behaves like teahouse teas already do (browsable for all, not admin-curated, own chip/color/filter), while the check constraint guarantees exclusion from defaults at the data layer. `source_type` is TEXT, so this needs no enum migration.

RLS on `tea_shops`: enabled, policy `tea_shops_select_all` (`USING (true)`) — shops are public read-only reference data; writes are admin/owner-side only for now.

Seed row: `('White2Tea', 'white2tea', 'https://white2tea.com', is_manual = true)`. **No product/tea data is imported by this migration.**

## 3. ORM/type model changes (`src/lib/types.ts`)

- `TeaSourceType` union: add `"shop"` → `type TeaSourceType = "default" | "user" | "teahouse" | "shop"`.
- `SOURCE_LABELS.shop = "White2Tea"`-style label: `shop: "Shop"`.
- `SOURCE_COLORS.shop = "#8a63c9"` (distinct violet; defaults/teahouse colors unchanged).
- `Tea` interface: add `shop_id?: string | null` (column rides through `.from("teas").select("*")` automatically in `store.ts`).

## 4. API / serializer / UI touchpoints that must filter or branch on shop membership

| File | Touchpoint | Change |
|---|---|---|
| `src/lib/store.ts` | `is_custom: source_type !== 'default'`, source fallbacks | `"shop"` falls out automatically (≠ `'default'`); verify shop teas land in `allTeas` |
| `src/app/database/page.tsx` | Source filter pills `["all","default","teahouse","user"]`, `sourceFilter` matching | Add `shop` pill + label; `sourceFilter === 'shop'` filter works as-is |
| `src/app/page.tsx` | scatter/chip color + label from `SOURCE_COLORS`/`SOURCE_LABELS` | Automatic once types.ts adds `shop` |
| `src/components/TeaDetailModal.tsx` | `isOwner` (`source_type !== 'default'`), edit perms, source chip | Automatic; admins may edit shop teas, owner rule unchanged |
| `src/app/settings/page.tsx` | footer counts `source_type === 'default'` / `'teahouse'` | Unchanged — shop teas are not in either count (correct: not surfaced as defaults) |
| Queries inserting shop teas | inserts must set `source_type='shop'`, `shop_id`, `source='White2Tea'` (or shop name), `is_public=true`, `owner_id=NULL` | — |

Default-tea behavior with `shop_id IS NULL` is byte-identical to before: all existing 614 rows keep `source_type='default'`, the check constraint passes vacuously, and every `=== 'default'` branch is untouched.

## 5. Import path (done 2026-11-03)

Imported via `scripts/import_white2tea.py` (catalog snapshot `data/white2tea_teas.json`; re-scrape docs: White2Tea scrape task / `python3 scrape.py [--refresh]`):

```bash
python3 scripts/import_white2tea.py [--catalog data/white2tea_teas.json] [--dry-run]
```

- Upserts on unique slug `white2tea-<handle>` → idempotent, update-in-place on re-run; shop teas missing from the catalog are removed as stale. Prices, variant sizes, availability and source URL are preserved inside the description's `[White2Tea shop listing: …]` provenance line (schema has no metadata column).
- 2026-11-03 run: 1028 catalog products → 793 tea rows (235 `Non-Tea` teaware skipped); verified twice-run idempotent, 793/793 unique descriptions, defaults 614 unchanged, anon REST sees 793 shop teas / 614 defaults.
- Guard: script asserts `shop_id IS NOT NULL ⇒ source_type='shop'` (also enforced by CHECK `teas_shop_requires_shop_type`) and aborts if the default count changed.