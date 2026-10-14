import { Suspense } from 'react';
import { searchRoutes } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '../search-form';
import Link from 'next/link';
import { SearchResultsList } from './search-results-list';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ route?: string }>;
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const { route } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center hover:bg-mist transition-colors">
          <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Search Results</h1>
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between p-3 rounded-xl bg-mist border border-emerald/10">
            <span className="text-sm text-pine font-medium font-body">Modify search</span>
            <svg className="w-4 h-4 text-pine transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="mt-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <SearchForm defaultRoute={route} />
            </CardContent>
          </Card>
        </div>
      </details>

      <Suspense fallback={
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted-bg rounded-lg w-3/4" />
                  <div className="h-3 bg-muted-bg rounded-lg w-1/2" />
                  <div className="h-8 bg-muted-bg rounded-lg w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <SearchResults routeId={route || ''} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ routeId }: { routeId: string }) {
  if (!routeId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-foreground/50 font-body">Select a route to search for available buses.</p>
        </CardContent>
      </Card>
    );
  }

  const routes = await searchRoutes(routeId);

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted-bg flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">No buses found</h2>
          <p className="text-sm text-foreground/50 font-body">
            No available buses on this route right now. Try a different route.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <SearchResultsList routes={routes} />;
}

