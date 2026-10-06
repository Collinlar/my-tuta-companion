-- Phase 7: Production Hardening
-- Adds RPC error logging, slow-query monitoring helpers, and a Sentry-compatible
-- frontend error log table. All idempotent.

-- ── 1. rpc_error_log ─────────────────────────────────────────────────────────
-- Frontend writes here when an RPC call returns an error or exceeds the slow
-- threshold. Used by the admin AI Ops panel and Supabase alerting.
CREATE TABLE IF NOT EXISTS public.rpc_error_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rpc_name    text NOT NULL,
  error_code  text,
  error_msg   text,
  duration_ms int,
  context     jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rpc_error_log_created_at_idx ON public.rpc_error_log (created_at DESC);
CREATE INDEX IF NOT EXISTS rpc_error_log_rpc_name_idx   ON public.rpc_error_log (rpc_name);

ALTER TABLE public.rpc_error_log ENABLE ROW LEVEL SECURITY;

-- Students can write their own errors; admins read all.
CREATE POLICY "Authenticated insert own"
  ON public.rpc_error_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Admins read all"
  ON public.rpc_error_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');


-- ── 2. log_rpc_error() RPC ────────────────────────────────────────────────────
-- Called by the frontend monitoring client after a failed or slow RPC.
-- Fire-and-forget (returns void); failures are silently ignored client-side.
CREATE OR REPLACE FUNCTION public.log_rpc_error(
  p_rpc_name   text,
  p_error_code text    DEFAULT NULL,
  p_error_msg  text    DEFAULT NULL,
  p_duration_ms int    DEFAULT NULL,
  p_context    jsonb   DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rpc_error_log
    (user_id, rpc_name, error_code, error_msg, duration_ms, context)
  VALUES
    (auth.uid(), p_rpc_name, p_error_code, p_error_msg, p_duration_ms, coalesce(p_context, '{}'::jsonb));
EXCEPTION WHEN OTHERS THEN
  -- Never let logging break the calling flow.
  NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_rpc_error(text, text, text, int, jsonb) TO authenticated;


-- ── 3. Slow-query summary view (admin-only) ───────────────────────────────────
-- Surfaces the slowest RPCs over the last 7 days. Queries this view via
-- admin AI Ops rather than requiring pg_stat_statements access.
CREATE OR REPLACE VIEW public.rpc_slow_summary AS
SELECT
  rpc_name,
  count(*)                          AS call_count,
  round(avg(duration_ms))           AS avg_ms,
  max(duration_ms)                  AS max_ms,
  round(percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms)) AS p95_ms,
  count(*) FILTER (WHERE error_msg IS NOT NULL) AS error_count
FROM public.rpc_error_log
WHERE created_at >= now() - interval '7 days'
  AND duration_ms IS NOT NULL
GROUP BY rpc_name
ORDER BY avg_ms DESC;

-- View inherits the RLS of the underlying table; only admins can read.


-- ── 4. frontend_error_log ─────────────────────────────────────────────────────
-- Receives uncaught JS exceptions from the ErrorBoundary and window.onerror.
-- Acts as the Sentry fallback when VITE_SENTRY_DSN is not set.
CREATE TABLE IF NOT EXISTS public.frontend_error_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message     text,
  stack       text,
  component   text,
  route       text,
  release     text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS frontend_error_log_created_idx ON public.frontend_error_log (created_at DESC);

ALTER TABLE public.frontend_error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated insert"
  ON public.frontend_error_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins read all"
  ON public.frontend_error_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');


-- ── 5. log_frontend_error() RPC ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_frontend_error(
  p_message   text,
  p_stack     text    DEFAULT NULL,
  p_component text    DEFAULT NULL,
  p_route     text    DEFAULT NULL,
  p_release   text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.frontend_error_log
    (user_id, message, stack, component, route, release)
  VALUES
    (auth.uid(), p_message, p_stack, p_component, p_route, p_release);
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_frontend_error(text, text, text, text, text) TO authenticated;
