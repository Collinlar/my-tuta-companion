-- =====================================================================
-- mytuta Mastery Depth — Phase 0: schema spine (no user-visible change)
--
-- Introduces depth (Foundation -> Applied -> Advanced) + a Retention layer
-- as a DIMENSION of the existing mastery objects, not a parallel system:
--   * concepts            += max_depth / default_depth_sequence / retention_enabled
--   * mastery_paths       += depth  (one path row per user+concept+depth)
--   * concept_depth_mastery  NEW headline state + readiness + next review per depth
--   * depth_evidence         NEW append-only evidence feeding the readiness engine
--   * retention_reviews      NEW scheduler rows for spaced retention checks
--
-- Nothing reads these yet (Phase 1 does), so applying this changes no behaviour.
-- Existing mastery is backfilled as Foundation depth.
-- All own-row RLS, like every learner table. SECURITY DEFINER RPCs come in Phase 1.
-- Apply AFTER 20269000000002_lab_rubric_doneVerb.sql.
-- =====================================================================

-- ---------- concepts: depth configuration (academic team owns these) ----------
ALTER TABLE public.concepts
  ADD COLUMN IF NOT EXISTS max_depth text NOT NULL DEFAULT 'foundation'
    CHECK (max_depth IN ('foundation','applied','advanced'));
ALTER TABLE public.concepts
  ADD COLUMN IF NOT EXISTS default_depth_sequence text[] NOT NULL DEFAULT ARRAY['foundation']::text[];
ALTER TABLE public.concepts
  ADD COLUMN IF NOT EXISTS retention_enabled boolean NOT NULL DEFAULT false;

-- ---------- mastery_paths: a path instance now belongs to one depth ----------
-- NOT NULL DEFAULT fills every existing row with 'foundation' in place.
ALTER TABLE public.mastery_paths
  ADD COLUMN IF NOT EXISTS depth text NOT NULL DEFAULT 'foundation'
    CHECK (depth IN ('foundation','applied','advanced'));
CREATE INDEX IF NOT EXISTS mastery_paths_user_concept_depth_idx
  ON public.mastery_paths (user_id, concept_id, depth);

-- ---------- concept_depth_mastery: headline state per (user, concept, depth) ----------
CREATE TABLE IF NOT EXISTS public.concept_depth_mastery (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id       uuid REFERENCES public.concepts(id) ON DELETE CASCADE,
  depth            text NOT NULL CHECK (depth IN ('foundation','applied','advanced')),
  state            text NOT NULL DEFAULT 'not_started'
                     CHECK (state IN ('not_started','in_progress','secure','needs_reinforcement')),
  readiness_state  text CHECK (readiness_state IN ('not_ready','building','ready','strongly_ready')),
  support_level    text NOT NULL DEFAULT 'full'
                     CHECK (support_level IN ('full','guided','light','independent')),
  started_at       timestamptz,
  completed_at     timestamptz,
  last_verified_at timestamptz,
  next_review_at   timestamptz,
  evidence_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, concept_id, depth)
);
ALTER TABLE public.concept_depth_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own concept depth mastery" ON public.concept_depth_mastery;
CREATE POLICY "own concept depth mastery" ON public.concept_depth_mastery
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS concept_depth_mastery_user_idx
  ON public.concept_depth_mastery (user_id, concept_id);
CREATE INDEX IF NOT EXISTS concept_depth_mastery_review_idx
  ON public.concept_depth_mastery (user_id, next_review_at);
DROP TRIGGER IF EXISTS concept_depth_mastery_updated_at ON public.concept_depth_mastery;
CREATE TRIGGER concept_depth_mastery_updated_at BEFORE UPDATE ON public.concept_depth_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- depth_evidence: append-only, drives the readiness engine ----------
CREATE TABLE IF NOT EXISTS public.depth_evidence (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id       uuid REFERENCES public.concepts(id) ON DELETE CASCADE,
  depth            text NOT NULL CHECK (depth IN ('foundation','applied','advanced')),
  source_type      text NOT NULL
                     CHECK (source_type IN ('diagnostic','practice','solve','lab','challenge','mastery_check','teacher_assessment','recall')),
  source_id        uuid,
  skill            text,
  score            numeric,
  support_used     text,
  mistake_category text,
  confidence       numeric,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.depth_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own depth evidence select" ON public.depth_evidence;
CREATE POLICY "own depth evidence select" ON public.depth_evidence
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "own depth evidence insert" ON public.depth_evidence;
CREATE POLICY "own depth evidence insert" ON public.depth_evidence
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS depth_evidence_user_concept_idx
  ON public.depth_evidence (user_id, concept_id, depth);
CREATE INDEX IF NOT EXISTS depth_evidence_user_created_idx
  ON public.depth_evidence (user_id, created_at DESC);

-- ---------- retention_reviews: spaced review scheduler ----------
CREATE TABLE IF NOT EXISTS public.retention_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id    uuid REFERENCES public.concepts(id) ON DELETE CASCADE,
  depth         text NOT NULL CHECK (depth IN ('foundation','applied','advanced')),
  review_due_at timestamptz NOT NULL,
  review_type   text NOT NULL DEFAULT 'retrieval',
  status        text NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','due','completed','missed')),
  last_result   text,
  interval_days int NOT NULL DEFAULT 3,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.retention_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own retention reviews" ON public.retention_reviews;
CREATE POLICY "own retention reviews" ON public.retention_reviews
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS retention_reviews_due_idx
  ON public.retention_reviews (user_id, status, review_due_at);
DROP TRIGGER IF EXISTS retention_reviews_updated_at ON public.retention_reviews;
CREATE TRIGGER retention_reviews_updated_at BEFORE UPDATE ON public.retention_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- Backfill: existing mastery becomes Foundation depth, so current learners
-- keep their progress re-labelled. Maps mastery_profiles.overall_state to a
-- depth state. Idempotent via ON CONFLICT.
-- =====================================================================
INSERT INTO public.concept_depth_mastery
  (user_id, concept_id, depth, state, started_at, completed_at, last_verified_at)
SELECT
  mp.user_id,
  mp.concept_id,
  'foundation',
  CASE
    WHEN mp.overall_state IN ('Secure','Mastered') THEN 'secure'
    ELSE 'in_progress'
  END,
  mp.updated_at,
  CASE WHEN mp.overall_state IN ('Secure','Mastered') THEN mp.updated_at ELSE NULL END,
  mp.updated_at
FROM public.mastery_profiles mp
WHERE mp.concept_id IS NOT NULL
ON CONFLICT (user_id, concept_id, depth) DO NOTHING;
