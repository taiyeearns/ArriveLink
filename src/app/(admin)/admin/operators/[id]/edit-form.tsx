'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateOperator } from '../actions';

interface EditOperatorFormProps {
  operator: {
    id: string;
    business_name: string;
    status: string;
  };
}

export function EditOperatorForm({ operator }: EditOperatorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateOperator(operator.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Operator updated successfully');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Business Name"
        name="business_name"
        defaultValue={operator.business_name}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-foreground">
          Status
        </label>
        <select
          name="status"
          defaultValue={operator.status}
          className="w-full px-4 py-3 rounded-xl border border-mist font-body text-base text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine transition-all duration-200"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error-bg border border-error-border">
          <p className="text-sm text-error font-body">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-mist border border-emerald/20">
          <p className="text-sm text-pine font-body">{success}</p>
        </div>
      )}

      <Button type="submit" loading={loading} size="sm">
        Save Changes
      </Button>
    </form>
  );
}
