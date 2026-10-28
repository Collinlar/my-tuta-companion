-- =====================================================================
-- Mastery Depth: teacher depth summary.
--
-- Aggregates concept_depth_mastery across the students in a teacher's classes
-- into per-concept Foundation / Applied / Advanced "secure" percentages (PRD 26).
-- SECURITY DEFINER so it can read across students' own-row-RLS depth records,
-- scoped strictly to classes owned by the caller. Optional p_class_id narrows to
-- one class. Named dollar tag to avoid SQL-editor $$ parsing issues.
-- Apply AFTER 20270000000003_mytuta_per_depth_stages.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.teacher_depth_summary(p_class_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $tds$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;

  RETURN COALESCE((
    WITH my_students AS (
      SELECT DISTINCT cs.student_id AS sid
      FROM public.class_students cs
      JOIN public.classes c ON c.id = cs.class_id
      WHERE c.teacher_id = v_uid
        AND cs.student_id IS NOT NULL
        AND (p_class_id IS NULL OR cs.class_id = p_class_id)
    ),
    cdm AS (
      SELECT d.user_id, d.concept_id, d.depth, d.state
      FROM public.concept_depth_mastery d
      JOIN my_students s ON s.sid = d.user_id
      WHERE d.concept_id IS NOT NULL
    ),
    agg AS (
      SELECT concept_id,
        count(DISTINCT user_id)                                                         AS students,
        count(DISTINCT user_id) FILTER (WHERE depth = 'foundation' AND state = 'secure') AS f_secure,
        count(DISTINCT user_id) FILTER (WHERE depth = 'applied'    AND state = 'secure') AS a_secure,
        count(DISTINCT user_id) FILTER (WHERE depth = 'advanced'   AND state = 'secure') AS adv_secure
      FROM cdm
      GROUP BY concept_id
    )
    SELECT jsonb_agg(
      jsonb_build_object(
        'concept_id',            a.concept_id,
        'concept_name',          c.name,
        'subject',               c.subject,
        'max_depth',             c.max_depth,
        'students',              a.students,
        'foundation_secure_pct', COALESCE(round(100.0 * a.f_secure   / NULLIF(a.students, 0)), 0),
        'applied_secure_pct',    COALESCE(round(100.0 * a.a_secure   / NULLIF(a.students, 0)), 0),
        'advanced_secure_pct',   COALESCE(round(100.0 * a.adv_secure / NULLIF(a.students, 0)), 0)
      )
      ORDER BY a.students DESC, c.name ASC
    )
    FROM agg a
    JOIN public.concepts c ON c.id = a.concept_id
  ), '[]'::jsonb);
END;
$tds$;

GRANT EXECUTE ON FUNCTION public.teacher_depth_summary(uuid) TO authenticated;
