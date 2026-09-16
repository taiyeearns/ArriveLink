import { getOperatorsForSettlement } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettleButton } from './settle-button';

export const dynamic = 'force-dynamic';

export default async function SettlementPage() {
  const operators = await getOperatorsForSettlement();

  const totalPending = operators.reduce((sum, op) => sum + op.pending_balance, 0);
  const totalSettled = operators.reduce((sum, op) => sum + op.available_balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-foreground/40 mb-1">Financial Management</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Settlements</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-amber-600 font-body mb-1">Pending Settlement</p>
            <p className="font-display text-2xl font-bold text-amber-700">₦{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald/5 to-emerald/10 border-emerald/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-emerald font-body mb-1">Total Settled</p>
            <p className="font-display text-2xl font-bold text-foreground">₦{totalSettled.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Operator list */}
      <div>
        <p className="font-label text-foreground/40 mb-3">Operators</p>

        {operators.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-foreground/50 font-body">No operators with wallet activity.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {operators.map((op) => (
              <Card key={op.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">{op.business_name}</p>
                      <Badge variant="live" className="mt-1">{op.status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm font-body mb-3">
                    <div className="p-2.5 rounded-lg bg-amber-50">
                      <p className="text-xs text-amber-600">Pending</p>
                      <p className="font-semibold text-amber-700">₦{op.pending_balance.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald/5">
                      <p className="text-xs text-emerald">Settled</p>
                      <p className="font-semibold text-foreground">₦{op.available_balance.toLocaleString()}</p>
                    </div>
                  </div>

                  {op.pending_balance > 0 && (
                    <SettleButton operatorId={op.id} pendingBalance={op.pending_balance} operatorName={op.business_name} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
