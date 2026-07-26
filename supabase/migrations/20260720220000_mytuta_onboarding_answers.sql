-- =====================================================================
-- mytuta: persist onboarding answers
--  * subjects/goals already had typed columns on profiles but Onboarding.tsx
--    never sent them to Supabase (localStorage only). Struggles/learning
--    style (student) and challenges/resources (teacher) never mapped to any
--    column at all, typed or not.
--  * subjects/goals keep using their existing typed columns; everything
--    else lands in one generic jsonb column keyed by the onboarding step's
--    kicker text, since these are free-form step selections that don't
--    warrant a bespoke column each.
-- Apply AFTER 20260720210000_mytuta_challenge_edit.sql.
-- =====================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb;
