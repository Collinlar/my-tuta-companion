-- =====================================================================
-- Concept Competency Framework: Phase 0 admin authoring (PRD 30, 38).
--
-- Lets the academic team set a concept's type and author its depth competencies
-- from the admin panel. Mirrors admin_set_concept_depth: SECURITY DEFINER,
-- admin-only, audited via admin_log. AI may draft competencies later; humans
-- approve the structure, so review_status defaults to 'draft' and is set here.
--
-- Bodies use DML / RETURNING ... INTO, so apply with psql or `supabase db push`,
-- NOT the dashboard SQL editor. Apply AFTER 20270000000015_concept_competency_spine.sql.
-- =====================================================================

-- Primary + secondary Concept Type. NULL primary clears it. Every supplied type
-- must be one of the nine recognised types.
CREATE OR REPLACE FUNCTION public.admin_set_concept_type(
  p_concept_id uuid, p_primary text, p_secondary text[], p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $asctype$
DECLARE
  v_allowed text[] := ARRAY['structural','process','procedural','quantitative','principle','classification','systems','causal','representational'];
  v_t text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_primary IS NOT NULL AND NOT (p_primary = ANY(v_allowed)) THEN
    RAISE EXCEPTION 'invalid concept_type: %', p_primary;
  END IF;
  IF p_secondary IS NOT NULL THEN
    FOREACH v_t IN ARRAY p_secondary LOOP
      IF NOT (v_t = ANY(v_allowed)) THEN RAISE EXCEPTION 'invalid secondary concept_type: %', v_t; END IF;
    END LOOP;
  END IF;

  UPDATE public.concepts
  SET concept_type = p_primary,
      secondary_concept_types = COALESCE(p_secondary, '{}')
  WHERE id = p_concept_id;

  PERFORM public.admin_log('set_concept_type', 'concept', p_concept_id::text, p_reason,
    NULL, jsonb_build_object('primary', p_primary, 'secondary', COALESCE(p_secondary, '{}')));
END;
$asctype$;

-- Create or edit one competency. NULL p_id inserts; otherwise updates by id.
CREATE OR REPLACE FUNCTION public.admin_upsert_competency(
  p_id uuid, p_concept_id uuid, p_depth text, p_competency_key text, p_description text,
  p_required boolean, p_sequence integer, p_evidence_type text, p_review_status text, p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $aucomp$
DECLARE v_id uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_depth NOT IN ('foundation','applied','advanced') THEN RAISE EXCEPTION 'invalid depth'; END IF;
  IF COALESCE(btrim(p_competency_key), '') = '' THEN RAISE EXCEPTION 'competency_key required'; END IF;
  IF COALESCE(btrim(p_description), '') = '' THEN RAISE EXCEPTION 'description required'; END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.concept_competencies
      (concept_id, depth, competency_key, description, required, sequence, evidence_type, review_status)
    VALUES
      (p_concept_id, p_depth, btrim(p_competency_key), btrim(p_description),
       COALESCE(p_required, true), COALESCE(p_sequence, 0), NULLIF(btrim(p_evidence_type), ''),
       COALESCE(NULLIF(btrim(p_review_status), ''), 'draft'))
    RETURNING id INTO v_id;
    PERFORM public.admin_log('create_competency', 'concept', p_concept_id::text, p_reason,
      NULL, jsonb_build_object('depth', p_depth, 'key', btrim(p_competency_key)));
  ELSE
    UPDATE public.concept_competencies
    SET depth = p_depth,
        competency_key = btrim(p_competency_key),
        description = btrim(p_description),
        required = COALESCE(p_required, required),
        sequence = COALESCE(p_sequence, sequence),
        evidence_type = NULLIF(btrim(p_evidence_type), ''),
        review_status = COALESCE(NULLIF(btrim(p_review_status), ''), review_status),
        version = version + 1,
        updated_at = now()
    WHERE id = p_id;
    v_id := p_id;
    PERFORM public.admin_log('update_competency', 'concept', p_concept_id::text, p_reason,
      NULL, jsonb_build_object('id', p_id, 'depth', p_depth, 'key', btrim(p_competency_key)));
  END IF;

  RETURN v_id;
END;
$aucomp$;

CREATE OR REPLACE FUNCTION public.admin_delete_competency(p_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $adcomp$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  DELETE FROM public.concept_competencies WHERE id = p_id;
  PERFORM public.admin_log('delete_competency', 'concept', p_id::text, p_reason, NULL, NULL);
END;
$adcomp$;

GRANT EXECUTE ON FUNCTION public.admin_set_concept_type(uuid, text, text[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_competency(uuid, uuid, text, text, text, boolean, integer, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_competency(uuid, text) TO authenticated;
