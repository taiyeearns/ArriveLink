'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelBooking } from '../booking/actions';
import { MAX_CANCELLATIONS } from '@/lib/constants';

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm('Cancel this reservation? Your held seats will be released.')) return;

    setLoading(true);
    const result = await cancelBooking(bookingId);
    setLoading(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    if (result.cancelCount && result.cancelCount >= MAX_CANCELLATIONS - 1) {
      alert(`Warning: You have ${result.cancelCount} cancellation(s). After ${MAX_CANCELLATIONS}, you'll be temporarily locked from booking.`);
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-3 py-2 text-xs font-body font-medium text-foreground bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-white/5 rounded-xl hover:bg-mist dark:hover:bg-pine/10 transition-colors cursor-pointer disabled:opacity-50"
    >
      {loading ? 'Cancelling...' : 'Cancel'}
    </button>
  );
}
