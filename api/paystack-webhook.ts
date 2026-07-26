import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Receive the raw body so the HMAC signature check matches Paystack exactly.
export const config = { api: { bodyParser: false } };

function readRaw(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Not configured' });

  const raw = await readRaw(req);
  const signature = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (signature !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(raw) as { event: string; data: Record<string, any> };
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Map Paystack plan codes -> internal plan keys (set these in Vercel env).
  const planByCode: Record<string, string> = {};
  if (process.env.PAYSTACK_PLAN_STUDENT_PLUS) planByCode[process.env.PAYSTACK_PLAN_STUDENT_PLUS] = 'student_plus';
  if (process.env.PAYSTACK_PLAN_TEACHER_PRO) planByCode[process.env.PAYSTACK_PLAN_TEACHER_PRO] = 'teacher_pro';

  const data = event.data || {};
  const email: string | undefined = data.customer?.email || data.subscription?.customer?.email;

  async function userIdFor(): Promise<string | undefined> {
    if (data.metadata?.user_id) return data.metadata.user_id as string;
    if (!email) return undefined;
    const { data: prof } = await admin.from('profiles').select('user_id').eq('email', email).maybeSingle();
    return prof?.user_id;
  }

  try {
    if (event.event === 'charge.success' || event.event === 'invoice.payment_success' || event.event === 'subscription.create') {
      const planCode: string | undefined = data.plan?.plan_code || data.plan_object?.plan_code || data.plan;
      const plan = planCode ? planByCode[planCode] : (data.metadata?.plan as string | undefined);
      const userId = await userIdFor();
      if (plan && userId) {
        const ref = data.reference || data.subscription_code || `${plan}_${Date.now()}`;
        await admin.rpc('apply_subscription_charge', { p_user_id: userId, p_plan: plan, p_provider_ref: ref });
      }
    } else if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew' || event.event === 'invoice.payment_failed') {
      const userId = await userIdFor();
      if (userId) await admin.rpc('cancel_subscription_state', { p_user_id: userId });
    }
  } catch {
    // Acknowledge anyway so Paystack does not hammer retries on a transient error;
    // reconciliation can be done from the payments/subscriptions tables.
  }

  return res.status(200).json({ received: true });
}
