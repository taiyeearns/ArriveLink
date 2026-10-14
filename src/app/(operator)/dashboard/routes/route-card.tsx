'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleRouteActive } from './actions';
import { markDeparted, markTripComplete } from '../bookings/boarding-actions';
import { DuplicateRouteModal } from './duplicate-route-modal';
import { EditRouteModal } from './edit-route-modal';

interface RouteCardProps {
  route: {
    id: string;
    fare: number;
    departure_time: string;
    seats_total: number;
    seats_available: number;
    active: boolean;
    bus_number: string | null;
    pickup_terminal: string | null;
    dropoff_terminal: string | null;
    expected_duration_minutes?: number;
    trip_status?: string;
    departed_at?: string | null;
    completed_at?: string | null;
    general_route: {
      origin_city: string;
      origin_state: string;
      destination_city: string;
      destination_state: string;
    };
  };
}

const TRIP_STATUS_CONFIG: Record<string, { label: string; variant: 'live' | 'muted' | 'verified' | 'location' }> = {
  scheduled: { label: 'Scheduled', variant: 'location' },
  departed: { label: 'In Transit', variant: 'live' },
  completed: { label: 'Trip Complete', variant: 'verified' },
};

export function RouteCard({ route }: RouteCardProps) {
  const [loading, setLoading] = useState('');
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tripError, setTripError] = useState('');
  const router = useRouter();
  const gr = route.general_route;

  async function handleToggle() {
    setLoading('toggle');
    await toggleRouteActive(route.id);
    setLoading('');
    router.refresh();
  }

  async function handleDepart() {
    setTripError('');
    setLoading('depart');
    const result = await markDeparted(route.id);
    setLoading('');
    if (result.error) {
      setTripError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleComplete() {
    setTripError('');
    setLoading('complete');
    const result = await markTripComplete(route.id);
    setLoading('');
    if (result.error) {
      setTripError(result.error);
      return;
    }
    router.refresh();
  }

  const booked = route.seats_total - route.seats_available;
  const tripStatus = route.trip_status || 'scheduled';
  const tripConfig = TRIP_STATUS_CONFIG[tripStatus] || TRIP_STATUS_CONFIG.scheduled;
  const durationHrs = Math.floor((route.expected_duration_minutes || 60) / 60);
  const durationMins = (route.expected_duration_minutes || 60) % 60;
  const durationLabel = durationHrs > 0
    ? `${durationHrs}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
    : `${durationMins}m`;

  return (
    <Card className={!route.active && tripStatus !== 'completed' ? 'opacity-60' : ''}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              {gr.origin_city} → {gr.destination_city}
            </p>
            <p className="text-xs text-foreground/40 font-body">
              {gr.origin_state} → {gr.destination_state}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={tripConfig.variant}>{tripConfig.label}</Badge>
            {tripStatus !== 'completed' && (
              <Badge variant={route.active ? 'live' : 'muted'}>
                {route.active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </div>

        {/* Terminal info */}
        <div className="space-y-1 mb-3">
          <p className="text-xs font-body text-foreground/50">
            <span className="text-foreground/40">Pickup:</span> {route.pickup_terminal || 'Not set'}
          </p>
          {route.dropoff_terminal && (
            <p className="text-xs font-body text-foreground/50">
              <span className="text-foreground/40">Dropoff:</span> {route.dropoff_terminal}
            </p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-foreground/40 font-label">Fare</p>
            <p className="font-display text-sm font-bold text-foreground">
              ₦{Number(route.fare).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 font-label">Departure</p>
            <p className="font-body text-sm text-foreground">{route.departure_time}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 font-label">Seats</p>
            <p className="font-body text-sm text-foreground">
              {route.seats_available}/{route.seats_total}
              {booked > 0 && <span className="text-emerald ml-1">({booked} booked)</span>}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 font-label">Duration</p>
            <p className="font-body text-sm text-foreground">{durationLabel}</p>
          </div>
          {route.bus_number && (
            <div>
              <p className="text-[10px] text-foreground/40 font-label">Bus #</p>
              <p className="font-mono text-sm text-foreground">{route.bus_number}</p>
            </div>
          )}
        </div>

        {/* Trip error */}
        {tripError && (
          <div className="p-2 rounded-lg bg-error-bg border border-error-border mb-3">
            <p className="text-xs text-error font-body">{tripError}</p>
          </div>
        )}

        {/* Trip lifecycle actions */}
        {tripStatus === 'scheduled' && route.active && booked > 0 && (
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              onClick={handleDepart}
              loading={loading === 'depart'}
              className="flex-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Mark Departed
            </Button>
          </div>
        )}

        {tripStatus === 'departed' && (
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleComplete}
              loading={loading === 'complete'}
              className="flex-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark Trip Complete
            </Button>
          </div>
        )}

        {/* Management actions */}
        {tripStatus !== 'completed' && (
          <div className="flex gap-2 pt-2 border-t border-mist dark:border-white/5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant={route.active ? 'ghost' : 'secondary'}
              onClick={handleToggle}
              loading={loading === 'toggle'}
            >
              {route.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDuplicateOpen(true)}
            >
              Duplicate
            </Button>
          </div>
        )}
      </CardContent>

      <DuplicateRouteModal
        routeId={route.id}
        originalTime={route.departure_time}
        isOpen={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
      />

      <EditRouteModal
        route={route}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </Card>
  );
}

