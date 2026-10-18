import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { MarketingShell } from "./chrome";

export interface ArticleMeta {
  title: string;
  category: string;
  date: string;
  readTime: string;
  description: string;
}

// One stylesheet styles the prose for every article, so each article body is
// just semantic HTML (h2/h3/p/ul/blockquote) plus .mk-box / .mk-grid helpers.
const prose = `
.mk-article{max-width:740px;margin:0 auto;padding:clamp(28px,4vw,52px) clamp(20px,4vw,32px) clamp(56px,7vw,96px);font-size:18px;line-height:1.72;color:${c.body};}
.mk-article > *:first-child{margin-top:0;}
.mk-article h2{font-family:${font.display};font-weight:800;font-size:clamp(26px,3.2vw,40px);letter-spacing:-.03em;line-height:1.08;color:${c.ink};margin:52px 0 18px;}
.mk-article h3{font-weight:700;font-size:clamp(18.5px,2vw,22px);color:${c.ink};margin:30px 0 10px;}
.mk-article p{margin:0 0 20px;}
.mk-article ul,.mk-article ol{margin:0 0 20px;padding-left:22px;}
.mk-article li{margin:0 0 9px;}
.mk-article li::marker{color:${c.green};}
.mk-article a{color:${c.greenDark};font-weight:600;text-decoration:underline;text-underline-offset:2px;}
.mk-article strong{color:${c.ink};font-weight:700;}
.mk-article blockquote{margin:0 0 24px;padding:2px 0 2px 20px;border-left:3px solid ${c.greenTintBorder};font-size:21px;line-height:1.5;color:${c.soft};}
.mk-article blockquote cite{display:block;font-size:14.5px;color:${c.faint};font-style:normal;margin-top:10px;}
.mk-lead{font-size:clamp(19px,1.7vw,23px);line-height:1.55;color:${c.soft};margin:0 0 30px;}
.mk-box{background:${c.surface};border:1px solid ${c.border2};border-radius:18px;padding:24px 26px;margin:0 0 20px;}
.mk-box > *:first-child{margin-top:0;}
.mk-box > *:last-child{margin-bottom:0;}
.mk-box.green{background:${c.greenTint};border-color:${c.greenTintBorder};}
.mk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px;margin:0 0 20px;}
.mk-grid .mk-box{margin:0;}
.mk-kicker{font-family:${font.display};font-weight:800;font-size:34px;line-height:1;color:${c.green};}
`;

/** Shared bold layout for every blog article: new chrome, bold hero, prose. */
export function ArticleLayout({ meta, children }: { meta: ArticleMeta; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <MarketingShell>
      <Helmet>
        <title>{meta.title} | mytuta</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <section style={{ maxWidth: 740, margin: "0 auto", padding: "clamp(40px,6vw,76px) clamp(20px,4vw,32px) 0" }}>
        <a onClick={() => nav("/blog")} style={{ fontSize: 14, fontWeight: 600, color: c.greenDark, cursor: "pointer" }}>← Resources</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "24px 0 18px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.greenDark, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, padding: "4px 11px", borderRadius: 999 }}>{meta.category}</span>
          <span style={{ fontSize: 13.5, color: c.faint }}>{meta.date} · {meta.readTime}</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(34px,5vw,66px)", lineHeight: 1.02, letterSpacing: "-.035em", color: c.ink, textWrap: "balance" }}>{meta.title}</h1>
      </section>

      <style>{prose}</style>
      <article className="mk-article">{children}</article>

      <section style={{ background: c.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,88px) clamp(20px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(28px,3.6vw,48px)", letterSpacing: "-.03em", lineHeight: 1.02, color: "#fff", maxWidth: 560 }}>Put it into practice with mytuta.</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: c.green, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 999, cursor: "pointer" }}>Start learning free</button>
            <button type="button" onClick={() => nav("/blog")} style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.5)", fontFamily: "inherit", fontWeight: 600, fontSize: 16, padding: "14px 24px", borderRadius: 999, cursor: "pointer" }}>More resources</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
