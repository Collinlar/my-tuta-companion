-- =====================================================================
-- mytuta: scheduled reminder notifications (PRD §35, time-based kinds)
--  * The event-triggered kinds (assignment/assessment/submission/join/
--    challenge/share/feedback) are done. The remaining PRD kinds — deadline
--    approaching, recall due — are time-based and need a daily job.
--  * Two plain functions do the work; they're always valid SQL. Scheduling
--    them uses pg_cron, which on Supabase must be enabled once via the
--    dashboard (Database -> Extensions -> pg_cron). The cron.schedule calls
--    are wrapped in an exception-swallowing DO block so this migration still
--    applies cleanly if pg_cron isn't enabled yet — enable it, then re-run
--    just the scheduling block (or this file; it's idempotent).
-- Apply AFTER 20260720280000_mytuta_challenge_feedback.sql.
-- =====================================================================

-- Deadline reminders: any assignment whose deadline falls in the next 24h
-- notifies every signed-up student in its class, once (the job runs daily).
CREATE OR REPLACE FUNCTION public.notify_due_deadlines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body)
  SELECT cs.student_id, 'deadline',
         'Due soon: ' || COALESCE(a.title, 'an assignment'),
         'This is due within a day. Open Assignments to finish it.'
  FROM public.assignments a
  JOIN public.class_students cs ON cs.class_id = a.class_id AND cs.student_id IS NOT NULL
  WHERE a.deadline IS NOT NULL
    AND a.deadline > now()
    AND a.deadline <= now() + interval '24 hours'
    -- don't repeat the same reminder to the same student on the same day
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = cs.student_id AND n.kind = 'deadline'
        AND n.title = 'Due soon: ' || COALESCE(a.title, 'an assignment')
        AND n.created_at::date = CURRENT_DATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_due_deadlines() TO authenticated;

-- Recall reminders: each learner with at least one recall card due today
-- (and no recall reminder already sent today) gets one nudge.
CREATE OR REPLACE FUNCTION public.notify_due_recall()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body)
  SELECT rc.user_id, 'recall',
         'Recall is due',
         count(*)::text || ' card' || CASE WHEN count(*) = 1 THEN '' ELSE 's' END ||
           ' are ready to review. A short session keeps them secure.'
  FROM public.recall_cards rc
  WHERE rc.due_at <= CURRENT_DATE
  GROUP BY rc.user_id
  HAVING NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = rc.user_id AND n.kind = 'recall'
      AND n.created_at::date = CURRENT_DATE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_due_recall() TO authenticated;

-- Schedule both daily. Wrapped so the migration survives pg_cron not being
-- enabled yet; once it is, cron.schedule (unschedule-then-schedule via the
-- same jobname) makes this idempotent.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('mytuta-due-deadlines', '0 7 * * *', 'SELECT public.notify_due_deadlines();');
    PERFORM cron.schedule('mytuta-due-recall',    '30 7 * * *', 'SELECT public.notify_due_recall();');
  ELSE
    RAISE NOTICE 'pg_cron not enabled; skipping schedule. Enable pg_cron then re-run this file to schedule the daily reminders.';
  END IF;
END;
$do$;
