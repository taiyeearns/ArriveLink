'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { reviewBankAccount } from '../actions';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_business_account: boolean;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
}

export function BankAccountPanel({ account, operatorId }: { account: BankAccount; operatorId: string }) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);
  const [done, setDone] = useState(account.status !== 'pending_review');
  const [currentStatus, setCurrentStatus] = useState(account.status);
  const [error, setError] = useState('');

  async function handleDecision(decision: 'approved' | 'rejected') {
    setLoading(decision);
    setError('');
    const res = await reviewBankAccount(account.id, decision, operatorId);
    if (res && 'error' in res && res.error) {
      setError(res.error);
    } else {
      setCurrentStatus(decision);
      setDone(true);
    }
    setLoading(null);
  }

  const statusColors: Record<string, string> = {
    pending_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald/10 text-emerald',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <span className={['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-body', statusColors[currentStatus] || 'bg-mist text-foreground/50'].join(' ')}>
          {currentStatus.replace('_', ' ')}
        </span>
        <p className='text-xs text-foreground/40 font-body'>
          Submitted {new Date(account.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {[
          { label: 'Bank', value: account.bank_name },
          { label: 'Account Number', value: account.account_number },
          { label: 'Account Name', value: account.account_name },
        ].map(f => (
          <div key={f.label} className='p-3 rounded-xl bg-muted-bg border border-mist'>
            <p className='text-xs text-foreground/40 font-body mb-0.5'>{f.label}</p>
            <p className='text-sm font-semibold text-foreground font-body'>{f.value}</p>
          </div>
        ))}
      </div>

      <div className='flex items-center gap-2 text-xs text-foreground/40 font-body'>
        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
        </svg>
        {account.is_business_account ? 'Business account' : 'Personal account'}
      </div>

      {error && <p className='text-sm text-red-600 font-body'>{error}</p>}

      {!done && (
        <div className='flex gap-2 pt-1'>
          <Button size='sm' loading={loading === 'approved'} onClick={() => handleDecision('approved')}>
            Approve
          </Button>
          <Button size='sm' variant='secondary' className='border-red-300 text-red-600 hover:bg-red-50' loading={loading === 'rejected'} onClick={() => handleDecision('rejected')}>
            Reject
          </Button>
        </div>
      )}
      {done && account.reviewed_at && (
        <p className='text-xs text-foreground/40 font-body'>
          Reviewed on {new Date(account.reviewed_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}
