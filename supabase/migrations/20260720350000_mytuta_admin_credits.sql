-- =====================================================================
-- mytuta Admin Panel — Credits & bundles module (PRD §12)
--  * credit_bundles: the four sale bundles, now DB-configurable (were
--    hardcoded in src/mytuta/credits/bundles.ts). Readable by anyone (active
--    only) so the pricing page + checkout can read them; writes are admin RPCs.
--    NOTE: api/paystack-verify.ts keeps its own server-side price map so a
--    tampered client still cannot over-credit — switching that to read this
--    table is a documented follow-on.
--  * admin_set_action_cost / admin_upsert_bundle (write, audited).
--  * admin_credit_liability(): outstanding by bucket + estimated liability.
-- Apply AFTER 20260720340000_mytuta_admin_users.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.credit_bundles (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  price_ghs    numeric NOT NULL,
  credits      int NOT NULL,
  bonus        int NOT NULL DEFAULT 0,
  target_role  text NOT NULL DEFAULT 'all' CHECK (target_role IN ('all','student','teacher')),
  positioning  text,
  featured     boolean NOT NULL DEFAULT false,
  active       boolean NOT NULL DEFAULT true,
  country      text,
  sort         int NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read active bundles" ON public.credit_bundles;
CREATE POLICY "read active bundles" ON public.credit_bundles
  FOR SELECT USING (active OR public.current_user_is_admin());

INSERT INTO public.credit_bundles (id, name, price_ghs, credits, positioning, featured, sort) VALUES
  ('starter', 'Starter', 20,  50,  'Try a few learning activities.', false, 1),
  ('study',   'Study',   50,  140, 'Regular revision and solving.',  false, 2),
  ('power',   'Power',   100, 320, 'Frequent learning or creation.', true,  3),
  ('max',     'Max',     200, 700, 'Heavy student or teacher usage.', false, 4)
ON CONFLICT (id) DO NOTHING;

-- ---------- edit an action cost ----------
CREATE OR REPLACE FUNCTION public.admin_set_action_cost(
  p_action_key text, p_cost int, p_active boolean, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev jsonb;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT to_jsonb(c) INTO v_prev FROM public.credit_action_costs c WHERE action_key = p_action_key;
  UPDATE public.credit_action_costs SET cost = p_cost, active = p_active WHERE action_key = p_action_key;
  PERFORM public.admin_log('set_action_cost', 'action_cost', p_action_key, p_reason,
    v_prev, jsonb_build_object('cost', p_cost, 'active', p_active));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_action_cost(text, int, boolean, text) TO authenticated;

-- ---------- create / edit a bundle ----------
CREATE OR REPLACE FUNCTION public.admin_upsert_bundle(
  p_id text, p_name text, p_price_ghs numeric, p_credits int, p_bonus int,
  p_target_role text, p_positioning text, p_featured boolean, p_active boolean, p_sort int, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev jsonb;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT to_jsonb(b) INTO v_prev FROM public.credit_bundles b WHERE id = p_id;
  INSERT INTO public.credit_bundles (id, name, price_ghs, credits, bonus, target_role, positioning, featured, active, sort, updated_at)
  VALUES (p_id, p_name, p_price_ghs, p_credits, p_bonus, p_target_role, p_positioning, p_featured, p_active, p_sort, now())
  ON CONFLICT (id) DO UPDATE SET
    name = excluded.name, price_ghs = excluded.price_ghs, credits = excluded.credits, bonus = excluded.bonus,
    target_role = excluded.target_role, positioning = excluded.positioning, featured = excluded.featured,
    active = excluded.active, sort = excluded.sort, updated_at = now();
  PERFORM public.admin_log('upsert_bundle', 'bundle', p_id, p_reason, v_prev,
    jsonb_build_object('name', p_name, 'price_ghs', p_price_ghs, 'credits', p_credits, 'active', p_active));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_upsert_bundle(text, text, numeric, int, int, text, text, boolean, boolean, int, text) TO authenticated;

-- ---------- liability dashboard ----------
CREATE OR REPLACE FUNCTION public.admin_credit_liability()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE
  v_issued int;
  v_consumed int;
  v_ghs_per_credit numeric;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  SELECT COALESCE(sum(amount), 0) INTO v_issued FROM public.credit_transactions WHERE kind IN ('grant','purchase','reset');
  SELECT COALESCE(-sum(amount), 0) INTO v_consumed FROM public.credit_transactions WHERE kind = 'spend';
  SELECT CASE WHEN COALESCE(sum(credits),0) > 0 THEN round(sum(amount_ghs)::numeric / sum(credits), 4) ELSE 0 END
    INTO v_ghs_per_credit FROM public.payments WHERE status = 'success' AND kind = 'bundle';

  RETURN jsonb_build_object(
    'outstanding_welcome', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'welcome' AND amount_remaining > 0), 0),
    'outstanding_promo', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'promo' AND amount_remaining > 0), 0),
    'outstanding_subscription', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'subscription' AND amount_remaining > 0), 0),
    'outstanding_purchased', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'purchased' AND amount_remaining > 0), 0),
    'due_to_expire_7d', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE amount_remaining > 0 AND expires_at IS NOT NULL AND expires_at BETWEEN now() AND now() + interval '7 days'), 0),
    'issued', v_issued,
    'consumed', v_consumed,
    'redemption_rate', CASE WHEN v_issued > 0 THEN round(100.0 * v_consumed / v_issued) ELSE 0 END,
    'ghs_per_credit', v_ghs_per_credit,
    'estimated_liability_ghs', round(COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'purchased' AND amount_remaining > 0), 0) * v_ghs_per_credit, 2)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_credit_liability() TO authenticated;
