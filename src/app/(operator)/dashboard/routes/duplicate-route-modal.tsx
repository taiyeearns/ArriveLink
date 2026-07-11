'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { duplicateRoute, getNextAvailableBusNumber } from './actions';

interface DuplicateRouteModalProps {
  routeId: string;
  originalTime: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DuplicateRouteModal({ routeId, originalTime, isOpen, onClose }: DuplicateRouteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextBus, setNextBus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      getNextAvailableBusNumber().then(num => {
        if (num) setNextBus(num);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const time = formData.get('departure_time') as string;
    const bus = formData.get('bus_number') as string;

    const result = await duplicateRoute(routeId, time, bus);

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
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Duplicate Route</h3>
            <p className="text-sm font-body text-gray-500 mb-5">
              Copy this route with a new time or bus number.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Bus Number"
                name="bus_number"
                type="number"
                min="1"
                required
                value={nextBus}
                onChange={(e) => setNextBus(e.target.value)}
              />
              <Input
                label="Departure Time"
                name="departure_time"
                type="time"
                required
                defaultValue={originalTime}
              />

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-600 dark:text-red-400 font-body">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} className="w-full">
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="w-full">
                  Duplicate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
