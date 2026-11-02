BEGIN;
ALTER TABLE public.depth_evidence ADD COLUMN IF NOT EXISTS example_key text;
CREATE TABLE IF NOT EXISTS public.knowledge_block_states (
 user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, block_id uuid REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE,
 version integer NOT NULL, state text NOT NULL CHECK(state IN ('in_progress','understood','needs_review')),
 modality text NOT NULL DEFAULT 'Main', time_seconds integer NOT NULL DEFAULT 0, support_requests integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,block_id,version));
CREATE TABLE IF NOT EXISTS public.block_learning_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 block_id uuid NOT NULL REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE, version integer NOT NULL,
 event_type text NOT NULL CHECK(event_type IN ('opened','modality','time','attempt','response','review','repair')),
 modality text NOT NULL DEFAULT 'Main', seconds integer NOT NULL DEFAULT 0, passed boolean, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS block_learning_events_block_idx ON public.block_learning_events(block_id,version,user_id,created_at);
CREATE TABLE IF NOT EXISTS public.block_prerequisite_repairs (
 user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, block_id uuid REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE,
 version integer NOT NULL, kind text NOT NULL, prerequisite_key text NOT NULL, passed boolean NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,block_id,version,kind,prerequisite_key));
CREATE TABLE IF NOT EXISTS public.knowledge_block_responses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 block_id uuid NOT NULL REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE, version integer NOT NULL, response text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','passed','needs_revision')), feedback text,
 reviewer_id uuid REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz);
CREATE INDEX IF NOT EXISTS knowledge_block_responses_block_idx ON public.knowledge_block_responses(block_id,version,user_id,created_at);
ALTER TABLE public.knowledge_block_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_prerequisite_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_block_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own block states" ON public.knowledge_block_states;
CREATE POLICY "own block states" ON public.knowledge_block_states FOR SELECT USING(user_id=auth.uid());
DROP POLICY IF EXISTS "own block events" ON public.block_learning_events;
CREATE POLICY "own block events" ON public.block_learning_events FOR SELECT USING(user_id=auth.uid());
DROP POLICY IF EXISTS "own repairs" ON public.block_prerequisite_repairs;
CREATE POLICY "own repairs" ON public.block_prerequisite_repairs FOR SELECT USING(user_id=auth.uid());
DROP POLICY IF EXISTS "own block responses" ON public.knowledge_block_responses;
CREATE POLICY "own block responses" ON public.knowledge_block_responses FOR SELECT USING(user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.block_requirements_gaps(p_block_id uuid,p_requirements jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; r jsonb; gaps jsonb:='[]'; ready boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published';
 IF NOT FOUND THEN RAISE EXCEPTION 'Published block not found'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(COALESCE(p_requirements,'[]')) LOOP
  IF r->>'kind'='concept' THEN
   SELECT EXISTS(SELECT 1 FROM public.concept_depth_mastery WHERE user_id=auth.uid() AND concept_id=(r->>'key')::uuid AND depth='foundation' AND state='secure') INTO ready;
  ELSE
   SELECT EXISTS(SELECT 1 FROM public.block_prerequisite_repairs WHERE user_id=auth.uid() AND block_id=b.id AND version=b.version AND kind=r->>'kind' AND prerequisite_key=r->>'key' AND passed) INTO ready;
  END IF;
  IF NOT ready THEN gaps:=gaps||jsonb_build_array(r); END IF;
 END LOOP;
 RETURN gaps;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.block_example_context(p_block_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; chosen jsonb; failures integer; supports integer; target integer;
BEGIN
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published';
 IF NOT FOUND OR auth.uid() IS NULL THEN RAISE EXCEPTION 'Published block not found'; END IF;
 SELECT count(*) INTO failures FROM (SELECT score FROM public.depth_evidence WHERE user_id=auth.uid() AND source_id=b.id AND block_version=b.version AND source_type='block' ORDER BY created_at DESC,id DESC LIMIT 3) e WHERE score=0;
 SELECT support_requests INTO supports FROM public.knowledge_block_states WHERE user_id=auth.uid() AND block_id=b.id AND version=b.version;
 target:=CASE WHEN failures>0 OR COALESCE(supports,0)>1 THEN 1 WHEN b.depth='foundation' THEN 2 ELSE 3 END;
 SELECT e INTO chosen FROM jsonb_array_elements(COALESCE(b.content->'examples','[]')) e
 WHERE jsonb_array_length(public.block_requirements_gaps(b.id,e->'prerequisites'))=0
 ORDER BY abs((e->>'difficulty')::int-target),
  CASE WHEN failures>0 AND e->>'category'='recognition' THEN 0 WHEN b.depth='foundation' AND e->>'category'='quantitative' THEN 2 ELSE 1 END,
  CASE WHEN (failures>0 OR COALESCE(supports,0)>0) AND e->>'support'='guided' THEN 0 ELSE 1 END,e->>'key' LIMIT 1;
 RETURN jsonb_build_object('selectedExample',chosen,'gaps',CASE WHEN chosen IS NOT NULL THEN '[]'::jsonb ELSE public.block_requirements_gaps(b.id,b.content->'prerequisites') END);
END;
$fn$;
CREATE OR REPLACE FUNCTION public.block_prerequisite_gaps(p_block_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$ SELECT public.block_example_context(p_block_id)->'gaps'; $fn$;

CREATE OR REPLACE FUNCTION public.record_block_activity(p_block_id uuid,p_version integer,p_event text,p_modality text DEFAULT 'Main',p_seconds integer DEFAULT 0)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published' AND version=p_version;
 IF NOT FOUND THEN RAISE EXCEPTION 'Content changed. Reload before continuing.'; END IF;
 IF p_event IS NULL OR p_event NOT IN ('opened','modality','time') OR p_seconds IS NULL OR p_seconds NOT BETWEEN 0 AND 60 THEN RAISE EXCEPTION 'Invalid activity'; END IF;
 IF p_modality IS NULL OR (p_modality NOT IN ('Main','Audio','Interactive') AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(b.content->'modes','[]')) m WHERE m->>'label'=p_modality)) THEN RAISE EXCEPTION 'Unknown support modality'; END IF;
 INSERT INTO public.knowledge_block_states(user_id,block_id,version,state,modality,time_seconds,support_requests)
 VALUES(auth.uid(),b.id,b.version,'in_progress',p_modality,CASE WHEN p_event='time' THEN p_seconds ELSE 0 END,CASE WHEN p_event='modality' AND p_modality<>'Main' THEN 1 ELSE 0 END)
 ON CONFLICT(user_id,block_id,version) DO UPDATE SET modality=CASE WHEN p_event='modality' THEN EXCLUDED.modality ELSE knowledge_block_states.modality END,time_seconds=knowledge_block_states.time_seconds+EXCLUDED.time_seconds,support_requests=knowledge_block_states.support_requests+EXCLUDED.support_requests,updated_at=now();
 INSERT INTO public.block_learning_events(user_id,block_id,version,event_type,modality,seconds) VALUES(auth.uid(),b.id,b.version,p_event,p_modality,CASE WHEN p_event='time' THEN p_seconds ELSE 0 END);
END;
$fn$;
CREATE OR REPLACE FUNCTION public.answer_block_check(p_block_id uuid,p_version integer,p_answer integer DEFAULT NULL,p_example_key text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; q jsonb; requirements jsonb; passed boolean; result numeric; modality_used text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND review_status='published' FOR SHARE;
 IF NOT FOUND OR b.version<>p_version THEN RAISE EXCEPTION 'Content changed. Reload before continuing.'; END IF;
 IF b.content ? 'task' THEN RAISE EXCEPTION 'This task requires a reviewed response'; END IF;
 IF p_example_key IS NULL THEN q:=b.content->'quickCheck'; requirements:=b.content->'prerequisites';
 ELSE
  SELECT e->'quickCheck',e->'prerequisites' INTO q,requirements FROM jsonb_array_elements(COALESCE(b.content->'examples','[]')) e WHERE e->>'key'=p_example_key;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown example'; END IF;
 END IF;
 IF jsonb_array_length(public.block_requirements_gaps(b.id,requirements))>0 THEN RAISE EXCEPTION 'Complete the prerequisites first'; END IF;
 IF q IS NOT NULL THEN
  IF p_answer IS NULL OR p_answer<0 OR p_answer>=jsonb_array_length(q->'options') THEN RAISE EXCEPTION 'Choose a valid answer'; END IF;
  passed:=p_answer=(q->>'correctIndex')::int; result:=CASE WHEN passed THEN 1 ELSE 0 END;
 ELSE passed:=true; result:=NULL; END IF;
 SELECT modality INTO modality_used FROM public.knowledge_block_states WHERE user_id=auth.uid() AND block_id=b.id AND version=b.version;
 INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,source_id,score,block_version,example_key,support_used,created_at) VALUES(auth.uid(),b.concept_id,b.depth,'block',b.id,result,b.version,p_example_key,COALESCE(modality_used,'Main'),clock_timestamp());
 INSERT INTO public.knowledge_block_states(user_id,block_id,version,state) VALUES(auth.uid(),b.id,b.version,CASE WHEN passed THEN 'understood' ELSE 'needs_review' END) ON CONFLICT(user_id,block_id,version) DO UPDATE SET state=EXCLUDED.state,updated_at=now();
 INSERT INTO public.block_learning_events(user_id,block_id,version,event_type,modality,passed) VALUES(auth.uid(),b.id,b.version,'attempt',COALESCE(modality_used,'Main'),passed);
 RETURN passed;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.record_knowledge_block_evidence(p_block_id uuid,p_version integer,p_answer integer DEFAULT NULL)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=public AS $fn$ SELECT public.answer_block_check(p_block_id,p_version,p_answer,NULL); $fn$;

CREATE OR REPLACE FUNCTION public.repair_block_prerequisite(p_block_id uuid,p_version integer,p_kind text,p_key text,p_answer integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; r jsonb; passed boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND version=p_version AND review_status='published' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Published block version not found'; END IF;
 SELECT value INTO r FROM (SELECT value FROM jsonb_array_elements(COALESCE(b.content->'prerequisites','[]')) UNION ALL SELECT req.item FROM jsonb_array_elements(COALESCE(b.content->'examples','[]')) AS ex(item) CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ex.item->'prerequisites','[]')) AS req(item)) requirements WHERE value->>'kind'=p_kind AND value->>'key'=p_key LIMIT 1;
 IF NOT FOUND OR p_kind='concept' OR NOT r ? 'check' THEN RAISE EXCEPTION 'Use the prerequisite concept or an authored repair check'; END IF;
 IF p_answer IS NULL OR p_answer<0 OR p_answer>=jsonb_array_length(r->'check'->'options') THEN RAISE EXCEPTION 'Choose a valid answer'; END IF;
 passed:=p_answer=(r->'check'->>'correctIndex')::int;
 INSERT INTO public.block_prerequisite_repairs(user_id,block_id,version,kind,prerequisite_key,passed) VALUES(auth.uid(),b.id,b.version,p_kind,p_key,passed)
 ON CONFLICT(user_id,block_id,version,kind,prerequisite_key) DO UPDATE SET passed=EXCLUDED.passed,updated_at=now();
 INSERT INTO public.block_learning_events(user_id,block_id,version,event_type,passed) VALUES(auth.uid(),b.id,b.version,'repair',passed);
 RETURN passed;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.submit_block_response(p_block_id uuid,p_version integer,p_response text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE b public.knowledge_blocks; response_id uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=p_block_id AND version=p_version AND review_status='published' FOR UPDATE;
 IF NOT FOUND OR NOT b.content ? 'task' THEN RAISE EXCEPTION 'Reviewed task not found'; END IF;
 IF length(btrim(COALESCE(p_response,''))) NOT BETWEEN 20 AND 20000 THEN RAISE EXCEPTION 'Write a response between 20 and 20000 characters'; END IF;
 IF jsonb_array_length(public.block_prerequisite_gaps(b.id))>0 THEN RAISE EXCEPTION 'Complete the prerequisites first'; END IF;
 SELECT id INTO response_id FROM public.knowledge_block_responses WHERE user_id=auth.uid() AND block_id=b.id AND version=b.version AND status='pending' ORDER BY created_at DESC LIMIT 1;
 IF response_id IS NULL THEN INSERT INTO public.knowledge_block_responses(user_id,block_id,version,response,created_at) VALUES(auth.uid(),b.id,b.version,btrim(p_response),clock_timestamp()) RETURNING id INTO response_id;
 ELSE UPDATE public.knowledge_block_responses SET response=btrim(p_response),created_at=clock_timestamp() WHERE id=response_id; END IF;
 INSERT INTO public.knowledge_block_states(user_id,block_id,version,state) VALUES(auth.uid(),b.id,b.version,'in_progress') ON CONFLICT(user_id,block_id,version) DO UPDATE SET state='in_progress',updated_at=now();
 INSERT INTO public.block_learning_events(user_id,block_id,version,event_type) VALUES(auth.uid(),b.id,b.version,'response');
 RETURN response_id;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.review_block_response(p_response_id uuid,p_passed boolean,p_feedback text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE r public.knowledge_block_responses; b public.knowledge_blocks;
BEGIN
 SELECT * INTO r FROM public.knowledge_block_responses WHERE id=p_response_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Response not found'; END IF;
 IF auth.uid() IS NULL OR NOT (public.current_user_is_admin() OR EXISTS(SELECT 1 FROM public.class_students cs JOIN public.classes c ON c.id=cs.class_id WHERE c.teacher_id=auth.uid() AND cs.student_id=r.user_id)) THEN RAISE EXCEPTION 'Not authorized to review this learner'; END IF;
 IF r.user_id=auth.uid() THEN RAISE EXCEPTION 'A different reviewer is required'; END IF;
 IF r.status<>'pending' THEN RAISE EXCEPTION 'Response already reviewed'; END IF;
 SELECT * INTO b FROM public.knowledge_blocks WHERE id=r.block_id AND version=r.version AND review_status='published' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Content changed. Request a fresh response.'; END IF;
 IF p_passed IS NULL OR length(btrim(COALESCE(p_feedback,'')))<3 THEN RAISE EXCEPTION 'A decision and feedback are required'; END IF;
 UPDATE public.knowledge_block_responses SET status=CASE WHEN p_passed THEN 'passed' ELSE 'needs_revision' END,feedback=btrim(p_feedback),reviewer_id=auth.uid(),reviewed_at=now() WHERE id=r.id;
 INSERT INTO public.depth_evidence(user_id,concept_id,depth,source_type,source_id,score,block_version,support_used,created_at) VALUES(r.user_id,b.concept_id,b.depth,'block',b.id,CASE WHEN p_passed THEN 1 ELSE 0 END,b.version,'reviewed_response',clock_timestamp());
 INSERT INTO public.knowledge_block_states(user_id,block_id,version,state) VALUES(r.user_id,b.id,b.version,CASE WHEN p_passed THEN 'understood' ELSE 'needs_review' END) ON CONFLICT(user_id,block_id,version) DO UPDATE SET state=EXCLUDED.state,updated_at=now();
 INSERT INTO public.block_learning_events(user_id,block_id,version,event_type,passed) VALUES(r.user_id,b.id,b.version,'review',p_passed);
END;
$fn$;
CREATE OR REPLACE FUNCTION public.block_is_covered(p_block_id uuid,p_version integer)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT NOT EXISTS(SELECT 1 FROM public.knowledge_block_responses WHERE user_id=auth.uid() AND block_id=p_block_id AND version=p_version AND status='pending') AND COALESCE((SELECT score=1 OR score IS NULL FROM public.depth_evidence WHERE user_id=auth.uid() AND source_type='block' AND source_id=p_block_id AND block_version=p_version ORDER BY created_at DESC,id DESC LIMIT 1),false);
$fn$;
CREATE OR REPLACE FUNCTION public.knowledge_block_progress(p_concept_id uuid,p_depth text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',b.id,'version',b.version,'covered',public.block_is_covered(b.id,b.version),
 'state',COALESCE(s.state,CASE WHEN public.block_is_covered(b.id,b.version) THEN 'understood' ELSE 'not_started' END),'gaps',context->'gaps','selectedExample',context->'selectedExample','supportRequests',COALESCE(s.support_requests,0),
 'attempts',(SELECT count(*) FROM public.depth_evidence WHERE user_id=auth.uid() AND source_type='block' AND source_id=b.id AND block_version=b.version),
 'recommendedModality',(SELECT modality FROM public.block_learning_events e WHERE e.user_id=auth.uid() AND e.block_id=b.id AND e.version=b.version AND e.event_type='attempt' AND passed IS NOT NULL GROUP BY modality HAVING count(*)>=3 AND avg(passed::int)>=0.6 ORDER BY avg(passed::int) DESC,count(*) DESC,modality LIMIT 1),'response',(SELECT jsonb_build_object('id',id,'status',status,'feedback',feedback,'text',response) FROM public.knowledge_block_responses WHERE user_id=auth.uid() AND block_id=b.id AND version=b.version ORDER BY created_at DESC,id DESC LIMIT 1)) ORDER BY b.sequence),'[]'::jsonb)
 FROM public.knowledge_blocks b LEFT JOIN public.knowledge_block_states s ON s.block_id=b.id AND s.version=b.version AND s.user_id=auth.uid() CROSS JOIN LATERAL (SELECT public.block_example_context(b.id) AS context) x
 WHERE b.concept_id=p_concept_id AND b.depth=p_depth AND b.review_status='published' AND auth.uid() IS NOT NULL;
$fn$;
CREATE OR REPLACE FUNCTION public.block_review_queue(p_concept_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT COALESCE(jsonb_agg(to_jsonb(q)),'[]') FROM (SELECT r.id,r.user_id,(SELECT min(cs.display_name) FROM public.class_students cs JOIN public.classes cls ON cls.id=cs.class_id WHERE cs.student_id=r.user_id AND (cls.teacher_id=auth.uid() OR public.current_user_is_admin())) AS learner_name,r.response,r.created_at,b.title,b.depth,b.content->'task' AS task,c.name AS concept_name
 FROM public.knowledge_block_responses r JOIN public.knowledge_blocks b ON b.id=r.block_id AND b.version=r.version JOIN public.concepts c ON c.id=b.concept_id
 WHERE r.status='pending' AND b.review_status='published' AND (p_concept_id IS NULL OR b.concept_id=p_concept_id) AND auth.uid() IS NOT NULL AND (public.current_user_is_admin() OR EXISTS(SELECT 1 FROM public.class_students cs JOIN public.classes cls ON cls.id=cs.class_id WHERE cls.teacher_id=auth.uid() AND cs.student_id=r.user_id)) ORDER BY r.created_at LIMIT 100) q;
$fn$;
CREATE OR REPLACE FUNCTION public.block_learning_analytics(p_concept_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
 RETURN (SELECT COALESCE(jsonb_agg(to_jsonb(q)),'[]') FROM (SELECT b.id,b.title,b.depth,b.version,
 (SELECT count(*) FROM public.knowledge_block_states s WHERE s.block_id=b.id AND s.version=b.version) AS learners,
 (SELECT count(*) FROM public.knowledge_block_states s WHERE s.block_id=b.id AND s.version=b.version AND s.state='understood') AS understood,
 (SELECT count(*) FROM public.knowledge_block_states s WHERE s.block_id=b.id AND s.version=b.version AND s.state='needs_review') AS needs_review,
 (SELECT COALESCE(sum(s.time_seconds),0) FROM public.knowledge_block_states s WHERE s.block_id=b.id AND s.version=b.version) AS time_seconds,
 (SELECT COALESCE(jsonb_agg(to_jsonb(m)),'[]') FROM (SELECT modality,count(*) AS attempts,count(*) FILTER(WHERE passed) AS passed FROM public.block_learning_events e WHERE e.block_id=b.id AND e.version=b.version AND event_type='attempt' GROUP BY modality) m) AS modalities
 FROM public.knowledge_blocks b WHERE b.concept_id=p_concept_id ORDER BY b.depth,b.sequence) q);
END;
$fn$;
REVOKE ALL ON FUNCTION public.block_requirements_gaps(uuid,jsonb),public.block_example_context(uuid),public.block_is_covered(uuid,integer),public.record_block_activity(uuid,integer,text,text,integer),public.answer_block_check(uuid,integer,integer,text),public.repair_block_prerequisite(uuid,integer,text,text,integer),public.submit_block_response(uuid,integer,text),public.review_block_response(uuid,boolean,text),public.block_review_queue(uuid),public.block_learning_analytics(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.block_requirements_gaps(uuid,jsonb),public.block_example_context(uuid),public.block_is_covered(uuid,integer),public.record_block_activity(uuid,integer,text,text,integer),public.answer_block_check(uuid,integer,integer,text),public.repair_block_prerequisite(uuid,integer,text,text,integer),public.submit_block_response(uuid,integer,text),public.review_block_response(uuid,boolean,text),public.block_review_queue(uuid),public.block_learning_analytics(uuid) TO authenticated;
COMMIT;
