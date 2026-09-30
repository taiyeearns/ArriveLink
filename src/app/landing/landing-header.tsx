'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-dark-bg/90 backdrop-blur border-b border-mist dark:border-white/5 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Logo variant="full" size="sm" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/onboarding"
            className={`text-sm font-body font-medium transition-colors ${
              isScrolled
                ? 'text-foreground hover:text-pine dark:hover:text-emerald'
                : 'text-forest hover:text-pine font-semibold'
            }`}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
