#!/usr/bin/env python3
"""Verify tea-shop isolation, shop retrievability and import idempotency (read-only).

Usage:
    python3 scripts/verify_tea_shops.py [--catalog data/white2tea_teas.json]

Checks:
  1. Default-tea isolation: every default row has shop_id IS NULL, and the default
     set contains zero shop teas; count printed for regression tracking.
  2. Guard integrity: no tea violates CHECK (shop_id IS NOT NULL => source_type='shop').
  3. Shop retrievability: tea_shops.white2tea exists; all its teas are reachable
     via join on shop_id, each with source_type='shop', is_public, owner_id NULL.
  4. Uniqueness: 793/793 unique descriptions and slugs among shop teas.
  5. Flavor-map sanity: no coordinate collisions between shop teas and other teas.
  6. Idempotency: recomputes the batch from the catalog (no writes) and compares
     slug/description/coords against the live DB — deterministic baseCoords +
     batch-scoped dedupe obstacles must yield the stored state exactly.

Requires: psycopg2; DB password via env SB_TEAPP_DBPW or
`~/.hermes/secrets/supabase-tokens.env` (key SB_TEAPP_DBPW).
"""

import argparse
import json
import os
import sys
from pathlib import Path

import psycopg2
import psycopg2.extras

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "scripts"))
import import_white2tea as imp  # noqa: E402  (reuses catalog parsing + TYPE_MAP)


def load_dbpw() -> str:
    pw = os.environ.get("SB_TEAPP_DBPW")
    if pw:
        return pw
    secrets = Path.home() / ".hermes/secrets/supabase-tokens.env"
    if secrets.exists():
        for line in secrets.read_text().splitlines():
            if line.startswith("SB_TEAPP_DBPW="):
                return line.split("=", 1)[1].strip().strip("'\"")
    sys.exit("SB_TEAPP_DBPW not set and secrets file missing")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", default="data/white2tea_teas.json")
    args = ap.parse_args()
    catalog_path = REPO / args.catalog if not Path(args.catalog).is_absolute() else Path(args.catalog)

    conn = psycopg2.connect(
        host="aws-0-eu-central-1.pooler.supabase.com", port=5432,
        dbname="postgres", user="postgres.ikitllhvepqkghrajoox",
        password=load_dbpw(), sslmode="require")
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    failures = []

    def check(name, cond, detail=""):
        print(f"{'PASS' if cond else 'FAIL'}  {name}{(' — ' + detail) if detail else ''}")
        if not cond:
            failures.append(name)

    # 1. default isolation
    cur.execute("SELECT COUNT(*) c, COUNT(*) FILTER (WHERE shop_id IS NOT NULL) bad FROM teas WHERE source_type='default'")
    r = cur.fetchone()
    check("default set contains no shop teas", r["c"] > 0 and r["bad"] == 0,
          f"defaults={r['c']} with_shop_id={r['bad']}")
    cur.execute("SELECT COUNT(*) c, COUNT(*) FILTER (WHERE shop_id IS NOT NULL) w FROM teas WHERE shop_id IS NULL AND source_type<>'default'")
    r2 = cur.fetchone()
    check("no non-default teas outside a shop (no owner/teahouse drift)",
          r2["w"] == 0, f"shop_id IS NULL & source_type!=default: {r2['w']}")

    # 2. guard
    cur.execute("SELECT COUNT(*) c FROM teas WHERE shop_id IS NOT NULL AND source_type<>'shop'")
    check("CHECK constraint violations (shop_id w/ non-shop type)", cur.fetchone()["c"] == 0)

    # 3. shop retrievability
    cur.execute("SELECT id, name, slug FROM tea_shops WHERE slug='white2tea'")
    shop = cur.fetchone()
    check("tea_shops.white2tea exists", shop is not None)
    cur.execute("""SELECT COUNT(*) c,
                          COUNT(*) FILTER (WHERE source_type='shop' AND is_public AND owner_id IS NULL
                                           AND source=ts.name) ok
                   FROM teas t JOIN tea_shops ts ON ts.id=t.shop_id WHERE ts.slug='white2tea'""")
    r = cur.fetchone()
    check("every shop tea carries shop=White2Tea + non-default marker",
          r["c"] > 0 and r["c"] == r["ok"], f"shop_teas={r['c']} fully_marked={r['ok']}")
    # anon-visible path = what the app queries
    cur.execute("""SELECT COUNT(*) c FROM teas WHERE shop_id=%s""", (shop["id"],))
    check("shop-scoped query returns all shop teas", r["c"] == cur.fetchone()["c"])

    # 4. uniqueness
    cur.execute("""SELECT COUNT(*) c, COUNT(DISTINCT description) ud, COUNT(DISTINCT slug) us
                   FROM teas WHERE source_type='shop'""")
    r = cur.fetchone()
    check("shop teas: unique descriptions", r["c"] == r["ud"], f"{r['c']}/{r['ud']}")
    check("shop teas: unique slugs", r["c"] == r["us"], f"{r['c']}/{r['us']}")

    # 5. flavor collisions between shop teas and the rest
    cur.execute("""SELECT COUNT(*) c FROM teas t1 JOIN teas t2
                   ON t1.id<t2.id AND t1.flavor_x=t2.flavor_x AND t1.flavor_y=t2.flavor_y
                   WHERE NOT (t1.slug LIKE 'white2tea-%%' AND t2.slug LIKE 'white2tea-%%')
                   AND (t1.slug LIKE 'white2tea-%%' OR t2.slug LIKE 'white2tea-%%')""")
    check("no flavor-coordinate collisions vs other teas", cur.fetchone()["c"] == 0)

    # 6. idempotency: recompute batch, compare to DB without writing
    cur.execute("SELECT id, name, slug, url FROM tea_shops WHERE slug=%s", (imp.SHOP["slug"],))
    s = cur.fetchone()
    imp.SHOP["id"] = s["id"]
    products = json.loads(catalog_path.read_text())["products"]
    rows = imp.build_rows(products)
    imp.dedupe_coords(cur, rows)
    expected = {r["slug"]: r for r in rows}
    cur.execute("SELECT slug, name, description, flavor_x, flavor_y FROM teas WHERE source_type='shop'")
    live = {r["slug"]: r for r in cur.fetchall()}
    missing = sorted(set(expected) - set(live))
    extra = sorted(set(live) - set(expected))
    drift = []
    for slug, row in expected.items():
        l = live.get(slug)
        if l is None:
            continue
        if l["description"] != row["description"] or l["name"] != row["name"]:
            drift.append(f"{slug}:desc/name")
        if (l["flavor_x"], l["flavor_y"]) != (row["flavor_x"], row["flavor_y"]):
            drift.append(f"{slug}:coords")
    check("recomputed batch matches live state (idempotency)",
          not missing and not extra and not drift,
          f"missing={len(missing)} extra={len(extra)} drifted={len(drift)}")
    if drift:
        print("   e.g.", ", ".join(drift[:5]))
    if missing or extra:
        print("   missing:", missing[:5], " extra:", extra[:5])

    print(f"\nSUMMARY: defaults check done; {failures or 'all checks passed'}")
    conn.close()
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())