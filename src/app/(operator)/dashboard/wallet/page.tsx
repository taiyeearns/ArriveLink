import { getMyWallet, getWalletTransactions } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function OperatorWalletPage() {
  const wallet = await getMyWallet();
  const transactions = await getWalletTransactions();

  const pending = wallet ? Number(wallet.pending_balance) : 0;
  const available = wallet ? Number(wallet.available_balance) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-foreground/40 mb-1">Earnings</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-forest to-pine text-white border-0">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-white/60 font-body mb-1">Available Balance</p>
            <p className="font-display text-3xl font-bold">₦{available.toLocaleString()}</p>
            <p className="text-xs text-white/50 font-body mt-2">Settled and ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-foreground/40 font-body mb-1">Pending Settlement</p>
            <p className="font-display text-3xl font-bold text-foreground">₦{pending.toLocaleString()}</p>
            <p className="text-xs text-foreground/40 font-body mt-2">Awaiting admin settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Total earnings */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/40 font-body">Total Earned</p>
              <p className="font-display text-xl font-bold text-foreground">
                ₦{(pending + available).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <div>
        <p className="font-label text-foreground/40 mb-3">Recent Earnings</p>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-foreground/50 font-body">No earnings yet. Earnings appear when travelers pay for bookings.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => {
              const route = tx.route as any;
              const amount = Number(route?.fare || 0) * tx.seats_requested;

              return (
                <Card key={tx.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground font-body">
                            {route?.general_route?.origin_city} → {route?.general_route?.destination_city}
                          </p>
                          <p className="text-xs text-foreground/40 font-body">
                            {tx.traveler?.name || 'Traveler'} · {tx.seats_requested} seat{tx.seats_requested !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald font-body">
                          +₦{amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-foreground/40 font-body">
                          {tx.paid_at ? new Date(tx.paid_at).toLocaleDateString('en-NG', {
                            month: 'short', day: 'numeric',
                          }) : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
