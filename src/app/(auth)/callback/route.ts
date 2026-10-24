import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAdminNewUserEmail } from '@/lib/email';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const redirect = searchParams.get('redirect');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user role to redirect to the correct dashboard
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile?.role === 'operator_rep') {
          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          // New traveler signup - notify admin (non-fatal)
          try {
            const admin = createAdminClient();
            const { data: fullProfile } = await admin
              .from('users')
              .select('name, email, role, created_at')
              .eq('id', user.id)
              .single();
            // Only notify on first-time confirmation (within 5 minutes of account creation)
            if (fullProfile) {
              const createdAt = fullProfile.created_at ? new Date(fullProfile.created_at) : null;
              const isNew = createdAt && (Date.now() - createdAt.getTime()) < 5 * 60 * 1000;
              if (isNew) {
                await sendAdminNewUserEmail({
                  userName: fullProfile.name || user.email?.split('@')[0] || 'New User',
                  userEmail: fullProfile.email || user.email || '',
                  role: fullProfile.role || 'traveler',
                });
              }
            }
          } catch { /* non-fatal */ }

          // Traveler: sign out and redirect to confirm page so they see confirmation and can log in cleanly
          await supabase.auth.signOut();
          const params = new URLSearchParams();
          if (user.email) params.set('email', user.email);
          if (redirect) params.set('redirect', redirect);
          const qs = params.toString();
          return NextResponse.redirect(`${origin}/confirm${qs ? `?${qs}` : ''}`);
        }
      }

      if (next && next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(`${origin}/confirm${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`);
    }
  }

  // Auth code error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`);
}
