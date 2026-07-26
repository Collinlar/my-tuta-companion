-- =====================================================================
-- mytuta: expiring-credit reminders (spec section 18/19)
--  * A daily job nudges users whose welcome/promo credits expire within
--    3 days (once per day, de-duped), via a 'credits' notification.
--  * Complements expire_credit_lots() (20260720300000), which zeroes lots
--    on/after expiry; this warns beforehand.
-- Apply AFTER 20260720300000_mytuta_credits_core.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.notify_expiring_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body)
  SELECT g.user_id, 'credits',
         'Credits expiring soon',
         g.amt::text || ' credit' || CASE WHEN g.amt = 1 THEN '' ELSE 's' END ||
           ' expire in ' || GREATEST(0, ceil(extract(epoch FROM (g.soonest - now())) / 86400))::int::text ||
           ' day' || CASE WHEN ceil(extract(epoch FROM (g.soonest - now())) / 86400) = 1 THEN '' ELSE 's' END ||
           '. Use them before they go.'
  FROM (
    SELECT user_id, sum(amount_remaining) AS amt, min(expires_at) AS soonest
    FROM public.credit_lots
    WHERE amount_remaining > 0
      AND kind IN ('welcome', 'promo')
      AND expires_at IS NOT NULL
      AND expires_at > now()
      AND expires_at <= now() + interval '3 days'
    GROUP BY user_id
  ) g
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = g.user_id AND n.kind = 'credits' AND n.created_at::date = CURRENT_DATE
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.notify_expiring_credits() TO authenticated;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('mytuta-credit-reminders', '45 7 * * *', 'SELECT public.notify_expiring_credits();');
  ELSE
    RAISE NOTICE 'pg_cron not enabled; skipping credit-reminder schedule. Enable pg_cron then re-run this file.';
  END IF;
END;
$do$;
