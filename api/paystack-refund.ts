import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Admin-only: refund a Paystack transaction. The caller's Supabase JWT is used
// to verify they are an active admin (via current_user_is_admin under RLS), then
// Paystack's refund API is called with the server secret, and the refund is
// recorded + audited via admin_record_refund (acting as that admin).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!secret || !supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Refunds are not configured on the server.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization' });

  const { reference, amountGhs, reason } = req.body as { reference?: string; amountGhs?: number; reason?: string };
  if (!reference || !amountGhs || !reason) {
    return res.status(400).json({ error: 'reference, amountGhs and reason are required' });
  }

  // Act as the calling user so current_user_is_admin() + admin_record_refund
  // see the correct auth.uid().
  const asUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: isAdmin, error: adminErr } = await asUser.rpc('current_user_is_admin');
  if (adminErr || isAdmin !== true) return res.status(403).json({ error: 'Admin access required' });

  // Paystack refunds accept the amount in the smallest currency unit (pesewas).
  const pr = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: reference, amount: Math.round(amountGhs * 100) }),
  });
  const pj = await pr.json();
  const ok = pr.ok && pj?.status === true;

  const { error: recErr } = await asUser.rpc('admin_record_refund', {
    p_payment_ref: reference, p_amount: amountGhs, p_reason: reason, p_status: ok ? 'success' : 'failed',
  });
  if (recErr) return res.status(500).json({ error: 'Refund executed but recording failed. Reconcile manually.' });

  if (!ok) return res.status(400).json({ error: pj?.message || 'Paystack declined the refund.' });
  return res.status(200).json({ ok: true });
}
