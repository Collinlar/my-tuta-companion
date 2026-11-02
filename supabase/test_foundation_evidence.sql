-- Regression assertions against the installed functions. Fixtures and writes
-- are rolled back; no existing learner or content records are changed.
BEGIN;
DO $test$
DECLARE u uuid; c uuid; b uuid; a uuid; p uuid; result jsonb; caught boolean;
BEGIN
  SELECT id INTO u FROM auth.users LIMIT 1;
  IF u IS NULL THEN RAISE EXCEPTION 'A user is required for authenticated regression fixtures'; END IF;
  PERFORM set_config('request.jwt.claim.sub',u::text,true);
  INSERT INTO public.concepts(name,slug,subject) VALUES('Framework regression fixture','framework-test-'||gen_random_uuid(),'Science') RETURNING id INTO c;
  INSERT INTO public.concepts(name,slug,subject) VALUES('Prerequisite fixture','framework-prereq-'||gen_random_uuid(),'Science') RETURNING id INTO p;
  INSERT INTO public.concept_competencies(concept_id,depth,competency_key,description,review_status,evidence_type)
    VALUES(c,'foundation','define','Define density','published','quick_check'),(c,'foundation','use','Use density','published','application');
  INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,sequence,review_status,content)
    VALUES(c,'foundation','definition','Define',0,'published','{"body":"Mass per volume","competencyKeys":["define"],"quickCheck":{"prompt":"Density?","options":["Mass per volume","Mass"],"correctIndex":0,"explanation":"Both quantities matter"}}') RETURNING id INTO b;
  INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,sequence,review_status,content)
    VALUES(c,'foundation','application','Apply',1,'published','{"body":"Compare equal volumes","competencyKeys":["use"],"quickCheck":{"prompt":"Equal volume, greater mass?","options":["Greater density","Same density"],"correctIndex":0,"explanation":"Mass per volume increases"}}') RETURNING id INTO a;
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'='secure' THEN RAISE EXCEPTION 'High score bypassed missing evidence'; END IF;
  IF public.record_knowledge_block_evidence(b,1,1) THEN RAISE EXCEPTION 'Wrong answer passed'; END IF;
  result := public.save_foundation_result(c,'{"overall":5}');
  IF (result->>'coveredBlocks')::int<>0 THEN RAISE EXCEPTION 'Failed attempt granted coverage'; END IF;
  PERFORM public.record_knowledge_block_evidence(b,1,0);
  PERFORM public.record_knowledge_block_evidence(a,1,0);
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'<>'secure' THEN RAISE EXCEPTION 'Complete evidence did not secure: %',result; END IF;
  result := public.save_foundation_result(c,'{"overall":2}');
  IF result->>'state'='secure' THEN RAISE EXCEPTION 'Coverage rescued a failing score'; END IF;
  UPDATE public.knowledge_blocks SET review_status='draft' WHERE concept_id=c;
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'<>'secure' THEN RAISE EXCEPTION 'Draft-only authoring changed legacy behavior'; END IF;
  UPDATE public.knowledge_blocks SET review_status='published' WHERE concept_id=c;
  UPDATE public.concept_competencies SET review_status='draft' WHERE concept_id=c AND competency_key='define';
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'='secure' THEN RAISE EXCEPTION 'Unreviewed competency granted mastery'; END IF;
  UPDATE public.concept_competencies SET review_status='published' WHERE concept_id=c;
  UPDATE public.knowledge_blocks SET content=content- 'quickCheck',version=version+1 WHERE id=a;
  PERFORM public.record_knowledge_block_evidence(a,2,NULL);
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'='secure' OR NOT (result->>'needsApplication')::boolean THEN RAISE EXCEPTION 'Reading an application was treated as demonstrated competence'; END IF;
  UPDATE public.knowledge_blocks SET content=jsonb_set(content,'{quickCheck}','{"prompt":"Equal volume, greater mass?","options":["Greater density","Same density"],"correctIndex":0,"explanation":"Mass per volume increases"}'),version=3 WHERE id=a;
  PERFORM public.record_knowledge_block_evidence(a,3,0);
  UPDATE public.knowledge_blocks SET version=2 WHERE id=b;
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'state'='secure' THEN RAISE EXCEPTION 'Old version evidence counted'; END IF;
  caught:=false;
  BEGIN PERFORM public.record_knowledge_block_evidence(b,1,0); EXCEPTION WHEN OTHERS THEN caught:=true; END;
  IF NOT caught THEN RAISE EXCEPTION 'Stale version accepted'; END IF;
  UPDATE public.knowledge_blocks SET content=jsonb_set(content,'{prerequisites}',jsonb_build_array(jsonb_build_object('kind','concept','key',p,'label','Prior concept'))) WHERE id=b;
  result := public.save_foundation_result(c,'{"overall":5}');
  IF result->>'outcome'<>'blocked_by_prerequisite' THEN RAISE EXCEPTION 'Missing prerequisite not detected'; END IF;
  caught:=false;
  BEGIN PERFORM public.record_knowledge_block_evidence(b,2,0); EXCEPTION WHEN OTHERS THEN caught:=true; END;
  IF NOT caught THEN RAISE EXCEPTION 'Blocked example accepted'; END IF;
  UPDATE public.knowledge_blocks SET review_status='draft' WHERE id=b;
  PERFORM set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  IF EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE id=b) THEN RAISE EXCEPTION 'Student could read a draft block'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE id=a) THEN RAISE EXCEPTION 'Student could not read a published block'; END IF;
  caught:=false;
  BEGIN
    INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,source_id,score)
      VALUES(auth.uid(),c,'foundation','block',a,1);
  EXCEPTION WHEN insufficient_privilege THEN caught:=true;
  END;
  IF NOT caught THEN RAISE EXCEPTION 'Client could forge block evidence'; END IF;
  EXECUTE 'RESET ROLE';
  RAISE NOTICE 'Foundation regression assertions passed';
END;
$test$;
ROLLBACK;
