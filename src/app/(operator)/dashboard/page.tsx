import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  let operatorName = 'Operator';
  let operatorId: string | null = null;
  let routeCount = 0;
  let bookingCount = 0;

  if (user) {
    // Get the operator via rep relationship (using admin client to bypass RLS)
    const { data: rep } = await adminSupabase
      .from('operator_reps')
      .select('operator_id')
      .eq('user_id', user.id)
      .single();

    if (rep?.operator_id) {
      operatorId = rep.operator_id;

      const { data: operator } = await adminSupabase
        .from('operators')
        .select('business_name')
        .eq('id', operatorId)
        .single();

      if (operator?.business_name) {
        operatorName = operator.business_name;
      }

      // Get route count
      const { count: rc } = await adminSupabase
        .from('routes')
        .select('id', { count: 'exact', head: true })
        .eq('operator_id', operatorId);
      routeCount = rc ?? 0;

      // Get booking count for today
      const today = new Date().toISOString().split('T')[0];
      const { count: bc } = await adminSupabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('route_id', 
          (await adminSupabase
            .from('routes')
            .select('id')
            .eq('operator_id', operatorId)
          ).data?.map(r => r.id) || []
        )
        .gte('created_at', today);
      bookingCount = bc ?? 0;
    }
  }

  const stats = [
    { label: 'Active Routes', value: routeCount.toString(), color: 'bg-emerald/10 text-emerald' },
    { label: "Today's Bookings", value: bookingCount.toString(), color: 'bg-mist text-pine dark:bg-white/5 dark:text-lime' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-label text-foreground/40 mb-1">Operator Dashboard</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {operatorName}
          </h1>
        </div>
        <Badge variant="live">Live</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="font-label text-foreground/40 mb-2">{stat.label}</p>
              <p className={`font-display text-3xl font-bold ${stat.color} inline-block px-3 py-1 rounded-xl`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      {!operatorId && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-foreground/50 font-body">
              Your account is not linked to an operator. Contact your administrator.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
