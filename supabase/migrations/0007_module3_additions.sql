-- ============================================================================
-- 0007_module3_additions.sql
-- Supports: Event RSVPs, member privacy controls, notification preferences
-- ============================================================================

create type rsvp_status_type as enum ('going', 'interested', 'not_going');

-- ----------------------------------------------------------------------------
-- Privacy & notification preferences on the profile
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column is_directory_visible boolean not null default true,
  add column notification_preferences jsonb not null default '{
    "email_notifications": true,
    "event_reminders": true,
    "notice_alerts": true,
    "referee_updates": true
  }'::jsonb;

comment on column public.profiles.is_directory_visible is
  'When false, an approved member opts out of appearing in the cross-member directory search (profiles_select_directory policy).';

-- Re-create the directory policy to respect the new opt-out flag
drop policy if exists "profiles_select_directory" on public.profiles;
create policy "profiles_select_directory" on public.profiles
  for select using (registration_status = 'approved' and is_directory_visible = true);

-- ----------------------------------------------------------------------------
-- EVENT RSVPS
-- ----------------------------------------------------------------------------
create table public.event_rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  status      rsvp_status_type not null default 'going',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (event_id, profile_id)
);

create index event_rsvps_event_idx on public.event_rsvps (event_id);
create index event_rsvps_profile_idx on public.event_rsvps (profile_id);

create trigger trg_event_rsvps_updated_at before update on public.event_rsvps
  for each row execute function public.set_updated_at();

alter table public.event_rsvps enable row level security;

create policy "rsvp_select_own" on public.event_rsvps
  for select using (profile_id = auth.uid());

create policy "rsvp_select_admin" on public.event_rsvps
  for select using (public.is_admin());

create policy "rsvp_owner_write" on public.event_rsvps
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Aggregate counts only (no row-level identity) — safe to expose broadly so
-- members can see "24 going" without seeing who, beyond their own RSVP row.
create view public.event_rsvp_summary as
  select
    event_id,
    count(*) filter (where status = 'going') as going_count,
    count(*) filter (where status = 'interested') as interested_count,
    count(*) filter (where status = 'not_going') as not_going_count
  from public.event_rsvps
  group by event_id;

grant select on public.event_rsvp_summary to authenticated, anon;
