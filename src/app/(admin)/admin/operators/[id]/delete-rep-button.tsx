'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOperatorRep } from '../actions';

interface DeleteRepButtonProps {
  repId: string;
  userId: string;
  operatorId: string;
  repName: string;
}

export function DeleteRepButton({ repId, userId, operatorId, repName }: DeleteRepButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Remove ${repName}? This will delete their account permanently.`)) {
      return;
    }

    setLoading(true);
    const result = await deleteOperatorRep(repId, userId, operatorId);

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors font-body cursor-pointer disabled:opacity-50"
    >
      {loading ? 'Removing...' : 'Remove'}
    </button>
  );
}
