-- ============================================================================
-- 009_auth_cleanup_and_conflict.sql
-- ArriveLink - Auth User Creation and Deletion Sync
-- 1. Updates handle_new_user() to safely handle pre-existing or orphaned public.users rows
-- 2. Adds on_auth_user_deleted trigger to sync deletions from auth.users to public.users
-- ============================================================================

-- 1. Updated trigger function for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If an orphaned public.users record exists with the same email but different id and no bookings/reps,
  -- clean it up so the new auth user can be linked cleanly.
  DELETE FROM public.users
  WHERE email = NEW.email
    AND id != NEW.id
    AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE traveler_id = public.users.id)
    AND NOT EXISTS (SELECT 1 FROM public.operator_reps WHERE user_id = public.users.id);

  INSERT INTO public.users (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'traveler'
    )
  )
  ON CONFLICT (id) DO UPDATE
    SET name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.users.phone),
        email = EXCLUDED.email,
        updated_at = now();

  RETURN NEW;
END;
$$;

-- 2. Trigger function for user deletion (sync auth.users deletions to public.users)
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deleted_user();
