-- ============================================================================
-- 0004_storage.sql
-- Storage buckets + policies
-- Convention: every object is stored under a path that starts with the
-- owner's profile id, e.g.  {profile_id}/profile.jpg
-- This lets policies authorize by comparing the first path segment to auth.uid().
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('family-photos',  'family-photos',  true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('documents',       'documents',     false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('gallery',         'gallery',       true,  8388608,  array['image/jpeg','image/png','image/webp']),
  ('event-banners',   'event-banners', true,  8388608,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Helper to read the owning profile id out of an object path's first segment
create or replace function public.storage_owner(path text)
returns uuid language sql immutable as $$
  select (split_part(path, '/', 1))::uuid;
$$;

-- ---- profile-photos: public read, owner can manage their own folder -------
create policy "profile_photos_public_read" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "profile_photos_owner_write" on storage.objects
  for insert with check (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());

create policy "profile_photos_owner_update" on storage.objects
  for update using (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());

create policy "profile_photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());

-- ---- family-photos: public read, owner can manage their own folder --------
create policy "family_photos_public_read" on storage.objects
  for select using (bucket_id = 'family-photos');

create policy "family_photos_owner_write" on storage.objects
  for insert with check (bucket_id = 'family-photos' and public.storage_owner(name) = auth.uid());

create policy "family_photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'family-photos' and public.storage_owner(name) = auth.uid());

-- ---- documents: PRIVATE — owner, assigned referees, and admins only -------
create policy "documents_owner_read" on storage.objects
  for select using (bucket_id = 'documents' and public.storage_owner(name) = auth.uid());

create policy "documents_owner_write" on storage.objects
  for insert with check (bucket_id = 'documents' and public.storage_owner(name) = auth.uid());

create policy "documents_owner_delete" on storage.objects
  for delete using (bucket_id = 'documents' and public.storage_owner(name) = auth.uid());

create policy "documents_admin_read" on storage.objects
  for select using (bucket_id = 'documents' and public.is_admin());

create policy "documents_referee_read" on storage.objects
  for select using (
    bucket_id = 'documents' and exists (
      select 1 from public.referee_recommendations rr
      join public.referees ref on ref.id = rr.referee_id
      where rr.applicant_id = public.storage_owner(name) and ref.profile_id = auth.uid()
    )
  );

-- ---- gallery: public read, admin manages -----------------------------------
create policy "gallery_public_read" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "gallery_admin_write" on storage.objects
  for all using (bucket_id = 'gallery' and public.is_admin());

-- ---- event-banners: public read, admin manages -----------------------------
create policy "event_banners_public_read" on storage.objects
  for select using (bucket_id = 'event-banners');

create policy "event_banners_admin_write" on storage.objects
  for all using (bucket_id = 'event-banners' and public.is_admin());
