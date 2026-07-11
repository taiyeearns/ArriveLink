-- ============================================================================
-- 001_initial_schema.sql
-- ArriveLink – Initial Database Schema
-- Creates ENUM types, tables, indexes, and updated_at trigger
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('traveler', 'operator_rep', 'admin');

CREATE TYPE operator_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TYPE booking_status AS ENUM (
  'REQUESTED',
  'AWAITING_RESPONSE',
  'CONFIRMED',
  'AWAITING_PAYMENT',
  'PAID',
  'TICKET_ISSUED',
  'BOARDED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED_TIMEOUT'
);

CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- --------------------------------------------------------------------------
-- 2. TABLES
-- --------------------------------------------------------------------------

-- 2.1 Users – every authenticated person in the system
CREATE TABLE public.users (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  phone      text,
  email      text        UNIQUE NOT NULL,
  role       user_role   NOT NULL DEFAULT 'traveler',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'All authenticated users: travelers, operator reps, and admins.';

-- 2.2 Operators – transport companies / businesses
CREATE TABLE public.operators (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text            NOT NULL,
  status        operator_status NOT NULL DEFAULT 'active',
  onboarded_at  timestamptz     DEFAULT now(),
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.operators IS 'Transport operators / companies registered on the platform.';

-- 2.3 Operator Reps – staff members who manage an operator's listings
CREATE TABLE public.operator_reps (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid        NOT NULL REFERENCES public.operators (id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  phone       text,
  whatsapp    text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.operator_reps IS 'Representatives who act on behalf of an operator.';

-- 2.4 Locations – cities / terminals used as route endpoints
CREATE TABLE public.locations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  city          text        NOT NULL,
  state         text        NOT NULL,
  terminal_name text,
  address       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_location_city_state_terminal UNIQUE (city, state, terminal_name)
);

COMMENT ON TABLE public.locations IS 'Terminals / cities that serve as route origins and destinations.';

-- 2.5 Routes – scheduled services between two locations
CREATE TABLE public.routes (
  id                     uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id            uuid          NOT NULL REFERENCES public.operators (id) ON DELETE CASCADE,
  origin_location_id     uuid          NOT NULL REFERENCES public.locations (id) ON DELETE RESTRICT,
  destination_location_id uuid         NOT NULL REFERENCES public.locations (id) ON DELETE RESTRICT,
  fare                   decimal(10,2) NOT NULL CHECK (fare >= 0),
  departure_time         time          NOT NULL,
  seats_total            int           NOT NULL CHECK (seats_total > 0),
  seats_available        int           NOT NULL CHECK (seats_available >= 0),
  active                 boolean       NOT NULL DEFAULT true,
  created_at             timestamptz   NOT NULL DEFAULT now(),
  updated_at             timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT chk_seats_available_lte_total CHECK (seats_available <= seats_total)
);

COMMENT ON TABLE public.routes IS 'Scheduled routes offered by operators.';

-- 2.6 Bookings – a traveler's reservation on a route
CREATE TABLE public.bookings (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id          uuid           NOT NULL REFERENCES public.routes (id) ON DELETE RESTRICT,
  traveler_id       uuid           NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  seats_requested   int            NOT NULL CHECK (seats_requested > 0),
  status            booking_status NOT NULL DEFAULT 'REQUESTED',
  requested_at      timestamptz    DEFAULT now(),
  response_deadline timestamptz,
  payment_deadline  timestamptz,
  confirmed_at      timestamptz,
  paid_at           timestamptz,
  boarded_at        timestamptz,
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bookings IS 'Booking requests made by travelers on specific routes.';

-- 2.7 Payments – financial record tied to a booking
CREATE TABLE public.payments (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        uuid           NOT NULL UNIQUE REFERENCES public.bookings (id) ON DELETE CASCADE,
  fare_amount       decimal(10,2)  NOT NULL,
  convenience_fee   decimal(10,2)  NOT NULL DEFAULT 200.00,
  processing_fee    decimal(10,2)  NOT NULL DEFAULT 0,
  payment_method    text,
  paystack_reference text          UNIQUE,
  status            payment_status NOT NULL DEFAULT 'pending',
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Payment records linked to bookings (Paystack integration).';

-- 2.8 Tickets – issued after successful payment
CREATE TABLE public.tickets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL UNIQUE REFERENCES public.bookings (id) ON DELETE CASCADE,
  ticket_code text        NOT NULL UNIQUE,
  issued_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tickets IS 'Issued tickets with unique codes for boarding verification.';

-- 2.9 Wallets – operator earnings / balances
CREATE TABLE public.wallets (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id       uuid          NOT NULL UNIQUE REFERENCES public.operators (id) ON DELETE CASCADE,
  pending_balance   decimal(12,2) NOT NULL DEFAULT 0,
  available_balance decimal(12,2) NOT NULL DEFAULT 0,
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wallets IS 'Operator wallets tracking pending and available balances.';

-- 2.10 Disputes – raised by users against bookings
CREATE TABLE public.disputes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
  raised_by   uuid        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  reason      text        NOT NULL,
  resolution  text,
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.disputes IS 'Disputes raised by travelers or reps regarding bookings.';

-- --------------------------------------------------------------------------
-- 3. INDEXES
-- --------------------------------------------------------------------------

CREATE INDEX idx_bookings_traveler_id ON public.bookings (traveler_id);
CREATE INDEX idx_bookings_route_id    ON public.bookings (route_id);
CREATE INDEX idx_bookings_status      ON public.bookings (status);

CREATE INDEX idx_routes_operator_id            ON public.routes (operator_id);
CREATE INDEX idx_routes_origin_location_id     ON public.routes (origin_location_id);
CREATE INDEX idx_routes_destination_location_id ON public.routes (destination_location_id);

CREATE INDEX idx_operator_reps_operator_id ON public.operator_reps (operator_id);
CREATE INDEX idx_operator_reps_user_id     ON public.operator_reps (user_id);

CREATE INDEX idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX idx_disputes_booking_id ON public.disputes (booking_id);

-- --------------------------------------------------------------------------
-- 4. UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Automatically sets updated_at to now() on every UPDATE.';

-- Apply trigger to every table that carries an updated_at column
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_operators_updated_at
  BEFORE UPDATE ON public.operators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
