BEGIN;
CREATE TABLE IF NOT EXISTS public.competency_curriculum_mappings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 competency_id uuid NOT NULL REFERENCES public.concept_competencies(id) ON DELETE CASCADE,
 framework text NOT NULL CHECK(length(btrim(framework)) BETWEEN 1 AND 120),
 framework_version text NOT NULL CHECK(length(btrim(framework_version)) BETWEEN 1 AND 60),
 grade text NOT NULL CHECK(length(btrim(grade)) BETWEEN 1 AND 60),
 standard_code text NOT NULL CHECK(length(btrim(standard_code)) BETWEEN 1 AND 100),
 standard_description text NOT NULL CHECK(length(btrim(standard_description)) BETWEEN 1 AND 3000),
 source_url text NOT NULL CHECK(source_url ~ '^https://[^[:space:]]+$'),
 review_status text NOT NULL DEFAULT 'draft' CHECK(review_status IN ('draft','approved')),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(competency_id,framework,framework_version,grade,standard_code)
);
ALTER TABLE public.competency_curriculum_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS curriculum_read ON public.competency_curriculum_mappings;
CREATE POLICY curriculum_read ON public.competency_curriculum_mappings FOR SELECT TO authenticated USING (
 public.current_user_is_admin() OR (review_status='approved' AND EXISTS(SELECT 1 FROM public.concept_competencies c WHERE c.id=competency_id AND c.review_status='published'))
);
CREATE OR REPLACE FUNCTION public.concept_curriculum_mappings(p_concept_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $fn$
 SELECT COALESCE(jsonb_agg(to_jsonb(q) ORDER BY q.framework,q.grade,q.standard_code),'[]') FROM (
 SELECT m.*,c.depth,c.competency_key,c.description AS competency_description FROM public.competency_curriculum_mappings m
 JOIN public.concept_competencies c ON c.id=m.competency_id WHERE c.concept_id=p_concept_id) q;
$fn$;
CREATE OR REPLACE FUNCTION public.admin_save_curriculum_mapping(p_mapping jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE result_id uuid; target_id uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
 target_id:=NULLIF(p_mapping->>'id','')::uuid;
 IF target_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.competency_curriculum_mappings WHERE id=target_id) THEN RAISE EXCEPTION 'Mapping not found'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.concept_competencies WHERE id=(p_mapping->>'competency_id')::uuid) THEN RAISE EXCEPTION 'Competency not found'; END IF;
 INSERT INTO public.competency_curriculum_mappings(id,competency_id,framework,framework_version,grade,standard_code,standard_description,source_url,review_status)
 VALUES(COALESCE(target_id,gen_random_uuid()),(p_mapping->>'competency_id')::uuid,btrim(p_mapping->>'framework'),btrim(p_mapping->>'framework_version'),btrim(p_mapping->>'grade'),btrim(p_mapping->>'standard_code'),btrim(p_mapping->>'standard_description'),btrim(p_mapping->>'source_url'),COALESCE(p_mapping->>'review_status','draft'))
 ON CONFLICT(id) DO UPDATE SET competency_id=EXCLUDED.competency_id,framework=EXCLUDED.framework,framework_version=EXCLUDED.framework_version,grade=EXCLUDED.grade,standard_code=EXCLUDED.standard_code,standard_description=EXCLUDED.standard_description,source_url=EXCLUDED.source_url,review_status=EXCLUDED.review_status,updated_at=now()
 RETURNING id INTO result_id;
 RETURN result_id;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.admin_delete_curriculum_mapping(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF auth.uid() IS NULL OR NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
 DELETE FROM public.competency_curriculum_mappings WHERE id=p_id;
END;
$fn$;
REVOKE ALL ON FUNCTION public.concept_curriculum_mappings(uuid),public.admin_save_curriculum_mapping(jsonb),public.admin_delete_curriculum_mapping(uuid) FROM PUBLIC;
GRANT SELECT ON public.competency_curriculum_mappings TO authenticated;
GRANT EXECUTE ON FUNCTION public.concept_curriculum_mappings(uuid),public.admin_save_curriculum_mapping(jsonb),public.admin_delete_curriculum_mapping(uuid) TO authenticated;
COMMIT;
