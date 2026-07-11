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
  return (data || []).filter((r: any) => r.operator?.status === 'active');
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
