'use client';

import { useState } from 'react';
import Link from 'next/link';
import { joinWaitlist } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function WaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const result = await joinWaitlist(formData);

    if (result.error === 'already_joined') {
      setStatus('already');
    } else if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('success');
    }
  }

  // ── Success: WhatsApp group + home button ──
  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-forest dark:text-white mb-3">You are on the list!</h2>
        <p className="text-forest/55 dark:text-white/50 font-body text-base max-w-md mx-auto mb-8">
          We will notify you as soon as booking goes live on 10 December. Join our WhatsApp community to stay updated and connect with other travelers.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {/* WhatsApp Group */}
          <a
            href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white rounded-xl font-body font-bold text-base hover:bg-[#20BD5A] transition-all shadow-md active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Join WhatsApp Group
          </a>

          {/* Create account prompt */}
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-forest text-white rounded-xl font-body font-bold text-base hover:bg-pine transition-all shadow-md active:scale-[0.98]"
          >
            Create an Account
          </Link>

          {/* Home */}
          <Link
            href="/landing"
            className="text-sm font-body font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            Go to home page
          </Link>
        </div>
      </div>
    );
  }

  // ── Already joined ──
  if (status === 'already') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-forest dark:text-white mb-3">You are already on the waitlist!</h2>
        <p className="text-forest/55 dark:text-white/50 font-body text-base max-w-md mx-auto mb-6">
          Sit tight - we will let you know when booking opens on 10 December.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <a
            href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white rounded-xl font-body font-bold text-base hover:bg-[#20BD5A] transition-all shadow-md active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Join WhatsApp Group
          </a>
          <Link
            href="/landing"
            className="text-sm font-body font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            Go to home page
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Full name"
        name="name"
        type="text"
        placeholder="Your full name"
        required
        autoComplete="name"
      />

      <Input
        label="Email address"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Phone number (optional)"
        name="phone"
        type="tel"
        placeholder="08012345678"
        autoComplete="tel"
      />

      {/* Preferred route */}
      <div>
        <label htmlFor="preferred_route" className="block text-sm font-body font-medium text-forest dark:text-white mb-2">
          Where are you travelling? (optional)
        </label>
        <input
          id="preferred_route"
          name="preferred_route"
          type="text"
          placeholder="e.g. Lagos to Benin"
          className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-bg text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald transition-colors placeholder:text-foreground/30"
        />
      </div>

      {/* Preferred date */}
      <div>
        <label htmlFor="travel_date" className="block text-sm font-body font-medium text-forest dark:text-white mb-2">
          When do you want to travel? (optional)
        </label>
        <input
          id="travel_date"
          name="travel_date"
          type="date"
          min="2026-12-10"
          className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-bg text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald transition-colors"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-error font-body">{errorMsg}</p>
      )}

      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full"
        size="lg"
      >
        {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
      </Button>
    </form>
  );
}
