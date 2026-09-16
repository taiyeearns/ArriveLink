import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SearchForm } from '@/app/(traveler)/search-form';

export const metadata = {
  title: 'ArriveLink - Stop Going From Park to Park',
  description:
    'ArriveLink shows you every transport company, verified prices, and real departure times before you leave your house.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur border-b border-mist dark:border-white/5">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo variant="full" size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/onboarding"
              className="text-sm font-body font-medium text-foreground hover:text-pine dark:hover:text-emerald transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-5 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-emerald bg-mist dark:bg-pine/20 px-3 py-1.5 rounded-full mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified by ArriveLink
            </p>
            <h1 className="font-display text-4xl sm:text-6xl text-forest dark:text-emerald leading-[1.05] mb-5">
              Stop Going From Park to Park.
            </h1>
            <p className="text-lg sm:text-xl text-foreground/70 font-body leading-relaxed mb-10">
              ArriveLink shows you every transport company, verified prices, and real departure times, before you leave your house.
            </p>

            {/* Search form */}
            <div className="bg-white dark:bg-dark-surface border border-mist dark:border-white/10 rounded-2xl p-5 shadow-sm text-left">
              <SearchForm />
            </div>

            {/* Trust chips */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-foreground/60 font-body">
              {['Verified prices', 'Real departure times', 'Terminal locations confirmed'].map((label) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Problem section */}
        <section className="bg-mist dark:bg-dark-surface border-y border-mist dark:border-white/5 px-5 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-forest dark:text-emerald text-center mb-10">
              Sound familiar?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    </svg>
                  ),
                  title: 'Terminal Hopping',
                  body: 'You visit 3 parks before finding the right company. Hours wasted.',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  ),
                  title: 'Price Surprises',
                  body: 'The website says ₦12,000. You arrive and it’s ₦22,000.',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                    </svg>
                  ),
                  title: 'No Information',
                  body: 'Nobody knows which company is going where or when.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-white dark:bg-dark-bg rounded-2xl p-5 border border-mist dark:border-white/5 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-mist dark:bg-pine/20 text-forest dark:text-emerald flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-lg text-forest dark:text-emerald mt-4">{item.title}</h3>
                  <p className="text-sm text-foreground/70 font-body mt-1.5 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-5 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-forest dark:text-emerald text-center">
              How ArriveLink Works
            </h2>
            <p className="text-center text-foreground/60 font-body mt-2 max-w-xl mx-auto">
              Four steps from chaos to confidence.
            </p>
            <ol className="mt-10 grid gap-5 md:grid-cols-4">
              {[
                { step: 1, title: 'Search', body: 'Enter where you’re going and where you’re coming from.' },
                { step: 2, title: 'Compare', body: 'See all available companies with verified prices and departure times.' },
                { step: 3, title: 'Reserve', body: 'Reserve your seat instantly, then pay securely within 15 minutes to lock it in.' },
                { step: 4, title: 'Arrive', body: 'Travel with confidence. No surprises. No stress.' },
              ].map((item) => (
                <li key={item.step} className="bg-white dark:bg-dark-surface border border-mist dark:border-white/5 rounded-2xl p-5 shadow-sm">
                  <div className="font-mono text-xs text-emerald font-semibold">STEP {item.step}</div>
                  <h3 className="font-display text-lg text-forest dark:text-emerald mt-1">{item.title}</h3>
                  <p className="text-sm text-foreground/70 font-body mt-1.5 leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Founder story */}
        <section className="bg-mist dark:bg-dark-surface border-y border-mist dark:border-white/5 px-5 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-emerald text-xs uppercase tracking-widest font-semibold text-center font-body">
              Why We Built This
            </p>
            <blockquote className="mt-6 bg-white dark:bg-dark-bg border border-mist dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-sm">
              <p className="font-display text-xl sm:text-2xl text-forest dark:text-emerald leading-snug">
                &ldquo;I woke at 5AM to catch a 6AM bus from Benin City to Kaduna. I went from terminal to terminal. Nobody was going there. By the time I found the right park, the bus was gone. I waited until 11AM and broke my journey across two days. This happens to millions of Nigerians every week. It doesn&rsquo;t have to.&rdquo;
              </p>
              <footer className="mt-5 text-sm text-foreground/60 font-body">
                <span className="text-forest dark:text-emerald font-semibold">- Praise Obasi</span>, Founder of ArriveLink
              </footer>
            </blockquote>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-mist dark:border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Logo variant="full" size="sm" />
            <p className="text-xs text-foreground/40 font-body">Plan it. Book it. Arrive.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-foreground/50 font-body">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/search" className="hover:text-foreground transition-colors">Search Routes</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-foreground/40 font-body">
            &copy; {new Date().getFullYear()} ArriveLink
          </p>
        </div>
      </footer>
    </div>
  );
}
