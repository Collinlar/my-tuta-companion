-- =====================================================================
-- Mastery Depth: flagship concept depth configuration (seed).
--
-- max_depth is academic-team-owned, per-concept config. Seeding it here keeps
-- it reproducible across environments (survives a reseed) rather than living as
-- a one-off manual UPDATE. Fractions is the first flagship opened past
-- Foundation (PRD section 39). Extend this list as Applied/Advanced content is
-- authored for each concept; the PRD ultimately pegs Fractions at 'advanced'.
--
-- Idempotent: a plain UPDATE by slug, safe to re-run; affects 0 rows if the
-- concept is not present. Apply AFTER 20270000000001_mytuta_mastery_depth_spine.sql.
-- =====================================================================

UPDATE public.concepts SET max_depth = 'applied' WHERE slug = 'fractions';
