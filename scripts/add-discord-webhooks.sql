-- Migration: Discord webhook notifications for teahouse enrollment + new user signup
-- Sends event-only messages (no user data) to the #automations Discord channel.
-- Requires: pg_net extension enabled in Supabase dashboard.

-- ============================================================
-- 1. Enable pg_net extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- 2. Store webhook URL in a secure function (not a table column)
--    so it's not accessible via RLS / client queries.
-- ============================================================
CREATE OR REPLACE FUNCTION teapp_discord_webhook_url()
RETURNS TEXT AS $$
BEGIN
  RETURN 'DISCORD_WEBHOOK_URL_PLACEHOLDER';  -- Set via Supabase SQL Editor, NOT committed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Notification function — posts JSON to Discord webhook
-- ============================================================
CREATE OR REPLACE FUNCTION teapp_notify_discord(message TEXT)
RETURNS VOID AS $$
DECLARE
  url TEXT;
BEGIN
  url := teapp_discord_webhook_url();
  PERFORM net.http_post(
    url,
    jsonb_build_object('content', message)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. Trigger: New user signup (auth.users INSERT)
--    Fires when anyone creates an account.
-- ============================================================
CREATE OR REPLACE FUNCTION teapp_on_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM teapp_notify_discord('🫖 **Teapp** — A new user has signed up.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS teapp_new_user_notify ON auth.users;
CREATE TRIGGER teapp_new_user_notify
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION teapp_on_new_user();

-- ============================================================
-- 5. Trigger: Teahouse enrollment for approval (profiles UPDATE)
--    Fires when a profile changes to teahouse + pending status.
--    Uses UPDATE trigger because handle_new_user already creates
--    a personal profile on signup — teahouse selection is an UPDATE.
-- ============================================================
CREATE OR REPLACE FUNCTION teapp_on_teahouse_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when transitioning TO teahouse + pending
  IF (NEW.profile_type = 'teahouse' AND NEW.enrollment_status = 'pending')
     AND (OLD.profile_type <> 'teahouse' OR OLD.enrollment_status <> 'pending') THEN
    PERFORM teapp_notify_discord('🏪 **Teapp** — A teahouse has submitted an enrollment for approval.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS teapp_teahouse_enroll_notify ON profiles;
CREATE TRIGGER teapp_teahouse_enroll_notify
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION teapp_on_teahouse_enrollment();

-- Also handle the INSERT case (if profile is created directly as teahouse+pending)
CREATE OR REPLACE FUNCTION teapp_on_teahouse_enrollment_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_type = 'teahouse' AND NEW.enrollment_status = 'pending' THEN
    PERFORM teapp_notify_discord('🏪 **Teapp** — A teahouse has submitted an enrollment for approval.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS teapp_teahouse_enroll_insert_notify ON profiles;
CREATE TRIGGER teapp_teahouse_enroll_insert_notify
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION teapp_on_teahouse_enrollment_insert();