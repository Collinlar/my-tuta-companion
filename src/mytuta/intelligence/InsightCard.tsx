import { useNavigate } from "react-router-dom";
import { c } from "../theme";
import { useLearningInsights } from "./data";

/** "mytuta noticed" — surfaces meaningful, actionable intelligence the learner
 * may not spot themselves (spec §6/§13). Renders nothing when there's nothing
 * worth saying. Limit keeps the Home screen calm. */
export default function InsightBand({ limit = 2 }: { limit?: number }) {
  const nav = useNavigate();
  const { data } = useLearningInsights();
  const insights = (data || []).slice(0, limit);
  if (insights.length === 0) return null;

  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>mytuta noticed</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((it) => (
          <div key={it.text} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "15px 17px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, fontSize: 13.5, color: c.ink, lineHeight: 1.5 }}>{it.text}</div>
            <button type="button" onClick={() => nav(it.action_route)} style={{ flex: "none", background: "none", border: `1px solid ${c.border}`, color: c.greenDark, fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>{it.action_label}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
