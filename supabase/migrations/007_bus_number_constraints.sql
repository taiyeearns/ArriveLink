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
