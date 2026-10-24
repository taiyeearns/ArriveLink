'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { createRoute } from './actions';
import { NIGERIA_STATES, getCitiesForState } from '@/lib/nigeria-locations';

export function CreateRouteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originState, setOriginState] = useState('');
  const [destState, setDestState] = useState('');

  const originCities = getCitiesForState(originState);
  const destCities   = getCitiesForState(destState);

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
        <p className="font-label text-foreground/40 mb-4">New Bus Entry</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Origin */}
          <div>
            <p className="font-body text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-2">Origin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-foreground">State</label>
                <select
                  name="origin_state"
                  required
                  value={originState}
                  onChange={e => setOriginState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine"
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-foreground">Region / City</label>
                <select
                  name="origin_city"
                  required
                  disabled={!originState}
                  className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine disabled:opacity-50"
                >
                  <option value="">{originState ? 'Select region' : 'Select state first'}</option>
                  {originCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="font-body text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-2">Destination</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-foreground">State</label>
                <select
                  name="destination_state"
                  required
                  value={destState}
                  onChange={e => setDestState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine"
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-foreground">Region / City</label>
                <select
                  name="destination_city"
                  required
                  disabled={!destState}
                  className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine disabled:opacity-50"
                >
                  <option value="">{destState ? 'Select region' : 'Select state first'}</option>
                  {destCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
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

          {/* Expected trip duration */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">Expected Trip Duration</label>
            <div className="grid grid-cols-2 gap-2">
              <Input label="" name="duration_hours" type="number" min="0" max="48" placeholder="Hours" defaultValue="1" />
              <Input label="" name="duration_minutes" type="number" min="0" max="59" placeholder="Minutes" defaultValue="0" />
            </div>
            <p className="text-[10px] text-foreground/40 font-body">
              Used to time-gate trip completion. Default: 1 hour.
            </p>
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
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
