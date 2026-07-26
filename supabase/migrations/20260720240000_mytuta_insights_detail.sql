-- =====================================================================
-- mytuta: Insights detail — per-student progress + per-question analysis
--  * Extends teacher_dashboard() additively (new jsonb keys only; existing
--    keys unchanged) rather than adding new RPCs, since everything needed
--    is already aggregatable from mastery_profiles / assessment_questions /
--    assessment_submissions with no new columns.
--  * class_progress: one row per student the teacher has, status derived
--    from their mastery_profiles (Not started / Needs support / In
--    progress / Mastered — a 4-state simplification of the PRD's 5 states;
--    "Completed" has no signal distinct from "Mastered" in this data model).
--  * question_analysis: per-question % correct and the most-picked wrong
--    option, across every assessment the teacher owns, worst 10 first.
-- Apply AFTER 20260720230000_mytuta_experience_progress.sql.
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
    ),
    student_display AS (
      SELECT DISTINCT ON (cs.student_id)
        cs.student_id AS sid, cs.display_name, cs.mark, cs.color
      FROM public.class_students cs
      JOIN public.classes c ON c.id = cs.class_id
      WHERE c.teacher_id = v_uid AND cs.student_id IS NOT NULL
      ORDER BY cs.student_id, cs.created_at
    ),
    student_stats AS (
      SELECT sid,
             count(*) FILTER (WHERE mp.user_id IS NOT NULL) AS n,
             count(*) FILTER (WHERE mp.overall_state = 'Mastered') AS n_mastered,
             count(*) FILTER (WHERE mp.overall_state IN ('Beginning')) AS n_weak
      FROM my_students
      LEFT JOIN public.mastery_profiles mp ON mp.user_id = my_students.sid
      GROUP BY sid
    ),
    q_answers AS (
      SELECT q.id AS question_id, q.prompt, q.options, q.correct_index, a.title AS assessment_title,
             (elem->>'chosen_index')::int AS chosen_index
      FROM public.assessment_questions q
      JOIN public.assessments a ON a.id = q.assessment_id AND a.teacher_id = v_uid
      JOIN public.assessment_submissions sub ON sub.assessment_id = q.assessment_id
      CROSS JOIN LATERAL jsonb_array_elements(sub.answers) AS elem
      WHERE (elem->>'question_id')::uuid = q.id
    ),
    q_stats AS (
      SELECT question_id, prompt, options, correct_index, assessment_title,
             count(*) AS n,
             count(*) FILTER (WHERE chosen_index = correct_index) AS n_correct
      FROM q_answers
      GROUP BY question_id, prompt, options, correct_index, assessment_title
    ),
    q_wrong AS (
      SELECT DISTINCT ON (question_id) question_id, chosen_index AS top_wrong_index
      FROM q_answers
      WHERE chosen_index IS NOT NULL AND chosen_index <> correct_index
      GROUP BY question_id, chosen_index
      ORDER BY question_id, count(*) DESC
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
        WHERE weak > 0), '[]'::jsonb),
      'class_progress', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', COALESCE(d.display_name, 'Student'),
            'mark', COALESCE(d.mark, '?'),
            'color', COALESCE(d.color, '#2e9e6b'),
            'status', CASE
              WHEN st.n = 0 THEN 'Not started'
              WHEN st.n_mastered = st.n THEN 'Mastered'
              WHEN st.n_weak::float / NULLIF(st.n, 0) > 0.5 THEN 'Needs support'
              ELSE 'In progress'
            END
          )
          ORDER BY d.display_name
        )
        FROM student_stats st
        JOIN student_display d ON d.sid = st.sid), '[]'::jsonb),
      'question_analysis', COALESCE((
        SELECT jsonb_agg(row ORDER BY (row->>'pct_correct')::int ASC)
        FROM (
          SELECT jsonb_build_object(
            'assessment_title', qs.assessment_title,
            'prompt', qs.prompt,
            'attempts', qs.n,
            'pct_correct', COALESCE(round(100.0 * qs.n_correct / NULLIF(qs.n, 0)), 0),
            'most_wrong_option', CASE WHEN qw.top_wrong_index IS NOT NULL THEN qs.options->>qw.top_wrong_index ELSE NULL END
          ) AS row
          FROM q_stats qs
          LEFT JOIN q_wrong qw ON qw.question_id = qs.question_id
          ORDER BY qs.n_correct::float / NULLIF(qs.n, 0) ASC
          LIMIT 10
        ) ranked), '[]'::jsonb)
    )
  );
END;
$$;
