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

export async function getMyBankAccount() {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('bank_accounts')
    .select('*')
    .eq('operator_id', operatorId)
    .single();

  return data;
}

export async function submitBankAccount(formData: FormData) {
  const operatorId = await getMyOperatorId();
  if (!operatorId) return { error: 'Not authorized' };

  const bankName = formData.get('bank_name') as string;
  const accountNumber = formData.get('account_number') as string;
  const accountName = formData.get('account_name') as string;
  const isBusinessAccount = formData.get('is_business_account') === 'true';

  if (!bankName?.trim()) return { error: 'Bank name is required' };
  if (!accountNumber?.trim()) return { error: 'Account number is required' };
  if (!accountName?.trim()) return { error: 'Account name is required' };
  if (!isBusinessAccount) return { error: 'You must confirm this is a business account' };

  const admin = createAdminClient();

  // Check if already exists
  const { data: existing } = await admin
    .from('bank_accounts')
    .select('id')
    .eq('operator_id', operatorId)
    .single();

  if (existing) return { error: 'Bank account already set. Contact support to change.' };

  const { data, error } = await admin
    .from('bank_accounts')
    .insert({
      operator_id: operatorId,
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
      is_business_account: isBusinessAccount,
      status: 'pending_review',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/wallet');
  return { data };
}
