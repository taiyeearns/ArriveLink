'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/** Full profile for a single operator public page */
export async function getOperatorProfile(id: string) {
  const admin = createAdminClient();

  const { data: op, error } = await admin
    .from('operators')
    .select('id, business_name, tagline, bio, status, created_at')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !op) return null;

  // Fetch routes with corridor info
  const { data: routes } = await admin
    .from('routes')
    .select(`
      id, fare, departure_time, seats_available,
      pickup_terminal, dropoff_terminal,
      general_route:general_routes!routes_general_route_id_fkey(
        origin_city, origin_state, destination_city, destination_state
      )
    `)
    .eq('operator_id', id)
    .eq('active', true)
    .gt('seats_available', 0)
    .order('departure_time');

  // Fetch ratings
  const { data: ratings } = await admin
    .from('ratings')
    .select('stars, comment, created_at, user_id')
    .eq('operator_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    : null;

  return { ...op, routes: routes || [], ratings: ratings || [], avgRating };
}

/** All active operators for the partner carousel */
export async function getPartnerOperators() {
  const admin = createAdminClient();

  const { data } = await admin
    .from('operators')
    .select('id, business_name, tagline, status')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  return data || [];
}
