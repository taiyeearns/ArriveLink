// ============================================================================
// ArriveLink - App Constants
// ============================================================================

// Payment
export const CONVENIENCE_FEE = 200; // ₦200 fixed

// Booking: 15-minute reservation window
export const RESERVATION_WINDOW_MINUTES = 15;

// Cancellation limits
export const MAX_CANCELLATIONS = 3;
export const CANCELLATION_COOLDOWN_HOURS = 2;

// Booking status enum - matches DB booking_status type
export const BOOKING_STATUSES = [
  'RESERVED',
  'PAID',
  'TICKET_ISSUED',
  'BOARDED',
  'COMPLETED',
  'EXPIRED',
  'CANCELLED',
  // Legacy statuses (kept for old data compatibility)
  'REQUESTED',
  'AWAITING_RESPONSE',
  'CONFIRMED',
  'AWAITING_PAYMENT',
  'REJECTED',
  'CANCELLED_TIMEOUT',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// User roles - matches DB user_role type
export const USER_ROLES = ['traveler', 'operator_rep', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Operator status - matches DB operator_status type
export const OPERATOR_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type OperatorStatus = (typeof OPERATOR_STATUSES)[number];

// Payment status - matches DB payment_status type
export const PAYMENT_STATUSES = ['pending', 'success', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Role-based route prefixes
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  traveler: '/',
  operator_rep: '/dashboard',
  admin: '/admin',
};
