BEGIN;
CREATE OR REPLACE FUNCTION public.validate_block_media_support()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
DECLARE field text; maximum integer;
BEGIN
 IF NEW.content ? 'visual' AND (jsonb_typeof(NEW.content->'visual') IS DISTINCT FROM 'string' OR NEW.content->>'visual' NOT IN ('density_mass_volume','solar_system','fraction_parts','ratio_groups','percentage_grid','equation_balance','graph_reading','photosynthesis_process','forces_diagram','series_circuit')) THEN RAISE EXCEPTION 'Unsupported diagram'; END IF;
 FOREACH field IN ARRAY ARRAY['narration','visualCaption','interactionPrompt'] LOOP
  maximum:=CASE WHEN field='narration' THEN 6000 ELSE 1000 END;
  IF NEW.content ? field AND (jsonb_typeof(NEW.content->field) IS DISTINCT FROM 'string' OR length(btrim(NEW.content->>field)) NOT BETWEEN 1 AND maximum) THEN RAISE EXCEPTION 'Invalid media support field: %',field; END IF;
 END LOOP;
 IF (NEW.content ? 'visualCaption' OR NEW.content ? 'interactionPrompt') AND NOT NEW.content ? 'visual' THEN RAISE EXCEPTION 'Diagram guidance requires a supported visual'; END IF;
 RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS knowledge_block_media_support ON public.knowledge_blocks;
CREATE TRIGGER knowledge_block_media_support BEFORE INSERT OR UPDATE OF content ON public.knowledge_blocks FOR EACH ROW EXECUTE FUNCTION public.validate_block_media_support();

ALTER TABLE public.competency_curriculum_mappings ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.competency_curriculum_mappings ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.competency_curriculum_mappings ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
CREATE OR REPLACE FUNCTION public.stamp_curriculum_mapping_review()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
BEGIN
 NEW.updated_by:=auth.uid(); NEW.updated_at:=now();
 NEW.reviewed_by:=CASE WHEN NEW.review_status='approved' THEN auth.uid() END;
 NEW.reviewed_at:=CASE WHEN NEW.review_status='approved' THEN now() END;
 RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS curriculum_mapping_review_stamp ON public.competency_curriculum_mappings;
CREATE TRIGGER curriculum_mapping_review_stamp BEFORE INSERT OR UPDATE ON public.competency_curriculum_mappings FOR EACH ROW EXECUTE FUNCTION public.stamp_curriculum_mapping_review();
COMMIT;
