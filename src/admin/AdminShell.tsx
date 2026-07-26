import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { a, afont } from "./theme";
import { useAdminRole } from "./data/queries";
import { supabase } from "@/integrations/supabase/client";

interface NavItem { label: string; path: string; enabled: boolean; group?: string }

// Enabled flags flip on as each module phase lands. Order follows PRD §8.
const NAV: NavItem[] = [
  { label: "Overview", path: "/admin/overview", enabled: true },
  { label: "Users", path: "/admin/users", enabled: true, group: "Operations" },
  { label: "Credits", path: "/admin/credits", enabled: true },
  { label: "Plans", path: "/admin/plans", enabled: true },
  { label: "Subscriptions", path: "/admin/subscriptions", enabled: true },
  { label: "Payments", path: "/admin/payments", enabled: true },
  { label: "Reconciliation", path: "/admin/reconciliation", enabled: true },
  { label: "Concepts", path: "/admin/concepts", enabled: true, group: "Content" },
  { label: "Questions", path: "/admin/questions", enabled: true },
  { label: "Assessments", path: "/admin/assessments", enabled: true },
  { label: "AI Operations", path: "/admin/ai", enabled: true, group: "Platform" },
  { label: "AI Jobs", path: "/admin/ai/jobs", enabled: true },
  { label: "Support", path: "/admin/support", enabled: true },
  { label: "Settings", path: "/admin/settings", enabled: true },
  { label: "Audit Log", path: "/admin/audit", enabled: true },
];

const roleLabel: Record<string, string> = {
  super: "Super Admin", product: "Product Admin", content: "Content Admin",
  finance: "Finance Admin", support: "Support Admin", analyst: "Analyst",
};

export default function AdminShell() {
  const nav = useNavigate();
  const loc = useLocation();
  const { data: role } = useAdminRole();

  const signOut = async () => { await supabase.auth.signOut(); nav("/signin"); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: a.bg, color: a.ink, fontFamily: afont.body }}>
      <nav aria-label="Admin" style={{ width: 232, flex: "none", background: a.sidebar, color: a.sidebarText, display: "flex", flexDirection: "column", padding: "20px 14px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 18px" }}>
          <span style={{ fontFamily: afont.display, fontWeight: 700, fontSize: 19, color: "#fff" }}>mytuta</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: a.brand, background: "rgba(31,125,83,.18)", padding: "2px 7px", borderRadius: 5, letterSpacing: ".04em" }}>ADMIN</span>
        </div>
        {NAV.map((item, i) => {
          const on = loc.pathname.startsWith(item.path);
          const showGroup = item.group && item.group !== NAV[i - 1]?.group;
          return (
            <div key={item.path}>
              {showGroup && <div style={{ fontSize: 10, fontWeight: 700, color: "#5b6675", letterSpacing: ".08em", textTransform: "uppercase", padding: "14px 8px 6px" }}>{item.group}</div>}
              <button
                type="button"
                disabled={!item.enabled}
                onClick={() => item.enabled && nav(item.path)}
                title={item.enabled ? item.label : `${item.label} — coming soon`}
                style={{
                  width: "100%", textAlign: "left", border: "none", borderRadius: 8,
                  background: on ? a.sidebarActive : "transparent",
                  color: on ? "#fff" : item.enabled ? a.sidebarText : "#4a5563",
                  fontWeight: on ? 600 : 500, fontSize: 13.5, padding: "9px 10px", marginBottom: 1,
                  cursor: item.enabled ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                {item.label}
                {!item.enabled && <span style={{ fontSize: 9.5, color: "#4a5563" }}>soon</span>}
              </button>
            </div>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontSize: 12, color: "#8894a3", padding: "0 8px 8px" }}>{role ? roleLabel[role] || role : ""}</div>
          <button type="button" onClick={signOut} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", color: a.sidebarText, fontSize: 13, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}>Sign out</button>
        </div>
      </nav>

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
