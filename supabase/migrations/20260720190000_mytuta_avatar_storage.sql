-- =====================================================================
-- mytuta: avatar image upload
--  * profiles.avatar_url already exists (pre-mytuta schema); nothing wrote
--    to it. This adds a public "avatars" Storage bucket so the client can
--    upload an image and store its public URL there.
--  * Path convention: avatars/{user_id}/{filename}. RLS on storage.objects
--    restricts writes to a user's own folder (first path segment must
--    equal their auth.uid()), while reads stay public so avatar images can
--    be shown to other users (teachers, classmates) without extra plumbing.
-- Apply AFTER 20260720180000_mytuta_account_settings.sql.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
