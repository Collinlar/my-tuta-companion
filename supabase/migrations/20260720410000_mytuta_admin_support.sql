-- =====================================================================
-- mytuta Admin Panel — Support module (PRD §25)
--  * support_tickets + ticket_messages. Admins manage from the inbox; the
--    user-facing "create a ticket" path is deferred, so admins can also
--    create tickets manually via admin_create_ticket meanwhile.
--  * admin_list_tickets / admin_ticket_detail (read) + admin_ticket_action
--    (reply/assign/resolve/reopen/add_credits, audited).
-- Apply AFTER 20260720400000_mytuta_admin_ai_ops.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category   text NOT NULL DEFAULT 'account',
  subject    text NOT NULL,
  status     text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  priority   text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assignee   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read tickets" ON public.support_tickets;
CREATE POLICY "admins read tickets" ON public.support_tickets
  FOR SELECT USING (public.current_user_is_admin() OR user_id = auth.uid());
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets (status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body       text NOT NULL,
  internal   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read ticket messages" ON public.ticket_messages;
CREATE POLICY "admins read ticket messages" ON public.ticket_messages
  FOR SELECT USING (public.current_user_is_admin());

CREATE OR REPLACE FUNCTION public.admin_list_tickets(
  p_status text DEFAULT NULL, p_category text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT count(*) INTO v_total FROM public.support_tickets t
  WHERE (p_status IS NULL OR t.status = p_status) AND (p_category IS NULL OR t.category = p_category);
  RETURN jsonb_build_object('total', v_total, 'rows', COALESCE((
    SELECT jsonb_agg(row_to_json(x)) FROM (
      SELECT t.id, t.subject, t.category, t.status, t.priority, t.assignee, t.created_at, t.updated_at,
             p.email, trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')) AS name
      FROM public.support_tickets t LEFT JOIN public.profiles p ON p.user_id = t.user_id
      WHERE (p_status IS NULL OR t.status = p_status) AND (p_category IS NULL OR t.category = p_category)
      ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.updated_at DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset)
    ) x
  ), '[]'::jsonb));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_tickets(text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_ticket_detail(p_ticket_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
DECLARE v_uid uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT user_id INTO v_uid FROM public.support_tickets WHERE id = p_ticket_id;
  RETURN jsonb_build_object(
    'ticket', (SELECT to_jsonb(t) FROM public.support_tickets t WHERE id = p_ticket_id),
    'account', (SELECT jsonb_build_object('user_id', p.user_id, 'name', trim(coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')), 'email', p.email, 'user_type', p.user_type, 'status', p.status)
                FROM public.profiles p WHERE p.user_id = v_uid),
    'credit_balance', COALESCE((SELECT sum(amount_remaining) FROM public.credit_lots WHERE user_id = v_uid AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now())), 0),
    'subscription', (SELECT jsonb_build_object('plan', plan, 'status', status) FROM public.subscriptions WHERE user_id = v_uid),
    'messages', COALESCE((SELECT jsonb_agg(jsonb_build_object('body', m.body, 'internal', m.internal, 'created_at', m.created_at, 'author', COALESCE(pr.first_name, 'Admin')) ORDER BY m.created_at)
                          FROM public.ticket_messages m LEFT JOIN public.profiles pr ON pr.user_id = m.author_id WHERE m.ticket_id = p_ticket_id), '[]'::jsonb)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_ticket_detail(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_ticket(
  p_user_id uuid, p_category text, p_subject text, p_priority text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  INSERT INTO public.support_tickets (user_id, category, subject, priority)
  VALUES (p_user_id, p_category, p_subject, COALESCE(p_priority, 'normal'))
  RETURNING id INTO v_id;
  PERFORM public.admin_log('create_ticket', 'ticket', v_id::text, p_subject, NULL, NULL);
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_create_ticket(uuid, text, text, text) TO authenticated;

-- Unified ticket action. p_body: reply/note text; p_value: credits (add_credits);
-- p_assignee: assignee (assign).
CREATE OR REPLACE FUNCTION public.admin_ticket_action(
  p_ticket_id uuid, p_action text, p_body text DEFAULT NULL, p_value int DEFAULT 0,
  p_assignee text DEFAULT NULL, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid; v_total int;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT user_id INTO v_uid FROM public.support_tickets WHERE id = p_ticket_id;

  IF p_action = 'reply' OR p_action = 'note' THEN
    INSERT INTO public.ticket_messages (ticket_id, author_id, body, internal)
    VALUES (p_ticket_id, auth.uid(), p_body, p_action = 'note');
    UPDATE public.support_tickets SET status = CASE WHEN p_action = 'reply' THEN 'pending' ELSE status END, updated_at = now() WHERE id = p_ticket_id;
  ELSIF p_action = 'assign' THEN
    UPDATE public.support_tickets SET assignee = p_assignee, updated_at = now() WHERE id = p_ticket_id;
  ELSIF p_action = 'resolve' THEN
    UPDATE public.support_tickets SET status = 'resolved', updated_at = now() WHERE id = p_ticket_id;
  ELSIF p_action = 'reopen' THEN
    UPDATE public.support_tickets SET status = 'open', updated_at = now() WHERE id = p_ticket_id;
  ELSIF p_action = 'add_credits' THEN
    INSERT INTO public.credit_lots (user_id, kind, amount_remaining, amount_original, expires_at)
    VALUES (v_uid, 'promo', p_value, p_value, NULL);
    SELECT COALESCE(sum(amount_remaining),0) INTO v_total FROM public.credit_lots
      WHERE user_id = v_uid AND amount_remaining > 0 AND (expires_at IS NULL OR expires_at > now());
    INSERT INTO public.credit_transactions (user_id, kind, amount, action_key, description, balance_after)
    VALUES (v_uid, 'grant', p_value, 'support_credit', 'Support goodwill credits', v_total);
  ELSE
    RAISE EXCEPTION 'unknown action %', p_action;
  END IF;

  PERFORM public.admin_log('ticket_' || p_action, 'ticket', p_ticket_id::text, COALESCE(p_reason, p_body),
    NULL, jsonb_build_object('value', p_value, 'assignee', p_assignee));
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_ticket_action(uuid, text, text, int, text, text) TO authenticated;
