-- =====================================================================
-- Mastery Depth: cross-concept clusters (PRD 23).
--
-- A cluster groups related concepts (e.g. "Algebraic Reasoning"). A learner's
-- cluster depth is DERIVED from the member concepts' depth states (client-side),
-- never awarded directly. These are content tables (globally readable to signed-in
-- users); members are seeded here and can be managed in admin later.
-- All top-level statements (no functions), so safe in the SQL editor or CLI.
-- Apply AFTER 20270000000001_mytuta_mastery_depth_spine.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.concept_clusters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  subject     text,
  description text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.concept_clusters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read concept clusters" ON public.concept_clusters;
CREATE POLICY "read concept clusters" ON public.concept_clusters
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.concept_cluster_members (
  cluster_id uuid NOT NULL REFERENCES public.concept_clusters(id) ON DELETE CASCADE,
  concept_id uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (cluster_id, concept_id)
);
ALTER TABLE public.concept_cluster_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read concept cluster members" ON public.concept_cluster_members;
CREATE POLICY "read concept cluster members" ON public.concept_cluster_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seed two flagship clusters. Idempotent.
INSERT INTO public.concept_clusters (slug, name, subject, description) VALUES
  ('algebraic-reasoning', 'Algebraic Reasoning', 'Mathematics', 'Expressing, solving and reasoning with algebra.'),
  ('number-and-proportion', 'Number and Proportion', 'Mathematics', 'Fractions, decimals, percentages and ratio as one connected skill.')
ON CONFLICT (slug) DO NOTHING;

-- Membership: only existing concepts are added, so a missing concept is skipped.
INSERT INTO public.concept_cluster_members (cluster_id, concept_id)
SELECT cl.id, c.id
FROM public.concept_clusters cl
JOIN public.concepts c ON c.slug IN ('algebraic-expressions', 'linear-equations', 'inequalities', 'functions', 'graphs', 'graph-interpretation')
WHERE cl.slug = 'algebraic-reasoning'
ON CONFLICT (cluster_id, concept_id) DO NOTHING;

INSERT INTO public.concept_cluster_members (cluster_id, concept_id)
SELECT cl.id, c.id
FROM public.concept_clusters cl
JOIN public.concepts c ON c.slug IN ('fractions', 'decimals', 'percentages', 'ratios', 'ratio')
WHERE cl.slug = 'number-and-proportion'
ON CONFLICT (cluster_id, concept_id) DO NOTHING;
