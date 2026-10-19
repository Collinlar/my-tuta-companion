import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Paystack server-to-server webhook. Activates subscriptions and grants monthly
// credits after Paystack confirms a charge. The HMAC check uses the exact raw
// body Paystack sent, so we must not re-stringify before verifying.
const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Not configured" }) };
  }

  // Netlify may base64-encode the body; decode to the exact bytes Paystack signed.
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : event.body ?? "";

  const signature = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (signature !== event.headers["x-paystack-signature"]) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid signature" }) };
  }

  let parsed: { event: string; data: Record<string, any> };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Map Paystack plan codes -> internal plan keys (set these in Netlify env).
  const planByCode: Record<string, string> = {};
  if (process.env.PAYSTACK_PLAN_STUDENT_PLUS) planByCode[process.env.PAYSTACK_PLAN_STUDENT_PLUS] = "student_plus";
  if (process.env.PAYSTACK_PLAN_TEACHER_PRO) planByCode[process.env.PAYSTACK_PLAN_TEACHER_PRO] = "teacher_pro";

  const data = parsed.data || {};
  const email: string | undefined = data.customer?.email || data.subscription?.customer?.email;

  async function userIdFor(): Promise<string | undefined> {
    if (data.metadata?.user_id) return data.metadata.user_id as string;
    if (!email) return undefined;
    const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
    return prof?.user_id;
  }

  try {
    if (parsed.event === "charge.success" || parsed.event === "invoice.payment_success" || parsed.event === "subscription.create") {
      const planCode: string | undefined = data.plan?.plan_code || data.plan_object?.plan_code || data.plan;
      const plan = planCode ? planByCode[planCode] : (data.metadata?.plan as string | undefined);
      const userId = await userIdFor();
      if (plan && userId) {
        const ref = data.reference || data.subscription_code || `${plan}_${Date.now()}`;
        await admin.rpc("apply_subscription_charge", { p_user_id: userId, p_plan: plan, p_provider_ref: ref });
      }
    } else if (parsed.event === "subscription.disable" || parsed.event === "subscription.not_renew" || parsed.event === "invoice.payment_failed") {
      const userId = await userIdFor();
      if (userId) await admin.rpc("cancel_subscription_state", { p_user_id: userId });
    }
  } catch {
    // Acknowledge anyway so Paystack does not hammer retries on a transient error;
    // reconciliation can be done from the payments/subscriptions tables.
  }

  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ received: true }) };
};

export { handler };
