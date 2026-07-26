-- =====================================================================
-- mytuta: student experience viewer + real assignment status
--  * experience_sections had no RLS path for a student who is assigned an
--    experience that hasn't been published (assign_experience doesn't
--    require status = 'published') — the parent learning_experiences row
--    was readable via is_experience_assigned_to_me, but its sections were
--    not. This adds the matching SELECT policy.
--  * experience_progress tracks whether a student has opened / finished an
--    assigned experience, so Assignments can show a real status instead of
--    a hardcoded "Not started".
-- Apply AFTER 20260720220000_mytuta_onboarding_answers.sql.
-- =====================================================================

CREATE POLICY "students read assigned sections" ON public.experience_sections FOR SELECT
  USING (public.is_experience_assigned_to_me(experience_id));

CREATE TABLE IF NOT EXISTS public.experience_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES public.learning_experiences(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, experience_id)
);

CREATE INDEX IF NOT EXISTS idx_experience_progress_user ON public.experience_progress(user_id);

ALTER TABLE public.experience_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own experience progress select" ON public.experience_progress FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "own experience progress insert" ON public.experience_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "own experience progress update" ON public.experience_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE TRIGGER experience_progress_updated_at
  BEFORE UPDATE ON public.experience_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
