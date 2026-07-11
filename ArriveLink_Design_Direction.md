# ArriveLink — Design Direction

*Companion to the Technical Blueprint · Source: Official Brand Kit, 2026*

This is the design system extracted from the Brand Kit, organized for implementation. Where the Brand Kit states a rule directly, it's captured as-is; where this document extends that into concrete build guidance (Tailwind tokens, component states), that's noted.

---

## 1. Brand essence

- **Tagline:** Plan It. Book It. Arrive.
- **Positioning line:** Find It. Trust It. Arrive.
- **Core pitch:** verified transport information, real prices, and instant access to booking representatives — all in one place, for less than the cost of transport to a terminal.
- **Category:** Digital travel platform.

---

## 2. Logo & logomark

**Primary lockup:** wordmark "ArriveLink" — "Arriv" in white/dark, "e" rendered as the icon mark (an upward arrow merging into a location pin), "Link" in brand green.

**Variations:**
| Variant | Use |
|---|---|
| Primary | White background |
| Secondary | Soft/mist background |
| Reversed | Dark background |

**Icon mark alone** (arrow + pin, no wordmark) — for app icons, favicons, profile photos:
| Icon color | Use |
|---|---|
| Dark green | App Store, Google Play icon |
| Bright green | Social media profile photo background |
| White | Email signatures, light document headers |
| Dark-background version | TikTok, dark-mode interfaces |

---

## 3. Color palette

| Name | Hex | Role |
|---|---|---|
| Forest | `#0A3D1F` | **Primary.** The anchor color — headers, primary buttons, logo background, footer. This is ArriveLink's identity. |
| Pine | `#1A6B35` | **Secondary.** Wordmark accent, hover states, secondary text highlights, interactive elements. |
| Emerald | `#2ECC71` | **Accent.** Success states, CTAs on dark backgrounds, active indicators, live badges. |
| Lime | `#7FE88A` | **Glow.** Icon accents on dark backgrounds, subtle glow effects — the "light" in the dark logo variant. |
| Mist | `#E8FFF0` | **Background.** Ultra-light green tint for card backgrounds, hover states, section alternation. Never primary. |
| White | `#FFFFFF` | **Canvas.** The dominant background — clean, open, trustworthy. |

**Tailwind config:**
```js
// tailwind.config.js
colors: {
  forest: '#0A3D1F',
  pine:   '#1A6B35',
  emerald:'#2ECC71',
  lime:   '#7FE88A',
  mist:   '#E8FFF0',
}
```
White needs no override — it's Tailwind's default.

---

## 4. Typography

| Font | Role | Notes |
|---|---|---|
| **Syne** | Display | Headlines, logo wordmark, section titles, buttons, bold statements. Geometric, modern without being cold. |
| **DM Sans** | Body | Body copy, descriptions, labels, navigation, all functional text. Weight 300 for descriptions, 500 for emphasis. |
| **DM Mono** | Labels | Small-caps eyebrow labels and section markers (the "01 — LOGOMARK" style headers used throughout the Brand Kit itself). |

All three are Google Fonts — loadable directly via `next/font/google` given the Next.js stack:
```ts
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
```

---

## 5. Brand voice

| Trait | What it means |
|---|---|
| **Reliable** | We verify before we publish. Every price, every time. Trust is the product. |
| **Nigerian** | We understand the chaos because we lived it. Built for us, by us. |
| **Direct** | No fluff. You need to travel. We tell you how. That's the entire job. |
| **Calm** | Travel is already stressful. ArriveLink removes the anxiety before the journey begins. |

Applies to all UI copy, error states, notification text, and marketing content.

---

## 6. UI patterns from the Brand Kit

**Buttons:**
- Primary — filled Forest background, white text (e.g. "Search Routes")
- Secondary — Forest outline, Forest text, transparent fill (e.g. "View All Companies")
- Text link — no border or fill, just Forest text (e.g. "Join Waitlist")

**Badges:**
- `✓ Verified` — outlined, Emerald/Pine family (per the palette's "success states" rule) — earned by operators, never purchased
- `● Live` — dot indicator + Emerald, matching the palette's explicit "active indicators and live badges" use case
- `Coming Soon` — muted/low-contrast treatment, clearly de-emphasized versus active badges
- Location tag (e.g. "Lagos") — outlined pill, used for city filtering

**Search interface (traveler-facing):**
- FROM / TO card pattern — each shows city name (DM Sans medium) + state as a lighter subtitle (e.g. "Benin City" / "Edo State, Nigeria")
- Directional arrow between the two
- Primary button below: "Find Transport"

**Route result card:**
- Operator name (e.g. "GIG Motors") + Verified badge, top row
- Route + departure times on one line (e.g. "Benin City → Port Harcourt • Departs 7:00 AM, 10:00 AM, 2:00 PM")
- Pickup location with a pin marker (e.g. "Upper Mission Road Terminal, Benin City")
- Price labeled "Verified price," right-aligned, Syne or DM Sans medium for emphasis

---

## 7. Implementation notes

- **Contrast:** Forest (`#0A3D1F`) on White passes WCAG AA comfortably for body text; White text on Forest likewise. Emerald on White is borderline for small text — reserve Emerald for large text, icons, or backed by a dark surface (its stated use case: "CTAs on dark backgrounds").
- **Mist** is a background tint only — never use it for text or icons, per the Brand Kit's own rule ("never primary").
- **Dark mode / dark surfaces** (TikTok assets, reversed logo) use the Lime glow accent — not part of the light-mode UI, reserve it for that context specifically.