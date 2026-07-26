-- =====================================================================
-- mytuta: editing a class challenge after creation
--  * challenges had SELECT and INSERT policies but no UPDATE policy, so a
--    teacher could not correct or refine a challenge's brief/stages once
--    created. This adds an own-row UPDATE policy, scoped the same way the
--    INSERT policy already is: a teacher may only touch their own row, and
--    (when changing class_id) only to a class they own.
-- Apply AFTER 20260720200000_mytuta_upload_storage.sql.
-- =====================================================================

CREATE POLICY "teachers update own challenges" ON public.challenges FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (
    created_by = auth.uid()
    AND (class_id IS NULL OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()))
  );
