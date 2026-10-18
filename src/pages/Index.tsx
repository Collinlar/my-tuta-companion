import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";

// The mastery loop, shown as a cycling ring in the hero.
const STAGES = [
  { name: "Understand", line: "The concept, explained your way." },
  { name: "Solve", line: "Guided working, one step at a time." },
  { name: "Practise", line: "Fresh questions until it sticks." },
  { name: "Apply", line: "Labs and challenges from real life." },
  { name: "Master", line: "Proof you can do it alone." },
];
const RING_C = 100.53; // circumference of r=16 at viewBox 44

const AUDIENCES = [
  { name: "Students", line: "Revise, get unstuck and walk into exams ready.", to: "/signup?type=student" },
  { name: "Teachers", line: "Build lessons, labs and assessments in minutes.", to: "/signup?type=teacher" },
  { name: "Schools", line: "See mastery across every class and subject.", to: "/contact" },
];

export default function Index() {
  const nav = useNavigate();
  const [stage, setStage] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const startTimer = () => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2800);
  };
  useEffect(() => {
    startTimer();
    return () => window.clearInterval(timer.current);
  }, []);
  const pick = (i: number) => { setStage(i); startTimer(); };

  const ringDash = `${(((stage + 1) / STAGES.length) * RING_C).toFixed(2)} ${RING_C}`;
  const cur = STAGES[stage];

  return (
    <div style={{ minHeight: "100vh", background: c.paper, color: c.ink, fontFamily: font.body, WebkitFontSmoothing: "antialiased" }}>
      <Helmet>
        <title>mytuta — STEM finally makes sense | AI STEM mastery for Africa</title>
        <meta name="description" content="Snap a question, name a topic or drop in your notes. mytuta finds the gap, teaches it your way and stays with you until you can solve it yourself. Built for STEM classrooms across Africa." />
      </Helmet>

      <style>{`
        .lp-a{transition:color .15s}
        .lp-nav:hover{color:#d6eee1 !important}
        .lp-aud:hover{color:${c.greenDark} !important}
        .lp-ghost:hover{background:#28905f}
        .lp-price{transition:transform .15s,box-shadow .15s}
        .lp-price:hover{transform:translateY(-3px)}
      `}</style>

      {/* Header */}
      <header style={{ background: c.green, position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 0 #28905f" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "22px clamp(20px,4vw,48px)", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-.035em", color: "#fff" }}>mytuta</div>
            <Ring size={11} dash="80 107" track="#1f7d53" fill="#fff" style={{ marginBottom: 4, flex: "none" }} />
          </div>
          <nav style={{ display: "flex", gap: 26, fontSize: 15, fontWeight: 500, marginLeft: "auto", flexWrap: "wrap" }}>
            <a href="#for" className="lp-a lp-nav" style={{ color: "#fff" }}>Students</a>
            <a href="#for" className="lp-a lp-nav" style={{ color: "#fff" }}>Teachers</a>
            <a href="#for" className="lp-a lp-nav" style={{ color: "#fff" }}>Schools</a>
            <a href="#pricing" className="lp-a lp-nav" style={{ color: "#fff" }}>Pricing</a>
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" onClick={() => nav("/signin")} className="lp-ghost" style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff", fontFamily: "inherit", fontWeight: 600, fontSize: 15, padding: "10px 18px", borderRadius: 999, cursor: "pointer" }}>Sign in</button>
            <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Start free</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: c.green, color: "#fff", overflow: "hidden", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,7vw,96px) clamp(20px,4vw,48px) clamp(56px,8vw,112px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: "clamp(40px,5vw,80px)", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(56px,9vw,128px)", lineHeight: .92, letterSpacing: "-.045em", color: "#fff", textWrap: "balance" }}>STEM finally makes sense.</h1>
            <p style={{ fontSize: "clamp(18px,1.6vw,22px)", lineHeight: 1.45, maxWidth: 520, color: "#fff", fontWeight: 500, textWrap: "pretty" }}>Snap a question, name a topic or drop in your notes. mytuta finds the gap, teaches it your way and stays with you until you can solve it yourself.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 17, padding: "17px 30px", borderRadius: 999, cursor: "pointer" }}>Start learning free</button>
              <button type="button" onClick={() => nav("/signup?type=teacher")} style={{ background: "transparent", color: "#fff", border: "2px solid #fff", fontFamily: "inherit", fontWeight: 600, fontSize: 17, padding: "15px 28px", borderRadius: 999, cursor: "pointer" }}>I'm a teacher</button>
            </div>
            <div style={{ fontSize: 15.5, color: "#fff" }}>Already learning with us? <a onClick={() => nav("/signin")} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>Sign in</a></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ position: "relative", width: "min(100%,440px)", aspectRatio: "1" }}>
              <svg viewBox="0 0 44 44" style={{ width: "100%", height: "100%", display: "block" }}>
                <circle cx="22" cy="22" r="16" fill="none" stroke="#1f7d53" strokeWidth="9" />
                <circle cx="22" cy="22" r="16" fill="none" stroke="#fff" strokeWidth="9" strokeDasharray={ringDash} transform="rotate(-90 22 22)" style={{ transition: "stroke-dasharray .7s cubic-bezier(.6,0,.2,1)" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 26%" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#d6eee1" }}>Step {stage + 1} of {STAGES.length}</div>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(30px,3.4vw,44px)", letterSpacing: "-.03em", lineHeight: 1, margin: "8px 0 10px" }}>{cur.name}</div>
                <div style={{ fontSize: 15, lineHeight: 1.4, color: "#fff" }}>{cur.line}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {STAGES.map((s, k) => (
                <button key={s.name} type="button" onClick={() => pick(k)} style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "8px 14px", borderRadius: 999, cursor: "pointer", border: "1.5px solid #fff", background: k === stage ? "#fff" : "transparent", color: k === stage ? c.greenDark : "#fff", transition: "background .2s,color .2s" }}>{s.name}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(72px,10vw,140px) clamp(20px,4vw,48px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,18px)" }}>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "clamp(36px,6vw,84px)", lineHeight: 1, letterSpacing: "-.04em", color: "#a39b88", textDecoration: "line-through", textDecorationThickness: ".06em", textDecorationColor: "#c9c0ad" }}>&ldquo;I don't understand this.&rdquo;</div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(36px,6vw,84px)", lineHeight: 1, letterSpacing: "-.04em", color: c.greenDark }}>&ldquo;I can solve it myself.&rdquo;</div>
        </div>
        <p style={{ fontSize: "clamp(17px,1.5vw,20px)", lineHeight: 1.55, color: c.soft, maxWidth: 620, marginTop: 36, textWrap: "pretty" }}>That's the whole job. No answer dumps. Just guided working, hints when you're stuck, and proof you've actually got it.</p>
      </section>

      {/* Demo */}
      <section style={{ background: c.surface, borderTop: `1px solid ${c.border2}`, borderBottom: `1px solid ${c.border2}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", gap: 44 }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(34px,4.4vw,60px)", lineHeight: 1, letterSpacing: "-.035em", maxWidth: 760 }}>One question. Three moves.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20 }}>
            <div style={{ background: c.paper, borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 18, minHeight: 300 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 56, lineHeight: 1, color: c.green }}>1</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Snap it</div>
              <div style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 14, padding: 18, fontSize: 17, lineHeight: 1.5, marginTop: "auto" }}>Solve for x:<br /><span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 26 }}>x² − 5x + 6 = 0</span></div>
            </div>
            <div style={{ background: c.paper, borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 18, minHeight: 300 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 56, lineHeight: 1, color: c.green }}>2</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Work it, with a coach</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                <div style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 14, padding: "12px 16px", fontSize: 15.5 }}>Which two numbers multiply to 6 and add to −5?</div>
                <div style={{ background: c.ink, color: "#fff", borderRadius: 14, padding: "12px 16px", fontSize: 15.5, alignSelf: "flex-end" }}>−2 and −3</div>
                <div style={{ background: c.greenTint, color: c.greenDark, borderRadius: 14, padding: "12px 16px", fontSize: 15.5, fontWeight: 600 }}>Exactly. Now factorise.</div>
              </div>
            </div>
            <div style={{ background: c.green, color: "#fff", borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 18, minHeight: 300 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 56, lineHeight: 1, color: "#fff" }}>3</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Own it</div>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 30, letterSpacing: "-.02em" }}>x = 2 or x = 3</div>
                <div style={{ fontSize: 15.5, lineHeight: 1.45 }}>Then three fresh questions to prove it stuck.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section id="for" style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,4vw,48px)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#7d7564", marginBottom: 20 }}>Built for</div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: `2px solid ${c.ink}` }}>
          {AUDIENCES.map((a) => (
            <a key={a.name} onClick={() => nav(a.to)} className="lp-a lp-aud" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "center", padding: "clamp(22px,3vw,36px) 0", borderBottom: `2px solid ${c.ink}`, color: c.ink, cursor: "pointer" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 28px" }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(40px,6vw,88px)", lineHeight: 1, letterSpacing: "-.045em" }}>{a.name}</div>
                <div style={{ fontSize: "clamp(16px,1.4vw,19px)", color: c.soft, maxWidth: 440, lineHeight: 1.4 }}>{a.line}</div>
              </div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "clamp(32px,4vw,56px)", lineHeight: 1 }}>→</div>
            </a>
          ))}
        </div>
      </section>

      {/* Pricing — matches the live model (Free / Student Plus / Teachers & Schools) */}
      <section id="pricing" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(64px,8vw,112px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 20 }}>
          <div onClick={() => nav("/signup?type=student")} className="lp-price" style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 22, padding: 32, display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Free</div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 52, letterSpacing: "-.03em", lineHeight: 1 }}>₵0</div>
            <div style={{ fontSize: 16, color: c.soft, lineHeight: 1.5 }}>Join a class, with daily guided questions and lessons across Maths and Science.</div>
          </div>
          <div onClick={() => nav("/pricing")} className="lp-price" style={{ background: c.ink, color: "#fff", borderRadius: 22, padding: 32, display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Student Plus</div>
              <div style={{ background: c.green, fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Most learners</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 52, letterSpacing: "-.03em", lineHeight: 1 }}>₵100</div>
              <div style={{ fontSize: 15, color: "#c7cdd4" }}>/month</div>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.5 }}>A monthly credit allowance for revision, guided solving and premium Mastery Checks.</div>
          </div>
          <div onClick={() => nav("/signup?type=teacher")} className="lp-price" style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 22, padding: 32, display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Teachers &amp; Schools</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 52, letterSpacing: "-.03em", lineHeight: 1 }}>₵150</div>
              <div style={{ fontSize: 15, color: c.soft }}>/month</div>
            </div>
            <div style={{ fontSize: 16, color: c.soft, lineHeight: 1.5 }}>Teacher studio, assessments and mastery insights for every class. Custom plans for schools.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginTop: 18 }}>
          <div style={{ fontSize: 15, color: "#7d7564" }}>Pay with mobile money or card.</div>
          <a onClick={() => nav("/pricing")} style={{ fontSize: 15, fontWeight: 700, color: c.greenDark, cursor: "pointer" }}>See full pricing →</a>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: c.ink, color: "#fff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 48, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start" }}>
            <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(48px,7vw,104px)", lineHeight: .94, letterSpacing: "-.045em", color: "#fff" }}>Close the loop.</h2>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: c.green, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 18, padding: "18px 32px", borderRadius: 999, cursor: "pointer" }}>Start learning free</button>
              <a onClick={() => nav("/signin")} style={{ color: "#fff", fontWeight: 600, fontSize: 17, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>or sign in</a>
            </div>
          </div>
          <Ring size="min(100%,320px)" dash="100.6 101" track="#3a4552" fill={c.green} style={{ justifySelf: "end", display: "block" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px clamp(20px,4vw,48px) 32px", borderTop: "1px solid #3a4552", display: "flex", flexWrap: "wrap", gap: "12px 28px", fontSize: 14, color: "#c7cdd4", alignItems: "center" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, color: "#fff", fontSize: 17, letterSpacing: "-.03em" }}>mytuta</div>
          <a onClick={() => nav("/about")} style={{ color: "#c7cdd4", cursor: "pointer" }}>About</a>
          <a onClick={() => nav("/blog")} style={{ color: "#c7cdd4", cursor: "pointer" }}>Resources</a>
          <a onClick={() => nav("/contact")} style={{ color: "#c7cdd4", cursor: "pointer" }}>Contact</a>
          <div style={{ marginLeft: "auto" }}>Made for STEM classrooms across Africa</div>
        </div>
      </section>
    </div>
  );
}

/** The mytuta progress-ring mark, used at a few sizes. */
function Ring({ size, dash, track, fill, style }: { size: number | string; dash: string; track: string; fill: string; style?: React.CSSProperties }) {
  const dim = typeof size === "number" ? size : undefined;
  return (
    <svg viewBox="0 0 44 44" width={dim} height={dim} style={{ width: typeof size === "string" ? size : undefined, ...style }}>
      <circle cx="22" cy="22" r="16" fill="none" stroke={track} strokeWidth="9" />
      <circle cx="22" cy="22" r="16" fill="none" stroke={fill} strokeWidth="9" strokeDasharray={dash} transform="rotate(-90 22 22)" />
    </svg>
  );
}
