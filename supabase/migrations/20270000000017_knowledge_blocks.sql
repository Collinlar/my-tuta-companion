-- =====================================================================
-- Concept Competency Framework: Phase 1 Knowledge Blocks (PRD 9, 11, 36.3).
--
-- A Knowledge Block is one required part of understanding a concept at a depth
-- (Definition, Components, How it works, Misconceptions, ...). Foundation stops
-- being "one explanation with five modes" and becomes an ordered set of blocks;
-- the five support modalities move INSIDE a block ("explain this block another
-- way"). Blocks are keyed to (concept_id, depth) and rendered by a block-runner
-- in the Understand phase. A concept with no blocks keeps the current single
-- Understand stage, so this lights up per-concept (Density first) with no flag.
--
-- content jsonb holds the block body plus its support modes and optional quick
-- check. Prerequisite gating of blocks/examples is Phase 3. All top-level DDL,
-- dashboard- AND CLI-safe. Apply AFTER 20270000000015_concept_competency_spine.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_blocks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id     uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  depth          text NOT NULL CHECK (depth IN ('foundation','applied','advanced')),
  block_type     text NOT NULL,
  title          text NOT NULL,
  objective      text,
  required       boolean NOT NULL DEFAULT true,
  sequence       integer NOT NULL DEFAULT 0,
  content        jsonb,
  estimated_time text,
  review_status  text NOT NULL DEFAULT 'draft',
  version        integer NOT NULL DEFAULT 1,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (concept_id, depth, sequence)
);

CREATE INDEX IF NOT EXISTS knowledge_blocks_concept_depth_idx
  ON public.knowledge_blocks (concept_id, depth, sequence);

ALTER TABLE public.knowledge_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read knowledge blocks" ON public.knowledge_blocks;
CREATE POLICY "read knowledge blocks" ON public.knowledge_blocks
  FOR SELECT USING (auth.uid() IS NOT NULL);
