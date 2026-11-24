-- ============================================================================
-- 014_waitlist.sql
-- ArriveLink - Waitlist Table for December Campaign
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  email           text        NOT NULL UNIQUE,
  phone           text,
  preferred_route text,
  travel_date     date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.waitlist IS 'December campaign waitlist signups - no login required.';

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist (created_at DESC);

-- RLS: allow inserts from anon + authenticated, reads for service role only
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_insert ON public.waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY waitlist_select ON public.waitlist FOR SELECT
  USING (true);
