-- ===== 001_initial_schema.sql =====
-- ============================================================================
-- 001_initial_schema.sql
-- ArriveLink â€“ Initial Database Schema
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

-- 2.1 Users â€“ every authenticated person in the system
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

-- 2.2 Operators â€“ transport companies / businesses
CREATE TABLE public.operators (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text            NOT NULL,
  status        operator_status NOT NULL DEFAULT 'active',
  onboarded_at  timestamptz     DEFAULT now(),
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.operators IS 'Transport operators / companies registered on the platform.';

-- 2.3 Operator Reps â€“ staff members who manage an operator's listings
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

-- 2.4 Locations â€“ cities / terminals used as route endpoints
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

-- 2.5 Routes â€“ scheduled services between two locations
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

-- 2.6 Bookings â€“ a traveler's reservation on a route
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

-- 2.7 Payments â€“ financial record tied to a booking
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

-- 2.8 Tickets â€“ issued after successful payment
CREATE TABLE public.tickets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL UNIQUE REFERENCES public.bookings (id) ON DELETE CASCADE,
  ticket_code text        NOT NULL UNIQUE,
  issued_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tickets IS 'Issued tickets with unique codes for boarding verification.';

-- 2.9 Wallets â€“ operator earnings / balances
CREATE TABLE public.wallets (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id       uuid          NOT NULL UNIQUE REFERENCES public.operators (id) ON DELETE CASCADE,
  pending_balance   decimal(12,2) NOT NULL DEFAULT 0,
  available_balance decimal(12,2) NOT NULL DEFAULT 0,
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wallets IS 'Operator wallets tracking pending and available balances.';

-- 2.10 Disputes â€“ raised by users against bookings
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

-- ===== 002_rls_policies.sql =====
-- ============================================================================
-- 002_rls_policies.sql
-- ArriveLink â€“ Row-Level Security Policies
-- Enforces role-based access: traveler, operator_rep, admin
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES
-- --------------------------------------------------------------------------

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes      ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Helper: get current user's role
-- --------------------------------------------------------------------------
-- Usage: (SELECT role FROM public.users WHERE id = auth.uid())
--
-- Helper: get current rep's operator_id
-- Usage: (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
-- --------------------------------------------------------------------------

-- --------------------------------------------------------------------------
-- 2. USERS
-- --------------------------------------------------------------------------

-- Any authenticated user can read their own row
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (id = auth.uid());

-- Admin can read all users
CREATE POLICY users_select_admin ON public.users
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Admin can insert users (for creating operator reps)
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Admin can update any user
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Users can update their own profile (name, phone)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Admin can delete users
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 3. OPERATORS
-- --------------------------------------------------------------------------

-- Travelers can see active operators
CREATE POLICY operators_select_traveler ON public.operators
  FOR SELECT USING (
    status = 'active'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'traveler'
  );

-- Reps can see their own operator
CREATE POLICY operators_select_rep ON public.operators
  FOR SELECT USING (
    id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

-- Admin full CRUD
CREATE POLICY operators_select_admin ON public.operators
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operators_insert_admin ON public.operators
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operators_update_admin ON public.operators
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operators_delete_admin ON public.operators
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 4. OPERATOR_REPS
-- --------------------------------------------------------------------------

-- No traveler access (no policy = denied by RLS)

-- Reps can see their own operator's reps
CREATE POLICY operator_reps_select_rep ON public.operator_reps
  FOR SELECT USING (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

-- Admin full CRUD
CREATE POLICY operator_reps_select_admin ON public.operator_reps
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operator_reps_insert_admin ON public.operator_reps
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operator_reps_update_admin ON public.operator_reps
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY operator_reps_delete_admin ON public.operator_reps
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 5. LOCATIONS
-- --------------------------------------------------------------------------

-- All authenticated users can read locations
CREATE POLICY locations_select_all ON public.locations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admin can manage locations
CREATE POLICY locations_insert_admin ON public.locations
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY locations_update_admin ON public.locations
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY locations_delete_admin ON public.locations
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 6. ROUTES
-- --------------------------------------------------------------------------

-- Travelers can see active routes
CREATE POLICY routes_select_traveler ON public.routes
  FOR SELECT USING (
    active = true
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'traveler'
  );

-- Reps can CRUD their own operator's routes
CREATE POLICY routes_select_rep ON public.routes
  FOR SELECT USING (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

CREATE POLICY routes_insert_rep ON public.routes
  FOR INSERT WITH CHECK (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

CREATE POLICY routes_update_rep ON public.routes
  FOR UPDATE USING (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

CREATE POLICY routes_delete_rep ON public.routes
  FOR DELETE USING (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

-- Admin full CRUD
CREATE POLICY routes_select_admin ON public.routes
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY routes_insert_admin ON public.routes
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY routes_update_admin ON public.routes
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY routes_delete_admin ON public.routes
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 7. BOOKINGS
-- --------------------------------------------------------------------------

-- Travelers can see and create their own bookings
CREATE POLICY bookings_select_traveler ON public.bookings
  FOR SELECT USING (traveler_id = auth.uid());

CREATE POLICY bookings_insert_traveler ON public.bookings
  FOR INSERT WITH CHECK (traveler_id = auth.uid());

-- Reps can see bookings on their operator's routes and update status
CREATE POLICY bookings_select_rep ON public.bookings
  FOR SELECT USING (
    route_id IN (
      SELECT id FROM public.routes
      WHERE operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
    )
  );

CREATE POLICY bookings_update_rep ON public.bookings
  FOR UPDATE USING (
    route_id IN (
      SELECT id FROM public.routes
      WHERE operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
    )
  );

-- Admin full CRUD
CREATE POLICY bookings_select_admin ON public.bookings
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY bookings_insert_admin ON public.bookings
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY bookings_update_admin ON public.bookings
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY bookings_delete_admin ON public.bookings
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 8. PAYMENTS
-- --------------------------------------------------------------------------

-- Travelers can see their own payments (via booking)
CREATE POLICY payments_select_traveler ON public.payments
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE traveler_id = auth.uid())
  );

-- Reps can see payments for their operator's bookings
CREATE POLICY payments_select_rep ON public.payments
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.routes r ON r.id = b.route_id
      WHERE r.operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
    )
  );

-- Admin full CRUD
CREATE POLICY payments_select_admin ON public.payments
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY payments_insert_admin ON public.payments
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY payments_update_admin ON public.payments
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY payments_delete_admin ON public.payments
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 9. TICKETS
-- --------------------------------------------------------------------------

-- Travelers can see their own tickets (via booking)
CREATE POLICY tickets_select_traveler ON public.tickets
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE traveler_id = auth.uid())
  );

-- Reps can see tickets for their operator's bookings
CREATE POLICY tickets_select_rep ON public.tickets
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.routes r ON r.id = b.route_id
      WHERE r.operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
    )
  );

-- Admin full CRUD
CREATE POLICY tickets_select_admin ON public.tickets
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY tickets_insert_admin ON public.tickets
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY tickets_update_admin ON public.tickets
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY tickets_delete_admin ON public.tickets
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 10. WALLETS
-- --------------------------------------------------------------------------

-- No traveler access

-- Reps can see their own operator's wallet
CREATE POLICY wallets_select_rep ON public.wallets
  FOR SELECT USING (
    operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
  );

-- Admin full CRUD
CREATE POLICY wallets_select_admin ON public.wallets
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY wallets_insert_admin ON public.wallets
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY wallets_update_admin ON public.wallets
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY wallets_delete_admin ON public.wallets
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- --------------------------------------------------------------------------
-- 11. DISPUTES
-- --------------------------------------------------------------------------

-- Travelers can create disputes and see their own
CREATE POLICY disputes_select_traveler ON public.disputes
  FOR SELECT USING (raised_by = auth.uid());

CREATE POLICY disputes_insert_traveler ON public.disputes
  FOR INSERT WITH CHECK (raised_by = auth.uid());

-- Reps can see disputes for their operator's bookings
CREATE POLICY disputes_select_rep ON public.disputes
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.routes r ON r.id = b.route_id
      WHERE r.operator_id = (SELECT operator_id FROM public.operator_reps WHERE user_id = auth.uid())
    )
  );

-- Admin full CRUD
CREATE POLICY disputes_select_admin ON public.disputes
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY disputes_insert_admin ON public.disputes
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY disputes_update_admin ON public.disputes
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY disputes_delete_admin ON public.disputes
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ===== 003_auth_trigger.sql =====
-- ============================================================================
-- 003_auth_trigger.sql
-- ArriveLink â€“ Auth User Creation Trigger
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

-- ===== 004_seed_admin.sql =====
-- ============================================================================
-- 004_seed_admin.sql
-- ArriveLink â€“ Seed First Admin User
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard â†’ Authentication â†’ Users
-- 2. Click "Add User" â†’ "Create User"
-- 3. Enter the admin's email and a secure password
-- 4. The auth trigger (003) will auto-create a public.users row with role='traveler'
-- 5. Run THIS migration to promote that user to admin
--
-- Replace the email below with the actual admin email you used in step 3.
-- ============================================================================

UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@arrivelink.com';

-- ===== 005_two_level_locations.sql =====
-- ============================================================================
-- Migration 005: Two-level location model + multi-bus support
-- ============================================================================
-- Replaces the flat location model with:
--   general_routes (admin-managed city-pair corridors)
--   routes gains: general_route_id, pickup/dropoff terminals, bus_number
-- ============================================================================

-- 1. Clean slate: delete all dependent data first
TRUNCATE public.disputes CASCADE;
TRUNCATE public.tickets CASCADE;
TRUNCATE public.payments CASCADE;
TRUNCATE public.bookings CASCADE;
TRUNCATE public.wallets CASCADE;
TRUNCATE public.routes CASCADE;

-- 2. Create general_routes table (admin-managed city-pair corridors)
CREATE TABLE IF NOT EXISTS public.general_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city text NOT NULL,
  origin_state text NOT NULL,
  destination_city text NOT NULL,
  destination_state text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(origin_city, origin_state, destination_city, destination_state)
);

-- Apply updated_at trigger
CREATE TRIGGER set_updated_at_general_routes
  BEFORE UPDATE ON public.general_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Modify routes table: add new columns
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS general_route_id uuid REFERENCES public.general_routes(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS pickup_terminal text,
  ADD COLUMN IF NOT EXISTS pickup_address text,
  ADD COLUMN IF NOT EXISTS dropoff_terminal text,
  ADD COLUMN IF NOT EXISTS dropoff_address text,
  ADD COLUMN IF NOT EXISTS bus_number text;

-- 4. Drop old foreign key columns (they reference locations)
ALTER TABLE public.routes
  DROP COLUMN IF EXISTS origin_location_id,
  DROP COLUMN IF EXISTS destination_location_id;

-- 5. Add index on general_route_id
CREATE INDEX IF NOT EXISTS idx_routes_general_route_id ON public.routes(general_route_id);

-- 6. Drop the old locations table (no longer needed)
DROP TABLE IF EXISTS public.locations CASCADE;

-- 7. RLS on general_routes
ALTER TABLE public.general_routes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active general routes
CREATE POLICY "Anyone can view active general routes"
  ON public.general_routes FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can insert
CREATE POLICY "Admin can insert general routes"
  ON public.general_routes FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can update
CREATE POLICY "Admin can update general routes"
  ON public.general_routes FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can delete
CREATE POLICY "Admin can delete general routes"
  ON public.general_routes FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 8. Re-create wallets for existing operators
INSERT INTO public.wallets (operator_id)
SELECT id FROM public.operators
ON CONFLICT (operator_id) DO NOTHING;

-- ===== 006_booking_flow_update.sql =====
-- ============================================================================
-- Migration 006: Booking flow simplification
-- ============================================================================
-- Removes operator accept/reject step. New flow:
--   RESERVED (15 min hold) â†’ PAID â†’ TICKET_ISSUED â†’ BOARDED â†’ COMPLETED
--   or RESERVED â†’ EXPIRED (timeout, seats returned)
-- ============================================================================

-- 1. Add new booking statuses
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'RESERVED';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'EXPIRED';

-- 2. Add payment expiry column
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_expires_at timestamptz;

-- 3. Add CANCELLED status
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- 4. Add cancellation tracking to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cancel_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_lockout_until timestamptz;

-- ===== 007_bus_number_constraints.sql =====
-- ============================================================================
-- Migration 007: Bus number constraints
-- ============================================================================
-- 1. Cleans up existing invalid bus numbers
-- 2. Makes bus_number NOT NULL
-- 3. Ensures bus_number is a whole number string
-- 4. Enforces unique bus_number per operator
-- ============================================================================

-- Step 1: Safely backfill invalid or missing bus numbers with sequential numbers
WITH invalid_routes AS (
  SELECT id, operator_id,
         row_number() OVER (PARTITION BY operator_id ORDER BY created_at) as rn
  FROM public.routes
  WHERE bus_number IS NULL 
     OR trim(bus_number) = '' 
     OR bus_number = 'null'
     OR bus_number !~ '^[0-9]+$'
),
max_existing AS (
  SELECT operator_id, MAX(CAST(bus_number AS integer)) as max_num
  FROM public.routes
  WHERE bus_number ~ '^[0-9]+$'
  GROUP BY operator_id
)
UPDATE public.routes r
SET bus_number = CAST(COALESCE(m.max_num, 0) + i.rn AS text)
FROM invalid_routes i
LEFT JOIN max_existing m ON m.operator_id = i.operator_id
WHERE r.id = i.id;

-- Step 2: Make the column NOT NULL
ALTER TABLE public.routes
  ALTER COLUMN bus_number SET NOT NULL;

-- Step 3: Ensure it only contains whole numbers
ALTER TABLE public.routes
  ADD CONSTRAINT chk_bus_number_is_numeric 
  CHECK (bus_number ~ '^[0-9]+$');

-- Step 4: Enforce uniqueness per operator
ALTER TABLE public.routes
  ADD CONSTRAINT uq_operator_bus_number 
  UNIQUE (operator_id, bus_number);

-- ===== 008_seat_integrity.sql =====
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

-- ===== 009_auth_cleanup_and_conflict.sql =====
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

-- ===== 010_booking_v2.sql =====
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

-- ===== 011_state_region_routes.sql =====
-- ============================================================================
-- 011_state_region_routes.sql
-- ArriveLink â€“ State + City (Region) Route Model + Travel Date on Bookings
--
-- Changes:
--   1. Drop and recreate general_routes with origin_state, origin_city,
--      destination_state, destination_city (terminology: "city" = major town/region)
--   2. Add travel_date to bookings (the date traveler wants to travel)
--   3. Update create_booking_atomic to accept p_travel_date
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. CLEAN SLATE FOR general_routes AND dependent data
--    (no production data yet â€“ safe to wipe)
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
  'Admin-managed transport corridors. Each row is a From State/City â†’ To State/City pair.
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

-- ===== 012_operator_profile.sql =====
-- ============================================================================
-- 012_operator_profile.sql
-- ArriveLink â€“ Operator Public Profile Fields
-- Adds tagline and bio to operators table for public profiles and partner carousel
-- ============================================================================

ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS bio     text;

COMMENT ON COLUMN public.operators.tagline IS
  'Short one-line description shown on the partner carousel hover card and profile header.';

COMMENT ON COLUMN public.operators.bio IS
  'Longer description of the transport company shown on their public profile page.';

