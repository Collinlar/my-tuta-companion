-- =====================================================================
-- mytuta Admin Panel — Payments & reconciliation module (PRD §14)
--  * refunds: records money refunds (distinct from credit refunds). The
--    actual Paystack refund API call is made by api/paystack-refund.ts (admin-
--    gated via the caller's JWT); on success it calls admin_record_refund to
--    write the row + audit with the correct admin actor.
--  * admin_list_payments / admin_payment_detail (read) + admin_record_refund
--    (write, audited) + admin_reconciliation() (payments vs credits issued).
-- Apply AFTER 20260720360000_mytuta_admin_plans.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.refunds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_ref  text NOT NULL,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_ghs   numeric NOT NULL,
  reason       text,
  actor_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','success','failed')),
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read refunds" ON public.refunds;
CREATE POLICY "admins read refunds" ON public.refunds
  FOR SELECT USING (public.current_user_is_admin());
CREATE INDEX IF NOT EXISTS refunds_created_idx ON public.refunds (created_at DESC);

-- ---------- payment directory ----------
CREATE OR REPLACE FUNCTION public.admin_list_payments(
  p_search text DEFAULT NULL, p_status text DEFAULT NULL, p_kind text DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int; v_q text := NULLIF(trim(coalesce(p_search,'')), '');
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;

  SELECT count(*) INTO v_total FROM public.payments pm
  LEFT JOIN public.profiles p ON p.user_id = pm.user_id
  WHERE (p_status IS NULL OR pm.status = p_status)
    AND (p_kind IS NULL OR pm.kind = p_kind)
    AND (v_q IS NULL OR pm.provider_ref ILIKE '%'||v_q||'%' OR p.email ILIKE '%'||v_q||'%');

  RETURN jsonb_build_object(
    'total', v_total,
    'rows', COALESCE((
      SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT pm.id, pm.provider, pm.provider_ref, pm.kind, pm.amount_ghs, pm.credits, pm.status, pm.created_at,
               p.email, trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS name
        FROM public.payments pm
        LEFT JOIN public.profiles p ON p.user_id = pm.user_id
        WHERE (p_status IS NULL OR pm.status = p_status)
          AND (p_kind IS NULL OR pm.kind = p_kind)
          AND (v_q IS NULL OR pm.provider_ref ILIKE '%'||v_q||'%' OR p.email ILIKE '%'||v_q||'%')
        ORDER BY pm.created_at DESC
        LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
      ) t
    ), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_payments(text, text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_payment_detail(p_payment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_ref text;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT provider_ref INTO v_ref FROM public.payments WHERE id = p_payment_id;
  RETURN jsonb_build_object(
    'payment', (SELECT to_jsonb(pm) FROM public.payments pm WHERE id = p_payment_id),
    'user', (SELECT jsonb_build_object('user_id', p.user_id, 'email', p.email, 'name', trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')))
             FROM public.payments pm JOIN public.profiles p ON p.user_id = pm.user_id WHERE pm.id = p_payment_id),
    'credit_txns', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.credit_transactions t WHERE t.ref = v_ref), '[]'::jsonb),
    'refunds', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM public.refunds r WHERE r.payment_ref = v_ref), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_payment_detail(uuid) TO authenticated;

-- Record a money refund (Paystack call is done by the serverless endpoint).
CREATE OR REPLACE FUNCTION public.admin_record_refund(
  p_payment_ref text, p_amount numeric, p_reason text, p_status text DEFAULT 'recorded')
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid; v_id uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT user_id INTO v_uid FROM public.payments WHERE provider_ref = p_payment_ref;
  INSERT INTO public.refunds (payment_ref, user_id, amount_ghs, reason, actor_id, status)
  VALUES (p_payment_ref, v_uid, p_amount, p_reason, auth.uid(), p_status)
  RETURNING id INTO v_id;
  PERFORM public.admin_log('record_refund', 'payment', p_payment_ref, p_reason,
    NULL, jsonb_build_object('amount_ghs', p_amount, 'status', p_status));
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_record_refund(text, numeric, text, text) TO authenticated;

-- ---------- reconciliation ----------
CREATE OR REPLACE FUNCTION public.admin_reconciliation()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN jsonb_build_object(
    'payments_success', (SELECT count(*) FROM public.payments WHERE status = 'success'),
    'payments_gross_ghs', COALESCE((SELECT sum(amount_ghs) FROM public.payments WHERE status = 'success'), 0),
    'payments_failed', (SELECT count(*) FROM public.payments WHERE status = 'failed'),
    'payments_pending', (SELECT count(*) FROM public.payments WHERE status = 'pending'),
    'refunds_recorded', (SELECT count(*) FROM public.refunds),
    'refunds_ghs', COALESCE((SELECT sum(amount_ghs) FROM public.refunds WHERE status IN ('recorded','success')), 0),
    -- Successful payments that never produced a matching credit/purchase ledger row.
    'unmatched_payments', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('ref', pm.provider_ref, 'kind', pm.kind, 'amount_ghs', pm.amount_ghs, 'created_at', pm.created_at))
      FROM public.payments pm
      WHERE pm.status = 'success'
        AND NOT EXISTS (SELECT 1 FROM public.credit_transactions t WHERE t.ref = pm.provider_ref)
    ), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_reconciliation() TO authenticated;
