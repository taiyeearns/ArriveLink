## Before making any changes

Analyze the current codebase first — don't assume it matches any prior planning doc:
- Current routing/auth implementation (how role-based access works today for Admin, Operator, and Traveler)
- Current booking flow and state machine as actually built
- Current location/route data model
- Confirm the brand asset files below exist at their expected path in the repo (adjust every reference below if the actual path differs from `/public`)

For brand/design tokens (colors, fonts, voice), the Design Direction doc from earlier planning is still the source of truth even if the current implementation hasn't fully caught up to it yet.

### Brand assets (provided this round)

| File | What it shows | Use it for |
|---|---|---|
| `arrivelink-logo-dark.png` | Full wordmark, black + forest green | Light backgrounds |
| `arrivelink-logo-light.png` | Full wordmark, white + bright green | Dark backgrounds |
| `arrivelink-mark-dark.png` | Icon only, pale mint | Dark backgrounds |
| `arrivelink-mark-light.png` | Icon only, saturated emerald | Light backgrounds |
| `favicon.png` | Icon in emerald on a black circle | Browser favicon, as-is |

Note: the "-dark"/"-light" naming isn't consistent between the two pairs — for the wordmark it names the ink color (dark ink needs a light bg), for the mark-only files it's inverted (the pale one is "-dark"). Assign by the contrast pairing in the table above, not by matching names.

---

## 1. Fix role-based routing

Routing should be driven entirely by the authenticated user's role (Admin / Operator / Traveler), stored on their account. Review the current implementation and fix:
- Each role lands on its correct dashboard/home after login, every time
- No role can reach another role's routes/pages, even via direct URL
- Confirm the role check happens at the route/middleware level and on protected API calls — not just hidden in the UI

## 2. Branding: dark mode toggle + updated logos + favicon

- Use the brand assets table above — light-background pairing (`logo-dark.png` + `mark-light.png`) for light mode, dark-background pairing (`logo-light.png` + `mark-dark.png`) for dark mode
- Update the favicon using `favicon.png`
- Dark mode is a **user-toggleable switch**, not a fixed theme — add a toggle control, persist the user's choice (localStorage or account preference), default to system preference if neither is set
- Every text, button, and UI element needs verified contrast in both modes — target WCAG AA (4.5:1 for normal text, 3:1 for large text/UI elements), not just "looks fine"
- Dark background: dark ash-grey, not black — suggested starting point `#1A1D1B` (deep charcoal with a slight green undertone), adjust against the actual logo files
- Implementation approach: Tailwind's class-based dark mode (`darkMode: 'class'`), toggling a `dark` class at the root

## 2a. Custom 404 page

Build a branded 404/not-found page — on-brand in voice and design — with a clear path back to the homepage (button, or auto-redirect, whichever fits better once you see the current routing setup).

## 3. Booking flow: remove the operator accept/reject step

Replace the current flow with a direct reserve-then-pay model:

- Traveler books an available seat directly — no operator approval step
- On booking, the seat is reserved (held) for **15 minutes**
- Traveler must complete payment within that window
- Paid within 15 minutes → booking confirmed, seat is booked
- Unpaid after 15 minutes → reservation expires, seat returns to available
- A reserved (unpaid, mid-window) seat needs its own status, distinct from available and booked/confirmed, so it doesn't show as bookable to other travelers and doesn't show as confirmed to the operator while the window is running

This removes the operator's manual accept/reject action. The "incoming requests" queue this replaces should become a live view of reserved/confirmed bookings instead — the operator observes and manages, but no longer approves.

## 4. Multiple buses per operator, per route

An operator serving a route needs to add multiple distinct bus entries for different departure times — e.g. 6:00 AM, 12:00 PM, 7:00 PM — each with:
- Its own seat inventory (seats don't share across time slots)
- Its own fare (pricing may differ by time)
- Independent management (add/edit/deactivate one slot without touching the others)

**Duplication shortcut:** when an operator already has a bus set up and wants another one on the same route (same or different time), let them duplicate an existing bus entry instead of re-entering everything from scratch. The duplicate pre-fills all shared details (route, fare, timing) and only requires a distinct bus number/identifier. Example: three separate 6:00 AM buses from Benin to Lagos, same operator, differentiated by bus number, each with its own independent seat count.

## 5. Two-level location model

Replace the current location setup with:
- **General routes** (Admin-managed): city-pair corridors, e.g. "Benin City → Abuja." This is what travelers search by.
- **Operator routes** (Operator-managed): under a chosen general route, each operator sets their own specific pickup terminal/park (different operators use different terminals in the same city) and their own bus schedule(s) from Section 4.

Multiple operators can serve the same general route from different terminals; one operator can run multiple buses on the same general route at different times.

## 6. Deferred — not this pass

Round-trip booking. Noted for a future iteration, no action needed now.

## 7. Copy cleanup

Remove every em dash (—) from the project's UI text. Replace with punctuation appropriate to context: comma, period, colon, or parentheses. Full sweep, not just the obvious spots.

## 8. New & updated pages

- Landing page — keep it simple/functional for now; final visual design is being handled separately
- Privacy Policy
- Terms of Service — include a refund/reschedule policy: **no refunds**, but rescheduling is available. For now, rescheduling is manual — the traveler contacts support to reschedule. A future version will let travelers self-serve reschedule; note it as planned but not required in this pass.
- 404 page — see §2a

## 9. Cancellation limits

Travelers can cancel up to 3 bookings, then are locked out from booking again for a cooldown period. The counter resets after the cooldown — not a lifetime cap.

Cooldown: **2 hours**

## 10. Multi-seat tickets

Confirmed: one ticket per booking, showing seat count and booking ID, with save/share functionality (downloadable image or shareable link).

---

## Suggested order of operations

Structural changes first, since later items depend on them:

1. Routing fix (§1) — independent, do first
2. Location model (§5) → multi-bus with duplication (§4) — the data model everything else books against
3. Booking flow (§3) — depends on §4/§5 being in place
4. Cancellation limits (§9) and ticket handling (§10) — depend on §3
5. Dark mode toggle + logos + favicon (§2) — independent, but touches every component (both color states), so budget more time than a simple palette swap
6. 404 page (§2a), copy cleanup (§7), new pages (§8) — independent, lowest risk, any time