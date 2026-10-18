import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { MarketingShell } from "./marketing/chrome";

interface Post {
  category: string; title: string; excerpt: string; date: string; readTime: string; slug: string; featured?: boolean;
}

const POSTS: Post[] = [
  { category: "Study Tips", title: "5 Proven Study Techniques That Actually Work", excerpt: "Evidence-based study methods that help you retain more and walk into exams ready.", date: "Jan 15, 2025", readTime: "5 min read", slug: "5-proven-study-techniques", featured: true },
  { category: "For Teachers", title: "How to Create Engaging Lesson Plans in 10 Minutes", excerpt: "Use AI to build comprehensive, engaging lesson plans that save time and lift outcomes.", date: "Jan 12, 2025", readTime: "4 min read", slug: "engaging-lesson-plans" },
  { category: "Student Success", title: "From 45% to 87%: How Ama Transformed Her Study Habits", excerpt: "How one JHS student used mytuta to completely turn around her results.", date: "Jan 10, 2025", readTime: "6 min read", slug: "ama-success-story" },
  { category: "AI & Education", title: "The Future of Learning: AI in Ghanaian Classrooms", excerpt: "How AI is reshaping education in Ghana, and what it means for students and teachers.", date: "Jan 8, 2025", readTime: "7 min read", slug: "ai-education-ghana" },
  { category: "Study Tips", title: "Mastering Flashcards: A Complete Guide", excerpt: "Everything you need to use flashcards well for stronger memory and exam prep.", date: "Jan 5, 2025", readTime: "5 min read", slug: "mastering-flashcards" },
  { category: "For Teachers", title: "Differentiation Made Easy with AI", excerpt: "Quickly adapt your lessons for different learning levels with mytuta's tools.", date: "Jan 3, 2025", readTime: "4 min read", slug: "differentiation-made-easy" },
];

function CatPill({ label, light }: { label: string; light?: boolean }) {
  return <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".02em", color: light ? "#d6eee1" : c.greenDark, background: light ? "rgba(255,255,255,.16)" : c.greenTint, border: light ? "none" : `1px solid ${c.greenTintBorder}`, padding: "4px 11px", borderRadius: 999 }}>{label}</span>;
}

export default function Blog() {
  const nav = useNavigate();
  const featured = POSTS.find((p) => p.featured) || POSTS[0];
  const rest = POSTS.filter((p) => p !== featured);
  const open = (slug: string) => nav(`/blog/${slug}`);

  return (
    <MarketingShell>
      <Helmet>
        <title>Resources | mytuta</title>
        <meta name="description" content="Guides, stories and ideas for mastering STEM. Study techniques, teaching tips and real student results from mytuta." />
      </Helmet>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(20px,4vw,48px) clamp(28px,4vw,48px)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#7d7564", marginBottom: 20 }}>Resources</div>
        <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(44px,7vw,104px)", lineHeight: .95, letterSpacing: "-.045em", color: c.ink, maxWidth: 1000, textWrap: "balance" }}>Guides, stories and ideas for mastering STEM.</h1>
      </section>

      {/* Featured */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <button type="button" onClick={() => open(featured.slug)} className="mk-card" style={{ textAlign: "left", width: "100%", background: c.green, color: "#fff", border: "none", borderRadius: 24, padding: "clamp(28px,4vw,48px)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <CatPill label={featured.category} light />
            <span style={{ fontSize: 13, color: "#d6eee1" }}>{featured.readTime}</span>
          </div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(28px,3.8vw,52px)", lineHeight: 1.03, letterSpacing: "-.035em", maxWidth: 820 }}>{featured.title}</div>
          <div style={{ fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.5, maxWidth: 640, color: "#eafaf1" }}>{featured.excerpt}</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Read the guide →</div>
        </button>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(24px,3vw,32px) clamp(20px,4vw,48px) clamp(64px,8vw,112px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: 20 }}>
          {rest.map((p) => (
            <button key={p.slug} type="button" onClick={() => open(p.slug)} className="mk-card" style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 22, padding: 26, cursor: "pointer", display: "flex", flexDirection: "column", gap: 14, minHeight: 240 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <CatPill label={p.category} />
                <span style={{ fontSize: 12.5, color: c.faint }}>{p.readTime}</span>
              </div>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 21, lineHeight: 1.12, letterSpacing: "-.02em", color: c.ink }}>{p.title}</div>
              <div style={{ fontSize: 15, lineHeight: 1.5, color: c.soft, flex: 1 }}>{p.excerpt}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.greenDark }}>Read the guide →</div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: c.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(32px,4.4vw,56px)", lineHeight: 1, letterSpacing: "-.035em", color: "#fff", maxWidth: 620 }}>Got a question for the team?</h2>
          <button type="button" onClick={() => nav("/contact")} style={{ background: c.green, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 17, padding: "16px 28px", borderRadius: 999, cursor: "pointer" }}>Talk to us</button>
        </div>
      </section>
    </MarketingShell>
  );
}
