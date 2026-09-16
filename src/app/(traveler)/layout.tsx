'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    href: '/history',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function TravelerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-mist dark:border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Logo variant="full" size="sm" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Bottom navigation - mobile-native feel */}
      {isAuthenticated && !pathname.startsWith('/booking') && !pathname.startsWith('/payment') && (
        <nav className="sticky bottom-0 z-40 bg-white dark:bg-dark-surface border-t border-mist dark:border-white/5">
          <div className="max-w-lg mx-auto flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/' && pathname.startsWith('/search'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl
                    transition-colors duration-200
                    ${isActive
                      ? 'text-foreground'
                      : 'text-foreground/40 hover:text-pine dark:hover:text-mist'
                    }
                  `}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium font-body">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
