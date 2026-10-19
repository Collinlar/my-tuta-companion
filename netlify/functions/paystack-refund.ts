import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

// Admin-only: refund a Paystack transaction. The caller's Supabase JWT proves
// they are an active admin (current_user_is_admin under RLS), then Paystack's
// refund API is called with the server secret and the refund is recorded +
// audited via admin_record_refund, acting as that admin.
const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!secret || !supabaseUrl || !anonKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Refunds are not configured on the server." }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return { statusCode: 401, body: JSON.stringify({ error: "Missing authorization" }) };

  let body: { reference?: string; amountGhs?: number; reason?: string };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }
  const { reference, amountGhs, reason } = body;
  if (!reference || !amountGhs || !reason) {
    return { statusCode: 400, body: JSON.stringify({ error: "reference, amountGhs and reason are required" }) };
  }

  // Act as the calling user so current_user_is_admin() + admin_record_refund
  // see the correct auth.uid().
  const asUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: isAdmin, error: adminErr } = await asUser.rpc("current_user_is_admin");
  if (adminErr || isAdmin !== true) return { statusCode: 403, body: JSON.stringify({ error: "Admin access required" }) };

  // Paystack refunds accept the amount in the smallest currency unit (pesewas).
  const pr = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: reference, amount: Math.round(amountGhs * 100) }),
  });
  const pj = await pr.json();
  const ok = pr.ok && pj?.status === true;

  const { error: recErr } = await asUser.rpc("admin_record_refund", {
    p_payment_ref: reference, p_amount: amountGhs, p_reason: reason, p_status: ok ? "success" : "failed",
  });
  if (recErr) return { statusCode: 500, body: JSON.stringify({ error: "Refund executed but recording failed. Reconcile manually." }) };

  if (!ok) return { statusCode: 400, body: JSON.stringify({ error: pj?.message || "Paystack declined the refund." }) };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
};

export { handler };
