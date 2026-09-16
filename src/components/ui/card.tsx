import type { HTMLAttributes, ReactNode } from 'react';

// --------------------------------------------------------------------------
// Card container
// --------------------------------------------------------------------------

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tinted?: boolean;
  children: ReactNode;
}

function Card({ tinted = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-mist dark:border-white/5 shadow-sm
        ${tinted ? 'bg-mist dark:bg-emerald/10' : 'bg-white dark:bg-dark-surface'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// --------------------------------------------------------------------------
// Card sub-components
// --------------------------------------------------------------------------

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 pt-6 pb-2 ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 pb-6 pt-2 border-t border-mist dark:border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps };
