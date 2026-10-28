-- ============================================================================
-- Read-only inspection queries.  Run each section in the Supabase SQL editor
-- (SELECTs only; nothing here changes data).  Run BEFORE and AFTER 0010.
-- ============================================================================

-- A. Policies on profiles / family_tree (look for any policy whose roles include anon/public)
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename in ('profiles','family_tree','referees','referee_recommendations')
order by tablename, policyname;

-- B. Who can read what (anon / authenticated table privileges)
select grantee, table_name, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon','authenticated')
  and table_name in ('profiles','users_view','family_members','family_tree','referees',
                     'referee_recommendations','member_status','documents','notifications','audit_logs')
group by grantee, table_name order by table_name, grantee;

-- C. users_view: is it security_invoker?  (reloptions should contain security_invoker=true after 0010)
select c.relname, c.reloptions from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'users_view';

-- D. Every function in public: owner, definer/invoker, search_path, ACL
select p.proname, pg_get_function_identity_arguments(p.oid) as args,
       pg_get_userbyid(p.proowner) as owner,
       case when p.prosecdef then 'DEFINER' else 'invoker' end as security,
       p.proconfig as config,
       p.proacl as acl
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f'
order by p.prosecdef desc, p.proname;
-- Expect: every DEFINER function has config containing search_path=..., owner postgres.

-- E. Triggers on profiles (confirm order and that nothing else writes privileged columns)
select tgname, pg_get_triggerdef(oid) from pg_trigger
where tgrelid = 'public.profiles'::regclass and not tgisinternal order by tgname;

-- F. Functions that call create_notification (for the optional revoke in 0010)
select proname, prosecdef from pg_proc
where pronamespace = 'public'::regnamespace and prosrc ilike '%create_notification%';

-- G. Live definitions I could not see in the repo (0009+): print for review
select pg_get_functiondef(p.oid)
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('submit_registration','decide_referee_recommendation','admin_decide_registration',
                    'promote_to_referee','list_active_referees','get_recommendations_for_applicant');

-- H. Anonymous exposure test (after 0010 this should fail with 'permission denied', never return rows):
--    begin; set local role anon; select count(*) from public.profiles; rollback;
