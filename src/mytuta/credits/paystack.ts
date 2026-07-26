import { supabase } from "@/integrations/supabase/client";
import type { CreditBundle } from "./bundles";

const INLINE_SRC = "https://js.paystack.co/v1/inline.js";

interface PaystackPop {
  setup(opts: {
    key: string;
    email: string;
    amount: number; // pesewas
    currency: string;
    ref: string;
    plan?: string; // plan code -> creates a subscription
    metadata?: Record<string, unknown>;
    callback: (resp: { reference: string }) => void;
    onClose: () => void;
  }): { openIframe: () => void };
}
declare global {
  interface Window { PaystackPop?: PaystackPop }
}

function loadInline(): Promise<PaystackPop> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(window.PaystackPop); return; }
    const s = document.createElement("script");
    s.src = INLINE_SRC;
    s.async = true;
    s.onload = () => (window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error("Paystack failed to load")));
    s.onerror = () => reject(new Error("Could not reach Paystack. Check your connection."));
    document.head.appendChild(s);
  });
}

export type CheckoutResult = "success" | "closed" | "unconfigured";

/** Runs the Paystack popup for a bundle, then server-verifies the reference
 * (which is what actually grants credits). Resolves once verification returns. */
export async function buyBundle(bundle: CreditBundle): Promise<CheckoutResult> {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  if (!publicKey) return "unconfigured";

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) throw new Error("Sign in first to buy credits.");

  const pop = await loadInline();
  const reference = `mytuta_${user.id.slice(0, 8)}_${Date.now()}`;

  return new Promise<CheckoutResult>((resolve, reject) => {
    const handle = pop.setup({
      key: publicKey,
      email: user.email!,
      amount: bundle.priceGhs * 100,
      currency: "GHS",
      ref: reference,
      metadata: { user_id: user.id, bundle: bundle.id },
      callback: (resp) => {
        // Verify server-side; credits are granted there, not by the client.
        fetch("/api/paystack-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: resp.reference }),
        })
          .then(async (r) => {
            if (!r.ok) {
              const j = await r.json().catch(() => ({}));
              throw new Error(j.error || "Payment verification failed.");
            }
            resolve("success");
          })
          .catch(reject);
      },
      onClose: () => resolve("closed"),
    });
    handle.openIframe();
  });
}

const PLAN_CODES: Record<string, string | undefined> = {
  student_plus: import.meta.env.VITE_PAYSTACK_PLAN_STUDENT_PLUS as string | undefined,
  teacher_pro: import.meta.env.VITE_PAYSTACK_PLAN_TEACHER_PRO as string | undefined,
};

/** Starts a Paystack subscription for a plan. The webhook (server) is what
 * activates the subscription + grants monthly credits, so this only opens the
 * popup; the client refetches subscription state shortly after. */
export async function subscribePlan(plan: "student_plus" | "teacher_pro"): Promise<CheckoutResult> {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  const planCode = PLAN_CODES[plan];
  if (!publicKey || !planCode) return "unconfigured";

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) throw new Error("Sign in first to subscribe.");

  const pop = await loadInline();
  return new Promise<CheckoutResult>((resolve) => {
    const handle = pop.setup({
      key: publicKey,
      email: user.email!,
      amount: 0, // amount comes from the plan
      currency: "GHS",
      ref: `mytuta_sub_${user.id.slice(0, 8)}_${Date.now()}`,
      plan: planCode,
      metadata: { user_id: user.id, plan },
      callback: () => resolve("success"),
      onClose: () => resolve("closed"),
    });
    handle.openIframe();
  });
}
