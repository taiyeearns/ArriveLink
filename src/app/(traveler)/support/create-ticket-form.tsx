'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTicket } from '@/lib/support-actions';
import { TICKET_CATEGORIES } from '@/lib/constants';

export function CreateTicketForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createTicket(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Ticket
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-foreground/40 mb-4">Create Support Ticket</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">Category</label>
            <select
              name="category"
              className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-surface text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine"
            >
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <Input label="Subject" name="subject" placeholder="Brief description of your issue" required />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">Message</label>
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-surface text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={loading} size="sm">Submit Ticket</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
