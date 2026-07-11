import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { SearchForm } from './search-form';

export const dynamic = 'force-dynamic';

export default function TravelerHomePage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center pt-4 pb-2">
        <div className="flex justify-center mb-4">
          <Logo variant="icon" size="lg" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
          Plan It. Book It. <br />
          <span className="text-emerald dark:text-lime">Arrive.</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-2 max-w-xs mx-auto">
          Find and compare transport routes across Nigeria. Pre-pay your seat, skip the terminal chaos.
        </p>
      </div>

      {/* Search card */}
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6 pb-6">
          <p className="font-label text-gray-400 mb-4">Find your ride</p>
          <SearchForm />
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: (
              <svg className="w-5 h-5 text-emerald dark:text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: 'Verified operators',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-emerald dark:text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: 'Pre-pay & relax',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-emerald dark:text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            ),
            label: 'E-ticket boarding',
          },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-mist/50 dark:bg-pine/10 border border-transparent dark:border-pine/20">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-pine/20 flex items-center justify-center mb-2 shadow-sm">
              {item.icon}
            </div>
            <span className="text-[10px] font-medium text-foreground font-body leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
