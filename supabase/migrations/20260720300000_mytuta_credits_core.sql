-- =====================================================================
-- mytuta: Tuta Credits core (hybrid monetization, Stage 1)
--  * credit_lots: bucketed balances (welcome/promo/subscription/purchased)
--    with per-lot expiry, so the spec's deduction order and expiry rules
--    fall out naturally.
--  * credit_transactions: append-only ledger for the wallet usage history.
--  * credit_action_costs: editable cost table (edit in the Supabase
--    dashboard = "configure costs without code" for the MVP).
--  * subscriptions / payments: state for the later plan + checkout phases.
--  * All writes go through SECURITY DEFINER RPCs; clients only READ their
--    own rows. Every table cascades from auth.users(id).
--  * Guiding rule: accessing learning is free; only NEW AI creation spends.
-- Apply AFTER 20260720290000_mytuta_scheduled_reminders.sql.
-- =====================================================================

-- ---------- tables ----------
CREATE TABLE IF NOT EXISTS public.credit_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,                                  -- welcome | promo | subscription | purchased
  amount_remaining int NOT NULL DEFAULT 0,
  amount_original int NOT NULL DEFAULT 0,
  expires_at timestamptz,                              -- NULL = never expires (purchased)
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_lots_user ON public.credit_lots(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_lots_user_kind ON public.credit_lots(user_id, kind);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,                                  -- grant | spend | refund | purchase | reset | expire
  amount int NOT NULL,                                 -- signed: +grant/-spend
  action_key text,
  description text,
  balance_after int NOT NULL DEFAULT 0,
  ref text,                                            -- provider ref / spend-txn link
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_txn_user ON public.credit_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.credit_action_costs (
  action_key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'student',            -- student | teacher
  cost int NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,                                  -- student_plus | teacher_pro
  status text NOT NULL DEFAULT 'active',               -- active | canceled | past_due
  monthly_credits int NOT NULL DEFAULT 0,
  rollover_cap int NOT NULL DEFAULT 0,
  current_period_end timestamptz,
  provider text DEFAULT 'paystack',
  provider_ref text,
  founding boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paystack',
  provider_ref text UNIQUE NOT NULL,                   -- idempotency key for grants
  kind text NOT NULL,                                  -- bundle | subscription
  amount_ghs numeric,
  credits int,
  status text NOT NULL DEFAULT 'pending',              -- pending | success | failed
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);

-- ---------- RLS (read-own; all writes via SECURITY DEFINER RPCs) ----------
ALTER TABLE public.credit_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_action_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own credit lots" ON public.credit_lots FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own credit txns" ON public.credit_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "read action costs" ON public.credit_action_costs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own payments" ON public.payments FOR SELECT USING (user_id = auth.uid());

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- seed action costs (spec section 5) ----------
INSERT INTO public.credit_action_costs (action_key, label, category, cost) VALUES
  ('solve_hint',            'Quick alternative explanation',        'student', 1),
  -- NOTE: concept_question (Ask mytuta inside a Mastery Path) is intentionally
  -- FREE and ungated — the path is already paid for, so in-path help must not be
  -- a credit barrier. Left unseeded on purpose; do not re-add as a gated action.
  ('worked_example',        'Generate another worked example',      'student', 1),
  ('flashcards',            'Create five flashcards',               'student', 1),
  ('solve_similar',         'Generate a short practice set',        'student', 2),
  ('solve_steps',           'Guided Step Coach session',            'student', 2),
  ('analyse_upload',        'Analyse uploaded question or image',   'student', 2),
  ('mastery_path',          'Generate a full Mastery Path',         'student', 8),
  ('mastery_path_doc',      'Mastery Path from a document',         'student', 10),
  ('revision_session',      'Personalised revision session',        'student', 3),
  ('premium_mastery_check', 'Premium Mastery Check',                'student', 4),
  ('exam_assessment',       'Examination-style topic assessment',   'student', 5),
  ('studio_assist',         'Improve or rewrite one section',       'teacher', 1),
  ('teacher_worked',        'Generate worked examples',             'teacher', 2),
  ('teacher_practice',      'Generate a practice activity',         'teacher', 2),
  ('teacher_support',       'Generate a support or advanced version','teacher', 4),
  ('assessment_generate',   'Generate an assessment',               'teacher', 5),
  ('practical_generate',    'Generate a practical activity',        'teacher', 4),
  ('experience_create',     'Generate a complete Learning Experience','teacher', 12),
  ('experience_doc',        'Generate from a long uploaded document','teacher', 15),
  ('intervention_generate', 'Generate intervention from class results','teacher', 3),
  ('advanced_insight',      'Produce an advanced class insight',    'teacher', 3),
  ('challenge_generate',    'Generate a class challenge',           'teacher', 4)
ON CONFLICT (action_key) DO NOTHING;

-- ---------- wallet_summary(): balances for the header chip + wallet page ----------
CREATE OR REPLACE FUNCTION public.wallet_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  RETURN (
    WITH live AS (
      SELECT * FROM public.credit_lots
      WHERE user_id = v_uid AND amount_remaining > 0
        AND (expires_at IS NULL OR expires_at > now())
    )
    SELECT jsonb_build_object(
      'total',        COALESCE((SELECT sum(amount_remaining) FROM live), 0),
      'welcome',      COALESCE((SELECT sum(amount_remaining) FROM live WHERE kind = 'welcome'), 0),
      'promo',        COALESCE((SELECT sum(amount_remaining) FROM live WHERE kind = 'promo'), 0),
      'subscription', COALESCE((SELECT sum(amount_remaining) FROM live WHERE kind = 'subscription'), 0),
      'purchased',    COALESCE((SELECT sum(amount_remaining) FROM live WHERE kind = 'purchased'), 0),
      'next_expiry',  (SELECT min(expires_at) FROM live WHERE expires_at IS NOT NULL),
      'expiring_amount', COALESCE((
        SELECT sum(amount_remaining) FROM live
        WHERE expires_at IS NOT NULL
          AND expires_at = (SELECT min(expires_at) FROM live WHERE expires_at IS NOT NULL)), 0)
    )
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.wallet_summary() TO authenticated;

-- ---------- grant_welcome_credits(): idempotent 30 credits / 14 days ----------
CREATE OR REPLACE FUNCTION public.grant_welcome_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_total int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  -- Only ever one welcome grant per user.
  IF EXISTS (SELECT 1 FROM public.credit_lots WHERE user_id = v_uid AND kind = 'welcome') THEN
    RETURN;
  END IF;

  INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
  VALUES (v_uid, 'welcome', 30, 30, now() + interval '14 days');

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots WHERE user_id = v_uid AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
  VALUES (v_uid, 'grant', 30, 'Welcome credits received', v_total);
END;
$$;
GRANT EXECUTE ON FUNCTION public.grant_welcome_credits() TO authenticated;

-- ---------- spend_credits(action_key): atomic check + ordered deduction ----------
CREATE OR REPLACE FUNCTION public.spend_credits(p_action_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cost int;
  v_label text;
  v_total int;
  v_need int;
  v_lot RECORD;
  v_take int;
  v_txn_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT cost, label INTO v_cost, v_label
  FROM public.credit_action_costs WHERE action_key = p_action_key AND active;
  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Unknown action %', p_action_key;
  END IF;

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots
  WHERE user_id = v_uid AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  IF v_total < v_cost THEN
    RETURN jsonb_build_object('ok', false, 'cost', v_cost, 'balance', v_total, 'needed', v_cost - v_total);
  END IF;

  -- Deduction order: promo (nearest expiry) -> welcome -> subscription -> purchased.
  v_need := v_cost;
  FOR v_lot IN
    SELECT * FROM public.credit_lots
    WHERE user_id = v_uid AND amount_remaining > 0
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY
      CASE kind WHEN 'promo' THEN 0 WHEN 'welcome' THEN 1 WHEN 'subscription' THEN 2 ELSE 3 END,
      expires_at NULLS LAST
  LOOP
    EXIT WHEN v_need <= 0;
    v_take := LEAST(v_lot.amount_remaining, v_need);
    UPDATE public.credit_lots SET amount_remaining = amount_remaining - v_take WHERE id = v_lot.id;
    v_need := v_need - v_take;
  END LOOP;

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots
  WHERE user_id = v_uid AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after)
  VALUES (v_uid, 'spend', -v_cost, p_action_key, v_label, v_total)
  RETURNING id INTO v_txn_id;

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'balance_after', v_total, 'txn_id', v_txn_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.spend_credits(text) TO authenticated;

-- ---------- refund_credits(txn_id): restore a failed generation's spend ----------
CREATE OR REPLACE FUNCTION public.refund_credits(p_txn_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_txn public.credit_transactions%ROWTYPE;
  v_amount int;
  v_total int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO v_txn FROM public.credit_transactions
  WHERE id = p_txn_id AND user_id = v_uid AND kind = 'spend';
  IF v_txn.id IS NULL THEN
    RAISE EXCEPTION 'Spend not found';
  END IF;
  -- Guard against double refund.
  IF EXISTS (SELECT 1 FROM public.credit_transactions WHERE ref = p_txn_id::text AND kind = 'refund') THEN
    RETURN;
  END IF;

  v_amount := -v_txn.amount;  -- spend was negative

  -- Return to a non-expiring purchased lot so the refund is never lost to expiry.
  INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
  VALUES (v_uid, 'purchased', v_amount, v_amount, NULL);

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots
  WHERE user_id = v_uid AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after, ref)
  VALUES (v_uid, 'refund', v_amount, v_txn.action_key,
          'Refund: ' || COALESCE(v_txn.description, 'generation failed'), v_total, p_txn_id::text);
END;
$$;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid) TO authenticated;

-- ---------- credit_purchase(): called ONLY by the serverless payment endpoint ----------
-- Not granted to `authenticated`; the endpoint uses the service role. Idempotent
-- on provider_ref. Adds a purchased lot (+10% bonus for active subscribers).
CREATE OR REPLACE FUNCTION public.credit_purchase(
  p_user_id uuid, p_provider_ref text, p_kind text, p_credits int, p_amount_ghs numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus int := 0;
  v_credits int := p_credits;
  v_total int;
BEGIN
  -- Idempotency: a successful payment with this ref was already applied.
  IF EXISTS (SELECT 1 FROM public.payments WHERE provider_ref = p_provider_ref AND status = 'success') THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id AND status = 'active') THEN
    v_bonus := floor(p_credits * 0.10);
    v_credits := p_credits + v_bonus;
  END IF;

  INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
  VALUES (p_user_id, 'purchased', v_credits, v_credits, NULL);

  INSERT INTO public.payments (user_id, provider, provider_ref, kind, amount_ghs, credits, status)
  VALUES (p_user_id, 'paystack', p_provider_ref, p_kind, p_amount_ghs, v_credits, 'success')
  ON CONFLICT (provider_ref) DO UPDATE SET status = 'success', credits = v_credits;

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots
  WHERE user_id = p_user_id AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after, ref)
  VALUES (p_user_id, 'purchase', v_credits,
          CASE WHEN v_bonus > 0 THEN 'Credit purchase (+' || v_bonus || ' subscriber bonus)' ELSE 'Credit purchase' END,
          v_total, p_provider_ref);
END;
$$;

-- The serverless payment endpoint calls this with the Supabase service role.
GRANT EXECUTE ON FUNCTION public.credit_purchase(uuid, text, text, int, numeric) TO service_role;

-- ---------- expire_credit_lots(): daily sweep (scheduled with pg_cron below) ----------
CREATE OR REPLACE FUNCTION public.expire_credit_lots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lot RECORD;
  v_total int;
BEGIN
  FOR v_lot IN
    SELECT * FROM public.credit_lots
    WHERE amount_remaining > 0 AND expires_at IS NOT NULL AND expires_at <= now()
  LOOP
    UPDATE public.credit_lots SET amount_remaining = 0 WHERE id = v_lot.id;

    SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
    FROM public.credit_lots
    WHERE user_id = v_lot.user_id AND amount_remaining > 0
      AND (expires_at IS NULL OR expires_at > now());

    INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
    VALUES (v_lot.user_id, 'expire', -v_lot.amount_remaining,
            CASE WHEN v_lot.kind = 'welcome' THEN 'Welcome credits expired' ELSE 'Credits expired' END,
            v_total);
  END LOOP;
END;
$$;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('mytuta-expire-credits', '15 0 * * *', 'SELECT public.expire_credit_lots();');
  ELSE
    RAISE NOTICE 'pg_cron not enabled; skipping credit-expiry schedule. Enable pg_cron then re-run this file.';
  END IF;
END;
$do$;
