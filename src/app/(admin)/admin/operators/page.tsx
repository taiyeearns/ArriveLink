import { getOperators } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CreateOperatorForm } from './create-form';

export const dynamic = 'force-dynamic';

export default async function AdminOperatorsPage() {
  const operators = await getOperators();

  const statusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'live' as const;
      case 'suspended': return 'muted' as const;
      default: return 'muted' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-label text-gray-400 mb-1">Management</p>
          <h1 className="font-display text-2xl font-bold text-foreground">Operators</h1>
          <p className="text-sm text-gray-500 font-body mt-1">
            {operators.length} operator{operators.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <CreateOperatorForm />
      </div>

      {/* Operators list */}
      {operators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">No operators yet</h2>
            <p className="text-sm text-gray-500 font-body">
              Create your first transport operator to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {operators.map((op) => (
            <Link key={op.id} href={`/admin/operators/${op.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                        <span className="font-display text-sm font-bold text-foreground">
                          {op.business_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-semibold text-foreground">
                          {op.business_name}
                        </h3>
                        <p className="text-xs text-gray-400 font-body">
                          Onboarded {new Date(op.onboarded_at).toLocaleDateString('en-NG', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant(op.status)}>
                        {op.status}
                      </Badge>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
