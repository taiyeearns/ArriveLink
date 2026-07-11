'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { updateRoute, checkActiveBookings } from './actions';

interface EditRouteModalProps {
  route: {
    id: string;
    fare: number;
    departure_time: string;
    seats_total: number;
    bus_number: string | null;
    pickup_terminal: string | null;
    dropoff_terminal: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function EditRouteModal({ route, isOpen, onClose }: EditRouteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasBookings, setHasBookings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      checkActiveBookings(route.id).then(setHasBookings);
    }
  }, [isOpen, route.id]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasBookings) {
      setError('Cannot save edits while there are active bookings.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateRoute(route.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Edit Route</h3>

            {hasBookings && (
              <div className="p-3 mb-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900">
                <p className="text-xs text-orange-800 dark:text-orange-300 font-body">
                  <strong>Locked:</strong> This route has active bookings. To ensure data integrity for travelers who have already paid, you can only deactivate this route from the dashboard. If you need to change details, please duplicate it to create a new route.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Bus Number"
                name="bus_number"
                type="number"
                min="1"
                required
                defaultValue={route.bus_number || ''}
                disabled={hasBookings}
              />
              <Input
                label="Departure Time"
                name="departure_time"
                type="time"
                required
                defaultValue={route.departure_time}
                disabled={hasBookings}
              />
              <Input
                label="Fare (₦)"
                name="fare"
                type="number"
                min="0"
                step="100"
                required
                defaultValue={route.fare}
                disabled={hasBookings}
              />
              <Input
                label="Total Seats"
                name="seats_total"
                type="number"
                min="1"
                required
                defaultValue={route.seats_total}
                disabled={hasBookings}
              />

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-600 dark:text-red-400 font-body">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} className="w-full">
                  Close
                </Button>
                <Button type="submit" loading={loading} className="w-full" disabled={hasBookings}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
