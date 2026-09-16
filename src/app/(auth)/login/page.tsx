'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const type = searchParams.get('type');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Role-scoped enforcement: each login surface only accepts its intended role.
      // type=admin bypasses this check (admin login is unlinked and internal-only).
      const accountRole = authData.user?.user_metadata?.role || 'traveler';
      if (type === 'traveler' && accountRole !== 'traveler') {
        await supabase.auth.signOut();
        setError("This account isn't registered as a traveler.");
        setLoading(false);
        return;
      }
      if (type === 'operator' && accountRole !== 'operator_rep') {
        await supabase.auth.signOut();
        setError("This account isn't registered as an operator.");
        setLoading(false);
        return;
      }
      if (type === 'admin' && accountRole !== 'admin') {
        await supabase.auth.signOut();
        setError("This account doesn't have admin access.");
        setLoading(false);
        return;
      }

      // After successful login, navigate to root.
      // The proxy (server-side) handles role-based redirection.
      const destination = redirect || '/';
      router.push(destination);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-foreground/50 dark:text-foreground/40 font-body mt-2">
            Sign in to your ArriveLink account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {type !== 'admin' && (
            <div className="text-right -mt-2">
              <Link
                href="/forgot-password"
                className="text-sm font-body text-foreground/60 hover:text-pine dark:hover:text-lime transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Log In
          </Button>
        </form>

        {type === 'admin' ? (
          <p className="text-center text-xs text-foreground/40 dark:text-foreground/50 font-body mt-6">
            Internal access only.
          </p>
        ) : type === 'operator' ? (
          <p className="text-center text-sm text-foreground/50 dark:text-foreground/40 font-body mt-6">
            Want to become an operator?{' '}
            <a href="mailto:support@arrivelink.com" className="text-foreground font-semibold hover:text-pine dark:hover:text-lime transition-colors">
              Contact us
            </a>
          </p>
        ) : (
          <p className="text-center text-sm text-foreground/50 dark:text-foreground/40 font-body mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-foreground font-semibold hover:text-pine dark:hover:text-lime transition-colors">
              Create one
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted-bg rounded-xl w-48 mx-auto" />
            <div className="h-4 bg-muted-bg rounded-lg w-64 mx-auto" />
            <div className="h-12 bg-muted-bg rounded-xl" />
            <div className="h-12 bg-muted-bg rounded-xl" />
            <div className="h-12 bg-forest/20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}
