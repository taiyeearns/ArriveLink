import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export const metadata = {
  title: 'About - ArriveLink',
  description: 'ArriveLink makes intercity bus travel across Nigeria easier, safer, and more transparent.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mist to-white dark:from-dark-surface dark:to-dark-bg">
      <div className="flex-1 max-w-2xl w-full mx-auto px-5 pt-10 pb-6 flex flex-col">
        <div className="flex-1">
          {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="w-8 h-8 rounded-full bg-white dark:bg-dark-surface border border-mist dark:border-white/10 flex items-center justify-center hover:bg-muted-bg dark:hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">About ArriveLink</h1>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="icon" size="lg" />
        </div>

        <div className="space-y-6 font-body text-sm text-foreground/60 dark:text-foreground/70 leading-relaxed">
          <p>
            <span className="font-semibold text-foreground">ArriveLink</span> is a transport booking platform built for Nigerian intercity travel. We connect travelers with verified bus operators, making it easy to compare fares, pre-pay for your seat, and skip the chaos at the motor park.
          </p>

          <div>
            <h2 className="font-display text-base font-bold text-foreground mb-2">How it works</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald">1</span>
                </div>
                <p><span className="font-medium text-foreground">Search.</span> Pick your route and we&apos;ll show you every available bus, with fares sorted low to high.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald">2</span>
                </div>
                <p><span className="font-medium text-foreground">Reserve & Pay.</span> Your seat is held for 15 minutes while you complete payment securely via Paystack.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald">3</span>
                </div>
                <p><span className="font-medium text-foreground">Arrive.</span> Show your e-ticket code to the driver and board. No printing, no queues.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-bold text-foreground mb-2">For operators</h2>
            <p>
              Transport companies can list their buses, set fares and schedules, track bookings in real-time, and receive settlements directly. If you run a transport business and want to join ArriveLink, reach out to us at{' '}
              <a href="mailto:hello@arrivelink.com" className="text-emerald font-medium hover:text-pine transition-colors">
                hello@arrivelink.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base font-bold text-foreground mb-2">Our mission</h2>
            <p>
              We believe getting from one city to another in Nigeria shouldn&apos;t involve guesswork, inflated pricing, or hours wasted at the park. ArriveLink brings transparency, convenience, and trust to intercity travel, one booking at a time.
            </p>
          </div>
        </div>

        </div>

        {/* Footer links */}
        <div className="mt-10 pt-6 border-t border-mist dark:border-white/5 flex items-center justify-center gap-6 text-xs text-foreground/40 font-body">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
