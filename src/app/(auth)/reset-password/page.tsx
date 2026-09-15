'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supabase sends the user here with a hash fragment containing the access token.
  // The Supabase client auto-detects this and establishes a session.
  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event which fires when the reset link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if user is already authenticated (e.g. page was refreshed)
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSessionReady(true);
      }
    });

    // If no session detected after a few seconds, show error
    const timeout = setTimeout(() => {
      setSessionReady((ready) => {
        if (!ready) setSessionError(true);
        return ready;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Sign out so the user logs in fresh with their new password
      await supabase.auth.signOut();
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-mist dark:bg-pine/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Password updated
          </h2>
          <p className="text-sm text-foreground/60 font-body mb-6">
            Your password has been changed. You can now log in with your new password.
          </p>
          <Link href="/login">
            <Button className="w-full">Log In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (sessionError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Invalid or expired link
          </h2>
          <p className="text-sm text-foreground/60 font-body mb-6">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button variant="secondary" className="w-full">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!sessionReady) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-mist dark:bg-pine/20 rounded-xl w-48 mx-auto" />
            <div className="h-4 bg-mist dark:bg-pine/20 rounded-lg w-64 mx-auto" />
            <div className="h-12 bg-mist dark:bg-pine/20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Set new password
          </h1>
          <p className="text-sm text-foreground/60 font-body mt-2">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            hint="At least 6 characters"
          />

          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-body">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-mist dark:bg-pine/20 rounded-xl w-48 mx-auto" />
            <div className="h-4 bg-mist dark:bg-pine/20 rounded-lg w-64 mx-auto" />
            <div className="h-12 bg-mist dark:bg-pine/20 rounded-xl" />
            <div className="h-12 bg-mist dark:bg-pine/20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
