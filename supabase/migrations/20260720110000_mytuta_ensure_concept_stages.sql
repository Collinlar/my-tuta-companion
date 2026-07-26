-- Persist AI-built mastery stages for a concept that has none yet.
CREATE OR REPLACE FUNCTION public.ensure_concept_stages(
  p_concept_id uuid,
  p_stages jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF p_concept_id IS NULL OR p_stages IS NULL OR jsonb_typeof(p_stages) <> 'array' THEN
    RAISE EXCEPTION 'Invalid stages payload';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.concepts WHERE id = p_concept_id) THEN
    RAISE EXCEPTION 'Concept not found';
  END IF;

  IF EXISTS (SELECT 1 FROM public.concept_stages WHERE concept_id = p_concept_id) THEN
    RETURN;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_stages)
  LOOP
    INSERT INTO public.concept_stages (concept_id, ord, name, loop_phase, description, est_time, content)
    VALUES (
      p_concept_id,
      COALESCE((item->>'ord')::int, 0),
      COALESCE(item->>'name', 'Stage'),
      item->>'loop_phase',
      item->>'description',
      item->>'est_time',
      COALESCE(item->'content', '{}'::jsonb)
    )
    ON CONFLICT (concept_id, ord) DO NOTHING;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_concept_stages(uuid, jsonb) TO authenticated;
