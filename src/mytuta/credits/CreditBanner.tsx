import { useNavigate } from "react-router-dom";
import { c } from "../theme";
import { useWalletSummary } from "../data/queries";
import { useRole } from "../useRole";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

/** A single contextual credit nudge for the top of Home (spec section 18 / 19).
 * Renders nothing when the wallet is healthy. */
export default function CreditBanner() {
  const nav = useNavigate();
  const [role] = useRole();
  const { data: w } = useWalletSummary();
  if (!w) return null;

  const firstAction = role === "teacher" ? "/teacher/experiences/new" : "/student/learn";
  const firstLabel = role === "teacher" ? "Create your first experience" : "Create your first Mastery Path";
  const expDays = daysUntil(w.nextExpiry);

  let tone: "green" | "amber" | "red";
  let title: string;
  let body: string;
  let cta: { label: string; to: string };

  if (w.total === 0) {
    tone = "red";
    title = "You're out of credits";
    body = "Everything you created is still here. Buy credits or subscribe when you're ready to create more.";
    cta = { label: "See options", to: "/pricing" };
  } else if (w.welcome > 0 && w.expiringAmount > 0 && expDays !== null && (w.expiringAmount <= 10 || expDays <= 3)) {
    tone = "amber";
    title = `${w.expiringAmount} welcome credit${w.expiringAmount === 1 ? "" : "s"} left`;
    body = `Use ${w.expiringAmount === 1 ? "it" : "them"} before ${w.expiringAmount === 1 ? "it expires" : "they expire"} in ${expDays} day${expDays === 1 ? "" : "s"}.`;
    cta = { label: firstLabel, to: firstAction };
  } else if (w.welcome > 0 && w.purchased === 0 && w.subscription === 0) {
    tone = "green";
    title = `${w.welcome} welcome Tuta Credit${w.welcome === 1 ? "" : "s"}`;
    body = expDays !== null ? `Valid for ${expDays} more day${expDays === 1 ? "" : "s"}. Put them to work.` : "Put them to work.";
    cta = { label: firstLabel, to: firstAction };
  } else {
    return null;
  }

  const bg = tone === "red" ? c.redTint : tone === "amber" ? c.amberTint : c.greenTint;
  const border = tone === "red" ? "#f0c7b6" : tone === "amber" ? c.amberBorder : c.greenTintBorder;
  const fg = tone === "red" ? c.red : tone === "amber" ? c.amber : c.greenDark;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 22 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: fg }}>{title}</div>
        <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.5, marginTop: 2 }}>{body}</div>
      </div>
      <button type="button" onClick={() => nav(cta.to)} style={{ flex: "none", background: fg, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 10, cursor: "pointer" }}>{cta.label}</button>
    </div>
  );
}
