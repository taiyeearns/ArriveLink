import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function SearchResultsPage() {
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

      <Card>
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald/10 dark:bg-emerald/20 rounded-full px-4 py-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-emerald text-sm font-body font-semibold">Coming 10 December</span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Booking opens 10 Dec
          </h2>
          <p className="text-sm text-foreground/50 dark:text-foreground/40 font-body mb-6 max-w-sm mx-auto">
            We are onboarding transport operators and verifying routes. Join the waitlist to be notified the moment you can search and book.
          </p>
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest dark:bg-emerald text-white dark:text-forest rounded-xl font-body font-bold text-base hover:bg-pine dark:hover:bg-emerald/90 transition-all shadow-md active:scale-[0.98]"
          >
            Join the Waitlist
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
