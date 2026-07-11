// ============================================================================
// ArriveLink - TypeScript Types
// Matches database schema
// ============================================================================

import type { BookingStatus, OperatorStatus, PaymentStatus, UserRole } from '@/lib/constants';

// --------------------------------------------------------------------------
// Database entity types
// --------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  business_name: string;
  status: OperatorStatus;
  onboarded_at: string;
  created_at: string;
  updated_at: string;
}

export interface OperatorRep {
  id: string;
  operator_id: string;
  user_id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  created_at: string;
}

export interface GeneralRoute {
  id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  operator_id: string;
  general_route_id: string;
  pickup_terminal: string | null;
  pickup_address: string | null;
  dropoff_terminal: string | null;
  dropoff_address: string | null;
  bus_number: string | null;
  fare: number;
  departure_time: string;
  seats_total: number;
  seats_available: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  route_id: string;
  traveler_id: string;
  seats_requested: number;
  status: BookingStatus;
  requested_at: string;
  response_deadline: string | null;
  payment_deadline: string | null;
  payment_expires_at: string | null;
  confirmed_at: string | null;
  paid_at: string | null;
  boarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  fare_amount: number;
  convenience_fee: number;
  processing_fee: number;
  payment_method: string | null;
  paystack_reference: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  ticket_code: string;
  issued_at: string;
}

export interface Wallet {
  id: string;
  operator_id: string;
  pending_balance: number;
  available_balance: number;
  updated_at: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// --------------------------------------------------------------------------
// Joined / extended types (used by UI)
// --------------------------------------------------------------------------

export interface RouteWithDetails extends Route {
  general_route: GeneralRoute;
  operator: Operator;
}

export interface BookingWithDetails extends Booking {
  route: RouteWithDetails;
  payment: Payment | null;
  ticket: Ticket | null;
}
