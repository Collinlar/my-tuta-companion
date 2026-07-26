-- =====================================================================
-- mytuta: connect students to teachers
--  * students join a class by code (join_class RPC)
--  * students can read the classes they belong to and the experiences
--    assigned to them (membership checked via SECURITY DEFINER helpers to
--    avoid RLS recursion)
--  * assignments carry a denormalized teacher_name (students cannot read a
--    teacher's profile row directly)
-- Apply AFTER 20260720110000_mytuta_ensure_concept_stages.sql.
-- =====================================================================

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS teacher_name text;

-- ---------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER => bypass RLS, no policy recursion)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_class_member(p_class uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students
    WHERE class_id = p_class AND student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_experience_assigned_to_me(p_exp uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.assignments a
    JOIN public.class_students cs ON cs.class_id = a.class_id
    WHERE a.experience_id = p_exp AND cs.student_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_class_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_experience_assigned_to_me(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- Student read access to their class + assigned experiences
-- (additive SELECT policies; OR-ed with the existing teacher policies)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "students read member classes" ON public.classes;
CREATE POLICY "students read member classes" ON public.classes FOR SELECT
  USING (public.is_class_member(id));

DROP POLICY IF EXISTS "students read assigned experiences" ON public.learning_experiences;
CREATE POLICY "students read assigned experiences" ON public.learning_experiences FOR SELECT
  USING (public.is_experience_assigned_to_me(id));

-- ---------------------------------------------------------------------
-- join_class: student joins a class by its share code
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_class(p_code text)
RETURNS TABLE (class_id uuid, class_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_class public.classes%ROWTYPE;
  v_name text;
  v_mark text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RAISE EXCEPTION 'Enter a class code';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE upper(code) = upper(trim(p_code)) LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No class found for that code';
  END IF;

  SELECT NULLIF(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), ''),
         upper(coalesce(left(first_name, 1), '') || coalesce(left(last_name, 1), ''))
    INTO v_name, v_mark
    FROM public.profiles WHERE user_id = v_uid;

  v_name := coalesce(v_name, 'Student');
  v_mark := coalesce(nullif(v_mark, ''), upper(left(v_name, 2)));

  IF NOT EXISTS (
    SELECT 1 FROM public.class_students WHERE class_id = v_class.id AND student_id = v_uid
  ) THEN
    INSERT INTO public.class_students (class_id, student_id, display_name, mark, color, mastery_level)
    VALUES (v_class.id, v_uid, v_name, v_mark, '#2e9e6b', 'Beginning');
  END IF;

  class_id := v_class.id;
  class_name := v_class.name;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_class(text) TO authenticated;
