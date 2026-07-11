'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  const admin = createAdminClient();
  const { error } = await admin
    .from('users')
    .update({ name, phone })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}
