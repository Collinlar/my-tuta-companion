-- =====================================================================
-- mytuta Admin Panel — Plans & Subscriptions module (PRD §13)
--  * plans: DB-configurable plan catalog seeded from the economics currently
--    hardcoded in apply_subscription_charge (student_plus 400/mo, teacher_pro
--    900/mo, cap 100). NOTE: deep re-wiring of apply_subscription_charge to
--    read this table is a documented follow-on; the editor + directory ship now.
--  * admin_list_subscriptions (read) + admin_subscription_action (write:
--    cancel / extend / set_founding / comp_credits / reactivate), audited.
--  * admin_upsert_plan (write, audited).
-- Apply AFTER 20260720350000_mytuta_admin_credits.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  role            text NOT NULL CHECK (role IN ('student','teacher')),
  price_ghs       numeric NOT NULL,
  currency        text NOT NULL DEFAULT 'GHS',
  period          text NOT NULL DEFAULT 'month',
  included_credits int NOT NULL DEFAULT 0,
  rollover_cap    int NOT NULL DEFAULT 0,
  founding_price  numeric,
  active          boolean NOT NULL DEFAULT true,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read active plans" ON public.plans;
CREATE POLICY "read active plans" ON public.plans
  FOR SELECT USING (active OR public.current_user_is_admin());

INSERT INTO public.plans (id, name, role, price_ghs, included_credits, rollover_cap, founding_price) VALUES
  ('student_plus', 'Student Plus', 'student', 100, 400, 100, NULL),
  ('teacher_pro',  'Teacher Pro',  'teacher', 200, 900, 100, 150)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_upsert_plan(
  p_id text, p_name text, p_role text, p_price_ghs numeric, p_included_credits int,
  p_rollover_cap int, p_founding_price numeric, p_active boolean, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev jsonb;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT to_jsonb(p) INTO v_prev FROM public.plans p WHERE id = p_id;
  INSERT INTO public.plans (id, name, role, price_ghs, included_credits, rollover_cap, founding_price, active, updated_at)
  VALUES (p_id, p_name, p_role, p_price_ghs, p_included_credits, p_rollover_cap, p_founding_price, p_active, now())
  ON CONFLICT (id) DO UPDATE SET
    name = excluded.name, role = excluded.role, price_ghs = excluded.price_ghs,
    included_credits = excluded.included_credits, rollover_cap = excluded.rollover_cap,
    founding_price = excluded.founding_price, active = excluded.active, updated_at = now();
  PERFORM public.admin_log('upsert_plan', 'plan', p_id, p_reason, v_prev,
    jsonb_build_object('name', p_name, 'price_ghs', p_price_ghs, 'active', p_active));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_upsert_plan(text, text, text, numeric, int, int, numeric, boolean, text) TO authenticated;

-- ---------- subscription directory ----------
CREATE OR REPLACE FUNCTION public.admin_list_subscriptions(
  p_plan text DEFAULT NULL, p_status text DEFAULT NULL, p_founding boolean DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  SELECT count(*) INTO v_total FROM public.subscriptions s
  WHERE (p_plan IS NULL OR s.plan = p_plan)
    AND (p_status IS NULL OR s.status = p_status)
    AND (p_founding IS NULL OR s.founding = p_founding);

  RETURN jsonb_build_object(
    'total', v_total,
    'rows', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT s.user_id, s.plan, s.status, s.monthly_credits, s.current_period_end, s.founding, s.provider,
               p.email, trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS name
        FROM public.subscriptions s
        LEFT JOIN public.profiles p ON p.user_id = s.user_id
        WHERE (p_plan IS NULL OR s.plan = p_plan)
          AND (p_status IS NULL OR s.status = p_status)
          AND (p_founding IS NULL OR s.founding = p_founding)
        ORDER BY s.current_period_end DESC NULLS LAST
        LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
      ) t
    ), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_subscriptions(text, text, boolean, int, int) TO authenticated;

-- ---------- subscription actions ----------
-- p_value: days (extend), credits (comp_credits), or 1/0 (set_founding).
CREATE OR REPLACE FUNCTION public.admin_subscription_action(
  p_user_id uuid, p_action text, p_value int, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  IF p_action = 'cancel' THEN
    PERFORM public.cancel_subscription_state(p_user_id);
  ELSIF p_action = 'reactivate' THEN
    UPDATE public.subscriptions SET status = 'active' WHERE user_id = p_user_id;
  ELSIF p_action = 'extend' THEN
    UPDATE public.subscriptions
    SET current_period_end = COALESCE(current_period_end, now()) + make_interval(days => p_value)
    WHERE user_id = p_user_id;
  ELSIF p_action = 'set_founding' THEN
    UPDATE public.subscriptions SET founding = (p_value <> 0) WHERE user_id = p_user_id;
  ELSIF p_action = 'comp_credits' THEN
    INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
    VALUES (p_user_id, 'promo', p_value, p_value, NULL);
    SELECT COALESCE(sum(amount_remaining),0) INTO v_total FROM public.credit_lots
      WHERE user_id = p_user_id AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now());
    INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after)
    VALUES (p_user_id, 'grant', p_value, 'admin_comp', 'Complimentary credits: ' || COALESCE(p_reason,''), v_total);
  ELSE
    RAISE EXCEPTION 'unknown action %', p_action;
  END IF;

  PERFORM public.admin_log('subscription_' || p_action, 'user', p_user_id::text, p_reason,
    NULL, jsonb_build_object('value', p_value));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_subscription_action(uuid, text, int, text) TO authenticated;
