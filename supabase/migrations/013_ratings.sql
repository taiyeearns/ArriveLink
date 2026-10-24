-- ============================================================================
-- 013_ratings.sql
-- ArriveLink – Traveller Ratings for Operators
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ratings (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid        NOT NULL REFERENCES public.operators(id)  ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
  booking_id  uuid        REFERENCES public.bookings(id)             ON DELETE SET NULL,
  stars       integer     NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- One rating per traveler per operator
  UNIQUE (operator_id, user_id)
);

-- Index for fast lookups by operator (profile page query)
CREATE INDEX IF NOT EXISTS ratings_operator_id_idx ON public.ratings (operator_id);

-- RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings (public operator profiles)
CREATE POLICY "Ratings are publicly readable"
  ON public.ratings FOR SELECT
  USING (true);

-- Authenticated travelers can insert their own rating
CREATE POLICY "Travelers can rate operators"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Travelers can update their own rating (change their mind)
CREATE POLICY "Travelers can update own rating"
  ON public.ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.ratings IS
  'Traveller star ratings and optional comments for operator companies.';

COMMENT ON COLUMN public.ratings.stars IS
  'Integer 1–5. Used to compute the average rating shown on the operator public profile.';

COMMENT ON COLUMN public.ratings.booking_id IS
  'Optional link to the completed booking that triggered this review.';
