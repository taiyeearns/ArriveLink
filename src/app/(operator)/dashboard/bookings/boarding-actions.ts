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

export async function markBoarded(bookingId: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, route:routes(operator_id)')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Booking not found' };

  const route = booking.route as any;
  if (route.operator_id !== operatorId) return { error: 'Not authorized' };
  if (booking.status !== 'TICKET_ISSUED') return { error: 'Booking must have a ticket issued first' };

  const { error } = await admin
    .from('bookings')
    .update({
      status: 'BOARDED',
      boarded_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/bookings');
  revalidatePath('/history');
  return { success: true };
}

export async function markCompleted(bookingId: string) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const admin = createAdminClient();

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, route:routes(operator_id)')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Booking not found' };

  const route = booking.route as any;
  if (route.operator_id !== operatorId) return { error: 'Not authorized' };
  if (booking.status !== 'BOARDED') return { error: 'Traveler must be boarded first' };

  const { error } = await admin
    .from('bookings')
    .update({ status: 'COMPLETED' })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/bookings');
  revalidatePath('/history');
  return { success: true };
}
