-- =====================================================================
-- Mastery Depth: admin depth configuration (PRD 37).
--
-- Lets an admin set a concept's max_depth and retention from the admin panel
-- instead of a manual write. Mirrors admin_set_concept_status: SECURITY DEFINER,
-- admin-only, audited via admin_log. Also derives default_depth_sequence from
-- max_depth so the two stay consistent.
-- Apply AFTER 20270000000001_mytuta_mastery_depth_spine.sql.
-- =====================================================================

-- Kept deliberately plain so the Supabase dashboard editor does not mangle it:
-- no DECLARE and no read of the row (the audit snapshot's prior value is NULL,
-- as other admin writers do).
CREATE OR REPLACE FUNCTION public.admin_set_concept_depth(
  p_concept_id uuid, p_max_depth text, p_retention_enabled boolean, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $acd$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_max_depth NOT IN ('foundation','applied','advanced') THEN RAISE EXCEPTION 'invalid max_depth'; END IF;

  UPDATE public.concepts
  SET max_depth = p_max_depth,
      retention_enabled = COALESCE(p_retention_enabled, retention_enabled),
      default_depth_sequence = CASE p_max_depth
        WHEN 'advanced' THEN ARRAY['foundation','applied','advanced']
        WHEN 'applied'  THEN ARRAY['foundation','applied']
        ELSE ARRAY['foundation']
      END
  WHERE id = p_concept_id;

  PERFORM public.admin_log('set_concept_depth', 'concept', p_concept_id::text, p_reason,
    NULL, jsonb_build_object('max_depth', p_max_depth, 'retention_enabled', p_retention_enabled));
END;
$acd$;

GRANT EXECUTE ON FUNCTION public.admin_set_concept_depth(uuid, text, boolean, text) TO authenticated;
