import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { useLayout } from "@/mytuta/layout";

const homeStats = [
  { value: "25k+", label: "Students learning" },
  { value: "120k+", label: "Lessons created" },
  { value: "400+", label: "Teachers" },
  { value: "60+", label: "Partner schools" },
];
const loopWords = ["Diagnose", "Understand", "Recall", "Practise", "Apply", "Prove"];
const steps = [
  { n: "01", title: "Understand", body: "A quick check finds what you are missing, then mytuta explains the concept your way with worked examples and everyday African context." },
  { n: "02", title: "Practise and apply", body: "Recall the essentials, solve with a Step Coach one step at a time, then use the concept in a hands-on activity." },
  { n: "03", title: "Prove", body: "Show mastery through a check, an examination-style paper, a practical project or a challenge." },
];
const proveRoutes = [
  { icon: "◔", title: "Mastery check", body: "A mixed check across recall, procedure, application and reasoning." },
  { icon: "◈", title: "Examination-style", body: "Practice papers tuned to your national exam, marked as an indicator." },
  { icon: "⬡", title: "Challenges", body: "Design, build and problem-solving tasks that show applied skill." },
  { icon: "✎", title: "Practical project", body: "Hands-on activities you submit as photos, data or a short write-up." },
];
const audienceCards = [
  { title: "For students", body: "Understand STEM concepts, solve problems with a Step Coach, apply them in the STEM Lab and prove your mastery.", cta: "Explore for students", color: "#2e9e6b", to: "/signup?type=student" },
  { title: "For teachers", body: "Create curriculum-aligned STEM lessons in minutes, and see the exact misconceptions to reteach.", cta: "Explore for teachers", color: "#c47a17", to: "/signup?type=teacher" },
  { title: "For schools", body: "Coordinate STEM teaching, manage access, and track understanding across your whole school.", cta: "Explore for schools", color: "#3f8fc4", to: "/contact" },
];
const useCaseTiles = [
  { title: "Step Coach", body: "Work any problem one guided step at a time, not just an answer." },
  { title: "STEM Lab", body: "Apply concepts through low-cost, hands-on practical activities." },
  { title: "Challenges", body: "Prove applied skill in design, build and data challenges." },
];
const pricingTiers = [
  { name: "Free", price: "GHS 0", body: "Limited STEM lessons, basic explanations and quizzes, and join a teacher's class.", bg: c.surface, bd: c.border2 },
  { name: "Student Plus", price: "GHS 35/mo", body: "Unlimited lessons, Step Coach problem solving, your STEM Mastery Map and full exam prep.", bg: c.greenTint, bd: c.greenTintBorder },
  { name: "Exam Pass", price: "from GHS 90", body: "Time-bound access to one exam, such as WASSCE or KCSE, for the season that matters.", bg: c.surface, bd: c.border2 },
  { name: "Schools", price: "Custom", body: "Teacher and student licences, a shared STEM library and school-wide insights.", bg: c.surface, bd: c.border2 },
];

const Index = () => {
  const nav = useNavigate();
  const L = useLayout();
  const [heroRole, setHeroRole] = useState<"student" | "teacher">("student");
  const [menuOpen, setMenuOpen] = useState(false);
  const heroSub = heroRole === "student"
    ? "Understand difficult concepts, solve problems with guidance and master STEM through practice and real application. Built for African learners."
    : "Create complete STEM learning experiences that move students from explanation to application, then see exactly where understanding breaks down.";
  const sx = L.sectionX;
  const go = (to: string) => { setMenuOpen(false); nav(to); };

  const seg = (active: boolean) => ({ border: "none", background: active ? c.surface : "transparent", color: active ? c.greenDark : c.muted, fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 9, cursor: "pointer", boxShadow: active ? "0 2px 6px rgba(30,40,32,.08)" : "none", transition: "all .15s", minHeight: 44 } as const);

  return (
    <div style={{ minHeight: "100vh", background: c.paper, color: c.ink, fontFamily: font.body, overflowX: "hidden" }}>
      <Helmet>
        <title>mytuta — STEM finally makes sense | AI STEM mastery for Africa</title>
        <meta name="description" content="mytuta is the AI-powered STEM mastery platform. Understand difficult concepts, solve problems with a Step Coach, apply them in the STEM Lab, and prove your mastery. Built for African students and teachers." />
      </Helmet>

      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(246,243,236,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: `15px ${sx}px`, display: "flex", alignItems: "center", gap: L.mobile ? 12 : 30 }}>
          <a onClick={() => go("/")} style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#1c2620", cursor: "pointer" }}>mytuta<span style={{ color: c.green }}>.</span></a>
          {!L.mobile && (
            <nav style={{ display: "flex", gap: 24, fontSize: 14.5, marginLeft: 8 }}>
              <NavA onClick={() => go("/signup?type=student")}>For students</NavA>
              <NavA onClick={() => go("/signup?type=teacher")}>For teachers</NavA>
              <NavA onClick={() => go("/contact")}>For schools</NavA>
              <NavA onClick={() => go("/blog")}>Resources</NavA>
              <NavA onClick={() => go("/about")}>About</NavA>
            </nav>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {!L.mobile && <a onClick={() => go("/signin")} style={{ fontSize: 14.5, color: "#3a4350", fontWeight: 500, cursor: "pointer" }}>Sign in</a>}
            {!L.mobile && (
              <button onClick={() => go("/signup")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "11px 18px", borderRadius: 11, cursor: "pointer", minHeight: 44 }}>Start learning free</button>
            )}
            {L.mobile && (
              <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((v) => !v)} style={{ width: 44, height: 44, border: `1px solid ${c.border2}`, background: c.surface, borderRadius: 10, fontSize: 18, cursor: "pointer" }}>
                {menuOpen ? "✕" : "☰"}
              </button>
            )}
          </div>
        </div>
        {L.mobile && menuOpen && (
          <div style={{ padding: `8px ${sx}px 16px`, display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${c.border}` }}>
            {[
              ["For students", "/signup?type=student"],
              ["For teachers", "/signup?type=teacher"],
              ["For schools", "/contact"],
              ["Resources", "/blog"],
              ["About", "/about"],
              ["Sign in", "/signin"],
            ].map(([label, to]) => (
              <button key={label} type="button" onClick={() => go(to)} style={{ textAlign: "left", background: "none", border: "none", padding: "14px 4px", fontSize: 15.5, fontWeight: 600, color: c.ink, cursor: "pointer", minHeight: 48 }}>{label}</button>
            ))}
            <button type="button" onClick={() => go("/signup")} style={{ marginTop: 6, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer", minHeight: 48 }}>Start learning free</button>
          </div>
        )}
      </header>

      <main>
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `36px ${sx}px 28px` : "64px 32px 40px", display: "grid", gridTemplateColumns: L.gHero, gap: L.mobile ? 28 : 56, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: L.heroTitle, lineHeight: 1.05, marginBottom: 20 }}>STEM finally makes sense.</h1>
            <p style={{ fontSize: L.mobile ? 16 : 17.5, lineHeight: 1.55, color: c.soft, maxWidth: 520, marginBottom: 26 }}>{heroSub}</p>
            <div style={{ display: "inline-flex", background: "#efe9dc", borderRadius: 12, padding: 4, marginBottom: 26, flexWrap: "wrap" }}>
              <button onClick={() => setHeroRole("student")} style={seg(heroRole === "student")}>I am a student</button>
              <button onClick={() => setHeroRole("teacher")} style={seg(heroRole === "teacher")}>I am a teacher</button>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => nav(`/signup?type=${heroRole}`)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: "14px 26px", borderRadius: 12, cursor: "pointer", minHeight: 48 }}>Start learning free</button>
              <a onClick={() => nav("/signup?type=student")} style={{ fontWeight: 600, fontSize: 15, color: "#3a4350", cursor: "pointer", padding: "14px 6px" }}>See how it works</a>
            </div>
            <div style={{ fontSize: 13, color: c.muted, marginTop: 20 }}>Free to start. No card needed. Works offline once downloaded.</div>
          </div>
          {!L.mobile && (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -18, background: c.greenTint, borderRadius: 28 }} />
              <div style={{ position: "relative", border: `1px solid ${c.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px rgba(30,40,32,.13)", background: c.surface, aspectRatio: "4 / 3" }}>
                <HeroMock />
              </div>
            </div>
          )}
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: `14px ${sx}px 40px` }}>
          <div style={{ display: "grid", gridTemplateColumns: L.gStats, gap: 14, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, padding: "26px 0" }}>
            {homeStats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: font.display, fontSize: L.mobile ? 26 : 34, color: c.green, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13.5, color: c.muted, marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: c.surface, borderTop: `1px solid ${c.border2}`, borderBottom: `1px solid ${c.border2}` }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `48px ${sx}px` : "70px 32px" }}>
            <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 36px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Diagnose · Understand · Practise · Prove</div>
              <h2 style={{ fontSize: L.mobile ? 28 : 38, lineHeight: 1.1, marginBottom: 14 }}>One loop, from a hard concept to proven mastery</h2>
              <p style={{ fontSize: 16, color: c.soft, lineHeight: 1.55 }}>Give mytuta a topic, your notes, or a photo of a question. It finds what you are missing, teaches it your way, guides your practice, and helps you apply and prove what you have learned.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {loopWords.map((w) => (
                <span key={w} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontWeight: 600, fontSize: 13, padding: "8px 15px", borderRadius: 20 }}>{w}</span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 22 }}>
              {steps.map((st) => (
                <div key={st.n} style={{ background: c.paper, border: `1px solid ${c.border2}`, borderRadius: 18, padding: L.mobile ? "22px 20px" : "28px 26px" }}>
                  <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: c.green, marginBottom: 16 }}>{st.n}</div>
                  <h3 style={{ fontSize: 22, marginBottom: 10 }}>{st.title}</h3>
                  <p style={{ fontSize: 14.5, color: c.soft, lineHeight: 1.6 }}>{st.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `48px ${sx}px 20px` : "64px 32px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 34px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>The Prove layer</div>
            <h2 style={{ fontSize: L.mobile ? 26 : 32, lineHeight: 1.12, marginBottom: 12 }}>Prove your mastery, more ways than one</h2>
            <p style={{ fontSize: 16, color: c.soft, lineHeight: 1.55 }}>Mastery is not one score. Show what you know through a check, an examination-style paper, a practical project or a challenge.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 16 }}>
            {proveRoutes.map((e) => (
              <div key={e.title} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 13 }}>{e.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{e.title}</div>
                <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.5 }}>{e.body}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 13, color: c.muted, marginTop: 20 }}>Examination-style results are practice indicators, not official examination results.</div>
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `48px ${sx}px 16px` : "72px 32px 20px" }}>
          <h2 style={{ fontSize: L.mobile ? 26 : 34, marginBottom: 8 }}>One STEM platform, three ways to use it</h2>
          <p style={{ fontSize: 16, color: c.soft, marginBottom: 28 }}>Whether you are revising alone, teaching a class, or running a whole school.</p>
          <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 20 }}>
            {audienceCards.map((a) => (
              <button key={a.title} onClick={() => nav(a.to)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 18, padding: 26, cursor: "pointer" }}>
                <div style={{ width: 44, height: 6, borderRadius: 3, background: a.color, marginBottom: 18 }} />
                <h3 style={{ fontSize: 21, marginBottom: 8 }}>{a.title}</h3>
                <p style={{ fontSize: 14.5, color: c.soft, lineHeight: 1.6, marginBottom: 16 }}>{a.body}</p>
                <span style={{ fontSize: 14, fontWeight: 600, color: c.green }}>{a.cta} ›</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `40px ${sx}px` : "60px 32px" }}>
          <div style={{ display: "flex", alignItems: L.mobile ? "flex-start" : "baseline", justifyContent: "space-between", marginBottom: 26, flexDirection: L.mobile ? "column" : "row", gap: 10 }}>
            <h2 style={{ fontSize: L.mobile ? 24 : 30 }}>Popular ways students master STEM</h2>
            <a onClick={() => nav("/blog")} style={{ fontSize: 14.5, fontWeight: 600, cursor: "pointer", color: c.green }}>Read the guides ›</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 16 }}>
            {useCaseTiles.map((u) => (
              <div key={u.title} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22 }}>
                <h3 style={{ fontSize: 18, marginBottom: 7 }}>{u.title}</h3>
                <p style={{ fontSize: 14, color: c.soft, lineHeight: 1.55 }}>{u.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `16px ${sx}px` : "20px 32px 12px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 34px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Simple pricing</div>
            <h2 style={{ fontSize: L.mobile ? 26 : 32, lineHeight: 1.12, marginBottom: 12 }}>Start free, upgrade when it counts</h2>
            <p style={{ fontSize: 16, color: c.soft, lineHeight: 1.55 }}>Pay with mobile money or card. An Exam Pass is often the easiest way for families to prepare for one big exam.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 16 }}>
            {pricingTiers.map((t) => (
              <div key={t.name} style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontFamily: font.display, fontSize: 24, color: c.green, lineHeight: 1.1, marginBottom: 12 }}>{t.price}</div>
                <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.55, flex: 1 }}>{t.body}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 22 }}>
            <button onClick={() => nav("/pricing")} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer", minHeight: 44 }}>See full pricing</button>
          </div>
        </section>

        <section style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `40px ${sx}px 56px` : "72px 32px" }}>
          <div style={{ background: "linear-gradient(135deg,#2e9e6b,#1f7d53)", borderRadius: 24, padding: L.mobile ? "36px 22px" : "56px 48px", color: "#fff", textAlign: "center" }}>
            <h2 style={{ fontSize: L.mobile ? 26 : 38, lineHeight: 1.1, marginBottom: 14, color: "#fff" }}>Move from "I do not understand this" to "I can solve it myself"</h2>
            <p style={{ fontSize: L.mobile ? 15 : 17, opacity: 0.9, maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.5 }}>Start free today. Understand a concept, practise with guidance, apply it in the real world, and prove you have mastered it.</p>
            <button onClick={() => nav("/signup")} style={{ background: c.surface, color: c.greenDark, border: "none", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 12, cursor: "pointer", minHeight: 48 }}>Start learning free</button>
          </div>
        </section>
      </main>

      <footer style={{ background: "#1c2620", color: "#c9d6cd" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: L.mobile ? `40px ${sx}px 28px` : "56px 32px 40px", display: "grid", gridTemplateColumns: L.mobile ? "1fr 1fr" : "1.4fr 1fr 1fr 1fr", gap: L.mobile ? 24 : 36 }}>
          <div style={{ gridColumn: L.mobile ? "1 / -1" : undefined }}>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 12 }}>mytuta<span style={{ color: "#5fc79b" }}>.</span></div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9db0a5", maxWidth: 280 }}>Diagnose, understand, practise, apply and prove. Africa's AI-powered STEM mastery platform for students, teachers and schools.</p>
          </div>
          <FooterCol title="Product" links={[["For students", "/signup?type=student"], ["For teachers", "/signup?type=teacher"], ["For schools", "/contact"], ["Pricing", "/pricing"]]} nav={nav} />
          <FooterCol title="Learn" links={[["Resources", "/blog"], ["Features", "/features"], ["FAQs", "/faqs"], ["About", "/about"]]} nav={nav} />
          <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]]} nav={nav} />
        </div>
        <div style={{ borderTop: "1px solid #2f3d34" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: `20px ${sx}px`, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7f958a", flexDirection: L.mobile ? "column" : "row", gap: 8 }}>
            <span>© 2026 mytuta. Made in Ghana, built for Africa.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function NavA({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <a onClick={onClick} style={{ color: "#3a4350", fontWeight: 500, cursor: "pointer" }}>{children}</a>;
}

function FooterCol({ title, links, nav }: { title: string; links: [string, string][]; nav: (to: string) => void }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#7f958a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([label, to]) => (
          <a key={label} onClick={() => nav(to)} style={{ fontSize: 14, color: "#c9d6cd", cursor: "pointer" }}>{label}</a>
        ))}
      </div>
    </div>
  );
}

/** Small in-app lesson-workspace mock for the hero, in place of a screenshot. */
function HeroMock() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", fontFamily: font.body }}>
      <div style={{ width: 132, flex: "none", background: c.surface, borderRight: `1px solid ${c.border2}`, padding: "16px 12px" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 12 }}>Photosynthesis</div>
        {["Foundations", "Understand", "Worked examples", "Recall", "Practise"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 7px", borderRadius: 7, marginBottom: 2, background: i === 1 ? c.greenTint : "transparent", color: i === 1 ? c.greenDark : c.muted, fontSize: 11, fontWeight: i === 1 ? 600 : 500 }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", flex: "none", background: i === 0 ? c.green : i === 1 ? c.greenTint : "#f0ece1", color: i === 0 ? "#fff" : i === 1 ? c.green : c.placeholder, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i === 0 ? "✓" : i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "20px 22px", background: c.paper }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Stage 2 of 8 · Understand</div>
        <div style={{ fontFamily: font.display, fontSize: 19, marginBottom: 10 }}>The concept, explained your way</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: 14, fontSize: 12.5, lineHeight: 1.6, color: c.body }}>
          Using energy from sunlight, a plant takes in carbon dioxide and water and turns them into glucose, releasing oxygen as it does.
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <span style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 20 }}>I understand</span>
          <span style={{ background: c.surface, border: `1px solid ${c.border2}`, color: c.soft, fontSize: 11, fontWeight: 500, padding: "6px 11px", borderRadius: 20 }}>Explain another way</span>
        </div>
      </div>
    </div>
  );
}

export default Index;
