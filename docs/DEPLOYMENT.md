# Deployment Guide

This guide takes the project from a local clone to a live production deployment on Netlify, backed by Supabase.

---

## 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run every file in `supabase/migrations/` in order (0001 → 0008). Skip `0005_seed_data.sql` if you don't want demo events/notices/gallery content in production.
3. In **Authentication → URL Configuration**, set:
   - **Site URL**: your production URL (e.g. `https://mukkulathorcommunity.netlify.app`)
   - **Redirect URLs**: add the same URL plus `http://localhost:5173` for local development
4. In **Authentication → Email Templates**, customize the confirmation email if desired (optional — default works fine).
5. Note your **Project URL** and **anon public key** from **Project Settings → API** — you'll need these for the frontend.
6. Note your **service_role key** from the same page — you'll need this for Edge Function secrets (never expose this key in frontend code).

---

## 2. Edge Functions & Email (Resend)

The platform sends two kinds of transactional email: referee-invitation emails and status-update emails, both via [Resend](https://resend.com).

### 2.1 Get a Resend API key
1. Sign up at resend.com (free tier is sufficient to start).
2. Verify a sending domain (or use their test domain while developing).
3. Create an API key.

### 2.2 Install the Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.3 Set secrets
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set RESEND_FROM_EMAIL="Mukkulathor Community <notifications@yourdomain.com>"
supabase secrets set SITE_URL=https://your-production-url.netlify.app
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available inside Edge Functions — no need to set them manually.)

### 2.4 Deploy the functions
```bash
supabase functions deploy send-referee-email
supabase functions deploy send-status-email
```

### 2.5 Verify
Submit a test registration through the running app and select a referee — the referee should receive an email within a few seconds. Check **Edge Functions → Logs** in the Supabase dashboard if it doesn't arrive.

> The app works fully without this step — registrations, approvals, and in-app notifications all function normally. Email is an enhancement, not a hard dependency.

---

## 3. Frontend Deployment (Netlify)

### Option A — Netlify UI (recommended for first deploy)
1. Push this project to a GitHub/GitLab/Bitbucket repository.
2. In Netlify: **Add new site → Import an existing project** → select your repository.
3. Build settings (auto-detected from `netlify.toml`, but confirm):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Under **Site settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Netlify will give you a `*.netlify.app` URL.

### Option B — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify deploy --prod
```

### 3.1 Update Supabase redirect URLs
Go back to Supabase → **Authentication → URL Configuration** and update the **Site URL** to your real Netlify URL (and add it to Redirect URLs) so email confirmation links work correctly.

### 3.2 Custom domain (optional)
In Netlify: **Domain settings → Add a custom domain**, then follow their DNS instructions. Once attached, update the Supabase Site URL and the `SITE_URL` Edge Function secret to match.

---

## 4. Creating the First Administrator

Registration always creates a `member` by default — there's no public "sign up as admin" path (by design, for security). After your first real account registers:

```sql
update public.profiles
  set role_id = 3, registration_status = 'approved'
  where email = 'admin@yourdomain.com';
```

Run this once in the Supabase SQL Editor. The user should log out and back in to pick up the new role.

---

## 5. Post-Deployment Checklist

- [ ] All 8 migrations applied successfully, no errors in SQL Editor
- [ ] Storage buckets visible: `profile-photos`, `family-photos`, `documents`, `gallery`, `event-banners`
- [ ] `.env` / Netlify environment variables point to the **production** Supabase project (not a local/dev one)
- [ ] First admin account created and verified (`role_id = 3`)
- [ ] Test registration → referee selection → referee approval → admin approval flow end-to-end
- [ ] Edge Functions deployed and a test referee-invitation email received (optional but recommended)
- [ ] Netlify redirect rules active (refreshing a deep link like `/member/dashboard` should not 404 — `netlify.toml` already includes the SPA fallback rule)
- [ ] Site loads correctly on a real Android phone and iPhone, not just desktop dev tools emulation

---

## 6. Updating the Live Site

Any push to your connected Git branch triggers an automatic Netlify rebuild. For database changes, write a new numbered migration file (e.g. `0009_my_change.sql`) and run it manually in the Supabase SQL Editor — migrations are not auto-applied by Netlify.
