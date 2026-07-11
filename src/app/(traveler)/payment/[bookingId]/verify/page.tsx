import { verifyPayment } from '../../actions';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ reference?: string | string[]; trxref?: string | string[] }>;
}

export default async function PaymentVerifyPage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const sp = await searchParams;

  // Handle both string and array values (Paystack can cause duplicate params)
  const rawRef = sp.reference || sp.trxref;
  const ref = Array.isArray(rawRef) ? rawRef[0] : rawRef;

  if (!ref) {
    redirect(`/payment/${bookingId}`);
  }

  // Check if booking is already paid/ticketed (avoid re-verification)
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single();

  const alreadyPaid = booking && ['PAID', 'TICKET_ISSUED', 'BOARDED', 'COMPLETED'].includes(booking.status);

  // Only verify if not already processed
  const result = alreadyPaid ? { success: true, bookingId } : await verifyPayment(ref);

  if (result.error) {
    return (
      <div className="space-y-5">
        <Card>
          <CardContent className="py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-sm text-gray-500 font-body mb-6">{result.error}</p>

            <div className="flex flex-col gap-2">
              <Link href={`/payment/${bookingId}`}>
                <button className="w-full px-5 py-3 bg-forest dark:bg-emerald text-white rounded-xl font-body text-sm font-medium hover:bg-pine dark:hover:bg-lime transition-colors cursor-pointer">
                  Try Again
                </button>
              </Link>
              <Link href="/history">
                <button className="w-full px-5 py-3 bg-gray-100 dark:bg-dark-surface dark:border dark:border-white/5 text-foreground rounded-xl font-body text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  Back to Bookings
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="shadow-lg border-0">
        <CardContent className="py-10 text-center">
          {/* Success animation */}
          <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-5 animate-bounce">
            <div className="w-14 h-14 rounded-full bg-emerald/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-sm text-gray-500 font-body mb-1">
            Your booking has been confirmed and paid.
          </p>
          <p className="text-xs text-gray-400 font-body mb-6">
            Reference: {ref}
          </p>

          <div className="flex flex-col gap-2">
            <Link href="/history">
              <button className="w-full px-5 py-3 bg-forest dark:bg-emerald text-white rounded-xl font-body text-sm font-medium hover:bg-pine dark:hover:bg-lime transition-colors cursor-pointer">
                View My Bookings
              </button>
            </Link>
            <Link href="/">
              <button className="w-full px-5 py-3 bg-gray-100 dark:bg-dark-surface dark:border dark:border-white/5 text-foreground rounded-xl font-body text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/5 transition-colors cursor-pointer">
                Search More Routes
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
