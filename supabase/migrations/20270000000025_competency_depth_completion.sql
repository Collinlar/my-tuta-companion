BEGIN;
-- A shared, transactional completeness decision across all three depths.
CREATE OR REPLACE FUNCTION public.save_competency_depth_result(p_concept_id uuid,p_depth text,p_result jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE
  total integer; covered integer; missing jsonb; missing_comp jsonb;
  unresolved integer; gaps jsonb; final_state text; outcome text; overall numeric;
  complete boolean; comp_count integer; has_application boolean; has_checks boolean;
  concept public.concepts; result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO concept FROM public.concepts WHERE id=p_concept_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Concept not found'; END IF;
  IF p_depth NOT IN ('foundation','applied','advanced') OR p_depth IS NULL THEN RAISE EXCEPTION 'Invalid depth'; END IF;
  IF (p_depth='advanced' AND concept.max_depth<>'advanced') OR (p_depth='applied' AND concept.max_depth NOT IN ('applied','advanced')) THEN RAISE EXCEPTION 'Depth is not enabled for this concept'; END IF;
  IF p_depth<>'foundation' AND NOT EXISTS(SELECT 1 FROM public.concept_depth_mastery WHERE user_id=auth.uid() AND concept_id=p_concept_id AND depth=CASE WHEN p_depth='applied' THEN 'foundation' ELSE 'applied' END AND state='secure') THEN RAISE EXCEPTION 'Secure the previous depth first'; END IF;
  IF p_depth<>'foundation' AND EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=CASE WHEN p_depth='applied' THEN 'foundation' ELSE 'applied' END AND review_status='published')
    AND EXISTS(SELECT 1 FROM public.knowledge_blocks b WHERE b.concept_id=p_concept_id AND b.depth=CASE WHEN p_depth='applied' THEN 'foundation' ELSE 'applied' END AND b.required AND (b.review_status<>'published' OR NOT public.block_is_covered(b.id,b.version))) THEN
    RAISE EXCEPTION 'Refresh the required evidence at the previous depth first';
  END IF;
  overall := (p_result->>'overall')::numeric;
  IF overall IS NULL OR overall<0 OR overall>5 THEN RAISE EXCEPTION 'Invalid score'; END IF;
  SELECT count(*), COALESCE(jsonb_agg(b.id) FILTER (WHERE b.review_status<>'published' OR NOT public.block_is_covered(b.id,b.version)), '[]')
    INTO total,missing FROM public.knowledge_blocks b
    WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.required;
  covered := total-jsonb_array_length(missing);
  SELECT count(*), COALESCE(jsonb_agg(c.competency_key) FILTER(WHERE c.review_status<>'published' OR NOT EXISTS(
    SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
      AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND public.block_is_covered(b.id,b.version)
      AND COALESCE(b.content->'competencyKeys','[]') ? c.competency_key
      AND CASE c.evidence_type WHEN 'application' THEN b.block_type='application'
        WHEN 'misconception' THEN b.block_type='misconception'
        WHEN 'worked_example' THEN b.block_type='worked_example'
        ELSE (b.content ? 'quickCheck' OR b.content ? 'task') END)), '[]') INTO comp_count,missing_comp
    FROM public.concept_competencies c WHERE c.concept_id=p_concept_id AND c.depth=p_depth AND c.required;
  SELECT count(*) INTO unresolved FROM public.misconception_resolutions
    WHERE user_id=auth.uid() AND concept_id=p_concept_id AND resolved_at IS NULL;
  SELECT COALESCE(jsonb_agg(g.value),'[]') INTO gaps FROM public.knowledge_blocks b
    CROSS JOIN LATERAL jsonb_array_elements(public.block_prerequisite_gaps(b.id)) g
    WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.required AND b.review_status='published';
  SELECT EXISTS(SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
    AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND public.block_is_covered(b.id,b.version) AND (b.block_type='application' OR (p_depth='advanced' AND b.content ? 'task'))),
    EXISTS(SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
    AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND public.block_is_covered(b.id,b.version) AND (b.content ? 'quickCheck' OR b.content ? 'task'))
    INTO has_application,has_checks;
  complete := total>0 AND comp_count>0 AND covered=total AND jsonb_array_length(missing_comp)=0
    AND unresolved=0 AND jsonb_array_length(gaps)=0 AND has_application AND has_checks;
  IF p_depth<>'foundation' AND EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND review_status='published') THEN
    complete := complete AND EXISTS(SELECT 1 FROM public.depth_evidence e JOIN public.knowledge_blocks b ON b.id=e.source_id AND b.version=e.block_version
      WHERE e.user_id=auth.uid() AND e.source_type='block' AND e.support_used='reviewed_response' AND e.score=1 AND b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND public.block_is_covered(b.id,b.version));
  END IF;
  -- Draft authoring must not switch existing learners onto an unfinished path.
  -- The new gate activates per concept when reviewed blocks are published.
  IF NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth=p_depth AND review_status='published') THEN
    final_state := CASE WHEN overall>=4 THEN 'secure' WHEN overall>=3 THEN 'in_progress' ELSE 'needs_reinforcement' END;
    outcome := CASE WHEN final_state='secure' THEN 'secure' ELSE 'developing' END;
  ELSIF jsonb_array_length(gaps)>0 THEN outcome:='blocked_by_prerequisite'; final_state:='in_progress';
  ELSIF overall>=4 AND complete THEN outcome:='secure'; final_state:='secure';
  ELSIF overall>=4 AND total>0 AND covered::numeric/total>=0.7 THEN outcome:='secure_with_reinforcement'; final_state:='needs_reinforcement';
  ELSE outcome:='developing'; final_state:='in_progress'; END IF;
  result := jsonb_build_object('outcome',outcome,'state',final_state,'requiredBlocks',total,'coveredBlocks',covered,
    'uncovered',missing,'missingCompetencies',missing_comp,'unresolvedMisconceptions',unresolved,
    'depth',p_depth,'prerequisiteGaps',gaps,'needsApplication',NOT has_application,'needsQuickCheck',NOT has_checks);
  INSERT INTO public.concept_depth_mastery(user_id,concept_id,depth,state,readiness_state,support_level,completed_at,last_verified_at,evidence_summary,next_review_at)
    VALUES(auth.uid(),p_concept_id,p_depth,final_state,CASE WHEN final_state='secure' THEN 'ready' ELSE 'not_ready' END,
      'guided',CASE WHEN final_state='secure' THEN now() END,now(),p_result||jsonb_build_object('completeness',result),
      CASE WHEN final_state='secure' AND concept.retention_enabled THEN now()+interval '3 days' END)
    ON CONFLICT(user_id,concept_id,depth) DO UPDATE SET state=EXCLUDED.state,readiness_state=EXCLUDED.readiness_state,
      completed_at=EXCLUDED.completed_at,last_verified_at=now(),evidence_summary=EXCLUDED.evidence_summary,next_review_at=EXCLUDED.next_review_at;
  INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,score,created_at)
    VALUES(auth.uid(),p_concept_id,p_depth,'mastery_check',overall,clock_timestamp());
  DELETE FROM public.retention_reviews WHERE user_id=auth.uid() AND concept_id=p_concept_id AND depth=p_depth AND status='scheduled';
  IF final_state='secure' AND concept.retention_enabled THEN
    INSERT INTO public.retention_reviews(user_id,concept_id,depth,review_due_at,review_type,status,interval_days,ease_factor)
      VALUES(auth.uid(),p_concept_id,p_depth,now()+interval '3 days','retrieval','scheduled',3,2.5);
  END IF;
  RETURN result;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.save_foundation_result(p_concept_id uuid,p_result jsonb)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $fn$
 SELECT public.save_competency_depth_result(p_concept_id,'foundation',p_result);
$fn$;
REVOKE ALL ON FUNCTION public.save_competency_depth_result(uuid,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_competency_depth_result(uuid,text,jsonb) TO authenticated;
COMMIT;
