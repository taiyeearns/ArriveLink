'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() { setIsScrolled(window.scrollY > 40); }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-mist dark:border-white/5 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-18 sm:h-20 flex items-center justify-between">
        <Logo variant="full" size="sm" forceTheme={isScrolled ? undefined : 'dark'} />

        <nav className="hidden sm:flex items-center gap-8">
          {[
            { href: '/#how-it-works', label: 'How it works' },
            { href: '/onboarding?role=operator', label: 'For Operators' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-base font-body font-medium transition-colors ${
                isScrolled
                  ? 'text-foreground/70 hover:text-foreground'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/onboarding"
          className={`text-base font-body font-semibold px-6 py-3 rounded-xl transition-all ${
            isScrolled
              ? 'bg-forest text-white hover:bg-pine'
              : 'bg-white text-forest hover:bg-white/90'
          }`}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
