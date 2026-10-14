'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function searchRoutes(generalRouteId: string) {
  if (!generalRouteId) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('routes')
    .select(`
      *,
      general_route:general_routes!routes_general_route_id_fkey(
        id, origin_city, origin_state, destination_city, destination_state
      ),
      operator:operators!routes_operator_id_fkey(id, business_name, status)
    `)
    .eq('general_route_id', generalRouteId)
    .eq('active', true)
    .gt('seats_available', 0)
    .order('fare', { ascending: true });

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

  // Attach avg_rating to each route
  return activeRoutes.map((r: any) => ({
    ...r,
    avg_rating: ratingsMap[r.operator?.id] || null,
  }));
}

export async function getSearchRoutes() {
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
