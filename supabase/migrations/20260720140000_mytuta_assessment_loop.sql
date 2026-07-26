-- =====================================================================
-- mytuta: the assessment loop — real items, real taking, real results
--  * assessment_questions: AI-generated MCQ items owned by the teacher
--  * assessment_submissions: one row per student per assessment
--  * assign_assessment: teacher flips draft -> assigned for a class
--  * get_assessment_for_taking: student reads questions (no answers)
--  * submit_assessment: server-side scoring, aggregate rollup, attempt log
-- Apply AFTER 20260720130000_mytuta_teacher_dashboard.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  ord int NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index int NOT NULL DEFAULT 0,
  dimension text,
  UNIQUE (assessment_id, ord)
);

CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score int NOT NULL DEFAULT 0,
  mastery_level text NOT NULL DEFAULT 'Beginning',
  submitted_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON public.assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment ON public.assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_student ON public.assessment_submissions(student_id);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Teacher owns questions via the parent assessment (read + write for review/editing).
CREATE POLICY "teacher manage questions" ON public.assessment_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()));

-- Submissions are written only via submit_assessment (SECURITY DEFINER below).
-- These policies cover reads: teacher sees all submissions for their assessment,
-- a student sees only their own.
CREATE POLICY "teacher read submissions" ON public.assessment_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid()));

CREATE POLICY "student read own submission" ON public.assessment_submissions FOR SELECT
  USING (student_id = auth.uid());

-- ---------------------------------------------------------------------
-- assign_assessment: teacher publishes a draft to a class
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_assessment(p_assessment_id uuid, p_class_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_class_name text;
  v_teacher_name text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.assessments WHERE id = p_assessment_id AND teacher_id = v_uid) THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = p_class_id AND teacher_id = v_uid) THEN
    RAISE EXCEPTION 'Class not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.assessment_questions WHERE assessment_id = p_assessment_id) THEN
    RAISE EXCEPTION 'Add questions before assigning';
  END IF;

  SELECT name INTO v_class_name FROM public.classes WHERE id = p_class_id;
  SELECT NULLIF(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
    INTO v_teacher_name FROM public.profiles WHERE user_id = v_uid;

  UPDATE public.assessments
  SET class_id = p_class_id, class_label = v_class_name, status = 'assigned'
  WHERE id = p_assessment_id;

  DELETE FROM public.assignments WHERE assessment_id = p_assessment_id;
  INSERT INTO public.assignments (teacher_id, class_id, assessment_id, title, teacher_name)
  SELECT v_uid, p_class_id, id, title, COALESCE(v_teacher_name, 'Your teacher')
  FROM public.assessments WHERE id = p_assessment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_assessment(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- get_assessment_for_taking: student view, no correct answers exposed
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_assessment_for_taking(p_assessment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_assessment public.assessments%ROWTYPE;
  v_questions jsonb;
  v_prior public.assessment_submissions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO v_assessment FROM public.assessments WHERE id = p_assessment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;
  IF v_assessment.status <> 'assigned' THEN
    RAISE EXCEPTION 'This assessment is not open yet';
  END IF;
  IF v_assessment.class_id IS NULL OR NOT public.is_class_member(v_assessment.class_id) THEN
    RAISE EXCEPTION 'Not assigned to you';
  END IF;

  SELECT jsonb_agg(jsonb_build_object('id', id, 'ord', ord, 'prompt', prompt, 'options', options) ORDER BY ord)
    INTO v_questions
    FROM public.assessment_questions WHERE assessment_id = p_assessment_id;

  SELECT * INTO v_prior FROM public.assessment_submissions
    WHERE assessment_id = p_assessment_id AND student_id = auth.uid();

  RETURN jsonb_build_object(
    'id', v_assessment.id,
    'title', v_assessment.title,
    'type', v_assessment.type,
    'questions', COALESCE(v_questions, '[]'::jsonb),
    'prior_score', v_prior.score,
    'prior_level', v_prior.mastery_level
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_assessment_for_taking(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- submit_assessment: server-side scoring + aggregate rollup + attempt log
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_assessment(p_assessment_id uuid, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_assessment public.assessments%ROWTYPE;
  v_total_q int;
  v_correct int := 0;
  v_score int;
  v_level text;
  v_q RECORD;
  v_chosen int;
  v_ok boolean;
  v_total_students int;
  v_submitted int;
  v_avg_score numeric;
  v_dist jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO v_assessment FROM public.assessments WHERE id = p_assessment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;
  IF v_assessment.status <> 'assigned' THEN
    RAISE EXCEPTION 'This assessment is not open';
  END IF;
  IF v_assessment.class_id IS NULL OR NOT public.is_class_member(v_assessment.class_id) THEN
    RAISE EXCEPTION 'Not assigned to you';
  END IF;

  SELECT count(*) INTO v_total_q FROM public.assessment_questions WHERE assessment_id = p_assessment_id;
  IF v_total_q = 0 THEN
    RAISE EXCEPTION 'This assessment has no questions';
  END IF;

  FOR v_q IN SELECT id, correct_index, prompt FROM public.assessment_questions WHERE assessment_id = p_assessment_id LOOP
    v_chosen := NULL;
    SELECT (elem->>'chosen_index')::int INTO v_chosen
      FROM jsonb_array_elements(p_answers) elem
      WHERE (elem->>'question_id')::uuid = v_q.id
      LIMIT 1;
    v_ok := (v_chosen IS NOT NULL AND v_chosen = v_q.correct_index);
    IF v_ok THEN
      v_correct := v_correct + 1;
    END IF;
    INSERT INTO public.attempts (user_id, kind, prompt, correct) VALUES (v_uid, 'assessment', v_q.prompt, v_ok);
  END LOOP;

  v_score := round(100.0 * v_correct / v_total_q);
  v_level := CASE
    WHEN v_score >= 90 THEN 'Mastered'
    WHEN v_score >= 70 THEN 'Secure'
    WHEN v_score >= 40 THEN 'Developing'
    ELSE 'Beginning'
  END;

  INSERT INTO public.assessment_submissions (assessment_id, student_id, answers, score, mastery_level)
  VALUES (p_assessment_id, v_uid, p_answers, v_score, v_level)
  ON CONFLICT (assessment_id, student_id) DO UPDATE
    SET answers = excluded.answers, score = excluded.score, mastery_level = excluded.mastery_level, submitted_at = now();

  SELECT count(*) INTO v_total_students FROM public.class_students WHERE class_id = v_assessment.class_id;
  SELECT count(*), avg(score) INTO v_submitted, v_avg_score FROM public.assessment_submissions WHERE assessment_id = p_assessment_id;

  SELECT jsonb_build_array(
    jsonb_build_object('l', 'Mastered', 'v', count(*) FILTER (WHERE mastery_level = 'Mastered'), 'c', '#6b5aa8'),
    jsonb_build_object('l', 'Secure', 'v', count(*) FILTER (WHERE mastery_level = 'Secure'), 'c', '#2e9e6b'),
    jsonb_build_object('l', 'Developing', 'v', count(*) FILTER (WHERE mastery_level = 'Developing'), 'c', '#3f8fc4'),
    jsonb_build_object('l', 'Beginning', 'v', count(*) FILTER (WHERE mastery_level = 'Beginning'), 'c', '#c47a17')
  ) INTO v_dist
  FROM public.assessment_submissions WHERE assessment_id = p_assessment_id;

  UPDATE public.assessments
  SET total = v_total_students,
      submitted = v_submitted,
      distribution = v_dist,
      avg_level = CASE
        WHEN v_avg_score >= 90 THEN 'Mastered'
        WHEN v_avg_score >= 70 THEN 'Secure'
        WHEN v_avg_score >= 40 THEN 'Developing'
        ELSE 'Beginning'
      END
  WHERE id = p_assessment_id;

  RETURN jsonb_build_object('score', v_score, 'level', v_level, 'correct', v_correct, 'total', v_total_q);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_assessment(uuid, jsonb) TO authenticated;
