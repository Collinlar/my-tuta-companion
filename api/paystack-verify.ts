import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-side price -> credits map (spec section 7). The client never decides
// how many credits a payment is worth; we re-derive it from the amount that
// Paystack confirms was actually paid, so a tampered client cannot over-credit.
const CREDITS_BY_GHS: Record<number, number> = { 20: 50, 50: 140, 100: 320, 200: 700 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Payment verification is not configured on the server.' });
  }

  const { reference } = req.body as { reference?: string };
  if (!reference) {
    return res.status(400).json({ error: 'reference is required' });
  }

  // 1. Verify the transaction directly with Paystack (authoritative source).
  const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const vj = await vr.json();
  if (!vr.ok || !vj?.status || vj?.data?.status !== 'success') {
    return res.status(400).json({ error: 'Payment could not be verified.' });
  }

  const data = vj.data;
  const ghs = Math.round((data.amount || 0) / 100); // Paystack amount is in pesewas
  const credits = CREDITS_BY_GHS[ghs];
  const userId: string | undefined = data.metadata?.user_id;
  if (!credits || !userId) {
    return res.status(400).json({ error: 'This payment does not match a known credit bundle.' });
  }

  // 2. Grant credits idempotently (credit_purchase no-ops if this ref is done).
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.rpc('credit_purchase', {
    p_user_id: userId,
    p_provider_ref: reference,
    p_kind: 'bundle',
    p_credits: credits,
    p_amount_ghs: ghs,
  });
  if (error) {
    return res.status(500).json({ error: 'Payment verified but crediting failed. Contact support with your reference.' });
  }

  return res.status(200).json({ ok: true, credits, ghs });
}
