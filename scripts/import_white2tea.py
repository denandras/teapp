#!/usr/bin/env python3
"""Import the scraped White2Tea catalog into teapp as a non-default shop catalog.

Creates-or-finds the `tea_shops` row (slug 'white2tea', is_manual=true) and upserts
every tea product from the catalog JSON as `source_type='shop'` teas attached to it.
Teaware (“Non-Tea” product_type) is skipped — it is not tea. Idempotent: rows are
keyed on the unique slug `white2tea-<handle>` and updated in place on re-run, so
running the script twice yields the same final state with no duplicates.

Guards enforced by this script (and by the DB):
  * CHECK `teas_shop_requires_shop_type` forbids shop_id with source_type != 'shop'
    at the data layer — a shop tea can never become a default tea (asserted too).
  * The default set (shop_id IS NULL && source_type='default') is counted before
    and after; the script aborts the transaction if the count changed.

Usage:
    python3 scripts/import_white2tea.py [--catalog data/white2tea_teas.json] [--dry-run]

Requirements: psycopg2; DB password in `~/.hermes/secrets/supabase-tokens.env` under
`SB_TEAPP_DBPW` (or env SB_TEAPP_DBPW). Catalog default: data/white2tea_teas.json
(copy from the White2Tea scrape task output, 2026-11-03).
"""
import argparse
import hashlib
import json
import math
import os
import re
import sys
from pathlib import Path

import psycopg2
import psycopg2.extras

REPO = Path(__file__).resolve().parent.parent
SECRETS = Path.home() / ".hermes" / "secrets" / "supabase-tokens.env"

SHOP = {
    "name": "White2Tea",
    "slug": "white2tea",
    "url": "https://white2tea.com",
}

TYPE_MAP = {  # product_type -> (tea_type, category, color_hex, flavor cluster (fx, fy))
    "Raw Puer Tea": ("sheng_puerh", "true_tea", "#DBBC70", (30.1, 52.8)),
    "Ripe Puer Tea": ("shou_puerh", "true_tea", "#6B4226", (84.0, 65.1)),
    "Black Tea": ("black", "true_tea", "#8B4513", (53.5, 49.2)),
    "White Tea": ("white", "true_tea", "#C8C4B0", (15.1, 10.9)),
    "Oolong Tea": ("oolong", "true_tea", "#D4852A", (50.1, 29.8)),
    "Yellow Tea": ("yellow", "true_tea", "#E6C84E", (18.0, 12.5)),
    "Heicha": ("dark", "true_tea", "#4A3225", (58.0, 40.0)),
    None: (None, None, None, (50.0, 50.0)),  # matcha/subscription/resolved via tags below
    "Tea Sample Sets": (None, "blend", "#C4A877", (50.0, 40.0)),
}

TAG_TYPE_OVERRIDES = [  # applied to untyped products, first matching tag wins
    (re.compile(r"matcha", re.I), "green"),
    (re.compile(r"ripe puer", re.I), "shou_puerh"),
    (re.compile(r"raw puer|sheng", re.I), "sheng_puerh"),
    (re.compile(r"black tea", re.I), "black"),
    (re.compile(r"white tea", re.I), "white"),
    (re.compile(r"oolong", re.I), "oolong"),
    (re.compile(r"heicha", re.I), "dark"),
]
TAG_COLOR = {"green": "#7BA05B", "shou_puerh": "#6B4226", "sheng_puerh": "#DBBC70",
             "black": "#8B4513", "white": "#C8C4B0", "oolong": "#D4852A", "dark": "#4A3225"}
CLUSTER_MEANS = {"green": (23.4, 19.4), "white": (15.1, 10.9), "black": (53.5, 49.2),
                 "oolong": (50.1, 29.8), "sheng_puerh": (30.1, 52.8), "shou_puerh": (84.0, 65.1),
                 "dark": (58.0, 40.0)}


def load_db_password() -> str:
    pw = os.environ.get("SB_TEAPP_DBPW")
    if pw:
        return pw
    for line in SECRETS.read_text().splitlines():
        m = re.match(r"\s*SB_TEAPP_DBPW\s*=\s*(\S+)", line)
        if m:
            return m.group(1)
    sys.exit("SB_TEAPP_DBPW not found (env or ~/.hermes/secrets/supabase-tokens.env)")


def connect():
    return psycopg2.connect(
        host="aws-0-eu-central-1.pooler.supabase.com",
        port=5432, dbname="postgres", user="postgres.ikitllhvepqkghrajoox",
        password=load_db_password(), sslmode="require")


def price_summary(rec) -> str:
    variants = rec.get("variants") or []
    prices = []
    for v in variants:
        try:
            prices.append(float(v["price"]))
        except (KeyError, TypeError, ValueError):
            pass
    titles = [v.get("title") or "" for v in variants if v.get("title")]
    if prices and min(prices) != max(prices):
        money = f"${min(prices):.2f}–${max(prices):.2f} USD"
    elif prices:
        money = f"${min(prices):.2f} USD"
    else:
        money = f"${rec.get('price_min', '0')} USD (listed minimum)"
    size = f"; {len(titles)} size(s): {', '.join(titles)}" if titles and len(titles) > 1 else ""
    return f"{money}{size}"


def determin(seed: str, n: int) -> float:
    """Deterministic float in [0, n) derived from a string seed."""
    h = hashlib.sha256(seed.encode()).digest()
    return int.from_bytes(h[:8], "big") / 2**64 * n


def build_rows(products):
    rows = []
    for rec in products:
        if rec.get("product_type") == "Non-Tea":
            continue  # teaware/gift items — not teas, never imported
        ptype = rec.get("product_type")
        tea_type, cat, color, (cx, cy) = TYPE_MAP.get(ptype, (None, None, None, (50.0, 50.0)))
        tags = rec.get("tags") or []
        if tea_type is None and ptype is None:
            for rx, tt in TAG_TYPE_OVERRIDES:
                if any(rx.search(t) for t in tags):
                    tea_type = tt
                    color = TAG_COLOR.get(tt)
                    cx, cy = CLUSTER_MEANS.get(tt, (cx, cy))
                    break
        avail = rec.get("available")
        avail_txt = ("in stock" if avail else ("sold out" if avail is False else "unknown"))
        scrape_date = (rec.get("scraped_at") or "")[:10]
        handle = rec["handle"]
        desc = (rec.get("description_text") or "").strip()
        prov = (f"[White2Tea shop listing: {price_summary(rec)}; {avail_txt} as of {scrape_date}; "
                f"https://white2tea.com/products/{handle}]")
        description = f"{desc} {prov}".strip()
        rows.append({
            "name": rec["name"].strip(),
            "slug": f"white2tea-{handle}",
            "description": description,
            "tea_type": tea_type, "category": cat, "color_hex": color,
            "source": SHOP["name"], "source_type": "shop", "is_public": True,
            "is_custom": False, "brewing_num_brews": 1,
            "flavor_x": round(cx + determin(handle + "x", 8) - 4, 1),
            "flavor_y": round(cy + determin(handle + "y", 8) - 4, 1),
        })
    # resolve flavor-coordinate collisions (min distance 1.5 against DB + batch)
    rows.sort(key=lambda r: r["slug"])
    taken = []  # filled by caller-provided callback below
    return rows


def dedupe_coords(cur, rows):
    """Nudge flavor coords until each row is >=1.5 from every existing tea and sibling."""
    cur.execute("SELECT flavor_x, flavor_y FROM teas WHERE flavor_x IS NOT NULL")
    taken = [(r[0], r[1]) for r in cur.fetchall()]
    for row in rows:
        x, y = row["flavor_x"], row["flavor_y"]
        k = 0
        while k < 400:
            hit = any(math.hypot(x - tx, y - ty) < 1.5 for tx, ty in taken)
            if not hit:
                break
            k += 1
            x = round((x + determin(row["slug"] + f"n{k}", 6) - 3 + 0.9 * k) % 100, 1)
            y = round((y + determin(row["slug"] + f"m{k}", 6) - 3) % 100, 1)
        row["flavor_x"], row["flavor_y"] = x, y
        taken.append((x, y))


UPSERT_SQL = """
INSERT INTO teas (name, slug, description, tea_type, category, color_hex, source,
                  source_type, shop_id, is_public, is_custom, brewing_num_brews,
                  flavor_x, flavor_y, owner_id, updated_at)
VALUES (%(name)s, %(slug)s, %(description)s, %(tea_type)s, %(category)s, %(color_hex)s,
        %(source)s, %(source_type)s, %(shop_id)s, %(is_public)s, %(is_custom)s,
        %(brewing_num_brews)s, %(flavor_x)s, %(flavor_y)s, NULL, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tea_type = EXCLUDED.tea_type,
  category = EXCLUDED.category,
  color_hex = EXCLUDED.color_hex,
  source = EXCLUDED.source,
  source_type = EXCLUDED.source_type,
  shop_id = EXCLUDED.shop_id,
  is_public = EXCLUDED.is_public,
  flavor_x = EXCLUDED.flavor_x,
  flavor_y = EXCLUDED.flavor_y,
  updated_at = now()
RETURNING (xmax = 0) AS inserted
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", default=str(REPO / "data" / "white2tea_teas.json"))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    catalog = json.loads(Path(args.catalog).read_text())
    products = catalog["products"]
    rows = build_rows(products)
    print(f"catalog: {len(products)} products -> {len(rows)} teas "
          f"({len(products) - len(rows)} Non-Tea skipped)")

    conn = connect()
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    defaults_before = count(cur, "SELECT count(*) FROM teas WHERE source_type='default' AND shop_id IS NULL")
    shop_teas_before = count(cur, "SELECT count(*) FROM teas WHERE shop_id IS NOT NULL")

    # 1. create-or-find the shop record
    cur.execute("""
        INSERT INTO tea_shops (name, slug, url, is_manual) VALUES (%s, %s, %s, true)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, url = EXCLUDED.url
        RETURNING id""", (SHOP["name"], SHOP["slug"], SHOP["url"]))
    shop_id = cur.fetchone()[0]
    print(f"shop: {SHOP['slug']} id={shop_id}")

    if args.dry_run:
        cur.execute("SELECT slug FROM teas WHERE shop_id = %s", (shop_id,))
        existing = {r[0] for r in cur.fetchall()}
        new = [r for r in rows if r["slug"] not in existing]
        print(f"dry-run: {len(new)} would be inserted, {len(rows) - len(new)} updated")
        conn.rollback()
        return

    # 2-3. upsert teas (dedupe on shop+slug; description carries prices/availability/source URL)
    # remove shop teas that fell out of the catalog (e.g. after a --refresh re-scrape)
    cur.execute("SELECT slug FROM teas WHERE shop_id = %s", (shop_id,))
    db_shop_slugs = {r[0] for r in cur.fetchall()}
    wanted = {r["slug"] for r in rows}
    stale = db_shop_slugs - wanted  # shop teas no longer in the catalog (e.g. after --refresh)
    for s in stale:
        cur.execute("DELETE FROM teas WHERE shop_id = %s AND slug = %s", (shop_id, s))

    dedupe_coords(cur, rows)
    ins = upd = 0
    for row in rows:
        row["shop_id"] = shop_id
        cur.execute(UPSERT_SQL, row)
        if cur.fetchone()[0]:
            ins += 1
        else:
            upd += 1

    # 4. guard: no shop tea may be a default tea; default set untouched
    bad = count(cur, "SELECT count(*) FROM teas WHERE shop_id IS NOT NULL AND source_type <> 'shop'")
    defaults_after = count(cur, "SELECT count(*) FROM teas WHERE source_type='default' AND shop_id IS NULL")
    attached = count(cur, "SELECT count(*) FROM teas WHERE shop_id = %s", (shop_id,))
    dupes = count(cur, "SELECT count(*) - count(DISTINCT slug) FROM teas WHERE shop_id = %s", (shop_id,))
    assert bad == 0, f"CHECK guard tripped: {bad} shop teas with non-shop source_type"
    assert defaults_before == defaults_after, (
        f"default tea count changed {defaults_before} -> {defaults_after}")
    assert dupes == 0, f"duplicate slugs inside shop catalog: {dupes}"
    print(f"teas: inserted={ins} updated={upd} removed_stale={len(stale)} "
          f"total_shop={attached} defaults={defaults_after} (unchanged)")

    conn.commit()
    cur.execute("SELECT count(*), count(DISTINCT description) FROM teas WHERE shop_id = %s", (shop_id,))
    total, uniq = cur.fetchone()
    print(f"verify: shop_teas={total} unique_descriptions={uniq} "
          f"shop_teas_before_run={shop_teas_before}")
    conn.close()


def count(cur, sql, params=()):
    cur.execute(sql, params)
    return cur.fetchone()[0]


if __name__ == "__main__":
    main()