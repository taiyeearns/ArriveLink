import { getAllTickets, getTicketWithReplies } from '@/lib/support-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TicketThread } from '@/app/(traveler)/support/ticket-thread';
import { AdminTicketFilters } from './ticket-filters';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ ticket?: string; status?: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  open: { label: 'Open', variant: 'location' },
  in_progress: { label: 'In Progress', variant: 'live' },
  resolved: { label: 'Resolved', variant: 'verified' },
  closed: { label: 'Closed', variant: 'muted' },
};

export default async function AdminSupportPage({ searchParams }: Props) {
  const { ticket: ticketId, status: statusFilter } = await searchParams;

  if (ticketId) {
    const data = await getTicketWithReplies(ticketId);
    if (!data) {
      return (
        <div className="space-y-4">
          <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors font-body">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-foreground/50 font-body">Ticket not found.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <TicketThread data={data} backHref="/admin/support" />;
  }

  const tickets = await getAllTickets(statusFilter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-sm text-foreground/40 font-body mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
      </div>

      <AdminTicketFilters currentStatus={statusFilter || 'all'} />

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-foreground/50 font-body">No tickets found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket: any) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            return (
              <Link key={ticket.id} href={`/admin/support?ticket=${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground font-body truncate">{ticket.subject}</p>
                        <p className="text-xs text-foreground/40 font-body">{ticket.name} ({ticket.email})</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground/40 font-body">
                      <span className="capitalize">{ticket.category}</span>
                      <span>·</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
