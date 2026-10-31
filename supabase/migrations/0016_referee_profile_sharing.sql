-- 1. Registration form referee list: also return the referee's own photo and details.
--    The referee's saved values are used; the member-profile values are the fallback.
drop function if exists public.list_active_referees();
create function public.list_active_referees()
returns table (
  id                uuid,
  designation       text,
  region            text,
  full_name         text,
  branch            branch_type,
  district          text,
  address           text,
  village           text,
  occupation        text,
  profile_photo_url text,
  father_name       text,
  kulam             text,
  caste             text,
  gothram           text
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select r.id, r.designation, r.region, p.full_name, p.branch, p.district,
         p.address, p.village,
         coalesce(nullif(r.occupation, ''), p.occupation),
         coalesce(nullif(r.profile_image_url, ''), p.profile_photo_url),
         r.father_name, r.kulam, r.caste, r.gothram
  from public.referees r
  join public.profiles p on p.id = r.profile_id
  where auth.uid() is not null
    and r.is_active = true
    and p.registration_status = 'approved'
    and p.is_directory_visible = true
  order by p.full_name;
$$;

revoke all on function public.list_active_referees() from public, anon;
grant execute on function public.list_active_referees() to authenticated;

-- 2. Guard: a referee may edit their profile details, but never their own
--    active status, referee ID, designation or account link.
create or replace function public.guard_referee_privileged_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    new.profile_id   := old.profile_id;
    new.is_active    := old.is_active;
    new.referee_code := old.referee_code;
    new.designation  := old.designation;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_zz_guard_referee_privileged on public.referees;
create trigger trg_zz_guard_referee_privileged
  before update on public.referees
  for each row execute function public.guard_referee_privileged_fields();