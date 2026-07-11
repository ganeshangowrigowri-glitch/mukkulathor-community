-- ============================================================================
-- 0005_seed_data.sql
-- Optional demo content. Safe to skip in production by not running this file.
-- ============================================================================

insert into public.events (title, description, event_date, start_time, location, category, is_published) values
  ('Annual Thevar Community Gathering 2026', 'A day of cultural programs, felicitation of elders, and community lunch.', '2026-09-12', '09:00', 'Community Hall, Madurai', 'Gathering', true),
  ('Youth Leadership Workshop', 'Skill-building workshop for young members of the community.', '2026-08-02', '10:00', 'Trichy Community Center', 'Workshop', true),
  ('Family Heritage Documentation Drive', 'Bring old family photographs and documents to be digitized and archived.', '2026-07-20', '09:30', 'Community Office, Sivaganga', 'Heritage', true);

insert into public.notices (title, content, category, is_pinned, is_published) values
  ('Registration now open for new members', 'We welcome new applications from verified Mukkulathor families. Please complete the multi-step registration form and select at least one referee.', 'Announcement', true, true),
  ('Annual gathering venue confirmed', 'The 2026 annual community gathering will be held at the Community Hall, Madurai. Details and RSVP link will follow shortly.', 'Event', false, true);

insert into public.gallery (title, description, image_url, album, is_published) values
  ('Community Hall Inauguration', 'Opening ceremony of the new community hall.', 'https://images.example.com/gallery/hall-inauguration.jpg', 'Milestones', true),
  ('Annual Gathering 2025', 'Highlights from last year''s gathering.', 'https://images.example.com/gallery/gathering-2025.jpg', 'Events', true);

-- ----------------------------------------------------------------------------
-- NOTE on creating the first Administrator account:
-- Supabase Auth users cannot be safely created from a plain SQL migration
-- (passwords must go through the Auth API so they are hashed correctly).
-- After deploying, sign up normally through the website, then run the
-- following once in the SQL editor, substituting the new user's email:
--
--   update public.profiles
--     set role_id = 3, registration_status = 'approved'
--     where email = 'admin@yourdomain.com';
--
-- See docs/DEPLOYMENT.md, section "Creating the first admin".
-- ----------------------------------------------------------------------------
