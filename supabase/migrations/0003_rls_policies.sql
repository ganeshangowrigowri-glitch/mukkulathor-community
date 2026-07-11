-- ============================================================================
-- 0003_rls_policies.sql
-- Row Level Security — enabled on every table, deny-by-default
-- ============================================================================

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.family_tree enable row level security;
alter table public.referees enable row level security;
alter table public.referee_recommendations enable row level security;
alter table public.member_status enable row level security;
alter table public.events enable row level security;
alter table public.notices enable row level security;
alter table public.gallery enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- ----------------------------------------------------------------------------
-- ROLES — static lookup, readable by anyone signed in
-- ----------------------------------------------------------------------------
create policy "roles_select_authenticated" on public.roles
  for select using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_select_referee_for_applicant" on public.profiles
  for select using (
    exists (
      select 1 from public.referee_recommendations rr
      join public.referees ref on ref.id = rr.referee_id
      where rr.applicant_id = profiles.id and ref.profile_id = auth.uid()
    )
  );

create policy "profiles_select_directory" on public.profiles
  for select using (registration_status = 'approved');

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- Inserts happen exclusively via the handle_new_user trigger (security
-- definer), so no client-facing INSERT policy is provided on purpose.

-- ----------------------------------------------------------------------------
-- FAMILY MEMBERS
-- ----------------------------------------------------------------------------
create policy "family_members_owner_all" on public.family_members
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "family_members_admin_all" on public.family_members
  for all using (public.is_admin());

create policy "family_members_referee_select" on public.family_members
  for select using (
    exists (
      select 1 from public.referee_recommendations rr
      join public.referees ref on ref.id = rr.referee_id
      where rr.applicant_id = family_members.profile_id and ref.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- FAMILY TREE
-- ----------------------------------------------------------------------------
create policy "family_tree_owner_all" on public.family_tree
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "family_tree_admin_all" on public.family_tree
  for all using (public.is_admin());

create policy "family_tree_directory_select" on public.family_tree
  for select using (
    exists (select 1 from public.profiles p where p.id = family_tree.profile_id and p.registration_status = 'approved')
  );

-- ----------------------------------------------------------------------------
-- REFEREES — visible to any authenticated user (needed for Step 6 picker)
-- ----------------------------------------------------------------------------
create policy "referees_select_authenticated" on public.referees
  for select using (auth.role() = 'authenticated');

create policy "referees_admin_write" on public.referees
  for all using (public.is_admin());

create policy "referees_self_update" on public.referees
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- REFEREE RECOMMENDATIONS
-- ----------------------------------------------------------------------------
create policy "rec_select_applicant" on public.referee_recommendations
  for select using (applicant_id = auth.uid());

create policy "rec_select_referee" on public.referee_recommendations
  for select using (
    exists (select 1 from public.referees ref where ref.id = referee_recommendations.referee_id and ref.profile_id = auth.uid())
  );

create policy "rec_select_admin" on public.referee_recommendations
  for select using (public.is_admin());

create policy "rec_admin_write" on public.referee_recommendations
  for all using (public.is_admin());

-- Row creation/decision is performed through the security-definer RPCs
-- (submit_registration, decide_referee_recommendation) so no direct
-- client-facing INSERT/UPDATE policy is needed for members/referees.

-- ----------------------------------------------------------------------------
-- MEMBER STATUS — read-only history, written only via RPC/triggers
-- ----------------------------------------------------------------------------
create policy "status_select_own" on public.member_status
  for select using (profile_id = auth.uid());

create policy "status_select_admin" on public.member_status
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- EVENTS — published events are public; full management is admin-only
-- ----------------------------------------------------------------------------
create policy "events_select_published" on public.events
  for select using (is_published = true);

create policy "events_admin_all" on public.events
  for all using (public.is_admin());

-- ----------------------------------------------------------------------------
-- NOTICES
-- ----------------------------------------------------------------------------
create policy "notices_select_published" on public.notices
  for select using (is_published = true and (expires_at is null or expires_at > now()));

create policy "notices_admin_all" on public.notices
  for all using (public.is_admin());

-- ----------------------------------------------------------------------------
-- GALLERY
-- ----------------------------------------------------------------------------
create policy "gallery_select_published" on public.gallery
  for select using (is_published = true);

create policy "gallery_admin_all" on public.gallery
  for all using (public.is_admin());

-- ----------------------------------------------------------------------------
-- DOCUMENTS
-- ----------------------------------------------------------------------------
create policy "documents_owner_all" on public.documents
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "documents_admin_all" on public.documents
  for all using (public.is_admin());

create policy "documents_referee_select" on public.documents
  for select using (
    exists (
      select 1 from public.referee_recommendations rr
      join public.referees ref on ref.id = rr.referee_id
      where rr.applicant_id = documents.profile_id and ref.profile_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS — every user manages only their own
-- ----------------------------------------------------------------------------
create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "notifications_admin_all" on public.notifications
  for all using (public.is_admin());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS — admin only, write happens via security-definer RPCs
-- ----------------------------------------------------------------------------
create policy "audit_select_admin" on public.audit_logs
  for select using (public.is_admin());

create policy "audit_insert_admin" on public.audit_logs
  for insert with check (public.is_admin());
