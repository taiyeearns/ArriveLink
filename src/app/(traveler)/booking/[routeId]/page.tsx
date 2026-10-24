import { getRouteForBooking } from '../actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookingForm } from './booking-form';
import { CONVENIENCE_FEE_RATE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ routeId: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { routeId } = await params;
  const { date: travelDate } = await searchParams;
  const route = await getRouteForBooking(routeId);

  if (!route) {
    return (
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors font-body">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">Route not found</h2>
            <p className="text-sm text-foreground/50 font-body">This route may no longer be available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors font-body">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Route details */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <Badge variant="verified" className="mb-3">{route.operator.business_name}</Badge>

          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1">
              <p className="font-display text-base font-bold text-foreground">{originLabel}</p>
              <p className="text-xs text-foreground/40 font-body">{gr.origin_state}</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-[9px] text-foreground/40 font-body">{formatTime(route.departure_time)}</span>
            </div>
            <div className="flex-1 text-right">
              <p className="font-display text-base font-bold text-foreground">{destLabel}</p>
              <p className="text-xs text-foreground/40 font-body">{gr.destination_state}</p>
            </div>
          </div>

          {/* Travel date banner */}
          {travelDate && (
            <div className="mt-3 flex items-center gap-2 text-xs font-body text-pine dark:text-emerald bg-mist dark:bg-emerald/10 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Travel date: <strong>{new Date(travelDate + 'T00:00:00').toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="font-label text-foreground/40 mb-3">Pricing</p>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-foreground/50">Fare per seat</span>
              <span className="font-medium text-foreground">₦{Number(route.fare).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Convenience fee</span>
              <span className="font-medium text-foreground">{(CONVENIENCE_FEE_RATE * 100).toFixed(0)}% of fare</span>
            </div>
            <div className="flex justify-between text-xs text-foreground/40">
              <span>Seats available</span>
              <span>{route.seats_available} of {route.seats_total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking form */}
      <BookingForm
        routeId={route.id}
        fare={Number(route.fare)}
        seatsAvailable={route.seats_available}
        travelDate={travelDate}
      />
    </div>
  );
}
