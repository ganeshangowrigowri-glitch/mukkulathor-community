-- ============================================================================
-- 0002_functions_triggers.sql
-- Business-logic functions, triggers and RPCs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Generic updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_family_members_updated_at before update on public.family_members
  for each row execute function public.set_updated_at();
create trigger trg_events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger trg_notices_updated_at before update on public.notices
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- current_app_role(): helper used throughout RLS policies & RPCs
-- ----------------------------------------------------------------------------
create or replace function public.current_app_role()
returns app_role
language sql stable security definer
set search_path = public as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() = 'admin';
$$;

create or replace function public.is_referee()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.referees ref
    where ref.profile_id = auth.uid() and ref.is_active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- handle_new_user(): fires when Supabase Auth creates a row in auth.users
-- (i.e. right after sign-up). Creates the matching public.profiles row using
-- metadata passed at sign-up time (full_name, mobile, etc.)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, mobile, registration_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Member'),
    new.email,
    new.raw_user_meta_data->>'mobile',
    'draft'
  );

  insert into public.member_status (profile_id, status, note)
  values (new.id, 'draft', 'Account created');

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- create_notification(): small helper used by other functions
-- ----------------------------------------------------------------------------
create or replace function public.create_notification(
  p_profile_id uuid, p_type notification_type, p_title text, p_message text, p_link text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (profile_id, type, title, message, link)
  values (p_profile_id, p_type, p_title, p_message, p_link);
end;
$$;

-- ----------------------------------------------------------------------------
-- generate_family_id(): MTC-<BRANCH>-000123 style human-readable registry code
-- ----------------------------------------------------------------------------
create sequence if not exists public.family_id_seq start 1;

create or replace function public.generate_family_id(p_branch branch_type)
returns text language plpgsql as $$
declare
  v_prefix text;
  v_next   bigint;
begin
  v_prefix := case p_branch
    when 'kallar' then 'KAL'
    when 'maravar' then 'MAR'
    when 'agamudayar' then 'AGM'
    else 'GEN'
  end;
  v_next := nextval('public.family_id_seq');
  return 'MTC-' || v_prefix || '-' || lpad(v_next::text, 6, '0');
end;
$$;

-- ----------------------------------------------------------------------------
-- submit_registration(): called by the applicant after Step 6. Moves the
-- profile from 'draft' to 'pending_referee_verification', creates the
-- referee_recommendations rows, and queues notifications (the actual email
-- send is performed by the Edge Function `send-referee-email`, invoked from
-- the frontend right after this RPC succeeds).
-- ----------------------------------------------------------------------------
create or replace function public.submit_registration(
  p_referee_ids uuid[]
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_referee_id uuid;
begin
  if array_length(p_referee_ids, 1) is null then
    raise exception 'At least one referee must be selected';
  end if;

  update public.profiles
    set registration_status = 'pending_referee_verification'
    where id = auth.uid();

  insert into public.member_status (profile_id, status, note)
  values (auth.uid(), 'pending_referee_verification', 'Registration submitted by applicant');

  foreach v_referee_id in array p_referee_ids loop
    insert into public.referee_recommendations (applicant_id, referee_id, status)
    values (auth.uid(), v_referee_id, 'pending')
    on conflict (applicant_id, referee_id) do nothing;

    perform public.create_notification(
      (select profile_id from public.referees where id = v_referee_id),
      'referee_action',
      'New recommendation request',
      'A new applicant has selected you as a referee. Please review their registration.',
      '/referee/dashboard'
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- decide_referee_recommendation(): referee approves/rejects an applicant
-- ----------------------------------------------------------------------------
create or replace function public.decide_referee_recommendation(
  p_recommendation_id uuid,
  p_status recommendation_status_type,
  p_comments text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_referee_profile_id uuid;
  v_applicant_id uuid;
  v_total int;
  v_pending int;
  v_approved int;
  v_rejected int;
begin
  select profile_id into v_referee_profile_id from public.referees where id = (
    select referee_id from public.referee_recommendations where id = p_recommendation_id
  );

  if v_referee_profile_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'Not authorized to decide this recommendation';
  end if;

  update public.referee_recommendations
    set status = p_status, comments = p_comments, decided_at = now()
    where id = p_recommendation_id
    returning applicant_id into v_applicant_id;

  select count(*), count(*) filter (where status = 'pending'),
         count(*) filter (where status = 'approved'),
         count(*) filter (where status = 'rejected')
    into v_total, v_pending, v_approved, v_rejected
    from public.referee_recommendations where applicant_id = v_applicant_id;

  perform public.create_notification(
    v_applicant_id, 'referee_action',
    'Referee responded',
    format('A referee has %s your registration.', p_status),
    '/member/status'
  );

  -- Once every referee has responded, move to admin review (unless every
  -- single referee rejected, in which case auto-reject with reason).
  if v_pending = 0 then
    if v_approved > 0 then
      update public.profiles set registration_status = 'pending_admin_approval' where id = v_applicant_id;
      insert into public.member_status (profile_id, status, note)
        values (v_applicant_id, 'pending_admin_approval', 'All referees responded; forwarded to admin');
    else
      update public.profiles set registration_status = 'rejected',
        rejection_reason = 'Rejected by all selected referees'
        where id = v_applicant_id;
      insert into public.member_status (profile_id, status, note)
        values (v_applicant_id, 'rejected', 'Rejected by all selected referees');
      perform public.create_notification(
        v_applicant_id, 'rejection', 'Registration rejected',
        'All referees rejected your recommendation request.', '/member/status'
      );
    end if;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- admin_decide_registration(): final approval/rejection, admin-only
-- ----------------------------------------------------------------------------
create or replace function public.admin_decide_registration(
  p_profile_id uuid,
  p_approve boolean,
  p_reason text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_branch branch_type;
  v_existing_family_id text;
  v_family_id text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can finalize registrations';
  end if;

  if p_approve then
    select branch, family_id into v_branch, v_existing_family_id from public.profiles where id = p_profile_id;

    if v_existing_family_id is not null and length(trim(v_existing_family_id)) > 0 then
      v_family_id := v_existing_family_id; -- applicant linked to an already-registered family
    else
      v_family_id := public.generate_family_id(coalesce(v_branch, 'kallar'));
    end if;

    update public.profiles
      set registration_status = 'approved',
          family_id = v_family_id,
          approved_by = auth.uid(),
          approved_at = now()
      where id = p_profile_id;

    insert into public.member_status (profile_id, status, changed_by, note)
      values (p_profile_id, 'approved', auth.uid(), 'Approved by administrator');

    perform public.create_notification(
      p_profile_id, 'approval', 'Welcome to the community!',
      format('Your registration has been approved. Your Family ID is %s.', v_family_id),
      '/member/dashboard'
    );
  else
    update public.profiles
      set registration_status = 'rejected', rejection_reason = p_reason
      where id = p_profile_id;

    insert into public.member_status (profile_id, status, changed_by, note)
      values (p_profile_id, 'rejected', auth.uid(), coalesce(p_reason, 'Rejected by administrator'));

    perform public.create_notification(
      p_profile_id, 'rejection', 'Registration update',
      coalesce(p_reason, 'Your registration was not approved at this time.'), '/member/status'
    );
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    case when p_approve then 'APPROVE_MEMBER' else 'REJECT_MEMBER' end,
    'profile', p_profile_id, jsonb_build_object('reason', p_reason)
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- promote_to_referee(): admin grants referee role to an approved member
-- ----------------------------------------------------------------------------
create or replace function public.promote_to_referee(
  p_profile_id uuid, p_designation text default null, p_region text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can assign referees';
  end if;

  insert into public.referees (profile_id, designation, region)
  values (p_profile_id, p_designation, p_region)
  on conflict (profile_id) do update set is_active = true, designation = excluded.designation, region = excluded.region;

  update public.profiles set role_id = 2 where id = p_profile_id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'PROMOTE_REFEREE', 'profile', p_profile_id);

  perform public.create_notification(
    p_profile_id, 'system', 'You are now a referee',
    'The admin has granted you referee privileges. You can now review registration requests.',
    '/referee/dashboard'
  );
end;
$$;
