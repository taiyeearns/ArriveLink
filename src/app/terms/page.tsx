import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - ArriveLink',
  description: 'Terms and conditions for using ArriveLink.',
};

export default function TermsPage() {
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
          <h1 className="font-display text-xl font-bold text-foreground">Terms of Service</h1>
        </div>

        <p className="text-xs text-foreground/40 font-body mb-6">Last updated: July 2026</p>

        <div className="space-y-5 font-body text-sm text-foreground/60 dark:text-foreground/70 leading-relaxed">
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ArriveLink (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">2. The Service</h2>
            <p>
              ArriveLink is a booking platform that connects travelers with independent transport operators. We do not operate buses or provide transport services directly. We facilitate seat reservations and payments between travelers and operators.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">3. Bookings & Payments</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>When you reserve a seat, it is held for 15 minutes while you complete payment.</li>
              <li>If payment is not completed within the reservation window, your booking expires and the seat is released.</li>
              <li>A non-refundable convenience fee of ₦200 is charged per transaction.</li>
              <li>All payments are processed securely through Paystack.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">4. Cancellations</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may cancel a reserved (unpaid) booking at any time.</li>
              <li>Excessive cancellations (3 or more in succession) may result in a temporary booking cooldown.</li>
              <li>Paid bookings cannot be cancelled through the platform. Contact the operator directly for refund requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">5. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account. You must provide accurate information during registration. We reserve the right to suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">6. Operator Responsibility</h2>
            <p>
              Transport operators are independent businesses. ArriveLink is not responsible for delays, cancellations, vehicle conditions, or any issues arising from the transport service itself. Disputes between travelers and operators should be raised through the Platform&apos;s dispute mechanism.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>
              ArriveLink is provided &quot;as is&quot;. We are not liable for any direct, indirect, or consequential damages arising from your use of the Platform or the transport services booked through it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-2">8. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance.
            </p>
          </section>
        </div>

        </div>

        {/* Footer links */}
        <div className="mt-10 pt-6 border-t border-mist dark:border-white/5 flex items-center justify-center gap-6 text-xs text-foreground/40 font-body">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
