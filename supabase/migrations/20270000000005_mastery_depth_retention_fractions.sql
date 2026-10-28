-- =====================================================================
-- Mastery Depth: enable retention for the Fractions flagship.
--
-- retention_enabled is academic-team config (default false). Turning it on for
-- Fractions makes the full loop testable: securing a depth schedules a 3/10/30/90
-- retention review, surfaced on the Concept Overview and by the protect_mastery
-- Next-Best-Action. Idempotent UPDATE; apply after the spine migration.
-- =====================================================================

UPDATE public.concepts SET retention_enabled = true WHERE slug = 'fractions';
