'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  RESERVATION_WINDOW_MINUTES,
  MAX_CANCELLATIONS,
  CANCELLATION_COOLDOWN_HOURS,
} from '@/lib/constants';

// --------------------------------------------------------------------------
// Route join fragment (used in all booking queries)
// --------------------------------------------------------------------------
const ROUTE_SELECT = `
  id, fare, departure_time, pickup_terminal, dropoff_terminal, bus_number,
  general_route:general_routes!routes_general_route_id_fkey(
    origin_city, origin_state, destination_city, destination_state
  ),
  operator:operators!routes_operator_id_fkey(business_name)
`;

// --------------------------------------------------------------------------
// Traveler actions
// --------------------------------------------------------------------------

export async function getRouteForBooking(routeId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('routes')
    .select(`
      *,
      general_route:general_routes!routes_general_route_id_fkey(
        id, origin_city, origin_state, destination_city, destination_state
      ),
      operator:operators!routes_operator_id_fkey(id, business_name)
    `)
    .eq('id', routeId)
    .eq('active', true)
    .single();

  if (error) return null;
  return data;
}

export async function createBooking(routeId: string, seatsRequested: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (seatsRequested < 1) return { error: 'Must request at least 1 seat' };

  const admin = createAdminClient();

  // Check cancellation lockout
  const { data: userData } = await admin
    .from('users')
    .select('cancel_count, cancel_lockout_until')
    .eq('id', user.id)
    .single();

  if (userData?.cancel_lockout_until) {
    const lockoutEnd = new Date(userData.cancel_lockout_until);
    if (lockoutEnd > new Date()) {
      const minutesLeft = Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000);
      return { error: `Booking locked for ${minutesLeft} more minute(s) due to recent cancellations. Please try again later.` };
    }
  }

  // Check route availability
  const { data: route } = await admin
    .from('routes')
    .select('id, seats_available, active')
    .eq('id', routeId)
    .single();

  if (!route) return { error: 'Route not found' };
  if (!route.active) return { error: 'This route is no longer active' };
  if (route.seats_available < seatsRequested) {
    return { error: `Only ${route.seats_available} seat(s) available` };
  }

  // Set 15-minute payment window
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + RESERVATION_WINDOW_MINUTES);

  // Create booking with RESERVED status (no operator approval needed)
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      route_id: routeId,
      traveler_id: user.id,
      seats_requested: seatsRequested,
      status: 'RESERVED',
      payment_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (bookingError) return { error: bookingError.message };

  // Hold the seats immediately
  await admin
    .from('routes')
    .update({ seats_available: route.seats_available - seatsRequested })
    .eq('id', routeId);

  return { data: booking };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = createAdminClient();

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, route_id, seats_requested, traveler_id, route:routes(seats_available)')
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (!booking) return { error: 'Booking not found' };
  if (booking.status !== 'RESERVED') return { error: 'Only reserved bookings can be cancelled' };

  // Cancel the booking
  await admin
    .from('bookings')
    .update({ status: 'CANCELLED_TIMEOUT' })
    .eq('id', bookingId);

  // Return seats
  const route = booking.route as any;
  await admin
    .from('routes')
    .update({ seats_available: route.seats_available + booking.seats_requested })
    .eq('id', booking.route_id);

  // Increment cancel count
  const { data: userData } = await admin
    .from('users')
    .select('cancel_count, cancel_lockout_until')
    .eq('id', user.id)
    .single();

  const newCount = (userData?.cancel_count || 0) + 1;

  if (newCount >= MAX_CANCELLATIONS) {
    // Lock out for cooldown period, reset counter
    const lockoutUntil = new Date();
    lockoutUntil.setHours(lockoutUntil.getHours() + CANCELLATION_COOLDOWN_HOURS);
    await admin
      .from('users')
      .update({ cancel_count: 0, cancel_lockout_until: lockoutUntil.toISOString() })
      .eq('id', user.id);
  } else {
    await admin
      .from('users')
      .update({ cancel_count: newCount })
      .eq('id', user.id);
  }

  return { success: true, cancelCount: newCount };
}

export async function expireReservation(bookingId: string) {
  const admin = createAdminClient();

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, route_id, seats_requested, payment_expires_at, route:routes(seats_available)')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.status !== 'RESERVED') return;

  const expiresAt = booking.payment_expires_at ? new Date(booking.payment_expires_at) : null;
  if (!expiresAt || expiresAt > new Date()) return; // Not expired yet

  // Expire the booking
  await admin
    .from('bookings')
    .update({ status: 'EXPIRED' })
    .eq('id', bookingId);

  // Return seats
  const route = booking.route as any;
  await admin
    .from('routes')
    .update({ seats_available: route.seats_available + booking.seats_requested })
    .eq('id', booking.route_id);
}

export async function getMyBookings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      route:routes(${ROUTE_SELECT})
    `)
    .eq('traveler_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];

  // Auto-expire any stale reservations
  for (const b of data || []) {
    if (b.status === 'RESERVED' && b.payment_expires_at) {
      if (new Date(b.payment_expires_at) <= new Date()) {
        await expireReservation(b.id);
        b.status = 'EXPIRED' as any;
      }
    }
  }

  return data;
}

export async function getBookingStatus(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      route:routes(${ROUTE_SELECT})
    `)
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (error) return null;

  // Auto-expire if stale
  if (data?.status === 'RESERVED' && data.payment_expires_at) {
    if (new Date(data.payment_expires_at) <= new Date()) {
      await expireReservation(data.id);
      data.status = 'EXPIRED' as any;
    }
  }

  return data;
}

// --------------------------------------------------------------------------
// Operator actions (read-only view, no accept/reject)
// --------------------------------------------------------------------------

async function getMyOperatorId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: rep } = await admin
    .from('operator_reps')
    .select('operator_id')
    .eq('user_id', user.id)
    .single();

  return rep?.operator_id ?? null;
}

export async function getOperatorBookings() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return [];

  const admin = createAdminClient();

  const { data: routes } = await admin
    .from('routes')
    .select('id')
    .eq('operator_id', operatorId);

  if (!routes || routes.length === 0) return [];

  const routeIds = routes.map((r) => r.id);

  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      traveler:users!bookings_traveler_id_fkey(name, email, phone),
      route:routes(
        id, fare, departure_time, seats_total, seats_available, pickup_terminal, dropoff_terminal, bus_number,
        general_route:general_routes!routes_general_route_id_fkey(
          origin_city, origin_state, destination_city, destination_state
        )
      )
    `)
    .in('route_id', routeIds)
    .order('created_at', { ascending: false });

  if (error) return [];

  // Auto-expire stale reservations
  for (const b of data || []) {
    if (b.status === 'RESERVED' && b.payment_expires_at) {
      if (new Date(b.payment_expires_at) <= new Date()) {
        await expireReservation(b.id);
        b.status = 'EXPIRED' as any;
      }
    }
  }

  return data;
}
