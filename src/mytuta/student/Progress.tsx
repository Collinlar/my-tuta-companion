import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { Bar, Loading } from "../ui";
import { useLayout, pageBox } from "../layout";
import { useLearnerStats, useMasteryMap, useMasteryPaths, useDueRecallCount, useDepthMap } from "../data/queries";
import { DEPTHS, DEPTH_ORDER, DEPTH_LABEL, type Depth, type DepthState } from "../data/depth";
import LearningProfile from "../intelligence/LearningProfile";

const SECURE_LEVELS = ["Secure", "Secured", "Mastered"];

// Dot colour per depth state, or a faint outline when the depth is not started
// or beyond the concept's max_depth.
function depthDot(state: DepthState | "unavailable"): { bg: string; border: string } {
  switch (state) {
    case "secure": return { bg: c.green, border: c.green };
    case "in_progress": return { bg: c.blue, border: c.blue };
    case "needs_reinforcement": return { bg: c.amber, border: c.amber };
    case "unavailable": return { bg: "transparent", border: c.border2 };
    default: return { bg: "transparent", border: "#cbc3b2" }; // not_started
  }
}

export default function Progress() {
  const L = useLayout();
  const nav = useNavigate();
  const { data: stats, isLoading } = useLearnerStats();
  const { data: map } = useMasteryMap();
  const { data: paths } = useMasteryPaths();
  const { data: dueCount } = useDueRecallCount();
  const { data: depthMap } = useDepthMap();

  if (isLoading) return <Loading label="Reading your path progress…" />;

  const progressStats = [
    { value: String(stats?.mastered ?? 0), label: "Mastered" },
    { value: String(stats?.developing ?? 0), label: "Developing" },
    { value: `${stats?.accuracy ?? 0}%`, label: "Path progress" },
    { value: String(stats?.streak ?? 0), label: "Day streak" },
  ];
  const skills = stats?.skills?.length
    ? stats.skills
    : (paths || []).map((p) => ({ name: p.concept, pct: p.pct }));
  const masteryMap = (map && map.length > 0)
    ? map
    : (paths || []).map((p) => ({ concept: p.concept, subject: p.subject, level: p.level }));
  const depthByName = new Map((depthMap || []).map((d) => [d.name.toLowerCase(), d]));

  return (
    <div style={pageBox(L.pad, 1020)}>
      <LearningProfile />

      <div style={sec}>Your numbers</div>
      <div style={{ display: "grid", gridTemplateColumns: L.gStats, gap: 12, marginBottom: 28 }}>
        {progressStats.map((s) => (
          <div key={s.label} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 17 }}>
            <div style={{ fontFamily: font.display, fontSize: 28, lineHeight: 1, color: c.green }}>{s.value}</div>
            <div style={{ fontSize: 12, color: c.faint, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: L.gSide, gap: 22 }}>
        <div>
          <div style={sec}>Mastery map</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, marginBottom: 22 }}>
            {masteryMap.length === 0 && <div style={{ fontSize: 13.5, color: c.muted }}>Start a mastery path to see it here.</div>}
            {masteryMap.map((m, i) => {
              const d = depthByName.get(m.concept.toLowerCase());
              const maxDepth = d?.maxDepth || "foundation";
              const foundationState: DepthState = (d?.depths.foundation as DepthState) ||
                (SECURE_LEVELS.includes(m.level) ? "secure" : "in_progress");
              const stateOf = (dep: Depth): DepthState =>
                dep === "foundation" ? foundationState : ((d?.depths[dep] as DepthState) || "not_started");
              const overall = [...DEPTHS].reverse().find((dep) => stateOf(dep) === "secure");
              const reviewDue = d?.nextReviewAt ? new Date(d.nextReviewAt).getTime() <= Date.now() : false;
              return (
                <div key={m.concept + i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: i < masteryMap.length - 1 ? `1px solid ${c.divider}` : "none" }}>
                  <div style={{ display: "flex", gap: 5, flex: "none" }}>
                    {DEPTHS.map((dep) => {
                      const available = DEPTH_ORDER[dep] <= DEPTH_ORDER[(["foundation", "applied", "advanced"].includes(maxDepth) ? maxDepth : "foundation") as Depth];
                      const dot = depthDot(available ? stateOf(dep) : "unavailable");
                      return <span key={dep} title={DEPTH_LABEL[dep]} style={{ width: 11, height: 11, borderRadius: "50%", background: dot.bg, border: `1.5px solid ${dot.border}`, boxSizing: "border-box" }} />;
                    })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.concept}</div>
                    <div style={{ fontSize: 12, color: c.faint }}>{m.subject}</div>
                  </div>
                  {reviewDue && <span style={{ fontSize: 10.5, fontWeight: 600, color: c.amber, background: c.amberTint, padding: "3px 8px", borderRadius: 20, flex: "none" }}>review due</span>}
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: c.greenDark, background: c.greenTint, padding: "4px 11px", borderRadius: 20, width: 92, textAlign: "center", flex: "none" }}>{overall ? DEPTH_LABEL[overall] : "Foundation"}</span>
                </div>
              );
            })}
            {masteryMap.length > 0 && (
              <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${c.divider}`, fontSize: 11.5, color: c.faint, flexWrap: "wrap" }}>
                {DEPTHS.map((dep, k) => (
                  <span key={dep} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: k === 0 ? c.green : "transparent", border: `1.5px solid ${k === 0 ? c.green : "#cbc3b2"}`, boxSizing: "border-box" }} />
                    {DEPTH_LABEL[dep]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div style={sec}>Skill profile</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, marginBottom: 22 }}>
            {skills.length === 0 && <div style={{ fontSize: 13.5, color: c.muted }}>Your skill profile builds as you practise.</div>}
            {skills.map((s) => (
              <div key={s.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: c.faint }}>{s.pct}%</span>
                </div>
                <Bar pct={s.pct} />
              </div>
            ))}
          </div>
          <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 9 }}>{(dueCount ?? 0) > 0 ? "Review due" : "Keep practising"}</div>
            <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.55 }}>
              {masteryMap.length === 0
                ? "Start a mastery path to unlock review sessions and skill tracking."
                : (dueCount ?? 0) > 0
                  ? `${dueCount} recall card${dueCount === 1 ? "" : "s"} due, across every concept you've studied. A short review session keeps them secure.`
                  : "You're caught up on recall. Open Learn to continue a path."}
            </div>
            <button
              type="button"
              onClick={() => nav(masteryMap.length === 0 ? "/student/learn" : (dueCount ?? 0) > 0 ? "/student/review" : "/student/learn")}
              style={{ marginTop: 14, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}
            >
              {masteryMap.length === 0 ? "Start a path" : (dueCount ?? 0) > 0 ? "Start review" : "Continue learning"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const sec = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 } as const;
