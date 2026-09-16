'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { settleOperator } from './actions';

interface SettleButtonProps {
  operatorId: string;
  pendingBalance: number;
  operatorName: string;
}

export function SettleButton({ operatorId, pendingBalance, operatorName }: SettleButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(pendingBalance.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSettle() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setError('');
    setLoading(true);

    const result = await settleOperator(operatorId, num);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="w-full">
        Settle Funds
      </Button>
    );
  }

  return (
    <div className="space-y-3 pt-2 border-t border-mist">
      <p className="text-xs text-foreground/50 font-body">
        Settle funds for <strong>{operatorName}</strong>
      </p>
      <Input
        label="Amount (₦)"
        type="number"
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        min="0"
        max={pendingBalance}
        step="100"
      />

      {error && (
        <p className="text-xs text-error font-body">{error}</p>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={handleSettle} loading={loading} className="flex-1">
          Confirm Settlement
        </Button>
      </div>
    </div>
  );
}
