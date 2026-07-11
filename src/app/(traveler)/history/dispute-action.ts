'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function raiseDispute(bookingId: string, reason: string) {
  if (!reason.trim()) return { error: 'Please describe the issue' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = createAdminClient();

  // Verify booking belongs to user
  const { data: booking } = await admin
    .from('bookings')
    .select('id, traveler_id')
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (!booking) return { error: 'Booking not found' };

  // Check for existing dispute
  const { data: existing } = await admin
    .from('disputes')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('raised_by', user.id)
    .single();

  if (existing) return { error: 'A dispute already exists for this booking' };

  const { error } = await admin
    .from('disputes')
    .insert({
      booking_id: bookingId,
      raised_by: user.id,
      reason,
    });

  if (error) return { error: error.message };

  revalidatePath('/history');
  revalidatePath('/admin/disputes');
  return { success: true };
}
