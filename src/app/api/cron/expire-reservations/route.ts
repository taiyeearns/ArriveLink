import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Never cache; this must run fresh on every scheduler hit.
export const dynamic = 'force-dynamic';

/**
 * Timeout sweep endpoint.
 *
 * Expires RESERVED bookings past their 15-minute payment window and returns the
 * held seats. Invoked by an external scheduler (cron-job.org) rather than
 * pg_cron, which needs a paid Supabase plan.
 *
 * Protected by a shared secret: the scheduler must send
 *   Authorization: Bearer <CRON_SECRET>
 * Both GET and POST are accepted so it works with any scheduler config.
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('expire_stale_reservations');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, expired: data ?? 0 });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
