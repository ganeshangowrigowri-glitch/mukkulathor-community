-- ============================================================================
-- 0010_rollback.sql  —  NOT a migration (kept outside supabase/migrations).
-- Reverses the *behavioural* parts of 0010 without re-opening the anonymous
-- data exposure.  Run only if the guard trigger or RPC grants break a flow.
-- ============================================================================

-- A. Remove the guard trigger (privileged-field protection OFF).
drop trigger  if exists trg_zz_guard_profile_privileged on public.profiles;
drop function if exists public.guard_profile_privileged_fields();

-- B. Re-allow public execute on the RPCs (they still check auth.uid()/is_admin() internally).
grant execute on function public.submit_registration(uuid[])                                            to public;
grant execute on function public.decide_referee_recommendation(uuid, recommendation_status_type, text)  to public;
grant execute on function public.admin_decide_registration(uuid, boolean, text)                         to public;
grant execute on function public.promote_to_referee(uuid, text, text)                                   to public;

-- The new read RPCs (list_active_referees, get_recommendations_for_applicant,
-- search_member_directory) are deliberately KEPT: the app depends on them.
-- The anonymous directory policy, users_view grants and anon table grants are
-- deliberately NOT restored.

-- ----------------------------------------------------------------------------
-- C. EMERGENCY ONLY (commented out).  If members lose a screen that read other
--    members' profiles, this restores a directory read for SIGNED-IN, APPROVED
--    members only — never anon.  It re-exposes mobile/email/address to every
--    approved member, so prefer adding a narrow RPC instead.
-- ----------------------------------------------------------------------------
-- create policy "profiles_select_directory" on public.profiles
--   for select to authenticated
--   using (registration_status = 'approved' and is_directory_visible = true);
