import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { useNextBestAction, type NbaCandidate } from "./data";

/** "mytuta Today" — the single most valuable next step, plus quiet alternatives.
 * The centrepiece of the Home command centre (spec §6/§7). */
export default function NextActionCard() {
  const nav = useNavigate();
  const { data, isLoading } = useNextBestAction();
  const primary = data?.primary;
  const alts = (data?.alternatives || []).slice(0, 2);

  if (isLoading || !primary) return null;

  const go = (cand: NbaCandidate) => nav(cand.route);

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>mytuta today</div>
      <div style={{ background: "linear-gradient(135deg,#eaf5ef,#f3faf5)", border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: font.display, fontSize: 19, lineHeight: 1.25, color: c.ink, marginBottom: 8 }}>{primary.action}</div>
            <div style={{ fontSize: 14, color: c.soft, lineHeight: 1.5 }}>{primary.reason}</div>
          </div>
          <div style={{ flex: "none", textAlign: "right" }}>
            {primary.est_minutes ? <div style={{ fontSize: 12, color: c.faint, marginBottom: 10 }}>~{primary.est_minutes} min</div> : null}
            <button type="button" onClick={() => go(primary)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer", whiteSpace: "nowrap" }}>Start now</button>
          </div>
        </div>
        {alts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${c.greenTintBorder}` }}>
            <span style={{ fontSize: 12, color: c.faint, alignSelf: "center", marginRight: 2 }}>Or:</span>
            {alts.map((cand) => (
              <button key={cand.key} type="button" onClick={() => go(cand)} style={{ background: "#fff", border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 20, cursor: "pointer" }}>{cand.action}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
