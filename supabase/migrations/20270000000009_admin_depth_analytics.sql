-- =====================================================================
-- Mastery Depth: admin depth analytics (PRD 36).
--
-- Cross-learner depth adoption for the admin/academic team: overall secure
-- counts and per-concept Foundation/Applied/Advanced secure + needs-reinforcement
-- totals, so they can see where progression stalls and which concepts need
-- Applied/Advanced content. SECURITY DEFINER, admin-only, SELECT-only (no DML,
-- no SELECT ... INTO), named dollar tag. Dashboard- and CLI-safe.
-- Apply AFTER 20270000000001_mytuta_mastery_depth_spine.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_depth_analytics()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $ada$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  RETURN jsonb_build_object(
    'overall', (
      SELECT jsonb_build_object(
        'learners',            count(DISTINCT user_id),
        'foundation_secure',   count(*) FILTER (WHERE depth = 'foundation' AND state = 'secure'),
        'applied_secure',      count(*) FILTER (WHERE depth = 'applied'    AND state = 'secure'),
        'advanced_secure',     count(*) FILTER (WHERE depth = 'advanced'   AND state = 'secure'),
        'needs_reinforcement', count(*) FILTER (WHERE state = 'needs_reinforcement')
      )
      FROM public.concept_depth_mastery
    ),
    'by_concept', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'concept_id',          t.concept_id,
          'name',                c.name,
          'subject',             c.subject,
          'max_depth',           c.max_depth,
          'learners',            t.learners,
          'foundation_secure',   t.f,
          'applied_secure',      t.a,
          'advanced_secure',     t.adv,
          'needs_reinforcement', t.nr
        )
        ORDER BY t.learners DESC, c.name ASC
      )
      FROM (
        SELECT concept_id,
          count(DISTINCT user_id)                                                          AS learners,
          count(*) FILTER (WHERE depth = 'foundation' AND state = 'secure')                AS f,
          count(*) FILTER (WHERE depth = 'applied'    AND state = 'secure')                AS a,
          count(*) FILTER (WHERE depth = 'advanced'   AND state = 'secure')                AS adv,
          count(*) FILTER (WHERE state = 'needs_reinforcement')                            AS nr
        FROM public.concept_depth_mastery
        WHERE concept_id IS NOT NULL
        GROUP BY concept_id
      ) t
      JOIN public.concepts c ON c.id = t.concept_id
    ), '[]'::jsonb)
  );
END;
$ada$;

GRANT EXECUTE ON FUNCTION public.admin_depth_analytics() TO authenticated;
