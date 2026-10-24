import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent } from '@/components/ui/card';


export const dynamic = 'force-dynamic';

async function getFinanceData() {
  const admin = createAdminClient();
  const [paymentsRes, walletsRes, settlementsRes] = await Promise.all([
    admin.from('payments').select('fare_amount, convenience_fee, created_at, booking_id, status').eq('status', 'paid').order('created_at', { ascending: false }).limit(200),
    admin.from('wallets').select('available_balance, pending_balance, total_earned, operator_id'),
    admin.from('settlements').select('id, total_amount, net_amount, platform_fee, status, created_at, operator_id').order('created_at', { ascending: false }).limit(100),
  ]);

  const payments = paymentsRes.data || [];
  const wallets = walletsRes.data || [];
  const settlements = settlementsRes.data || [];

  const grossVolume = payments.reduce((s: number, p: any) => s + Number(p.fare_amount || 0), 0);
  const revenue = payments.reduce((s: number, p: any) => s + Number(p.convenience_fee || 0), 0);
  const pendingSettlement = wallets.reduce((s: number, w: any) => s + Number(w.pending_balance || 0), 0);
  const totalSettled = settlements
    .filter((s: any) => s.status === 'paid')
    .reduce((sum: number, s: any) => sum + Number(s.net_amount || 0), 0);

  // Fetch operator names for settlements
  const operatorIds = [...new Set(settlements.map((s: any) => s.operator_id).filter(Boolean))];
  let operatorNames: Record<string, string> = {};
  if (operatorIds.length > 0) {
    const { data: ops } = await admin.from('operators').select('id, business_name').in('id', operatorIds as string[]);
    if (ops) operatorNames = Object.fromEntries(ops.map((o: any) => [o.id, o.business_name]));
  }
  const settlementsWithNames = settlements.map((s: any) => ({ ...s, operatorName: operatorNames[s.operator_id] || 'Unknown' }));

  return { grossVolume, revenue, pendingSettlement, totalSettled, totalWallets: wallets.length, recentPayments: payments.slice(0, 50), recentSettlements: settlementsWithNames.slice(0, 20) };
}

function StatCard({ label, value, sub, color = 'text-forest' }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="font-label text-foreground/40 text-xs mb-2">{label}</p>
        <p className={['font-display text-2xl font-bold', color].join(' ')}>{value}</p>
        {sub && <p className="text-xs text-foreground/40 font-body mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminFinancePage() {
  const data = await getFinanceData();
  const fmt = (n: number) => '\u20a6' + n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      <div>
        <p className="font-label text-foreground/40 mb-1">Finance</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Revenue and Finance</h1>
        <p className="text-sm text-foreground/50 font-body mt-1">All money processed through ArriveLink - revenue, settlements, and transaction history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross Volume" value={fmt(data.grossVolume)} sub="Total passenger payments" color="text-forest" />
        <StatCard label="Platform Revenue" value={fmt(data.revenue)} sub="1% convenience fee earned" color="text-emerald" />
        <StatCard label="Pending Settlement" value={fmt(data.pendingSettlement)} sub={data.totalWallets + ' operator wallets'} color="text-amber-600" />
        <StatCard label="Total Settled" value={fmt(data.totalSettled)} sub="Paid out to operators" color="text-pine" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Transaction Inflow</h2>
          <span className="text-xs text-foreground/40 font-body">{data.recentPayments.length} recent payments</span>
        </div>
        {data.recentPayments.length === 0 ? (
          <Card><CardContent className="py-10 text-center"><p className="text-sm text-foreground/50 font-body">No payments yet.</p></CardContent></Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mist">
                    <th className="text-left py-3 px-4 font-label text-xs text-foreground/40">Date</th>
                    <th className="text-right py-3 px-4 font-label text-xs text-foreground/40">Amount Paid</th>
                    <th className="text-right py-3 px-4 font-label text-xs text-foreground/40">Our Fee (1%)</th>
                    <th className="text-left py-3 px-4 font-label text-xs text-foreground/40">Booking ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-mist/50 hover:bg-mist/20 transition-colors">
                      <td className="py-3 px-4 text-sm font-body text-foreground/70">{fmtDate(p.created_at)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-right font-body text-foreground">{fmt(Number(p.fare_amount))}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-right font-body text-emerald">{fmt(Number(p.convenience_fee))}</td>
                      <td className="py-3 px-4 text-xs text-foreground/40 font-body font-mono">{p.booking_id ? p.booking_id.slice(0, 8) + '...' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-forest/20 bg-forest/5">
                    <td className="py-3 px-4 text-sm font-bold text-foreground font-body">Total</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-foreground font-body">{fmt(data.grossVolume)}</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-emerald font-body">{fmt(data.revenue)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Settlement History</h2>
          <span className="text-xs text-foreground/40 font-body">{data.recentSettlements.length} records</span>
        </div>
        {data.recentSettlements.length === 0 ? (
          <Card><CardContent className="py-10 text-center"><p className="text-sm text-foreground/50 font-body">No settlements yet.</p></CardContent></Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mist">
                    <th className="text-left py-3 px-4 font-label text-xs text-foreground/40">Date</th>
                    <th className="text-left py-3 px-4 font-label text-xs text-foreground/40">Operator</th>
                    <th className="text-right py-3 px-4 font-label text-xs text-foreground/40">Amount</th>
                    <th className="text-left py-3 px-4 font-label text-xs text-foreground/40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSettlements.map((s: any) => (
                    <tr key={s.id} className="border-b border-mist/50 hover:bg-mist/20 transition-colors">
                      <td className="py-3 px-4 text-sm font-body text-foreground/70">{fmtDate(s.created_at)}</td>
                      <td className="py-3 px-4 text-sm font-body text-foreground">{s.operatorName}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-right font-body text-foreground">{fmt(Number(s.net_amount))}</td>
                      <td className="py-3 px-4">
                        <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-body', s.status === 'paid' ? 'bg-emerald/10 text-emerald' : s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'].join(' ')}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

