'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyBoarding } from './boarding-actions';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const router = useRouter();

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    const result = await verifyBoarding(bookingId, code);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (status === 'TICKET_ISSUED') {
    if (!showInput) {
      return (
        <div className="pt-2 border-t border-mist dark:border-white/5">
          <Button
            size="sm"
            onClick={() => setShowInput(true)}
            className="w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Verify Boarding
          </Button>
        </div>
      );
    }

    return (
      <div className="pt-3 border-t border-mist dark:border-white/5 space-y-2">
        <p className="text-xs text-foreground/50 font-body">Enter the passenger&apos;s 6-character boarding code:</p>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="e.g. aB3xZ9"
            maxLength={6}
            className="font-mono text-center tracking-widest text-lg"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleVerify}
            loading={loading}
            disabled={code.length !== 6}
          >
            Verify
          </Button>
        </div>
        {error && (
          <p className="text-xs text-error font-body">{error}</p>
        )}
        <button
          onClick={() => { setShowInput(false); setCode(''); setError(''); }}
          className="text-xs text-foreground/40 font-body hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === 'BOARDED') {
    return (
      <div className="pt-2 border-t border-mist dark:border-white/5">
        <p className="text-xs text-emerald font-body font-medium flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Passenger boarded - awaiting trip completion
        </p>
      </div>
    );
  }

  return null;
}

