import { getAdminBookings } from '../settlement/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  RESERVED: { label: 'Reserved', variant: 'location' },
  PAID: { label: 'Paid', variant: 'live' },
  TICKET_ISSUED: { label: 'Ticketed', variant: 'live' },
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

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  const stats = {
    total: bookings.length,
    paid: bookings.filter((b: any) => ['PAID', 'TICKET_ISSUED', 'BOARDED', 'COMPLETED'].includes(b.status)).length,
    pending: bookings.filter((b: any) => b.status === 'REQUESTED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-gray-400 mb-1">Platform Overview</p>
        <h1 className="font-display text-2xl font-bold text-foreground">All Bookings</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-gray-400 font-body">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="font-display text-2xl font-bold text-emerald">{stats.paid}</p>
            <p className="text-xs text-gray-400 font-body">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="font-display text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-gray-400 font-body">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-gray-500 font-body">No bookings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking: any) => {
            const route = booking.route as any;
            const status = STATUS_CONFIG[booking.status] || { label: booking.status, variant: 'muted' as const };

            return (
              <Card key={booking.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground font-body truncate">
                        {route?.general_route?.origin_city} → {route?.general_route?.destination_city}
                      </p>
                      <p className="text-xs text-gray-400 font-body">
                        {route?.operator?.business_name} · {booking.traveler?.name || booking.traveler?.email}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-body">
                    <span>{booking.seats_requested} seat{booking.seats_requested !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>₦{(Number(route?.fare || 0) * booking.seats_requested).toLocaleString()}</span>
                    <span>·</span>
                    <span>{new Date(booking.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
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
