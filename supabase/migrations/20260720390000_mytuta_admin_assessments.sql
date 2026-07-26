-- =====================================================================
-- mytuta Admin Panel — Assessments module (PRD §20)
--  * admin_list_assessments (across all teachers) + admin_assessment_detail
--    (questions + submissions/results) — read, admin-gated.
--  * admin_set_assessment_status — status action, audited.
-- Apply AFTER 20260720380000_mytuta_admin_content.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_list_assessments(
  p_search text DEFAULT NULL, p_type text DEFAULT NULL, p_status text DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.assessments a
  WHERE (p_type IS NULL OR a.type = p_type)
    AND (p_status IS NULL OR a.status = p_status)
    AND (v_q IS NULL OR a.title ILIKE '%'||v_q||'%');
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT a.id, a.title, a.type, a.status, a.class_label, a.submitted, a.total, a.avg_level, a.created_at,
             trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS teacher,
             (SELECT count(*) FROM public.assessment_questions q WHERE q.assessment_id = a.id) AS questions
      FROM public.assessments a LEFT JOIN public.profiles p ON p.user_id = a.teacher_id
      WHERE (p_type IS NULL OR a.type = p_type)
        AND (p_status IS NULL OR a.status = p_status)
        AND (v_q IS NULL OR a.title ILIKE '%'||v_q||'%')
      ORDER BY a.created_at DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_assessments(text, text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_assessment_detail(p_assessment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN jsonb_build_object(
    'assessment', (SELECT to_jsonb(a) FROM public.assessments a WHERE id = p_assessment_id),
    'teacher', (SELECT jsonb_build_object('name', trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')), 'email', p.email)
                FROM public.assessments a JOIN public.profiles p ON p.user_id = a.teacher_id WHERE a.id = p_assessment_id),
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object('ord', q.ord, 'prompt', q.prompt, 'options', q.options, 'correct_index', q.correct_index, 'dimension', q.dimension) ORDER BY q.ord)
                           FROM public.assessment_questions q WHERE q.assessment_id = p_assessment_id), '[]'::jsonb),
    'submissions', jsonb_build_object(
      'count', (SELECT count(*) FROM public.assessment_submissions s WHERE s.assessment_id = p_assessment_id AND s.submitted_at IS NOT NULL),
      'avg_score', COALESCE((SELECT round(avg(score)) FROM public.assessment_submissions s WHERE s.assessment_id = p_assessment_id AND s.submitted_at IS NOT NULL), 0),
      'recent', COALESCE((SELECT jsonb_agg(row_to_json(x)) FROM (
        SELECT trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS student, s.score, s.mastery_level, s.submitted_at
        FROM public.assessment_submissions s LEFT JOIN public.profiles p ON p.user_id = s.student_id
        WHERE s.assessment_id = p_assessment_id AND s.submitted_at IS NOT NULL
        ORDER BY s.submitted_at DESC LIMIT 30) x), '[]'::jsonb)
    )
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_assessment_detail(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_assessment_status(p_assessment_id uuid, p_status text, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT status INTO v_prev FROM public.assessments WHERE id = p_assessment_id;
  UPDATE public.assessments SET status = p_status WHERE id = p_assessment_id;
  PERFORM public.admin_log('set_assessment_status', 'assessment', p_assessment_id::text, p_reason,
    jsonb_build_object('status', v_prev), jsonb_build_object('status', p_status));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_assessment_status(uuid, text, text) TO authenticated;
