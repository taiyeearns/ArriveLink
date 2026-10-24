'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createGeneralRoute } from './actions';
import { NIGERIA_STATES, getCitiesForState } from '@/lib/nigeria-locations';

function StateSelect({ name, label, value, onChange }: {
  name: string; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs font-semibold text-foreground/50 uppercase tracking-wider">{label}</label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-mist bg-white dark:bg-dark-surface dark:border-white/10 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
      >
        <option value="">Select state…</option>
        {NIGERIA_STATES.map((s) => (
          <option key={s.name} value={s.name}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

function CitySelect({ name, label, state, value, onChange }: {
  name: string; label: string; state: string; value: string; onChange: (v: string) => void;
}) {
  const cities = getCitiesForState(state);
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs font-semibold text-foreground/50 uppercase tracking-wider">{label}</label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={!state}
        className="w-full rounded-xl border border-mist bg-white dark:bg-dark-surface dark:border-white/10 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald disabled:opacity-50"
      >
        <option value="">{state ? 'Select city…' : 'Select state first'}</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

export function CreateRouteForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [originState, setOriginState] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destState, setDestState] = useState('');
  const [destCity, setDestCity] = useState('');

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

    // Reset
    setOriginState(''); setOriginCity('');
    setDestState('');   setDestCity('');
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
            <StateSelect name="origin_state" label="From State"    value={originState} onChange={(v) => { setOriginState(v); setOriginCity(''); }} />
            <CitySelect  name="origin_city"  label="From City"     state={originState} value={originCity}  onChange={setOriginCity} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StateSelect name="destination_state" label="To State" value={destState}   onChange={(v) => { setDestState(v); setDestCity(''); }} />
            <CitySelect  name="destination_city"  label="To City"  state={destState}   value={destCity}    onChange={setDestCity} />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={loading} size="sm">Save Corridor</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
