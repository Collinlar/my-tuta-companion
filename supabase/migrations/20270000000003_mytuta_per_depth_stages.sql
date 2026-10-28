-- =====================================================================
-- Mastery Depth: per-depth stage storage.
--
-- concept_stages held ONE stage set per concept (the Foundation path). To run a
-- distinct Applied / Advanced loop, a concept needs a stage set per depth, so
-- concept_stages gains a `depth` and the uniqueness moves to (concept_id, depth,
-- ord). Existing rows become the Foundation set. A depth-scoped overload of
-- ensure_concept_stages provisions one depth without touching the others.
-- Apply AFTER 20270000000002_mastery_depth_flagship_seed.sql.
-- =====================================================================

ALTER TABLE public.concept_stages
  ADD COLUMN IF NOT EXISTS depth text NOT NULL DEFAULT 'foundation'
    CHECK (depth IN ('foundation','applied','advanced'));

-- Move uniqueness from (concept_id, ord) to (concept_id, depth, ord). The old
-- inline UNIQUE is auto-named concept_stages_concept_id_ord_key. Drop-then-add
-- keeps this idempotent without a DO block (whose $$ clashes with the function's
-- $$ in some SQL editors).
ALTER TABLE public.concept_stages DROP CONSTRAINT IF EXISTS concept_stages_concept_id_ord_key;
ALTER TABLE public.concept_stages DROP CONSTRAINT IF EXISTS concept_stages_concept_id_depth_ord_key;
ALTER TABLE public.concept_stages ADD CONSTRAINT concept_stages_concept_id_depth_ord_key UNIQUE (concept_id, depth, ord);

-- Depth-aware provisioning (3-arg overload; the original 2-arg stays for
-- backward compatibility and writes Foundation via the column default).
CREATE OR REPLACE FUNCTION public.ensure_concept_stages(
  p_concept_id uuid,
  p_depth text,
  p_stages jsonb
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  item    jsonb;
  v_depth text := CASE WHEN p_depth IN ('foundation','applied','advanced') THEN p_depth ELSE 'foundation' END;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF p_concept_id IS NULL OR p_stages IS NULL OR jsonb_typeof(p_stages) <> 'array' THEN
    RAISE EXCEPTION 'Invalid stages payload';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.concepts WHERE id = p_concept_id) THEN
    RAISE EXCEPTION 'Concept not found';
  END IF;

  -- Only provision a depth that has no stages yet, so we never clobber one.
  IF EXISTS (SELECT 1 FROM public.concept_stages WHERE concept_id = p_concept_id AND depth = v_depth) THEN
    RETURN;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_stages)
  LOOP
    INSERT INTO public.concept_stages (concept_id, depth, ord, name, loop_phase, description, est_time, content)
    VALUES (
      p_concept_id,
      v_depth,
      COALESCE((item->>'ord')::int, 0),
      COALESCE(item->>'name', 'Stage'),
      item->>'loop_phase',
      item->>'description',
      item->>'est_time',
      COALESCE(item->'content', '{}'::jsonb)
    )
    ON CONFLICT (concept_id, depth, ord) DO NOTHING;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_concept_stages(uuid, text, jsonb) TO authenticated;
