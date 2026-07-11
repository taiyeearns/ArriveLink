'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function OnboardingPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Subtle animation timing
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 600); // 600ms delay to let the logo scale-in finish before showing content
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mist via-white to-mist/30 dark:from-dark-surface dark:via-dark-bg dark:to-dark-surface">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between max-w-3xl mx-auto w-full opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <div className="w-24">
          <Link href="/">
             <Logo variant="full" size="sm" />
          </Link>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 max-w-lg mx-auto w-full">
        
        {/* Initial Logo Animation */}
        <div className={`transition-all duration-700 ease-out flex flex-col items-center ${showContent ? '-translate-y-8 scale-75 opacity-0 pointer-events-none absolute' : 'translate-y-0 scale-100 opacity-100'}`}>
          <Logo variant="icon" size="lg" />
        </div>

        {/* Chooser Content */}
        <div className={`w-full transition-all duration-700 delay-300 ease-out flex flex-col items-center ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none absolute'}`}>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
            How are you using ArriveLink?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-10 text-center">
            Choose your path to get started
          </p>

          <div className="w-full space-y-4">
            {/* Traveller Option */}
            <Link href="/login?type=traveler" className="block w-full group">
              <div className="flex items-center p-5 bg-white dark:bg-dark-surface border-2 border-transparent hover:border-emerald dark:hover:border-emerald rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-mist dark:bg-pine/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-emerald transition-colors">Traveller</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Book trips, pay easily, get e-tickets</p>
                </div>
                <div className="text-gray-300 dark:text-gray-600 group-hover:text-emerald transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Operator Option */}
            <Link href="/login?type=operator" className="block w-full group">
              <div className="flex items-center p-5 bg-white dark:bg-dark-surface border-2 border-transparent hover:border-emerald dark:hover:border-emerald rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-mist dark:bg-pine/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-emerald transition-colors">Operator</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Manage routes, verify tickets, scale operations</p>
                </div>
                <div className="text-gray-300 dark:text-gray-600 group-hover:text-emerald transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
