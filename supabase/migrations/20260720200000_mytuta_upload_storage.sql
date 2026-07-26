-- =====================================================================
-- mytuta: file-upload intake (Learn's "Upload notes" / "Photograph material")
--  * Unlike the public "avatars" bucket, uploaded notes/homework photos are
--    private: only the owner can read or write their own files.
--  * Path convention: uploads/{user_id}/{filename}. RLS on storage.objects
--    restricts every operation (including SELECT) to a user's own folder.
-- Apply AFTER 20260720190000_mytuta_avatar_storage.sql.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can read their own uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can add their own uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can replace their own uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
