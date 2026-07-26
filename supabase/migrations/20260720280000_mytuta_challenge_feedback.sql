-- =====================================================================
-- mytuta: challenge feedback loop (PRD §18 stages 7-9)
--  * challenge_submissions gains feedback / feedback_level / reviewed_at.
--  * get_challenge_submissions: teacher reads every submission for a
--    challenge they created, WITH each student's display name (resolved
--    server-side, since profiles RLS is own-row and would otherwise hide
--    other students' names from the teacher's client).
--  * review_challenge_submission: teacher writes feedback + a level and
--    notifies the student (new 'feedback' notification kind). Written via a
--    SECURITY DEFINER RPC rather than a broadened UPDATE policy so a student
--    can never author feedback on their own submission.
-- Apply AFTER 20260720270000_mytuta_lab_dimensions.sql.
-- =====================================================================

ALTER TABLE public.challenge_submissions ADD COLUMN IF NOT EXISTS feedback text;
ALTER TABLE public.challenge_submissions ADD COLUMN IF NOT EXISTS feedback_level text;
ALTER TABLE public.challenge_submissions ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- ---------------------------------------------------------------------
-- get_challenge_submissions: teacher view of every submission for a
-- challenge they own, with resolved student names.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_challenge_submissions(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.challenges WHERE id = p_challenge_id AND created_by = v_uid) THEN
    RAISE EXCEPTION 'Challenge not found';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'student_name', COALESCE(
          NULLIF(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
          'Student'),
        'status', s.status,
        'stage', s.stage,
        'work', s.work,
        'feedback', s.feedback,
        'feedback_level', s.feedback_level,
        'reviewed_at', s.reviewed_at,
        'submitted', (s.status = 'submitted')
      )
      ORDER BY s.updated_at DESC
    )
    FROM public.challenge_submissions s
    LEFT JOIN public.profiles p ON p.user_id = s.user_id
    WHERE s.challenge_id = p_challenge_id
  ), '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_submissions(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- review_challenge_submission: teacher writes feedback, notifies student.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.review_challenge_submission(p_submission_id uuid, p_feedback text, p_level text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_student uuid;
  v_title text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT s.user_id, ch.title INTO v_student, v_title
  FROM public.challenge_submissions s
  JOIN public.challenges ch ON ch.id = s.challenge_id
  WHERE s.id = p_submission_id AND ch.created_by = v_uid;

  IF v_student IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  UPDATE public.challenge_submissions
  SET feedback = p_feedback, feedback_level = p_level, reviewed_at = now()
  WHERE id = p_submission_id;

  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (v_student, 'feedback',
          'Feedback on ' || COALESCE(v_title, 'your challenge'),
          COALESCE(NULLIF(p_level, ''), 'Reviewed') || '. Open the challenge to read your teacher''s notes.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_challenge_submission(uuid, text, text) TO authenticated;
