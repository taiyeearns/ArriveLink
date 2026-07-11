import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export const metadata = {
  title: 'ArriveLink - Plan It. Book It. Arrive.',
  description:
    'Find and compare intercity bus routes across Nigeria. Pre-pay your seat, get an e-ticket, and skip the terminal chaos.',
};

import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mist via-white to-mist/30 dark:from-dark-surface dark:via-dark-bg dark:to-dark-surface">
      {/* Header */}
      <header className="px-4 sm:px-5 py-2 sm:py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="scale-125 origin-left pl-2">
          <Logo variant="full" size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/onboarding"
            className="px-2 sm:px-4 py-2 text-sm font-body font-medium text-foreground hover:text-pine dark:hover:text-emerald transition-colors whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="px-3 sm:px-4 py-2 text-sm font-body font-medium text-white bg-forest dark:bg-emerald dark:text-foreground rounded-xl hover:bg-pine dark:hover:bg-lime transition-colors whitespace-nowrap"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-2 sm:py-12 mt-4 sm:mt-0 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <Logo variant="icon" size="lg" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
            Plan It. Book It.{' '}
            <span className="text-emerald">Arrive.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-500 font-body mb-8 max-w-sm mx-auto leading-relaxed">
            Find intercity buses across Nigeria. Compare fares, pre-pay your seat, and get an e-ticket. No queues, no guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/onboarding">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-forest dark:bg-emerald text-white rounded-xl font-body text-sm font-medium hover:bg-pine dark:hover:bg-lime transition-all duration-200 shadow-lg shadow-forest/20 dark:shadow-emerald/10 hover:shadow-xl hover:shadow-pine/20 dark:hover:shadow-lime/20 cursor-pointer">
                Get Started
              </button>
            </Link>
            <Link href="/onboarding">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-dark-surface text-foreground border border-gray-200 dark:border-white/5 rounded-xl font-body text-sm font-medium hover:bg-mist dark:hover:bg-pine/10 dark:hover:border-pine/30 transition-colors cursor-pointer">
                I have an account
              </button>
            </Link>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Verified operators',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Pre-pay & relax',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ),
                label: 'E-ticket boarding',
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/80 dark:bg-pine/10 border border-gray-100 dark:border-pine/20">
                <div className="w-10 h-10 rounded-xl bg-mist dark:bg-pine/20 flex items-center justify-center mb-2">
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium text-foreground font-body leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 font-body">
            &copy; {new Date().getFullYear()} ArriveLink. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-400 font-body">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
