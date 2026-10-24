-- ============================================================================
-- 011_state_region_routes.sql
-- ArriveLink – State + City (Region) Route Model + Travel Date on Bookings
--
-- Changes:
--   1. Drop and recreate general_routes with origin_state, origin_city,
--      destination_state, destination_city (terminology: "city" = major town/region)
--   2. Add travel_date to bookings (the date traveler wants to travel)
--   3. Update create_booking_atomic to accept p_travel_date
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. CLEAN SLATE FOR general_routes AND dependent data
--    (no production data yet – safe to wipe)
-- --------------------------------------------------------------------------

TRUNCATE public.settlements CASCADE;
TRUNCATE public.ratings CASCADE;
TRUNCATE public.tickets CASCADE;
TRUNCATE public.payments CASCADE;
TRUNCATE public.bookings CASCADE;
TRUNCATE public.routes CASCADE;
TRUNCATE public.general_routes CASCADE;

-- --------------------------------------------------------------------------
-- 2. DROP AND RECREATE general_routes WITH STATE+CITY MODEL
-- --------------------------------------------------------------------------

DROP TABLE IF EXISTS public.general_routes CASCADE;

CREATE TABLE public.general_routes (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_state         text        NOT NULL,
  origin_city          text        NOT NULL,   -- major city/town within origin state
  destination_state    text        NOT NULL,
  destination_city     text        NOT NULL,   -- major city/town within destination state
  active               boolean     NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_general_route_corridor
    UNIQUE (origin_state, origin_city, destination_state, destination_city)
);

COMMENT ON TABLE public.general_routes IS
  'Admin-managed transport corridors. Each row is a From State/City → To State/City pair.
   Operators list their specific bus routes under one of these corridors.';

COMMENT ON COLUMN public.general_routes.origin_city IS
  'The major city or town within the origin state (e.g. Ikeja for Lagos).';

COMMENT ON COLUMN public.general_routes.destination_city IS
  'The major city or town within the destination state (e.g. Benin City for Edo).';

-- Trigger
CREATE TRIGGER set_updated_at_general_routes
  BEFORE UPDATE ON public.general_routes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_general_routes_origin_state      ON public.general_routes (origin_state);
CREATE INDEX idx_general_routes_destination_state ON public.general_routes (destination_state);
CREATE INDEX idx_general_routes_origin_city       ON public.general_routes (origin_city);
CREATE INDEX idx_general_routes_active            ON public.general_routes (active);

-- --------------------------------------------------------------------------
-- 3. RE-ADD routes.general_route_id FOREIGN KEY
--    (was dropped with CASCADE when we dropped general_routes above)
-- --------------------------------------------------------------------------

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS general_route_id uuid REFERENCES public.general_routes(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_routes_general_route_id ON public.routes(general_route_id);

-- --------------------------------------------------------------------------
-- 4. ADD travel_date TO bookings
-- --------------------------------------------------------------------------

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS travel_date date;

COMMENT ON COLUMN public.bookings.travel_date IS
  'The calendar date the traveler intends to travel on this booking.';

-- Index for queries by date
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON public.bookings (travel_date);

-- --------------------------------------------------------------------------
-- 5. RLS POLICIES FOR general_routes
-- --------------------------------------------------------------------------

ALTER TABLE public.general_routes ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view active corridors
CREATE POLICY "general_routes_select_authenticated"
  ON public.general_routes FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can insert
CREATE POLICY "general_routes_insert_admin"
  ON public.general_routes FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can update
CREATE POLICY "general_routes_update_admin"
  ON public.general_routes FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can delete
CREATE POLICY "general_routes_delete_admin"
  ON public.general_routes FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 6. UPDATE create_booking_atomic TO ACCEPT travel_date
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_route_id    uuid,
  p_traveler_id uuid,
  p_seats       int,
  p_expires_at  timestamptz,
  p_travel_date date DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route   public.routes%ROWTYPE;
  v_booking public.bookings%ROWTYPE;
BEGIN
  IF p_seats < 1 THEN
    RAISE EXCEPTION 'Must request at least 1 seat' USING ERRCODE = 'check_violation';
  END IF;

  -- Lock the route row so concurrent bookings serialize here.
  SELECT * INTO v_route
  FROM public.routes
  WHERE id = p_route_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route not found' USING ERRCODE = 'no_data_found';
  END IF;

  IF NOT v_route.active THEN
    RAISE EXCEPTION 'This route is no longer active' USING ERRCODE = 'check_violation';
  END IF;

  IF v_route.seats_available < p_seats THEN
    RAISE EXCEPTION 'Only % seat(s) available', v_route.seats_available
      USING ERRCODE = 'check_violation';
  END IF;

  -- Hold the seats.
  UPDATE public.routes
  SET seats_available = seats_available - p_seats
  WHERE id = p_route_id;

  -- Create the reservation with grace period (2 min after payment deadline).
  INSERT INTO public.bookings (
    route_id, traveler_id, seats_requested, status,
    payment_expires_at, grace_expires_at, travel_date
  )
  VALUES (
    p_route_id, p_traveler_id, p_seats, 'RESERVED',
    p_expires_at, p_expires_at + interval '2 minutes',
    p_travel_date
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

COMMENT ON FUNCTION public.create_booking_atomic(uuid, uuid, int, timestamptz, date) IS
  'Atomically holds seats and creates a RESERVED booking with optional travel date.';
