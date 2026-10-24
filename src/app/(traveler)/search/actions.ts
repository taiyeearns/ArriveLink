'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// Time-of-day → departure time range mapping
const TIME_RANGES: Record<string, { start: string; end: string }> = {
  morning:   { start: '05:00', end: '11:59' },
  afternoon: { start: '12:00', end: '16:59' },
  evening:   { start: '17:00', end: '21:59' },
};

export interface SearchParams {
  fromState: string;
  fromCity: string;
  toState: string;
  toCity: string;
  date: string;
  timeOfDay: string;
}

/**
 * Searches for available buses based on state/city corridor, travel date, and time of day.
 * 1. Finds the general_route corridor matching from/to state+city
 * 2. Queries active routes on that corridor that depart in the requested time window
 */
export async function searchRoutes(params: SearchParams) {
  const { fromState, fromCity, toState, toCity, date, timeOfDay } = params;

  if (!fromState || !fromCity || !toState || !toCity) return [];

  const admin = createAdminClient();

  // Step 1: Find the corridor
  const { data: corridor, error: corridorError } = await admin
    .from('general_routes')
    .select('id')
    .eq('origin_state', fromState)
    .eq('origin_city', fromCity)
    .eq('destination_state', toState)
    .eq('destination_city', toCity)
    .eq('active', true)
    .maybeSingle();

  if (corridorError || !corridor) return [];

  // Step 2: Build the routes query
  let query = admin
    .from('routes')
    .select(`
      *,
      general_route:general_routes!routes_general_route_id_fkey(
        id, origin_city, origin_state, destination_city, destination_state
      ),
      operator:operators!routes_operator_id_fkey(id, business_name, status)
    `)
    .eq('general_route_id', corridor.id)
    .eq('active', true)
    .gt('seats_available', 0);

  // Apply time-of-day filter if a valid range is found
  const timeRange = timeOfDay ? TIME_RANGES[timeOfDay] : null;
  if (timeRange) {
    query = query
      .gte('departure_time', timeRange.start)
      .lte('departure_time', timeRange.end);
  }

  query = query.order('departure_time', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Filter out routes from inactive/suspended operators
  const activeRoutes = (data || []).filter((r: any) => r.operator?.status === 'active');

  // Fetch average ratings per operator
  const operatorIds = [...new Set(activeRoutes.map((r: any) => r.operator?.id).filter(Boolean))];
  let ratingsMap: Record<string, number> = {};

  if (operatorIds.length > 0) {
    const { data: ratings } = await admin
      .from('ratings')
      .select('operator_id, stars')
      .in('operator_id', operatorIds);

    if (ratings && ratings.length > 0) {
      const sums: Record<string, { total: number; count: number }> = {};
      for (const r of ratings) {
        if (!sums[r.operator_id]) sums[r.operator_id] = { total: 0, count: 0 };
        sums[r.operator_id].total += r.stars;
        sums[r.operator_id].count++;
      }
      for (const [opId, s] of Object.entries(sums)) {
        ratingsMap[opId] = s.total / s.count;
      }
    }
  }

  // Attach avg_rating and travel_date context to each route
  return activeRoutes.map((r: any) => ({
    ...r,
    avg_rating: ratingsMap[r.operator?.id] || null,
    _travel_date: date, // pass date through for booking flow
  }));
}
