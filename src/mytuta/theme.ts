import type { CSSProperties } from "react";

/**
 * mytuta design tokens — lifted verbatim from the Claude Design import
 * (project "Tuta Study Buddy Redesign"). The app screens use inline styles
 * built from these tokens to match the design pixel-for-pixel.
 */
export const c = {
  paper: "#f6f3ec",
  surface: "#fffdf8",
  ink: "#2b3440",
  body: "#33372f",
  muted: "#8a8270",
  faint: "#9a927f",
  placeholder: "#b3ac9c",
  soft: "#5c5748",

  green: "#2e9e6b",
  greenDark: "#1f7d53",
  greenTint: "#eaf5ef",
  greenTintBorder: "#cfe6d8",

  border: "#e6dfd0",
  border2: "#ece5d7",
  track: "#eee7d9",
  divider: "#f3efe4",

  amber: "#c47a17",
  amberTint: "#fff7e9",
  amberBorder: "#f0dcb6",

  plum: "#6b5aa8",
  plumDeep: "#463880",
  plumTint: "#f0edf7",
  plumBorder: "#ddd5ef",

  blue: "#3f8fc4",
  blueTint: "#eaf1f7",

  red: "#c05a2e",
  redTint: "#fff0eb",
} as const;

export const font = {
  display: "'Bricolage Grotesque', 'Hanken Grotesque', sans-serif",
  body: "'Hanken Grotesque', system-ui, sans-serif",
};

/** Mastery-state colour pair [foreground, background]. */
export function level(l: string): [string, string] {
  const m: Record<string, [string, string]> = {
    Beginning: [c.amber, c.amberTint],
    Developing: [c.blue, c.blueTint],
    Secure: [c.green, c.greenTint],
    Mastered: [c.plum, c.plumTint],
  };
  return m[l] || m.Developing;
}

/** Rounded selectable chip (multi-select style). */
export function chip(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? c.green : c.border}`,
    background: active ? c.greenTint : c.surface,
    color: active ? c.greenDark : c.soft,
    fontWeight: active ? 600 : 500,
    fontSize: 13.5,
    padding: "11px 17px",
    borderRadius: 11,
    cursor: "pointer",
    transition: "all .12s",
    display: "flex",
    alignItems: "center",
  };
}

/** Segmented-control button. */
export function seg(active: boolean): CSSProperties {
  return {
    border: "none",
    background: active ? "#fff" : "transparent",
    color: active ? c.greenDark : c.muted,
    fontWeight: 600,
    fontSize: 12.5,
    padding: "7px 13px",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: active ? "0 1px 4px rgba(30,40,32,.1)" : "none",
  };
}

/** Pill filter (solid green when active). */
export function filter(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? c.green : c.border2}`,
    background: active ? c.green : c.surface,
    color: active ? "#fff" : c.soft,
    fontWeight: active ? 600 : 500,
    fontSize: 13,
    padding: "8px 15px",
    borderRadius: 20,
    cursor: "pointer",
  };
}

/** Large selectable card (role choice, etc.). */
export function chipCard(active: boolean): CSSProperties {
  return {
    textAlign: "left",
    background: active ? c.greenTint : c.surface,
    border: `1.5px solid ${active ? c.green : c.border2}`,
    borderRadius: 14,
    padding: "18px 20px",
    cursor: "pointer",
    transition: "all .12s",
    width: "100%",
  };
}

/** Common surface card. */
export const card: CSSProperties = {
  background: c.surface,
  border: `1px solid ${c.border2}`,
  borderRadius: 16,
};

/** Primary button. */
export function primaryBtn(extra: CSSProperties = {}): CSSProperties {
  return {
    background: c.green,
    color: "#fff",
    border: "none",
    fontWeight: 600,
    fontSize: 15,
    padding: 14,
    borderRadius: 12,
    cursor: "pointer",
    ...extra,
  };
}

/** Ghost / secondary button. */
export function ghostBtn(extra: CSSProperties = {}): CSSProperties {
  return {
    background: "none",
    border: `1px solid ${c.border}`,
    color: c.soft,
    fontWeight: 600,
    fontSize: 14,
    padding: "13px 22px",
    borderRadius: 12,
    cursor: "pointer",
    ...extra,
  };
}

/** Small uppercase section label. */
export const sectionLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: c.faint,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  marginBottom: 11,
};
