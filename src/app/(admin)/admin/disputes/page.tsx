import { getAdminDisputes } from '../settlement/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResolveButton } from './resolve-button';

export const dynamic = 'force-dynamic';

export default async function AdminDisputesPage() {
  const disputes = await getAdminDisputes();

  const openCount = disputes.filter((d: any) => !d.resolved_at).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-foreground/40 mb-1">Support</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Disputes</h1>
        <p className="text-sm text-foreground/50 font-body mt-1">
          {disputes.length} total
          {openCount > 0 && <span className="text-error font-medium"> · {openCount} open</span>}
        </p>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-semibold text-foreground mb-1">No disputes</h2>
            <p className="text-sm text-foreground/50 font-body">All clear! No issues reported.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute: any) => {
            const booking = dispute.booking as any;
            const route = booking?.route as any;
            const isOpen = !dispute.resolved_at;

            return (
              <Card key={dispute.id} className={isOpen ? 'ring-2 ring-error/30' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={isOpen ? 'location' : 'verified'}>
                      {isOpen ? 'Open' : 'Resolved'}
                    </Badge>
                    <p className="text-[10px] text-foreground/40 font-body">
                      {new Date(dispute.created_at).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Reporter */}
                  <p className="text-sm font-medium text-foreground font-body mb-1">
                    {dispute.raised_by_user?.name || dispute.raised_by_user?.email}
                  </p>

                  {/* Booking context */}
                  <p className="text-xs text-foreground/40 font-body mb-2">
                    {route?.general_route?.origin_city} → {route?.general_route?.destination_city} · {route?.operator?.business_name}
                    {' · '}{booking?.seats_requested} seat{booking?.seats_requested !== 1 ? 's' : ''}
                  </p>

                  {/* Reason */}
                  <div className="p-3 rounded-xl bg-error-bg border border-error-border mb-3">
                    <p className="text-xs text-foreground/40 font-body mb-1">Reason</p>
                    <p className="text-sm text-error font-body">{dispute.reason}</p>
                  </div>

                  {/* Resolution */}
                  {dispute.resolution && (
                    <div className="p-3 rounded-xl bg-emerald/5 border border-emerald/10 mb-3">
                      <p className="text-xs text-foreground/40 font-body mb-1">Resolution</p>
                      <p className="text-sm text-foreground font-body">{dispute.resolution}</p>
                      <p className="text-[10px] text-foreground/40 font-body mt-1">
                        Resolved {new Date(dispute.resolved_at).toLocaleDateString('en-NG', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}

                  {isOpen && <ResolveButton disputeId={dispute.id} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
