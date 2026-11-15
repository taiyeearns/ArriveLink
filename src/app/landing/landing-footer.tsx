import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Col 1 — Brand */}
          <div>
            <Logo variant="full" size="sm" forceTheme="dark" className="mb-4" />
            <p className="text-sm text-white/50 font-body leading-relaxed max-w-xs">
              Nigeria's first transparent bus booking platform. Find every transport company,
              compare prices, and book your seat — before you leave the house.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {/* Twitter/X */}
              <a href="https://twitter.com/arrivelink" target="_blank" rel="noopener noreferrer"
                aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/arrivelink" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.126 1.528 5.856L0 24l6.293-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.673-.497-5.212-1.368l-.374-.222-3.734.895.928-3.638-.245-.389A9.947 9.947 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Quick Links (traveler-facing) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5 font-body">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: '/',           label: 'Book a Seat'       },
                { href: '/onboarding', label: 'Sign In / Register' },
                { href: '/history',    label: 'Trip History'       },
                { href: '/about',      label: 'About ArriveLink'  },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — For Operators */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5 font-body">For Operators</h3>
            <ul className="space-y-3">
              {[
                { href: '/onboarding?role=operator', label: 'List Your Company'  },
                { href: '/dashboard/routes',         label: 'Manage Routes'      },
                { href: '/dashboard/bookings',       label: 'Manage Bookings'    },
                { href: '/dashboard/wallet',         label: 'Earnings & Wallet'  },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal & Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-5 font-body">Legal & Support</h3>
            <ul className="space-y-3">
              {[
                { href: '/privacy', label: 'Privacy Policy'   },
                { href: '/terms',   label: 'Terms of Service' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
              {/* Email links must use <a> not Next Link */}
              <li>
                <a href="mailto:arrivelink@gmail.com" className="text-sm text-white/60 hover:text-white transition-colors font-body">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:arrivelink@gmail.com" className="text-sm text-white/60 hover:text-white transition-colors font-body">
                  Support
                </a>
              </li>
              <li>
                <a href="mailto:arrivelink@gmail.com" className="text-sm text-white/60 hover:text-white transition-colors font-body">
                  Refund Requests
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-body">
            © {year} ArriveLink Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
