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

export async function getMyWallet() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('wallets')
    .select('*')
    .eq('operator_id', operatorId)
    .single();

  return data;
}

export async function getWalletTransactions() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return [];

  const admin = createAdminClient();

  // Get all routes for this operator
  const { data: routes } = await admin
    .from('routes')
    .select('id')
    .eq('operator_id', operatorId);

  if (!routes || routes.length === 0) return [];

  // Get paid bookings for these routes as "transactions"
  const { data: bookings } = await admin
    .from('bookings')
    .select(`
      id, seats_requested, paid_at, status,
      route:routes(fare, general_route:general_routes!routes_general_route_id_fkey(origin_city, destination_city)),
      traveler:users!bookings_traveler_id_fkey(name)
    `)
    .in('route_id', routes.map((r) => r.id))
    .in('status', ['PAID', 'TICKET_ISSUED', 'BOARDED', 'COMPLETED'])
    .order('paid_at', { ascending: false })
    .limit(50);

  return bookings || [];
}
