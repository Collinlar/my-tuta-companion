-- =====================================================================
-- mytuta: real user data (no fake ownership seeds)
-- 1) Wipe per-user demo rows inserted by the old provisioner
-- 2) Replace provision_starter_data with a no-op (catalog seed stays)
-- 3) Add switch_user_role() so student ↔ teacher updates profiles.user_type
-- =====================================================================

-- ---------------------------------------------------------------------
-- Clear demo ownership (global catalog concepts/labs/challenges kept)
-- ---------------------------------------------------------------------
DELETE FROM public.path_stage_progress;
DELETE FROM public.mastery_paths;
DELETE FROM public.mastery_profiles;
DELETE FROM public.learner_stats;
DELETE FROM public.student_assignments;
DELETE FROM public.challenge_submissions;
DELETE FROM public.assignments;
DELETE FROM public.assessments;
DELETE FROM public.teacher_insights;
DELETE FROM public.teacher_stats;
DELETE FROM public.experience_sections;
DELETE FROM public.learning_experiences;
DELETE FROM public.class_students;
DELETE FROM public.classes;
DELETE FROM public.attempts;
DELETE FROM public.notifications;

-- ---------------------------------------------------------------------
-- provision_starter_data: no longer invents fake classes / mastery
-- Kept so existing app RPC calls do not 404.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_starter_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Intentionally empty. Global STEM catalog is seeded separately.
  -- Per-user rows are created only by real user actions.
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_starter_data() TO authenticated;

-- ---------------------------------------------------------------------
-- switch_user_role: sync UI role flip to profiles.user_type for RLS
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.switch_user_role(new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF new_role NOT IN ('student', 'teacher') THEN
    RAISE EXCEPTION 'Role must be student or teacher';
  END IF;

  UPDATE public.profiles
  SET user_type = new_role
  WHERE user_id = uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.switch_user_role(text) TO authenticated;
