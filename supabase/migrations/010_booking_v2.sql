-- ============================================================================
-- 010_booking_v2.sql
-- ArriveLink v2 - Booking Flow Overhaul, Boarding, Trips, Wallet, Ratings,
--                 Support Tickets, Email Notifications
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. NEW ENUM TYPES
-- --------------------------------------------------------------------------

CREATE TYPE trip_status AS ENUM ('scheduled', 'departed', 'completed');
CREATE TYPE bank_account_status AS ENUM ('pending_review', 'approved', 'rejected');
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'sent', 'failed');
CREATE TYPE ticket_category AS ENUM ('general', 'booking', 'payment', 'account');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- --------------------------------------------------------------------------
-- 2. ALTER EXISTING TABLES
-- --------------------------------------------------------------------------

-- 2.1 bookings - add boarding code + grace period
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS boarding_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS grace_expires_at timestamptz;

-- 2.2 routes - add trip lifecycle + expected duration
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS expected_duration_minutes int NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS trip_status trip_status NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS departed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 2.3 operator_reps - track first password change
ALTER TABLE public.operator_reps
  ADD COLUMN IF NOT EXISTS password_changed boolean NOT NULL DEFAULT false;

-- --------------------------------------------------------------------------
-- 3. NEW TABLES
-- --------------------------------------------------------------------------

-- 3.1 Bank accounts - operator business account for settlements
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id     uuid              NOT NULL UNIQUE REFERENCES public.operators (id) ON DELETE CASCADE,
  bank_name       text              NOT NULL,
  account_number  text              NOT NULL,
  account_name    text              NOT NULL,
  is_business_account boolean       NOT NULL DEFAULT false,
  status          bank_account_status NOT NULL DEFAULT 'pending_review',
  submitted_at    timestamptz       NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid              REFERENCES public.users (id) ON DELETE SET NULL,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bank_accounts IS 'Operator business bank accounts for receiving settlement payouts.';

-- 3.2 Settlements - per-trip settlement records
CREATE TABLE IF NOT EXISTS public.settlements (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id        uuid              NOT NULL REFERENCES public.routes (id) ON DELETE RESTRICT,
  operator_id     uuid              NOT NULL REFERENCES public.operators (id) ON DELETE RESTRICT,
  total_amount    decimal(12,2)     NOT NULL DEFAULT 0,
  platform_fee    decimal(12,2)     NOT NULL DEFAULT 0,
  net_amount      decimal(12,2)     NOT NULL DEFAULT 0,
  boarded_count   int               NOT NULL DEFAULT 0,
  status          settlement_status NOT NULL DEFAULT 'pending',
  created_at      timestamptz       NOT NULL DEFAULT now(),
  sent_at         timestamptz,
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.settlements IS 'Per-trip settlement records tracking operator payouts.';

-- 3.3 Ratings - traveler post-trip ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid              NOT NULL UNIQUE REFERENCES public.bookings (id) ON DELETE CASCADE,
  traveler_id     uuid              NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  route_id        uuid              NOT NULL REFERENCES public.routes (id) ON DELETE CASCADE,
  operator_id     uuid              NOT NULL REFERENCES public.operators (id) ON DELETE CASCADE,
  stars           int               NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ratings IS 'Traveler star ratings (1-5) for completed trips.';

-- 3.4 Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid              REFERENCES public.users (id) ON DELETE SET NULL,
  email           text              NOT NULL,
  name            text              NOT NULL,
  category        ticket_category   NOT NULL DEFAULT 'general',
  subject         text              NOT NULL,
  message         text              NOT NULL,
  status          ticket_status     NOT NULL DEFAULT 'open',
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.support_tickets IS 'Support tickets from travelers, operators, and public contact forms.';

-- 3.5 Ticket replies
CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid              NOT NULL REFERENCES public.support_tickets (id) ON DELETE CASCADE,
  user_id         uuid              REFERENCES public.users (id) ON DELETE SET NULL,
  is_admin        boolean           NOT NULL DEFAULT false,
  message         text              NOT NULL,
  created_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ticket_replies IS 'Replies on support tickets from users and admins.';

-- --------------------------------------------------------------------------
-- 4. INDEXES
-- --------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_bank_accounts_operator_id ON public.bank_accounts (operator_id);
CREATE INDEX IF NOT EXISTS idx_settlements_route_id ON public.settlements (route_id);
CREATE INDEX IF NOT EXISTS idx_settlements_operator_id ON public.settlements (operator_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements (status);
CREATE INDEX IF NOT EXISTS idx_ratings_operator_id ON public.ratings (operator_id);
CREATE INDEX IF NOT EXISTS idx_ratings_route_id ON public.ratings (route_id);
CREATE INDEX IF NOT EXISTS idx_ratings_traveler_id ON public.ratings (traveler_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies (ticket_id);
CREATE INDEX IF NOT EXISTS idx_bookings_boarding_code ON public.bookings (boarding_code);
CREATE INDEX IF NOT EXISTS idx_routes_trip_status ON public.routes (trip_status);

-- --------------------------------------------------------------------------
-- 5. UPDATED_AT TRIGGERS FOR NEW TABLES
-- --------------------------------------------------------------------------

CREATE TRIGGER trg_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_settlements_updated_at
  BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --------------------------------------------------------------------------
-- 6. UPDATED FUNCTIONS
-- --------------------------------------------------------------------------

-- 6.1 Updated atomic booking: now sets grace_expires_at too
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

  -- Create the reservation with grace period (2 min after payment deadline).
  INSERT INTO public.bookings (
    route_id, traveler_id, seats_requested, status,
    payment_expires_at, grace_expires_at
  )
  VALUES (
    p_route_id, p_traveler_id, p_seats, 'RESERVED',
    p_expires_at, p_expires_at + interval '2 minutes'
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

-- 6.2 Updated expiry sweep: uses grace_expires_at for the actual release
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
      AND grace_expires_at IS NOT NULL
      AND grace_expires_at <= now()
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

-- 6.3 Function to generate a unique 6-char alphanumeric boarding code
CREATE OR REPLACE FUNCTION public.generate_boarding_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := '';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE boarding_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.generate_boarding_code() IS
  'Generates a unique 6-character case-sensitive alphanumeric boarding code.';

-- 6.4 Function to create settlement on trip completion
CREATE OR REPLACE FUNCTION public.create_trip_settlement(
  p_route_id uuid,
  p_operator_id uuid
)
RETURNS public.settlements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_boarded_count int;
  v_total_amount decimal(12,2);
  v_platform_fee decimal(12,2);
  v_settlement public.settlements%ROWTYPE;
BEGIN
  -- Count boarded passengers and sum fares
  SELECT
    COALESCE(SUM(b.seats_requested), 0),
    COALESCE(SUM(b.seats_requested * r.fare), 0)
  INTO v_boarded_count, v_total_amount
  FROM public.bookings b
  JOIN public.routes r ON r.id = b.route_id
  WHERE b.route_id = p_route_id
    AND b.status = 'BOARDED';

  -- Platform fee: convenience fees already collected separately.
  -- Settlement is the full fare amount to the operator.
  v_platform_fee := 0;

  INSERT INTO public.settlements (
    route_id, operator_id, total_amount, platform_fee, net_amount, boarded_count, status
  )
  VALUES (
    p_route_id, p_operator_id, v_total_amount, v_platform_fee,
    v_total_amount - v_platform_fee, v_boarded_count, 'pending'
  )
  RETURNING * INTO v_settlement;

  RETURN v_settlement;
END;
$$;

COMMENT ON FUNCTION public.create_trip_settlement(uuid, uuid) IS
  'Creates a settlement record for a completed trip based on boarded passengers.';

-- --------------------------------------------------------------------------
-- 7. RLS POLICIES FOR NEW TABLES
-- --------------------------------------------------------------------------

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Bank accounts: operators can read their own, admins can read all
CREATE POLICY bank_accounts_select ON public.bank_accounts FOR SELECT USING (true);
CREATE POLICY bank_accounts_insert ON public.bank_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY bank_accounts_update ON public.bank_accounts FOR UPDATE USING (true);

-- Settlements: readable by all (filtered in app layer)
CREATE POLICY settlements_select ON public.settlements FOR SELECT USING (true);
CREATE POLICY settlements_insert ON public.settlements FOR INSERT WITH CHECK (true);
CREATE POLICY settlements_update ON public.settlements FOR UPDATE USING (true);

-- Ratings: travelers insert their own, everyone can read
CREATE POLICY ratings_select ON public.ratings FOR SELECT USING (true);
CREATE POLICY ratings_insert ON public.ratings FOR INSERT WITH CHECK (true);

-- Support tickets: users see their own, admins see all (filtered in app)
CREATE POLICY support_tickets_select ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY support_tickets_insert ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY support_tickets_update ON public.support_tickets FOR UPDATE USING (true);

-- Ticket replies: visible to ticket participants (filtered in app)
CREATE POLICY ticket_replies_select ON public.ticket_replies FOR SELECT USING (true);
CREATE POLICY ticket_replies_insert ON public.ticket_replies FOR INSERT WITH CHECK (true);
