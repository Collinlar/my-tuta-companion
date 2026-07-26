// Single source of truth for the four credit bundles (spec section 7). The
// checkout and the pricing page both read this; the server independently
// re-derives price→credits so a tampered client can't over-credit.

export interface CreditBundle {
  id: string;
  name: string;
  priceGhs: number;
  credits: number;
  positioning: string;
  featured?: boolean;
}

export const creditBundles: CreditBundle[] = [
  { id: "starter", name: "Starter", priceGhs: 20, credits: 50, positioning: "Try a few learning activities." },
  { id: "study", name: "Study", priceGhs: 50, credits: 140, positioning: "Regular revision and solving." },
  { id: "power", name: "Power", priceGhs: 100, credits: 320, positioning: "Frequent learning or creation.", featured: true },
  { id: "max", name: "Max", priceGhs: 200, credits: 700, positioning: "Heavy student or teacher usage." },
];

export function bundleById(id: string): CreditBundle | undefined {
  return creditBundles.find((b) => b.id === id);
}

/**
 * Live bundles from the admin-configurable credit_bundles table, falling back
 * to the hardcoded list above if the table is empty or unreachable. The server
 * (api/paystack-verify.ts) still re-derives price→credits independently, so a
 * tampered client can never over-credit regardless of what this returns.
 */
export async function fetchBundles(): Promise<CreditBundle[]> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("credit_bundles")
    .select("id, name, price_ghs, credits, positioning, featured, active")
    .eq("active", true)
    .order("sort");
  if (error || !data || data.length === 0) return creditBundles;
  return data.map((b) => ({
    id: b.id, name: b.name, priceGhs: Number(b.price_ghs), credits: b.credits,
    positioning: b.positioning ?? "", featured: b.featured ?? false,
  }));
}
