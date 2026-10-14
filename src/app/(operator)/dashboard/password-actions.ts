'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkPasswordChanged(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true; // Not logged in, skip

  const admin = createAdminClient();
  const { data: rep } = await admin
    .from('operator_reps')
    .select('password_changed')
    .eq('user_id', user.id)
    .single();

  if (!rep) return true; // Not an operator rep
  return rep.password_changed === true;
}

export async function changeOperatorPassword(newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in' };

  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  // Update password in Supabase Auth
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (authError) return { error: authError.message };

  // Mark password as changed
  const admin = createAdminClient();
  await admin
    .from('operator_reps')
    .update({ password_changed: true })
    .eq('user_id', user.id);

  revalidatePath('/dashboard');
  return { success: true };
}
