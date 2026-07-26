-- =====================================================================
-- mytuta Admin Panel — Users module (PRD §10)
--  * profiles.status: account state (active | suspended). Suspend sets the
--    flag + audits; session-blocking enforcement is a documented follow-on.
--  * Admin-gated SECURITY DEFINER RPCs: directory + detail (read), and
--    status/role/notes/credit/subscription/refund/export actions (write,
--    each audit-logged via admin_log). Every RPC guards on
--    current_user_is_admin(). Apply AFTER 20260720330000_mytuta_admin_core.sql.
-- =====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended'));

-- ---------- directory ----------
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL, p_role text DEFAULT NULL, p_status text DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total int;
  v_q text := NULLIF(trim(coalesce(p_search, '')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  SELECT count(*) INTO v_total
  FROM public.profiles p
  WHERE (p_role IS NULL OR p.user_type = p_role)
    AND (p_status IS NULL OR p.status = p_status)
    AND (v_q IS NULL OR p.email ILIKE '%'||v_q||'%'
         OR (coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) ILIKE '%'||v_q||'%');

  RETURN jsonb_build_object(
    'total', v_total,
    'rows', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT p.user_id, p.email,
               trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS name,
               p.user_type, p.status, p.school, p.created_at,
               s.plan AS sub_plan, s.status AS sub_status,
               COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots l
                         WHERE l.user_id = p.user_id AND l.amount_remaining > 0
                           AND (l.expires_at IS NULL OR l.expires_at > now())), 0) AS credit_balance
        FROM public.profiles p
        LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
        WHERE (p_role IS NULL OR p.user_type = p_role)
          AND (p_status IS NULL OR p.status = p_status)
          AND (v_q IS NULL OR p.email ILIKE '%'||v_q||'%'
               OR (coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) ILIKE '%'||v_q||'%')
        ORDER BY p.created_at DESC
        LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
      ) t
    ), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, text, int, int) TO authenticated;

-- ---------- detail ----------
CREATE OR REPLACE FUNCTION public.admin_user_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  RETURN jsonb_build_object(
    'account', (SELECT to_jsonb(p) FROM (
      SELECT user_id, email, first_name, last_name, user_type, status, school, grade,
             subjects, goals, created_at, onboarding_completed
      FROM public.profiles WHERE user_id = p_user_id) p),
    'usage', jsonb_build_object(
      'mastery_paths', (SELECT count(*) FROM public.mastery_paths WHERE user_id = p_user_id),
      'solve_sessions', (SELECT count(*) FROM public.attempts WHERE user_id = p_user_id AND kind = 'solve'),
      'attempts', (SELECT count(*) FROM public.attempts WHERE user_id = p_user_id),
      'assessments', (SELECT count(*) FROM public.assessment_submissions WHERE student_id = p_user_id),
      'challenges', (SELECT count(*) FROM public.challenge_submissions WHERE user_id = p_user_id),
      'last_active', (SELECT max(created_at) FROM public.attempts WHERE user_id = p_user_id)
    ),
    'wallet', jsonb_build_object(
      'total', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE user_id = p_user_id AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now())), 0),
      'lots', COALESCE((SELECT jsonb_agg(jsonb_build_object('kind', kind, 'remaining', amount_remaining, 'expires_at', expires_at) ORDER BY expires_at NULLS LAST)
                        FROM public.credit_lots WHERE user_id = p_user_id AND amount_remaining > 0), '[]'::jsonb),
      'transactions', COALESCE((SELECT jsonb_agg(row_to_json(x)) FROM (
        SELECT id, kind, amount, action_key, description, balance_after, created_at
        FROM public.credit_transactions WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 50) x), '[]'::jsonb)
    ),
    'subscription', (SELECT to_jsonb(s) FROM (
      SELECT plan, status, monthly_credits, current_period_end, founding, provider
      FROM public.subscriptions WHERE user_id = p_user_id) s),
    'learning', jsonb_build_object(
      'concepts', COALESCE((SELECT jsonb_agg(jsonb_build_object('concept', concept_name, 'state', overall_state) ORDER BY updated_at DESC)
                            FROM public.mastery_profiles WHERE user_id = p_user_id), '[]'::jsonb),
      'classes', COALESCE((SELECT jsonb_agg(DISTINCT c.name) FROM public.class_students cs JOIN public.classes c ON c.id = cs.class_id WHERE cs.student_id = p_user_id), '[]'::jsonb)
    ),
    'teaching', jsonb_build_object(
      'classes', (SELECT count(*) FROM public.classes WHERE teacher_id = p_user_id),
      'experiences', (SELECT count(*) FROM public.learning_experiences WHERE teacher_id = p_user_id),
      'assessments', (SELECT count(*) FROM public.assessments WHERE teacher_id = p_user_id)
    ),
    'notes', COALESCE((SELECT jsonb_agg(jsonb_build_object('reason', reason, 'created_at', created_at, 'action', action) ORDER BY created_at DESC)
                       FROM public.admin_audit_log WHERE target_type = 'user' AND target_id = p_user_id::text LIMIT 30), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_user_detail(uuid) TO authenticated;

-- ---------- write actions ----------
CREATE OR REPLACE FUNCTION public.admin_set_user_status(p_user_id uuid, p_status text, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'bad status'; END IF;
  SELECT status INTO v_prev FROM public.profiles WHERE user_id = p_user_id;
  UPDATE public.profiles SET status = p_status WHERE user_id = p_user_id;
  PERFORM public.admin_log('set_user_status', 'user', p_user_id::text, p_reason,
    jsonb_build_object('status', v_prev), jsonb_build_object('status', p_status));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_change_user_role(p_user_id uuid, p_role text, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_role NOT IN ('student','teacher') THEN RAISE EXCEPTION 'bad role'; END IF;
  SELECT user_type INTO v_prev FROM public.profiles WHERE user_id = p_user_id;
  UPDATE public.profiles SET user_type = p_role WHERE user_id = p_user_id;
  PERFORM public.admin_log('change_user_role', 'user', p_user_id::text, p_reason,
    jsonb_build_object('user_type', v_prev), jsonb_build_object('user_type', p_role));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_change_user_role(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_add_user_note(p_user_id uuid, p_note text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  PERFORM public.admin_log('user_note', 'user', p_user_id::text, p_note, NULL, NULL);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_add_user_note(uuid, text) TO authenticated;

-- Add (positive) or remove (negative) credits for a user. Positive grants a
-- non-expiring promo lot; negative draws down live lots nearest-expiry first.
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(p_user_id uuid, p_amount int, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_left int;
  v_take int;
  v_lot public.credit_lots%ROWTYPE;
  v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_amount = 0 THEN RAISE EXCEPTION 'amount must be non-zero'; END IF;

  IF p_amount > 0 THEN
    INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
    VALUES (p_user_id, 'promo', p_amount, p_amount, NULL);
  ELSE
    v_left := -p_amount;
    FOR v_lot IN
      SELECT * FROM public.credit_lots
      WHERE user_id = p_user_id AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at NULLS LAST
    LOOP
      EXIT WHEN v_left <= 0;
      v_take := LEAST(v_left, v_lot.amount_remaining);
      UPDATE public.credit_lots SET amount_remaining = amount_remaining - v_take WHERE id = v_lot.id;
      v_left := v_left - v_take;
    END LOOP;
  END IF;

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots WHERE user_id = p_user_id AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after)
  VALUES (p_user_id, CASE WHEN p_amount > 0 THEN 'grant' ELSE 'spend' END, p_amount,
          'admin_adjust', 'Admin adjustment: ' || COALESCE(p_reason, ''), v_total);

  PERFORM public.admin_log('adjust_credits', 'user', p_user_id::text, p_reason,
    NULL, jsonb_build_object('amount', p_amount, 'balance_after', v_total));
  RETURN jsonb_build_object('balance', v_total);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, int, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_extend_credit_expiry(p_user_id uuid, p_days int, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  UPDATE public.credit_lots
  SET expires_at = expires_at + make_interval(days => p_days)
  WHERE user_id = p_user_id AND amount_remaining > 0 AND expires_at IS NOT NULL AND expires_at > now();
  PERFORM public.admin_log('extend_credit_expiry', 'user', p_user_id::text, p_reason,
    NULL, jsonb_build_object('days', p_days));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_extend_credit_expiry(uuid, int, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_cancel_subscription(p_user_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  PERFORM public.cancel_subscription_state(p_user_id);
  PERFORM public.admin_log('cancel_subscription', 'user', p_user_id::text, p_reason, NULL, NULL);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_cancel_subscription(uuid, text) TO authenticated;

-- Admin refund of any user's spend (mirrors refund_credits but not caller-scoped).
CREATE OR REPLACE FUNCTION public.admin_refund_credits(p_txn_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_txn public.credit_transactions%ROWTYPE;
  v_amount int;
  v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT * INTO v_txn FROM public.credit_transactions WHERE id = p_txn_id AND kind = 'spend';
  IF v_txn.id IS NULL THEN RAISE EXCEPTION 'Spend not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.credit_transactions WHERE ref = p_txn_id::text AND kind = 'refund') THEN
    RETURN;
  END IF;

  v_amount := -v_txn.amount;
  INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
  VALUES (v_txn.user_id, 'purchased', v_amount, v_amount, NULL);

  SELECT COALESCE(sum(amount_remaining), 0) INTO v_total
  FROM public.credit_lots WHERE user_id = v_txn.user_id AND amount_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after, ref)
  VALUES (v_txn.user_id, 'refund', v_amount, v_txn.action_key,
          'Admin refund: ' || COALESCE(p_reason, v_txn.description, ''), v_total, p_txn_id::text);

  PERFORM public.admin_log('refund_credits', 'user', v_txn.user_id::text, p_reason,
    NULL, jsonb_build_object('txn_id', p_txn_id, 'amount', v_amount));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_refund_credits(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_export_user_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN jsonb_build_object(
    'profile', (SELECT to_jsonb(p) FROM public.profiles p WHERE user_id = p_user_id),
    'credit_lots', COALESCE((SELECT jsonb_agg(to_jsonb(l)) FROM public.credit_lots l WHERE user_id = p_user_id), '[]'::jsonb),
    'credit_transactions', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.credit_transactions t WHERE user_id = p_user_id), '[]'::jsonb),
    'subscription', (SELECT to_jsonb(s) FROM public.subscriptions s WHERE user_id = p_user_id),
    'payments', COALESCE((SELECT jsonb_agg(to_jsonb(pm)) FROM public.payments pm WHERE user_id = p_user_id), '[]'::jsonb),
    'mastery_paths', COALESCE((SELECT jsonb_agg(to_jsonb(mp)) FROM public.mastery_paths mp WHERE user_id = p_user_id), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_export_user_data(uuid) TO authenticated;
