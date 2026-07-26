-- =====================================================================
-- mytuta Intelligence Layer — Phase 1 foundation (connected foundations)
--  A thin spine over EXISTING signal (attempts, mastery_profiles,
--  recall_cards, mastery_paths, onboarding_answers). Adds:
--   * learning_events  — behavioral/lifecycle stream attempts lacks
--   * student_goals    — per-student goals
--   * learner_profile  — editable living profile + memory (corrections)
--  All own-row RLS (like every learner table), so goal/memory edits are
--  direct client writes. The engine is rules-first with TEMPLATED text —
--  no AI calls, deterministic + auditable — exposed as auth.uid()-scoped
--  SECURITY DEFINER STABLE RPCs (same shape as teacher_dashboard) so the
--  same logic can later drive nudges + admin metrics.
-- Apply AFTER 20260720420000_mytuta_admin_settings.sql.
-- =====================================================================

-- ---------- tables ----------
CREATE TABLE IF NOT EXISTS public.learning_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind       text NOT NULL,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  path_id    uuid REFERENCES public.mastery_paths(id) ON DELETE SET NULL,
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own learning events select" ON public.learning_events;
CREATE POLICY "own learning events select" ON public.learning_events
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "own learning events insert" ON public.learning_events;
CREATE POLICY "own learning events insert" ON public.learning_events
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS learning_events_user_idx ON public.learning_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS learning_events_kind_idx ON public.learning_events (user_id, kind);

CREATE TABLE IF NOT EXISTS public.student_goals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  kind       text NOT NULL DEFAULT 'short' CHECK (kind IN ('short','long')),
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  target     text,
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','dropped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own goals" ON public.student_goals;
CREATE POLICY "own goals" ON public.student_goals
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS student_goals_user_idx ON public.student_goals (user_id, status);
CREATE TRIGGER student_goals_updated_at BEFORE UPDATE ON public.student_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.learner_profile (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  support_level text NOT NULL DEFAULT 'guided' CHECK (support_level IN ('full','guided','light','independent')),
  prefs         jsonb NOT NULL DEFAULT '{}'::jsonb,
  corrections   jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary       text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learner_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own learner profile" ON public.learner_profile;
CREATE POLICY "own learner profile" ON public.learner_profile
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER learner_profile_updated_at BEFORE UPDATE ON public.learner_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reads over attempts were unindexed for the engine; add the two it needs.
CREATE INDEX IF NOT EXISTS attempts_user_created_idx ON public.attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS attempts_user_concept_idx ON public.attempts (user_id, concept_id);

-- ---------- record_learning_event ----------
CREATE OR REPLACE FUNCTION public.record_learning_event(
  p_kind text, p_concept_id uuid DEFAULT NULL, p_path_id uuid DEFAULT NULL, p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO public.learning_events (user_id, kind, concept_id, path_id, meta)
  VALUES (auth.uid(), p_kind, p_concept_id, p_path_id, COALESCE(p_meta, '{}'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_learning_event(text, uuid, uuid, jsonb) TO authenticated;

-- ---------- next_best_action(): the single most valuable next step ----------
CREATE OR REPLACE FUNCTION public.next_best_action()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cands jsonb := '[]'::jsonb;
  r record;
  v_recall int;
  v_paths int;
BEGIN
  IF v_uid IS NULL THEN RETURN '{}'::jsonb; END IF;

  -- 1. Urgent teacher assignment (due within 5 days, not completed).
  SELECT a.id, a.title, a.deadline, a.assessment_id, a.experience_id INTO r
  FROM public.assignments a
  JOIN public.class_students cs ON cs.class_id = a.class_id AND cs.student_id = v_uid
  WHERE a.deadline IS NOT NULL AND a.deadline >= CURRENT_DATE AND a.deadline <= CURRENT_DATE + 5
    AND (a.assessment_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.assessment_submissions s WHERE s.assessment_id = a.assessment_id AND s.student_id = v_uid AND s.submitted_at IS NOT NULL))
    AND (a.experience_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.experience_progress ep WHERE ep.experience_id = a.experience_id AND ep.user_id = v_uid AND ep.status = 'completed'))
  ORDER BY a.deadline ASC LIMIT 1;
  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'assignment', 'action', 'Complete your teacher''s assignment',
      'reason', 'Your teacher set "' || COALESCE(r.title, 'an assignment') || '", due ' || to_char(r.deadline, 'Dy DD Mon') || '.',
      'route', CASE WHEN r.assessment_id IS NOT NULL THEN '/student/assessments/' || r.assessment_id
                    WHEN r.experience_id IS NOT NULL THEN '/student/experiences/' || r.experience_id
                    ELSE '/student/assignments' END,
      'est_minutes', 20);
  END IF;

  -- 2. Continue an unfinished active Mastery Path (continue where you left off).
  SELECT id, concept_name, stage_label, current_stage, pct INTO r
  FROM public.mastery_paths
  WHERE user_id = v_uid AND status = 'active' AND COALESCE(pct,0) < 100
  ORDER BY updated_at DESC LIMIT 1;
  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'continue', 'action', 'Continue ' || r.concept_name,
      'reason', 'You reached ' || COALESCE(NULLIF(r.stage_label,''), 'stage ' || (r.current_stage + 1)) || ' (' || COALESCE(r.pct,0) || '% done). Pick up where you stopped.',
      'route', '/student/mastery/' || r.id, 'est_minutes', 10);
  END IF;

  -- 3. Concepts at risk of forgetting (recall due today).
  SELECT count(*) INTO v_recall FROM public.recall_cards WHERE user_id = v_uid AND due_at <= CURRENT_DATE;
  IF v_recall > 0 THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'recall', 'action', 'Review ' || v_recall || ' item' || CASE WHEN v_recall = 1 THEN '' ELSE 's' END || ' before you forget',
      'reason', 'A short review keeps what you have already learned from slipping away.',
      'route', '/student/review', 'est_minutes', LEAST(v_recall * 1, 10));
  END IF;

  -- 4. Repeated misconception (same mistake category >= 3 times recently).
  SELECT mistake_category, count(*) AS n INTO r
  FROM public.attempts
  WHERE user_id = v_uid AND mistake_category IS NOT NULL AND created_at >= now() - interval '30 days'
  GROUP BY mistake_category HAVING count(*) >= 3
  ORDER BY count(*) DESC LIMIT 1;
  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'misconception', 'action', 'Target your ' || r.mistake_category || ' errors',
      'reason', 'You have made ' || r.n || ' ' || r.mistake_category || ' errors recently. A focused practice set will help.',
      'route', '/student/solve', 'est_minutes', 8);
  END IF;

  -- 5. A goal linked to a concept not yet secure.
  SELECT g.title, g.concept_id INTO r
  FROM public.student_goals g
  WHERE g.user_id = v_uid AND g.status = 'active'
  ORDER BY g.created_at DESC LIMIT 1;
  IF FOUND THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'goal', 'action', 'Work toward: ' || r.title,
      'reason', 'This is a goal you set. A focused session moves you closer.',
      'route', '/student/learn', 'est_minutes', 12);
  END IF;

  -- Fallback: brand-new learner with no paths -> start the first path.
  SELECT count(*) INTO v_paths FROM public.mastery_paths WHERE user_id = v_uid;
  IF v_paths = 0 THEN
    v_cands := v_cands || jsonb_build_object(
      'key', 'start', 'action', 'Start your first Mastery Path',
      'reason', 'Pick a concept you want to understand and mytuta builds a path from a quick check to proven mastery.',
      'route', '/student/learn', 'est_minutes', 15);
  ELSE
    v_cands := v_cands || jsonb_build_object(
      'key', 'explore', 'action', 'Explore a new concept',
      'reason', 'You are up to date. Extend your learning with something new.',
      'route', '/student/learn', 'est_minutes', 12);
  END IF;

  RETURN jsonb_build_object(
    'primary', v_cands->0,
    'alternatives', COALESCE((SELECT jsonb_agg(e) FROM (SELECT e FROM jsonb_array_elements(v_cands) WITH ORDINALITY t(e, ord) WHERE ord > 1 AND ord <= 4) s), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.next_best_action() TO authenticated;

-- ---------- learner_model(): the six-part living profile ----------
CREATE OR REPLACE FUNCTION public.learner_model()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_prof record;
  v_lp record;
  v_skills jsonb;
  v_top_mistake text;
BEGIN
  IF v_uid IS NULL THEN RETURN '{}'::jsonb; END IF;

  SELECT learning_stage, subjects, goals, onboarding_answers INTO v_prof
  FROM public.profiles WHERE user_id = v_uid;
  SELECT support_level, prefs, corrections, summary INTO v_lp
  FROM public.learner_profile WHERE user_id = v_uid;

  -- Skill percentages from mastery_profiles dimensions (0-5 -> %).
  SELECT jsonb_build_object(
    'recall', COALESCE(round(avg(recall) * 20), 0),
    'calculation', COALESCE(round(avg(procedural_fluency) * 20), 0),
    'reasoning', COALESCE(round(avg(reasoning) * 20), 0),
    'application', COALESCE(round(avg(application) * 20), 0),
    'knowledge', COALESCE(round(avg(concept_knowledge) * 20), 0)
  ) INTO v_skills
  FROM public.mastery_profiles WHERE user_id = v_uid;

  SELECT mistake_category INTO v_top_mistake
  FROM public.attempts
  WHERE user_id = v_uid AND mistake_category IS NOT NULL AND created_at >= now() - interval '60 days'
  GROUP BY mistake_category ORDER BY count(*) DESC LIMIT 1;

  RETURN jsonb_build_object(
    'identity', jsonb_build_object(
      'learning_stage', v_prof.learning_stage,
      'subjects', COALESCE(to_jsonb(v_prof.subjects), '[]'::jsonb),
      'onboarding', COALESCE(v_prof.onboarding_answers, '{}'::jsonb)),
    'skills', v_skills,
    'strengths', COALESCE((
      SELECT jsonb_agg(label) FROM (
        SELECT k AS label FROM jsonb_each_text(v_skills) e(k, val) WHERE val::int >= 70
      ) s), '[]'::jsonb),
    'challenges', COALESCE((
      SELECT jsonb_agg(label) FROM (
        SELECT k AS label FROM jsonb_each_text(v_skills) e(k, val) WHERE val::int > 0 AND val::int < 45
      ) s), '[]'::jsonb),
    'top_mistake', v_top_mistake,
    'concepts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('concept', concept_name, 'state', overall_state) ORDER BY updated_at DESC)
      FROM public.mastery_profiles WHERE user_id = v_uid), '[]'::jsonb),
    'goals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'kind', kind, 'status', status) ORDER BY created_at DESC)
      FROM public.student_goals WHERE user_id = v_uid AND status = 'active'), '[]'::jsonb),
    'support_level', COALESCE(v_lp.support_level, 'guided'),
    'prefs', COALESCE(v_lp.prefs, '{}'::jsonb),
    'corrections', COALESCE(v_lp.corrections, '{}'::jsonb),
    'summary', v_lp.summary
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.learner_model() TO authenticated;

-- ---------- learning_insights(): actionable templated insight cards ----------
CREATE OR REPLACE FUNCTION public.learning_insights()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_out jsonb := '[]'::jsonb;
  r record;
  v_recall int;
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;

  -- Near-mastery: a path 80%+ but not finished.
  SELECT id, concept_name, pct INTO r FROM public.mastery_paths
  WHERE user_id = v_uid AND status = 'active' AND COALESCE(pct,0) >= 80 AND COALESCE(pct,0) < 100
  ORDER BY pct DESC LIMIT 1;
  IF FOUND THEN
    v_out := v_out || jsonb_build_object(
      'text', 'You are close to mastering ' || r.concept_name || '. Finish the last stage to lock it in.',
      'action_label', 'Finish path', 'action_route', '/student/mastery/' || r.id);
  END IF;

  -- Interpretation gap: many interpretation errors, few calculation errors.
  SELECT count(*) FILTER (WHERE mistake_category = 'interpretation') AS interp,
         count(*) FILTER (WHERE mistake_category = 'calculation') AS calc INTO r
  FROM public.attempts WHERE user_id = v_uid AND created_at >= now() - interval '60 days';
  IF r.interp >= 2 AND r.interp > r.calc THEN
    v_out := v_out || jsonb_build_object(
      'text', 'You solve direct calculations well, but struggle to interpret word problems.',
      'action_label', 'Practise word problems', 'action_route', '/student/solve');
  END IF;

  -- Unit errors.
  SELECT count(*) AS n INTO r FROM public.attempts
  WHERE user_id = v_uid AND mistake_category = 'unit' AND created_at >= now() - interval '60 days';
  IF r.n >= 2 THEN
    v_out := v_out || jsonb_build_object(
      'text', 'Units are your most common slip. Double-check them before you submit.',
      'action_label', 'Try a practice set', 'action_route', '/student/solve');
  END IF;

  -- Forgetting.
  SELECT count(*) INTO v_recall FROM public.recall_cards WHERE user_id = v_uid AND due_at <= CURRENT_DATE;
  IF v_recall > 0 THEN
    v_out := v_out || jsonb_build_object(
      'text', 'You have ' || v_recall || ' item' || CASE WHEN v_recall = 1 THEN '' ELSE 's' END || ' due for review — a two-minute check keeps them fresh.',
      'action_label', 'Review now', 'action_route', '/student/review');
  END IF;

  -- Skill imbalance: strong calculation, weak application.
  SELECT round(avg(procedural_fluency) * 20) AS calc, round(avg(application) * 20) AS app INTO r
  FROM public.mastery_profiles WHERE user_id = v_uid;
  IF r.calc >= 60 AND r.app > 0 AND r.app < 45 THEN
    v_out := v_out || jsonb_build_object(
      'text', 'Your calculation is strong, but applying concepts in new situations is your weaker area.',
      'action_label', 'Try an application task', 'action_route', '/student/lab');
  END IF;

  RETURN v_out;
END;
$$;
GRANT EXECUTE ON FUNCTION public.learning_insights() TO authenticated;

-- ---------- solve_history(): Solve grouped, not a flat list ----------
CREATE OR REPLACE FUNCTION public.solve_history()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT COALESCE(NULLIF(response->>'topic', ''), 'General practice') AS topic,
             count(*) AS attempted,
             count(*) FILTER (WHERE (response->>'saved')::boolean IS TRUE) AS saved,
             max(created_at) AS last_at
      FROM public.attempts
      WHERE user_id = v_uid AND kind = 'solve'
      GROUP BY COALESCE(NULLIF(response->>'topic', ''), 'General practice')
      ORDER BY max(created_at) DESC
    ) t
  ), '[]'::jsonb);
END;
$$;
GRANT EXECUTE ON FUNCTION public.solve_history() TO authenticated;
