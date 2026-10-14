'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export function AdminTicketFilters({ currentStatus }: { currentStatus: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <Link
          key={s.value}
          href={`/admin/support${s.value !== 'all' ? `?status=${s.value}` : ''}`}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors
            ${currentStatus === s.value
              ? 'bg-forest text-white'
              : 'bg-muted-bg dark:bg-white/5 text-foreground/50 hover:text-foreground'
            }
          `}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
