import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

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
          // Traveler: sign out and redirect to confirm page so they see confirmation and can log in cleanly
          await supabase.auth.signOut();
          const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
          return NextResponse.redirect(`${origin}/confirm${emailParam}`);
        }
      }

      if (next && next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(`${origin}/confirm`);
    }
  }

  // Auth code error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
