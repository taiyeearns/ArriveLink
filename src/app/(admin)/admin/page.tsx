import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [operatorsRes, routesRes, bookingsRes, usersRes, disputesRes, walletsRes] = await Promise.all([
    supabase.from('operators').select('id', { count: 'exact', head: true }),
    supabase.from('general_routes').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('disputes').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    supabase.from('wallets').select('pending_balance'),
  ]);

  const totalPending = (walletsRes.data || []).reduce((sum: number, w: any) => sum + Number(w.pending_balance), 0);

  const stats = [
    { label: 'Total Users', value: usersRes.count ?? 0, href: null, color: 'text-pine' },
    { label: 'Operators', value: operatorsRes.count ?? 0, href: '/admin/operators', color: 'text-pine' },
    { label: 'Route Corridors', value: routesRes.count ?? 0, href: '/admin/routes', color: 'text-pine' },
    { label: 'Bookings', value: bookingsRes.count ?? 0, href: '/admin/bookings', color: 'text-pine' },
    { label: 'Open Disputes', value: disputesRes.count ?? 0, href: '/admin/disputes', color: 'text-error' },
    { label: 'Pending Settlement', value: `₦${totalPending.toLocaleString()}`, href: '/admin/settlement', color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-label text-foreground/40 mb-1">Admin Dashboard</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const card = (
            <Card key={stat.label} className={stat.href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
              <CardContent className="py-5">
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-foreground/50 font-body mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>{card}</Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Manage Operators</h3>
              <p className="text-xs text-foreground/50 font-body mb-4">Create operator accounts and rep credentials.</p>
              <Link href="/admin/operators">
                <Button size="sm" variant="secondary">Go to Operators →</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Settle Funds</h3>
              <p className="text-xs text-foreground/50 font-body mb-4">Move pending earnings to operator available balance.</p>
              <Link href="/admin/settlement">
                <Button size="sm" variant="secondary">Go to Settlements →</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Resolve Disputes</h3>
              <p className="text-xs text-foreground/50 font-body mb-4">Review and resolve traveler complaints.</p>
              <Link href="/admin/disputes">
                <Button size="sm" variant="secondary">Go to Disputes →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
