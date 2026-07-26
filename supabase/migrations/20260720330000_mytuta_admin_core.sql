-- =====================================================================
-- mytuta: Master Admin Panel — foundation (identity, audit, overview)
--  * admin_users: who is an admin and with which role. No client writes.
--  * admin_audit_log: immutable record of every privileged admin action.
--  * Helpers: current_user_is_admin() / current_admin_role() /
--    admin_has_role() gate every admin RPC; admin_log() (owner-only) is
--    called by mutating admin RPCs to record actor/target/before/after.
--  * platform_overview(): global dashboard metrics (admin-gated).
--  * admin_audit_list(): paginated audit viewer feed.
-- All cross-user admin access goes through admin-gated SECURITY DEFINER
-- RPCs like these — there is no broad admin-read RLS and no service-role
-- admin backend. Apply AFTER 20260720320000_mytuta_subscription_renewal.sql.
-- =====================================================================

-- ---------- admin identity ----------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'analyst'
                CHECK (role IN ('super','product','content','finance','support','analyst')),
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  active      boolean NOT NULL DEFAULT true,
  note        text,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ---------- immutable audit log ----------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  target_type text,
  target_id   text,
  reason      text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_idx ON public.admin_audit_log (target_type, target_id);

-- ---------- role helpers ----------
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND active
  );
$$;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.admin_users
  WHERE user_id = auth.uid() AND active;
$$;
GRANT EXECUTE ON FUNCTION public.current_admin_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_has_role(VARIADIC p_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND active
      AND (role = 'super' OR role = ANY(p_roles))
  );
$$;
GRANT EXECUTE ON FUNCTION public.admin_has_role(text[]) TO authenticated;

-- Owner-only audit writer (not granted to authenticated; only the
-- SECURITY DEFINER admin RPCs, which run as owner, may call it — this
-- prevents a client from forging audit rows).
CREATE OR REPLACE FUNCTION public.admin_log(
  p_action text, p_target_type text, p_target_id text,
  p_reason text DEFAULT NULL, p_before jsonb DEFAULT NULL, p_after jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, reason, before, after)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_reason, p_before, p_after);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_log(text, text, text, text, jsonb, jsonb) FROM PUBLIC;

-- ---------- RLS: admins may read identity + audit; no client writes ----------
DROP POLICY IF EXISTS "admins read admin_users" ON public.admin_users;
CREATE POLICY "admins read admin_users" ON public.admin_users
  FOR SELECT USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "admins read audit" ON public.admin_audit_log;
CREATE POLICY "admins read audit" ON public.admin_audit_log
  FOR SELECT USING (public.current_user_is_admin());

-- ---------- platform_overview(): global dashboard metrics ----------
CREATE OR REPLACE FUNCTION public.platform_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN jsonb_build_object(
    'users', jsonb_build_object(
      'students', (SELECT count(*) FROM public.profiles WHERE user_type = 'student'),
      'teachers', (SELECT count(*) FROM public.profiles WHERE user_type = 'teacher'),
      'new_7d', (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '7 days'),
      'active_7d', (SELECT count(DISTINCT user_id) FROM public.attempts WHERE created_at >= now() - interval '7 days'),
      'active_30d', (SELECT count(DISTINCT user_id) FROM public.attempts WHERE created_at >= now() - interval '30 days')
    ),
    'learning', jsonb_build_object(
      'paths_created', (SELECT count(*) FROM public.mastery_paths),
      'paths_completed', (SELECT count(*) FROM public.mastery_paths WHERE status = 'mastered' OR pct >= 100),
      'solve_sessions', (SELECT count(*) FROM public.attempts WHERE kind = 'solve'),
      'mastery_checks', (SELECT count(*) FROM public.attempts WHERE kind = 'mastery_check'),
      'concepts_mastered', (SELECT count(*) FROM public.mastery_profiles WHERE overall_state IN ('Secure','Mastered'))
    ),
    'commercial', jsonb_build_object(
      'revenue_today', COALESCE((SELECT sum(amount_ghs) FROM public.payments WHERE status = 'success' AND created_at::date = CURRENT_DATE), 0),
      'revenue_month', COALESCE((SELECT sum(amount_ghs) FROM public.payments WHERE status = 'success' AND date_trunc('month', created_at) = date_trunc('month', now())), 0),
      'subs_active', (SELECT count(*) FROM public.subscriptions WHERE status = 'active'),
      'subs_student_plus', (SELECT count(*) FROM public.subscriptions WHERE status = 'active' AND plan = 'student_plus'),
      'subs_teacher_pro', (SELECT count(*) FROM public.subscriptions WHERE status = 'active' AND plan = 'teacher_pro'),
      'failed_payments', (SELECT count(*) FROM public.payments WHERE status = 'failed'),
      'refunds_month', (SELECT count(*) FROM public.credit_transactions WHERE kind = 'refund' AND date_trunc('month', created_at) = date_trunc('month', now()))
    ),
    'credits', jsonb_build_object(
      'issued', COALESCE((SELECT sum(amount) FROM public.credit_transactions WHERE kind IN ('grant','purchase','reset')), 0),
      'purchased', COALESCE((SELECT sum(amount) FROM public.credit_transactions WHERE kind = 'purchase'), 0),
      'consumed', COALESCE((SELECT -sum(amount) FROM public.credit_transactions WHERE kind = 'spend'), 0),
      'outstanding_welcome', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'welcome' AND amount_remaining > 0), 0),
      'outstanding_promo', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'promo' AND amount_remaining > 0), 0),
      'outstanding_subscription', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'subscription' AND amount_remaining > 0), 0),
      'outstanding_purchased', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE kind = 'purchased' AND amount_remaining > 0), 0),
      'expiring_7d', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE amount_remaining > 0 AND expires_at IS NOT NULL AND expires_at BETWEEN now() AND now() + interval '7 days'), 0)
    ),
    'attention', jsonb_build_object(
      'failed_payments', (SELECT count(*) FROM public.payments WHERE status = 'failed'),
      'past_due_subs', (SELECT count(*) FROM public.subscriptions WHERE status = 'past_due'),
      'expiring_credit_users', (SELECT count(DISTINCT user_id) FROM public.credit_lots WHERE amount_remaining > 0 AND expires_at IS NOT NULL AND expires_at BETWEEN now() AND now() + interval '3 days')
    )
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.platform_overview() TO authenticated;

-- ---------- admin_audit_list(): paginated audit feed ----------
CREATE OR REPLACE FUNCTION public.admin_audit_list(
  p_limit int DEFAULT 50, p_offset int DEFAULT 0,
  p_action text DEFAULT NULL, p_target_type text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT count(*) INTO v_total
  FROM public.admin_audit_log a
  WHERE (p_action IS NULL OR a.action = p_action)
    AND (p_target_type IS NULL OR a.target_type = p_target_type);

  RETURN jsonb_build_object(
    'total', v_total,
    'rows', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT a.id, a.actor_id,
               COALESCE(p.first_name || ' ' || p.last_name, p.email, a.actor_id::text) AS actor_name,
               a.action, a.target_type, a.target_id, a.reason, a.created_at
        FROM public.admin_audit_log a
        LEFT JOIN public.profiles p ON p.user_id = a.actor_id
        WHERE (p_action IS NULL OR a.action = p_action)
          AND (p_target_type IS NULL OR a.target_type = p_target_type)
        ORDER BY a.created_at DESC
        LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
      ) t
    ), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_audit_list(int, int, text, text) TO authenticated;

-- ---------- seed the first Super Admin (Collins) ----------
-- Change this email if the first admin differs; add more admins from the
-- Users module once one super admin exists.
INSERT INTO public.admin_users (user_id, role, note)
SELECT id, 'super', 'Seeded founder super admin'
FROM auth.users
WHERE email = 'kofcollkcl100@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
