-- ============================================================================
-- 004_seed_admin.sql
-- ArriveLink – Seed First Admin User
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create User"
-- 3. Enter the admin's email and a secure password
-- 4. The auth trigger (003) will auto-create a public.users row with role='traveler'
-- 5. Run THIS migration to promote that user to admin
--
-- Replace the email below with the actual admin email you used in step 3.
-- ============================================================================

UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@arrivelink.com';
