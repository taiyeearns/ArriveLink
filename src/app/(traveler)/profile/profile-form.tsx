'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateMyProfile } from './actions';

interface ProfileFormProps {
  name: string;
  phone: string;
  email: string;
}

export function ProfileForm({ name, phone, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateMyProfile(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        defaultValue={name}
        placeholder="Your name"
      />

      <Input
        label="Phone Number"
        name="phone"
        defaultValue={phone}
        placeholder="080XXXXXXXX"
        type="tel"
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-gray-400">Email</label>
        <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-pine/10 border border-transparent dark:border-pine/20 text-sm text-gray-500 dark:text-emerald font-body">
          {email}
        </p>
        <p className="text-xs text-gray-400 font-body">Email cannot be changed</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/5">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-body">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald/5 border border-emerald/20">
          <p className="text-sm text-emerald dark:text-lime font-body">Profile updated!</p>
        </div>
      )}

      <Button type="submit" loading={loading}>
        Save Changes
      </Button>
    </form>
  );
}
