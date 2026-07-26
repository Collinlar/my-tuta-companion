-- =====================================================================
-- mytuta: real spaced-repetition recall
--  * recall_cards persists each learner's own review state per card
--    (front text is stable per concept, since concept_stages content is
--    global reference data, so (user_id, concept_name, front) is a safe
--    natural key across sessions).
--  * Scheduling itself (Leitner-style interval math) happens client-side
--    in src/mytuta/data/mutations.ts; this migration only stores state.
-- Apply AFTER 20260720160000_mytuta_notifications.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.recall_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  concept_name text NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  state text NOT NULL DEFAULT 'New',
  interval_days int NOT NULL DEFAULT 0,
  due_at date NOT NULL DEFAULT CURRENT_DATE,
  last_rating text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, concept_name, front)
);

CREATE INDEX IF NOT EXISTS idx_recall_cards_user_due ON public.recall_cards(user_id, due_at);

ALTER TABLE public.recall_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own select" ON public.recall_cards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.recall_cards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.recall_cards FOR UPDATE USING (user_id = auth.uid());

CREATE TRIGGER trg_recall_cards_updated BEFORE UPDATE ON public.recall_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
