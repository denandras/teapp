#!/bin/bash
# Remove 13 Sing Tehus teas that duplicate existing Teapp defaults (same tea, different name)
export PGPASSWORD="$(grep '^SB_TEAPP_DBPW=' ~/.hermes/secrets/supabase-tokens.env | cut -d= -f2-)"
psql "postgresql://postgres.ikitllhvepqkghrajoox@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 <<'EOF'
DELETE FROM teas WHERE slug IN (
  'assam-leaf-blend',               -- Assam
  'bai-hao-yin-zhen',               -- Silver Needle (Bai Hao Yin Zhen)
  'silver-needle-white-tea',        -- Silver Needle (Bai Hao Yin Zhen)
  'ceylon-highlands',               -- Ceylon
  'organic-english-breakfast-tea',  -- English Breakfast
  'organic-rooibos',                -- Rooibos
  'organic-lapsang-souchong',       -- Lapsang Souchong
  'organic-long-jing',              -- Dragonwell (Long Jing)
  'organic-pai-mu-tan',             -- White Peony (Bai Mu Dan)
  'organic-green-tea-with-jasmine', -- Jasmine Green Tea
  'jasmine-pearls',                 -- Jasmine Green Tea (pearl form)
  'hojicha-roasted-tea',            -- Hojicha
  'kukicha-twigs-and-leaves'        -- Kukicha
);
EOF