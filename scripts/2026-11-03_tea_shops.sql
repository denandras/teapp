-- Tea shops: vendor records for manually added shop teas (White2Tea).
-- Purely additive: existing rows untouched, teas.shop_id starts NULL everywhere,
-- so default-tea behavior is unchanged when no shop is set.
BEGIN;

CREATE TABLE IF NOT EXISTS tea_shops (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  url         text,
  is_manual   boolean NOT NULL DEFAULT true,   -- true = added by a user/admin, not auto-scraped
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tea_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY tea_shops_select_all
  ON tea_shops FOR SELECT
  USING (true);

-- Link column on the unified teas table. NULL = no shop (all existing rows).
ALTER TABLE teas ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES tea_shops(id);

CREATE INDEX IF NOT EXISTS teas_shop_id_idx ON teas(shop_id);

-- A tea pointing at a shop must NOT be a plain default tea. This is the
-- exclusion mechanism: anything with a shop_id is dropped from the default set
-- (see docs/tea-shops.md) while shop_id IS NULL teas behave exactly as before.
ALTER TABLE teas ADD CONSTRAINT teas_shop_requires_shop_type
  CHECK (shop_id IS NULL OR source_type = 'shop');

COMMIT;

-- Seed the White2Tea vendor record only (no product data import here).
INSERT INTO tea_shops (name, slug, url, is_manual)
SELECT 'White2Tea', 'white2tea', 'https://white2tea.com', true
WHERE NOT EXISTS (SELECT 1 FROM tea_shops WHERE slug = 'white2tea');