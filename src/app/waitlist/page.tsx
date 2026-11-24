import { LandingHeader } from '@/app/landing/landing-header';
import { LandingFooter } from '@/app/landing/landing-footer';
import { WaitlistForm } from './waitlist-form';

export const metadata = {
  title: 'Join the Waitlist - ArriveLink',
  description: 'Booking opens 10 December. Join the waitlist and be the first to book your December holiday travel on ArriveLink.',
};

export default function WaitlistPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-bg">
      <LandingHeader />
      <main className="flex-1 pt-24 pb-20 px-5">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald/10 dark:bg-emerald/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-emerald text-sm font-body font-semibold">Coming 10 December 2026</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-forest dark:text-white mb-5 leading-tight">
              Join the waitlist.
            </h1>
            <p className="text-forest/55 dark:text-white/50 font-body text-lg max-w-lg mx-auto">
              Be the first to book your December holiday bus travel. We will notify you the moment booking goes live. No spam, just your ticket to a stress-free trip.
            </p>
          </div>

          {/* Form */}
          <div className="bg-mist/30 dark:bg-dark-surface border border-mist dark:border-white/10 rounded-3xl p-6 sm:p-8">
            <WaitlistForm />
          </div>

        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
