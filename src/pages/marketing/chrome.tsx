import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "@/mytuta/theme";
import { useAuthState } from "@/hooks/useAuthState";

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
  .mk-desk{display:flex;align-items:center;gap:28px;margin-left:auto}
  .mk-burger{display:none;margin-left:auto;align-items:center;gap:10px}
  .mk-panel{display:none}
  @media (max-width:767px){
    .mk-desk{display:none}
    .mk-burger{display:flex}
  }
  @media (min-width:768px){
    .mk-panel{display:none !important}
  }
`;

/** Green sticky header shared by the home and every marketing page. */
export function SiteHeader() {
  const nav = useNavigate();
  const { authed, homePath } = useAuthState();
  const [open, setOpen] = useState(false);
  const go = (to: string) => { setOpen(false); nav(to); };

  const links = [
    { name: "Students", to: "/signup?type=student" },
    { name: "Teachers", to: "/signup?type=teacher" },
    { name: "Schools", to: "/contact" },
    { name: "Pricing", to: "/pricing" },
  ];

  return (
    <header style={{ background: c.green, position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 0 #28905f" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(13px,2.4vw,22px) clamp(20px,4vw,48px)", display: "flex", alignItems: "center", gap: 20 }}>
        <button type="button" onClick={() => go("/")} aria-label="mytuta home" style={{ display: "flex", alignItems: "flex-end", gap: 3, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-.035em", color: "#fff" }}>mytuta</div>
          <Ring size={11} dash="80 107" track="#1f7d53" fill="#fff" style={{ marginBottom: 4, flex: "none" }} />
        </button>

        {/* Desktop: full nav + auth */}
        <div className="mk-desk">
          <nav style={{ display: "flex", gap: 26, fontSize: 15, fontWeight: 500 }}>
            {links.map((l) => (
              <a key={l.name} onClick={() => go(l.to)} className="mk-a mk-nav" style={{ color: "#fff", cursor: "pointer" }}>{l.name}</a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {authed ? (
              <button type="button" onClick={() => go(homePath)} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Go to mytuta</button>
            ) : (
              <>
                <button type="button" onClick={() => go("/signin")} className="mk-ghost" style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff", fontFamily: "inherit", fontWeight: 600, fontSize: 15, padding: "10px 18px", borderRadius: 999, cursor: "pointer" }}>Sign in</button>
                <button type="button" onClick={() => go("/signup?type=student")} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Start free</button>
              </>
            )}
          </div>
        </div>

        {/* Mobile: one CTA + menu toggle */}
        <div className="mk-burger">
          <button type="button" onClick={() => go(authed ? homePath : "/signup?type=student")} style={{ background: "#fff", color: c.greenDark, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 14.5, padding: "9px 16px", borderRadius: 999, cursor: "pointer" }}>{authed ? "Go to mytuta" : "Start free"}</button>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1.5px solid #fff", borderRadius: 12, cursor: "pointer", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="mk-panel" style={{ borderTop: "1px solid #28905f", padding: "6px clamp(20px,4vw,48px) 14px", display: "flex", flexDirection: "column" }}>
          {links.map((l) => (
            <a key={l.name} onClick={() => go(l.to)} style={{ color: "#fff", fontSize: 16.5, fontWeight: 600, padding: "13px 0", borderBottom: "1px solid #28905f", cursor: "pointer" }}>{l.name}</a>
          ))}
          <button type="button" onClick={() => go(authed ? homePath : "/signin")} style={{ marginTop: 14, background: "transparent", color: "#fff", border: "1.5px solid #fff", fontFamily: "inherit", fontWeight: 600, fontSize: 16, padding: "13px 18px", borderRadius: 999, cursor: "pointer", textAlign: "center" }}>{authed ? "Go to mytuta" : "Sign in"}</button>
        </div>
      )}
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
