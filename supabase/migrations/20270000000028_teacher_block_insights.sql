BEGIN;
CREATE OR REPLACE FUNCTION public.teacher_block_learning_summary(p_class_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 IF p_class_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.classes WHERE id=p_class_id AND teacher_id=auth.uid()) THEN RAISE EXCEPTION 'Not authorized for this class'; END IF;
 RETURN (WITH students AS (
   SELECT DISTINCT cs.student_id AS id FROM public.class_students cs JOIN public.classes c ON c.id=cs.class_id
   WHERE c.teacher_id=auth.uid() AND (p_class_id IS NULL OR c.id=p_class_id) AND cs.student_id IS NOT NULL
  ), summary AS (
   SELECT b.id,b.title,b.depth,c.name AS concept_name,count(*) AS learners,
    count(*) FILTER(WHERE s.state='understood') AS understood,count(*) FILTER(WHERE s.state='needs_review') AS needs_review,
    sum(s.support_requests) AS support_requests
   FROM public.knowledge_block_states s JOIN students ON students.id=s.user_id
   JOIN public.knowledge_blocks b ON b.id=s.block_id AND b.version=s.version JOIN public.concepts c ON c.id=b.concept_id
   GROUP BY b.id,b.title,b.depth,c.name ORDER BY count(*) FILTER(WHERE s.state='needs_review') DESC,b.title LIMIT 100
  ) SELECT COALESCE(jsonb_agg(to_jsonb(summary)),'[]') FROM summary);
END;
$fn$;
REVOKE ALL ON FUNCTION public.teacher_block_learning_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_block_learning_summary(uuid) TO authenticated;
COMMIT;
