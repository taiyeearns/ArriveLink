import Image from 'next/image';
import Link from 'next/link';
import { LandingHeader } from './landing-header';
import { LandingFooter } from './landing-footer';
import { WaitlistFab } from './waitlist-fab';

export const metadata = {
  title: 'ArriveLink - Stop Going From Park to Park',
  description:
    'ArriveLink shows you every transport company, verified prices, and real departure times before you leave your house.',
};

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white dark:bg-dark-bg">
      <LandingHeader />

      <main>

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background image - slightly blurred with overlay */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <Image
              src="/hero.png"
              alt="ArriveLink hero background"
              fill
              priority
              className="w-full h-full object-cover"
              style={{ filter: 'blur(3px)', transform: 'scale(1.05)' }}
            />
            {/* Dark overlay so text pops */}
            <div className="absolute inset-0 bg-forest/60" />
            {/* Subtle vignette at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-forest/80 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-5 pt-28 pb-20 text-center" style={{ isolation: 'isolate' }}>
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-white/90 text-sm font-body font-medium">Nigeria&apos;s first transparent bus booking platform</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white leading-[1.0] mb-8 drop-shadow-lg">
              Stop Going<br />
              Park to Park.
            </h1>
            <p className="text-lg sm:text-xl text-white/70 font-body font-medium tracking-wide mb-10">
              Book with ArriveLink.
            </p>

            {/* December launch CTA - replaces search form */}
            <div className="relative bg-white/98 backdrop-blur border border-white/30 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-2xl mx-auto text-center" style={{ zIndex: 20, isolation: 'isolate' }}>
              <div className="inline-flex items-center gap-2 bg-emerald/10 rounded-full px-4 py-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                <span className="text-emerald text-sm font-body font-semibold">Coming 10 December 2026</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-forest mb-3 leading-tight">
                Booking opens soon.
              </h2>
              <p className="text-forest/60 font-body text-base mb-8 max-w-md mx-auto">
                Be the first to book your December holiday travel. Join the waitlist and we will notify you the moment booking goes live.
              </p>
              <Link
                href="/signup?redirect=%2Fwaitlist"
                className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-white rounded-2xl font-body font-bold text-lg hover:bg-pine transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Join the Waitlist
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Trust chips */}
            <div className="mt-8" style={{ position: 'relative', zIndex: 5 }}>
              <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-body">
                {['Verified prices', 'Real departure times', 'Terminal locations confirmed'].map((label) => (
                  <li key={label} className="inline-flex items-center gap-2 font-semibold text-white/90 drop-shadow">
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scroll cue */}
            <div className="mt-16 flex justify-center">
              <div className="flex flex-col items-center gap-2 animate-bounce opacity-60">
                <span className="text-white text-xs font-body uppercase tracking-widest">Scroll</span>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════════
            PROBLEM SECTION - "Sound Familiar?"
        ════════════════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex items-center bg-[#0F1C14] px-5 py-24">
          <div className="max-w-6xl mx-auto w-full">
            <p className="text-emerald text-sm uppercase tracking-widest font-semibold font-body text-center mb-4">The Problem</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white text-center mb-6 leading-tight">
              Sound familiar?
            </h2>
            <p className="text-center text-white/50 font-body text-lg max-w-xl mx-auto mb-16">
              Decades of the same chaos. We&apos;re changing it.
            </p>

            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  img: '/case1.png',
                  alt: 'Person rushing between terminals with luggage',
                  title: 'Terminal Hopping',
                  body: 'You visit 3 motor parks before finding the right company - and the bus already left.',
                },
                {
                  img: '/case2.png',
                  alt: 'Person shocked by price change on phone',
                  title: 'Price Surprises',
                  body: 'The website says \u20a612,000. You arrive and they charge \u20a622,000. No explanation.',
                },
                {
                  img: '/case3.png',
                  alt: 'Person confused with no bus information',
                  title: 'Zero Information',
                  body: 'Nobody knows which company is going where, when, or what they charge.',
                },
              ].map((item) => (
                <div key={item.title} className="flex flex-col group">
                  {/* Transparent image card with hover border */}
                  <div className="relative w-full aspect-[4/3] mb-6 overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-4 transition-all duration-300 group-hover:border-emerald/40 group-hover:bg-white/8">
                    <Image
                      src={item.img}
                      alt={item.alt}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-white mb-3">{item.title}</h3>
                  <p className="text-white/55 font-body text-base leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="min-h-screen flex items-center px-5 py-24 bg-white dark:bg-dark-bg">
          <div className="max-w-6xl mx-auto w-full">
            <p className="text-emerald text-sm uppercase tracking-widest font-semibold font-body text-center mb-4">How It Works</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-forest dark:text-white text-center mb-6 leading-tight">
              Four steps. Zero stress.
            </h2>
            <p className="text-center text-forest/50 dark:text-white/50 font-body text-lg sm:text-xl max-w-xl mx-auto mb-16">
              From chaos to confidence in under 2 minutes.
            </p>

            <ol className="grid gap-6 md:grid-cols-4">
              {[
                {
                  step: '01', title: 'Search',
                  body: 'Enter your origin state, city, destination, and when you want to travel.',
                  color: 'from-emerald/40 to-emerald/15 border-emerald/30 dark:from-emerald/30 dark:to-emerald/10 dark:border-emerald/30',
                },
                {
                  step: '02', title: 'Compare',
                  body: 'See every available bus with verified fares, departure times, and operator ratings.',
                  color: 'from-blue-500/40 to-blue-500/15 border-blue-500/30 dark:from-blue-500/30 dark:to-blue-500/10 dark:border-blue-500/30',
                },
                {
                  step: '03', title: 'Reserve',
                  body: 'Tap to reserve your seat. You have 15 minutes to pay and lock it in.',
                  color: 'from-amber-500/40 to-amber-500/15 border-amber-500/30 dark:from-amber-500/30 dark:to-amber-500/10 dark:border-amber-500/30',
                },
                {
                  step: '04', title: 'Arrive',
                  body: 'Travel with your e-ticket. No surprises. No stress. Just arrive.',
                  color: 'from-pine/40 to-forest/15 border-pine/30 dark:from-pine/30 dark:to-forest/10 dark:border-pine/30',
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className={`bg-gradient-to-b ${item.color} border rounded-3xl p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1`}
                >
                  <span className="font-mono text-4xl font-extrabold text-forest/40 dark:text-white/35 block mb-4">{item.step}</span>
                  <h3 className="font-display text-2xl text-forest dark:text-white mb-3">{item.title}</h3>
                  <p className="text-forest/80 dark:text-white/75 font-body text-base leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════════
            PARTNER CARRIERS CAROUSEL - Hidden until real operators onboard
        ════════════════════════════════════════════════════════════════
        <section className="min-h-screen flex flex-col items-center justify-center bg-mist/40 dark:bg-dark-surface px-5 py-24 overflow-hidden">
          ...
        </section>
        */}


        {/* ════════════════════════════════════════════════════════════════
            FOUNDER STORY
        ════════════════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex items-center px-5 py-24 bg-white dark:bg-dark-bg">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-emerald text-sm uppercase tracking-widest font-semibold font-body text-center mb-12">Why We Built This</p>

            <blockquote className="relative bg-mist/50 dark:bg-dark-surface border border-mist dark:border-white/10 rounded-3xl p-10 sm:p-14">
              {/* Large quote mark */}
              <div className="absolute top-8 left-8 text-8xl font-display text-emerald/20 leading-none select-none">
                &ldquo;
              </div>

              <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-forest dark:text-white leading-snug relative z-10 mt-6">
                I woke at 5AM to catch a 6AM bus from Benin City to Kaduna. I went from terminal to terminal. Nobody was going there. By the time I found the right park, the bus was gone. I waited until 11AM and broke my journey across two days.
              </p>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-emerald leading-snug mt-4 relative z-10">
                This happens to millions of Nigerians every week. It doesn&rsquo;t have to.
              </p>

              <footer className="mt-8 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-emerald/30 shadow-md">
                  <Image
                    src="/praise_obasi.jpg"
                    alt="Praise Obasi, Founder of ArriveLink"
                    fill
                    sizes="56px"
                    className="object-cover"
                    style={{ objectPosition: 'center 15%' }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-forest dark:text-white font-body text-base">Praise Obasi</p>
                  <p className="text-sm text-forest/60 dark:text-white/50 font-body">Founder, ArriveLink</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════════
            DUAL CTA - December Campaign
        ════════════════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex items-center px-5 py-24 bg-[#0F1C14]">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
                Ready to change how<br />Nigeria travels?
              </h2>
              <p className="text-white/50 font-body text-xl">Whether you&apos;re catching a bus or running one.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* For Travelers */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col hover:border-emerald/40 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-emerald/20 flex items-center justify-center mb-8 group-hover:bg-emerald/30 transition-colors">
                  <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-emerald text-xs font-body uppercase tracking-widest font-semibold mb-3">For Travellers</span>
                <h3 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  Book your December<br />travel early.
                </h3>
                <p className="text-white/50 font-body text-base leading-relaxed mb-10 flex-1">
                  Be the first to know when booking goes live. Join the waitlist and secure the best fares for the holiday season.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/signup?redirect=%2Fwaitlist"
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-emerald text-forest rounded-2xl font-body font-bold text-base hover:bg-emerald/90 transition-all shadow-lg hover:shadow-emerald/20 active:scale-[0.98]"
                  >
                    Join the Waitlist
                  </Link>
                  <Link
                    href="/signup?redirect=%2Fwaitlist"
                    className="flex-1 flex items-center justify-center px-6 py-4 border border-white/20 text-white rounded-2xl font-body font-semibold text-base hover:bg-white/10 transition-all"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* For Operators */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col hover:border-white/30 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:bg-white/15 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-white/50 text-xs font-body uppercase tracking-widest font-semibold mb-3">For Transport Operators</span>
                <h3 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  List your buses.<br />Fill your seats.
                </h3>
                <p className="text-white/50 font-body text-base leading-relaxed mb-10 flex-1">
                  Join Nigeria&apos;s fastest growing transport booking platform.
                  Reach thousands of passengers searching for your routes every day. Free to join.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/contact"
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-white text-forest rounded-2xl font-body font-bold text-base hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/signup?redirect=%2Fwaitlist"
                    className="flex-1 flex items-center justify-center px-6 py-4 border border-white/20 text-white rounded-2xl font-body font-semibold text-base hover:bg-white/10 transition-all"
                  >
                    Join the Waitlist
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-3 gap-6 text-center">
              {[
                { stat: '36+', label: 'States covered' },
                { stat: '10 Dec', label: 'Booking goes live' },
                { stat: '100%', label: 'Verified operators' },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <p className="font-display text-4xl sm:text-5xl text-white mb-2">{stat}</p>
                  <p className="text-white/40 font-body text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Floating waitlist CTA - bottom right, sticks on all scroll */}
      <WaitlistFab />

      <LandingFooter />
    </div>
  );
}
