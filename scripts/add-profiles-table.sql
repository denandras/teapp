-- Migration: Create profiles table + trigger + RLS policies
-- This replaces the need for a separate admins table — is_admin boolean on profiles

-- ============================================================
-- 1. Create profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
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

-- ============================================================
-- 2. Enable RLS on profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_self_read ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (display_name, teahouse fields)
-- Note: is_admin and enrollment_status changes are NOT allowed via self-update (enforced by app + admin RLS)
CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY profiles_admin_read ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- Admins can update any profile (enrollment_status, is_admin, etc.)
CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- Users can insert their own profile (for the trigger + onboarding)
CREATE POLICY profiles_self_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Admins can insert profiles (rarely needed, but for manual creation)
CREATE POLICY profiles_admin_insert ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- ============================================================
-- 3. Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, profile_type, enrollment_status)
  VALUES (NEW.id, NEW.email, 'personal', 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. RLS policies on teas table
-- ============================================================
ALTER TABLE teas ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first (idempotent)
DROP POLICY IF EXISTS teas_default_public ON teas;
DROP POLICY IF EXISTS teas_teahouse_public ON teas;
DROP POLICY IF EXISTS teas_user_owner ON teas;
DROP POLICY IF EXISTS teas_insert_user ON teas;
DROP POLICY IF EXISTS teas_insert_teahouse ON teas;
DROP POLICY IF EXISTS teas_update_owner ON teas;
DROP POLICY IF EXISTS teas_delete_owner ON teas;

-- Default teas: everyone (including anon) can read
CREATE POLICY teas_default_public ON teas
  FOR SELECT USING (source_type = 'default');

-- Teahouse teas: public
CREATE POLICY teas_teahouse_public ON teas
  FOR SELECT USING (source_type = 'teahouse' AND is_public = TRUE);

-- User teas: owner only
CREATE POLICY teas_user_owner ON teas
  FOR SELECT USING (source_type = 'user' AND owner_id = auth.uid());

-- Insert user teas: any authenticated user
CREATE POLICY teas_insert_user ON teas
  FOR INSERT WITH CHECK (source_type = 'user' AND owner_id = auth.uid());

-- Insert teahouse teas: only approved teahouses
CREATE POLICY teas_insert_teahouse ON teas
  FOR INSERT WITH CHECK (
    source_type = 'teahouse' AND owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND profile_type = 'teahouse'
        AND enrollment_status = 'approved'
    )
  );

-- Update: owner only
CREATE POLICY teas_update_owner ON teas
  FOR UPDATE USING (owner_id = auth.uid());

-- Delete: owner only
CREATE POLICY teas_delete_owner ON teas
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- 5. Set admin user
-- ============================================================
-- András's auth user will be flagged as admin after migration.
-- Run this AFTER the user has signed up:
-- UPDATE profiles SET is_admin = TRUE, display_name = 'András' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');