import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AdminWaitlistPage() {
  const supabase = createAdminClient();

  const { data: entries, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  const waitlistEntries = entries || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Waitlist</h1>
          <p className="text-sm text-foreground/40 font-body mt-0.5">
            {waitlistEntries.length} signup{waitlistEntries.length !== 1 ? 's' : ''} for December launch
          </p>
        </div>
        <Badge variant="live">{waitlistEntries.length}</Badge>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-error font-body">Failed to load waitlist: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {waitlistEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-foreground/50 font-body">No waitlist signups yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Header row - desktop */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2 text-xs text-foreground/40 font-label uppercase tracking-wider">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Route</div>
            <div className="col-span-2">Travel Date</div>
            <div className="col-span-2">Signed Up</div>
          </div>

          {waitlistEntries.map((entry: any) => (
            <Card key={entry.id}>
              <CardContent className="py-3">
                {/* Desktop */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-foreground font-body truncate">{entry.name}</p>
                    {entry.phone && (
                      <p className="text-xs text-foreground/40 font-body">{entry.phone}</p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-foreground/70 font-body truncate">{entry.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-foreground/70 font-body truncate">
                      {entry.preferred_route || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-foreground/70 font-body">
                      {entry.travel_date
                        ? new Date(entry.travel_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
                        : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-foreground/40 font-body">
                      {new Date(entry.created_at).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div className="sm:hidden space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground font-body truncate">{entry.name}</p>
                      <p className="text-xs text-foreground/40 font-body truncate">{entry.email}</p>
                    </div>
                    <p className="text-xs text-foreground/40 font-body whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {(entry.preferred_route || entry.travel_date) && (
                    <div className="flex items-center gap-3 text-xs text-foreground/50 font-body">
                      {entry.preferred_route && <span>{entry.preferred_route}</span>}
                      {entry.preferred_route && entry.travel_date && <span>-</span>}
                      {entry.travel_date && (
                        <span>{new Date(entry.travel_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-foreground/40 font-body italic">{entry.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
