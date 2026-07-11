import { getTicketForBooking } from '../actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TicketActions } from './ticket-actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { bookingId } = await params;
  const data = await getTicketForBooking(bookingId);

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-foreground transition-colors font-body">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">Ticket not found</h2>
            <p className="text-sm text-gray-500 font-body">This booking may not have a ticket yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { booking, ticket } = data;
  const route = booking.route as any;

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

  const isBoarded = booking.status === 'BOARDED' || booking.status === 'COMPLETED';

  return (
    <div className="space-y-5">
      <Link href="/history" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-foreground transition-colors font-body">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </Link>

      {/* Ticket card */}
      <div className="relative">
        <Card id="ticket-card" className="shadow-xl border-0 overflow-hidden bg-white dark:bg-dark-surface dark:text-white">
          {/* Top colored strip */}
          <div className="h-2 bg-gradient-to-r from-forest via-pine to-emerald" />

          <CardContent className="pt-6 pb-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-label text-gray-400 mb-1">E-Ticket</p>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {route.operator.business_name}
                </h1>
              </div>
              <Badge variant={isBoarded ? 'verified' : 'live'}>
                {isBoarded ? 'Boarded' : 'Valid'}
              </Badge>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-mist/50 dark:bg-dark-bg">
              <div className="flex-1">
                <p className="font-display text-base font-bold text-foreground">{originLabel}</p>
                <p className="text-xs text-gray-400 font-body">{gr.origin_state}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-[9px] text-gray-400 font-body">{formatTime(route.departure_time)}</span>
              </div>
              <div className="flex-1 text-right">
                <p className="font-display text-base font-bold text-foreground">{destLabel}</p>
                <p className="text-xs text-gray-400 font-body">{gr.destination_state}</p>
              </div>
            </div>

            {/* Dotted divider */}
            <div className="border-t-2 border-dashed border-gray-200 dark:border-white/5 my-5 -mx-6" />

            {/* Ticket code */}
            <div className="text-center mb-5">
              <p className="text-xs text-gray-400 font-body mb-2">Show this code to the driver</p>
              <div className="inline-block px-8 py-4 rounded-2xl bg-forest dark:bg-emerald text-white">
                <p className="font-mono text-2xl font-bold tracking-widest">
                  {ticket.ticket_code}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm font-body">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Seats</p>
                <p className="font-semibold text-foreground">{booking.seats_requested}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Fare Paid</p>
                <p className="font-semibold text-foreground">
                  ₦{(Number(route.fare) * booking.seats_requested).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Issued</p>
                <p className="font-semibold text-foreground text-xs">
                  {new Date(ticket.issued_at).toLocaleDateString('en-NG', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Booking ID</p>
                <p className="font-mono font-semibold text-foreground text-xs">
                  {booking.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Bus number if available */}
            {route.bus_number && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-sm font-body">
                <p className="text-xs text-gray-400 mb-1">Bus Number</p>
                <p className="font-mono font-semibold text-foreground">{route.bus_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <TicketActions ticketElementId="ticket-card" />
      </div>
    </div>
  );
}
