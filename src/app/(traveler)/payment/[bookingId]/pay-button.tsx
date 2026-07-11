'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { initializePayment } from '../actions';

interface PayButtonProps {
  bookingId: string;
  amount: number;
}

export function PayButton({ bookingId, amount }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handlePay() {
    setError('');
    setLoading(true);

    const result = await initializePayment(bookingId);

    if ('error' in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if ('authorization_url' in result && result.authorization_url) {
      // Redirect to Paystack checkout page
      window.location.href = result.authorization_url;
    } else {
      setError('Unable to start payment. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
          <p className="text-sm text-red-600 font-body">{error}</p>
        </div>
      )}

      <Button
        onClick={handlePay}
        loading={loading}
        className="w-full"
        size="lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Pay ₦{amount.toLocaleString()}
      </Button>
    </div>
  );
}
