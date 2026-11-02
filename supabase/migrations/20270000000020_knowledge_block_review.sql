-- Targeted follow-up to 0015–0019. Preserves existing block identity and makes
-- published content the only student-visible content. Apply as one transaction.
BEGIN;

CREATE OR REPLACE FUNCTION public.validate_knowledge_block_content(p_content jsonb)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $fn$
DECLARE q jsonb; m jsonb;
BEGIN
  IF jsonb_typeof(p_content) IS DISTINCT FROM 'object'
     OR jsonb_typeof(p_content->'body') IS DISTINCT FROM 'string'
     OR btrim(p_content->>'body') = '' THEN
    RAISE EXCEPTION 'Teaching content is required';
  END IF;
  IF p_content ? 'modes' THEN
    IF jsonb_typeof(p_content->'modes') <> 'array' THEN RAISE EXCEPTION 'Modes must be an array'; END IF;
    FOR m IN SELECT value FROM jsonb_array_elements(p_content->'modes') LOOP
      IF COALESCE(btrim(m->>'label'), '') = '' OR COALESCE(btrim(m->>'text'), '') = '' THEN
        RAISE EXCEPTION 'Each support mode requires a label and text';
      END IF;
    END LOOP;
  END IF;
  IF p_content ? 'quickCheck' THEN
    q := p_content->'quickCheck';
    IF jsonb_typeof(q) IS DISTINCT FROM 'object' OR COALESCE(btrim(q->>'prompt'), '') = ''
       OR COALESCE(btrim(q->>'explanation'), '') = ''
       OR jsonb_typeof(q->'options') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Quick check requires a prompt, explanation and options';
    END IF;
    IF jsonb_array_length(q->'options') NOT BETWEEN 2 AND 6
       OR COALESCE(q->>'correctIndex', '') !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Invalid quick check options or answer';
    END IF;
    IF (q->>'correctIndex')::int >= jsonb_array_length(q->'options') THEN RAISE EXCEPTION 'Answer is outside options'; END IF;
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(q->'options') o WHERE jsonb_typeof(o) <> 'string' OR btrim(o #>> '{}') = '') THEN
      RAISE EXCEPTION 'Quick check options must be nonempty strings';
    END IF;
  END IF;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_update_knowledge_block(
  p_id uuid, p_title text, p_objective text, p_required boolean,
  p_content jsonb, p_review_status text, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE old public.knowledge_blocks; revised integer;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF length(btrim(COALESCE(p_reason, ''))) < 3 THEN RAISE EXCEPTION 'Reason required'; END IF;
  IF p_review_status NOT IN ('draft','approved','published') OR p_review_status IS NULL THEN RAISE EXCEPTION 'Invalid review status'; END IF;
  IF COALESCE(btrim(p_title), '') = '' THEN RAISE EXCEPTION 'Title required'; END IF;
  PERFORM public.validate_knowledge_block_content(p_content);
  SELECT * INTO old FROM public.knowledge_blocks WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Block not found'; END IF;
  revised := old.version + CASE WHEN old.content IS DISTINCT FROM p_content OR old.objective IS DISTINCT FROM NULLIF(btrim(p_objective), '') THEN 1 ELSE 0 END;
  UPDATE public.knowledge_blocks SET title = btrim(p_title), objective = NULLIF(btrim(p_objective), ''),
    required = p_required, content = p_content, review_status = p_review_status, version = revised, updated_at = now()
  WHERE id = p_id;
  PERFORM public.admin_log('update_knowledge_block', 'concept', old.concept_id::text, p_reason,
    jsonb_build_object('id',p_id,'version',old.version,'review_status',old.review_status),
    jsonb_build_object('id',p_id,'version',revised,'review_status',p_review_status));
END;
$fn$;

-- Generation refreshes draft content by sequence, retaining each block UUID.
-- Published sets must be explicitly withdrawn through the review UI first.
CREATE OR REPLACE FUNCTION public.admin_set_knowledge_blocks(
  p_concept_id uuid, p_depth text, p_blocks jsonb, p_reason text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE b jsonb; n integer := 0;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF length(btrim(COALESCE(p_reason,''))) < 3 THEN RAISE EXCEPTION 'Reason required'; END IF;
  IF p_depth NOT IN ('foundation','applied','advanced') OR p_depth IS NULL THEN RAISE EXCEPTION 'Invalid depth'; END IF;
  IF jsonb_typeof(p_blocks) IS DISTINCT FROM 'array' OR jsonb_array_length(p_blocks) = 0 THEN RAISE EXCEPTION 'Nonempty block set required'; END IF;
  PERFORM 1 FROM public.concepts WHERE id = p_concept_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Concept not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND review_status='published') THEN
    RAISE EXCEPTION 'Withdraw published blocks before regenerating';
  END IF;
  FOR b IN SELECT value FROM jsonb_array_elements(p_blocks) LOOP
    PERFORM public.validate_knowledge_block_content(b->'content');
    IF COALESCE(btrim(b->>'title'),'') = '' THEN RAISE EXCEPTION 'Block title required'; END IF;
    INSERT INTO public.knowledge_blocks AS kb
      (concept_id,depth,block_type,title,objective,required,sequence,content,estimated_time,review_status)
    VALUES (p_concept_id,p_depth,b->>'block_type',b->>'title',b->>'objective',COALESCE((b->>'required')::boolean,true),n,b->'content',b->>'estimated_time','draft')
    ON CONFLICT (concept_id,depth,sequence) DO UPDATE SET
      block_type=EXCLUDED.block_type,title=EXCLUDED.title,objective=EXCLUDED.objective,
      required=EXCLUDED.required,content=EXCLUDED.content,estimated_time=EXCLUDED.estimated_time,
      review_status='draft',version=kb.version+1,updated_at=now();
    n := n+1;
  END LOOP;
  -- Retire surplus drafts rather than deleting objects referenced by evidence.
  UPDATE public.knowledge_blocks SET required=false,review_status='draft',updated_at=now()
    WHERE concept_id=p_concept_id AND depth=p_depth AND sequence>=n;
  PERFORM public.admin_log('set_knowledge_blocks','concept',p_concept_id::text,p_reason,NULL,jsonb_build_object('depth',p_depth,'count',n));
  RETURN n;
END;
$fn$;

DROP POLICY IF EXISTS "read knowledge blocks" ON public.knowledge_blocks;
CREATE POLICY "read knowledge blocks" ON public.knowledge_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL AND (review_status='published' OR public.current_user_is_admin()));
REVOKE ALL ON FUNCTION public.admin_update_knowledge_block(uuid,text,text,boolean,jsonb,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_knowledge_block(uuid,text,text,boolean,jsonb,text,text) TO authenticated;
COMMIT;
