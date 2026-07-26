-- =====================================================================
-- mytuta: teacher_dashboard() — live analytics from real student data
-- Aggregates the mastery_profiles of the students who have joined this
-- teacher's classes into stats, a skill breakdown, and misconception
-- flags. SECURITY DEFINER so it can read across the teacher's students'
-- own-row-RLS profiles (scoped strictly to classes owned by the caller).
-- Apply AFTER 20260720120000_mytuta_class_link.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.teacher_dashboard()
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
    RETURN '{}'::jsonb;
  END IF;

  RETURN (
    WITH my_students AS (
      SELECT DISTINCT cs.student_id AS sid
      FROM public.class_students cs
      JOIN public.classes c ON c.id = cs.class_id
      WHERE c.teacher_id = v_uid AND cs.student_id IS NOT NULL
    ),
    prof AS (
      SELECT mp.*
      FROM public.mastery_profiles mp
      JOIN my_students s ON s.sid = mp.user_id
    ),
    agg AS (
      SELECT concept_name,
             count(*) AS n,
             count(*) FILTER (WHERE overall_state IN ('Beginning', 'Developing')) AS weak
      FROM prof
      WHERE concept_name IS NOT NULL
      GROUP BY concept_name
    )
    SELECT jsonb_build_object(
      'active_classes', (SELECT count(*) FROM public.classes WHERE teacher_id = v_uid),
      'students', (SELECT count(*) FROM my_students),
      'reaching_secure', COALESCE((
        SELECT round(100.0 * count(*) FILTER (WHERE overall_state IN ('Secure', 'Mastered')) / NULLIF(count(*), 0))
        FROM prof), 0),
      'concepts_taught', (SELECT count(DISTINCT concept_name) FROM prof WHERE concept_name IS NOT NULL),
      'class_skills', COALESCE((
        SELECT jsonb_build_array(
          jsonb_build_object('name', 'Recall',       'pct', COALESCE(round(avg(recall) * 20), 0),             'color', '#2e9e6b'),
          jsonb_build_object('name', 'Calculation',  'pct', COALESCE(round(avg(procedural_fluency) * 20), 0), 'color', '#2e9e6b'),
          jsonb_build_object('name', 'Reasoning',    'pct', COALESCE(round(avg(reasoning) * 20), 0),          'color', '#3f8fc4'),
          jsonb_build_object('name', 'Application',  'pct', COALESCE(round(avg(application) * 20), 0),         'color', '#c47a17'),
          jsonb_build_object('name', 'Knowledge',    'pct', COALESCE(round(avg(concept_knowledge) * 20), 0),  'color', '#3f8fc4')
        )
        FROM prof), '[]'::jsonb),
      'misconceptions', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'concept', concept_name,
            'pct_label', (round(100.0 * weak / NULLIF(n, 0))::text) || '% below secure',
            'detail', 'Several students are still Beginning or Developing on ' || concept_name || '. A short reteach or application task would help.'
          )
          ORDER BY weak DESC
        )
        FROM agg
        WHERE weak > 0), '[]'::jsonb)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_dashboard() TO authenticated;
