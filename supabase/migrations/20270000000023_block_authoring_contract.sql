BEGIN;
CREATE OR REPLACE FUNCTION public.check_knowledge_block_authoring()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
DECLARE item jsonb;
BEGIN
  PERFORM public.validate_knowledge_block_content(NEW.content);
  IF NEW.content ? 'competencyKeys' THEN
    IF jsonb_typeof(NEW.content->'competencyKeys') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Competency keys must be an array'; END IF;
    FOR item IN SELECT value FROM jsonb_array_elements(NEW.content->'competencyKeys') LOOP
      IF jsonb_typeof(item)<>'string' OR NOT EXISTS(SELECT 1 FROM public.concept_competencies c
        WHERE c.concept_id=NEW.concept_id AND c.depth=NEW.depth AND c.competency_key=item #>> '{}') THEN
        RAISE EXCEPTION 'Unknown competency key %',item;
      END IF;
    END LOOP;
  END IF;
  IF NEW.content ? 'prerequisites' THEN
    IF jsonb_typeof(NEW.content->'prerequisites') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Prerequisites must be an array'; END IF;
    FOR item IN SELECT value FROM jsonb_array_elements(NEW.content->'prerequisites') LOOP
      IF COALESCE(item->>'kind','') NOT IN ('concept','skill','formula','representation')
        OR COALESCE(btrim(item->>'key'),'')='' OR COALESCE(btrim(item->>'label'),'')='' THEN
        RAISE EXCEPTION 'Prerequisites require a valid kind, key and label';
      END IF;
      IF item->>'kind'='concept' THEN
        IF (item->>'key')::uuid=NEW.concept_id OR NOT EXISTS(SELECT 1 FROM public.concepts WHERE id=(item->>'key')::uuid) THEN
          RAISE EXCEPTION 'Prerequisite must reference another existing concept';
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS check_knowledge_block_authoring ON public.knowledge_blocks;
CREATE TRIGGER check_knowledge_block_authoring BEFORE INSERT OR UPDATE OF content,concept_id,depth
  ON public.knowledge_blocks FOR EACH ROW EXECUTE FUNCTION public.check_knowledge_block_authoring();
COMMIT;
