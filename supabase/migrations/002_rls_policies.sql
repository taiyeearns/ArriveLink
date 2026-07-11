-- ============================================================================
-- 002_rls_policies.sql
-- ArriveLink – Row-Level Security Policies
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
