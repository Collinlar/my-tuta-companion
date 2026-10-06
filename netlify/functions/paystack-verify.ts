import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const CREDITS_BY_GHS: Record<number, number> = { 20: 50, 50: 140, 100: 320, 200: 700 };

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Payment verification is not configured on the server." }) };
  }

  let body: { reference?: string };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { reference } = body;
  if (!reference) {
    return { statusCode: 400, body: JSON.stringify({ error: "reference is required" }) };
  }

  const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const vj = await vr.json();
  if (!vr.ok || !vj?.status || vj?.data?.status !== "success") {
    return { statusCode: 400, body: JSON.stringify({ error: "Payment could not be verified." }) };
  }

  const data = vj.data;
  const ghs = Math.round((data.amount || 0) / 100);
  const credits = CREDITS_BY_GHS[ghs];
  const userId: string | undefined = data.metadata?.user_id;
  if (!credits || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: "This payment does not match a known credit bundle." }) };
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.rpc("credit_purchase", {
    p_user_id: userId,
    p_provider_ref: reference,
    p_kind: "bundle",
    p_credits: credits,
    p_amount_ghs: ghs,
  });
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Payment verified but crediting failed. Contact support with your reference." }) };
  }

  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, credits, ghs }) };
};

export { handler };
