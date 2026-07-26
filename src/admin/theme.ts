import type { CSSProperties } from "react";

/**
 * mytuta Admin Panel design tokens — a calm, dense, professional slate
 * system, deliberately distinct from the student/teacher paper+green app
 * (PRD §34: professional, calm, trustworthy, operationally clear). Screens
 * use inline styles built from these tokens, matching the app's convention.
 */
export const a = {
  bg: "#f4f5f7",          // app background
  panel: "#ffffff",       // cards / panels
  panelAlt: "#fafbfc",    // zebra / subtle fill
  sidebar: "#141a22",     // dark left rail
  sidebarText: "#aab4c0",
  sidebarActive: "#1f2a37",

  ink: "#1a2230",         // primary text
  body: "#33404f",
  muted: "#697586",
  faint: "#8a97a6",
  border: "#e3e7ec",
  border2: "#eceff2",

  brand: "#1f7d53",       // mytuta green, used sparingly for primary
  brandTint: "#e9f5ef",

  blue: "#2f6feb",
  blueTint: "#eaf1fe",
  amber: "#b7791f",
  amberTint: "#fdf6e7",
  red: "#c0362b",
  redTint: "#fceceb",
  green: "#1f7d53",
  greenTint: "#e9f5ef",
  purple: "#6b4fc4",
  purpleTint: "#f0edfb",
} as const;

export const afont = {
  body: "'Hanken Grotesque', system-ui, -apple-system, sans-serif",
  display: "'Bricolage Grotesque', 'Hanken Grotesque', sans-serif",
  mono: "'SFMono-Regular', ui-monospace, 'Menlo', monospace",
};

/** Status badge colours by semantic tone. */
export function badgeTone(tone: "neutral" | "green" | "blue" | "amber" | "red" | "purple"): CSSProperties {
  const map: Record<string, [string, string]> = {
    neutral: [a.muted, a.border2],
    green: [a.green, a.greenTint],
    blue: [a.blue, a.blueTint],
    amber: [a.amber, a.amberTint],
    red: [a.red, a.redTint],
    purple: [a.purple, a.purpleTint],
  };
  const [fg, bg] = map[tone] || map.neutral;
  return {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11.5, fontWeight: 600, color: fg, background: bg,
    padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap",
  };
}

export const card: CSSProperties = {
  background: a.panel, border: `1px solid ${a.border}`, borderRadius: 12,
};

export const sectionLabel: CSSProperties = {
  fontSize: 11, fontWeight: 700, color: a.faint, letterSpacing: ".06em",
  textTransform: "uppercase",
};

export function primaryBtn(disabled = false): CSSProperties {
  return {
    background: a.brand, color: "#fff", border: "none", fontWeight: 600,
    fontSize: 13.5, padding: "9px 16px", borderRadius: 9,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1,
  };
}

export function ghostBtn(): CSSProperties {
  return {
    background: a.panel, color: a.body, border: `1px solid ${a.border}`,
    fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 9,
    cursor: "pointer",
  };
}

export function dangerBtn(): CSSProperties {
  return {
    background: a.redTint, color: a.red, border: `1px solid #f0c7c3`,
    fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 9,
    cursor: "pointer",
  };
}

export const th: CSSProperties = {
  textAlign: "left", fontSize: 11, fontWeight: 700, color: a.faint,
  letterSpacing: ".04em", textTransform: "uppercase", padding: "10px 14px",
  borderBottom: `1px solid ${a.border}`, whiteSpace: "nowrap",
};

export const td: CSSProperties = {
  fontSize: 13, color: a.body, padding: "11px 14px",
  borderBottom: `1px solid ${a.border2}`, verticalAlign: "middle",
};

export const input: CSSProperties = {
  width: "100%", border: `1px solid ${a.border}`, borderRadius: 8,
  padding: "9px 12px", fontSize: 13.5, fontFamily: "inherit", color: a.ink,
  background: a.panel,
};
