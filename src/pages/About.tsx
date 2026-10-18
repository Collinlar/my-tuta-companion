import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { MarketingShell } from "./marketing/chrome";

const VALUES = [
  { title: "Understanding, not answers", body: "mytuta never dumps the solution. It coaches your reasoning, one step at a time, until you can do it on your own." },
  { title: "Built for Africa", body: "Local examples, cedis and mobile money, and content tuned to national exams. Made in Accra for classrooms across the continent." },
  { title: "Every learner, their way", body: "mytuta learns how you learn, then adapts the explanation, the pace and the support to match you." },
  { title: "Private and safe", body: "Your learning stays yours. We protect student and teacher data and never sell it." },
];

const LOOP = [
  { n: "1", name: "Understand", line: "The concept, explained your way." },
  { n: "2", name: "Solve", line: "Guided working, one step at a time." },
  { n: "3", name: "Practise", line: "Fresh questions until it sticks." },
  { n: "4", name: "Apply", line: "Labs and challenges from real life." },
  { n: "5", name: "Master", line: "Proof you can do it alone." },
];

export default function About() {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <Helmet>
        <title>About mytuta | STEM mastery for Africa</title>
        <meta name="description" content="mytuta is the AI STEM mastery platform built in Accra for African students and teachers. We build understanding, not answer dumps, and stay with every learner until they can solve it themselves." />
      </Helmet>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(20px,4vw,48px) clamp(32px,4vw,56px)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#7d7564", marginBottom: 20 }}>About mytuta</div>
        <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(44px,7vw,104px)", lineHeight: .95, letterSpacing: "-.045em", color: c.ink, maxWidth: 1000, textWrap: "balance" }}>We built mytuta so STEM finally makes sense.</h1>
        <p style={{ fontSize: "clamp(17px,1.6vw,22px)", lineHeight: 1.5, color: c.soft, maxWidth: 640, marginTop: 30, textWrap: "pretty" }}>Too many students decide they are "just not a science person" because a concept never clicked and nobody stayed with them long enough to fix it. mytuta is the tutor that does: it finds the gap, teaches it your way, and does not leave until you can solve it yourself.</p>
      </section>

      {/* Promise */}
      <section style={{ background: c.surface, borderTop: `1px solid ${c.border2}`, borderBottom: `1px solid ${c.border2}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,9vw,128px) clamp(20px,4vw,48px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,18px)" }}>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "clamp(34px,5.5vw,80px)", lineHeight: 1, letterSpacing: "-.04em", color: "#a39b88", textDecoration: "line-through", textDecorationThickness: ".06em", textDecorationColor: "#c9c0ad" }}>A tool that hands over answers.</div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(34px,5.5vw,80px)", lineHeight: 1, letterSpacing: "-.04em", color: c.greenDark }}>A tutor that builds understanding.</div>
          </div>
          <p style={{ fontSize: "clamp(17px,1.5vw,20px)", lineHeight: 1.55, color: c.soft, maxWidth: 620, marginTop: 34, textWrap: "pretty" }}>An answer solves one question. Understanding solves every question like it. That difference is the entire reason mytuta exists.</p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)" }}>
        <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(32px,4.4vw,60px)", lineHeight: 1, letterSpacing: "-.035em", marginBottom: 40, maxWidth: 680 }}>What we believe</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 20 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", color: c.ink }}>{v.title}</div>
              <div style={{ fontSize: 16, lineHeight: 1.55, color: c.soft }}>{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The loop */}
      <section style={{ background: c.surface, borderTop: `1px solid ${c.border2}`, borderBottom: `1px solid ${c.border2}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(32px,4.4vw,60px)", lineHeight: 1, letterSpacing: "-.035em", maxWidth: 680 }}>Every concept runs the same loop.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 14 }}>
            {LOOP.map((s) => (
              <div key={s.name} style={{ background: c.paper, borderRadius: 18, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 40, lineHeight: 1, color: c.green }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{s.name}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.45, color: c.soft }}>{s.line}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: c.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 28, alignItems: "flex-start" }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(40px,6vw,88px)", lineHeight: .95, letterSpacing: "-.045em", color: "#fff" }}>Learn the way it should work.</h2>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: c.green, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 18, padding: "18px 32px", borderRadius: 999, cursor: "pointer" }}>Start learning free</button>
            <a onClick={() => nav("/signin")} style={{ color: "#fff", fontWeight: 600, fontSize: 17, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>or sign in</a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
