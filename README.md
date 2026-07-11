# Mukkulathor Community Platform

A production-ready Community Management & Family Registry web application for the **Mukkulathor (Thevar) Community** — covering the **Kallar**, **Maravar**, and **Agamudayar** lineage branches.

The platform maintains a secure, referee-verified membership directory, preserves multi-generation family history, manages community events and notices, and connects verified members worldwide — accessible on Android, iPhone, tablets, laptops, and desktops.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router 6 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Charts | Recharts |
| Email | Resend (via Supabase Edge Functions) |
| Hosting | Netlify |

---

## Project Structure

```
mukkulathor-community/
├── src/
│   ├── components/        # Reusable UI, layout, registration, dashboard, admin, referee, family-tree, events, gallery components
│   ├── context/            # AuthContext (session, profile, role)
│   ├── hooks/               # useSupabaseQuery (shared loading/error/retry pattern)
│   ├── lib/                  # Supabase client, constants, pure helper functions
│   ├── pages/
│   │   ├── public/          # Home, About, History, Objectives, Events, Gallery, Contact, Login, Register
│   │   ├── member/          # Member Dashboard (12 pages)
│   │   ├── referee/         # Referee Dashboard (2 pages)
│   │   └── admin/            # Admin Dashboard (13 pages)
│   ├── routes/               # ProtectedRoute, RoleRoute guards
│   ├── services/             # All Supabase CRUD/RPC calls, grouped by domain
│   └── App.jsx, main.jsx, index.css
├── supabase/
│   ├── migrations/         # 0001–0008, run in order
│   └── functions/            # send-referee-email, send-status-email (Resend integration)
├── docs/                      # This documentation set
├── netlify.toml
└── .env.example
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account
- (Optional, for emails) A free [Resend](https://resend.com) account

### 2. Set up the database
1. Create a new Supabase project.
2. Open **SQL Editor** and run every file in `supabase/migrations/` **in numeric order**, 0001 through 0008. Each is idempotent-safe to run once on a fresh project.
3. Confirm Storage buckets were created: Storage → you should see `profile-photos`, `family-photos`, `documents`, `gallery`, `event-banners`.

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.

### 4. Install and run
```bash
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

### 5. Create your first administrator
1. Register an account through the running site (`/register`).
2. In the Supabase SQL Editor, run:
   ```sql
   update public.profiles
     set role_id = 3, registration_status = 'approved'
     where email = 'your-admin-email@example.com';
   ```
3. Log out and back in — you'll land on the Admin Dashboard.

### 6. (Optional) Deploy email notifications
See `docs/DEPLOYMENT.md` → "Edge Functions & Email" for deploying the two Supabase Edge Functions that send referee-invitation and status-update emails via Resend.

---

## Role-Based Access

| Role | Can access |
|---|---|
| Public Visitor | Home, About, History, Objectives, Events, Gallery, Contact, Login, Register |
| Registered Member | Everything above + Member Dashboard (profile, family tree, events RSVP, notices, gallery, status, settings) |
| Referee | Everything a Member can access + Referee Dashboard (review & decide on assigned applicants) |
| Administrator | Everything + full Admin Dashboard (approvals, member/referee/event/notice/gallery management, reports, analytics, audit logs, system settings) |

Access is enforced in two layers:
1. **Frontend route guards** (`ProtectedRoute`, `RoleRoute`) prevent navigating to pages a role shouldn't see.
2. **Database Row Level Security** (every table) is the real security boundary — even a modified frontend cannot read or write data the signed-in user isn't authorized for.

---

## Further Documentation
- `docs/DATABASE_SCHEMA.md` — full schema reference, RLS policy summary, RPC functions
- `docs/DEPLOYMENT.md` — Netlify + Supabase production deployment, Edge Functions, custom domain, environment variables
- `docs/RESPONSIVE_GUIDELINES.md` — the mobile-first standard applied across every page
- `docs/TESTING_CHECKLIST.md` — the manual QA checklist this build was verified against
