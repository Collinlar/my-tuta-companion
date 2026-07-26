-- =====================================================================
-- mytuta: subscription renewal (Student Plus / Teacher Pro, spec 9-13)
--  * apply_subscription_charge: called by the Paystack webhook (service
--    role) on every successful subscription charge (initial + recurring).
--    Sets subscription state and resets the monthly credit lot, rolling
--    over unused subscription credits up to the plan cap.
--  * cancel_subscription_state: webhook marks a subscription canceled and
--    clears its remaining subscription credits.
--  * flag_past_due_subscriptions: daily pg_cron safety net — never grants
--    credits, only flags subs whose period lapsed without a renewal charge.
--    Billing itself is driven by Paystack, not by this job.
--  * Plan economics are fixed here server-side (400/900 credits, 100 cap)
--    so a tampered client cannot inflate an allowance.
-- Apply AFTER 20260720310000_mytuta_credit_reminders.sql.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.apply_subscription_charge(
  p_user_id uuid, p_plan text, p_provider_ref text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_monthly int;
  v_cap int := 100;
  v_founding boolean := false;
  v_carry int;
  v_new int;
  v_total int;
  v_period_end timestamptz := now() + interval '1 month';
BEGIN
  IF p_plan = 'student_plus' THEN
    v_monthly := 400;
  ELSIF p_plan = 'teacher_pro' THEN
    v_monthly := 900;
    v_founding := true;   -- founding price flag; kept until a later change
  ELSE
    RAISE EXCEPTION 'Unknown plan %', p_plan;
  END IF;

  -- Roll over unused subscription credits, capped.
  SELECT COALESCE(sum(amount_remaining), 0) INTO v_carry
  FROM public.credit_lots WHERE user_id = p_user_id AND kind = 'subscription' AND amount_remaining > 0;
  v_carry := LEAST(v_carry, v_cap);
  v_new := v_carry + v_monthly;

  UPDATE public.credit_lots SET amount_remaining = 0
  WHERE user_id = p_user_id AND kind = 'subscription' AND amount_remaining > 0;

  INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
  VALUES (p_user_id, 'subscription', v_new, v_new, v_period_end);

  INSERT INTO public.subscriptions (user_id, plan, status, monthly_credits, rollover_cap, current_period_end, provider, provider_ref, founding)
  VALUES (p_user_id, p_plan, 'active', v_monthly, v_cap, v_period_end, 'paystack', p_provider_ref, v_founding)
  ON CONFLICT (user_id) DO UPDATE
    SET plan = excluded.plan, status = 'active', monthly_credits = excluded.monthly_credits,
        rollover_cap = excluded.rollover_cap, current_period_end = excluded.current_period_end,
        provider_ref = excluded.provider_ref;

  -- Record it as a payment (idempotency + history), ignore duplicates.
  INSERT INTO public.payments (user_id, provider, provider_ref, kind, credits, status)
  VALUES (p_user_id, 'paystack', p_provider_ref, 'subscription', v_new, 'success')
  ON CONFLICT (provider_ref) DO NOTHING;

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots WHERE user_id = p_user_id AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after, ref)
  VALUES (p_user_id, 'reset', v_new, 'Monthly subscription credits', v_total, p_provider_ref);
END;
$$;
GRANT EXECUTE ON FUNCTION public.apply_subscription_charge(uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.cancel_subscription_state(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions SET status = 'canceled' WHERE user_id = p_user_id;
  UPDATE public.credit_lots SET amount_remaining = 0
  WHERE user_id = p_user_id AND kind = 'subscription' AND amount_remaining > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.cancel_subscription_state(uuid) TO service_role;

-- Daily safety net: flag lapsed subscriptions. Grants nothing.
CREATE OR REPLACE FUNCTION public.flag_past_due_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'past_due'
  WHERE status = 'active'
    AND current_period_end IS NOT NULL
    AND current_period_end < now() - interval '3 days';
END;
$$;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('mytuta-flag-past-due-subs', '30 1 * * *', 'SELECT public.flag_past_due_subscriptions();');
  ELSE
    RAISE NOTICE 'pg_cron not enabled; skipping subscription safety-net schedule.';
  END IF;
END;
$do$;
