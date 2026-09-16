'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { createGeneralRoute } from './actions';

export function CreateRouteForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createGeneralRoute(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        + Add Route Corridor
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-foreground/40 mb-4">New Route Corridor</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Origin City" name="origin_city" placeholder="e.g. Benin City" required />
            <Input label="Origin State" name="origin_state" placeholder="e.g. Edo" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Destination City" name="destination_city" placeholder="e.g. Lagos" required />
            <Input label="Destination State" name="destination_state" placeholder="e.g. Lagos" required />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={loading} size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
