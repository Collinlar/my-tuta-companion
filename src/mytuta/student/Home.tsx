import { useNavigate } from "react-router-dom";
import { c, font, level } from "../theme";
import { Bar, Loading } from "../ui";
import { askChips } from "../data/constants";
import { useMasteryPaths, useStudentAssignments, useDisplayName, useDueRecallCount } from "../data/queries";
import CreditBanner from "../credits/CreditBanner";
import NextActionCard from "../intelligence/NextActionCard";
import InsightBand from "../intelligence/InsightCard";
import TutorPanel from "../intelligence/TutorPanel";
import { useGoals, useLearnerModel } from "../intelligence/data";

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const nav = useNavigate();
  const goLearn = () => nav("/student/learn");
  const { data: name } = useDisplayName();
  const { data: paths, isLoading: pathsLoading } = useMasteryPaths();
  const { data: assignments } = useStudentAssignments();
  const { data: dueRecall } = useDueRecallCount();
  const { data: goals } = useGoals();
  const { data: model } = useLearnerModel();

  if (pathsLoading) return <Loading label="Loading your home…" />;

  const continuePaths = (paths || []).slice(0, 2);
  const pathCount = (paths || []).length;

  // Momentum, computed from the learner model's concept states.
  const concepts = model?.concepts || [];
  const active = concepts.filter((x) => x.state === "Beginning" || x.state === "Developing").length;
  const nearMastery = concepts.filter((x) => x.state === "Secure").length;
  const mastered = concepts.filter((x) => x.state === "Mastered").length;

  const openAssignments = (assignments || []).filter((a) => !a.status.startsWith("Completed"));

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "46px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontFamily: font.display, fontSize: 27, lineHeight: 1.15, marginBottom: 4 }}>{greetingWord()}, {name || "there"}</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>
        {pathCount === 0 ? "Let's find where mytuta can help you most." : "Here's what matters for your learning right now."}
      </div>

      <CreditBanner />

      {/* 1. The single most valuable next step */}
      <NextActionCard />

      {/* 2. Contextual tutor line */}
      <TutorPanel context="home" />

      {/* 3. What mytuta noticed */}
      <InsightBand limit={2} />

      {/* 4. Current goals */}
      {(goals || []).length > 0 && (
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 11 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>Current goals</div>
            <span onClick={() => nav("/student/progress")} style={{ fontSize: 12, fontWeight: 600, color: c.green, cursor: "pointer" }}>Manage ›</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(goals || []).map((g) => (
              <span key={g.id} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 20 }}>◎ {g.title}</span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Quick help */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>Quick help</div>
      <div style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 14, padding: "15px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span style={{ color: c.placeholder, fontSize: 14.5, flex: 1 }}>Type a topic, paste a question, or add your notes</span>
        <button type="button" onClick={goLearn} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>Start learning</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
        {askChips.map((chip) => (
          <button key={chip} type="button" onClick={() => nav("/student/learn", { state: { presetConceptName: chip } })} style={{ background: c.surface, border: `1px solid ${c.border2}`, color: c.soft, fontSize: 12.5, fontWeight: 500, padding: "7px 13px", borderRadius: 20, cursor: "pointer" }}>{chip}</button>
        ))}
      </div>

      {/* 6. Continue mastering — now deep-links into the actual path */}
      {continuePaths.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: font.display, fontSize: 18 }}>Continue mastering</div>
            <span onClick={goLearn} style={{ fontSize: 13, fontWeight: 600, color: c.green, cursor: "pointer" }}>View all paths ›</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 36 }}>
            {continuePaths.map((p) => {
              const [lc, lb] = level(p.level);
              return (
                <button key={p.id} type="button" onClick={() => nav(`/student/mastery/${p.id}`)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 15, padding: "18px 19px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 12, color: c.faint, fontWeight: 500 }}>{p.subject}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: lc, background: lb, padding: "3px 9px", borderRadius: 20 }}>{p.level}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{p.concept}</div>
                  <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 12 }}>Stage: {p.stage}</div>
                  <div style={{ marginBottom: 9 }}><Bar pct={p.pct} color={p.color} /></div>
                  <div style={{ fontSize: 12, color: c.green, fontWeight: 600 }}>{p.next} ›</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 7. What's due */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>What's due</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 36 }}>
        {!!dueRecall && dueRecall > 0 && (
          <button type="button" onClick={() => nav("/student/review")} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, flex: "none", borderRadius: 9, background: c.amberTint, color: c.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>◔</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Review due</div><div style={{ fontSize: 12, color: c.faint }}>{dueRecall} item{dueRecall === 1 ? "" : "s"} to review before you forget</div></div>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.green }}>Review ›</span>
          </button>
        )}
        {openAssignments.map((a) => (
          <button key={a.id} type="button" onClick={() => nav("/student/assignments")} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, flex: "none", borderRadius: 9, background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.title}</div><div style={{ fontSize: 12, color: c.faint }}>{a.teacher} · due {a.due}</div></div>
            <span style={{ fontSize: 11, fontWeight: 600, color: a.statusColor }}>{a.status}</span>
          </button>
        ))}
        {(!dueRecall || dueRecall === 0) && openAssignments.length === 0 && (
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 15px", fontSize: 13, color: c.muted }}>Nothing due right now. A good time to move a concept forward.</div>
        )}
      </div>

      {/* 8. Momentum — quiet, not streak-driven */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>Your momentum</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { value: active, label: "Active concepts" },
          { value: nearMastery, label: "Close to mastery" },
          { value: mastered, label: "Mastered" },
        ].map((s) => (
          <div key={s.label} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: 16 }}>
            <div style={{ fontFamily: font.display, fontSize: 26, lineHeight: 1, color: c.green }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: c.faint, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
