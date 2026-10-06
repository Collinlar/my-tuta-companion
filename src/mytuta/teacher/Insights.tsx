import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { Bar, Loading } from "../ui";
import { useLayout, pageBox } from "../layout";
import { useTeacherDashboard } from "../data/queries";
import { useClassMisconceptionSummary, type MisconceptionPattern } from "./data/interventionQueries";

function progressColor(status: string): [string, string] {
  switch (status) {
    case "Mastered": return [c.plum, c.plumTint];
    case "In progress": return [c.blue, c.blueTint];
    case "Needs support": return [c.amber, c.amberTint];
    default: return [c.faint, c.paper];
  }
}

export default function Insights() {
  const L = useLayout();
  const nav = useNavigate();
  const { data: dash, isLoading } = useTeacherDashboard();
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { data: classMisconceptions, isLoading: cmLoading } = useClassMisconceptionSummary(selectedClassId);

  // Use class-level grouping when a class is selected; fall back to dashboard data.
  const misconceptions = selectedClassId && classMisconceptions
    ? classMisconceptions.map((p: MisconceptionPattern) => ({
        concept: p.concept_name,
        pct:     `${p.pct_of_class}% of class`,
        detail:  `${p.pattern}: ${p.detail} (${p.student_count} student${p.student_count === 1 ? "" : "s"})`,
      }))
    : (dash?.misconceptions || []);

  if (isLoading) return <Loading label="Loading insights…" />;

  const insightStats = [
    { value: String(dash?.activeClasses ?? 0), label: "Active classes" },
    { value: String(dash?.students ?? 0), label: "Students" },
    { value: `${dash?.reachingSecure ?? 0}%`, label: "Reaching Secure" },
    { value: String(dash?.conceptsTaught ?? 0), label: "Concepts taught" },
  ];
  const classSkills = dash?.classSkills || [];
  const classProgress = dash?.classProgress || [];
  const questionAnalysis = dash?.questionAnalysis || [];

  const classes = (dash as (typeof dash & { classes?: { id: string; name: string }[] }))?.classes ?? [];

  return (
    <div style={pageBox(L.pad, 1020)}>
      {classes.length > 0 && (
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: c.faint }}>Filter by class:</span>
          <select value={selectedClassId ?? ""} onChange={(e) => setSelectedClassId(e.target.value || null)}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border2}`, background: c.surface, color: c.ink, cursor: "pointer" }}>
            <option value="">All classes</option>
            {classes.map((cls: { id: string; name: string }) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
          {cmLoading && <span style={{ fontSize: 12, color: c.faint }}>Loading...</span>}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: L.gStats, gap: 12, marginBottom: 26 }}>
        {insightStats.map((s) => (
          <div key={s.label} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 17 }}>
            <div style={{ fontFamily: font.display, fontSize: 26, lineHeight: 1, color: c.green }}>{s.value}</div>
            <div style={{ fontSize: 12, color: c.faint, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 22, marginBottom: 26 }}>
        <div>
          <div style={sec}>Where understanding breaks down</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {misconceptions.length === 0 && <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "16px 17px", fontSize: 13, color: c.muted }}>Misconception insights appear as students complete work.</div>}
            {misconceptions.map((m) => (
              <div key={m.concept} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "16px 17px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.concept}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.amber }}>{m.pct}</span>
                </div>
                <div style={{ fontSize: 13, color: c.soft, lineHeight: 1.5, marginBottom: 12 }}>{m.detail}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => nav("/teacher/experiences/new")} style={actionBtn}>Reteach concept</button>
                  <button type="button" onClick={() => nav("/teacher/experiences/new")} style={actionBtn}>Create support path</button>
                  <button type="button" onClick={() => nav("/teacher/assessments/new")} style={actionBtn}>Retest students</button>
                  <button type="button" onClick={() => nav(`/teacher/intervention/new?concept=${encodeURIComponent(m.concept)}&misconception=${encodeURIComponent(m.detail)}`)} style={{ ...actionBtn, background: "#E8A020", color: "#fff", fontWeight: 600 }}>Create intervention</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={sec}>Skill breakdown across classes</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, marginBottom: 18 }}>
            {classSkills.length === 0 && <div style={{ fontSize: 13.5, color: c.muted }}>Skill data builds as classes complete assessments.</div>}
            {classSkills.map((s) => (
              <div key={s.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: c.faint }}>{s.pct}%</span>
                </div>
                <Bar pct={s.pct} color={s.color} />
              </div>
            ))}
          </div>
          {misconceptions.length === 0 && (
            <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.55 }}>Create a class and assign work to see where understanding breaks down.</div>
              <button type="button" onClick={() => nav("/teacher/classes")} style={{ marginTop: 12, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 16px", borderRadius: 10, cursor: "pointer" }}>Create a class</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 22 }}>
        <div>
          <div style={sec}>Class progress</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
            {classProgress.length === 0 ? (
              <div style={{ padding: "16px 17px", fontSize: 13, color: c.muted }}>Progress appears once students in your classes start working through concepts.</div>
            ) : (
              classProgress.map((s, i) => {
                const [fg, bg] = progressColor(s.status);
                return (
                  <div key={s.name + i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", borderTop: i > 0 ? `1px solid ${c.divider}` : "none" }}>
                    <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: s.color, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.mark}</span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: fg, background: bg, padding: "4px 10px", borderRadius: 20 }}>{s.status}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div>
          <div style={sec}>Question analysis</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
            {questionAnalysis.length === 0 ? (
              <div style={{ padding: "16px 17px", fontSize: 13, color: c.muted }}>Question-level results appear once students submit assessments.</div>
            ) : (
              questionAnalysis.map((q, i) => {
                const open = expandedQ === i;
                return (
                  <div key={i} style={{ borderTop: i > 0 ? `1px solid ${c.divider}` : "none" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedQ(open ? null : i)}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: font.body }}
                    >
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.prompt}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: q.pctCorrect < 50 ? c.amber : c.green, flex: "none" }}>{q.pctCorrect}%</span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 16px 14px", fontSize: 12.5, color: c.soft, lineHeight: 1.6 }}>
                        <div style={{ marginBottom: 3 }}><strong>Assessment:</strong> {q.assessmentTitle}</div>
                        <div style={{ marginBottom: 3 }}><strong>Attempts:</strong> {q.attempts}</div>
                        {q.mostWrongOption && <div><strong>Most-picked wrong answer:</strong> {q.mostWrongOption}</div>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const sec = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 } as const;
const actionBtn = { background: c.paper, border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 600, fontSize: 12, padding: "7px 12px", borderRadius: 9, cursor: "pointer" } as const;
