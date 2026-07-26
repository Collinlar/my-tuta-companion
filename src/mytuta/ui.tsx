import type { CSSProperties, ReactNode } from "react";
import { c, font, level } from "./theme";

/** Centered content column used by every in-app screen. */
export function Page({ maxWidth = 760, pad = "44px 40px 72px", children }: { maxWidth?: number; pad?: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth, margin: "0 auto", padding: pad, animation: "fadeup .3s ease" }}>{children}</div>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11, ...style }}>{children}</div>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 17 }}>
      <div style={{ fontFamily: font.display, fontSize: 27, lineHeight: 1, color: c.green }}>{value}</div>
      <div style={{ fontSize: 12, color: c.faint, marginTop: 6 }}>{label}</div>
    </div>
  );
}

export function Bar({ pct, color = c.green, height = 7 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ height, background: c.track, borderRadius: 5, overflow: "hidden" }}>
      <span style={{ display: "block", height: "100%", borderRadius: 5, background: color, width: `${pct}%` }} />
    </div>
  );
}

export function LevelPill({ level: l, width }: { level: string; width?: number }) {
  const [fg, bg] = level(l);
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color: fg, background: bg, padding: "4px 11px", borderRadius: 20, width, textAlign: width ? "center" : undefined, display: "inline-block" }}>{l}</span>
  );
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← {label}</button>
  );
}

/** Calm loading state (no spinner-with-no-context). */
export function Loading({ label = "Loading your learning…" }: { label?: string }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 40px", textAlign: "center", color: c.faint, fontSize: 14.5, animation: "fadein .3s ease" }}>{label}</div>
  );
}

/** Empty state with a clear next action. */
export function EmptyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "64px 40px", textAlign: "center", animation: "fadeup .3s ease" }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14.5, color: c.muted, lineHeight: 1.6, marginBottom: actionLabel ? 22 : 0 }}>{body}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: "12px 22px", borderRadius: 12, cursor: "pointer" }}>{actionLabel}</button>
      )}
    </div>
  );
}
