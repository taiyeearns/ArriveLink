'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// --------------------------------------------------------------------------
// Operators
// --------------------------------------------------------------------------

export async function getOperators() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getOperator(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOperator(formData: FormData) {
  const businessName = formData.get('business_name') as string;

  if (!businessName?.trim()) {
    return { error: 'Business name is required' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('operators')
    .insert({ business_name: businessName.trim() })
    .select()
    .single();

  if (error) return { error: error.message };

  // Also create a wallet for this operator
  await supabase.from('wallets').insert({ operator_id: data.id });

  revalidatePath('/admin/operators');
  return { data };
}

export async function updateOperator(id: string, formData: FormData) {
  const businessName = formData.get('business_name') as string;
  const status = formData.get('status') as string;

  const updates: Record<string, string> = {};
  if (businessName?.trim()) updates.business_name = businessName.trim();
  if (status) updates.status = status;

  if (Object.keys(updates).length === 0) {
    return { error: 'No changes provided' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('operators')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/operators');
  revalidatePath(`/admin/operators/${id}`);
  return { data };
}

// --------------------------------------------------------------------------
// Operator Reps
// --------------------------------------------------------------------------

export async function getOperatorReps(operatorId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('operator_reps')
    .select(`
      *,
      user:users(id, name, email, role)
    `)
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createOperatorRep(operatorId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  if (!name?.trim()) return { error: 'Name is required' };
  if (!email?.trim()) return { error: 'Email is required' };
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters' };

  const supabase = createAdminClient();

  // 1. Create auth user with operator_rep role
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true, // Auto-confirm - admin is creating this user
    user_metadata: {
      name: name.trim(),
      phone: phone?.trim() || '',
      role: 'operator_rep',
    },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: 'Failed to create user' };

  // 2. Create operator_reps link
  const { error: repError } = await supabase
    .from('operator_reps')
    .insert({
      operator_id: operatorId,
      user_id: authData.user.id,
      email: email.trim(),
      phone: phone?.trim() || null,
    });

  if (repError) {
    // Rollback: delete the auth user if rep creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error: repError.message };
  }

  revalidatePath(`/admin/operators/${operatorId}`);
  return { data: authData.user };
}

export async function deleteOperatorRep(repId: string, userId: string, operatorId: string) {
  const supabase = createAdminClient();

  // Delete the rep record
  const { error: repError } = await supabase
    .from('operator_reps')
    .delete()
    .eq('id', repId);

  if (repError) return { error: repError.message };

  // Delete the auth user
  await supabase.auth.admin.deleteUser(userId);

  revalidatePath(`/admin/operators/${operatorId}`);
  return { success: true };
}
