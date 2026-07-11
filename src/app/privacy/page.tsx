import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - ArriveLink',
  description: 'How ArriveLink collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mist to-white dark:from-dark-surface dark:to-dark-bg">
      <div className="flex-1 max-w-2xl w-full mx-auto px-5 pt-10 pb-6 flex flex-col">
        <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="w-8 h-8 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <p className="text-xs text-gray-400 font-body mb-6">Last updated: July 2026</p>

        <div className="space-y-5 font-body text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-medium text-foreground">Account information:</span> name, email address, phone number provided during registration.</li>
              <li><span className="font-medium text-foreground">Booking data:</span> routes searched, seats booked, payment references.</li>
              <li><span className="font-medium text-foreground">Usage data:</span> pages visited, device type, and browser information for platform improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To process bookings and payments.</li>
              <li>To generate and deliver e-tickets.</li>
              <li>To communicate booking updates, confirmations, and support.</li>
              <li>To improve the Platform and user experience.</li>
              <li>To prevent fraud and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">3. Data Sharing</h2>
            <p>
              We share your data only with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><span className="font-medium text-foreground">Transport operators:</span> your name, contact, and booking details so they can fulfil your trip.</li>
              <li><span className="font-medium text-foreground">Paystack:</span> payment information for secure transaction processing.</li>
              <li><span className="font-medium text-foreground">Supabase:</span> data storage and authentication services.</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">4. Data Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS), secure authentication, and row-level database security to protect your data. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">5. Data Retention</h2>
            <p>
              We retain your account and booking data for as long as your account is active. Booking records may be kept for up to 2 years for dispute resolution and compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You can view and update your profile information at any time.</li>
              <li>You can request deletion of your account by contacting us.</li>
              <li>You can raise data-related concerns at{' '}
                <a href="mailto:privacy@arrivelink.com" className="text-emerald font-medium hover:text-pine transition-colors">
                  privacy@arrivelink.com
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">7. Changes</h2>
            <p>
              We may update this policy periodically. Significant changes will be communicated via the Platform or email.
            </p>
          </section>
        </div>

        </div>

        {/* Footer links */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-center gap-6 text-xs text-gray-400 font-body">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
