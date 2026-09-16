import { getMyBookings } from '../booking/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CancelButton } from './cancel-button';
import { DisputeButton } from './dispute-button';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  RESERVED: { label: 'Reserved', variant: 'location' },
  PAID: { label: 'Paid', variant: 'live' },
  TICKET_ISSUED: { label: 'Ticket Issued', variant: 'live' },
  BOARDED: { label: 'Boarded', variant: 'verified' },
  COMPLETED: { label: 'Completed', variant: 'verified' },
  EXPIRED: { label: 'Expired', variant: 'muted' },
  CANCELLED: { label: 'Cancelled', variant: 'muted' },
  CANCELLED_TIMEOUT: { label: 'Cancelled', variant: 'muted' },
  // Legacy
  REQUESTED: { label: 'Pending', variant: 'location' },
  CONFIRMED: { label: 'Confirmed', variant: 'live' },
  REJECTED: { label: 'Rejected', variant: 'muted' },
};

export default async function HistoryPage() {
  const bookings = await getMyBookings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">My Bookings</h1>
        <p className="text-sm text-foreground/40 font-body mt-0.5">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-display text-base font-semibold text-foreground mb-1">No bookings yet</h2>
            <p className="text-sm text-foreground/50 font-body mb-4">
              Search for a route and book your first trip.
            </p>
            <Link href="/" className="text-sm text-emerald font-medium font-body hover:text-pine transition-colors">
              Find a bus →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => {
            const route = booking.route;
            const status = STATUS_CONFIG[booking.status] || { label: booking.status, variant: 'muted' as const };

            const gr = route?.general_route;
            const originLabel = route?.pickup_terminal
              ? `${gr?.origin_city} (${route.pickup_terminal})`
              : gr?.origin_city || 'Unknown';
            const destLabel = route?.dropoff_terminal
              ? `${gr?.destination_city} (${route.dropoff_terminal})`
              : gr?.destination_city || 'Unknown';

            const formatTime = (t: string) => {
              const [h, m] = t.split(':');
              const hour = parseInt(h);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 || 12;
              return `${displayHour}:${m} ${ampm}`;
            };

            const isReserved = booking.status === 'RESERVED';
            const expiresAt = booking.payment_expires_at ? new Date(booking.payment_expires_at) : null;
            const minutesLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000)) : null;

            return (
              <Card key={booking.id} className={`hover:shadow-md transition-shadow ${isReserved ? 'ring-2 ring-emerald/40 dark:ring-white/20' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="verified">{route?.operator?.business_name || 'Operator'}</Badge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Countdown for reserved */}
                  {isReserved && minutesLeft !== null && (
                    <div className="flex items-center gap-1.5 mb-2 p-2 rounded-lg bg-emerald/10 border border-emerald/30 dark:border-mist/20">
                      <svg className="w-3.5 h-3.5 text-emerald shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-forest dark:text-emerald font-body font-medium">
                        {minutesLeft > 0 ? `${minutesLeft} min left to pay` : 'Expiring soon'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground font-body truncate">{originLabel}</span>
                    <svg className="w-4 h-4 text-foreground/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span className="text-sm font-medium text-foreground font-body truncate">{destLabel}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-foreground/40 font-body mb-3">
                    <span>{route?.departure_time ? formatTime(route.departure_time) : ''}</span>
                    <span>·</span>
                    <span>{booking.seats_requested} seat{booking.seats_requested !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>₦{(Number(route?.fare || 0) * booking.seats_requested).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-foreground/40 font-body">
                      {new Date(booking.created_at).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Pay button for reserved bookings */}
                      {isReserved && minutesLeft !== null && minutesLeft > 0 && (
                        <Link href={`/payment/${booking.id}`}>
                          <button className="px-4 py-2 bg-forest text-white rounded-xl font-body text-xs font-medium hover:bg-pine transition-colors cursor-pointer">
                            Pay Now →
                          </button>
                        </Link>
                      )}

                      {/* Cancel button for reserved bookings */}
                      {isReserved && (
                        <CancelButton bookingId={booking.id} />
                      )}

                      {/* View ticket */}
                      {['TICKET_ISSUED', 'BOARDED', 'COMPLETED'].includes(booking.status) && (
                        <Link href={`/ticket/${booking.id}`}>
                          <button className="px-4 py-2 bg-forest text-white rounded-xl font-body text-xs font-medium hover:bg-pine transition-colors cursor-pointer">
                            View Ticket
                          </button>
                        </Link>
                      )}

                      {/* Dispute */}
                      {['PAID', 'TICKET_ISSUED', 'BOARDED', 'COMPLETED'].includes(booking.status) && (
                        <DisputeButton bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
