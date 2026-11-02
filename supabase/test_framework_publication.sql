BEGIN;
DO $test$
DECLARE admin_id uuid; cid uuid; bid uuid; typ text; caught boolean;
BEGIN
 SELECT user_id INTO admin_id FROM public.admin_users WHERE active LIMIT 1;
 IF admin_id IS NULL THEN RAISE EXCEPTION 'An existing admin is needed for rollback-only publication fixtures'; END IF;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
 INSERT INTO public.concepts(name,slug,subject,concept_type) VALUES('Publication fixture','publish-'||gen_random_uuid(),'Science','structural') RETURNING id INTO cid;
 INSERT INTO public.concept_competencies(concept_id,depth,competency_key,description,evidence_type,review_status)
 VALUES(cid,'foundation','define','Define the fixture','quick_check','draft'),(cid,'foundation','use','Use the fixture','application','draft');
 FOREACH typ IN ARRAY ARRAY['definition','big_picture','components','categories','relationships','visual_model','misconception','application'] LOOP
  INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,sequence,review_status,content)
  VALUES(cid,'foundation',typ,typ,(SELECT count(*) FROM public.knowledge_blocks WHERE concept_id=cid),'draft',
   jsonb_build_object('body','Publication regression fixture.','competencyKeys',jsonb_build_array(CASE WHEN typ='application' THEN 'use' ELSE 'define' END),'quickCheck',jsonb_build_object('prompt','Choose the fixture answer','options',jsonb_build_array('A','B'),'correctIndex',0,'explanation','Fixture answer A.'))) RETURNING id INTO bid;
 END LOOP;
 caught:=false;
 BEGIN PERFORM public.admin_publish_competency_depth(cid,'foundation','Regression test'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Unreviewed content was published'; END IF;
 IF EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=cid AND review_status='published') THEN RAISE EXCEPTION 'Publication partially changed content'; END IF;
 caught:=false;
 BEGIN PERFORM public.admin_update_knowledge_block(bid,'application','',true,(SELECT content FROM public.knowledge_blocks WHERE id=bid),'published','Regression test'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Individual block publication bypassed the journey review gate'; END IF;
 UPDATE public.knowledge_blocks SET review_status='approved' WHERE concept_id=cid;
 UPDATE public.concept_competencies SET review_status='approved' WHERE concept_id=cid;
 UPDATE public.knowledge_blocks SET required=false WHERE concept_id=cid AND block_type='visual_model';
 caught:=false;
 BEGIN PERFORM public.admin_publish_competency_depth(cid,'foundation','Regression test'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Incomplete structure was published'; END IF;
 UPDATE public.knowledge_blocks SET required=true WHERE concept_id=cid;
 PERFORM public.admin_publish_competency_depth(cid,'foundation','Regression test');
 IF (SELECT count(*) FROM public.knowledge_blocks WHERE concept_id=cid AND review_status='published')<>8 OR (SELECT count(*) FROM public.concept_competencies WHERE concept_id=cid AND review_status='published')<>2 THEN RAISE EXCEPTION 'Reviewed journey was not published atomically'; END IF;
 RAISE NOTICE 'Publication assertions passed';
END;
$test$;
ROLLBACK;
