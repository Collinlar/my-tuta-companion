BEGIN;
CREATE OR REPLACE FUNCTION public.validate_block_runtime_authoring()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
DECLARE e jsonb; r jsonb; item jsonb;
BEGIN
 IF NEW.content ? 'task' THEN
  item:=NEW.content->'task';
  IF jsonb_typeof(item) IS DISTINCT FROM 'object' OR COALESCE(btrim(item->>'prompt'),'')='' OR jsonb_typeof(item->'rubric') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Task requires a prompt and rubric'; END IF;
  IF jsonb_array_length(item->'rubric') NOT BETWEEN 1 AND 10 OR EXISTS(SELECT 1 FROM jsonb_array_elements(item->'rubric') v WHERE jsonb_typeof(v)<>'string' OR btrim(v #>> '{}')='') THEN RAISE EXCEPTION 'Invalid task rubric'; END IF;
  IF NEW.content ? 'examples' THEN RAISE EXCEPTION 'A reviewed task cannot be replaced by a multiple-choice example'; END IF;
 END IF;
 IF NEW.content ? 'examples' THEN
  IF jsonb_typeof(NEW.content->'examples') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Examples must be an array'; END IF;
  IF jsonb_array_length(NEW.content->'examples')>10 THEN RAISE EXCEPTION 'At most ten alternatives are supported'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.content->'examples') v GROUP BY v->>'key' HAVING count(*)>1) THEN RAISE EXCEPTION 'Example keys must be unique'; END IF;
  FOR e IN SELECT value FROM jsonb_array_elements(NEW.content->'examples') LOOP
   IF COALESCE(btrim(e->>'key'),'')='' OR COALESCE(e->>'category','') NOT IN ('recognition','relationship','application','quantitative') OR COALESCE(e->>'support','') NOT IN ('guided','independent') OR COALESCE(e->>'difficulty','') !~ '^[1-5]$' THEN RAISE EXCEPTION 'Invalid example metadata'; END IF;
   IF NOT e ? 'quickCheck' THEN RAISE EXCEPTION 'An alternative requires a check of the same target competencies'; END IF;
   PERFORM public.validate_knowledge_block_content(jsonb_build_object('body',e->>'body','quickCheck',e->'quickCheck'));
   IF e ? 'prerequisites' AND jsonb_typeof(e->'prerequisites') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Example prerequisites must be an array'; END IF;
  END LOOP;
 END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.content->'prerequisites','[]'))
  UNION ALL SELECT req.item FROM jsonb_array_elements(COALESCE(NEW.content->'examples','[]')) AS ex(item) CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ex.item->'prerequisites','[]')) AS req(item) LOOP
  IF COALESCE(r->>'kind','') NOT IN ('concept','skill','formula','representation') OR COALESCE(btrim(r->>'key'),'')='' OR COALESCE(btrim(r->>'label'),'')='' THEN RAISE EXCEPTION 'Invalid prerequisite metadata'; END IF;
  IF r->>'kind'='concept' AND ((r->>'key')::uuid=NEW.concept_id OR NOT EXISTS(SELECT 1 FROM public.concepts WHERE id=(r->>'key')::uuid)) THEN RAISE EXCEPTION 'Prerequisite concept must exist and differ from the target'; END IF;
  IF r ? 'check' THEN PERFORM public.validate_knowledge_block_content(jsonb_build_object('body','Prerequisite refresher','quickCheck',r->'check')); END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM (
   SELECT value FROM jsonb_array_elements(COALESCE(NEW.content->'prerequisites','[]'))
   UNION ALL SELECT req.item FROM jsonb_array_elements(COALESCE(NEW.content->'examples','[]')) AS ex(item) CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ex.item->'prerequisites','[]')) AS req(item)
  ) requirements GROUP BY value->>'kind',value->>'key' HAVING count(DISTINCT value)>1) THEN
  RAISE EXCEPTION 'A prerequisite key must use the same assessment everywhere in a block';
 END IF;
 RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS validate_block_runtime_authoring ON public.knowledge_blocks;
CREATE TRIGGER validate_block_runtime_authoring BEFORE INSERT OR UPDATE OF content ON public.knowledge_blocks FOR EACH ROW EXECUTE FUNCTION public.validate_block_runtime_authoring();
COMMIT;
