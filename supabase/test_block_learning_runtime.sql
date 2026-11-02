BEGIN;
DO $test$
DECLARE u uuid; teacher uuid; stranger uuid:=gen_random_uuid(); c uuid; b uuid; task_id uuid; response_id uuid; cls uuid; outcome jsonb; context jsonb; caught boolean; before_count integer;
BEGIN
 SELECT id INTO u FROM auth.users ORDER BY id LIMIT 1;
 SELECT id INTO teacher FROM auth.users WHERE id<>u ORDER BY id LIMIT 1;
 IF u IS NULL OR teacher IS NULL THEN RAISE EXCEPTION 'Two existing users are needed for rollback-only reviewer fixtures'; END IF;
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 INSERT INTO public.concepts(name,slug,subject,max_depth) VALUES('Runtime fixture','runtime-'||gen_random_uuid(),'Science','advanced') RETURNING id INTO c;
 INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,sequence,review_status,content)
 VALUES(c,'foundation','worked_example','Eligible examples',0,'published',
 '{"body":"Density is mass divided by volume.","modes":[{"label":"Simpler","text":"Compare mass in one unit of volume."}],"prerequisites":[{"kind":"skill","key":"division","label":"Division","refresher":"Divide into equal groups.","check":{"prompt":"Six divided by two?","options":["Three","Four"],"correctIndex":0,"explanation":"Three groups of two make six."}}],"quickCheck":{"prompt":"Twenty divided by ten?","options":["Two","Ten"],"correctIndex":0,"explanation":"Two groups of ten make twenty."},"examples":[{"key":"unit-volume","body":"A one cubic centimetre sample has mass two grams.","category":"recognition","difficulty":1,"support":"guided","quickCheck":{"prompt":"Density of two grams in one cubic centimetre?","options":["Two grams per cubic centimetre","One gram per cubic centimetre"],"correctIndex":0,"explanation":"Divide two by one."}},{"key":"division-example","body":"Divide mass by volume.","category":"application","difficulty":2,"support":"independent","prerequisites":[{"kind":"skill","key":"division","label":"Division","refresher":"Divide into equal groups.","check":{"prompt":"Six divided by two?","options":["Three","Four"],"correctIndex":0,"explanation":"Three groups of two make six."}}],"quickCheck":{"prompt":"Twenty divided by ten?","options":["Two","Ten"],"correctIndex":0,"explanation":"Two groups of ten make twenty."}}]}') RETURNING id INTO b;
 context:=public.block_example_context(b);
 IF context->'selectedExample'->>'key'<>'unit-volume' OR jsonb_array_length(context->'gaps')<>0 THEN RAISE EXCEPTION 'Eligible simpler example was not selected'; END IF;
 PERFORM public.record_block_activity(b,1,'opened');
 PERFORM public.record_block_activity(b,1,'modality','Simpler');
 IF NOT EXISTS(SELECT 1 FROM public.knowledge_block_states WHERE user_id=u AND block_id=b AND state='in_progress' AND support_requests=1) THEN RAISE EXCEPTION 'Activity state not persisted'; END IF;
 caught:=false;
 BEGIN PERFORM public.record_block_activity(b,1,'time','Main',100000); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Unbounded time accepted'; END IF;
 caught:=false;
 BEGIN PERFORM public.answer_block_check(b,1,0,'division-example'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Example with missing skill was accepted'; END IF;
 IF public.answer_block_check(b,1,1,'unit-volume') THEN RAISE EXCEPTION 'Wrong example answer passed'; END IF;
 IF public.block_is_covered(b,1) OR NOT EXISTS(SELECT 1 FROM public.knowledge_block_states WHERE user_id=u AND block_id=b AND state='needs_review') THEN RAISE EXCEPTION 'Failed state not restored'; END IF;
 SELECT count(*) INTO before_count FROM public.depth_evidence WHERE user_id=u AND source_id=b;
 IF public.repair_block_prerequisite(b,1,'skill','division',1) THEN RAISE EXCEPTION 'Wrong repair passed'; END IF;
 IF NOT public.repair_block_prerequisite(b,1,'skill','division',0) THEN RAISE EXCEPTION 'Correct repair did not pass'; END IF;
 IF (SELECT count(*) FROM public.depth_evidence WHERE user_id=u AND source_id=b)<>before_count THEN RAISE EXCEPTION 'Repair was misattributed as concept evidence'; END IF;
 IF jsonb_array_length(public.block_requirements_gaps(b,(SELECT content->'prerequisites' FROM public.knowledge_blocks WHERE id=b)))<>0 THEN RAISE EXCEPTION 'Repair did not clear the skill gap'; END IF;
 PERFORM public.answer_block_check(b,1,0,'division-example');
 IF NOT public.block_is_covered(b,1) THEN RAISE EXCEPTION 'Successful eligible example did not count'; END IF;
 PERFORM public.answer_block_check(b,1,1,'division-example');
 IF public.block_is_covered(b,1) THEN RAISE EXCEPTION 'Later failure did not revoke current coverage'; END IF;

 -- Use another concept so the existing Foundation fixture does not supply an
 -- accidental shortcut to the Applied/Advanced review gate.
 INSERT INTO public.concepts(name,slug,subject,max_depth) VALUES('Reviewed task fixture','task-'||gen_random_uuid(),'Science','advanced') RETURNING id INTO c;
 PERFORM public.save_foundation_result(c,'{"overall":5}');
 INSERT INTO public.concept_competencies(concept_id,depth,competency_key,description,evidence_type,review_status) VALUES(c,'applied','investigate','Investigate density','application','published');
 INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,sequence,review_status,content) VALUES(c,'applied','application','Investigation',0,'published','{"body":"Plan a density comparison.","competencyKeys":["investigate"],"task":{"prompt":"Plan a fair comparison of two material densities.","rubric":["Identify mass and volume measurements","Explain controls and units"]}}') RETURNING id INTO task_id;
 response_id:=public.submit_block_response(task_id,1,'I will measure equal volumes and compare the measured masses using consistent units.');
 IF public.block_is_covered(task_id,1) THEN RAISE EXCEPTION 'Submission alone granted mastery'; END IF;
 outcome:=public.save_competency_depth_result(c,'applied','{"overall":5}');
 IF outcome->>'state'='secure' THEN RAISE EXCEPTION 'Pending review granted Applied mastery'; END IF;
 caught:=false;
 BEGIN PERFORM public.save_competency_depth_result(c,'advanced','{"overall":5}'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Advanced opened before Applied was secure'; END IF;
 caught:=false;
 BEGIN PERFORM public.review_block_response(response_id,true,'Self-reviewed'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Self-review accepted'; END IF;
 PERFORM set_config('request.jwt.claim.sub',stranger::text,true);
 caught:=false;
 BEGIN PERFORM public.review_block_response(response_id,true,'Unauthorized review'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Unrelated reviewer accepted'; END IF;
 INSERT INTO public.classes(teacher_id,name,code) VALUES(teacher,'Runtime test class','TEST-'||gen_random_uuid()) RETURNING id INTO cls;
 INSERT INTO public.class_students(class_id,student_id,display_name) VALUES(cls,u,'Rollback fixture');
 PERFORM set_config('request.jwt.claim.sub',teacher::text,true);
 IF jsonb_array_length(public.block_review_queue(c))<>1 THEN RAISE EXCEPTION 'Teacher could not see their learner response'; END IF;
 PERFORM public.review_block_response(response_id,true,'Both measurements and controls are justified.');
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 outcome:=public.save_competency_depth_result(c,'applied','{"overall":5}');
 IF outcome->>'state'<>'secure' THEN RAISE EXCEPTION 'Reviewed response did not secure Applied: %',outcome; END IF;
 response_id:=public.submit_block_response(task_id,1,'I have revised my method to measure both quantities again with consistent units.');
 IF public.block_is_covered(task_id,1) THEN RAISE EXCEPTION 'Pending resubmission retained old coverage'; END IF;
 caught:=false;
 BEGIN PERFORM public.save_competency_depth_result(c,'advanced','{"overall":5}'); EXCEPTION WHEN OTHERS THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Stale secure state bypassed pending previous-depth evidence'; END IF;
 PERFORM set_config('request.jwt.claim.sub',teacher::text,true);
 PERFORM public.review_block_response(response_id,false,'Explain how repeated measurements control uncertainty.');
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 IF public.block_is_covered(task_id,1) THEN RAISE EXCEPTION 'Revision request retained old coverage'; END IF;
 RAISE NOTICE 'Block runtime assertions passed';
END;
$test$;
ROLLBACK;
