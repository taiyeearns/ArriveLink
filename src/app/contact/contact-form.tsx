'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitContactForm } from './actions';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-forest dark:text-white mb-3">Message sent!</h2>
        <p className="text-forest/55 dark:text-white/50 font-body text-base max-w-sm">
          We have received your message and will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" name="name" placeholder="Emeka Okonkwo" required />
        <Input label="Email Address" name="email" type="email" placeholder="emeka@example.com" required />
      </div>

      <Input label="Company Name (optional)" name="company" placeholder="e.g. ABC Transport Ltd" />

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-foreground">Subject</label>
        <select
          name="subject"
          className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-surface text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine"
        >
          <option value="List my transport company">List my transport company</option>
          <option value="Partnership enquiry">Partnership enquiry</option>
          <option value="General question">General question</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-foreground">Message</label>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us about your company, routes, and how we can help..."
          className="w-full px-4 py-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-dark-surface text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine resize-none"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error-bg border border-error-border">
          <p className="text-sm text-error font-body">{error}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Send Message
      </Button>
    </form>
  );
}
