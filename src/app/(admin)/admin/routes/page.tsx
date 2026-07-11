import { getGeneralRoutes } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { CreateRouteForm } from './create-form';
import { RouteRow } from './route-row';

export const dynamic = 'force-dynamic';

export default async function AdminRoutesPage() {
  const routes = await getGeneralRoutes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-gray-400 mb-1">Route Corridors</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            General Routes
          </h1>
          <p className="text-sm text-gray-500 font-body mt-1">
            City-pair corridors that operators serve. Travelers search by these.
          </p>
        </div>
      </div>

      <CreateRouteForm />

      {routes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-gray-500 font-body">
              No route corridors yet. Add one above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-label text-xs text-gray-400">Origin</th>
                  <th className="py-3 px-4"></th>
                  <th className="text-left py-3 px-4 font-label text-xs text-gray-400">Destination</th>
                  <th className="text-left py-3 px-4 font-label text-xs text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-label text-xs text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <RouteRow key={route.id} route={route} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
