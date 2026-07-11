-- ============================================================================
-- 0001_init_schema.sql
-- Mukkulathor Community Platform — Core Schema
-- ============================================================================
-- This migration creates all enums and tables for the platform. It is written
-- to run on a fresh Supabase project (PostgreSQL 15+) via:
--   supabase db push
-- or by pasting into the Supabase SQL Editor in order (0001 -> 0002 -> ...).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- for fast member search (ILIKE / similarity)

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
create type app_role as enum ('member', 'referee', 'admin');

create type branch_type as enum ('kallar', 'maravar', 'agamudayar');

create type gender_type as enum ('male', 'female', 'other');

create type marriage_status_type as enum ('single', 'married', 'widowed', 'divorced');

create type registration_status_type as enum (
  'draft',                        -- multi-step form in progress
  'pending_referee_verification', -- submitted, waiting on referees
  'pending_admin_approval',       -- all referees responded (or enough did)
  'approved',
  'rejected',
  'suspended'
);

create type recommendation_status_type as enum ('pending', 'approved', 'rejected');

create type relation_type as enum (
  'great_grandfather', 'great_grandmother',
  'grandfather', 'grandmother',
  'father', 'mother',
  'family_head', 'spouse', 'child', 'sibling', 'other'
);

create type document_type as enum (
  'profile_photo', 'family_photo', 'id_proof', 'address_proof', 'supporting_document'
);

create type notification_type as enum (
  'registration', 'referee_action', 'approval', 'rejection', 'event', 'notice', 'system'
);

-- ----------------------------------------------------------------------------
-- ROLES  (lookup table — referenced by profiles.role_id)
-- ----------------------------------------------------------------------------
create table public.roles (
  id          smallint primary key,
  name        app_role not null unique,
  description text
);

insert into public.roles (id, name, description) values
  (1, 'member',   'Verified community member'),
  (2, 'referee',  'Member empowered to verify new registrations'),
  (3, 'admin',    'Platform administrator');

-- ----------------------------------------------------------------------------
-- PROFILES
-- Extends auth.users (Supabase manages auth.users; this is the public,
-- application-facing "users" table containing everything from the
-- registration wizard Steps 1, 2 and 4).
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  role_id             smallint not null default 1 references public.roles (id),

  -- Step 1 — Personal Details
  full_name           text not null,
  gender              gender_type,
  dob                 date,
  blood_group         text,
  mobile              text,
  email               text,
  address             text,
  country             text,
  district            text,
  village             text,

  -- Step 2 — Community Details
  community           text default 'Mukkulathor',
  branch              branch_type,
  sub_group           text,       -- Pattam / Clan
  kula_deivam         text,
  religion            text,
  native_place        text,

  -- Step 3 — Family summary (detail rows live in family_members)
  marriage_status     marriage_status_type default 'single',
  marriage_date       date,
  family_id           text, -- human-readable family registry code, e.g. MTC-KAL-000123 (shared across relatives)

  -- Step 4 — Education / Occupation
  education           text,
  occupation           text,
  business_details    text,
  professional_details text,

  -- Media
  profile_photo_url   text,

  -- Workflow
  registration_status registration_status_type not null default 'draft',
  rejection_reason    text,
  approved_by         uuid references public.profiles (id),
  approved_at         timestamptz,

  -- Bookkeeping
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_branch_idx on public.profiles (branch);
create index profiles_status_idx on public.profiles (registration_status);
create index profiles_role_idx on public.profiles (role_id);
create index profiles_name_trgm_idx on public.profiles using gin (full_name gin_trgm_ops);
create index profiles_family_id_idx on public.profiles (family_id);

comment on table public.profiles is 'Public extension of auth.users — the application "users" table. One row per registered person.';

-- ----------------------------------------------------------------------------
-- FAMILY MEMBERS
-- Individual relatives recorded against a profile (great grandfather ... children)
-- ----------------------------------------------------------------------------
create table public.family_members (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  relation_type   relation_type not null,
  full_name       text not null,
  gender          gender_type,
  dob             date,
  dod             date,                -- date of death, if applicable
  is_living       boolean default true,
  occupation      text,
  notes           text,
  photo_url       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index family_members_profile_idx on public.family_members (profile_id);
create index family_members_relation_idx on public.family_members (relation_type);

-- ----------------------------------------------------------------------------
-- FAMILY TREE  (edges connecting family_members into a tree per profile)
-- parent_member_id = null  ->  this node is a root of the tree (e.g. the
-- great-grandfather). The visualization component walks edges client-side.
-- ----------------------------------------------------------------------------
create table public.family_tree (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles (id) on delete cascade,
  member_id         uuid not null references public.family_members (id) on delete cascade,
  parent_member_id  uuid references public.family_members (id) on delete cascade,
  generation_level  smallint not null default 0, -- 0 = applicant's generation, negative = ancestors
  position_order    smallint default 0,
  created_at        timestamptz not null default now(),
  unique (profile_id, member_id)
);

create index family_tree_profile_idx on public.family_tree (profile_id);
create index family_tree_parent_idx on public.family_tree (parent_member_id);

-- ----------------------------------------------------------------------------
-- REFEREES  (a profile that is empowered to recommend/verify applicants)
-- ----------------------------------------------------------------------------
create table public.referees (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references public.profiles (id) on delete cascade,
  designation     text,           -- e.g. "Village Elder", "Committee Member"
  region          text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index referees_active_idx on public.referees (is_active);

-- ----------------------------------------------------------------------------
-- REFEREE RECOMMENDATIONS
-- One row per (applicant, referee) chosen during Step 6 of registration.
-- ----------------------------------------------------------------------------
create table public.referee_recommendations (
  id                  uuid primary key default gen_random_uuid(),
  applicant_id        uuid not null references public.profiles (id) on delete cascade,
  referee_id          uuid not null references public.referees (id) on delete cascade,
  status              recommendation_status_type not null default 'pending',
  comments            text,
  notified_at         timestamptz,
  decided_at          timestamptz,
  created_at          timestamptz not null default now(),
  unique (applicant_id, referee_id)
);

create index referee_recs_applicant_idx on public.referee_recommendations (applicant_id);
create index referee_recs_referee_idx on public.referee_recommendations (referee_id);
create index referee_recs_status_idx on public.referee_recommendations (status);

-- ----------------------------------------------------------------------------
-- MEMBER STATUS  (full audit history of registration_status changes)
-- ----------------------------------------------------------------------------
create table public.member_status (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  status      registration_status_type not null,
  changed_by  uuid references public.profiles (id),
  note        text,
  created_at  timestamptz not null default now()
);

create index member_status_profile_idx on public.member_status (profile_id);

-- ----------------------------------------------------------------------------
-- EVENTS
-- ----------------------------------------------------------------------------
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  event_date    date not null,
  start_time    time,
  end_time      time,
  location      text,
  banner_url    text,
  category      text default 'General',
  is_published  boolean not null default true,
  created_by    uuid references public.profiles (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index events_date_idx on public.events (event_date);
create index events_published_idx on public.events (is_published);

-- ----------------------------------------------------------------------------
-- NOTICES
-- ----------------------------------------------------------------------------
create table public.notices (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text not null,
  category      text default 'General',
  is_pinned     boolean not null default false,
  is_published  boolean not null default true,
  published_at  timestamptz default now(),
  expires_at    timestamptz,
  created_by    uuid references public.profiles (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index notices_published_idx on public.notices (is_published, published_at desc);
create index notices_pinned_idx on public.notices (is_pinned);

-- ----------------------------------------------------------------------------
-- GALLERY
-- ----------------------------------------------------------------------------
create table public.gallery (
  id            uuid primary key default gen_random_uuid(),
  title         text,
  description   text,
  image_url     text not null,
  album         text default 'General',
  uploaded_by   uuid references public.profiles (id),
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create index gallery_album_idx on public.gallery (album);

-- ----------------------------------------------------------------------------
-- DOCUMENTS  (uploads from Step 5 of registration + later profile edits)
-- ----------------------------------------------------------------------------
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  doc_type      document_type not null,
  file_url      text not null,
  file_name     text,
  file_size     integer,
  verified      boolean not null default false,
  verified_by   uuid references public.profiles (id),
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index documents_profile_idx on public.documents (profile_id);
create index documents_type_idx on public.documents (doc_type);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  type        notification_type not null default 'system',
  title       text not null,
  message     text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_profile_idx on public.notifications (profile_id, is_read);

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id),
  action      text not null,           -- e.g. 'APPROVE_MEMBER', 'REJECT_MEMBER', 'CREATE_EVENT'
  entity_type text not null,           -- e.g. 'profile', 'event', 'notice'
  entity_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- Convenience view: "users" — joins auth identity with the public profile.
-- (auth.users itself is managed by Supabase Auth and should not be modified
-- directly; this view is what the spec's "users" table maps to.)
-- ----------------------------------------------------------------------------
create view public.users_view as
  select
    p.*,
    u.email as auth_email,
    u.email_confirmed_at,
    u.last_sign_in_at,
    r.name as role_name
  from public.profiles p
  join auth.users u on u.id = p.id
  join public.roles r on r.id = p.role_id;
