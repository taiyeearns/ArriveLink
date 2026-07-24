-- ============================================================================
-- Migration 008: Seat integrity (atomic holds + server-side timeout sweep)
-- ============================================================================
-- Closes two gaps between the blueprint's non-functional requirements and the
-- code as built:
--   1. Seat holds were a read-then-write with no lock, so two simultaneous
--      requests could both claim the last seat (oversell). This adds an atomic
--      hold that locks the route row.
--   2. Reservation timeouts only fired when a client happened to load a list
--      containing the booking, so an abandoned reservation held its seat
--      forever. This adds a sweep function that runs with zero clients
--      connected. It is invoked by an external scheduler (cron-job.org) hitting
--      /api/cron/expire-reservations, since pg_cron requires a paid Supabase
--      plan.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Atomic seat-hold function
-- --------------------------------------------------------------------------
-- Locks the route row, re-checks availability under the lock, decrements the
-- seat count, and inserts the RESERVED booking, all in one transaction. Two
-- concurrent calls against the last seat are serialized by the row lock, so at
-- most one can succeed.

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_route_id    uuid,
  p_traveler_id uuid,
  p_seats       int,
  p_expires_at  timestamptz
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

  -- Create the reservation.
  INSERT INTO public.bookings (route_id, traveler_id, seats_requested, status, payment_expires_at)
  VALUES (p_route_id, p_traveler_id, p_seats, 'RESERVED', p_expires_at)
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

COMMENT ON FUNCTION public.create_booking_atomic(uuid, uuid, int, timestamptz) IS
  'Atomically holds seats and creates a RESERVED booking under a route row lock, preventing oversell.';

-- --------------------------------------------------------------------------
-- 2. Timeout sweep function
-- --------------------------------------------------------------------------
-- Expires every RESERVED booking past its payment window and returns the held
-- seats to their routes. Runs entirely server-side; needs no client connected.

CREATE OR REPLACE FUNCTION public.expire_stale_reservations()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired int;
BEGIN
  WITH expired AS (
    UPDATE public.bookings
    SET status = 'EXPIRED'
    WHERE status = 'RESERVED'
      AND payment_expires_at IS NOT NULL
      AND payment_expires_at <= now()
    RETURNING route_id, seats_requested
  ),
  restored AS (
    SELECT route_id, sum(seats_requested) AS seats
    FROM expired
    GROUP BY route_id
  )
  UPDATE public.routes r
  SET seats_available = LEAST(r.seats_total, r.seats_available + x.seats)
  FROM restored x
  WHERE r.id = x.route_id;

  GET DIAGNOSTICS v_expired = ROW_COUNT;
  RETURN v_expired;
END;
$$;

COMMENT ON FUNCTION public.expire_stale_reservations() IS
  'Sweeps expired RESERVED bookings to EXPIRED and returns their seats. Invoked every minute by an external scheduler via /api/cron/expire-reservations.';
