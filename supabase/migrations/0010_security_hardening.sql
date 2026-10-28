-- ============================================================================
-- 0010_security_hardening.sql
-- Closes the anonymous / cross-member profile exposure and protects privileged
-- profile columns.  Idempotent: safe to re-run.
--
-- NOTE: migration 0009 (legacy alias sync trigger) exists on the live database
-- but is not in this repository.  This file touches none of its objects.
--
-- DEPLOY ORDER: (1) deploy the updated src/services/*.js build to Netlify
-- first or at the same time, (2) run this migration.  The old build reads
-- referee names straight from `profiles`, which this migration blocks.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Narrow, authorised read paths that replace the broad directory policy
-- ----------------------------------------------------------------------------

-- 1a. Referee picker (registration Step 6): names of active referees only.
drop function if exists public.list_active_referees();
create function public.list_active_referees()
returns table (
  referee_id  uuid,
  designation text,
  region      text,
  full_name   text,
  branch      branch_type,
  district    text
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select r.id, r.designation, r.region, p.full_name, p.branch, p.district
  from public.referees r
  join public.profiles p on p.id = r.profile_id
  where auth.uid() is not null
    and r.is_active = true
    and p.registration_status = 'approved'
    and p.is_directory_visible = true
  order by p.full_name;
$$;

-- 1b. Membership Status page: the applicant's own recommendations + referee
--     names.  Applicant themself or an admin only.
drop function if exists public.get_recommendations_for_applicant(uuid);
create function public.get_recommendations_for_applicant(p_applicant_id uuid)
returns table (
  id            uuid,
  applicant_id  uuid,
  referee_id    uuid,
  status        recommendation_status_type,
  comments      text,
  decided_at    timestamptz,
  created_at    timestamptz,
  referee_name  text
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select rr.id, rr.applicant_id, rr.referee_id, rr.status, rr.comments,
         rr.decided_at, rr.created_at, p.full_name
  from public.referee_recommendations rr
  join public.referees r on r.id = rr.referee_id
  join public.profiles p on p.id = r.profile_id
  where rr.applicant_id = p_applicant_id
    and (p_applicant_id = auth.uid() or public.is_admin())
  order by rr.created_at;
$$;

-- 1c. Member directory search: approved callers only, whitelisted columns only
--     (never mobile / email / address / dob).
drop function if exists public.search_member_directory(text, int);
create function public.search_member_directory(p_query text default null, p_limit int default 50)
returns table (
  id                uuid,
  full_name         text,
  branch            branch_type,
  district          text,
  village           text,
  family_id         text,
  profile_photo_url text
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select p.id, p.full_name, p.branch, p.district, p.village, p.family_id, p.profile_photo_url
  from public.profiles p
  where (
          public.is_admin()
          or exists (select 1 from public.profiles me
                     where me.id = auth.uid() and me.registration_status = 'approved')
        )
    and p.registration_status = 'approved'
    and p.is_directory_visible = true
    and (
          p_query is null or length(trim(p_query)) = 0
          or p.full_name ilike '%' || replace(replace(replace(trim(p_query), '\', '\\'), '%', '\%'), '_', '\_') || '%'
        )
  order by p.full_name
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

revoke all on function public.list_active_referees()                       from public, anon;
revoke all on function public.get_recommendations_for_applicant(uuid)      from public, anon;
revoke all on function public.search_member_directory(text, int)           from public, anon;
grant execute on function public.list_active_referees()                    to authenticated;
grant execute on function public.get_recommendations_for_applicant(uuid)   to authenticated;
grant execute on function public.search_member_directory(text, int)        to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Remove the over-broad read policies (this is the anonymous leak)
--    The policy had no `to` clause, so it applied to anon as well.
--    Remaining profile read policies: own row, admin, referee-for-applicant.
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_directory"     on public.profiles;
drop policy if exists "family_tree_directory_select"  on public.family_tree;

-- ----------------------------------------------------------------------------
-- 3. users_view joined every profile column + auth.users data and ran with the
--    owner's rights (bypassing RLS).  Nothing in the app uses it.
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.users_view') is not null then
    execute 'alter view public.users_view set (security_invoker = true)';
    execute 'revoke all on public.users_view from public, anon, authenticated';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 4. Defence in depth: the anon role has no business touching these tables
--    (RLS already returns nothing, this makes it an outright permission error).
-- ----------------------------------------------------------------------------
revoke all on public.profiles                from anon;
revoke all on public.family_members          from anon;
revoke all on public.family_tree             from anon;
revoke all on public.referees                from anon;
revoke all on public.referee_recommendations from anon;
revoke all on public.member_status           from anon;
revoke all on public.documents               from anon;
revoke all on public.notifications           from anon;
revoke all on public.audit_logs              from anon;

-- ----------------------------------------------------------------------------
-- 5. Guard trigger: only administrators (or trusted server-side code) may change
--    privileged profile columns.
--
--    * Direct client writes run as role `authenticated` -> guarded.
--    * SECURITY DEFINER RPCs (submit_registration, decide_referee_recommendation,
--      admin_decide_registration, promote_to_referee) run as their owner ->
--      not guarded, so approval / rejection / referee promotion keep working.
--    * Edge Functions using the service-role key run as `service_role` -> not guarded.
--    * Admin UI actions (suspend / reactivate) pass because is_admin() is true.
--
--    A non-admin's attempt to change a protected column is silently reverted to
--    the stored value (with a server-log warning) instead of raising an error,
--    so forms that resend the whole profile row do not break.
-- ----------------------------------------------------------------------------
create or replace function public.guard_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.role_id             is distinct from old.role_id
    or new.registration_status is distinct from old.registration_status
    or new.approved_by         is distinct from old.approved_by
    or new.approved_at         is distinct from old.approved_at
    or new.rejection_reason    is distinct from old.rejection_reason then
      raise warning 'profiles guard: blocked privileged-field change by % on profile %', auth.uid(), old.id;
      new.role_id             := old.role_id;
      new.registration_status := old.registration_status;
      new.approved_by         := old.approved_by;
      new.approved_at         := old.approved_at;
      new.rejection_reason    := old.rejection_reason;
    end if;
  end if;
  return new;
end;
$$;

-- Named so it sorts after the other BEFORE UPDATE triggers (set_updated_at,
-- legacy alias sync) and therefore sees the final NEW row.
drop trigger if exists trg_zz_guard_profile_privileged on public.profiles;
create trigger trg_zz_guard_profile_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_fields();

-- ----------------------------------------------------------------------------
-- 6. Lock down who may call the privileged RPCs.  (Do NOT revoke from anon on
--    is_admin()/current_app_role(): RLS policies on public tables such as
--    events call them, and anon needs EXECUTE for those policies to evaluate.)
-- ----------------------------------------------------------------------------
revoke all on function public.submit_registration(uuid[])                                            from public, anon;
revoke all on function public.decide_referee_recommendation(uuid, recommendation_status_type, text)  from public, anon;
revoke all on function public.admin_decide_registration(uuid, boolean, text)                         from public, anon;
revoke all on function public.promote_to_referee(uuid, text, text)                                   from public, anon;
revoke all on function public.create_notification(uuid, notification_type, text, text, text)        from public, anon;
grant execute on function public.submit_registration(uuid[])                                         to authenticated;
grant execute on function public.decide_referee_recommendation(uuid, recommendation_status_type, text) to authenticated;
grant execute on function public.admin_decide_registration(uuid, boolean, text)                      to authenticated;
grant execute on function public.promote_to_referee(uuid, text, text)                                to authenticated;

-- OPTIONAL (run only after supabase/verify/0010_verify_readonly.sql section F
-- shows no SECURITY INVOKER function/trigger calls create_notification):
--   revoke execute on function public.create_notification(uuid, notification_type, text, text, text) from authenticated;
-- Today any signed-in user can insert a notification for any other user.
