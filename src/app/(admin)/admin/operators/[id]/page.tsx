import { getOperator, getOperatorReps } from '../actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { EditOperatorForm } from './edit-form';
import { CreateRepForm } from './create-rep-form';
import { DeleteRepButton } from './delete-rep-button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OperatorDetailPage({ params }: Props) {
  const { id } = await params;
  const [operator, reps] = await Promise.all([
    getOperator(id),
    getOperatorReps(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-body">
        <Link href="/admin/operators" className="text-foreground/40 hover:text-foreground transition-colors">
          Operators
        </Link>
        <svg className="w-3.5 h-3.5 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{operator.business_name}</span>
      </div>

      {/* Operator info */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center">
            <span className="font-display text-xl font-bold text-foreground">
              {operator.business_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {operator.business_name}
            </h1>
            <p className="text-sm text-foreground/50 font-body">
              Onboarded {new Date(operator.onboarded_at).toLocaleDateString('en-NG', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <Badge variant={operator.status === 'active' ? 'live' : 'muted'}>
          {operator.status}
        </Badge>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-foreground">
            Operator Details
          </h2>
        </CardHeader>
        <CardContent>
          <EditOperatorForm operator={operator} />
        </CardContent>
      </Card>

      {/* Reps section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                Representatives
              </h2>
              <p className="text-xs text-foreground/50 font-body mt-0.5">
                {reps.length} rep{reps.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
            <CreateRepForm operatorId={id} />
          </div>
        </CardHeader>
        <CardContent>
          {reps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-foreground/40 font-body">
                No representatives yet. Add one so they can manage routes and bookings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reps.map((rep: any) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-mist bg-muted-bg/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pine/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-pine">
                        {(rep.user?.name || 'R').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">
                        {rep.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-foreground/40 font-body">
                        {rep.email || rep.user?.email}
                        {rep.phone && ` · ${rep.phone}`}
                      </p>
                    </div>
                  </div>
                  <DeleteRepButton
                    repId={rep.id}
                    userId={rep.user_id}
                    operatorId={id}
                    repName={rep.user?.name || 'this rep'}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
