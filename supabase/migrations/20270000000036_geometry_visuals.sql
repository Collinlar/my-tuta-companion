BEGIN;
CREATE OR REPLACE FUNCTION public.validate_block_media_support()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
DECLARE field text; maximum integer;
BEGIN
 IF NEW.content ? 'visual' AND (jsonb_typeof(NEW.content->'visual') IS DISTINCT FROM 'string' OR NEW.content->>'visual' NOT IN ('density_mass_volume','solar_system','fraction_parts','ratio_groups','percentage_grid','equation_balance','graph_reading','photosynthesis_process','forces_diagram','series_circuit','area_perimeter','angle_turn')) THEN RAISE EXCEPTION 'Unsupported diagram'; END IF;
 FOREACH field IN ARRAY ARRAY['narration','visualCaption','interactionPrompt'] LOOP
  maximum:=CASE WHEN field='narration' THEN 6000 ELSE 1000 END;
  IF NEW.content ? field AND (jsonb_typeof(NEW.content->field) IS DISTINCT FROM 'string' OR length(btrim(NEW.content->>field)) NOT BETWEEN 1 AND maximum) THEN RAISE EXCEPTION 'Invalid media support field: %',field; END IF;
 END LOOP;
 IF (NEW.content ? 'visualCaption' OR NEW.content ? 'interactionPrompt') AND NOT NEW.content ? 'visual' THEN RAISE EXCEPTION 'Diagram guidance requires a supported visual'; END IF;
 RETURN NEW;
END;
$fn$;
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
  IF NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND required AND (block_type=required_type OR (required_type='visual_model' AND content->>'visual' IN ('density_mass_volume','solar_system','fraction_parts','ratio_groups','percentage_grid','equation_balance','graph_reading','photosynthesis_process','forces_diagram','series_circuit','area_perimeter','angle_turn')))) THEN RAISE EXCEPTION 'Required structure is missing: %',required_type; END IF;
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
COMMIT;
