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
  profile_photo_url text
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select r.id, r.designation, r.region, p.full_name, p.branch, p.district,
         p.address, p.village, p.occupation, p.profile_photo_url
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