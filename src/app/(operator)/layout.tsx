'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Routes',
    href: '/dashboard/routes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    href: '/dashboard/bookings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Wallet',
    href: '/dashboard/wallet',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-muted-bg dark:bg-dark-bg">
      {/* Sidebar - hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-dark-surface border-r border-mist dark:border-white/5">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo area */}
          <div className="px-5 pt-6 pb-4 border-b border-mist dark:border-white/5">
            <Logo variant="full" size="sm" />
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === item.href 
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-mist dark:bg-emerald/20 text-foreground font-medium'
                      : 'text-foreground/50 dark:text-foreground/40 hover:text-foreground dark:hover:text-mist hover:bg-muted-bg dark:hover:bg-white/5'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="px-3 py-4 border-t border-mist dark:border-white/5 flex flex-col gap-2">
            <div className="px-3 mb-2 flex items-center justify-between text-foreground/50 dark:text-foreground/40 text-sm font-body">
              <span>Theme</span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40 dark:text-foreground/40 hover:text-foreground dark:hover:text-mist hover:bg-muted-bg dark:hover:bg-white/5 transition-colors w-full font-body cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-dark-surface border-b border-mist dark:border-white/5 h-14 flex items-center justify-between px-4">
        <Logo variant="icon" size="sm" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-foreground/40 text-xs font-body hover:text-foreground transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-surface border-t border-mist dark:border-white/5">
        <div className="flex items-center justify-around h-14">
          {sidebarItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 px-2 py-1.5
                  ${isActive ? 'text-foreground' : 'text-foreground/40 dark:text-foreground/40'}
                `}
              >
                {item.icon}
                <span className="text-[9px] font-medium font-body">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-16 md:pb-0">
        <div className="p-4 md:p-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
