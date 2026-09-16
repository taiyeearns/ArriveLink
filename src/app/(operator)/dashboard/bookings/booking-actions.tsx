'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { markBoarded, markCompleted } from './boarding-actions';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleBoard() {
    setLoading('board');
    const result = await markBoarded(bookingId);

    if (result.error) {
      alert(result.error);
      setLoading(null);
      return;
    }

    router.refresh();
  }

  async function handleComplete() {
    setLoading('complete');
    const result = await markCompleted(bookingId);

    if (result.error) {
      alert(result.error);
      setLoading(null);
      return;
    }

    router.refresh();
  }

  if (status === 'TICKET_ISSUED') {
    return (
      <div className="pt-2 border-t border-mist">
        <Button
          size="sm"
          onClick={handleBoard}
          loading={loading === 'board'}
          className="w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Confirm Boarding
        </Button>
      </div>
    );
  }

  if (status === 'BOARDED') {
    return (
      <div className="pt-2 border-t border-mist">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleComplete}
          loading={loading === 'complete'}
          className="w-full"
        >
          Mark Trip Completed
        </Button>
      </div>
    );
  }

  return null;
}
