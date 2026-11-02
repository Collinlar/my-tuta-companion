BEGIN;
ALTER TABLE public.depth_evidence ADD COLUMN IF NOT EXISTS block_version integer;

-- Authoring metadata stays with the versioned teaching object. Competency keys
-- resolve only inside the same concept/depth; prerequisite names are stable keys.
CREATE OR REPLACE FUNCTION public.block_prerequisite_gaps(p_block_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; r jsonb; gaps jsonb := '[]'; ready boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published';
  IF NOT FOUND THEN RAISE EXCEPTION 'Published block not found'; END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(COALESCE(b.content->'prerequisites','[]')) LOOP
    IF r->>'kind'='concept' THEN
      SELECT EXISTS(SELECT 1 FROM public.concept_depth_mastery
        WHERE user_id=auth.uid() AND concept_id=(r->>'key')::uuid
          AND depth='foundation' AND state='secure') INTO ready;
    ELSE
      SELECT EXISTS(SELECT 1 FROM public.depth_evidence
        WHERE user_id=auth.uid() AND skill=r->>'key' AND score>=1
          AND source_type IN ('teacher_assessment','practice','solve')) INTO ready;
    END IF;
    IF NOT ready THEN gaps := gaps || jsonb_build_array(r); END IF;
  END LOOP;
  RETURN gaps;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.record_knowledge_block_evidence(p_block_id uuid,p_version integer,p_answer integer DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; passed boolean; result numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published' FOR SHARE;
  IF NOT FOUND OR b.version<>p_version THEN RAISE EXCEPTION 'Content changed. Reload before continuing.'; END IF;
  IF jsonb_array_length(public.block_prerequisite_gaps(b.id))>0 THEN RAISE EXCEPTION 'Complete the prerequisites first'; END IF;
  IF b.content ? 'quickCheck' THEN
    IF p_answer IS NULL OR p_answer<0 OR p_answer>=jsonb_array_length(b.content->'quickCheck'->'options') THEN RAISE EXCEPTION 'Choose a valid answer'; END IF;
    passed := p_answer=(b.content->'quickCheck'->>'correctIndex')::int;
    result := CASE WHEN passed THEN 1 ELSE 0 END;
  ELSE
    passed := true;
    result := NULL; -- reading is coverage, never proof of a competency
  END IF;
  INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,source_id,score,block_version)
    VALUES(auth.uid(),b.concept_id,b.depth,'block',b.id,result,b.version);
  RETURN passed;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.knowledge_block_progress(p_concept_id uuid,p_depth text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',b.id,'version',b.version,'covered',
    EXISTS(SELECT 1 FROM public.depth_evidence e WHERE e.user_id=auth.uid() AND e.source_type='block'
      AND e.source_id=b.id AND e.block_version=b.version AND (e.score=1 OR e.score IS NULL)),
    'gaps',public.block_prerequisite_gaps(b.id))), '[]'::jsonb)
  FROM public.knowledge_blocks b WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND auth.uid() IS NOT NULL;
$fn$;

CREATE OR REPLACE FUNCTION public.save_foundation_result(p_concept_id uuid,p_result jsonb)
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
  overall := (p_result->>'overall')::numeric;
  IF overall IS NULL OR overall<0 OR overall>5 THEN RAISE EXCEPTION 'Invalid score'; END IF;
  SELECT count(*), COALESCE(jsonb_agg(b.id) FILTER (WHERE b.review_status<>'published' OR NOT EXISTS(
      SELECT 1 FROM public.depth_evidence e WHERE e.user_id=auth.uid() AND e.source_type='block'
      AND e.source_id=b.id AND e.block_version=b.version AND (e.score=1 OR e.score IS NULL))), '[]')
    INTO total,missing FROM public.knowledge_blocks b
    WHERE b.concept_id=p_concept_id AND b.depth='foundation' AND b.required;
  covered := total-jsonb_array_length(missing);
  SELECT count(*), COALESCE(jsonb_agg(c.competency_key) FILTER(WHERE c.review_status<>'published' OR NOT EXISTS(
    SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
      AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth='foundation' AND b.review_status='published'
      AND COALESCE(b.content->'competencyKeys','[]') ? c.competency_key
      AND CASE c.evidence_type WHEN 'application' THEN b.block_type='application'
        WHEN 'misconception' THEN b.block_type='misconception'
        WHEN 'worked_example' THEN b.block_type='worked_example'
        ELSE b.content ? 'quickCheck' END)), '[]') INTO comp_count,missing_comp
    FROM public.concept_competencies c WHERE c.concept_id=p_concept_id AND c.depth='foundation' AND c.required;
  SELECT count(*) INTO unresolved FROM public.misconception_resolutions
    WHERE user_id=auth.uid() AND concept_id=p_concept_id AND resolved_at IS NULL;
  SELECT COALESCE(jsonb_agg(g.value),'[]') INTO gaps FROM public.knowledge_blocks b
    CROSS JOIN LATERAL jsonb_array_elements(public.block_prerequisite_gaps(b.id)) g
    WHERE b.concept_id=p_concept_id AND b.depth='foundation' AND b.required AND b.review_status='published';
  SELECT EXISTS(SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
    AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth='foundation' AND b.review_status='published' AND b.block_type='application'),
    EXISTS(SELECT 1 FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id
    AND e.block_version=b.version AND e.user_id=auth.uid() AND e.source_type='block' AND e.score=1
    WHERE b.concept_id=p_concept_id AND b.depth='foundation' AND b.review_status='published' AND b.content ? 'quickCheck')
    INTO has_application,has_checks;
  complete := total>0 AND comp_count>0 AND covered=total AND jsonb_array_length(missing_comp)=0
    AND unresolved=0 AND jsonb_array_length(gaps)=0 AND has_application AND has_checks;
  -- Draft authoring must not switch existing learners onto an unfinished path.
  -- The new gate activates per concept when reviewed blocks are published.
  IF NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=p_concept_id AND depth='foundation' AND review_status='published') THEN
    final_state := CASE WHEN overall>=4 THEN 'secure' WHEN overall>=3 THEN 'in_progress' ELSE 'needs_reinforcement' END;
    outcome := CASE WHEN final_state='secure' THEN 'secure' ELSE 'developing' END;
  ELSIF jsonb_array_length(gaps)>0 THEN outcome:='blocked_by_prerequisite'; final_state:='in_progress';
  ELSIF overall>=4 AND complete THEN outcome:='secure'; final_state:='secure';
  ELSIF overall>=4 AND total>0 AND covered::numeric/total>=0.7 THEN outcome:='secure_with_reinforcement'; final_state:='needs_reinforcement';
  ELSE outcome:='developing'; final_state:='in_progress'; END IF;
  result := jsonb_build_object('outcome',outcome,'state',final_state,'requiredBlocks',total,'coveredBlocks',covered,
    'uncovered',missing,'missingCompetencies',missing_comp,'unresolvedMisconceptions',unresolved,
    'prerequisiteGaps',gaps,'needsApplication',NOT has_application,'needsQuickCheck',NOT has_checks);
  INSERT INTO public.concept_depth_mastery(user_id,concept_id,depth,state,readiness_state,support_level,completed_at,last_verified_at,evidence_summary,next_review_at)
    VALUES(auth.uid(),p_concept_id,'foundation',final_state,CASE WHEN final_state='secure' THEN 'ready' ELSE 'not_ready' END,
      'guided',CASE WHEN final_state='secure' THEN now() END,now(),p_result||jsonb_build_object('completeness',result),
      CASE WHEN final_state='secure' AND concept.retention_enabled THEN now()+interval '3 days' END)
    ON CONFLICT(user_id,concept_id,depth) DO UPDATE SET state=EXCLUDED.state,readiness_state=EXCLUDED.readiness_state,
      completed_at=EXCLUDED.completed_at,last_verified_at=now(),evidence_summary=EXCLUDED.evidence_summary,next_review_at=EXCLUDED.next_review_at;
  INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,score)
    VALUES(auth.uid(),p_concept_id,'foundation','mastery_check',overall);
  DELETE FROM public.retention_reviews WHERE user_id=auth.uid() AND concept_id=p_concept_id AND depth='foundation' AND status='scheduled';
  IF final_state='secure' AND concept.retention_enabled THEN
    INSERT INTO public.retention_reviews(user_id,concept_id,depth,review_due_at,review_type,status,interval_days,ease_factor)
      VALUES(auth.uid(),p_concept_id,'foundation',now()+interval '3 days','retrieval','scheduled',3,2.5);
  END IF;
  RETURN result;
END;
$fn$;

-- Block evidence is issued by the answer-checking RPC, not client assertions.
DROP POLICY IF EXISTS "own depth evidence insert" ON public.depth_evidence;
CREATE POLICY "own depth evidence insert" ON public.depth_evidence FOR INSERT
  WITH CHECK(user_id=auth.uid() AND source_type<>'block');
REVOKE ALL ON FUNCTION public.block_prerequisite_gaps(uuid),public.record_knowledge_block_evidence(uuid,integer,integer),public.knowledge_block_progress(uuid,text),public.save_foundation_result(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.block_prerequisite_gaps(uuid),public.record_knowledge_block_evidence(uuid,integer,integer),public.knowledge_block_progress(uuid,text),public.save_foundation_result(uuid,jsonb) TO authenticated;
COMMIT;
