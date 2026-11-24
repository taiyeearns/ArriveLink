'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function joinWaitlist(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim();
  const preferredRoute = (formData.get('preferred_route') as string)?.trim();
  const travelDate = formData.get('travel_date') as string;
  const notes = (formData.get('notes') as string)?.trim();

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  // Use admin client since the user may not be logged in
  const supabase = createAdminClient();

  // Check if already on waitlist by email
  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return { error: 'already_joined' };
  }

  const { error } = await supabase.from('waitlist').insert({
    name,
    email,
    phone: phone || null,
    preferred_route: preferredRoute || null,
    travel_date: travelDate || null,
    notes: notes || null,
  });

  if (error) {
    console.error('[waitlist] Insert error:', error);
    if (error.message?.includes('unique') || error.code === '23505') {
      return { error: 'already_joined' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }

  revalidatePath('/waitlist');
  return { success: true };
}
