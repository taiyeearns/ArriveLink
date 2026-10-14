'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendBoardingConfirmedEmail, sendTripCompletedEmail } from '@/lib/email';

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

// --------------------------------------------------------------------------
// Boarding: driver enters the 6-char code from the passenger
// --------------------------------------------------------------------------
export async function verifyBoarding(bookingId: string, code: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  if (!code || code.length !== 6) return { error: 'Invalid boarding code' };

  const admin = createAdminClient();

  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, status, boarding_code,
      traveler:users!bookings_traveler_id_fkey(email, name),
      route:routes(
        operator_id,
        general_route:general_routes!routes_general_route_id_fkey(origin_city, destination_city)
      )
    `)
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Booking not found' };

  const route = booking.route as any;
  if (route.operator_id !== operatorId) return { error: 'Not authorized' };
  if (booking.status !== 'TICKET_ISSUED') return { error: 'Booking must have a ticket issued first' };

  // Verify the boarding code (case-sensitive)
  if (booking.boarding_code !== code) {
    return { error: 'Incorrect boarding code. Please check and try again.' };
  }

  const { error } = await admin
    .from('bookings')
    .update({
      status: 'BOARDED',
      boarded_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  // Send boarding confirmed email
  try {
    const traveler = booking.traveler as any;
    const routeLabel = `${route?.general_route?.origin_city} to ${route?.general_route?.destination_city}`;
    if (traveler?.email) {
      await sendBoardingConfirmedEmail(traveler.email, { route: routeLabel });
    }
  } catch {
    // Non-fatal
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/history');
  return { success: true };
}

// --------------------------------------------------------------------------
// Trip lifecycle: Mark Departed
// --------------------------------------------------------------------------
export async function markDeparted(routeId: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: route } = await admin
    .from('routes')
    .select('operator_id, trip_status')
    .eq('id', routeId)
    .single();

  if (!route || route.operator_id !== operatorId) return { error: 'Not authorized' };
  if (route.trip_status !== 'scheduled') return { error: 'Trip has already departed or completed' };

  const { error } = await admin
    .from('routes')
    .update({
      trip_status: 'departed',
      departed_at: new Date().toISOString(),
    })
    .eq('id', routeId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/routes');
  revalidatePath('/dashboard/bookings');
  return { success: true };
}

// --------------------------------------------------------------------------
// Trip lifecycle: Mark Trip Complete (per-route, all boarded passengers)
// --------------------------------------------------------------------------
export async function markTripComplete(routeId: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: route } = await admin
    .from('routes')
    .select('id, operator_id, trip_status, departed_at, expected_duration_minutes, fare, general_route:general_routes!routes_general_route_id_fkey(origin_city, destination_city)')
    .eq('id', routeId)
    .single();

  if (!route || route.operator_id !== operatorId) return { error: 'Not authorized' };
  if (route.trip_status === 'completed') return { error: 'Trip already completed' };
  if (route.trip_status !== 'departed') return { error: 'Trip must be departed first' };

  // Time-gate: check if enough time has elapsed since departure
  if (route.departed_at) {
    const departedAt = new Date(route.departed_at);
    const minDuration = route.expected_duration_minutes || 60;
    const earliestCompletion = new Date(departedAt.getTime() + minDuration * 60 * 1000);

    if (new Date() < earliestCompletion) {
      const minutesLeft = Math.ceil((earliestCompletion.getTime() - Date.now()) / 60000);
      return { error: `Cannot complete trip yet. Earliest completion in ${minutesLeft} minute(s) based on expected travel duration.` };
    }
  }

  // Mark route as completed
  await admin
    .from('routes')
    .update({
      trip_status: 'completed',
      completed_at: new Date().toISOString(),
      active: false,
    })
    .eq('id', routeId);

  // Bulk-update all BOARDED bookings on this route to COMPLETED
  const { data: boardedBookings } = await admin
    .from('bookings')
    .select('id, traveler:users!bookings_traveler_id_fkey(email)')
    .eq('route_id', routeId)
    .eq('status', 'BOARDED');

  if (boardedBookings && boardedBookings.length > 0) {
    await admin
      .from('bookings')
      .update({ status: 'COMPLETED' })
      .eq('route_id', routeId)
      .eq('status', 'BOARDED');
  }

  // Create settlement record
  const gr = route.general_route as any;
  try {
    await admin.rpc('create_trip_settlement', {
      p_route_id: routeId,
      p_operator_id: operatorId,
    });
  } catch (settlementErr) {
    console.error('[trip] Settlement creation failed:', settlementErr);
  }

  // Send trip completed emails to all boarded passengers
  const routeLabel = `${gr?.origin_city} to ${gr?.destination_city}`;
  try {
    for (const b of boardedBookings || []) {
      const traveler = b.traveler as any;
      if (traveler?.email) {
        await sendTripCompletedEmail(traveler.email, {
          route: routeLabel,
          bookingId: b.id,
        });
      }
    }
  } catch {
    // Non-fatal
  }

  revalidatePath('/dashboard/routes');
  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard/wallet');
  revalidatePath('/history');
  return { success: true, completedCount: boardedBookings?.length || 0 };
}

