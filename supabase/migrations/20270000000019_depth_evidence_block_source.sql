-- =====================================================================
-- Concept Competency Framework: Phase 2 Foundation Completeness.
--
-- A learner "covering" a Knowledge Block (understanding it) is recorded as a
-- depth_evidence row with source_type 'block' and source_id = the block id,
-- reusing the one evidence stream rather than adding a parallel progress table.
-- The completeness engine then reads these rows to decide whether a secure
-- mastery-check score is backed by actual coverage of the required blocks.
--
-- This only widens the source_type CHECK; no data change. Top-level DDL,
-- dashboard- AND CLI-safe. Apply AFTER 20270000000017_knowledge_blocks.sql.
-- =====================================================================

ALTER TABLE public.depth_evidence DROP CONSTRAINT IF EXISTS depth_evidence_source_type_check;
ALTER TABLE public.depth_evidence ADD CONSTRAINT depth_evidence_source_type_check
  CHECK (source_type IN ('diagnostic','practice','solve','lab','challenge','mastery_check','teacher_assessment','recall','block'));
