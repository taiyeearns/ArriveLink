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
