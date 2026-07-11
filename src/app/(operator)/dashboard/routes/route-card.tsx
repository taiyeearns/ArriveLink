'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleRouteActive } from './actions';
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
    general_route: {
      origin_city: string;
      origin_state: string;
      destination_city: string;
      destination_state: string;
    };
  };
}

export function RouteCard({ route }: RouteCardProps) {
  const [loading, setLoading] = useState('');
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();
  const gr = route.general_route;

  async function handleToggle() {
    setLoading('toggle');
    await toggleRouteActive(route.id);
    setLoading('');
    router.refresh();
  }

  const booked = route.seats_total - route.seats_available;

  return (
    <Card className={!route.active ? 'opacity-60' : ''}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              {gr.origin_city} → {gr.destination_city}
            </p>
            <p className="text-xs text-gray-400 font-body">
              {gr.origin_state} → {gr.destination_state}
            </p>
          </div>
          <Badge variant={route.active ? 'live' : 'muted'}>
            {route.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Terminal info */}
        <div className="space-y-1 mb-3">
          <p className="text-xs font-body text-gray-500">
            <span className="text-gray-400">Pickup:</span> {route.pickup_terminal || 'Not set'}
          </p>
          {route.dropoff_terminal && (
            <p className="text-xs font-body text-gray-500">
              <span className="text-gray-400">Dropoff:</span> {route.dropoff_terminal}
            </p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-gray-400 font-label">Fare</p>
            <p className="font-display text-sm font-bold text-foreground">
              ₦{Number(route.fare).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-label">Departure</p>
            <p className="font-body text-sm text-foreground">{route.departure_time}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-label">Seats</p>
            <p className="font-body text-sm text-foreground">
              {route.seats_available}/{route.seats_total}
              {booked > 0 && <span className="text-emerald ml-1">({booked} booked)</span>}
            </p>
          </div>
          {route.bus_number && (
            <div>
              <p className="text-[10px] text-gray-400 font-label">Bus #</p>
              <p className="font-mono text-sm text-foreground">{route.bus_number}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
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
