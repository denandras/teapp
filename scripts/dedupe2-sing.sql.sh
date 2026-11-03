#!/bin/bash
# Delete 4 Sing Tehus teas that duplicate earlier Wikidata-imported defaults
export PGPASSWORD=*** '^SB_TEAPP_DBPW=' ~/.hermes/secrets/supabase-tokens.env | cut -d= -f2-)"
psql "postgresql://postgres.ikitllhvepqkghrajoox@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 <<'EOF'
DELETE FROM teas WHERE slug IN (
  'organic-keemun',                 -- Keemun (祁門紅茶) exists since 2026-07-23
  'organic-korean-sejak',           -- Sejak (세작) exists since 2026-08-16
  'wakoucha-pine-needle-obubu-black-tea', -- Wakoucha (和紅茶) exists since 2026-07-23
  'organic-pan-yong-golden-monkey'  -- Golden Monkey tea (金猴茶) exists since 2026-07-23
);
EOF