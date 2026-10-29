-- ============================================================================
-- 0011_matrimony.sql
-- Matrimony module: consent-based profiles, interests, shortlists, private
-- photo / horoscope storage.  Requires 0010 (security hardening) first.
--
-- PRIVACY MODEL
--   * Only APPROVED members may use any of it (enforced inside every RPC and
--     storage policy, not just in the UI).
--   * Other members' matrimony rows are NEVER readable through the tables;
--     every cross-member read goes through the mat_* RPCs below, which return
--     whitelisted columns only.
--   * Name, full horoscope details, horoscope file and contact number are
--     released only when the profile owner ACCEPTS an interest request.
--     Either side can revoke afterwards.
--   * Photos are private storage; each profile chooses 'members' (any approved
--     member) or 'after_accept'.
-- Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create sequence if not exists public.mat_code_seq start 1;

create table if not exists public.matrimony_profiles (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  member_code       text unique,
  status            text not null default 'draft' check (status in ('draft', 'published', 'hidden')),

  -- Candidate
  height_cm         smallint check (height_cm between 100 and 250),
  marital_status    text check (marital_status in ('never_married', 'divorced', 'widowed')),
  diet              text check (diet in ('vegetarian', 'non_vegetarian', 'eggetarian', 'occasionally_vegetarian')),
  education_summary text,
  occupation_title  text,
  employer          text,
  income_range      text,
  about             text,

  -- Lineage
  veettu_peyar      text,
  kootam            text,
  kula_deivam       text,
  native_place      text,

  -- Horoscope (details revealed only after an accepted interest)
  jathakam_type     text check (jathakam_type in ('shuddha', 'dosham', 'unknown')),
  rasi              text,
  nakshatram        text,
  padam             smallint check (padam between 1 and 4),
  dosham_note       text,
  horoscope_path    text,   -- storage path inside bucket matrimony-horoscopes

  -- Photo
  photo_path        text,   -- storage path inside bucket matrimony-photos
  photo_visibility  text not null default 'after_accept' check (photo_visibility in ('members', 'after_accept')),

  -- Partner preferences
  pref_age_min      smallint check (pref_age_min between 18 and 80),
  pref_age_max      smallint check (pref_age_max between 18 and 80),
  pref_branches     text[],
  pref_education    text,
  pref_location     text,
  pref_notes        text,

  -- Contact released after accept (defaults to profiles.mobile when null)
  contact_phone     text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists matrimony_profiles_status_idx on public.matrimony_profiles (status);

create table if not exists public.matrimony_interests (
  id            uuid primary key default gen_random_uuid(),
  from_profile  uuid not null references public.profiles (id) on delete cascade,
  to_profile    uuid not null references public.profiles (id) on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'withdrawn', 'revoked')),
  message       text check (message is null or length(message) <= 500),
  created_at    timestamptz not null default now(),
  decided_at    timestamptz,
  unique (from_profile, to_profile),
  check (from_profile <> to_profile)
);
create index if not exists matrimony_interests_to_idx   on public.matrimony_interests (to_profile, status);
create index if not exists matrimony_interests_from_idx on public.matrimony_interests (from_profile, status);

create table if not exists public.matrimony_shortlists (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  target_id   uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, target_id),
  check (profile_id <> target_id)
);
create index if not exists matrimony_shortlists_target_idx on public.matrimony_shortlists (target_id);

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------
drop trigger if exists trg_matrimony_profiles_updated_at on public.matrimony_profiles;
create trigger trg_matrimony_profiles_updated_at before update on public.matrimony_profiles
  for each row execute function public.set_updated_at();

-- member_code is assigned once and can never be edited by the client.
-- Publishing requires an approved member with gender + date of birth.
create or replace function public.matrimony_profiles_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_gender gender_type;
  v_dob    date;
  v_status registration_status_type;
begin
  select gender, dob, registration_status into v_gender, v_dob, v_status
  from public.profiles where id = new.profile_id;

  if tg_op = 'INSERT' then
    new.member_code := 'MK-' || to_char(now(), 'YYYY') || '-'
      || case v_gender when 'female' then 'F' when 'male' then 'M' else 'X' end
      || lpad(nextval('public.mat_code_seq')::text, 3, '0');
  else
    new.member_code := old.member_code;
  end if;

  if new.status = 'published' then
    if v_status is distinct from 'approved' then
      raise exception 'Only approved members can publish a matrimony profile' using errcode = '42501';
    end if;
    if v_gender is null or v_dob is null then
      raise exception 'Please add your gender and date of birth to your profile before publishing' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_matrimony_profiles_guard on public.matrimony_profiles;
create trigger trg_matrimony_profiles_guard
  before insert or update on public.matrimony_profiles
  for each row execute function public.matrimony_profiles_guard();

-- ----------------------------------------------------------------------------
-- Row Level Security: owner + admin only.  Everyone else uses the RPCs.
-- ----------------------------------------------------------------------------
alter table public.matrimony_profiles  enable row level security;
alter table public.matrimony_interests enable row level security;
alter table public.matrimony_shortlists enable row level security;

drop policy if exists "mat_profiles_owner_select" on public.matrimony_profiles;
drop policy if exists "mat_profiles_owner_insert" on public.matrimony_profiles;
drop policy if exists "mat_profiles_owner_update" on public.matrimony_profiles;
drop policy if exists "mat_profiles_owner_delete" on public.matrimony_profiles;
drop policy if exists "mat_profiles_admin_all"    on public.matrimony_profiles;
create policy "mat_profiles_owner_select" on public.matrimony_profiles
  for select to authenticated using (profile_id = auth.uid());
create policy "mat_profiles_owner_insert" on public.matrimony_profiles
  for insert to authenticated with check (profile_id = auth.uid());
create policy "mat_profiles_owner_update" on public.matrimony_profiles
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "mat_profiles_owner_delete" on public.matrimony_profiles
  for delete to authenticated using (profile_id = auth.uid());
create policy "mat_profiles_admin_all" on public.matrimony_profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Interests: each party can see their own rows; all writes go through RPCs.
drop policy if exists "mat_interests_party_select" on public.matrimony_interests;
drop policy if exists "mat_interests_admin_select" on public.matrimony_interests;
create policy "mat_interests_party_select" on public.matrimony_interests
  for select to authenticated using (from_profile = auth.uid() or to_profile = auth.uid());
create policy "mat_interests_admin_select" on public.matrimony_interests
  for select to authenticated using (public.is_admin());

drop policy if exists "mat_shortlists_owner_all" on public.matrimony_shortlists;
create policy "mat_shortlists_owner_all" on public.matrimony_shortlists
  for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

revoke all on public.matrimony_profiles, public.matrimony_interests, public.matrimony_shortlists from anon;
-- Clients never write interests directly (RPC only).
revoke insert, update, delete on public.matrimony_interests from authenticated;

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
create or replace function public.mat_is_approved_caller()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles where id = auth.uid() and registration_status = 'approved'
  );
$$;

-- True when the caller and `p_other` have an ACCEPTED interest (either direction).
create or replace function public.mat_connected_with(p_other uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1 from public.matrimony_interests i
    where i.status = 'accepted'
      and ((i.from_profile = auth.uid() and i.to_profile = p_other)
        or (i.from_profile = p_other and i.to_profile = auth.uid()))
  );
$$;

-- Can the caller see this member's photo?  (definer: the storage policy cannot
-- read another member's matrimony_profiles row because of owner-only RLS)
create or replace function public.mat_photo_visible(p_owner uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select p_owner is not null and (
    p_owner = auth.uid()
    or coalesce(public.is_admin(), false)
    or (
      public.mat_is_approved_caller()
      and exists (
        select 1 from public.matrimony_profiles m
        join public.profiles p on p.id = m.profile_id
        where m.profile_id = p_owner
          and m.status = 'published'
          and p.registration_status = 'approved'
          and (m.photo_visibility = 'members' or public.mat_connected_with(m.profile_id))
      )
    )
  );
$$;

-- Safe uuid from the first path segment (null instead of an error on bad paths).
create or replace function public.mat_path_owner(p_path text)
returns uuid
language sql immutable
set search_path = public, pg_temp
as $$
  select case when split_part(p_path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              then split_part(p_path, '/', 1)::uuid end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: browse / shortlist cards  (NO name, NO contact, NO horoscope details)
-- ----------------------------------------------------------------------------
drop function if exists public.mat_browse(text, int, int, text, text, int, int, boolean);
create function public.mat_browse(
  p_branch          text    default null,
  p_age_min         int     default null,
  p_age_max         int     default null,
  p_district        text    default null,
  p_veettu          text    default null,
  p_limit           int     default 30,
  p_offset          int     default 0,
  p_only_shortlist  boolean default false
)
returns table (
  profile_id        uuid,
  member_code       text,
  age               int,
  gender            text,
  height_cm         smallint,
  branch            text,
  district          text,
  occupation_title  text,
  education_summary text,
  veettu_peyar      text,
  jathakam_type     text,
  photo_path        text,
  is_shortlisted    boolean,
  interest_status   text
)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  v_me_gender  gender_type;
  v_me_veettu  text;
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;

  select p.gender into v_me_gender from public.profiles p where p.id = auth.uid();
  select lower(trim(m.veettu_peyar)) into v_me_veettu from public.matrimony_profiles m where m.profile_id = auth.uid();

  return query
  select m.profile_id, m.member_code,
         date_part('year', age(p.dob))::int,
         p.gender::text,
         m.height_cm,
         p.branch::text,
         p.district,
         m.occupation_title,
         m.education_summary,
         m.veettu_peyar,
         m.jathakam_type,
         case when m.photo_path is not null
               and (m.photo_visibility = 'members' or public.mat_connected_with(m.profile_id))
              then m.photo_path end,
         exists (select 1 from public.matrimony_shortlists s where s.profile_id = auth.uid() and s.target_id = m.profile_id),
         (select i.status from public.matrimony_interests i
           where (i.from_profile = auth.uid() and i.to_profile = m.profile_id)
              or (i.to_profile = auth.uid() and i.from_profile = m.profile_id)
           order by i.created_at desc limit 1)
  from public.matrimony_profiles m
  join public.profiles p on p.id = m.profile_id
  where m.status = 'published'
    and p.registration_status = 'approved'
    and m.profile_id <> auth.uid()
    and (
      (p_only_shortlist and exists (select 1 from public.matrimony_shortlists s
                                    where s.profile_id = auth.uid() and s.target_id = m.profile_id))
      or (not p_only_shortlist
          -- opposite gender by default
          and (v_me_gender is null or v_me_gender = 'other' or p.gender is distinct from v_me_gender)
          -- exogamy rule: same primary Veettu Peyar is never suggested
          and (v_me_veettu is null or v_me_veettu = '' or lower(trim(coalesce(m.veettu_peyar, ''))) is distinct from v_me_veettu))
    )
    and (p_branch   is null or p_branch = '' or p.branch::text = p_branch)
    and (p_district is null or p_district = '' or p.district ilike p_district)
    and (p_veettu   is null or p_veettu = ''   or m.veettu_peyar ilike '%' ||
         replace(replace(replace(p_veettu, '\', '\\'), '%', '\%'), '_', '\_') || '%')
    and (p_age_min is null or date_part('year', age(p.dob)) >= p_age_min)
    and (p_age_max is null or date_part('year', age(p.dob)) <= p_age_max)
  order by m.updated_at desc
  limit least(greatest(coalesce(p_limit, 30), 1), 60)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: full profile (own / admin / approved viewer).  Sensitive parts are
-- included only for self, admin, or an accepted connection.
-- ----------------------------------------------------------------------------
drop function if exists public.mat_get_profile(uuid);
create function public.mat_get_profile(p_profile_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  m          public.matrimony_profiles;
  p          public.profiles;
  v_full     boolean;
  v_self     boolean := (p_profile_id = auth.uid());
  v_admin    boolean := coalesce(public.is_admin(), false);
  v_conn     boolean;
  v_status   text;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if not (v_self or v_admin or public.mat_is_approved_caller()) then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;

  select * into m from public.matrimony_profiles where profile_id = p_profile_id;
  if not found then return null; end if;
  select * into p from public.profiles where id = p_profile_id;

  if not (v_self or v_admin) and (m.status <> 'published' or p.registration_status <> 'approved') then
    return null;
  end if;

  v_conn := public.mat_connected_with(p_profile_id);
  v_full := v_self or v_admin or v_conn;
  select i.status into v_status from public.matrimony_interests i
   where (i.from_profile = auth.uid() and i.to_profile = p_profile_id)
      or (i.to_profile = auth.uid() and i.from_profile = p_profile_id)
   order by i.created_at desc limit 1;

  return jsonb_build_object(
    'profile_id', m.profile_id,
    'member_code', m.member_code,
    'status', m.status,
    'age', date_part('year', age(p.dob))::int,
    'gender', p.gender::text,
    'branch', p.branch::text,
    'district', p.district,
    'height_cm', m.height_cm,
    'marital_status', m.marital_status,
    'diet', m.diet,
    'education_summary', m.education_summary,
    'occupation_title', m.occupation_title,
    'employer', m.employer,
    'about', m.about,
    'veettu_peyar', m.veettu_peyar,
    'kootam', m.kootam,
    'kula_deivam', m.kula_deivam,
    'native_place', m.native_place,
    'jathakam_type', m.jathakam_type,
    'pref_age_min', m.pref_age_min,
    'pref_age_max', m.pref_age_max,
    'pref_branches', m.pref_branches,
    'pref_education', m.pref_education,
    'pref_location', m.pref_location,
    'pref_notes', m.pref_notes,
    'photo_path', case when m.photo_path is not null
                        and (v_self or v_admin or m.photo_visibility = 'members' or v_conn)
                       then m.photo_path end,
    'interest_status', v_status,
    'is_shortlisted', exists (select 1 from public.matrimony_shortlists s
                              where s.profile_id = auth.uid() and s.target_id = p_profile_id),
    'is_connected', v_conn,
    -- released only to self / admin / accepted connection
    'full_name',      case when v_full then p.full_name end,
    'rasi',           case when v_full then m.rasi end,
    'nakshatram',     case when v_full then m.nakshatram end,
    'padam',          case when v_full then m.padam end,
    'dosham_note',    case when v_full then m.dosham_note end,
    'horoscope_path', case when v_full then m.horoscope_path end,
    'contact_phone',  case when v_full then coalesce(nullif(trim(m.contact_phone), ''), p.mobile) end,
    -- self-only settings
    'photo_visibility', case when v_self or v_admin then m.photo_visibility end,
    'income_range',     case when v_self or v_admin then m.income_range end
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: interests
-- ----------------------------------------------------------------------------
drop function if exists public.mat_send_interest(uuid, text);
create function public.mat_send_interest(p_to uuid, p_message text default null)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.matrimony_interests;
  v_pending  int;
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;
  if p_to = auth.uid() then
    raise exception 'You cannot send an interest to yourself' using errcode = '22023';
  end if;
  if not exists (select 1 from public.matrimony_profiles where profile_id = auth.uid() and status = 'published') then
    raise exception 'Publish your own matrimony profile before sending interests' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.matrimony_profiles m join public.profiles p on p.id = m.profile_id
    where m.profile_id = p_to and m.status = 'published' and p.registration_status = 'approved'
  ) then
    raise exception 'That profile is not available' using errcode = '22023';
  end if;

  -- a request in either direction already exists?
  select * into v_existing from public.matrimony_interests
   where (from_profile = p_to and to_profile = auth.uid() and status in ('pending', 'accepted'))
      or (from_profile = auth.uid() and to_profile = p_to)
   order by created_at desc limit 1;

  if found then
    if v_existing.from_profile = p_to then
      raise exception 'This member has already sent you an interest — please respond in Requests' using errcode = '22023';
    elsif v_existing.status in ('pending', 'accepted') then
      raise exception 'You have already sent an interest to this member' using errcode = '22023';
    elsif v_existing.status = 'declined' then
      raise exception 'This member has declined your interest' using errcode = '22023';
    end if;
  end if;

  select count(*) into v_pending from public.matrimony_interests
   where from_profile = auth.uid() and status = 'pending';
  if v_pending >= 20 then
    raise exception 'You have 20 pending interests — please wait for responses' using errcode = '22023';
  end if;

  insert into public.matrimony_interests (from_profile, to_profile, status, message)
  values (auth.uid(), p_to, 'pending', nullif(left(trim(coalesce(p_message, '')), 500), ''))
  on conflict (from_profile, to_profile)
  do update set status = 'pending', message = excluded.message, created_at = now(), decided_at = null;

  perform public.create_notification(
    p_to, 'system', 'New matrimony interest',
    'A community member has expressed interest in your matrimony profile.',
    '/member/matrimony/requests');
end;
$$;

drop function if exists public.mat_respond_interest(uuid, boolean);
create function public.mat_respond_interest(p_interest_id uuid, p_accept boolean)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  i public.matrimony_interests;
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;
  select * into i from public.matrimony_interests where id = p_interest_id for update;
  if not found or i.to_profile <> auth.uid() then
    raise exception 'Request not found' using errcode = '42501';
  end if;
  if i.status <> 'pending' then
    raise exception 'This request has already been answered' using errcode = '22023';
  end if;

  update public.matrimony_interests
     set status = case when p_accept then 'accepted' else 'declined' end, decided_at = now()
   where id = p_interest_id;

  perform public.create_notification(
    i.from_profile, 'system',
    case when p_accept then 'Interest accepted' else 'Interest update' end,
    case when p_accept then 'Your matrimony interest was accepted. Contact details are now shared with you.'
         else 'Your matrimony interest was not taken forward.' end,
    '/member/matrimony/requests');
end;
$$;

-- Sender withdraws a pending request; either side revokes an accepted one.
drop function if exists public.mat_withdraw_interest(uuid);
create function public.mat_withdraw_interest(p_interest_id uuid)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  i public.matrimony_interests;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select * into i from public.matrimony_interests where id = p_interest_id for update;
  if not found or (i.from_profile <> auth.uid() and i.to_profile <> auth.uid()) then
    raise exception 'Request not found' using errcode = '42501';
  end if;

  if i.status = 'pending' and i.from_profile = auth.uid() then
    update public.matrimony_interests set status = 'withdrawn', decided_at = now() where id = p_interest_id;
  elsif i.status = 'accepted' then
    update public.matrimony_interests set status = 'revoked', decided_at = now() where id = p_interest_id;
  else
    raise exception 'Nothing to withdraw' using errcode = '22023';
  end if;
end;
$$;

drop function if exists public.mat_list_requests();
create function public.mat_list_requests()
returns table (
  interest_id       uuid,
  direction         text,
  status            text,
  message           text,
  created_at        timestamptz,
  decided_at        timestamptz,
  other_profile_id  uuid,
  member_code       text,
  age               int,
  branch            text,
  district          text,
  occupation_title  text,
  jathakam_type     text,
  other_name        text,
  other_contact     text
)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;
  return query
  select i.id,
         case when i.to_profile = auth.uid() then 'incoming' else 'outgoing' end,
         i.status, i.message, i.created_at, i.decided_at,
         o.id, m.member_code,
         date_part('year', age(o.dob))::int, o.branch::text, o.district,
         m.occupation_title, m.jathakam_type,
         case when i.status = 'accepted' then o.full_name end,
         case when i.status = 'accepted' then coalesce(nullif(trim(m.contact_phone), ''), o.mobile) end
  from public.matrimony_interests i
  join public.profiles o on o.id = case when i.to_profile = auth.uid() then i.from_profile else i.to_profile end
  left join public.matrimony_profiles m on m.profile_id = o.id
  where (i.to_profile = auth.uid() or i.from_profile = auth.uid())
    and o.registration_status = 'approved'
  order by i.created_at desc;
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: shortlist + dashboard
-- ----------------------------------------------------------------------------
drop function if exists public.mat_toggle_shortlist(uuid);
create function public.mat_toggle_shortlist(p_target uuid)
returns boolean
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;
  if p_target = auth.uid() then
    raise exception 'You cannot shortlist yourself' using errcode = '22023';
  end if;
  if exists (select 1 from public.matrimony_shortlists where profile_id = auth.uid() and target_id = p_target) then
    delete from public.matrimony_shortlists where profile_id = auth.uid() and target_id = p_target;
    return false;
  end if;
  if not exists (select 1 from public.matrimony_profiles where profile_id = p_target and status = 'published') then
    raise exception 'That profile is not available' using errcode = '22023';
  end if;
  insert into public.matrimony_shortlists (profile_id, target_id) values (auth.uid(), p_target);
  return true;
end;
$$;

drop function if exists public.mat_dashboard();
create function public.mat_dashboard()
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  if not public.mat_is_approved_caller() then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'my_status',        (select status from public.matrimony_profiles where profile_id = auth.uid()),
    'member_code',      (select member_code from public.matrimony_profiles where profile_id = auth.uid()),
    'inbound_pending',  (select count(*) from public.matrimony_interests where to_profile = auth.uid() and status = 'pending'),
    'outbound_pending', (select count(*) from public.matrimony_interests where from_profile = auth.uid() and status = 'pending'),
    'accepted',         (select count(*) from public.matrimony_interests
                          where status = 'accepted' and (from_profile = auth.uid() or to_profile = auth.uid())),
    'shortlisted',      (select count(*) from public.matrimony_shortlists where profile_id = auth.uid()),
    'shortlisted_by',   (select count(*) from public.matrimony_shortlists where target_id = auth.uid())
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- Function privileges: signed-in users only
-- ----------------------------------------------------------------------------
revoke all on function public.mat_is_approved_caller()                      from public, anon;
revoke all on function public.mat_connected_with(uuid)                      from public, anon;
revoke all on function public.mat_photo_visible(uuid)                       from public, anon;
revoke all on function public.mat_browse(text, int, int, text, text, int, int, boolean) from public, anon;
revoke all on function public.mat_get_profile(uuid)                         from public, anon;
revoke all on function public.mat_send_interest(uuid, text)                 from public, anon;
revoke all on function public.mat_respond_interest(uuid, boolean)           from public, anon;
revoke all on function public.mat_withdraw_interest(uuid)                   from public, anon;
revoke all on function public.mat_list_requests()                           from public, anon;
revoke all on function public.mat_toggle_shortlist(uuid)                    from public, anon;
revoke all on function public.mat_dashboard()                               from public, anon;
grant execute on function public.mat_is_approved_caller()                   to authenticated;
grant execute on function public.mat_connected_with(uuid)                   to authenticated;
grant execute on function public.mat_photo_visible(uuid)                    to authenticated;
grant execute on function public.mat_browse(text, int, int, text, text, int, int, boolean) to authenticated;
grant execute on function public.mat_get_profile(uuid)                      to authenticated;
grant execute on function public.mat_send_interest(uuid, text)              to authenticated;
grant execute on function public.mat_respond_interest(uuid, boolean)        to authenticated;
grant execute on function public.mat_withdraw_interest(uuid)                to authenticated;
grant execute on function public.mat_list_requests()                        to authenticated;
grant execute on function public.mat_toggle_shortlist(uuid)                 to authenticated;
grant execute on function public.mat_dashboard()                            to authenticated;
-- mat_path_owner is used inside storage policies (evaluated for any role).
grant execute on function public.mat_path_owner(text)                       to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Storage: PRIVATE buckets.  Path convention: {profile_id}/{filename}
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('matrimony-photos',     'matrimony-photos',     false, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('matrimony-horoscopes', 'matrimony-horoscopes', false, 8388608,  array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

-- Photos
drop policy if exists "mat_photos_owner_write"  on storage.objects;
drop policy if exists "mat_photos_owner_update" on storage.objects;
drop policy if exists "mat_photos_owner_delete" on storage.objects;
drop policy if exists "mat_photos_read"         on storage.objects;
create policy "mat_photos_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'matrimony-photos' and public.mat_path_owner(name) = auth.uid());
create policy "mat_photos_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'matrimony-photos' and public.mat_path_owner(name) = auth.uid());
create policy "mat_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'matrimony-photos' and public.mat_path_owner(name) = auth.uid());
create policy "mat_photos_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'matrimony-photos' and public.mat_photo_visible(public.mat_path_owner(name)));

-- Horoscope files: owner, admin, or an accepted connection only
drop policy if exists "mat_horo_owner_write"  on storage.objects;
drop policy if exists "mat_horo_owner_update" on storage.objects;
drop policy if exists "mat_horo_owner_delete" on storage.objects;
drop policy if exists "mat_horo_read"         on storage.objects;
create policy "mat_horo_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'matrimony-horoscopes' and public.mat_path_owner(name) = auth.uid());
create policy "mat_horo_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'matrimony-horoscopes' and public.mat_path_owner(name) = auth.uid());
create policy "mat_horo_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'matrimony-horoscopes' and public.mat_path_owner(name) = auth.uid());
create policy "mat_horo_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'matrimony-horoscopes'
    and (
      public.mat_path_owner(name) = auth.uid()
      or public.is_admin()
      or public.mat_connected_with(public.mat_path_owner(name))
    )
  );
