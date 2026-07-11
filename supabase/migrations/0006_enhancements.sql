-- ============================================================================
-- 0006_enhancements.sql
-- Adds: Family Head vs Individual Member registration type, and complete
-- audit-trail logging for referee decisions (in addition to the existing
-- member_status + referee_recommendations history).
-- ============================================================================

create type registration_type_enum as enum ('family_head', 'individual_member');

alter table public.profiles
  add column registration_type registration_type_enum not null default 'individual_member';

comment on column public.profiles.registration_type is
  'family_head = registering as the head of a (possibly new) family unit; individual_member = joining an existing family, typically referencing an existing family_id.';

-- ----------------------------------------------------------------------------
-- Re-create decide_referee_recommendation to also write a full audit_logs
-- entry (actor, decision, comments, timestamp) alongside the existing
-- referee_recommendations row and member_status history — giving the admin a
-- single, queryable, append-only trail of every referee action.
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

  -- Full audit trail entry for this individual referee decision
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    case when p_status = 'approved' then 'REFEREE_RECOMMEND' else 'REFEREE_REJECT' end,
    'referee_recommendation',
    p_recommendation_id,
    jsonb_build_object('applicant_id', v_applicant_id, 'comments', p_comments, 'decided_at', now())
  );

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
