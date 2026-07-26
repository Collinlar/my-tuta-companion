-- =====================================================================
-- mytuta: teacher-created class challenges
--  * challenges gains an optional class_id, scoping visibility to that
--    class's members (in addition to the always-visible platform catalog)
--  * teachers can read submissions for challenges they created
-- Apply AFTER 20260720140000_mytuta_assessment_loop.sql.
-- =====================================================================

ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_challenges_class ON public.challenges(class_id);

-- Visibility: platform catalog (class_id IS NULL) stays open to everyone;
-- a class challenge is visible to its own teacher and to members of that class.
DROP POLICY IF EXISTS "challenges readable" ON public.challenges;
CREATE POLICY "challenges readable" ON public.challenges FOR SELECT
  USING (
    class_id IS NULL
    OR created_by = auth.uid()
    OR public.is_class_member(class_id)
  );

-- Tighten creation: a teacher may only attach a challenge to a class they own.
DROP POLICY IF EXISTS "teachers create challenges" ON public.challenges;
CREATE POLICY "teachers create challenges" ON public.challenges FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'teacher')
    AND (class_id IS NULL OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()))
  );

-- Teachers can read submissions for the challenges they created (for review).
CREATE POLICY "teacher read own challenge submissions" ON public.challenge_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.challenges ch WHERE ch.id = challenge_id AND ch.created_by = auth.uid()));
