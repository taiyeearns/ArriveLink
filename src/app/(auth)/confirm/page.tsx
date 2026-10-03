'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(5);

  const loginUrl = `/login?verified=true${email ? `&email=${encodeURIComponent(email)}` : ''}`;

  useEffect(() => {
    if (countdown <= 0) {
      router.push(loginUrl);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router, loginUrl]);

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-mist dark:bg-pine/20 flex items-center justify-center mx-auto mb-5 text-emerald">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Email Confirmed!
        </h1>

        <p className="text-sm text-foreground/60 font-body mb-6 max-w-sm mx-auto">
          Your email has been verified successfully. Your ArriveLink traveler account is now active.
        </p>

        <p className="text-xs text-foreground/40 font-body mb-6">
          Redirecting you to log in in <span className="font-semibold text-foreground">{countdown}s</span>...
        </p>

        <div className="flex flex-col gap-3">
          <Link href={loginUrl} className="w-full">
            <Button className="w-full" size="lg">
              Proceed to Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 rounded-full bg-mist dark:bg-pine/20 mx-auto" />
              <div className="h-6 bg-mist dark:bg-pine/20 rounded-lg w-48 mx-auto" />
              <div className="h-4 bg-mist dark:bg-pine/20 rounded-lg w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
