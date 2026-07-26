import { useState, type ReactNode } from "react";
import { a, afont, primaryBtn, ghostBtn, input } from "./theme";

/** Sticky page header used across admin screens. */
export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(244,245,247,.9)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${a.border}`, padding: "18px 30px", display: "flex", alignItems: "center", gap: 16 }}>
      <div>
        <div style={{ fontFamily: afont.display, fontSize: 20, fontWeight: 600, color: a.ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: a.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>{right}</div>}
    </header>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div style={{ padding: 40, color: a.muted, fontSize: 14 }}>{label}</div>;
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div style={{ margin: 30, padding: "14px 18px", background: a.redTint, border: "1px solid #f0c7c3", borderRadius: 10, color: a.red, fontSize: 13.5 }}>
      {message}
    </div>
  );
}

/**
 * Confirm-with-mandatory-reason modal used for every sensitive admin action
 * (PRD §32: "sensitive actions require confirmation and reason entry"). The
 * confirm button is disabled until a reason is entered. `extra` renders any
 * additional inputs (amount, days, target role) above the reason field.
 */
export function ActionModal({
  title, description, confirmLabel, danger, busy, extra, onConfirm, onClose,
}: {
  title: string; description?: string; confirmLabel: string; danger?: boolean;
  busy?: boolean; extra?: ReactNode; onConfirm: (reason: string) => void; onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const ready = reason.trim().length >= 3 && !busy;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,26,34,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: a.panel, border: `1px solid ${a.border}`, borderRadius: 14, padding: 22, width: 440, maxWidth: "100%" }}>
        <div style={{ fontFamily: afont.display, fontSize: 17, fontWeight: 600, color: a.ink, marginBottom: description ? 6 : 14 }}>{title}</div>
        {description && <div style={{ fontSize: 13.5, color: a.muted, lineHeight: 1.5, marginBottom: 14 }}>{description}</div>}
        {extra}
        <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6, marginTop: extra ? 12 : 0 }}>Reason (required, audited)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Why are you doing this?" style={{ ...input, resize: "vertical", marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={ghostBtn()}>Cancel</button>
          <button type="button" disabled={!ready} onClick={() => onConfirm(reason.trim())}
            style={{ ...primaryBtn(!ready), ...(danger && ready ? { background: a.red } : {}) }}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
