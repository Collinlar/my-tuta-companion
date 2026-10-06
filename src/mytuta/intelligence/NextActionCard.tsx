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
  const isPrereqGap    = primary.key === "prerequisite_gap";
  const isDecayReview  = primary.key === "decay_review";
  const isExplWeak     = primary.key === "explanation_weak";
  const isChallenge    = primary.key === "challenge";
  const isWarning      = isPrereqGap || isDecayReview || isExplWeak;

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>mytuta today</div>
      <div style={{
        background: isWarning ? "linear-gradient(135deg,#fef9ec,#fffbf2)" : isChallenge ? "linear-gradient(135deg,#f5f0ff,#ede9fb)" : "linear-gradient(135deg,#eaf5ef,#f3faf5)",
        border: `1px solid ${isWarning ? "#E8A020" : isChallenge ? "#c4b5fd" : c.greenTintBorder}`,
        borderRadius: 16, padding: "22px 24px",
      }}>
        {isPrereqGap && (
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#633806", background: "#FEF3E2", borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 12 }}>
            Foundation gap detected
          </div>
        )}
        {isDecayReview && (
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#633806", background: "#FEF3E2", borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 12 }}>
            Needs a refresh
          </div>
        )}
        {isExplWeak && (
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#633806", background: "#FEF3E2", borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 12 }}>
            Explanation not clicking
          </div>
        )}
        {isChallenge && (
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#5c2d91", background: "#f3e8ff", borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 12 }}>
            You are ready for a challenge
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: font.display, fontSize: 19, lineHeight: 1.25, color: c.ink, marginBottom: 8 }}>{primary.action}</div>
            <div style={{ fontSize: 14, color: c.soft, lineHeight: 1.5 }}>{primary.reason}</div>
            {isPrereqGap && primary.blocked_concept && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: "#633806" }}>
                Strengthen <strong>{primary.prerequisite}</strong> before continuing with <strong>{primary.blocked_concept}</strong>.
              </div>
            )}
          </div>
          <div style={{ flex: "none", textAlign: "right" }}>
            {primary.est_minutes ? <div style={{ fontSize: 12, color: c.faint, marginBottom: 10 }}>~{primary.est_minutes} min</div> : null}
            <button type="button" onClick={() => go(primary)} style={{ background: isWarning ? "#E8A020" : isChallenge ? "#7c3aed" : c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
              {isPrereqGap  ? `Learn ${primary.prerequisite ?? "prerequisite"} first`
               : isDecayReview ? "Review now"
               : isExplWeak    ? "Try another explanation"
               : isChallenge   ? "Join challenge"
               : "Start now"}
            </button>
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
