-- =====================================================================
-- mytuta: STEM Lab filters + assessment dimensions (PRD §17)
--  * lab_activities already had subject / category / equipment /
--    time_estimate. This adds difficulty and team_mode so the Lab filter
--    bar can cover the PRD's filter set, plus a dimensions jsonb array
--    (subset of Understanding / Process / Application / Creativity /
--    Communication) that supersedes the single demonstrates string as
--    chips. Existing seed rows keep working: nulls fall back to the old
--    single demonstrates text in the UI.
-- Apply AFTER 20260720260000_mytuta_class_settings.sql.
-- =====================================================================

ALTER TABLE public.lab_activities ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE public.lab_activities ADD COLUMN IF NOT EXISTS team_mode text;   -- 'Individual' | 'Team' | 'Either'
ALTER TABLE public.lab_activities ADD COLUMN IF NOT EXISTS dimensions jsonb DEFAULT '[]'::jsonb;
