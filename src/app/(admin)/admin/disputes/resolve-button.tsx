'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { resolveDispute } from '../settlement/actions';

interface ResolveButtonProps {
  disputeId: string;
}

export function ResolveButton({ disputeId }: ResolveButtonProps) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleResolve() {
    setError('');
    setLoading(true);

    const result = await resolveDispute(disputeId, resolution);

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
      <Button size="sm" onClick={() => setOpen(true)} className="w-full">
        Resolve Dispute
      </Button>
    );
  }

  return (
    <div className="space-y-3 pt-2 border-t border-mist">
      <textarea
        placeholder="Describe the resolution..."
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-mist font-body text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine transition-all duration-200 resize-none"
      />

      {error && <p className="text-xs text-error font-body">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={handleResolve} loading={loading} disabled={!resolution.trim()} className="flex-1">
          Submit Resolution
        </Button>
      </div>
    </div>
  );
}
