BEGIN;
CREATE OR REPLACE FUNCTION public.teacher_competency_coverage(p_class_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 IF p_class_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.classes WHERE id=p_class_id AND teacher_id=auth.uid()) THEN RAISE EXCEPTION 'Not authorized for this class'; END IF;
 RETURN (WITH students AS (
   SELECT DISTINCT cs.student_id FROM public.class_students cs JOIN public.classes cls ON cls.id=cs.class_id WHERE cls.teacher_id=auth.uid() AND (p_class_id IS NULL OR cls.id=p_class_id) AND cs.student_id IS NOT NULL
 ), evidence AS (
   SELECT b.id,b.concept_id,b.depth,b.version,b.content,b.block_type,e.user_id,e.score,
    row_number() OVER(PARTITION BY b.id,e.user_id ORDER BY e.created_at DESC,e.id DESC) AS latest
   FROM public.knowledge_blocks b JOIN public.depth_evidence e ON e.source_id=b.id AND e.block_version=b.version AND e.source_type='block'
   JOIN students s ON s.student_id=e.user_id WHERE b.review_status='published'
 ), coverage AS (
   SELECT c.id,c.concept_id,c.depth,c.competency_key,c.description,count(DISTINCT e.user_id) FILTER(WHERE e.score=1 AND NOT EXISTS(
     SELECT 1 FROM public.knowledge_block_responses r WHERE r.user_id=e.user_id AND r.block_id=e.id AND r.version=e.version AND r.status='pending')) AS demonstrated
   FROM public.concept_competencies c LEFT JOIN evidence e ON e.concept_id=c.concept_id AND e.depth=c.depth AND e.latest=1 AND e.content->'competencyKeys' ? c.competency_key
    AND CASE c.evidence_type WHEN 'application' THEN e.block_type='application' WHEN 'misconception' THEN e.block_type='misconception' WHEN 'worked_example' THEN e.block_type='worked_example' ELSE (e.content ? 'quickCheck' OR e.content ? 'task') END
   WHERE c.review_status='published' AND c.required GROUP BY c.id
 ), result AS (
   SELECT x.*,c.name AS concept_name,(SELECT count(*) FROM students) AS learners FROM coverage x JOIN public.concepts c ON c.id=x.concept_id
 ) SELECT jsonb_build_object('learners',(SELECT count(*) FROM students),'classes',(SELECT count(*) FROM public.classes WHERE teacher_id=auth.uid() AND (p_class_id IS NULL OR id=p_class_id)),'competencies',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.concept_name,r.depth,r.competency_key) FROM result r),'[]')));
END;
$fn$;
REVOKE ALL ON FUNCTION public.teacher_competency_coverage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_competency_coverage(uuid) TO authenticated;
COMMIT;
