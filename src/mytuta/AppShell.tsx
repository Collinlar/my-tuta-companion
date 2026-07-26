import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { c, font } from "./theme";
import { useRole, getInitials, hydrateRoleFromDb } from "./useRole";
import { useUnreadNotificationCount, useProfile, useWalletSummary } from "./data/queries";
import { CreditGateProvider } from "./credits/CreditGate";
import { useIntelligenceBadges } from "./intelligence/data";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavDef {
  key: string;
  label: string;
  icon: string;
  path: string;
  match: (p: string) => boolean;
}

const studentNav: NavDef[] = [
  { key: "home", label: "Home", icon: "⌂", path: "/student/home", match: (p) => p.startsWith("/student/home") },
  { key: "learn", label: "Learn", icon: "▤", path: "/student/learn", match: (p) => p.startsWith("/student/learn") || p.startsWith("/student/mastery") },
  { key: "solve", label: "Solve", icon: "⌱", path: "/student/solve", match: (p) => p.startsWith("/student/solve") },
  { key: "lab", label: "Lab", icon: "◈", path: "/student/lab", match: (p) => p.startsWith("/student/lab") },
  { key: "challenges", label: "Challenge", icon: "⬡", path: "/student/challenges", match: (p) => p.startsWith("/student/challenges") },
  { key: "progress", label: "Progress", icon: "◔", path: "/student/progress", match: (p) => p.startsWith("/student/progress") },
];

const teacherNav: NavDef[] = [
  { key: "home", label: "Home", icon: "⌂", path: "/teacher/home", match: (p) => p.startsWith("/teacher/home") },
  { key: "experiences", label: "Experience", icon: "▤", path: "/teacher/experiences", match: (p) => p.startsWith("/teacher/experiences") && !p.includes("/new") },
  { key: "create", label: "Create", icon: "＋", path: "/teacher/experiences/new", match: (p) => p.includes("/experiences/new") },
  { key: "classes", label: "Classes", icon: "◫", path: "/teacher/classes", match: (p) => p.startsWith("/teacher/classes") },
  { key: "assessments", label: "Assess", icon: "◉", path: "/teacher/assessments", match: (p) => p.startsWith("/teacher/assessments") || p.startsWith("/teacher/assignments") },
  { key: "insights", label: "Insights", icon: "◔", path: "/teacher/insights", match: (p) => p.startsWith("/teacher/insights") },
];

const titleMap: Record<string, string> = {
  home: "Home", learn: "Learn", solve: "Solve", lab: "STEM Lab", challenges: "Challenges", progress: "Progress",
  experiences: "Experiences", create: "Create", classes: "Classes", assessments: "Assessments", insights: "Insights",
};

export default function AppShell() {
  const [role] = useRole();
  const nav = useNavigate();
  const loc = useLocation();
  const mobile = useIsMobile();
  const hydrated = useRef(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const items = role === "teacher" ? teacherNav : studentNav;

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    void hydrateRoleFromDb().then((r) => {
      if (r && loc.pathname.startsWith("/student") && r === "teacher") {
        nav("/teacher/home", { replace: true });
      } else if (r && loc.pathname.startsWith("/teacher") && r === "student") {
        nav("/student/home", { replace: true });
      }
    });
  }, [loc.pathname, nav]);

  useEffect(() => {
    setMoreOpen(false);
  }, [loc.pathname]);

  const active = useMemo(() => items.find((i) => i.match(loc.pathname)) || items[0], [items, loc.pathname]);
  const isNotifications = loc.pathname.startsWith("/notifications");
  const isProfile = loc.pathname.startsWith("/profile");
  const isSettings = loc.pathname.startsWith("/settings");
  const isHelp = loc.pathname.startsWith("/help");
  const isWallet = loc.pathname.startsWith("/wallet");
  const isStudio = loc.pathname.includes("/experiences/") && loc.pathname.includes("/edit");
  const pageTitle = isNotifications ? "Notifications" : isProfile ? "Profile" : isSettings ? "Settings" : isHelp ? "Help" : isWallet ? "Wallet" : isStudio ? "Experience studio" : titleMap[active.key] || "mytuta";
  const roleLabel = role === "teacher" ? "Teacher" : "Student";
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: wallet } = useWalletSummary();
  const { data: profile } = useProfile();
  const badges = useIntelligenceBadges();

  const primaryMobile = items.slice(0, 4);
  const moreItems = items.slice(4);

  return (
    <div style={{ height: "100dvh", display: "flex", background: c.paper, color: c.ink, overflow: "hidden", fontFamily: font.body }}>
      {/* Desktop side rail */}
      {!mobile && (
        <nav aria-label="Primary" style={{ width: 76, flex: "none", background: c.green, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0", gap: 6, zIndex: 5 }}>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 14, lineHeight: 1 }}>
            m<span style={{ color: "#bfe0cf" }}>.</span>
          </div>
          {items.map((item) => {
            const on = active.key === item.key;
            const badge = role === "teacher" ? 0 : badges[item.key] || 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => nav(item.path)}
                title={item.label}
                style={{
                  position: "relative",
                  width: 58, height: 56, border: "none", borderRadius: 12,
                  background: on ? "rgba(255,255,255,.18)" : "transparent",
                  color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 4, cursor: "pointer", opacity: on ? 1 : 0.82,
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".01em" }}>{item.label}</span>
                {badge > 0 && (
                  <span aria-hidden="true" style={{ position: "absolute", top: 7, right: 12, minWidth: item.key === "home" ? 8 : 16, height: item.key === "home" ? 8 : 16, padding: item.key === "home" ? 0 : "0 4px", borderRadius: 8, background: "#e8a020", color: "#3a2600", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                    {item.key === "home" ? "" : badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => nav("/profile")} title="Your profile" aria-label="Your profile" style={{ width: 34, height: 34, borderRadius: "50%", background: "#dcd3c0", border: "2px solid rgba(255,255,255,.25)", color: "#6b6456", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0 }}>
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials()}
            </button>
          </div>
        </nav>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: c.paper }}>
        <header style={{
          minHeight: 56, flex: "none", display: "flex", alignItems: "center", gap: mobile ? 10 : 16,
          padding: mobile ? "0 14px" : "0 30px",
          borderBottom: `1px solid ${c.border2}`,
          background: "rgba(243,244,241,.85)",
          backdropFilter: "blur(6px)",
        }}
        >
          {mobile && (
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: c.green, marginRight: 4 }}>
              m<span style={{ color: c.ink }}>.</span>
            </div>
          )}
          <div style={{ fontWeight: 600, fontSize: mobile ? 15 : 15, letterSpacing: "-.01em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pageTitle}</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: mobile ? 8 : 12, flexShrink: 0 }}>
            {!mobile && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 9, padding: "8px 14px", color: c.faint, fontSize: 13, minWidth: 220 }}>
                  <span style={{ fontSize: 13 }}>⌕</span>
                  <span>Search concepts, topics, activities</span>
                </div>
                <span style={{ border: `1px solid ${c.border2}`, background: c.surface, color: c.soft, fontWeight: 600, fontSize: 12, padding: "7px 13px", borderRadius: 9 }}>{roleLabel}</span>
              </>
            )}
            <button type="button" onClick={() => nav("/wallet")} aria-label={`Wallet, ${wallet?.total ?? 0} Tuta Credits`} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${c.greenTintBorder}`, background: c.greenTint, color: c.greenDark, fontWeight: 700, fontSize: 13, padding: mobile ? "8px 10px" : "7px 13px", borderRadius: 9, cursor: "pointer", minHeight: 44 }}>
              <span aria-hidden="true">◆</span>{wallet?.total ?? 0}
            </button>
            <button type="button" onClick={() => nav("/notifications")} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} style={{ position: "relative", width: 44, height: 44, borderRadius: 9, border: `1px solid ${c.border2}`, background: c.surface, fontSize: 15, color: "#6b6456", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span aria-hidden="true">◔</span>
              {!!unreadCount && (
                <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "#c05a2e", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            {!mobile && (
              <>
                <button type="button" onClick={() => nav("/settings")} title="Settings" aria-label="Settings" style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${c.border2}`, background: c.surface, fontSize: 15, color: "#6b6456", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span aria-hidden="true">⚙</span></button>
                <button type="button" onClick={() => nav("/help")} title="Help" aria-label="Help" style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${c.border2}`, background: c.surface, fontSize: 14, fontWeight: 700, color: "#6b6456", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span aria-hidden="true">?</span></button>
              </>
            )}
            {mobile && (
              <button type="button" onClick={() => nav("/profile")} aria-label="Your profile" style={{ width: 40, height: 40, borderRadius: "50%", background: "#dcd3c0", border: `1px solid ${c.border2}`, color: "#6b6456", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0 }}>
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials()}
              </button>
            )}
          </div>
        </header>

        <div className="mytuta-main" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
          <CreditGateProvider>
            <Outlet />
          </CreditGateProvider>
        </div>

        {/* Mobile bottom nav */}
        {mobile && (
          <nav
            aria-label="Primary"
            style={{
              flex: "none",
              display: "flex",
              alignItems: "stretch",
              borderTop: `1px solid ${c.border2}`,
              background: c.surface,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              zIndex: 20,
            }}
          >
            {primaryMobile.map((item) => {
              const on = active.key === item.key;
              const badge = role === "teacher" ? 0 : badges[item.key] || 0;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => nav(item.path)}
                  style={{
                    flex: 1, minHeight: 56, border: "none", background: "transparent",
                    color: on ? c.green : c.faint, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer",
                    position: "relative", fontWeight: on ? 700 : 500, fontSize: 10,
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {badge > 0 && (
                    <span style={{ position: "absolute", top: 6, right: "28%", width: 7, height: 7, borderRadius: "50%", background: "#e8a020" }} />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              style={{
                flex: 1, minHeight: 56, border: "none", background: "transparent",
                color: moreOpen || moreItems.some((i) => i.key === active.key) ? c.green : c.faint,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, cursor: "pointer", fontWeight: 600, fontSize: 10,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
              <span>More</span>
            </button>
          </nav>
        )}

        {mobile && moreOpen && (
          <>
            <button type="button" aria-label="Close menu" onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,24,28,.35)", border: "none", zIndex: 30 }} />
            <div style={{
              position: "fixed", left: 12, right: 12, bottom: 72, zIndex: 40,
              background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16,
              padding: 10, boxShadow: "0 16px 40px rgba(30,40,32,.18)",
            }}
            >
              {[...moreItems, { key: "settings", label: "Settings", icon: "⚙", path: "/settings", match: () => false }, { key: "help", label: "Help", icon: "?", path: "/help", match: () => false }, { key: "wallet", label: "Wallet", icon: "◆", path: "/wallet", match: () => false }].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { setMoreOpen(false); nav(item.path); }}
                  style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 12px", border: "none", background: "transparent", borderRadius: 10,
                    color: c.ink, fontWeight: 600, fontSize: 14.5, cursor: "pointer", minHeight: 48,
                  }}
                >
                  <span style={{ width: 28, textAlign: "center", color: c.green }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
