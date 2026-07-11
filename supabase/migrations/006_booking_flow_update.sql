-- ============================================================================
-- Migration 006: Booking flow simplification
-- ============================================================================
-- Removes operator accept/reject step. New flow:
--   RESERVED (15 min hold) → PAID → TICKET_ISSUED → BOARDED → COMPLETED
--   or RESERVED → EXPIRED (timeout, seats returned)
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
