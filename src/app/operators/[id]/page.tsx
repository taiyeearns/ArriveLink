import { getOperatorProfile } from './actions';
import { LandingHeader } from '@/app/landing/landing-header';
import { LandingFooter } from '@/app/landing/landing-footer';
import Link from 'next/link';

function avatarColor(name: string) {
  const palette = ['#1A6B4A','#2E7D32','#1565C0','#6A1B9A','#AD1457','#E65100','#00695C','#283593','#4527A0','#558B2F'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function fmtTime(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function StarIcon({ filled, dim }: { filled: boolean; dim?: boolean }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : dim ? 'text-white/20' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
function Stars({ value, dim }: { value: number; dim?: boolean }) {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(value)} dim={dim} />)}</div>;
}

const MOCK_ROUTES = [
  { id: 'm1', fare: 8500, departure_time: '06:00', seats_available: 12, pickup_terminal: 'Ring Road Terminal', dropoff_terminal: 'Jibowu Bus Stop', general_route: { origin_city: 'Benin City', origin_state: 'Edo', destination_city: 'Lagos', destination_state: 'Lagos' } },
  { id: 'm2', fare: 5000, departure_time: '07:30', seats_available: 5, pickup_terminal: 'New Benin Motor Park', dropoff_terminal: 'Wuse Market', general_route: { origin_city: 'Benin City', origin_state: 'Edo', destination_city: 'Abuja', destination_state: 'FCT' } },
  { id: 'm3', fare: 3200, departure_time: '09:00', seats_available: 18, pickup_terminal: 'Auchi Main Park', dropoff_terminal: 'Ojuelegba', general_route: { origin_city: 'Auchi', origin_state: 'Edo', destination_city: 'Lagos', destination_state: 'Lagos' } },
];
const MOCK_REVIEWS = [
  { id: 'r1', stars: 5, comment: 'Very professional. Bus was clean and departed on time. Will use again.', created_at: '2026-08-12', author: 'Chukwuemeka A.' },
  { id: 'r2', stars: 4, comment: 'Good service. Driver was polite and the AC was working. Slight delay at the park but nothing serious.', created_at: '2026-09-03', author: 'Fatima B.' },
  { id: 'r3', stars: 5, comment: 'Best experience so far. Seats were comfortable and no extra charges at the gate.', created_at: '2026-09-28', author: 'Tunde O.' },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OperatorProfilePage({ params }: Props) {
  const { id } = await params;
  const op = await getOperatorProfile(id);

  const name        = op?.business_name ?? 'ArriveLink Partner';
  const bio         = op?.bio ?? 'A trusted interstate transport company serving Nigerian travelers with safe, comfortable and affordable bus journeys. We are committed to transparency in pricing and reliability in scheduling.';
  const tagline     = op?.tagline ?? 'Safe. Reliable. On Time.';
  const avgRating   = op?.avgRating ?? 4.6;
  const reviewCount = op?.ratings?.length ?? MOCK_REVIEWS.length;
  const routes      = (op?.routes && op.routes.length > 0) ? op.routes : MOCK_ROUTES;
  const reviews     = (op?.ratings && op.ratings.length > 0)
    ? op.ratings.map((r: any, i: number) => ({ id: i, stars: r.stars, comment: r.comment, created_at: r.created_at, author: 'Verified Traveler' }))
    : MOCK_REVIEWS;
  const color   = avatarColor(name);
  const founded = op?.created_at ? new Date(op.created_at).getFullYear() : 2023;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* HERO */}
      <section className="bg-[#0F1C14] pt-32 pb-16 px-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${color}22 0%, transparent 70%)` }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white text-3xl font-bold font-display shadow-2xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
            >
              {initials(name)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald/20 px-3 py-1 rounded-full mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                <span className="text-emerald text-xs font-semibold font-body">Verified Operator</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-white mb-1 leading-tight">{name}</h1>
              <p className="text-white/50 font-body text-base">{tagline}</p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-bold text-white">{avgRating.toFixed(1)}</span>
                <Stars value={avgRating} dim />
              </div>
              <p className="text-white/40 font-body text-xs">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Routes', value: `${routes.length}` },
              { label: 'Founded', value: `${founded}` },
              { label: 'Rating', value: `${avgRating.toFixed(1)}/5` },
              { label: 'Status', value: 'Active' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-2xl px-4 py-4 text-center border border-white/10">
                <p className="font-display text-xl font-bold text-white mb-0.5">{s.value}</p>
                <p className="text-white/40 text-xs font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-5 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold font-body text-emerald mb-3">About</p>
              <p className="text-sm text-foreground/70 font-body leading-relaxed">{bio}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold font-body text-emerald mb-3">What we offer</p>
              <ul className="space-y-2.5">
                {['Fixed, transparent pricing','No surprise gate charges','Clean, air-conditioned buses','Departure time guarantee','ArriveLink verified'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm font-body text-foreground/70">
                    <svg className="w-4 h-4 text-emerald shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-forest/5 border border-forest/10">
              <p className="text-sm font-semibold text-foreground font-body mb-1">Ready to book?</p>
              <p className="text-xs text-foreground/50 font-body mb-4">Search available seats on this operator&apos;s routes.</p>
              <Link href="/" className="flex items-center justify-center w-full py-3 bg-forest text-white rounded-xl text-sm font-semibold font-body hover:bg-pine transition-colors">
                Search Seats
              </Link>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-10">

            {/* Routes */}
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold font-body text-emerald mb-4">Available Routes</p>
              <div className="space-y-3">
                {routes.map((r: any) => {
                  const gr = r.general_route;
                  return (
                    <div key={r.id} className="border border-mist rounded-2xl p-4 hover:border-emerald/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-1">
                            <span>{gr?.origin_city}</span>
                            <svg className="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span>{gr?.destination_city}</span>
                          </div>
                          <p className="text-xs text-foreground/40 font-body">
                            {gr?.origin_state} to {gr?.destination_state} &middot; Departs {fmtTime(r.departure_time)}
                          </p>
                          {(r.pickup_terminal || r.dropoff_terminal) && (
                            <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-foreground/35 font-body">
                              {r.pickup_terminal && <span>Pickup: {r.pickup_terminal}</span>}
                              {r.dropoff_terminal && <span>Drop-off: {r.dropoff_terminal}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <p className="font-display text-lg font-bold text-forest">&#8358;{Number(r.fare).toLocaleString()}</p>
                          <p className="text-xs text-foreground/40 font-body">{r.seats_available} seat{r.seats_available !== 1 ? 's' : ''} left</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest font-semibold font-body text-emerald">Traveler Reviews</p>
                <div className="flex items-center gap-1.5">
                  <Stars value={avgRating} />
                  <span className="text-xs text-foreground/40 font-body">{avgRating.toFixed(1)} avg</span>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="border border-mist rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold font-body text-foreground">{rev.author}</p>
                        <p className="text-xs text-foreground/40 font-body">
                          {new Date(rev.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Stars value={rev.stars} />
                    </div>
                    {rev.comment && <p className="text-sm text-foreground/70 font-body leading-relaxed">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
