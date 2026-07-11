'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { createRoute, getGeneralRoutesForSelect } from './actions';

interface GeneralRoute {
  id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
}

export function CreateRouteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generalRoutes, setGeneralRoutes] = useState<GeneralRoute[]>([]);

  useEffect(() => {
    if (open) {
      getGeneralRoutesForSelect().then(setGeneralRoutes);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createRoute(formData);

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
        + Add Bus
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-gray-400 mb-4">New Bus Entry</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Route selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">Route Corridor</label>
            <select
              name="general_route_id"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine"
            >
              <option value="">Select a route corridor</option>
              {generalRoutes.map((gr) => (
                <option key={gr.id} value={gr.id}>
                  {gr.origin_city}, {gr.origin_state} → {gr.destination_city}, {gr.destination_state}
                </option>
              ))}
            </select>
          </div>

          {/* Terminal details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Pickup Terminal/Park" name="pickup_terminal" placeholder="e.g. Upper Sakponba Motor Park" required />
            <Input label="Pickup Address (optional)" name="pickup_address" placeholder="e.g. 12 Sakponba Rd" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Dropoff Terminal (optional)" name="dropoff_terminal" placeholder="e.g. Jibowu Bus Stop" />
            <Input label="Dropoff Address (optional)" name="dropoff_address" placeholder="e.g. 5 Jibowu St, Yaba" />
          </div>

          {/* Bus + schedule details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Bus Number" name="bus_number" type="number" min="1" placeholder="e.g. 1" required />
            <Input label="Departure Time" name="departure_time" type="time" required />
            <Input label="Fare (₦)" name="fare" type="number" min="0" step="100" required />
          </div>

          <Input label="Total Seats" name="seats_total" type="number" min="1" required />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={loading} size="sm">Create Bus</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
