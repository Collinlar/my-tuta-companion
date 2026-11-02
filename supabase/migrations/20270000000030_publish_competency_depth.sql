BEGIN;
CREATE OR REPLACE FUNCTION public.admin_publish_competency_depth(p_concept_id uuid,p_depth text,p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE kind text; required_types text[]; required_type text; block_count integer; comp_count integer;
BEGIN
 IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF p_depth IS NULL OR p_depth NOT IN ('foundation','applied','advanced') OR length(btrim(COALESCE(p_reason,'')))<3 THEN RAISE EXCEPTION 'Valid depth and audited reason required'; END IF;
 SELECT concept_type INTO kind FROM public.concepts WHERE id=p_concept_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Concept not found'; END IF;
 PERFORM 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth FOR UPDATE;
 PERFORM 1 FROM public.concept_competencies WHERE concept_id=p_concept_id AND depth=p_depth FOR UPDATE;
 SELECT count(*) INTO block_count FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND required;
 SELECT count(*) INTO comp_count FROM public.concept_competencies WHERE concept_id=p_concept_id AND depth=p_depth AND required;
 IF block_count=0 OR comp_count=0 THEN RAISE EXCEPTION 'Required blocks and competencies must be authored'; END IF;
 IF EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND required AND review_status NOT IN ('approved','published'))
  OR EXISTS(SELECT 1 FROM public.concept_competencies WHERE concept_id=p_concept_id AND depth=p_depth AND required AND review_status NOT IN ('approved','published')) THEN
  RAISE EXCEPTION 'An academic reviewer must approve every required block and competency before publication';
 END IF;
 required_types:=CASE WHEN p_depth='applied' THEN ARRAY['quick_check','big_picture','process','worked_example','application','synthesis'] WHEN p_depth='advanced' THEN ARRAY['quick_check','big_picture','relationships','example','application','synthesis']
 WHEN kind='structural' THEN ARRAY['definition','big_picture','components','categories','relationships','visual_model','misconception','application']
 WHEN kind='process' THEN ARRAY['definition','big_picture','components','process','relationships','visual_model','misconception','application']
 WHEN kind='procedural' THEN ARRAY['definition','big_picture','relationships','vocabulary','process','categories','misconception','worked_example','application']
 WHEN kind='quantitative' THEN ARRAY['definition','components','vocabulary','relationships','big_picture','visual_model','worked_example','misconception','application']
 WHEN kind='principle' THEN ARRAY['definition','big_picture','components','relationships','visual_model','example','misconception','application']
 WHEN kind='classification' THEN ARRAY['definition','relationships','categories','components','quick_check','example','misconception']
 WHEN kind='systems' THEN ARRAY['big_picture','components','relationships','process','misconception','visual_model']
 WHEN kind='causal' THEN ARRAY['definition','process','components','misconception','example','application']
 WHEN kind='representational' THEN ARRAY['big_picture','vocabulary','relationships','process','misconception','example','application'] ELSE NULL END;
 IF required_types IS NULL THEN RAISE EXCEPTION 'Set a concept type before publishing'; END IF;
 FOREACH required_type IN ARRAY required_types LOOP
  IF NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND required AND (block_type=required_type OR (required_type='visual_model' AND content->>'visual' IN ('density_mass_volume','solar_system','fraction_parts','ratio_groups','percentage_grid','equation_balance','graph_reading','photosynthesis_process','forces_diagram','series_circuit')))) THEN RAISE EXCEPTION 'Required structure is missing: %',required_type; END IF;
 END LOOP;
 IF p_depth<>'foundation' AND NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND required AND content ? 'task') THEN RAISE EXCEPTION 'Independent work with a review rubric is required'; END IF;
 IF EXISTS(SELECT 1 FROM public.concept_competencies c WHERE c.concept_id=p_concept_id AND c.depth=p_depth AND c.required AND NOT EXISTS(
  SELECT 1 FROM public.knowledge_blocks b WHERE b.concept_id=c.concept_id AND b.depth=c.depth AND b.required
  AND COALESCE(b.content->'competencyKeys','[]') ? c.competency_key AND (b.content ? 'quickCheck' OR b.content ? 'task')
  AND CASE c.evidence_type WHEN 'application' THEN b.block_type='application' WHEN 'misconception' THEN b.block_type='misconception' WHEN 'worked_example' THEN b.block_type='worked_example' ELSE true END)) THEN RAISE EXCEPTION 'A required competency is missing a matching evidence-producing block'; END IF;
 UPDATE public.knowledge_blocks SET review_status='published',updated_at=now() WHERE concept_id=p_concept_id AND depth=p_depth AND review_status='approved';
 UPDATE public.concept_competencies SET review_status='published',updated_at=now() WHERE concept_id=p_concept_id AND depth=p_depth AND review_status='approved';
 PERFORM public.admin_log('publish_competency_depth','concept',p_concept_id::text,p_reason,NULL,jsonb_build_object('depth',p_depth,'required_blocks',block_count,'required_competencies',comp_count));
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
  IF p_review_status='published' AND old.review_status<>'published' THEN RAISE EXCEPTION 'Publish the reviewed depth journey as a coherent set'; END IF;
  revised := old.version + CASE WHEN old.content IS DISTINCT FROM p_content OR old.objective IS DISTINCT FROM NULLIF(btrim(p_objective), '') THEN 1 ELSE 0 END;
  UPDATE public.knowledge_blocks SET title = btrim(p_title), objective = NULLIF(btrim(p_objective), ''),
    required = p_required, content = p_content, review_status = p_review_status, version = revised, updated_at = now()
  WHERE id = p_id;
  PERFORM public.admin_log('update_knowledge_block', 'concept', old.concept_id::text, p_reason,
    jsonb_build_object('id',p_id,'version',old.version,'review_status',old.review_status),
    jsonb_build_object('id',p_id,'version',revised,'review_status',p_review_status));
END;
$fn$;


REVOKE ALL ON FUNCTION public.admin_publish_competency_depth(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_publish_competency_depth(uuid,text,text) TO authenticated;
COMMIT;
