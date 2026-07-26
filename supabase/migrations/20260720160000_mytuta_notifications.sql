-- =====================================================================
-- mytuta: real notifications
--  * notify_class / notify_teacher: SECURITY DEFINER broadcast helpers
--  * notify_challenge_submission: notifies a challenge's teacher on submit
--  * assign_experience: new RPC (mirrors assign_assessment) so assigning an
--    experience notifies the class the same way assigning an assessment does
--  * assign_assessment / submit_assessment / join_class: patched to notify
-- Apply AFTER 20260720150000_mytuta_teacher_challenges.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- notify_class: teacher broadcasts a notification to every student in a
-- class they own. Silently a no-op for students with no student_id yet
-- (rostered but not signed up).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_class(p_class_id uuid, p_kind text, p_title text, p_body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = p_class_id AND teacher_id = auth.uid()) THEN
    RAISE EXCEPTION 'Class not found';
  END IF;

  INSERT INTO public.notifications (user_id, kind, title, body)
  SELECT student_id, p_kind, p_title, p_body
  FROM public.class_students
  WHERE class_id = p_class_id AND student_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_class(uuid, text, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- notify_teacher: a class member notifies the class's teacher.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_teacher(p_class_id uuid, p_kind text, p_title text, p_body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT public.is_class_member(p_class_id) THEN
    RAISE EXCEPTION 'Not a member of this class';
  END IF;

  SELECT teacher_id INTO v_teacher FROM public.classes WHERE id = p_class_id;
  IF v_teacher IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, kind, title, body) VALUES (v_teacher, p_kind, p_title, p_body);
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_teacher(uuid, text, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- notify_challenge_submission: notify a challenge's creator when a
-- student submits. No-op for platform-catalog challenges (created_by NULL).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_challenge_submission(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_created_by uuid;
  v_title text;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  SELECT created_by, title INTO v_created_by, v_title FROM public.challenges WHERE id = p_challenge_id;
  IF v_created_by IS NULL THEN
    RETURN;
  END IF;

  SELECT NULLIF(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
    INTO v_name FROM public.profiles WHERE user_id = v_uid;

  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (v_created_by, 'submission', 'Challenge submitted', COALESCE(v_name, 'A student') || ' submitted "' || v_title || '".');
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_challenge_submission(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- assign_experience: teacher assigns an experience to a class (new RPC,
-- replaces a raw client insert so assigning also notifies the class).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_experience(p_experience_id uuid, p_class_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_title text;
  v_class_name text;
  v_teacher_name text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT title INTO v_title FROM public.learning_experiences WHERE id = p_experience_id AND teacher_id = v_uid;
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Experience not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = p_class_id AND teacher_id = v_uid) THEN
    RAISE EXCEPTION 'Class not found';
  END IF;

  SELECT name INTO v_class_name FROM public.classes WHERE id = p_class_id;
  SELECT NULLIF(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
    INTO v_teacher_name FROM public.profiles WHERE user_id = v_uid;

  INSERT INTO public.assignments (teacher_id, class_id, experience_id, title, teacher_name)
  VALUES (v_uid, p_class_id, p_experience_id, v_title, COALESCE(v_teacher_name, 'Your teacher'));

  PERFORM public.notify_class(
    p_class_id, 'assignment',
    'New assignment: ' || v_title,
    'From ' || COALESCE(v_teacher_name, 'your teacher') || ' in ' || v_class_name || '.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_experience(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- Patch assign_assessment: notify the class once it is published.
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
  v_title text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  SELECT title INTO v_title FROM public.assessments WHERE id = p_assessment_id AND teacher_id = v_uid;
  IF v_title IS NULL THEN
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
  VALUES (v_uid, p_class_id, p_assessment_id, v_title, COALESCE(v_teacher_name, 'Your teacher'));

  PERFORM public.notify_class(
    p_class_id, 'assessment',
    'New assessment: ' || v_title,
    'From ' || COALESCE(v_teacher_name, 'your teacher') || ' in ' || v_class_name || '.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_assessment(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- Patch submit_assessment: notify the teacher once a student submits.
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
  v_name text;
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

  SELECT NULLIF(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
    INTO v_name FROM public.profiles WHERE user_id = v_uid;
  PERFORM public.notify_teacher(
    v_assessment.class_id, 'submission',
    'Assessment submitted',
    COALESCE(v_name, 'A student') || ' scored ' || v_score || '% on "' || v_assessment.title || '".'
  );

  RETURN jsonb_build_object('score', v_score, 'level', v_level, 'correct', v_correct, 'total', v_total_q);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_assessment(uuid, jsonb) TO authenticated;

-- ---------------------------------------------------------------------
-- Patch join_class: notify the teacher when a new student joins.
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

    INSERT INTO public.notifications (user_id, kind, title, body)
    VALUES (v_class.teacher_id, 'join', 'New student joined', v_name || ' joined ' || v_class.name || '.');
  END IF;

  class_id := v_class.id;
  class_name := v_class.name;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_class(text) TO authenticated;
