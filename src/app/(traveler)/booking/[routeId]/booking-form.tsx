'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createBooking } from '../actions';
import { CONVENIENCE_FEE } from '@/lib/constants';

interface BookingFormProps {
  routeId: string;
  fare: number;
  seatsAvailable: number;
}

export function BookingForm({ routeId, fare, seatsAvailable }: BookingFormProps) {
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const totalFare = fare * seats;
  const totalAmount = totalFare + CONVENIENCE_FEE;

  async function handleBook() {
    setError('');
    setLoading(true);

    const result = await createBooking(routeId, seats);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Navigate to the payment page for this booking
    router.push(`/payment/${result.data.id}`);
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-gray-400 mb-4">Book your seats</p>

        {/* Seat selector */}
        <div className="flex items-center justify-between mb-4">
          <label className="font-body text-sm font-medium text-foreground">Number of seats</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeats(Math.max(1, seats - 1))}
              disabled={seats <= 1}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-bg dark:border dark:border-white/5 flex items-center justify-center text-foreground hover:bg-gray-200 dark:hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-display text-xl font-bold text-foreground w-8 text-center">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats(Math.min(seatsAvailable, seats + 1))}
              disabled={seats >= seatsAvailable}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-bg dark:border dark:border-white/5 flex items-center justify-center text-foreground hover:bg-gray-200 dark:hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="p-4 rounded-xl bg-mist dark:bg-dark-bg dark:border dark:border-white/5 mb-4">
          <div className="flex justify-between text-sm font-body mb-1">
            <span className="text-gray-500">₦{fare.toLocaleString()} × {seats} seat{seats !== 1 ? 's' : ''}</span>
            <span className="text-foreground">₦{totalFare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-body mb-2">
            <span className="text-gray-500">Convenience fee</span>
            <span className="text-foreground">₦{CONVENIENCE_FEE.toLocaleString()}</span>
          </div>
          <div className="border-t border-emerald/20 dark:border-white/5 pt-2 flex justify-between">
            <span className="font-body text-sm font-semibold text-foreground">Total</span>
            <span className="font-display text-lg font-bold text-foreground">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-mist dark:bg-emerald/10 border border-emerald/20 dark:border-emerald/20">
          <svg className="w-4 h-4 text-emerald mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-forest dark:text-emerald font-body">
            Your seats will be held for 15 minutes while you complete payment. If you don&apos;t pay in time, the reservation expires automatically.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
            <p className="text-sm text-red-600 font-body">{error}</p>
          </div>
        )}

        <Button
          onClick={handleBook}
          loading={loading}
          className="w-full"
          size="lg"
        >
          Reserve & Pay
        </Button>
      </CardContent>
    </Card>
  );
}
