import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { Loading } from "../ui";
import { useLayout, pageBox } from "../layout";
import { useDisplayName, useTeacherDashboard, useClasses } from "../data/queries";
import CreditBanner from "../credits/CreditBanner";

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const tActions = [
  { title: "Create experience", body: "Turn a difficult concept into a full learning experience.", icon: "＋", bg: "#2e9e6b", bd: "#2e9e6b", iconBg: "rgba(255,255,255,.2)", iconFg: "#fff", titleColor: "#fff", bodyColor: "rgba(255,255,255,.85)", to: "/teacher/experiences/new" },
  { title: "Create assessment", body: "Build a mastery check or examination-style paper.", icon: "◉", bg: "#fffdf8", bd: "#ece5d7", iconBg: "#eaf1f7", iconFg: "#3f8fc4", titleColor: "#2b3440", bodyColor: "#8a8270", to: "/teacher/assessments" },
  { title: "View a class", body: "See where each student stands right now.", icon: "◫", bg: "#fffdf8", bd: "#ece5d7", iconBg: "#f0edf7", iconFg: "#6b5aa8", titleColor: "#2b3440", bodyColor: "#8a8270", to: "/teacher/classes" },
];

export default function TeacherHome() {
  const L = useLayout();
  const nav = useNavigate();
  const { data: name } = useDisplayName();
  const { data: dash, isLoading } = useTeacherDashboard();
  const insights = dash?.misconceptions;
  const { data: classes } = useClasses();

  if (isLoading) return <Loading label="Loading your classes…" />;

  const attention = (classes || []).slice(0, 3).map((cl) => {
    const need = Number(cl.stats.find((s) => s.l === "Need support")?.v || 0);
    return {
      name: cl.name, mark: cl.mark, color: cl.color,
      note: need > 0 ? `${need} students need support` : `${cl.students} students on track`,
      flag: need > 3 ? "Reteach" : need > 0 ? "Review" : "Healthy",
      flagColor: need > 0 ? "#c47a17" : "#2e9e6b",
    };
  });

  return (
    <div style={pageBox(L.pad, 1080)}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>{greetingWord()}, {name || "there"}</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>Here is where your classes stand today.</div>

      <CreditBanner />

      <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 12, marginBottom: 30 }}>
        {tActions.map((a) => (
          <button key={a.title} onClick={() => nav(a.to)} style={{ textAlign: "left", background: a.bg, border: `1px solid ${a.bd}`, borderRadius: 15, padding: 20, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: a.iconBg, color: a.iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 13 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 4, color: a.titleColor }}>{a.title}</div>
            <div style={{ fontSize: 12.5, color: a.bodyColor, lineHeight: 1.5 }}>{a.body}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 22 }}>
        <div>
          <div style={sec}>Recent insights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(insights || []).slice(0, 3).map((i) => (
              <div key={i.concept} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "16px 17px" }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: c.ink, marginBottom: 9 }}>{i.detail}</div>
                <span onClick={() => nav("/teacher/insights")} style={{ fontSize: 12, fontWeight: 600, color: c.green, cursor: "pointer" }}>See {i.concept} insight ›</span>
              </div>
            ))}
            {(insights || []).length === 0 && <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "16px 17px", fontSize: 13, color: c.muted }}>Insights appear once students complete assigned work.</div>}
          </div>
        </div>
        <div>
          <div style={sec}>Classes needing attention</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {attention.map((cl) => (
              <button key={cl.name} onClick={() => nav("/teacher/classes")} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "15px 17px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: 9, background: cl.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{cl.mark}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cl.name}</div>
                  <div style={{ fontSize: 12, color: c.faint }}>{cl.note}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: cl.flagColor }}>{cl.flag}</span>
              </button>
            ))}
            {attention.length === 0 && <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "15px 17px", fontSize: 13, color: c.muted }}>Create a class to start tracking students.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const sec = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 } as const;
