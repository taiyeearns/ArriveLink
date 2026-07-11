import { getMyRoutes } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { CreateRouteButton } from './create-route-button';
import { RouteCard } from './route-card';

export const dynamic = 'force-dynamic';

export default async function OperatorRoutesPage() {
  const routes = await getMyRoutes();

  const activeCount = routes.filter((r: any) => r.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-label text-gray-400 mb-1">Bus Management</p>
          <h1 className="font-display text-2xl font-bold text-foreground">Your Buses</h1>
          <p className="text-sm text-gray-500 font-body mt-1">
            {routes.length} bus{routes.length !== 1 ? 'es' : ''}
            {activeCount < routes.length && `, ${activeCount} active`}
          </p>
        </div>
        <CreateRouteButton />
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">No buses yet</h2>
            <p className="text-sm text-gray-500 font-body mb-4">
              Add your first bus so travelers can find and book your services.
            </p>
            <CreateRouteButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map((route: any) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}
