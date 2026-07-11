# ArriveLink

**Plan It. Book It. Arrive.**

A digital travel platform connecting Nigerian travelers with verified transport operators. Pre-pay your reservation, skip the terminal chaos.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, RLS, Realtime, Edge Functions)
- **Payments**: Paystack
- **Email**: Resend
- **Hosting**: Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project ([create one here](https://supabase.com/dashboard))

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
4. Push database migrations to your Supabase project:
   ```bash
   npx supabase db push
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

### First Admin User

1. Go to Supabase Dashboard → Authentication → Users → Add User
2. Create a user with your admin email and password
3. Run the seed migration to promote them to admin (update the email in `004_seed_admin.sql` first)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup (shared auth pages)
│   ├── (traveler)/      # Traveler-facing pages (mobile-first)
│   ├── (operator)/      # Operator dashboard (low-end device optimized)
│   └── (admin)/admin/   # Admin panel (internal tool)
├── components/ui/       # Shared UI components
├── lib/supabase/        # Supabase client utilities
├── types/               # TypeScript types
└── middleware.ts         # Role-based route protection
supabase/
└── migrations/          # Database schema, RLS, triggers
```

## Roles

| Role | Access |
|---|---|
| **Traveler** | Search routes, book seats, pay, view tickets |
| **Operator Rep** | Manage routes, accept/reject bookings, confirm boarding |
| **Admin** | Create operators, manage locations, settle payouts |

## Build Phases

This project follows an 8-phase build plan where each phase ships fully working software:

1. ✅ Foundation, Schema & Auth
2. ⬜ Admin & Operator Setup
3. ⬜ Traveler Search & Comparison
4. ⬜ Reservation Engine
5. ⬜ Payments
6. ⬜ E-Ticket, Boarding & History
7. ⬜ Settlement, Wallet & Disputes
8. ⬜ Mobile Hardening & Launch Readiness
