import { useState } from "react";
import { a, card, th, td, badgeTone, ghostBtn, input } from "./theme";
import { usePlansAdmin, type PlanRow } from "./data/queries";
import { useUpsertPlan } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

export default function Plans() {
  const { data, isLoading, error } = usePlansAdmin();
  const upsert = useUpsertPlan();
  const [edit, setEdit] = useState<PlanRow | null>(null);
  const [f, setF] = useState<PlanRow | null>(null);

  const open = (p: PlanRow) => { setEdit(p); setF({ ...p }); };
  const set = (k: keyof PlanRow, v: unknown) => setF((p) => (p ? { ...p, [k]: v } : p));

  return (
    <>
      <PageHeader title="Plans" subtitle="Subscription plan catalog. Editing here does not yet re-wire live billing (documented follow-on)." />
      <div style={{ padding: 30 }}>
        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load plans." /> : (
          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Plan</th><th style={th}>Role</th>
                <th style={{ ...th, textAlign: "right" }}>Price</th><th style={{ ...th, textAlign: "right" }}>Founding</th>
                <th style={{ ...th, textAlign: "right" }}>Credits/mo</th><th style={{ ...th, textAlign: "right" }}>Rollover cap</th>
                <th style={th}>Status</th><th style={th}></th>
              </tr></thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, fontWeight: 600, color: a.ink }}>{p.name}</td>
                    <td style={td}><span style={badgeTone(p.role === "teacher" ? "purple" : "blue")}>{p.role}</span></td>
                    <td style={{ ...td, textAlign: "right" }}>GHS {p.price_ghs}</td>
                    <td style={{ ...td, textAlign: "right", color: a.muted }}>{p.founding_price != null ? "GHS " + p.founding_price : "—"}</td>
                    <td style={{ ...td, textAlign: "right" }}>{p.included_credits}</td>
                    <td style={{ ...td, textAlign: "right" }}>{p.rollover_cap}</td>
                    <td style={td}><span style={badgeTone(p.active ? "green" : "neutral")}>{p.active ? "active" : "off"}</span></td>
                    <td style={{ ...td, textAlign: "right" }}><button type="button" onClick={() => open(p)} style={ghostBtn()}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {edit && f && (
        <ActionModal title={`Edit “${edit.name}”`} confirmLabel="Save plan" busy={upsert.isPending}
          onClose={() => setEdit(null)}
          onConfirm={(reason) => { void upsert.mutateAsync({ id: f.id, name: f.name, role: f.role, price_ghs: f.price_ghs, included_credits: f.included_credits, rollover_cap: f.rollover_cap, founding_price: f.founding_price, active: f.active, reason }).then(() => setEdit(null)); }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Name"><input value={f.name} onChange={(e) => set("name", e.target.value)} style={input} /></Field>
              <Field label="Price (GHS)"><input type="number" value={f.price_ghs} onChange={(e) => set("price_ghs", Number(e.target.value))} style={input} /></Field>
              <Field label="Founding price (blank = none)"><input type="number" value={f.founding_price ?? ""} onChange={(e) => set("founding_price", e.target.value === "" ? null : Number(e.target.value))} style={input} /></Field>
              <Field label="Credits / month"><input type="number" value={f.included_credits} onChange={(e) => set("included_credits", Number(e.target.value))} style={input} /></Field>
              <Field label="Rollover cap"><input type="number" value={f.rollover_cap} onChange={(e) => set("rollover_cap", Number(e.target.value))} style={input} /></Field>
              <label style={{ display: "flex", gap: 6, fontSize: 13, color: a.body, alignItems: "flex-end", paddingBottom: 9 }}>
                <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Active
              </label>
            </div>
          } />
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}
