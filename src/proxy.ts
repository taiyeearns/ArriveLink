import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/callback', '/api', '/about', '/terms', '/privacy', '/landing', '/onboarding', '/search'];

// Role home dashboard path
const ROLE_HOME: Record<string, string> = {
  traveler: '/',
  operator_rep: '/dashboard',
  admin: '/admin',
};

// Role allowed URL prefixes
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  traveler: ['/', '/search', '/booking', '/payment', '/ticket', '/history', '/profile'],
  operator_rep: ['/dashboard'],
  admin: ['/admin'],
};

/**
 * Get the user's role from their JWT metadata.
 * This is synchronous and avoids a slow database fetch on every request.
 */
function getUserRole(user: any): string | null {
  if (!user) return null;
  return user.user_metadata?.role || 'traveler';
}

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Root "/" is special: unauthenticated -> landing, authenticated -> role home
  if (pathname === '/') {
    if (!user) {
      // Rewrite to landing page (URL stays as /)
      return NextResponse.rewrite(new URL('/landing', request.url));
    }

    const role = getUserRole(user);
    if (!role) {
      console.log(`[proxy] User ${user.id} role evaluates to null on / -> rewriting to landing`);
      return NextResponse.rewrite(new URL('/landing', request.url));
    }

    // Non-travelers go to their dashboard
    if (role !== 'traveler') {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }

    // Traveler stays on / (the app home)
    return supabaseResponse;
  }

  // Allow public routes.
  // The payment verify route (/payment/[bookingId]/verify) is intentionally public.
  // Paystack redirects here from an external site, so the session may not be present on
  // the first request. The page needs no user session: it works off the Paystack
  // reference via the admin client and is idempotent (the webhook also finalizes the
  // booking). Gating it would bounce a just-paid user to login and drop the reference.
  const isPaymentVerifyRoute = /^\/payment\/[^/]+\/verify$/.test(pathname);
  const isPublicRoute = isPaymentVerifyRoute || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages (login/signup only)
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      const role = getUserRole(user);
      if (role) {
        const home = ROLE_HOME[role] || '/';
        return NextResponse.redirect(new URL(home, request.url));
      }
    }
    return supabaseResponse;
  }

  // Not logged in -> login (preserve the full path + query so re-login returns to the exact URL)
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Get role
  const role = getUserRole(user);

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'no_profile');
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] || [];

  // Check if the current path starts with any allowed prefix
  const isAllowed = allowedPrefixes.some((prefix) => {
    if (prefix === '/') return false; // Already handled above
    return pathname.startsWith(prefix);
  });

  if (!isAllowed) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icon-.*\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
