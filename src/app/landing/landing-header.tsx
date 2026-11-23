'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/contact', label: 'For Operators' },
  { href: '/waitlist', label: 'Join Waitlist' },
];

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() { setIsScrolled(window.scrollY > 40); }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-mist dark:border-white/5 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-18 sm:h-20 flex items-center justify-between">
          <Logo variant="full" size="sm" forceTheme={isScrolled ? undefined : 'dark'} />

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
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

          {/* Right side: Sign in + Theme toggle + Mobile burger */}
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className={`hidden sm:inline-flex text-base font-body font-semibold px-6 py-3 rounded-xl transition-all ${
                isScrolled
                  ? 'bg-forest text-white hover:bg-pine'
                  : 'bg-white text-forest hover:bg-white/90'
              }`}
            >
              Sign in
            </Link>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className={`sm:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isScrolled
                  ? 'text-foreground hover:bg-mist'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute top-18 left-0 right-0 bg-white dark:bg-dark-bg border-b border-mist dark:border-white/10 shadow-xl">
            <nav className="flex flex-col px-5 py-4 gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-body font-medium text-foreground/70 hover:text-foreground hover:bg-mist dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-colors"
                >
                  {label}
                </Link>
              ))}

              <div className="border-t border-mist dark:border-white/10 my-2" />

              <Link
                href="/onboarding"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center px-4 py-3 bg-forest text-white rounded-xl font-body font-semibold text-base hover:bg-pine transition-all"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
