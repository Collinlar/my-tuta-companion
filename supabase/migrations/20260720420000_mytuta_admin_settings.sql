-- =====================================================================
-- mytuta Admin Panel — Platform Settings module (PRD §28)
--  * platform_config: editable global config (welcome-credit amount/expiry,
--    limits, supported subjects/countries, maintenance message).
--  * feature_flags: on/off toggles with optional targeting.
--  * admin_set_config / admin_set_flag (write, audited). Editing is live now;
--    WIRING these keys into the live credit/limit RPCs (e.g. grant_welcome_
--    credits reading the configured amount) is deferred instrumentation.
-- Apply AFTER 20260720410000_mytuta_admin_support.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.platform_config (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  label      text NOT NULL,
  category   text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read config" ON public.platform_config;
CREATE POLICY "admins read config" ON public.platform_config
  FOR SELECT USING (public.current_user_is_admin());

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key        text PRIMARY KEY,
  label      text NOT NULL,
  enabled    boolean NOT NULL DEFAULT false,
  target     jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read flags" ON public.feature_flags;
CREATE POLICY "admins read flags" ON public.feature_flags
  FOR SELECT USING (public.current_user_is_admin());

INSERT INTO public.platform_config (key, value, label, category) VALUES
  ('welcome_credit_amount', '30'::jsonb, 'Welcome credit amount', 'credits'),
  ('welcome_credit_expiry_days', '14'::jsonb, 'Welcome credit expiry (days)', 'credits'),
  ('wallet_deduction_order', '["promo","welcome","subscription","purchased"]'::jsonb, 'Wallet deduction order', 'credits'),
  ('purchased_credit_expiry', '"never"'::jsonb, 'Purchased-credit expiry rule', 'credits'),
  ('subscriber_rollover_cap', '100'::jsonb, 'Subscriber rollover cap', 'credits'),
  ('class_limit_free', '1'::jsonb, 'Free teacher class limit', 'limits'),
  ('upload_limit_mb', '8'::jsonb, 'Upload size limit (MB)', 'limits'),
  ('max_generation_tokens', '6000'::jsonb, 'Max generation size (tokens)', 'limits'),
  ('supported_subjects', '["Mathematics","Physics","Chemistry","Biology","Integrated Science"]'::jsonb, 'Supported subjects', 'catalog'),
  ('supported_countries', '["Ghana"]'::jsonb, 'Supported countries', 'catalog'),
  ('maintenance_message', '""'::jsonb, 'Maintenance banner message', 'general')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.feature_flags (key, label, enabled) VALUES
  ('stem_lab', 'STEM Lab', true),
  ('challenges', 'Challenges', true),
  ('student_plus', 'Student Plus subscription', true),
  ('teacher_pro', 'Teacher Pro subscription', true),
  ('exam_tests', 'Examination-style tests', false),
  ('public_sharing', 'Public sharing', true),
  ('multi_language', 'Multi-language', false)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_set_config(p_key text, p_value jsonb, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev jsonb;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT value INTO v_prev FROM public.platform_config WHERE key = p_key;
  UPDATE public.platform_config SET value = p_value, updated_at = now() WHERE key = p_key;
  PERFORM public.admin_log('set_config', 'config', p_key, p_reason,
    jsonb_build_object('value', v_prev), jsonb_build_object('value', p_value));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_config(text, jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_flag(p_key text, p_enabled boolean, p_target jsonb, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_prev boolean;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT enabled INTO v_prev FROM public.feature_flags WHERE key = p_key;
  UPDATE public.feature_flags SET enabled = p_enabled, target = COALESCE(p_target, target), updated_at = now() WHERE key = p_key;
  PERFORM public.admin_log('set_flag', 'flag', p_key, p_reason,
    jsonb_build_object('enabled', v_prev), jsonb_build_object('enabled', p_enabled));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_flag(text, boolean, jsonb, text) TO authenticated;
