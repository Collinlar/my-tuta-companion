-- =====================================================================
-- mytuta Admin Panel — AI Operations module (PRD §22)
--  * ai_jobs: one row per AI generation (task/model/tokens/cost/latency/
--    status). RLS: admins read; no client writes. NOTE: the logging that
--    populates this from api/groq.ts is deferred main-app instrumentation —
--    the table + admin UI ship now and stay empty until that lands.
--  * admin_list_ai_jobs / admin_ai_usage (read) + admin_refund_ai_job (write).
-- Apply AFTER 20260720390000_mytuta_admin_assessments.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  task          text NOT NULL,
  provider      text NOT NULL DEFAULT 'groq',
  model         text,
  tokens_in     int,
  tokens_out    int,
  cost_estimate numeric,
  latency_ms    int,
  status        text NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','refunded')),
  error         text,
  ref           text,   -- linked credit-spend txn id, if any
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read ai_jobs" ON public.ai_jobs;
CREATE POLICY "admins read ai_jobs" ON public.ai_jobs
  FOR SELECT USING (public.current_user_is_admin());
CREATE INDEX IF NOT EXISTS ai_jobs_created_idx ON public.ai_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_jobs_status_idx ON public.ai_jobs (status);

CREATE OR REPLACE FUNCTION public.admin_list_ai_jobs(
  p_task text DEFAULT NULL, p_status text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.ai_jobs j
  WHERE (p_task IS NULL OR j.task = p_task) AND (p_status IS NULL OR j.status = p_status);
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT j.id, j.task, j.provider, j.model, j.tokens_in, j.tokens_out, j.cost_estimate, j.latency_ms, j.status, j.error, j.ref, j.created_at,
             p.email
      FROM public.ai_jobs j LEFT JOIN public.profiles p ON p.user_id = j.user_id
      WHERE (p_task IS NULL OR j.task = p_task) AND (p_status IS NULL OR j.status = p_status)
      ORDER BY j.created_at DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
    ) t
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_ai_jobs(text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_ai_usage()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN jsonb_build_object(
    'total_jobs', (SELECT count(*) FROM public.ai_jobs),
    'success', (SELECT count(*) FROM public.ai_jobs WHERE status = 'success'),
    'failed', (SELECT count(*) FROM public.ai_jobs WHERE status = 'failed'),
    'refunded', (SELECT count(*) FROM public.ai_jobs WHERE status = 'refunded'),
    'cost_today', COALESCE((SELECT sum(cost_estimate) FROM public.ai_jobs WHERE created_at::date = CURRENT_DATE), 0),
    'cost_month', COALESCE((SELECT sum(cost_estimate) FROM public.ai_jobs WHERE date_trunc('month', created_at) = date_trunc('month', now())), 0),
    'avg_latency_ms', COALESCE((SELECT round(avg(latency_ms)) FROM public.ai_jobs WHERE latency_ms IS NOT NULL), 0),
    'by_task', COALESCE((SELECT jsonb_agg(jsonb_build_object('task', task, 'jobs', c, 'failed', f, 'cost', cost) ORDER BY c DESC) FROM (
      SELECT task, count(*) AS c, count(*) FILTER (WHERE status = 'failed') AS f, COALESCE(sum(cost_estimate),0) AS cost
      FROM public.ai_jobs GROUP BY task) g), '[]'::jsonb),
    'by_model', COALESCE((SELECT jsonb_agg(jsonb_build_object('model', model, 'jobs', c, 'cost', cost) ORDER BY c DESC) FROM (
      SELECT model, count(*) AS c, COALESCE(sum(cost_estimate),0) AS cost
      FROM public.ai_jobs WHERE model IS NOT NULL GROUP BY model) g), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_ai_usage() TO authenticated;

-- Refund a failed generation's credits (if a spend was linked) and mark the job.
CREATE OR REPLACE FUNCTION public.admin_refund_ai_job(p_job_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_ref text; v_txn public.credit_transactions%ROWTYPE; v_amount int; v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT ref INTO v_ref FROM public.ai_jobs WHERE id = p_job_id;

  IF v_ref IS NOT NULL THEN
    SELECT * INTO v_txn FROM public.credit_transactions WHERE id = v_ref::uuid AND kind = 'spend';
    IF v_txn.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.credit_transactions WHERE ref = v_ref AND kind = 'refund') THEN
      v_amount := -v_txn.amount;
      INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
      VALUES (v_txn.user_id, 'purchased', v_amount, v_amount, NULL);
      SELECT COALESCE(sum(amount_remaining),0) INTO v_total FROM public.credit_lots
        WHERE user_id = v_txn.user_id AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now());
      INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after, ref)
      VALUES (v_txn.user_id, 'refund', v_amount, v_txn.action_key, 'AI job refund: ' || COALESCE(p_reason,''), v_total, v_ref);
    END IF;
  END IF;

  UPDATE public.ai_jobs SET status = 'refunded' WHERE id = p_job_id;
  PERFORM public.admin_log('refund_ai_job', 'ai_job', p_job_id::text, p_reason, NULL, NULL);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_refund_ai_job(uuid, text) TO authenticated;
