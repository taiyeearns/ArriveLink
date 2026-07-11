'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleGeneralRoute, deleteGeneralRoute } from './actions';

interface RouteRowProps {
  route: {
    id: string;
    origin_city: string;
    origin_state: string;
    destination_city: string;
    destination_state: string;
    active: boolean;
    created_at: string;
  };
}

export function RouteRow({ route }: RouteRowProps) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleToggle() {
    setLoading('toggle');
    setError('');
    const result = await toggleGeneralRoute(route.id);
    if (result.error) setError(result.error);
    setLoading('');
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Delete this route corridor? This cannot be undone.')) return;
    setLoading('delete');
    setError('');
    const result = await deleteGeneralRoute(route.id);
    if (result.error) setError(result.error);
    setLoading('');
    router.refresh();
  }

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-body text-sm font-medium text-foreground">
          {route.origin_city}, {route.origin_state}
        </p>
      </td>
      <td className="py-3 px-4">
        <span className="text-gray-400 text-xs">→</span>
      </td>
      <td className="py-3 px-4">
        <p className="font-body text-sm font-medium text-foreground">
          {route.destination_city}, {route.destination_state}
        </p>
      </td>
      <td className="py-3 px-4">
        <Badge variant={route.active ? 'live' : 'muted'}>
          {route.active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            loading={loading === 'toggle'}
          >
            {route.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            loading={loading === 'delete'}
          >
            Delete
          </Button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </td>
    </tr>
  );
}
