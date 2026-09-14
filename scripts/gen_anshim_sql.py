#!/usr/bin/env python3
"""Generate SQL insert for AN SHIM TEA teas -> teapp.

Reads /tmp/anshim-classified.json, writes anshim-tea-import.sql
Conventions (project rules):
- name = romanized native name, original_name = native script
- strip years from names; merge collisions (done in classify step)
- source_type='default', source='Teapp' (Sing Tehus precedent: shop teas become default)
- colors from TEA_TYPE_COLORS
"""
import json, re, unicodedata, html as H

COLORS = {
    'green': '#7BA05B', 'white': '#C8C4B0', 'black': '#8B4513', 'oolong': '#D4852A',
    'sheng_puerh': '#DBBC70', 'shou_puerh': '#6B4226', 'dark': '#4A3225',
    'yellow': '#E6C84E', 'tisane': '#C0856A', 'blend': '#B07D56',
}


ALLCAPS_FIX = {
    'DEEP JUNGLE': 'Deep Jungle', 'BAN BE SNOW SHAN': 'Ban Be Snow Shan',
    'WHITE FOREST': 'White Forest', 'HOU\'S SECRET': "Hou's Secret",
    'MORNING GONGFU': 'Morning Gongfu', 'STUDENT BREAKFAST': 'Student Breakfast',
    'AFTERNOON GONGFU': 'Afternoon Gongfu', 'EVENING GONGFU': 'Evening Gongfu',
    'FAMILY TEA': 'Family Tea', 'GREEN GARDENIA': 'Green Gardenia',
    '2024 RED JASMINE': 'Red Jasmine', '2024 RED LOTUS': 'Red Lotus',
    'GREEN SNOW SHAN': 'Green Snow Shan', "HOU'S DREAM": "Hou's Dream",
    'GREEN JADE GABA': 'Green Jade GABA', 'RED JADE GABA': 'Red Jade GABA',
    'RED SNOW SHAN': 'Red Snow Shan', 'RED FOREST': 'Red Forest',
    'RED STAR': 'Red Star', 'WHITE SNOW SHAN': 'White Snow Shan',
    'WHITE CHAMPAGNE': 'White Champagne', 'GREEN FOREST': 'Green Forest',
    "2024 CHEN PI SHU CHA": 'Chen Pi Shu Cha',
    '2024 PRESIDENT TEA': 'President Tea',
    'SHAN CHA': 'Shan Cha',
}


ROMAN_FIX = {
    '"7566" (AN I)': 'An I "7566"', '"AN II"': 'An II', '"AN III"': 'An III',
    '"AN IV"': 'An IV', "AN'S SECRET": "An's Secret",
    "1990's Hong Kong Temple Zhuan Cha": "1990s Hong Kong Temple Zhuan Cha",
    "PU'RE LOVE 1.0": "Pu'er Love 1.0", "PU'RE LOVE 2.0": "Pu'er Love 2.0",
    'Laobanzhang Lao Shu Shu': 'Lao Ban Zhang Lao Shu Shu',
}


# Latin-only original_name fixes (native script where known; empty where truly none)
ORIG_FIX = {
    'Doke Wulong': 'डोके ऊलंग',          # Bihar estate — Devanagari
    'Silver Needle': '',                 # estate English name; no native
    'Silver Rings': '', 'White Champagne': '', 'Bvumbwe': '',
    'Erva-mate': 'Erva-mate',
    'Upper Fagu': '', 'Sourenee': '', 'Sourenee Muscatel': '', 'Latumoni': '',
    'Hand-rolled': '', 'Uva Blackwood': '', 'Dimbula OP': '',
    'Simpani': 'सिम्पानी', 'Thyolo': '', 'Purple Rain': '', 'Malawi Fermented': '',
    '8571': '8571', '7581': '7581', '7572': '7572',
}

d = json.load(open('/tmp/anshim-classified.json'))
rows = d['rows']

def clean_text(s):
    s = H.unescape(s or '')
    s = re.sub(r'&nbsp;?', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def strip_year(name):
    return re.sub(r'^(19|20)\d{2}\s+', '', name)

def mk_slug(name):
    s = unicodedata.normalize('NFKD', name.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def clean_name(name):
    """Strip marketing/years from name; fix known typos."""
    name = strip_year(name)
    name = name.replace('PU\'RE', "PU'ER").replace("PU'RE", "PU'ER")
    # exact-match polish before any casing
    name = ROMAN_FIX.get(name, name)
    # title-case ALL-CAPS marketing names (keep acronyms GABA)
    if name.isupper() or (name.count(' ') > 0 and all(w.isupper() or w in ('&','-') for w in name.split())):
        name = ALLCAPS_FIX.get(name, name.title().replace("'S", "'s").replace('Gaba', 'GABA'))
    # post-case fixes for AN series
    for k, v in {'"An I"': 'An I "7566"', '"An Ii"': 'An II', '"An Iii"': 'An III',
                 '"An Iv"': 'An IV', '7566 (An I)': 'An I "7566"',
                 "Pu''Er Love 1.0".replace("''", "'"): "Pu'er Love 1.0",
                 "Pu''Er Love 2.0".replace("''", "'"): "Pu'er Love 2.0"}.items():
        if name == k:
            name = v
    return name

def build_desc(r, cleanname):
    """Description: prefer source text; else build from card parts."""
    t = clean_text(r['text'])
    if t and len(t) > 30:
        return t
    parts = r['parts']
    sub = clean_text(parts[0]) if parts else ''
    origin = clean_text(parts[1]) if len(parts) > 1 else ''
    if sub and origin:
        if sub.lower().rstrip('.') == 'blend' or 'blend' in sub.lower():
            return f"{cleanname} — {sub}."
        # avoid 'from A from B': if sub already ends with a place, don't append origin
        o_low = origin.lower()
        o_first = origin.split(',')[0].strip().lower()
        if o_low in sub.lower() or o_first in sub.lower() or ' from ' in sub.lower():
            return f"{cleanname} — {sub}."
        return f"{cleanname} — {sub} from {origin}."
    if sub:
        return f"{cleanname} — {sub}."
    return f"{cleanname} from AN SHIM TEA selection."

def build_origin(r):
    parts = r['parts']
    if len(parts) >= 2:
        o = clean_text(parts[1])
        # origin line like 'Bắc Mê, Hà Giang, Vietnam' — take last segment as country
        segs = [x.strip() for x in o.split(',')]
        return o
    return ''

BREW = {
    'green': ('medium', 75, 2, 3),
    'white': ('medium', 85, 4, 4),
    'black': ('high', 95, 3, 3),
    'oolong': ('medium', 90, 2, 5),
    'sheng_puerh': ('medium', 95, 1, 8),
    'shou_puerh': ('high', 100, 1, 8),
    'dark': ('high', 100, 2, 6),
    'yellow': ('medium', 80, 2, 3),
    'tisane': ('none', 100, 5, 2),
    'blend': ('medium', 95, 3, 2),
}
INSTR = {
    'green': 'Use 3g per 150ml at 75–80°C. Steep 1–2 minutes; re-steep up to 3 times.',
    'white': 'Use 4g per 150ml at 85–90°C. Steep 3–4 minutes; re-steep 2–3 times.',
    'black': 'Use 3g per 150ml at 95°C. Steep 3 minutes; re-steep 1–2 times.',
    'oolong': 'Use 5g per 150ml at 90–95°C. Steep 1–2 minutes; re-steep 4–5 times.',
    'sheng_puerh': 'Use 5g per 150ml at 95–100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.',
    'shou_puerh': 'Use 5g per 150ml at 100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.',
    'dark': 'Use 5g per 150ml at 100°C. Rinse once; steep 1–2 minutes; re-steep several times.',
    'yellow': 'Use 3g per 150ml at 80°C. Steep 2 minutes; re-steep up to 3 times.',
    'tisane': 'Use 3g per 200ml at 100°C. Steep 5 minutes.',
    'blend': 'Use 3g per 200ml at 95°C. Steep 3 minutes.',
}

def sqlq(s):
    return "'" + (s or '').replace("'", "''") + "'"

existing_names = set()
for line in open('/tmp/teapp-names.tsv'):
    existing_names.add(line.split('|')[0].strip().lower())
existing_slugs = set()
for line in open('/tmp/teapp-names.tsv'):
    existing_slugs.add(line.split('|')[1].strip())

used_names = set()
used_slugs = set()
out = []
n_dupe_name = 0
for r in rows:
    name = clean_name(r['name'])
    # dedupe within batch (shouldn't happen after classify fixes, but guard)
    base = name
    i = 2
    while name.lower() in used_names or name.lower() in existing_names:
        name = f"{base} ({r['tea_type']})" if i == 2 else f"{base} ({i})"
        i += 1
        n_dupe_name += 1
        if i > 4:
            raise SystemExit(f"unresolvable name: {base}")
    used_names.add(name.lower())
    slug = mk_slug(name)
    bs = slug; i = 2
    while slug in used_slugs or slug in existing_slugs:
        slug = f"{bs}-{i}"; i += 1
    used_slugs.add(slug)

    ctype = r['tea_type']
    cat = r['category']
    caff, temp, tmin, nbrew = BREW[ctype]
    desc = build_desc(r, name)
    origin = build_origin(r)
    color = COLORS[ctype]
    orig = ORIG_FIX.get(r['original_name'], r['original_name'])

    vals = [
        sqlq(name), sqlq(slug), sqlq(''), sqlq(orig), sqlq(desc), sqlq(origin),
        sqlq(ctype), sqlq(cat), sqlq(caff), str(temp), str(tmin), str(nbrew),
        sqlq(INSTR[ctype]),
        "ARRAY[]::text[]", "ARRAY[]::text[]", sqlq(color),
        'NULL', 'NULL',  # oxidation, roast
        'NULL', 'NULL',  # flavor_x, flavor_y
        "'default'", "'Teapp'", 'NULL', 'TRUE',
    ]
    out.append(f"  ({', '.join(vals)})")

# header
hdr = """-- AN SHIM TEA catalog import (anshimtea.com) — Sep 2026
-- 223 teas. source_type='default', source='Teapp' (Sing Tehus precedent).
-- Skipped: 9 TAKE FIVE sample sets, 48 dupes of existing default teas, 2 internal year-collisions.
-- tea_type histogram: sheng_puerh 57, black 37, shou_puerh 30, oolong 28, green 24, white 16, blend 15, dark 10, yellow 4, tisane 2
INSERT INTO teas (name, slug, phonetic_name, original_name, description, origin, tea_type, category, caffeine_level, brewing_temp_c, brewing_time_min, brewing_num_brews, brewing_instructions, characteristics, health_benefits, color_hex, oxidation_level, roast_level, flavor_x, flavor_y, source_type, source, owner_id, is_public) VALUES
"""
sql = hdr + ',\n'.join(out) + '\nON CONFLICT (slug) DO NOTHING;\n'
open('anshim-tea-import.sql', 'w').write(sql)
print(f"wrote anshim-tea-import.sql rows={len(out)} name_dupe_fixes={n_dupe_name}")