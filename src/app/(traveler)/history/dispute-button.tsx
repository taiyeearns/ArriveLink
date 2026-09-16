'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { raiseDispute } from './dispute-action';

interface DisputeButtonProps {
  bookingId: string;
}

export function DisputeButton({ bookingId }: DisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setError('');
    setLoading(true);

    const result = await raiseDispute(bookingId, reason);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  if (success) {
    return (
      <p className="text-xs text-emerald font-body font-medium">
        ✓ Dispute submitted
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-foreground/40 hover:text-foreground font-body transition-colors cursor-pointer"
      >
        Report Issue
      </button>
    );
  }

  return (
    <div className="space-y-2 mt-2 pt-2 border-t border-mist dark:border-white/5">
      <textarea
        placeholder="Describe the issue..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-mist dark:border-white/5 font-body text-xs text-foreground bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine transition-all duration-200 resize-none"
      />

      {error && <p className="text-xs text-foreground/50 font-body">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} loading={loading} disabled={!reason.trim()}>
          Submit
        </Button>
      </div>
    </div>
  );
}
