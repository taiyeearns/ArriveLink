'use client';

import Link from 'next/link';

export function WaitlistFab() {
  return (
    <Link
      href="/waitlist"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2.5
        px-5 py-3.5
        bg-forest text-white
        rounded-full
        font-body font-semibold text-sm
        shadow-2xl shadow-forest/30
        hover:bg-pine hover:shadow-xl hover:scale-105
        active:scale-95
        transition-all duration-200
        border border-white/10
      "
    >
      <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
      Join the Waitlist
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </Link>
  );
}
