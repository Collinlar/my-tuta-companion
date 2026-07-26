import { useState } from "react";
import { a, afont, card, th, td, badgeTone, ghostBtn, primaryBtn, input, sectionLabel } from "./theme";
import { useActionCostsAdmin, useBundlesAdmin, useCreditLiability, type ActionCostRow, type BundleRow } from "./data/queries";
import { useSetActionCost, useUpsertBundle } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Tab = "pricing" | "bundles" | "liability";

export default function Credits() {
  const [tab, setTab] = useState<Tab>("pricing");
  return (
    <>
      <PageHeader title="Credits & Plans" subtitle="Action pricing, sale bundles, and outstanding credit liability." />
      <div style={{ padding: "0 30px", borderBottom: `1px solid ${a.border}`, display: "flex", gap: 4 }}>
        {(["pricing", "bundles", "liability"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            background: "none", border: "none", borderBottom: `2px solid ${tab === t ? a.brand : "transparent"}`,
            color: tab === t ? a.ink : a.muted, fontWeight: 600, fontSize: 13.5, padding: "12px 14px", cursor: "pointer",
          }}>{t === "pricing" ? "Action pricing" : t === "bundles" ? "Bundles" : "Liability"}</button>
        ))}
      </div>
      <div style={{ padding: 30 }}>
        {tab === "pricing" && <Pricing />}
        {tab === "bundles" && <Bundles />}
        {tab === "liability" && <Liability />}
      </div>
    </>
  );
}

function Pricing() {
  const { data, isLoading, error } = useActionCostsAdmin();
  const setCost = useSetActionCost();
  const [edit, setEdit] = useState<ActionCostRow | null>(null);
  const [cost, setCost2] = useState("");
  const [active, setActive] = useState(true);

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote message="Could not load action costs." />;

  const open = (r: ActionCostRow) => { setEdit(r); setCost2(String(r.cost)); setActive(r.active); };

  return (
    <>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={th}>Action</th><th style={th}>Key</th><th style={th}>Category</th>
            <th style={{ ...th, textAlign: "right" }}>Cost</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.action_key}>
                <td style={{ ...td, fontWeight: 600, color: a.ink }}>{r.label}</td>
                <td style={{ ...td, color: a.muted, fontFamily: afont.mono, fontSize: 12 }}>{r.action_key}</td>
                <td style={td}><span style={badgeTone(r.category === "teacher" ? "purple" : "blue")}>{r.category}</span></td>
                <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{r.cost}</td>
                <td style={td}><span style={badgeTone(r.active ? "green" : "neutral")}>{r.active ? "active" : "disabled"}</span></td>
                <td style={{ ...td, textAlign: "right" }}><button type="button" onClick={() => open(r)} style={ghostBtn()}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <ActionModal title={`Edit “${edit.label}”`} confirmLabel="Save cost" busy={setCost.isPending}
          onClose={() => setEdit(null)}
          onConfirm={(reason) => { void setCost.mutateAsync({ actionKey: edit.action_key, cost: parseInt(cost || "0", 10), active, reason }).then(() => setEdit(null)); }}
          extra={
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Cost (credits)</label>
                <input type="number" value={cost} onChange={(e) => setCost2(e.target.value)} style={input} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: a.body, alignSelf: "flex-end", paddingBottom: 9 }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
              </label>
            </div>
          } />
      )}
    </>
  );
}

const EMPTY_BUNDLE: BundleRow = { id: "", name: "", price_ghs: 0, credits: 0, bonus: 0, target_role: "all", positioning: "", featured: false, active: true, sort: 0 };

function Bundles() {
  const { data, isLoading, error } = useBundlesAdmin();
  const upsert = useUpsertBundle();
  const [edit, setEdit] = useState<BundleRow | null>(null);
  const [f, setF] = useState<BundleRow>(EMPTY_BUNDLE);

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote message="Could not load bundles." />;

  const open = (b: BundleRow) => { setEdit(b); setF(b); };
  const openNew = () => { setEdit(EMPTY_BUNDLE); setF(EMPTY_BUNDLE); };
  const set = (k: keyof BundleRow, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button type="button" onClick={openNew} style={primaryBtn()}>+ New bundle</button>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={th}>Name</th><th style={{ ...th, textAlign: "right" }}>Price (GHS)</th>
            <th style={{ ...th, textAlign: "right" }}>Credits</th><th style={{ ...th, textAlign: "right" }}>Bonus</th>
            <th style={th}>Role</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id}>
                <td style={{ ...td, fontWeight: 600, color: a.ink }}>{b.name}{b.featured && <span style={{ ...badgeTone("amber"), marginLeft: 8 }}>featured</span>}</td>
                <td style={{ ...td, textAlign: "right" }}>{b.price_ghs}</td>
                <td style={{ ...td, textAlign: "right" }}>{b.credits}</td>
                <td style={{ ...td, textAlign: "right", color: a.muted }}>{b.bonus || "—"}</td>
                <td style={td}>{b.target_role}</td>
                <td style={td}><span style={badgeTone(b.active ? "green" : "neutral")}>{b.active ? "active" : "off"}</span></td>
                <td style={{ ...td, textAlign: "right" }}><button type="button" onClick={() => open(b)} style={ghostBtn()}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <ActionModal title={edit.id ? `Edit “${edit.name || edit.id}”` : "New bundle"} confirmLabel="Save bundle" busy={upsert.isPending}
          onClose={() => setEdit(null)}
          onConfirm={(reason) => { void upsert.mutateAsync({ ...f, positioning: f.positioning ?? "", reason }).then(() => setEdit(null)); }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="ID (slug)"><input value={f.id} disabled={!!edit.id} onChange={(e) => set("id", e.target.value)} style={input} /></Field>
              <Field label="Name"><input value={f.name} onChange={(e) => set("name", e.target.value)} style={input} /></Field>
              <Field label="Price (GHS)"><input type="number" value={f.price_ghs} onChange={(e) => set("price_ghs", Number(e.target.value))} style={input} /></Field>
              <Field label="Credits"><input type="number" value={f.credits} onChange={(e) => set("credits", Number(e.target.value))} style={input} /></Field>
              <Field label="Bonus"><input type="number" value={f.bonus} onChange={(e) => set("bonus", Number(e.target.value))} style={input} /></Field>
              <Field label="Sort"><input type="number" value={f.sort} onChange={(e) => set("sort", Number(e.target.value))} style={input} /></Field>
              <Field label="Target role">
                <select value={f.target_role} onChange={(e) => set("target_role", e.target.value)} style={input}>
                  <option value="all">All</option><option value="student">Student</option><option value="teacher">Teacher</option>
                </select>
              </Field>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-end", paddingBottom: 9 }}>
                <label style={{ display: "flex", gap: 6, fontSize: 13, color: a.body }}><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
                <label style={{ display: "flex", gap: 6, fontSize: 13, color: a.body }}><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Active</label>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Positioning"><input value={f.positioning ?? ""} onChange={(e) => set("positioning", e.target.value)} style={input} /></Field></div>
            </div>
          } />
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}

function ghs(n: number) { return "GHS " + (n || 0).toLocaleString(); }

function Liability() {
  const { data, isLoading, error } = useCreditLiability();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote message="Could not load liability figures." />;

  const cards: [string, string, string?][] = [
    ["Purchased outstanding", (data.outstanding_purchased || 0).toLocaleString() + " credits", "the real service liability"],
    ["Estimated liability", ghs(data.estimated_liability_ghs || 0), `at ${data.ghs_per_credit || 0} GHS/credit`],
    ["Subscription outstanding", (data.outstanding_subscription || 0).toLocaleString() + " credits"],
    ["Welcome outstanding", (data.outstanding_welcome || 0).toLocaleString() + " credits"],
    ["Promo outstanding", (data.outstanding_promo || 0).toLocaleString() + " credits"],
    ["Due to expire (7d)", (data.due_to_expire_7d || 0).toLocaleString() + " credits"],
    ["Credits issued", (data.issued || 0).toLocaleString()],
    ["Redemption rate", (data.redemption_rate || 0) + "%", `${(data.consumed || 0).toLocaleString()} consumed`],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
      {cards.map(([label, value, hint]) => (
        <div key={label} style={{ ...card, padding: "16px 18px" }}>
          <div style={{ ...sectionLabel, marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: afont.display, fontSize: 22, fontWeight: 600, color: a.ink }}>{value}</div>
          {hint && <div style={{ fontSize: 11.5, color: a.faint, marginTop: 4 }}>{hint}</div>}
        </div>
      ))}
    </div>
  );
}
