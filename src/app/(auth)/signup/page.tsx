'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: 'traveler', // Only travelers can self-register
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

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
            Check your email
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6">
            We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
            Click it to activate your account.
          </p>
          <Button variant="secondary" onClick={() => router.push('/login')}>
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-2">
            Start booking verified transport across Nigeria
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <Input
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

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
            label="Phone number"
            type="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="Nigerian phone number"
            autoComplete="tel"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            hint="At least 6 characters"
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-body">{error}</p>
            </div>
          )}

          {/* Terms agreement */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-foreground dark:accent-emerald focus:ring-emerald accent-forest cursor-pointer"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">
              By signing up, I agree that I have read and understood the{' '}
              <Link href="/terms" target="_blank" className="text-foreground font-medium hover:text-pine dark:hover:text-lime transition-colors underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="text-foreground font-medium hover:text-pine dark:hover:text-lime transition-colors underline">
                Privacy Policy
              </Link>.
            </span>
          </label>

          <Button
            type="submit"
            loading={loading}
            disabled={!agreed}
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-body mt-6">
          Already have an account?{' '}
            <Link href="/login" className="text-foreground font-semibold hover:text-pine dark:hover:text-lime transition-colors">
              Log in
            </Link>
        </p>
      </CardContent>
    </Card>
  );
}
