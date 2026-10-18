import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "@/mytuta/theme";

/** The mytuta progress-ring mark, used across the marketing pages. */
export function Ring({ size, dash, track, fill, style }: { size: number | string; dash: string; track: string; fill: string; style?: React.CSSProperties }) {
  const dim = typeof size === "number" ? size : undefined;
  return (
    <svg viewBox="0 0 44 44" width={dim} height={dim} style={{ width: typeof size === "string" ? size : undefined, ...style }}>
      <circle cx="22" cy="22" r="16" fill="none" stroke={track} strokeWidth="9" />
      <circle cx="22" cy="22" r="16" fill="none" stroke={fill} strokeWidth="9" strokeDasharray={dash} transform="rotate(-90 22 22)" />
    </svg>
  );
}

const marketingStyle = `
  .mk-a{transition:color .15s}
  .mk-nav:hover{color:#d6eee1 !important}
  .mk-aud:hover{color:${c.greenDark} !important}
  .mk-foot:hover{color:#fff !important}
  .mk-ghost:hover{background:#28905f}
  .mk-card{transition:transform .15s}
  .mk-card:hover{transform:translateY(-3px)}
`;

/** Green sticky header shared by the home and every marketing page. */
export function SiteHeader() {
  const nav = useNavigate();
  return (
    <header style={{ background: c.green, position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 0 #28905f" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "22px clamp(20px,4vw,48px)", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
        <button type="button" onClick={() => nav("/")} aria-label="mytuta home" style={{ display: "flex", alignItems: "flex-end", gap: 3, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-.035em", color: "#fff" }}>mytuta</div>
          <Ring size={11} dash="80 107" track="#1f7d53" fill="#fff" style={{ marginBottom: 4, flex: "none" }} />
        </button>
        <nav style={{ display: "flex", gap: 26, fontSize: 15, fontWeight: 500, marginLeft: "auto", flexWrap: "wrap" }}>
          <a onClick={() => nav("/signup?type=student")} className="mk-a mk-nav" style={{ color: "#fff", cursor: "pointer" }}>Students</a>
          <a onClick={() => nav("/signup?type=teacher")} className="mk-a mk-nav" style={{ color: "#fff", cursor: "pointer" }}>Teachers</a>
          <a onClick={() => nav("/contact")} className="mk-a mk-nav" style={{ color: "#fff", cursor: "pointer" }}>Schools</a>
          <a onClick={() => nav("/pricing")} className="mk-a mk-nav" style={{ color: "#fff", cursor: "pointer" }}>Pricing</a>
        </nav>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={() => nav("/signin")} className="mk-ghost" style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff", fontFamily: "inherit", fontWeight: 600, fontSize: 15, padding: "10px 18px", borderRadius: 999, cursor: "pointer" }}>Sign in</button>
          <button type="button" onClick={() => nav("/signup?type=student")} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Start free</button>
        </div>
      </div>
    </header>
  );
}

/** Dark footer shared by the home and every marketing page. */
export function SiteFooter() {
  const nav = useNavigate();
  return (
    <footer style={{ background: c.ink, color: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px clamp(20px,4vw,48px) 36px", display: "flex", flexWrap: "wrap", gap: "12px 28px", fontSize: 14, color: "#c7cdd4", alignItems: "center" }}>
        <button type="button" onClick={() => nav("/")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: font.display, fontWeight: 800, color: "#fff", fontSize: 17, letterSpacing: "-.03em" }}>mytuta</button>
        <a onClick={() => nav("/about")} className="mk-a mk-foot" style={{ color: "#c7cdd4", cursor: "pointer" }}>About</a>
        <a onClick={() => nav("/blog")} className="mk-a mk-foot" style={{ color: "#c7cdd4", cursor: "pointer" }}>Resources</a>
        <a onClick={() => nav("/contact")} className="mk-a mk-foot" style={{ color: "#c7cdd4", cursor: "pointer" }}>Contact</a>
        <div style={{ marginLeft: "auto" }}>Made for STEM classrooms across Africa</div>
      </div>
    </footer>
  );
}

/** Full marketing page shell: paper background, shared header + footer. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: c.paper, color: c.ink, fontFamily: font.body, WebkitFontSmoothing: "antialiased" }}>
      <style>{marketingStyle}</style>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
