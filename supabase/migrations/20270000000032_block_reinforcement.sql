BEGIN;
CREATE OR REPLACE FUNCTION public.next_block_reinforcement()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT jsonb_build_object('key','block_reinforcement','action','Revisit '||b.title,
  'reason','Your recent check identified this part of '||c.name||' for reinforcement.',
  'route','/student/learn?concept='||c.slug||'&depth='||b.depth||'&block='||b.id::text,'est_minutes',3)
 FROM public.knowledge_block_states s JOIN public.knowledge_blocks b ON b.id=s.block_id AND b.version=s.version JOIN public.concepts c ON c.id=b.concept_id
 WHERE s.user_id=auth.uid() AND s.state='needs_review' AND b.required AND b.review_status='published'
 ORDER BY s.updated_at DESC,b.sequence LIMIT 1;
$fn$;
REVOKE ALL ON FUNCTION public.next_block_reinforcement() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_block_reinforcement() TO authenticated;
COMMIT;
