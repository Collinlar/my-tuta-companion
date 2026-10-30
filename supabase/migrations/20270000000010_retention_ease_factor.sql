-- =====================================================================
-- Mastery Depth: adaptive retention ease factor (PRD 12).
--
-- Retention reviews move from a fixed 3/10/30/90-day ladder to an adaptive,
-- SM-2-style schedule. The ease factor is the per-review state that carries a
-- learner's durability for a (concept, depth) forward: it rises on clean recall
-- and falls on shaky recall, so the interval grows at the pace that learner
-- actually needs. One nullable-with-default column, no data change to existing
-- rows. Dashboard- AND CLI-safe (ADD COLUMN only, no DML, no function).
-- Apply AFTER 20270000000001_mytuta_mastery_depth_spine.sql.
-- =====================================================================

ALTER TABLE public.retention_reviews
  ADD COLUMN IF NOT EXISTS ease_factor numeric NOT NULL DEFAULT 2.5;
