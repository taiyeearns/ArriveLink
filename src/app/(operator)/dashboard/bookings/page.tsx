import { getOperatorBookings } from '../../../(traveler)/booking/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingActions } from './booking-actions';

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

export default async function OperatorBookingsPage() {
  const bookings = await getOperatorBookings();

  const activeCount = bookings.filter((b: any) =>
    ['RESERVED', 'PAID', 'TICKET_ISSUED'].includes(b.status)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-foreground/40 mb-1">Booking Management</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-sm text-foreground/50 font-body mt-1">
          {bookings.length} total
          {activeCount > 0 && (
            <span className="text-emerald font-medium"> , {activeCount} active</span>
          )}
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
            <p className="text-sm text-foreground/50 font-body">
              Bookings will appear here when travelers reserve seats on your buses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => {
            const route = booking.route;
            const traveler = booking.traveler;
            const status = STATUS_CONFIG[booking.status] || { label: booking.status, variant: 'muted' as const };

            const gr = route?.general_route;
            const originLabel = route?.pickup_terminal
              ? `${gr?.origin_city} (${route.pickup_terminal})`
              : gr?.origin_city || 'Unknown';
            const destLabel = route?.dropoff_terminal
              ? `${gr?.destination_city} (${route.dropoff_terminal})`
              : gr?.destination_city || 'Unknown';

            // Show countdown for reserved bookings
            const isReserved = booking.status === 'RESERVED';
            const expiresAt = booking.payment_expires_at ? new Date(booking.payment_expires_at) : null;
            const minutesLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000)) : null;

            return (
              <Card key={booking.id} className={isReserved ? 'ring-2 ring-amber-200 shadow-md' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <div className="text-right">
                      <p className="text-[10px] text-foreground/40 font-body">
                        {new Date(booking.created_at).toLocaleDateString('en-NG', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {isReserved && minutesLeft !== null && (
                        <p className="text-[10px] text-amber-600 font-medium font-body">
                          {minutesLeft > 0 ? `${minutesLeft}m left to pay` : 'Expiring...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Traveler info */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-pine/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-pine">
                        {(traveler?.name || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">
                        {traveler?.name || 'Traveler'}
                      </p>
                      <p className="text-[10px] text-foreground/40 font-body">{traveler?.email}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-xs text-foreground/50 font-body mb-1">
                    <span>{originLabel}</span>
                    <span>→</span>
                    <span>{destLabel}</span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-3 text-xs text-foreground/40 font-body mb-3">
                    <span>{booking.seats_requested} seat{booking.seats_requested !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>₦{(Number(route?.fare || 0) * booking.seats_requested).toLocaleString()}</span>
                    {route?.bus_number && (
                      <>
                        <span>·</span>
                        <span>{route.bus_number}</span>
                      </>
                    )}
                  </div>

                  {/* Actions: only boarding/completion, no accept/reject */}
                  {['TICKET_ISSUED', 'BOARDED'].includes(booking.status) && (
                    <BookingActions bookingId={booking.id} status={booking.status} />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
