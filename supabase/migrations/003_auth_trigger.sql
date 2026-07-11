-- ============================================================================
-- 003_auth_trigger.sql
-- ArriveLink – Auth User Creation Trigger
-- Auto-creates a public.users row when a new auth.users row is inserted
-- ============================================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Fires after a new auth user is created. Inserts a matching row into public.users with role from metadata (defaults to traveler).';

-- Attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
