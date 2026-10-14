'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type SortField = 'price' | 'rating';
type SortDir = 'asc' | 'desc';

interface SearchResultsListProps {
  routes: any[];
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors cursor-pointer
        ${active
          ? 'bg-forest text-white'
          : 'bg-muted-bg dark:bg-white/5 text-foreground/50 hover:text-foreground'
        }
      `}
    >
      {label}
      <svg
        className={`w-3.5 h-3.5 transition-transform ${active && direction === 'desc' ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

export function SearchResultsList({ routes }: SearchResultsListProps) {
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'price' ? 'asc' : 'desc');
    }
  }

  const sortedRoutes = useMemo(() => {
    const sorted = [...routes];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'price') {
        cmp = Number(a.fare) - Number(b.fare);
      } else if (sortField === 'rating') {
        const aRating = a.avg_rating || 0;
        const bRating = b.avg_rating || 0;
        cmp = aRating - bRating;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [routes, sortField, sortDir]);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground/40 font-body">
          {routes.length} bus{routes.length !== 1 ? 'es' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/40 font-body">Sort:</span>
          <SortButton
            label="Price"
            active={sortField === 'price'}
            direction={sortDir}
            onClick={() => handleSort('price')}
          />
          <SortButton
            label="Rating"
            active={sortField === 'rating'}
            direction={sortDir}
            onClick={() => handleSort('rating')}
          />
        </div>
      </div>

      {sortedRoutes.map((route: any) => {
        const gr = route.general_route;
        const avgRating = route.avg_rating ? Number(route.avg_rating).toFixed(1) : null;

        return (
          <Card key={route.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="verified">{route.operator.business_name}</Badge>
                {route.bus_number && <Badge variant="muted">Bus {route.bus_number}</Badge>}
                {avgRating && (
                  <Badge variant="location">
                    <svg className="w-3 h-3 text-amber-500 inline mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {avgRating}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground font-body">{gr.origin_city}</span>
                <svg className="w-4 h-4 text-foreground/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-sm font-medium text-foreground font-body">{gr.destination_city}</span>
              </div>

              {/* Terminal info */}
              <p className="text-xs text-foreground/40 font-body mb-3">
                {route.pickup_terminal && <>Pickup: {route.pickup_terminal}</>}
                {route.dropoff_terminal && <> · Dropoff: {route.dropoff_terminal}</>}
              </p>

              <div className="flex items-center gap-4 text-xs text-foreground/50 font-body mb-4">
                <span>Departs {formatTime(route.departure_time)}</span>
                <span>·</span>
                <span className="font-medium">
                  {route.seats_available}/{route.seats_total} seats
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₦{Number(route.fare).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-foreground/40 font-body">per seat + ₦200 fee</p>
                </div>
                <Link href={`/booking/${route.id}`}>
                  <button className="px-5 py-2.5 bg-forest text-white rounded-xl font-body text-sm font-medium hover:bg-pine transition-colors cursor-pointer">
                    Book Now
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
