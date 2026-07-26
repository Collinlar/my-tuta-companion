-- =====================================================================
-- mytuta: Controlled Assessment Mode — autosave
--  * assessment_submissions was write-only via submit_assessment (final,
--    scored). Controlled Assessment Mode needs answers to survive a
--    refresh mid-attempt, so this adds a draft path: autosave_assessment_
--    answers upserts a row with submitted_at = NULL (never scored, never
--    counted in the assessment's rollup), guarded so it can never overwrite
--    an already-finalized submission.
--  * get_assessment_for_taking is patched so a draft row's default
--    score/mastery_level (0 / 'Beginning') never leaks as a fake "prior
--    result" — prior_score/prior_level only come from a row with
--    submitted_at set; an unsubmitted draft's answers come back separately
--    as draft_answers so the client can resume where the student left off.
-- Apply AFTER 20260720240000_mytuta_insights_detail.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.autosave_assessment_answers(p_assessment_id uuid, p_answers jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_assessment public.assessments%ROWTYPE;
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

  INSERT INTO public.assessment_submissions (assessment_id, student_id, answers, submitted_at)
  VALUES (p_assessment_id, v_uid, p_answers, NULL)
  ON CONFLICT (assessment_id, student_id) DO UPDATE
    SET answers = excluded.answers
    WHERE public.assessment_submissions.submitted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.autosave_assessment_answers(uuid, jsonb) TO authenticated;

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
    'prior_score', CASE WHEN v_prior.submitted_at IS NOT NULL THEN v_prior.score ELSE NULL END,
    'prior_level', CASE WHEN v_prior.submitted_at IS NOT NULL THEN v_prior.mastery_level ELSE NULL END,
    'draft_answers', CASE WHEN v_prior.id IS NOT NULL AND v_prior.submitted_at IS NULL THEN v_prior.answers ELSE NULL END
  );
END;
$$;
