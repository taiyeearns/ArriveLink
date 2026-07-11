import { getBookingForPayment } from '../actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PayButton } from './pay-button';
import { CONVENIENCE_FEE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function PaymentPage({ params }: Props) {
  const { bookingId } = await params;
  const booking = await getBookingForPayment(bookingId);

  if (!booking) {
    return (
      <div className="space-y-4">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-foreground transition-colors font-body">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to bookings
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">Payment not available</h2>
            <p className="text-sm text-gray-500 font-body">
              This booking may not be confirmed yet, or the payment window has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const route = booking.route as any;
  const farePerSeat = Number(route.fare);
  const totalFare = farePerSeat * booking.seats_requested;
  const totalAmount = totalFare + CONVENIENCE_FEE;

  const gr = route.general_route;
  const originLabel = route.pickup_terminal
    ? `${gr.origin_city} (${route.pickup_terminal})`
    : gr.origin_city;
  const destLabel = route.dropoff_terminal
    ? `${gr.destination_city} (${route.dropoff_terminal})`
    : gr.destination_city;

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  // Payment deadline (15-minute reservation window)
  const deadline = booking.payment_expires_at ? new Date(booking.payment_expires_at) : null;
  const minutesLeft = deadline ? Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 60000)) : null;

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/history" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-foreground transition-colors font-body">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </Link>

      {/* Timer warning */}
      {minutesLeft !== null && minutesLeft <= 10 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald/10 border border-emerald/30 dark:border-gray-100/20">
          <svg className="w-4 h-4 text-emerald shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-forest dark:text-emerald font-body font-medium">
            {minutesLeft > 0 ? `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} left to pay` : 'Payment window expiring soon'}
          </p>
        </div>
      )}

      {/* Trip summary */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <Badge variant="verified" className="mb-3">{route.operator.business_name}</Badge>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <p className="font-display text-base font-bold text-foreground">{originLabel}</p>
              <p className="text-xs text-gray-400 font-body">{gr.origin_state}</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-[9px] text-gray-400 font-body">{formatTime(route.departure_time)}</span>
            </div>
            <div className="flex-1 text-right">
              <p className="font-display text-base font-bold text-foreground">{destLabel}</p>
              <p className="text-xs text-gray-400 font-body">{gr.destination_state}</p>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-body">
            {booking.seats_requested} seat{booking.seats_requested !== 1 ? 's' : ''} · Booking confirmed
          </div>
        </CardContent>
      </Card>

      {/* Payment breakdown */}
      <Card className="shadow-lg border-0">
        <CardContent className="pt-5 pb-5">
          <p className="font-label text-gray-400 mb-4">Payment Summary</p>

          <div className="space-y-2 text-sm font-body mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Fare (₦{farePerSeat.toLocaleString()} × {booking.seats_requested})</span>
              <span className="font-medium text-foreground">₦{totalFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Convenience fee</span>
              <span className="font-medium text-foreground">₦{CONVENIENCE_FEE.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-xl font-bold text-foreground">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Secure payment badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-mist dark:bg-dark-bg dark:border dark:border-white/5 mb-4">
            <svg className="w-4 h-4 text-pine dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-pine dark:text-gray-400 font-body">
              Secured by Paystack. Your card details are never stored.
            </p>
          </div>

          <PayButton bookingId={bookingId} amount={totalAmount} />
        </CardContent>
      </Card>
    </div>
  );
}
