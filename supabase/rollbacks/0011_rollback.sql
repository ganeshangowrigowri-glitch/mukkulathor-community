-- ============================================================================
-- 0011_rollback.sql — NOT a migration.  DESTRUCTIVE: deletes all matrimony data.
-- Prefer hiding the feature (remove the sidebar link) over running this.
-- Does not touch anything from 0010.
-- ============================================================================
drop policy if exists "mat_photos_owner_write"  on storage.objects;
drop policy if exists "mat_photos_owner_update" on storage.objects;
drop policy if exists "mat_photos_owner_delete" on storage.objects;
drop policy if exists "mat_photos_read"         on storage.objects;
drop policy if exists "mat_horo_owner_write"    on storage.objects;
drop policy if exists "mat_horo_owner_update"   on storage.objects;
drop policy if exists "mat_horo_owner_delete"   on storage.objects;
drop policy if exists "mat_horo_read"           on storage.objects;

drop function if exists public.mat_browse(text, int, int, text, text, int, int, boolean);
drop function if exists public.mat_get_profile(uuid);
drop function if exists public.mat_send_interest(uuid, text);
drop function if exists public.mat_respond_interest(uuid, boolean);
drop function if exists public.mat_withdraw_interest(uuid);
drop function if exists public.mat_list_requests();
drop function if exists public.mat_toggle_shortlist(uuid);
drop function if exists public.mat_dashboard();
drop function if exists public.mat_photo_visible(uuid);
drop function if exists public.mat_connected_with(uuid);
drop function if exists public.mat_is_approved_caller();
drop function if exists public.mat_path_owner(text);

drop table if exists public.matrimony_shortlists;
drop table if exists public.matrimony_interests;
drop table if exists public.matrimony_profiles;
drop function if exists public.matrimony_profiles_guard();
drop sequence if exists public.mat_code_seq;

-- Buckets: empty them in Storage > matrimony-photos / matrimony-horoscopes, then delete the buckets there.
