-- Richer Solve tracking: update own attempts + history with session detail.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'attempts' AND policyname = 'own update'
  ) THEN
    CREATE POLICY "own update" ON public.attempts
      FOR UPDATE USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Returns topic rollups AND recent individual sessions (question, mode, answer).
CREATE OR REPLACE FUNCTION public.solve_history()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_topics jsonb;
  v_sessions jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('topics', '[]'::jsonb, 'sessions', '[]'::jsonb);
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_topics
  FROM (
    SELECT
      COALESCE(NULLIF(trim(response->>'topic'), ''), 'General practice') AS topic,
      count(*)::int AS attempted,
      count(*) FILTER (WHERE COALESCE((response->>'saved')::boolean, false) IS TRUE)::int AS saved,
      max(created_at) AS last_at
    FROM public.attempts
    WHERE user_id = v_uid AND kind = 'solve'
    GROUP BY COALESCE(NULLIF(trim(response->>'topic'), ''), 'General practice')
    ORDER BY max(created_at) DESC
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
  INTO v_sessions
  FROM (
    SELECT
      id,
      prompt,
      concept_id,
      created_at,
      COALESCE(NULLIF(trim(response->>'topic'), ''), 'General practice') AS topic,
      COALESCE(NULLIF(trim(response->>'helpMode'), ''), 'steps') AS help_mode,
      COALESCE(response->>'status', 'started') AS status,
      COALESCE((response->>'saved')::boolean, false) AS saved,
      COALESCE(response->>'finalAnswer', '') AS final_answer,
      COALESCE(response->>'method', '') AS method,
      COALESCE(response->>'struggle', '') AS struggle,
      COALESCE(response->>'couldRepeat', '') AS could_repeat,
      COALESCE((response->>'stepCount')::int, 0) AS step_count,
      COALESCE(response->>'hint', '') AS hint,
      COALESCE(response->>'explanation', '') AS explanation
    FROM public.attempts
    WHERE user_id = v_uid AND kind = 'solve'
    ORDER BY created_at DESC
    LIMIT 80
  ) s;

  RETURN jsonb_build_object('topics', v_topics, 'sessions', v_sessions);
END;
$$;

GRANT EXECUTE ON FUNCTION public.solve_history() TO authenticated;
