# Teapp → Public App — COMPLETED ✅

> **Status**: All items implemented, deployed, and live at teapp.denandras.cloud (Aug 2026)
> Archived for reference. See git history for implementation details.

# Original Plan (All Blockers Resolved)

## Decisions
- **B1**: Migrate all 123 static teas from `teas.ts` into Supabase `teas` table. Remove `teas.ts` entirely. No fallback.
- **B2**: Existing users auto-become `personal` profiles. New `profiles` table with trigger on auth signup.
- **B3**: Admin role = `is_admin` boolean on `profiles` table. Simplest, single source of truth.
- **B4**: Geo-IP via Cloudflare `CF-IPCountry` header. If not `HU`, block signup with message. T&C also states Hungary-only.
- **B5**: Legal docs auto-generated based on 2026 norms (GDPR + Hungarian e-commerce act).
- **New**: Replace 4-theme system with accent color picker — user picks one accent color from a palette. Base theme stays cozy-dark.

---

## Tea Source Model

| Kind | source_type | source field | visibility | who can add |
|------|-------------|--------------|------------|-------------|
| Default | `default` | `"Teapp"` | public | seeded (migration script) |
| User custom | `user` | custom text (free input) | **private** (owner only) | any personal user |
| Teahouse | `teahouse` | teahouse display_name (locked) | **public** | approved teahouse profiles only |

### Dedup logic
- Dedup key = `(name_lower + source_type + source)` — multiple Senchas from different sources are valid
- Slug: `slugify(name) + "-" + source_type + "-" + short_hash(owner_id or source)`
- Warning on add if name exists, but allows proceeding

### Status cycle
- New: `empty → tried → have → empty` (try first, then own)

---

## Accent Color System (replaces themes)

### Current state
- 4 themes: cozy-dark, cozy-light, warm, dark-green
- Each theme sets bg, card, border, text, muted, accent, accent-hover

### New system
- Single base theme (cozy-dark — warm dark browns)
- User picks accent color from a palette of 8-12 curated colors
- Accent color replaces `--accent` and `--accent-hover` CSS variables
- Stored in `user_preferences.accent_color` (hex string)
- Palette: Amber `#c4853f`, Green `#7BA05B`, Rose `#c44a5f`, Blue `#5b8ac4`, Purple `#9b6bc4`, Teal `#4ab8a0`, Gold `#c4a050`, Coral `#e8704a`, Lavender `#b8a0d4`, Sage `#8aab6b`, Ocean `#4a8ab8`, Ruby `#c44a6f`

---

## Database Schema

### New table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  profile_type TEXT NOT NULL DEFAULT 'personal' CHECK (profile_type IN ('personal', 'teahouse')),
  teahouse_name TEXT,
  teahouse_contact_email TEXT,
  teahouse_address TEXT,
  country TEXT DEFAULT 'HU',
  enrollment_status TEXT DEFAULT 'approved' CHECK (enrollment_status IN ('pending', 'approved', 'rejected')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, profile_type, enrollment_status)
  VALUES (NEW.id, NEW.email, 'personal', 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Modified table: `teas` (unified — replaces `teas` + `custom_teas`)
```sql
-- Add new columns to existing teas table
ALTER TABLE teas ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'default' CHECK (source_type IN ('default', 'user', 'teahouse'));
ALTER TABLE teas ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Teapp';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS phonetic_name TEXT DEFAULT '';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS original_name TEXT DEFAULT '';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS brewing_num_brews INT DEFAULT 1;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS brewing_instructions TEXT DEFAULT '';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS health_benefits TEXT[] DEFAULT '{}';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#999';
ALTER TABLE teas ADD COLUMN IF NOT EXISTS oxidation_level INT DEFAULT 50;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS roast_level INT DEFAULT 50;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS flavor_x INT DEFAULT 50;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS flavor_y INT DEFAULT 50;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS wikidata_qid TEXT;
ALTER TABLE teas ADD COLUMN IF NOT EXISTS caffeine_level TEXT DEFAULT 'medium';
```

### Modified table: `user_preferences`
```sql
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#c4853f';
-- Remove theme column or keep for backward compat (theme becomes irrelevant)
```

### RLS policies on `teas`
```sql
-- Default teas: everyone (including anon) can read
CREATE POLICY teas_default_public ON teas FOR SELECT USING (source_type = 'default');
-- Teahouse teas: public
CREATE POLICY teas_teahouse_public ON teas FOR SELECT USING (source_type = 'teahouse' AND is_public = TRUE);
-- User teas: owner only
CREATE POLICY teas_user_owner ON teas FOR SELECT USING (source_type = 'user' AND owner_id = auth.uid());
-- Insert user teas
CREATE POLICY teas_insert_user ON teas FOR INSERT WITH CHECK (source_type = 'user' AND owner_id = auth.uid());
-- Insert teahouse teas (only approved teahouses)
CREATE POLICY teas_insert_teahouse ON teas FOR INSERT
  WITH CHECK (source_type = 'teahouse' AND owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND profile_type = 'teahouse' AND enrollment_status = 'approved'));
-- Update/delete: owner only
CREATE POLICY teas_update_owner ON teas FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY teas_delete_owner ON teas FOR DELETE USING (owner_id = auth.uid());
```

### RLS on `profiles`
```sql
CREATE POLICY profiles_self_read ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_self_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_admin_read ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
);
CREATE POLICY profiles_admin_update ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
);
CREATE POLICY profiles_self_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());
```

### Migration: seed 123 teas from teas.ts
- Script reads `teas.ts` data, generates SQL INSERT statements
- All seeded teas get `source_type = 'default'`, `source = 'Teapp'`, `is_public = TRUE`, `owner_id = NULL`

---

## Implementation Order (child chunks)

### Chunk 1: SQL Migration Scripts
1. `scripts/migrate-teas-to-db.sql` — ALTER teas table + seed 123 teas
2. `scripts/add-profiles-table.sql` — profiles table + trigger + RLS
3. `scripts/update-rls.sql` — RLS policies on teas, profiles
4. `scripts/update-user-preferences.sql` — add accent_color column

### Chunk 2: Types & Store
5. Update `src/lib/types.ts` — add source_type, Profile type, ACCENT_COLORS
6. Update `src/lib/store.ts` — unified tea loading, status cycle swap, accent color, profile state
7. Create `src/lib/profiles.ts` — profile helpers

### Chunk 3: Theme → Accent Color
8. Update `src/app/globals.css` — remove theme classes, base theme only
9. Update `src/components/ThemeProvider.tsx` — apply accent color CSS var
10. Update `src/app/settings/page.tsx` — accent color picker replaces theme picker

### Chunk 4: Auth & Onboarding
11. Update `src/components/AuthProvider.tsx` — load profile, redirect to onboarding
12. Create `src/app/onboarding/page.tsx` — profile type selection
13. Update `src/components/LoginForm.tsx` — Cloudflare geo-IP check

### Chunk 5: Database Page (unified teas + source UI)
14. Update `src/app/database/page.tsx` — load all teas from DB, source badges, source filter
15. Create `src/components/SourceBadge.tsx`
16. Create `src/components/SourceFilter.tsx`

### Chunk 6: Dashboard Page
17. Update `src/app/page.tsx` — load teas from DB, source in tooltip

### Chunk 7: Add Tea Form (full fields)
18. Rewrite `src/app/add/page.tsx` — all Tea fields, teahouse gate, source field

### Chunk 8: Tea Detail Modal
19. Update `src/components/TeaDetailModal.tsx` — show source, edit all fields for owner

### Chunk 9: Admin Panel
20. Create `src/app/admin/page.tsx` — pending teahouse list, approve/reject
21. Update `src/components/NavBar.tsx` — conditional admin link, profile badge

### Chunk 10: Legal Pages
22. Create `src/app/terms/page.tsx` — T&C (2026 norms, HU e-commerce)
23. Create `src/app/privacy/page.tsx` — Privacy Policy (GDPR 2026)
24. Create `src/app/cookies/page.tsx` — Cookie Policy
25. Create `src/components/Footer.tsx` — legal links
26. Update `src/app/layout.tsx` — add Footer

### Chunk 11: Cleanup
27. Delete `src/data/teas.ts` — no longer needed
28. Delete `scripts/fk-payload.json`, `scripts/payload.json` — old migration artifacts
29. Final QA pass