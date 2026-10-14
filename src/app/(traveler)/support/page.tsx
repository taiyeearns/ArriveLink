import { getMyTickets, getTicketWithReplies } from '@/lib/support-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CreateTicketForm } from './create-ticket-form';
import { TicketThread } from './ticket-thread';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ ticket?: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  open: { label: 'Open', variant: 'location' },
  in_progress: { label: 'In Progress', variant: 'live' },
  resolved: { label: 'Resolved', variant: 'verified' },
  closed: { label: 'Closed', variant: 'muted' },
};

export default async function SupportPage({ searchParams }: Props) {
  const { ticket: ticketId } = await searchParams;

  // If viewing a specific ticket
  if (ticketId) {
    const data = await getTicketWithReplies(ticketId);
    if (!data) {
      return (
        <div className="space-y-4">
          <Link href="/support" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors font-body">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to tickets
          </Link>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-foreground/50 font-body">Ticket not found.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <TicketThread data={data} backHref="/support" />;
  }

  const tickets = await getMyTickets();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-foreground/40 font-body mt-0.5">Get help with your bookings and account</p>
        </div>
      </div>

      <CreateTicketForm />

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-foreground/50 font-body">No tickets yet. Create one above if you need help.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="font-label text-foreground/40">Your Tickets</p>
          {tickets.map((ticket: any) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            return (
              <Link key={ticket.id} href={`/support?ticket=${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground font-body truncate">{ticket.subject}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground/40 font-body">
                      <span className="capitalize">{ticket.category}</span>
                      <span>·</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
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
