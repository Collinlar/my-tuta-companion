-- =====================================================================
-- Concept Competency Framework: Phase 1 admin Knowledge Block writer (PRD 29,30).
--
-- AI drafts the block set client-side (from the concept type template + the
-- concept's competencies); this replaces the stored set for one (concept, depth)
-- in a single audited, admin-gated call. Humans then review and approve
-- (review_status). Mirrors admin_set_cluster_members: delete-then-insert.
--
-- Body uses DML and jsonb expansion, so apply with psql or `supabase db push`,
-- NOT the dashboard SQL editor. Apply AFTER 20270000000017_knowledge_blocks.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_set_knowledge_blocks(
  p_concept_id uuid, p_depth text, p_blocks jsonb, p_reason text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $askb$
DECLARE v_count integer;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_depth NOT IN ('foundation','applied','advanced') THEN RAISE EXCEPTION 'invalid depth'; END IF;

  DELETE FROM public.knowledge_blocks WHERE concept_id = p_concept_id AND depth = p_depth;

  INSERT INTO public.knowledge_blocks
    (concept_id, depth, block_type, title, objective, required, sequence, content, estimated_time, review_status)
  SELECT
    p_concept_id,
    p_depth,
    COALESCE(b->>'block_type', 'definition'),
    COALESCE(b->>'title', 'Block'),
    NULLIF(b->>'objective', ''),
    COALESCE((b->>'required')::boolean, true),
    COALESCE((b->>'sequence')::int, (ord - 1)::int),
    b->'content',
    NULLIF(b->>'estimated_time', ''),
    COALESCE(NULLIF(b->>'review_status', ''), 'draft')
  FROM jsonb_array_elements(COALESCE(p_blocks, '[]'::jsonb)) WITH ORDINALITY t(b, ord);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  PERFORM public.admin_log('set_knowledge_blocks', 'concept', p_concept_id::text, p_reason,
    NULL, jsonb_build_object('depth', p_depth, 'count', v_count));

  RETURN v_count;
END;
$askb$;

GRANT EXECUTE ON FUNCTION public.admin_set_knowledge_blocks(uuid, text, jsonb, text) TO authenticated;
