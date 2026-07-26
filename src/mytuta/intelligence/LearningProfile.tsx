import { useState } from "react";
import { c, font } from "../theme";
import { useLearnerModel, useGoals, useSetGoal, useUpdateGoal, useCorrectProfile } from "./data";

const SKILL_LABEL: Record<string, string> = {
  recall: "Recall", calculation: "Calculation", reasoning: "Reasoning",
  application: "Application", knowledge: "Concept knowledge",
};
const MISTAKE_LABEL: Record<string, string> = {
  concept: "choosing the right concept", method: "picking a method",
  formula: "selecting the right formula", calculation: "calculation accuracy",
  unit: "units", interpretation: "interpreting word problems",
  incomplete: "finishing your reasoning",
};
const SUPPORT_ORDER = ["full", "guided", "light", "independent"] as const;
const SUPPORT_LABEL: Record<string, string> = {
  full: "Full guidance", guided: "Guided — hints when you need them",
  light: "Light — mostly on your own", independent: "Independent practice",
};

function whatHelps(support: string, prefs: Record<string, unknown>): string[] {
  const fromPrefs = Array.isArray(prefs.what_helps) ? (prefs.what_helps as string[]) : null;
  if (fromPrefs && fromPrefs.length) return fromPrefs;
  if (support === "full" || support === "guided") return ["Worked examples", "Step-by-step guidance", "Short practice sets"];
  if (support === "light") return ["Worked examples", "A hint only when stuck"];
  return ["Independent practice", "Harder questions after two correct"];
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 9 }}>{title}</div>
      {children}
    </div>
  );
}
function Pill({ text, tone = "neutral" }: { text: string; tone?: "green" | "amber" | "neutral" }) {
  const map = { green: [c.greenDark, c.greenTint], amber: [c.amber, c.amberTint], neutral: [c.soft, c.surface] } as const;
  const [fg, bg] = map[tone];
  return <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 500, color: fg, background: bg, border: `1px solid ${c.border2}`, padding: "5px 11px", borderRadius: 8, marginRight: 6, marginBottom: 6 }}>{text}</span>;
}

/** The living Student Learning Profile (spec §3/§12): what mytuta currently
 * understands, and the learner can correct it. Rendered inside Progress — no
 * new nav item. */
export default function LearningProfile() {
  const { data: model } = useLearnerModel();
  const { data: goals } = useGoals();
  const setGoal = useSetGoal();
  const updateGoal = useUpdateGoal();
  const correct = useCorrectProfile();
  const [newGoal, setNewGoal] = useState("");
  const [adding, setAdding] = useState(false);

  if (!model) return null;

  const strengths = (model.strengths || []).map((s) => SKILL_LABEL[s] || s);
  const challenges = (model.challenges || []).map((s) => SKILL_LABEL[s] || s);
  if (model.top_mistake && MISTAKE_LABEL[model.top_mistake]) challenges.push(MISTAKE_LABEL[model.top_mistake]);
  const helps = whatHelps(model.support_level, model.prefs || {});
  const supportIdx = SUPPORT_ORDER.indexOf(model.support_level as typeof SUPPORT_ORDER[number]);

  const shiftSupport = (dir: -1 | 1) => {
    const next = SUPPORT_ORDER[Math.max(0, Math.min(SUPPORT_ORDER.length - 1, supportIdx + dir))];
    correct.mutate({ support_level: next, corrections: { ...model.corrections, support_adjusted: true } });
  };
  const addGoal = () => {
    const t = newGoal.trim();
    if (!t) return;
    setGoal.mutate({ title: t });
    setNewGoal(""); setAdding(false);
  };

  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "22px 24px", marginBottom: 26 }}>
      <div style={{ fontFamily: font.display, fontSize: 18, marginBottom: 4 }}>What mytuta understands about your learning</div>
      <div style={{ fontSize: 13, color: c.muted, marginBottom: 20 }}>{model.summary || "This grows as you learn. You can correct anything that doesn't look right."}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Col title="Current strengths">
          {strengths.length ? strengths.map((s) => <Pill key={s} text={s} tone="green" />) : <span style={{ fontSize: 13, color: c.faint }}>Building as you practise.</span>}
        </Col>
        <Col title="Current challenges">
          {challenges.length ? challenges.map((s) => <Pill key={s} text={s} tone="amber" />) : <span style={{ fontSize: 13, color: c.faint }}>None flagged yet.</span>}
        </Col>
        <Col title="What helps you most">
          {helps.map((s) => <Pill key={s} text={s} />)}
        </Col>
        <Col title="Recommended support level">
          <div style={{ fontSize: 13.5, fontWeight: 500, color: c.ink, marginBottom: 10 }}>{SUPPORT_LABEL[model.support_level] || model.support_level}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => shiftSupport(-1)} disabled={supportIdx <= 0} style={miniBtn(supportIdx <= 0)}>I want more support</button>
            <button type="button" onClick={() => shiftSupport(1)} disabled={supportIdx >= SUPPORT_ORDER.length - 1} style={miniBtn(supportIdx >= SUPPORT_ORDER.length - 1)}>I want harder questions</button>
          </div>
        </Col>
      </div>

      <Col title="Current goals">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {(goals || []).map((g) => (
            <span key={g.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: c.greenDark, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, padding: "6px 8px 6px 12px", borderRadius: 20 }}>
              ◎ {g.title}
              <button type="button" onClick={() => updateGoal.mutate({ id: g.id, status: "achieved" })} title="Mark done" style={{ background: "none", border: "none", color: c.greenDark, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}>✓</button>
              <button type="button" onClick={() => updateGoal.mutate({ id: g.id, status: "dropped" })} title="Remove" style={{ background: "none", border: "none", color: c.faint, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
          {adding ? (
            <span style={{ display: "inline-flex", gap: 6 }}>
              <input value={newGoal} autoFocus onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} placeholder="e.g. Master Linear Equations" style={{ border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 11px", fontSize: 13, fontFamily: "inherit" }} />
              <button type="button" onClick={addGoal} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 12.5, padding: "7px 13px", borderRadius: 8, cursor: "pointer" }}>Add</button>
            </span>
          ) : (
            <button type="button" onClick={() => setAdding(true)} style={{ background: "none", border: `1px dashed ${c.border}`, color: c.soft, fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 20, cursor: "pointer" }}>+ Add a goal</button>
          )}
        </div>
      </Col>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${c.divider}` }}>
        <span style={{ fontSize: 12.5, color: c.muted }}>Does this look right?</span>
        <button type="button" onClick={() => correct.mutate({ corrections: { ...model.corrections, accuracy: "confirmed" } })} style={miniBtn(false)}>This is accurate</button>
        <button type="button" onClick={() => correct.mutate({ corrections: { ...model.corrections, accuracy: "disputed" } })} style={miniBtn(false)}>Not quite</button>
        {model.corrections?.accuracy === "confirmed" && <span style={{ fontSize: 12, color: c.green }}>Thanks — noted.</span>}
        {model.corrections?.accuracy === "disputed" && <span style={{ fontSize: 12, color: c.amber }}>We'll keep refining it as you learn.</span>}
      </div>
    </div>
  );
}

function miniBtn(disabled: boolean): React.CSSProperties {
  return { background: "#fff", border: `1px solid ${c.border}`, color: disabled ? c.placeholder : c.soft, fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8, cursor: disabled ? "default" : "pointer" };
}
