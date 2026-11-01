-- =====================================================================
-- Concept Competency Framework: Phase 0 schema spine (no behaviour change).
--
-- Adds the competency-first layer between the Concept Graph and Mastery Paths:
--   * concepts.concept_type / secondary_concept_types — what KIND of concept this
--     is (structural, process, quantitative, ...), which in Phase 1 selects the
--     required Knowledge Block template.
--   * concept_competencies — the explicit "what must the learner know and be able
--     to do" per depth. The set of REQUIRED competencies at a depth IS that
--     depth's completeness definition, so we do NOT add the PRD's separate
--     foundation/applied/advanced_complete_definition columns (one source of
--     truth, not two).
--
-- Reuses the existing depth model (concepts.max_depth, concept_depth_mastery,
-- depth_evidence), prerequisites (concept_relationships), and misconceptions
-- (misconceptions) rather than re-creating them. Content tables: globally
-- readable to signed-in users; writes go through admin-gated RPCs (next
-- migration). All top-level DDL (no functions), so dashboard- AND CLI-safe.
-- Apply AFTER the Mastery Depth spine (20270000000001).
-- =====================================================================

-- Concept Type on the concept itself. Free text, validated to the known set in
-- the admin writer. secondary types are optional and ordered by the team.
ALTER TABLE public.concepts
  ADD COLUMN IF NOT EXISTS concept_type text,
  ADD COLUMN IF NOT EXISTS secondary_concept_types text[] NOT NULL DEFAULT '{}';

-- Explicit depth competencies. competency_key is a short stable slug per concept
-- +depth (e.g. 'define', 'identify-components'); description is the learner-facing
-- statement. required drives completeness; evidence_type names how it is proven
-- (quick_check / worked_example / application / misconception / recall).
CREATE TABLE IF NOT EXISTS public.concept_competencies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id    uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  depth         text NOT NULL CHECK (depth IN ('foundation','applied','advanced')),
  competency_key text NOT NULL,
  description   text NOT NULL,
  required      boolean NOT NULL DEFAULT true,
  sequence      integer NOT NULL DEFAULT 0,
  evidence_type text,
  review_status text NOT NULL DEFAULT 'draft',
  version       integer NOT NULL DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (concept_id, depth, competency_key)
);

CREATE INDEX IF NOT EXISTS concept_competencies_concept_depth_idx
  ON public.concept_competencies (concept_id, depth, sequence);

ALTER TABLE public.concept_competencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read concept competencies" ON public.concept_competencies;
CREATE POLICY "read concept competencies" ON public.concept_competencies
  FOR SELECT USING (auth.uid() IS NOT NULL);
