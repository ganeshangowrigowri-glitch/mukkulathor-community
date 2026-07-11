# Database Schema Reference

PostgreSQL via Supabase. All tables use Row Level Security (RLS) — there is no client-side-only security in this application.

## Migration Order

Run these files in the Supabase SQL Editor **in order**:

| File | Purpose |
|---|---|
| `0001_init_schema.sql` | Enums, all core tables, indexes |
| `0002_functions_triggers.sql` | `handle_new_user`, role helpers, registration workflow RPCs |
| `0003_rls_policies.sql` | Row Level Security policies for every table |
| `0004_storage.sql` | Storage buckets + storage object policies |
| `0005_seed_data.sql` | Optional demo events/notices/gallery — safe to skip in production |
| `0006_enhancements.sql` | `registration_type` (Family Head / Individual Member), full referee-decision audit logging |
| `0007_module3_additions.sql` | `event_rsvps`, member privacy + notification preference columns |
| `0008_system_settings.sql` | Singleton `system_settings` table for Admin → System Settings |

## Core Tables

- **roles** — lookup: member / referee / admin
- **profiles** — extends `auth.users`; one row per registered person (personal, community, family-summary, education, and workflow fields)
- **family_members** — individual relatives recorded against a profile (great-grandfather → children, extensible)
- **family_tree** — parent/child edges between `family_members`, keyed by `generation_level` (supports unlimited future generations)
- **referees** — a profile empowered to recommend applicants
- **referee_recommendations** — one row per (applicant, referee); status + comments + timestamps
- **member_status** — append-only history of every `registration_status` change
- **events** / **event_rsvps** — community events and member RSVPs (going / interested / not going)
- **notices** — announcements, pinned/expiring
- **gallery** — published photos, grouped by album
- **documents** — uploaded ID/address proofs and supporting documents (private bucket)
- **notifications** — per-user notification feed
- **audit_logs** — append-only log of every administrative and referee decision
- **system_settings** — singleton row of admin-configurable platform settings

## Registration Workflow (state machine)

```
draft
  → pending_referee_verification   (on submit_registration RPC)
    → pending_admin_approval        (once every selected referee has responded, ≥1 approved)
      → approved                     (admin_decide_registration RPC, approve=true)
      → rejected                     (admin_decide_registration RPC, approve=false)
    → rejected                       (auto, if ALL referees reject)
```

Every transition writes a row to `member_status` (for the applicant-facing timeline) and, for referee/admin actions, a row to `audit_logs` (for the admin-facing audit trail) — independent tables serving two different audiences.

## Key RPC Functions (security definer)

| Function | Caller | Purpose |
|---|---|---|
| `submit_registration(p_referee_ids)` | Member | Moves draft → pending_referee_verification, creates recommendation rows + notifications |
| `decide_referee_recommendation(p_recommendation_id, p_status, p_comments)` | Referee | Records a referee's decision; auto-advances applicant once all referees respond |
| `admin_decide_registration(p_profile_id, p_approve, p_reason)` | Admin | Final approval/rejection; generates `family_id` on approval |
| `promote_to_referee(p_profile_id, p_designation, p_region)` | Admin | Grants the referee role to an approved member |

All four are `security definer` so they can safely bypass row-level restrictions to write related rows (e.g. a referee writing to a notification on the applicant's behalf) — call-site authorization is still enforced inside each function body.

## Row Level Security Summary

- **profiles**: a user always sees their own row; admins see all; referees see only applicants who selected them; approved+directory-visible profiles are readable by any authenticated member (the public directory).
- **documents** / storage `documents` bucket: private — owner, assigned referees, and admins only. Never publicly accessible.
- **referee_recommendations**: applicant sees their own; referee sees rows where they're the referee; admin sees all.
- **audit_logs**: admin-only, insert-only from RPCs.
- All public-content tables (`events`, `notices`, `gallery`) are readable by anyone when `is_published = true`; full CRUD is admin-only.

## Storage Buckets

| Bucket | Public? | Notes |
|---|---|---|
| `profile-photos` | Yes | Owner-writable, public read |
| `family-photos` | Yes | Owner-writable, public read |
| `documents` | **No** | Owner + assigned referees + admin only, via signed URLs |
| `gallery` | Yes | Admin-managed |
| `event-banners` | Yes | Admin-managed |

Object paths are namespaced `{profile_id}/filename` so RLS can authorize by comparing the path's first segment to `auth.uid()`.
