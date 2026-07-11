'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// --------------------------------------------------------------------------
// Admin: Settlement
// --------------------------------------------------------------------------

export async function getOperatorsForSettlement() {
  const admin = createAdminClient();

  const { data: operators } = await admin
    .from('operators')
    .select('id, business_name, status')
    .eq('status', 'active')
    .order('business_name');

  if (!operators) return [];

  // Get wallet data for each operator
  const results = [];
  for (const op of operators) {
    const { data: wallet } = await admin
      .from('wallets')
      .select('pending_balance, available_balance')
      .eq('operator_id', op.id)
      .single();

    results.push({
      ...op,
      pending_balance: wallet ? Number(wallet.pending_balance) : 0,
      available_balance: wallet ? Number(wallet.available_balance) : 0,
    });
  }

  return results;
}

export async function settleOperator(operatorId: string, amount: number) {
  if (amount <= 0) return { error: 'Amount must be positive' };

  const admin = createAdminClient();

  const { data: wallet } = await admin
    .from('wallets')
    .select('pending_balance, available_balance')
    .eq('operator_id', operatorId)
    .single();

  if (!wallet) return { error: 'Operator wallet not found' };

  const pending = Number(wallet.pending_balance);
  if (amount > pending) return { error: `Only ₦${pending.toLocaleString()} available to settle` };

  const { error } = await admin
    .from('wallets')
    .update({
      pending_balance: pending - amount,
      available_balance: Number(wallet.available_balance) + amount,
    })
    .eq('operator_id', operatorId);

  if (error) return { error: error.message };

  revalidatePath('/admin/bookings');
  revalidatePath('/dashboard/wallet');
  return { success: true };
}

// --------------------------------------------------------------------------
// Admin: Bookings overview
// --------------------------------------------------------------------------

export async function getAdminBookings() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      traveler:users!bookings_traveler_id_fkey(name, email),
      route:routes(
        fare, departure_time,
        general_route:general_routes!routes_general_route_id_fkey(origin_city, origin_state, destination_city, destination_state),
        operator:operators!routes_operator_id_fkey(business_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return [];
  return data;
}

// --------------------------------------------------------------------------
// Disputes
// --------------------------------------------------------------------------

export async function getAdminDisputes() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('disputes')
    .select(`
      *,
      raised_by_user:users!disputes_raised_by_fkey(name, email),
      booking:bookings(
        id, status, seats_requested,
        route:routes(
          fare,
          general_route:general_routes!routes_general_route_id_fkey(origin_city, destination_city),
          operator:operators!routes_operator_id_fkey(business_name)
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function resolveDispute(disputeId: string, resolution: string) {
  if (!resolution.trim()) return { error: 'Resolution text is required' };

  const admin = createAdminClient();

  const { error } = await admin
    .from('disputes')
    .update({
      resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', disputeId);

  if (error) return { error: error.message };

  revalidatePath('/admin/disputes');
  return { success: true };
}
