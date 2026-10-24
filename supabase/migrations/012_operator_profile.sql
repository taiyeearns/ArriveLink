-- ============================================================================
-- 012_operator_profile.sql
-- ArriveLink – Operator Public Profile Fields
-- Adds tagline and bio to operators table for public profiles and partner carousel
-- ============================================================================

ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS bio     text;

COMMENT ON COLUMN public.operators.tagline IS
  'Short one-line description shown on the partner carousel hover card and profile header.';

COMMENT ON COLUMN public.operators.bio IS
  'Longer description of the transport company shown on their public profile page.';
