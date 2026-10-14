'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkPasswordChanged, changeOperatorPassword } from './password-actions';

export function PasswordChangeModal() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkPasswordChanged().then((changed) => {
      if (!changed) setShow(true);
    });
  }, []);

  if (!show) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await changeOperatorPassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setShow(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald/10 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Change Your Password</h2>
          <p className="text-sm text-foreground/50 font-body mt-1">
            For security, please set a new password on your first login. You were given a temporary password by the admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-error-bg border border-error-border">
              <p className="text-sm text-error font-body">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Set Password
          </Button>

          <p className="text-[10px] text-foreground/40 font-body text-center">
            After this, password changes require contacting support.
          </p>
        </form>
      </div>
    </div>
  );
}
