-- ============================================================================
-- 0008_system_settings.sql
-- Singleton table for admin-configurable platform settings (System Settings
-- page in the Admin Dashboard). A single row (id = 1) is enforced.
-- ============================================================================

create table public.system_settings (
  id                          smallint primary key default 1,
  site_name                   text not null default 'Mukkulathor Community',
  contact_email               text default 'contact@mukkulathorcommunity.org',
  contact_phone               text,
  registration_open           boolean not null default true,
  min_referees_required       smallint not null default 1,
  auto_notify_referees        boolean not null default true,
  maintenance_mode            boolean not null default false,
  maintenance_message         text,
  updated_by                  uuid references public.profiles (id),
  updated_at                  timestamptz not null default now(),
  constraint system_settings_singleton check (id = 1)
);

insert into public.system_settings (id) values (1);

create trigger trg_system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();

alter table public.system_settings enable row level security;

-- Readable by anyone authenticated (e.g. to check registration_open /
-- maintenance_mode before showing the registration flow); writable by
-- admins only.
create policy "system_settings_select_authenticated" on public.system_settings
  for select using (auth.role() = 'authenticated');

create policy "system_settings_admin_write" on public.system_settings
  for update using (public.is_admin()) with check (public.is_admin());
