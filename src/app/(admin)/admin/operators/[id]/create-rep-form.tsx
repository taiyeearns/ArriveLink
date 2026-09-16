'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOperatorRep } from '../actions';

interface CreateRepFormProps {
  operatorId: string;
}

export function CreateRepForm({ operatorId }: CreateRepFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOperatorRep(operatorId, formData);

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
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Rep
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-1">
          Add Representative
        </h2>
        <p className="text-xs text-foreground/50 font-body mb-4">
          This will create a login account for them. They&apos;ll be able to manage routes and bookings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="Rep's full name"
            required
            autoFocus
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="rep@company.com"
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="08012345678"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            hint="At least 6 characters. Share this with the rep."
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setOpen(false); setError(''); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Rep
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
