'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { submitBankAccount, getMyBankAccount } from './bank-actions';

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  pending_review: { label: 'Pending Review', variant: 'location' },
  approved: { label: 'Approved', variant: 'verified' },
  rejected: { label: 'Rejected', variant: 'muted' },
};

export function BankAccountSection() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getMyBankAccount().then((data) => {
      setAccount(data);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const checkbox = formData.get('is_business_account');
    if (!checkbox) {
      setError('You must confirm this is a business account');
      setSubmitting(false);
      return;
    }

    const result = await submitBankAccount(formData);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setAccount(result.data);
    setShowForm(false);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted-bg rounded-lg w-1/3" />
            <div className="h-8 bg-muted-bg rounded-lg w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (account && !showForm) {
    const status = STATUS_CONFIG[account.status] || STATUS_CONFIG.pending_review;

    return (
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-label text-foreground/40 mb-1">Settlement Account</p>
              <h3 className="font-display text-base font-bold text-foreground">Bank Account</h3>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-muted-bg dark:bg-white/5">
              <p className="text-[10px] text-foreground/40 font-label mb-1">Bank</p>
              <p className="text-sm font-medium text-foreground font-body">{account.bank_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted-bg dark:bg-white/5">
                <p className="text-[10px] text-foreground/40 font-label mb-1">Account Number</p>
                <p className="text-sm font-mono font-medium text-foreground">{account.account_number}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted-bg dark:bg-white/5">
                <p className="text-[10px] text-foreground/40 font-label mb-1">Account Name</p>
                <p className="text-sm font-medium text-foreground font-body">{account.account_name}</p>
              </div>
            </div>

            {account.status === 'rejected' && (
              <div className="p-3 rounded-xl bg-error-bg border border-error-border">
                <p className="text-xs text-error font-body">
                  Your bank account was rejected. Please contact support to update it.
                </p>
              </div>
            )}

            <p className="text-[10px] text-foreground/40 font-body">
              To change your bank account, please contact support with verification documents.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-foreground/40 mb-1">Settlement Account</p>
        <h3 className="font-display text-base font-bold text-foreground mb-1">
          Set Up Bank Account
        </h3>
        <p className="text-xs text-foreground/50 font-body mb-4">
          Add your business bank account to receive trip settlements. This can only be set once.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Bank Name" name="bank_name" placeholder="e.g. Access Bank" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Account Number" name="account_number" placeholder="e.g. 0123456789" maxLength={10} required />
            <Input label="Account Name" name="account_name" placeholder="e.g. Good Is Good Motors Ltd" required />
          </div>

          {/* Business account confirmation */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-mist dark:bg-white/5 cursor-pointer">
            <input
              type="checkbox"
              name="is_business_account"
              value="true"
              className="mt-0.5 w-4 h-4 rounded border-mist accent-forest"
            />
            <div>
              <p className="text-sm font-medium text-foreground font-body">
                This is a business account
              </p>
              <p className="text-[10px] text-foreground/40 font-body mt-0.5">
                I confirm this is a registered business account, not a personal account. This will be reviewed by ArriveLink before settlements are processed.
              </p>
            </div>
          </label>

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={submitting} size="sm">Submit for Review</Button>
            {account && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
