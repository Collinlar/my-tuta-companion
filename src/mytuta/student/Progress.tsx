import { useNavigate } from "react-router-dom";
import { c, font, level } from "../theme";
import { Bar, Loading } from "../ui";
import { useLearnerStats, useMasteryMap, useMasteryPaths, useDueRecallCount } from "../data/queries";
import LearningProfile from "../intelligence/LearningProfile";

export default function Progress() {
  const nav = useNavigate();
  const { data: stats, isLoading } = useLearnerStats();
  const { data: map } = useMasteryMap();
  const { data: paths } = useMasteryPaths();
  const { data: dueCount } = useDueRecallCount();

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

  return (
    <div style={{ maxWidth: 1020, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
      <LearningProfile />

      <div style={sec}>Your numbers</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {progressStats.map((s) => (
          <div key={s.label} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 17 }}>
            <div style={{ fontFamily: font.display, fontSize: 28, lineHeight: 1, color: c.green }}>{s.value}</div>
            <div style={{ fontSize: 12, color: c.faint, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22 }}>
        <div>
          <div style={sec}>Mastery map</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, marginBottom: 22 }}>
            {masteryMap.length === 0 && <div style={{ fontSize: 13.5, color: c.muted }}>Start a mastery path to see it here.</div>}
            {masteryMap.map((m, i) => {
              const [fg, bg] = level(m.level);
              const path = (paths || []).find((p) => p.concept.toLowerCase() === m.concept.toLowerCase());
              return (
                <div key={m.concept + i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: i < masteryMap.length - 1 ? `1px solid ${c.divider}` : "none" }}>
                  <span style={{ width: 9, height: 9, flex: "none", borderRadius: "50%", background: fg }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.concept}</div>
                    <div style={{ fontSize: 12, color: c.faint }}>{m.subject}{path ? ` · Stage ${(path.currentStage ?? 0) + 1}` : ""}</div>
                  </div>
                  {path && <div style={{ width: 72 }}><Bar pct={path.pct} color={fg} height={6} /></div>}
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: fg, background: bg, padding: "4px 11px", borderRadius: 20, width: 88, textAlign: "center" }}>{m.level}</span>
                </div>
              );
            })}
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
