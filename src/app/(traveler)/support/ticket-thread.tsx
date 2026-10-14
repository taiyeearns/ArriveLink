'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { replyToTicket } from '@/lib/support-actions';

const STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  open: { label: 'Open', variant: 'location' },
  in_progress: { label: 'In Progress', variant: 'live' },
  resolved: { label: 'Resolved', variant: 'verified' },
  closed: { label: 'Closed', variant: 'muted' },
};

interface TicketThreadProps {
  data: {
    ticket: any;
    replies: any[];
    currentUser: any;
  };
  backHref: string;
}

export function TicketThread({ data, backHref }: TicketThreadProps) {
  const { ticket, replies, currentUser } = data;
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await replyToTicket(ticket.id, replyText);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setReplyText('');
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors font-body">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tickets
      </Link>

      {/* Ticket header */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="font-display text-lg font-bold text-foreground">{ticket.subject}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/40 font-body mb-4">
            <span className="capitalize">{ticket.category}</span>
            <span>·</span>
            <span>{new Date(ticket.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{ticket.name}</span>
          </div>
          <div className="p-4 rounded-xl bg-muted-bg dark:bg-white/5">
            <p className="text-sm text-foreground font-body whitespace-pre-wrap">{ticket.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply: any) => {
            const isAdmin = reply.is_admin;
            const userName = reply.user?.name || (isAdmin ? 'Support Team' : 'You');

            return (
              <Card key={reply.id} className={isAdmin ? 'border-l-2 border-l-emerald' : ''}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground font-body">{userName}</p>
                      {isAdmin && <Badge variant="verified">Support</Badge>}
                    </div>
                    <p className="text-[10px] text-foreground/40 font-body">
                      {new Date(reply.created_at).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-foreground font-body whitespace-pre-wrap">{reply.message}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      {ticket.status !== 'closed' && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                required
                placeholder="Type your reply..."
                className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-surface text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine resize-none"
              />
              {error && <p className="text-xs text-error font-body">{error}</p>}
              <Button type="submit" loading={loading} size="sm" disabled={!replyText.trim()}>
                Send Reply
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
