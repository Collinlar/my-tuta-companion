import { useState } from "react";
import { a, card, sectionLabel, badgeTone, ghostBtn, input } from "./theme";
import { useConfig, useFlags, type ConfigRow, type FlagRow } from "./data/queries";
import { useSetConfig, useSetFlag } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

function valuePreview(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v || "—";
  return JSON.stringify(v);
}

export default function Settings() {
  const cfg = useConfig();
  const flags = useFlags();
  const setConfig = useSetConfig();
  const setFlag = useSetFlag();
  const [edit, setEdit] = useState<ConfigRow | null>(null);
  const [raw, setRaw] = useState("");
  const [flagConfirm, setFlagConfirm] = useState<FlagRow | null>(null);

  const openEdit = (r: ConfigRow) => {
    setEdit(r);
    setRaw(Array.isArray(r.value) ? (r.value as unknown[]).join(", ") : typeof r.value === "string" ? (r.value as string) : JSON.stringify(r.value));
  };

  const groups = (cfg.data ?? []).reduce<Record<string, ConfigRow[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r); return acc;
  }, {});

  return (
    <>
      <PageHeader title="Platform Settings" subtitle="Global configuration and feature flags. Editing is live; wiring some keys into runtime logic is a deferred follow-on." />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {cfg.isLoading ? <Loading /> : cfg.error || !cfg.data ? <ErrorNote message="Could not load configuration." /> : (
            Object.entries(groups).map(([cat, rows]) => (
              <section key={cat} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ ...sectionLabel, marginBottom: 12 }}>{cat}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {rows.map((r) => (
                    <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: `1px solid ${a.border2}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: a.ink }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: a.muted, fontFamily: "monospace" }}>{r.key}</div>
                      </div>
                      <div style={{ fontSize: 13, color: a.body, maxWidth: 260, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{valuePreview(r.value)}</div>
                      <button type="button" onClick={() => openEdit(r)} style={ghostBtn()}>Edit</button>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <section style={{ ...card, padding: "16px 18px", position: "sticky", top: 90 }}>
          <div style={{ ...sectionLabel, marginBottom: 12 }}>Feature flags</div>
          {flags.isLoading ? <Loading /> : flags.error || !flags.data ? <ErrorNote message="Could not load flags." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {flags.data.map((f) => (
                <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${a.border2}` }}>
                  <div style={{ flex: 1, fontSize: 13.5, color: a.ink }}>{f.label}</div>
                  <span style={badgeTone(f.enabled ? "green" : "neutral")}>{f.enabled ? "on" : "off"}</span>
                  <button type="button" onClick={() => setFlagConfirm(f)} style={ghostBtn()}>{f.enabled ? "Disable" : "Enable"}</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {edit && (
        <ActionModal title={`Edit “${edit.label}”`} confirmLabel="Save value" busy={setConfig.isPending}
          onClose={() => setEdit(null)}
          onConfirm={(reason) => {
            let value: unknown;
            if (Array.isArray(edit.value)) value = raw.split(",").map((s) => s.trim()).filter(Boolean);
            else if (typeof edit.value === "number") value = Number(raw);
            else if (typeof edit.value === "string") value = raw;
            else { try { value = JSON.parse(raw); } catch { value = raw; } }
            void setConfig.mutateAsync({ key: edit.key, value, reason }).then(() => setEdit(null));
          }}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{Array.isArray(edit.value) ? "Value (comma-separated)" : "Value"}</label>
            <input value={raw} onChange={(e) => setRaw(e.target.value)} style={input} /></div>} />
      )}
      {flagConfirm && (
        <ActionModal title={`${flagConfirm.enabled ? "Disable" : "Enable"} “${flagConfirm.label}”?`} confirmLabel={flagConfirm.enabled ? "Disable" : "Enable"} danger={flagConfirm.enabled} busy={setFlag.isPending}
          onClose={() => setFlagConfirm(null)}
          onConfirm={(reason) => { void setFlag.mutateAsync({ key: flagConfirm.key, enabled: !flagConfirm.enabled, reason }).then(() => setFlagConfirm(null)); }} />
      )}
    </>
  );
}
