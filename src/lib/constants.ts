// ============================================================================
// ArriveLink - App Constants
// ============================================================================

// Payment
export const CONVENIENCE_FEE = 200; // ₦200 fixed

// Booking: 7-minute reservation window + 2-minute grace period
export const RESERVATION_WINDOW_MINUTES = 7;
export const GRACE_PERIOD_MINUTES = 2;

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

// Trip status enum - matches DB trip_status type
export const TRIP_STATUSES = ['scheduled', 'departed', 'completed'] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

// Bank account status - matches DB bank_account_status type
export const BANK_ACCOUNT_STATUSES = ['pending_review', 'approved', 'rejected'] as const;
export type BankAccountStatus = (typeof BANK_ACCOUNT_STATUSES)[number];

// Settlement status - matches DB settlement_status type
export const SETTLEMENT_STATUSES = ['pending', 'processing', 'sent', 'failed'] as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];

// Support ticket
export const TICKET_CATEGORIES = ['general', 'booking', 'payment', 'account'] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

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
