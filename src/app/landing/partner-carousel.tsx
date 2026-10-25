'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Operator {
  id: string;
  business_name: string;
  tagline: string | null;
}

// ─── Placeholder data ─────────────────────────────────────────────────────────

const PLACEHOLDERS: Operator[] = [
  { id: '', business_name: 'GUO Transport',       tagline: 'Connecting Nigeria, city by city'      },
  { id: '', business_name: 'ABC Transport',        tagline: 'Safe, affordable, on time'             },
  { id: '', business_name: 'Cross Country',        tagline: 'The interstate journey specialists'    },
  { id: '', business_name: 'Young Shall Grow',     tagline: 'Trusted for over 40 years'             },
  { id: '', business_name: 'Chisco Transport',     tagline: 'Premium inter-state travel'            },
  { id: '', business_name: 'God is Good Motors',   tagline: 'Comfort and safety guaranteed'         },
  { id: '', business_name: 'Ekene Dili Chukwu',    tagline: "Eastern Nigeria's favourite carrier"   },
  { id: '', business_name: 'Agofure Motors',       tagline: 'Delta & Edo at your fingertips'        },
  { id: '', business_name: 'Peace Mass Transit',   tagline: 'Nationwide, unbeatable fares'          },
  { id: '', business_name: 'Ifesinachi Motors',    tagline: 'The South-East route masters'          },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  const pal = ['#1A6B4A','#2E7D32','#1565C0','#6A1B9A','#AD1457',
               '#E65100','#00695C','#283593','#4527A0','#558B2F',
               '#37474F','#BF360C','#1B5E20','#0D47A1','#880E4F'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return pal[Math.abs(h) % pal.length];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Carousel tile ────────────────────────────────────────────────────────────

function Tile({ op, isHovered, anyHovered, onEnter, onLeave, onClick }: {
  op: Operator;
  isHovered: boolean;
  anyHovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const color = avatarColor(op.business_name);
  const inits = initials(op.business_name);

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        flexShrink: 0,
        position: 'relative',
        width: 156,
        height: 156,
        borderRadius: 24,
        backgroundColor: color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        // Non-hovered: grayscale when another is hovered
        filter: anyHovered && !isHovered ? 'grayscale(1) brightness(0.45)' : 'none',
        opacity: anyHovered && !isHovered ? 0.4 : 1,
        // Hovered card: white ring + glow
        outline: isHovered ? '3px solid rgba(255,255,255,0.85)' : '3px solid transparent',
        outlineOffset: 4,
        boxShadow: isHovered
          ? `0 0 0 8px ${color}45, 0 20px 50px ${color}60`
          : '0 4px 16px rgba(0,0,0,0.10)',
        transition: 'filter 0.38s ease, opacity 0.38s ease, box-shadow 0.38s ease',
      }}
    >
      <span style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {inits}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.82)',
        marginTop: 10, textAlign: 'center', padding: '0 12px', lineHeight: 1.35,
      }}>
        {op.business_name}
      </span>

      {/* Click indicator — pulse ring + "tap" hint on hovered card */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          inset: -10,
          borderRadius: 32,
          pointerEvents: 'none',
          animation: 'pulseRing 1.4s ease-out infinite',
          border: '2px solid rgba(255,255,255,0.45)',
        }} />
      )}
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: -36,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.92)',
          color: '#1A6B4A',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 99,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          letterSpacing: '0.03em',
        }}>
          Click to view ↗
        </div>
      )}

      <style>{`
        @keyframes pulseRing {
          0%   { opacity: 0.8; transform: scale(1); }
          70%  { opacity: 0;   transform: scale(1.18); }
          100% { opacity: 0;   transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
}

// ─── Fixed popup portaled to body ─────────────────────────────────────────────

function Popup({ op, isPlaceholder, onDismiss }: {
  op: Operator;
  isPlaceholder: boolean;
  onDismiss: () => void;
}) {
  const color = avatarColor(op.business_name);
  const inits = initials(op.business_name);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onDismiss} // click anywhere outside card = dismiss
    >
      {/* Full-page blur */}
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0,0,0,0.42)',
      }} />

      {/* Popup — stop click propagation so clicking card doesn't dismiss */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 9999,
          width: 340,
          backgroundColor: '#fff',
          borderRadius: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          border: `2px solid ${color}`,
          overflow: 'hidden',
          animation: 'popIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Colour stripe */}
        <div style={{ height: 6, backgroundColor: color }} />

        <div style={{ padding: '28px 28px 26px' }}>
          {/* Close button */}
          <button
            onClick={onDismiss}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#666', fontSize: 18, lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 18, flexShrink: 0,
              backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${color}55`,
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{inits}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: '#1A3A2A', lineHeight: 1.3 }}>
                {op.business_name}
              </p>
              {op.tagline && (
                <p style={{ margin: '5px 0 0', fontSize: 13, color: 'rgba(26,58,42,0.55)', lineHeight: 1.4 }}>
                  {op.tagline}
                </p>
              )}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: '#e4ede7', margin: '0 0 18px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34D399', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(26,58,42,0.55)', fontWeight: 500 }}>
              Verified ArriveLink Partner
            </span>
          </div>

          {isPlaceholder ? (
            <div style={{
              padding: '13px 0', borderRadius: 14, textAlign: 'center',
              backgroundColor: color, opacity: 0.45, color: '#fff', fontSize: 14, fontWeight: 600,
            }}>
              Profile coming soon
            </div>
          ) : (
            <Link
              href={`/operators/${op.id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 0', borderRadius: 14, width: '100%',
                backgroundColor: color, color: '#fff', fontSize: 15, fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View Full Profile
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.82) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props { operators: Operator[] }

export function PartnerCarousel({ operators }: Props) {
  const source        = operators.length > 0 ? operators : PLACEHOLDERS;
  const isPlaceholder = operators.length === 0;

  // 4 copies so track is always wider than any viewport → no gap ever
  const COPIES = 4;
  const items  = Array.from({ length: COPIES }, () => source).flat();

  const trackRef     = useRef<HTMLDivElement>(null);
  const pausedRef    = useRef(false);
  const rafRef       = useRef<number | null>(null);
  const posRef       = useRef(0);
  const loopWidthRef = useRef(0);

  // hoveredKey: unique key of the exact tile under the mouse
  const [hoveredKey,  setHoveredKey]  = useState<string | null>(null);
  // clickedOp: which operator the popup is showing for
  const [clickedOp,   setClickedOp]   = useState<Operator | null>(null);

  function pauseTrack()  { pausedRef.current = true;  }
  function resumeTrack() { pausedRef.current = false; }

  function onCardEnter(key: string) { setHoveredKey(key); pauseTrack(); }
  function onCardLeave()             { setHoveredKey(null); resumeTrack(); }
  function onCardClick(op: Operator) { setClickedOp(op); }
  function closePopup()              { setClickedOp(null); }

  // ── Infinite RAF scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const SPEED = 0.7; // px per frame

    function measure() {
      if (!trackRef.current) return;
      loopWidthRef.current = trackRef.current.scrollWidth / COPIES;
    }

    function animate() {
      if (!pausedRef.current && trackRef.current && loopWidthRef.current > 0) {
        posRef.current += SPEED;
        if (posRef.current >= loopWidthRef.current) {
          posRef.current -= loopWidthRef.current;
        }
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    // Two rAF frames = after layout is committed and painted
    requestAnimationFrame(() => requestAnimationFrame(() => {
      measure();
      rafRef.current = requestAnimationFrame(animate);
    }));

    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      {/* Popup rendered via portal — full-page blur + centered card */}
      {clickedOp && (
        <Popup
          op={clickedOp}
          isPlaceholder={isPlaceholder}
          onDismiss={closePopup}
        />
      )}

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        {/* Scrolling track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: 20,
            padding: '56px 0', // extra vertical padding so "Click to view" label has room
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {items.map((op, i) => {
            const key = `${op.business_name}-${i}`;
            return (
              <Tile
                key={key}
                op={op}
                isHovered={hoveredKey === key}
                anyHovered={!!hoveredKey}
                onEnter={() => onCardEnter(key)}
                onLeave={onCardLeave}
                onClick={() => onCardClick(op)}
              />
            );
          })}
        </div>
      </div>

      {isPlaceholder && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(26,107,74,0.35)', marginTop: 8, letterSpacing: '0.03em' }}>
          Example carriers - real partners appear once listed on ArriveLink
        </p>
      )}
    </>
  );
}
