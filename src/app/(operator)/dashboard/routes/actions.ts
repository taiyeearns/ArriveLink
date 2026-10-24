'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function getMyRoutes() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('routes')
    .select(`
      *,
      general_route:general_routes!routes_general_route_id_fkey(
        id, origin_city, origin_state, destination_city, destination_state
      )
    `)
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getGeneralRoutesForSelect() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('general_routes')
    .select('id, origin_city, origin_state, destination_city, destination_state')
    .eq('active', true)
    .order('origin_state')
    .order('origin_city');

  if (error) throw new Error(error.message);
  return data;
}

/** Find existing or create a new general_route row for a given origin/destination pair. */
async function createOrFindGeneralRoute(
  originCity: string,
  originState: string,
  destinationCity: string,
  destinationState: string,
): Promise<string | null> {
  const admin = createAdminClient();

  // Try to find existing
  const { data: existing } = await admin
    .from('general_routes')
    .select('id')
    .eq('origin_city', originCity)
    .eq('origin_state', originState)
    .eq('destination_city', destinationCity)
    .eq('destination_state', destinationState)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new
  const { data: created, error } = await admin
    .from('general_routes')
    .insert({
      origin_city: originCity,
      origin_state: originState,
      destination_city: destinationCity,
      destination_state: destinationState,
      active: true,
    })
    .select('id')
    .single();

  if (error) return null;
  return created.id;
}

export async function createRoute(formData: FormData) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const originState       = formData.get('origin_state') as string;
  const originCity        = formData.get('origin_city') as string;
  const destinationState  = formData.get('destination_state') as string;
  const destinationCity   = formData.get('destination_city') as string;
  const pickupTerminal    = formData.get('pickup_terminal') as string;
  const pickupAddress     = formData.get('pickup_address') as string;
  const dropoffTerminal   = formData.get('dropoff_terminal') as string;
  const dropoffAddress    = formData.get('dropoff_address') as string;
  const busNumber         = formData.get('bus_number') as string;
  const fare              = parseFloat(formData.get('fare') as string);
  const departureTime     = formData.get('departure_time') as string;
  const seatsTotal        = parseInt(formData.get('seats_total') as string, 10);
  const durationHours     = parseInt(formData.get('duration_hours') as string || '1', 10);
  const durationMinutes   = parseInt(formData.get('duration_minutes') as string || '0', 10);
  const expectedDuration  = (isNaN(durationHours) ? 1 : durationHours) * 60 + (isNaN(durationMinutes) ? 0 : durationMinutes);

  if (!originState?.trim())       return { error: 'Select an origin state' };
  if (!originCity?.trim())        return { error: 'Select an origin region/city' };
  if (!destinationState?.trim())  return { error: 'Select a destination state' };
  if (!destinationCity?.trim())   return { error: 'Select a destination region/city' };
  if (originState === destinationState && originCity === destinationCity) {
    return { error: 'Origin and destination cannot be the same' };
  }
  if (!pickupTerminal?.trim()) return { error: 'Pickup terminal is required' };
  if (isNaN(fare) || fare < 0) return { error: 'Enter a valid fare amount' };
  if (!departureTime) return { error: 'Departure time is required' };
  if (isNaN(seatsTotal) || seatsTotal < 1) return { error: 'Enter a valid number of seats' };
  if (!busNumber?.trim() || !/^\d+$/.test(busNumber.trim())) return { error: 'Bus number is required and must be a whole number' };

  // Resolve or create the general_route
  const generalRouteId = await createOrFindGeneralRoute(
    originCity.trim(), originState.trim(),
    destinationCity.trim(), destinationState.trim(),
  );
  if (!generalRouteId) return { error: 'Failed to resolve route corridor. Please try again.' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('routes')
    .insert({
      operator_id: operatorId,
      general_route_id: generalRouteId,
      pickup_terminal: pickupTerminal.trim(),
      pickup_address: pickupAddress?.trim() || null,
      dropoff_terminal: dropoffTerminal?.trim() || null,
      dropoff_address: dropoffAddress?.trim() || null,
      bus_number: busNumber.trim(),
      fare,
      departure_time: departureTime,
      seats_total: seatsTotal,
      seats_available: seatsTotal,
      expected_duration_minutes: expectedDuration || 60,
      active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('uq_operator_bus_number')) {
      return { error: 'This bus number is already in use by another route.' };
    }
    return { error: error.message };
  }

  revalidatePath('/dashboard/routes');
  return { data };
}

export async function getNextAvailableBusNumber() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('routes')
    .select('bus_number')
    .eq('operator_id', operatorId);

  if (error || !data || data.length === 0) return '1';

  let max = 0;
  for (const r of data) {
    const num = parseInt(r.bus_number, 10);
    if (!isNaN(num) && num > max) max = num;
  }
  return (max + 1).toString();
}

export async function checkActiveBookings(routeId: string) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('route_id', routeId)
    .not('status', 'in', '("REJECTED","CANCELLED_TIMEOUT","CANCELLED","EXPIRED")');

  if (error) return false;
  return (count || 0) > 0;
}

export async function duplicateRoute(routeId: string, newDepartureTime: string, newBusNumber: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  if (!newBusNumber?.trim() || !/^\d+$/.test(newBusNumber.trim())) {
    return { error: 'Bus number is required and must be a whole number' };
  }

  const admin = createAdminClient();

  const { data: source } = await admin
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .eq('operator_id', operatorId)
    .single();

  if (!source) return { error: 'Route not found' };

  const { data, error } = await admin
    .from('routes')
    .insert({
      operator_id: operatorId,
      general_route_id: source.general_route_id,
      pickup_terminal: source.pickup_terminal,
      pickup_address: source.pickup_address,
      dropoff_terminal: source.dropoff_terminal,
      dropoff_address: source.dropoff_address,
      bus_number: newBusNumber.trim(),
      fare: source.fare,
      departure_time: newDepartureTime,
      seats_total: source.seats_total,
      seats_available: source.seats_total,
      active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('uq_operator_bus_number')) {
      return { error: 'This bus number is already in use by another route.' };
    }
    return { error: error.message };
  }

  revalidatePath('/dashboard/routes');
  return { data };
}

export async function updateRoute(routeId: string, formData: FormData) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: route } = await admin
    .from('routes')
    .select('operator_id, seats_available, seats_total')
    .eq('id', routeId)
    .single();

  if (!route || route.operator_id !== operatorId) return { error: 'Not authorized' };

  const updates: Record<string, unknown> = {};

  const fare = parseFloat(formData.get('fare') as string);
  const departureTime = formData.get('departure_time') as string;
  const seatsTotal = parseInt(formData.get('seats_total') as string, 10);
  const pickupTerminal = formData.get('pickup_terminal') as string;
  const dropoffTerminal = formData.get('dropoff_terminal') as string;
  const busNumber = formData.get('bus_number') as string;

  if (!isNaN(fare) && fare >= 0) updates.fare = fare;
  if (departureTime) updates.departure_time = departureTime;
  if (pickupTerminal?.trim()) updates.pickup_terminal = pickupTerminal.trim();
  if (dropoffTerminal?.trim()) updates.dropoff_terminal = dropoffTerminal.trim();
  if (busNumber !== undefined) {
    if (!busNumber?.trim() || !/^\d+$/.test(busNumber.trim())) {
      return { error: 'Bus number is required and must be a whole number' };
    }
    updates.bus_number = busNumber.trim();
  }

  if (!isNaN(seatsTotal) && seatsTotal > 0) {
    updates.seats_total = seatsTotal;
    const booked = route.seats_total - route.seats_available;
    updates.seats_available = Math.max(0, seatsTotal - booked);
  }

  if (Object.keys(updates).length === 0) return { error: 'No changes provided' };

  const hasActiveBookings = await checkActiveBookings(routeId);
  if (hasActiveBookings) {
    return { error: 'Route has active bookings. You can only deactivate it, not edit its details.' };
  }

  const { data, error } = await admin
    .from('routes')
    .update(updates)
    .eq('id', routeId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('uq_operator_bus_number')) {
      return { error: 'This bus number is already in use by another route.' };
    }
    return { error: error.message };
  }

  revalidatePath('/dashboard/routes');
  return { data };
}

export async function toggleRouteActive(routeId: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: route } = await admin
    .from('routes')
    .select('operator_id, active')
    .eq('id', routeId)
    .single();

  if (!route || route.operator_id !== operatorId) return { error: 'Not authorized' };

  const { error } = await admin
    .from('routes')
    .update({ active: !route.active })
    .eq('id', routeId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/routes');
  return { active: !route.active };
}
