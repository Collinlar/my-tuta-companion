import { useNavigate } from "react-router-dom";
import { c, font } from "./theme";
import { Loading } from "./ui";
import { useWalletSummary, useCreditTransactions } from "./data/queries";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

function txnColor(amount: number): string {
  return amount >= 0 ? c.green : c.soft;
}

export default function Wallet() {
  const nav = useNavigate();
  const { data: wallet, isLoading } = useWalletSummary();
  const { data: txns } = useCreditTransactions();

  if (isLoading || !wallet) return <Loading label="Opening your wallet…" />;

  const expiryDays = daysUntil(wallet.nextExpiry);
  const buckets: { label: string; value: number; note?: string }[] = [
    { label: "Welcome", value: wallet.welcome, note: expiryDays !== null && wallet.expiringAmount > 0 ? `expires in ${expiryDays} day${expiryDays === 1 ? "" : "s"}` : undefined },
    { label: "Subscription", value: wallet.subscription },
    { label: "Purchased", value: wallet.purchased, note: "never expires" },
  ];
  if (wallet.promo > 0) buckets.unshift({ label: "Promotional", value: wallet.promo });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Your wallet</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>Tuta Credits power AI creation, guided solving and premium experiences. Learning access stays free.</div>

      <div style={{ background: "linear-gradient(160deg,#2e9e6b,#1f7d53)", borderRadius: 18, padding: "26px 26px", color: "#fff", marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.85, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Available</div>
        <div style={{ fontFamily: font.display, fontSize: 44, lineHeight: 1 }}>{wallet.total}</div>
        <div style={{ fontSize: 13.5, opacity: 0.9, marginTop: 6 }}>Tuta Credits{expiryDays !== null && wallet.expiringAmount > 0 ? ` · ${wallet.expiringAmount} expire in ${expiryDays} day${expiryDays === 1 ? "" : "s"}` : ""}</div>
        <button type="button" onClick={() => nav("/pricing")} style={{ marginTop: 18, background: "#fff", color: c.greenDark, border: "none", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 11, cursor: "pointer" }}>Buy credits</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${buckets.length},1fr)`, gap: 12, marginBottom: 30 }}>
        {buckets.map((b) => (
          <div key={b.label} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "15px 16px" }}>
            <div style={{ fontFamily: font.display, fontSize: 22, color: c.green }}>{b.value}</div>
            <div style={{ fontSize: 12, color: c.faint, marginTop: 4 }}>{b.label}</div>
            {b.note && <div style={{ fontSize: 11, color: c.amber, marginTop: 3 }}>{b.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Usage history</div>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
        {(txns || []).length === 0 ? (
          <div style={{ padding: "16px 18px", fontSize: 13, color: c.muted }}>No credit activity yet.</div>
        ) : (
          (txns || []).map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderTop: i > 0 ? `1px solid ${c.divider}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: c.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                <div style={{ fontSize: 11.5, color: c.faint }}>{new Date(t.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: txnColor(t.amount), width: 52, textAlign: "right" }}>{t.amount >= 0 ? "+" : ""}{t.amount}</div>
              <div style={{ fontSize: 12, color: c.faint, width: 44, textAlign: "right" }}>{t.balanceAfter}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
