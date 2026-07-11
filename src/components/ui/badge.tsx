import type { ReactNode } from 'react';

type BadgeVariant = 'verified' | 'live' | 'muted' | 'location' | 'status';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  verified:
    'border border-emerald text-pine bg-mist dark:bg-emerald/10 dark:text-emerald dark:border-emerald/20',
  live:
    'text-emerald bg-emerald/10 border border-emerald/20',
  muted:
    'text-gray-400 bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-white/5',
  location:
    'text-foreground bg-white dark:bg-dark-surface border border-forest/20 dark:border-white/5',
  status:
    'text-foreground dark:text-emerald bg-mist dark:bg-pine/10 border border-pine/20 dark:border-pine/30',
};

function Badge({ variant = 'status', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
        text-xs font-medium font-body whitespace-nowrap
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {variant === 'verified' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
