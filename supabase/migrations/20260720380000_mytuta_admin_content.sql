-- =====================================================================
-- mytuta Admin Panel — Concepts & Content module (PRD §15–19)
--  * concepts gains status/reviewer/last_reviewed_at (content governance).
--  * Admin write RPCs for concepts/misconceptions/stages — these reference
--    tables have NO client write policy today, so all edits go through these
--    admin-gated, audit-logged RPCs.
--  * Read RPCs: concept directory + detail, question review, and read-only
--    mastery-path / experience directories (PRD §18–19).
-- Apply AFTER 20260720370000_mytuta_admin_payments.sql.
-- =====================================================================

ALTER TABLE public.concepts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft','under_review','approved','published','needs_revision','archived')),
  ADD COLUMN IF NOT EXISTS reviewer text,
  ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;

-- ---------- concept directory + detail ----------
CREATE OR REPLACE FUNCTION public.admin_list_concepts(
  p_search text DEFAULT NULL, p_subject text DEFAULT NULL, p_status text DEFAULT NULL,
  p_limit int DEFAULT 100, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.concepts c
  WHERE (p_subject IS NULL OR c.subject = p_subject)
    AND (p_status IS NULL OR c.status = p_status)
    AND (v_q IS NULL OR c.name ILIKE '%'||v_q||'%' OR c.slug ILIKE '%'||v_q||'%');
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT c.id, c.slug, c.name, c.subject, c.learning_stage, c.difficulty, c.status, c.last_reviewed_at,
             (SELECT count(*) FROM public.mastery_profiles mp WHERE mp.concept_id = c.id) AS learners,
             (SELECT count(*) FROM public.concept_stages s WHERE s.concept_id = c.id) AS stages,
             (SELECT count(*) FROM public.misconceptions m WHERE m.concept_id = c.id) AS misconceptions
      FROM public.concepts c
      WHERE (p_subject IS NULL OR c.subject = p_subject)
        AND (p_status IS NULL OR c.status = p_status)
        AND (v_q IS NULL OR c.name ILIKE '%'||v_q||'%' OR c.slug ILIKE '%'||v_q||'%')
      ORDER BY c.subject, c.name
      LIMIT GREATEST(1, LEAST(p_limit, 300)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_concepts(text, text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_concept_detail(p_concept_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN jsonb_build_object(
    'concept', (SELECT to_jsonb(c) FROM public.concepts c WHERE id = p_concept_id),
    'misconceptions', COALESCE((SELECT jsonb_agg(to_jsonb(m) ORDER BY m.label) FROM public.misconceptions m WHERE m.concept_id = p_concept_id), '[]'::jsonb),
    'stages', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'ord', s.ord, 'name', s.name, 'loop_phase', s.loop_phase, 'description', s.description, 'est_time', s.est_time) ORDER BY s.ord) FROM public.concept_stages s WHERE s.concept_id = p_concept_id), '[]'::jsonb),
    'usage', jsonb_build_object(
      'learners', (SELECT count(*) FROM public.mastery_profiles WHERE concept_id = p_concept_id),
      'secure', (SELECT count(*) FROM public.mastery_profiles WHERE concept_id = p_concept_id AND overall_state IN ('Secure','Mastered')),
      'paths', (SELECT count(*) FROM public.mastery_paths WHERE concept_id = p_concept_id)
    )
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_concept_detail(uuid) TO authenticated;

-- ---------- concept write actions ----------
CREATE OR REPLACE FUNCTION public.admin_upsert_concept(
  p_id uuid, p_slug text, p_subject text, p_name text, p_description text,
  p_learning_stage text, p_difficulty text, p_related_areas text[], p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid := COALESCE(p_id, gen_random_uuid()); v_prev jsonb;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT to_jsonb(c) INTO v_prev FROM public.concepts c WHERE id = v_id;
  INSERT INTO public.concepts (id, slug, subject, name, description, learning_stage, difficulty, related_areas)
  VALUES (v_id, p_slug, p_subject, p_name, p_description, p_learning_stage, p_difficulty, p_related_areas)
  ON CONFLICT (id) DO UPDATE SET
    slug = excluded.slug, subject = excluded.subject, name = excluded.name, description = excluded.description,
    learning_stage = excluded.learning_stage, difficulty = excluded.difficulty, related_areas = excluded.related_areas;
  PERFORM public.admin_log(CASE WHEN v_prev IS NULL THEN 'create_concept' ELSE 'edit_concept' END, 'concept', v_id::text, p_reason, v_prev, jsonb_build_object('name', p_name));
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_upsert_concept(uuid, text, text, text, text, text, text, text[], text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_concept_status(p_concept_id uuid, p_status text, p_reviewer text, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT status INTO v_prev FROM public.concepts WHERE id = p_concept_id;
  UPDATE public.concepts SET status = p_status, reviewer = COALESCE(p_reviewer, reviewer), last_reviewed_at = now() WHERE id = p_concept_id;
  PERFORM public.admin_log('set_concept_status', 'concept', p_concept_id::text, p_reason,
    jsonb_build_object('status', v_prev), jsonb_build_object('status', p_status));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_concept_status(uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_upsert_misconception(p_id uuid, p_concept_id uuid, p_label text, p_detail text, p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid := COALESCE(p_id, gen_random_uuid());
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  INSERT INTO public.misconceptions (id, concept_id, label, detail)
  VALUES (v_id, p_concept_id, p_label, p_detail)
  ON CONFLICT (id) DO UPDATE SET label = excluded.label, detail = excluded.detail;
  PERFORM public.admin_log('upsert_misconception', 'concept', p_concept_id::text, p_reason, NULL, jsonb_build_object('label', p_label));
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_upsert_misconception(uuid, uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_upsert_concept_stage(
  p_id uuid, p_concept_id uuid, p_ord int, p_name text, p_loop_phase text,
  p_description text, p_est_time text, p_content jsonb, p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid := COALESCE(p_id, gen_random_uuid());
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  INSERT INTO public.concept_stages (id, concept_id, ord, name, loop_phase, description, est_time, content)
  VALUES (v_id, p_concept_id, p_ord, p_name, p_loop_phase, p_description, p_est_time, COALESCE(p_content, '{}'::jsonb))
  ON CONFLICT (concept_id, ord) DO UPDATE SET
    name = excluded.name, loop_phase = excluded.loop_phase, description = excluded.description,
    est_time = excluded.est_time, content = excluded.content;
  PERFORM public.admin_log('upsert_concept_stage', 'concept', p_concept_id::text, p_reason, NULL, jsonb_build_object('ord', p_ord, 'name', p_name));
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_upsert_concept_stage(uuid, uuid, int, text, text, text, text, jsonb, text) TO authenticated;

-- ---------- question review ----------
CREATE OR REPLACE FUNCTION public.admin_list_questions(
  p_search text DEFAULT NULL, p_limit int DEFAULT 100, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.assessment_questions q
  WHERE (v_q IS NULL OR q.prompt ILIKE '%'||v_q||'%');
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT q.id, q.prompt, q.options, q.correct_index, q.dimension, a.title AS assessment_title, a.type AS assessment_type,
             (q.correct_index IS NULL OR q.options IS NULL OR jsonb_array_length(q.options) < 2) AS needs_review
      FROM public.assessment_questions q
      LEFT JOIN public.assessments a ON a.id = q.assessment_id
      WHERE (v_q IS NULL OR q.prompt ILIKE '%'||v_q||'%')
      ORDER BY needs_review DESC, a.title
      LIMIT GREATEST(1, LEAST(p_limit, 300)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_questions(text, int, int) TO authenticated;

-- ---------- mastery-path directory (read-only, PRD §18) ----------
CREATE OR REPLACE FUNCTION public.admin_list_paths(
  p_search text DEFAULT NULL, p_status text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.mastery_paths mp
  WHERE (p_status IS NULL OR mp.status = p_status)
    AND (v_q IS NULL OR mp.concept_name ILIKE '%'||v_q||'%');
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT mp.id, mp.concept_name, mp.subject, mp.status, mp.pct, mp.level, mp.created_at,
             trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS student, p.email
      FROM public.mastery_paths mp LEFT JOIN public.profiles p ON p.user_id = mp.user_id
      WHERE (p_status IS NULL OR mp.status = p_status)
        AND (v_q IS NULL OR mp.concept_name ILIKE '%'||v_q||'%')
      ORDER BY mp.created_at DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_paths(text, text, int, int) TO authenticated;

-- ---------- experience directory (read-only, PRD §19) ----------
CREATE OR REPLACE FUNCTION public.admin_list_experiences(
  p_search text DEFAULT NULL, p_status text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.learning_experiences e
  WHERE (p_status IS NULL OR e.status = p_status)
    AND (v_q IS NULL OR e.title ILIKE '%'||v_q||'%');
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT e.id, e.title, e.subject, e.form, e.status, e.stages_count, e.created_at,
             trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS teacher,
             (SELECT count(*) FROM public.assignments a WHERE a.experience_id = e.id) AS assignments
      FROM public.learning_experiences e LEFT JOIN public.profiles p ON p.user_id = e.teacher_id
      WHERE (p_status IS NULL OR e.status = p_status)
        AND (v_q IS NULL OR e.title ILIKE '%'||v_q||'%')
      ORDER BY e.created_at DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_experiences(text, text, int, int) TO authenticated;
