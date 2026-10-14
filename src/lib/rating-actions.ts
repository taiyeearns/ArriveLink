'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitRating(bookingId: string, stars: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in' };

  if (stars < 1 || stars > 5) return { error: 'Rating must be between 1 and 5' };

  const admin = createAdminClient();

  // Get booking details
  const { data: booking } = await admin
    .from('bookings')
    .select('id, traveler_id, route_id, status, route:routes(operator_id)')
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (!booking) return { error: 'Booking not found' };
  if (booking.status !== 'COMPLETED') return { error: 'Can only rate completed trips' };

  const route = booking.route as any;

  // Check if already rated
  const { data: existing } = await admin
    .from('ratings')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  if (existing) return { error: 'You already rated this trip' };

  const { error } = await admin
    .from('ratings')
    .insert({
      booking_id: bookingId,
      traveler_id: user.id,
      route_id: booking.route_id,
      operator_id: route.operator_id,
      stars,
    });

  if (error) return { error: error.message };

  revalidatePath('/history');
  return { success: true };
}

export async function getMyRating(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('ratings')
    .select('stars')
    .eq('booking_id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  return data?.stars || null;
}
