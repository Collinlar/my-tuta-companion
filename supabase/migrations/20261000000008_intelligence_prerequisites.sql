-- Extend next_best_action() to detect prerequisite gaps using concept_relationships.
-- When the student has an active or requested concept whose prerequisites are not yet Secure,
-- the RPC injects a prerequisite_gap action before other recommendations.
-- This migration replaces (CREATE OR REPLACE) the RPC from 20260720430000.

CREATE OR REPLACE FUNCTION public.next_best_action()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_cands   jsonb := '[]'::jsonb;
  r         record;
  v_recall  int;
  v_paths   int;
  v_prereq  record;
BEGIN
  IF v_uid IS NULL THEN RETURN '{}'::jsonb; END IF;

  -- ---------------------------------------------------------------
  -- 0. Prerequisite gap check: find the most recent active Mastery
  --    Path whose concept has an unmet prerequisite_of relationship
  --    (i.e. the prerequisite concept has no Secure/Mastered profile).
  -- ---------------------------------------------------------------
  SELECT
    mp.concept_name       AS blocked_concept,
    c_pre.name            AS prerequisite_name,
    c_pre.slug            AS prerequisite_slug,
    mp.id                 AS path_id
  INTO v_prereq
  FROM public.mastery_paths mp
  JOIN public.concepts c_blocked ON c_blocked.name = mp.concept_name
  JOIN public.concept_relationships cr
    ON cr.target_concept_id = c_blocked.id
    AND cr.relationship_type = 'prerequisite_of'
  JOIN public.concepts c_pre ON c_pre.id = cr.source_concept_id
  LEFT JOIN public.mastery_profiles prof
    ON prof.user_id = v_uid
    AND prof.concept_id = c_pre.id
  WHERE mp.user_id = v_uid
    AND mp.status = 'active'
    AND mp.pct < 30
    -- prerequisite not yet Secure or Mastered
    AND (prof.id IS NULL OR prof.overall_state NOT IN ('Secure','Mastered'))
  ORDER BY mp.updated_at DESC
  LIMIT 1;

  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key',       'prerequisite_gap',
      'action',    'Learn ' || v_prereq.prerequisite_name || ' first',
      'reason',    'You are working on ' || v_prereq.blocked_concept || ', but it builds on ' || v_prereq.prerequisite_name || '. A quick foundation session will make the harder topic much easier.',
      'route',     '/student/learn?concept=' || v_prereq.prerequisite_slug,
      'est_minutes', 15,
      'blocked_concept', v_prereq.blocked_concept,
      'prerequisite',    v_prereq.prerequisite_name
    );
  END IF;

  -- ---------------------------------------------------------------
  -- 1. Urgent teacher assignment (due within 5 days, not completed).
  -- ---------------------------------------------------------------
  SELECT a.id, a.title, a.deadline, a.assessment_id, a.experience_id INTO r
  FROM public.assignments a
  JOIN public.class_students cs ON cs.class_id = a.class_id AND cs.student_id = v_uid
  WHERE a.deadline IS NOT NULL
    AND a.deadline >= CURRENT_DATE
    AND a.deadline <= CURRENT_DATE + 5
    AND (a.assessment_id IS NULL OR NOT EXISTS (
          SELECT 1 FROM public.assessment_submissions s
          WHERE s.assessment_id = a.assessment_id AND s.student_id = v_uid AND s.submitted_at IS NOT NULL))
    AND (a.experience_id IS NULL OR NOT EXISTS (
          SELECT 1 FROM public.experience_progress ep
          WHERE ep.experience_id = a.experience_id AND ep.user_id = v_uid AND ep.status = 'completed'))
  ORDER BY a.deadline ASC LIMIT 1;

  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'assignment',
      'action', 'Complete your teacher''s assignment',
      'reason', 'Your teacher set "' || COALESCE(r.title, 'an assignment') || '", due ' || to_char(r.deadline, 'Dy DD Mon') || '.',
      'route', CASE
        WHEN r.assessment_id IS NOT NULL THEN '/student/assessments/' || r.assessment_id
        WHEN r.experience_id IS NOT NULL  THEN '/student/experiences/' || r.experience_id
        ELSE '/student/assignments'
      END,
      'est_minutes', 20
    );
  END IF;

  -- ---------------------------------------------------------------
  -- 2. Continue an unfinished active Mastery Path.
  -- ---------------------------------------------------------------
  SELECT id, concept_name, stage_label, current_stage, pct INTO r
  FROM public.mastery_paths
  WHERE user_id = v_uid AND status = 'active' AND COALESCE(pct,0) < 100
  ORDER BY updated_at DESC LIMIT 1;

  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'continue',
      'action', 'Continue ' || r.concept_name,
      'reason', 'You reached ' || COALESCE(NULLIF(r.stage_label,''), 'stage ' || (r.current_stage + 1)) || ' (' || COALESCE(r.pct,0) || '% done). Pick up where you stopped.',
      'route', '/student/mastery/' || r.id,
      'est_minutes', 10
    );
  END IF;

  -- ---------------------------------------------------------------
  -- 3. Recall cards due today.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_recall
  FROM public.recall_cards
  WHERE user_id = v_uid AND due_at <= CURRENT_DATE;

  IF v_recall > 0 THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'recall',
      'action', 'Review ' || v_recall || ' item' || CASE WHEN v_recall = 1 THEN '' ELSE 's' END || ' before you forget',
      'reason', 'A short review keeps what you have already learned from slipping away.',
      'route', '/student/review',
      'est_minutes', LEAST(v_recall * 1, 10)
    );
  END IF;

  -- ---------------------------------------------------------------
  -- 4. Repeated misconception (same mistake category >= 3 times in 30 days).
  -- ---------------------------------------------------------------
  SELECT mistake_category, count(*) AS n INTO r
  FROM public.attempts
  WHERE user_id = v_uid
    AND mistake_category IS NOT NULL
    AND created_at >= now() - interval '30 days'
  GROUP BY mistake_category
  HAVING count(*) >= 3
  ORDER BY count(*) DESC LIMIT 1;

  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'misconception',
      'action', 'Target your ' || r.mistake_category || ' errors',
      'reason', 'You have made ' || r.n || ' ' || r.mistake_category || ' errors recently. A focused practice set will help.',
      'route', '/student/solve',
      'est_minutes', 8
    );
  END IF;

  -- ---------------------------------------------------------------
  -- 5. Active student goal.
  -- ---------------------------------------------------------------
  SELECT g.title, g.concept_id INTO r
  FROM public.student_goals g
  WHERE g.user_id = v_uid AND g.status = 'active'
  ORDER BY g.created_at DESC LIMIT 1;

  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'goal',
      'action', 'Work toward: ' || r.title,
      'reason', 'This is a goal you set. A focused session moves you closer.',
      'route', '/student/learn',
      'est_minutes', 12
    );
  END IF;

  -- ---------------------------------------------------------------
  -- Fallback.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_paths FROM public.mastery_paths WHERE user_id = v_uid;

  IF v_paths = 0 THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'start',
      'action', 'Start your first Mastery Path',
      'reason', 'Pick a concept you want to understand and mytuta builds a path from a quick check to proven mastery.',
      'route', '/student/learn',
      'est_minutes', 15
    );
  ELSE
    v_cands := v_cands || jsonb_build_object(
      'key', 'explore',
      'action', 'Explore a new concept',
      'reason', 'You are up to date. Extend your learning with something new.',
      'route', '/student/learn',
      'est_minutes', 12
    );
  END IF;

  RETURN jsonb_build_object(
    'primary',      v_cands->0,
    'alternatives', COALESCE(
      (SELECT jsonb_agg(e)
       FROM (SELECT e FROM jsonb_array_elements(v_cands) WITH ORDINALITY t(e, ord)
             WHERE ord > 1 AND ord <= 4) s
      ), '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_best_action() TO authenticated;
