'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { getSearchRoutes } from './search/actions';

interface GeneralRoute {
  id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
}

export function SearchForm({ defaultRoute }: { defaultRoute?: string }) {
  const [routes, setRoutes] = useState<GeneralRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeId, setRouteId] = useState(defaultRoute || '');
  const router = useRouter();

  useEffect(() => {
    getSearchRoutes().then((data) => {
      setRoutes(data);
      setLoading(false);
    });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!routeId) return;
    router.push(`/search?route=${routeId}`);
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-foreground">Where are you going?</label>
        <Combobox
          value={routeId}
          onChange={setRouteId}
          options={routes.map(r => ({
            id: r.id,
            label: `${r.origin_city}, ${r.origin_state} → ${r.destination_city}, ${r.destination_state}`
          }))}
          placeholder="Select a route"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!routeId}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Buses
      </Button>
    </form>
  );
}
