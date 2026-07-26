-- =====================================================================
-- mytuta: class settings (PRD §26)
--  * Minimal, typed toggles on classes rather than a generic jsonb blob.
--    The existing "teacher update" RLS policy (teacher_id = auth.uid())
--    already covers writing these, so no new RPC is needed — the client
--    updates classes directly.
--  * Roster bulk-add and invite-by-link need NO schema change: class_students
--    INSERT is already teacher-scoped (placeholder rows with student_id NULL,
--    display_name set — the design the original schema was built for), and
--    the shareable invite link is just the existing join code wrapped in a
--    /join/:code URL.
-- Apply AFTER 20260720250000_mytuta_assessment_autosave.sql.
-- =====================================================================

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS ai_assistance boolean NOT NULL DEFAULT true;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS allow_challenges boolean NOT NULL DEFAULT true;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS allow_sharing boolean NOT NULL DEFAULT true;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS notify_on_submission boolean NOT NULL DEFAULT true;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS assessment_rules text;
