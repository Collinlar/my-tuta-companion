import { useState } from "react";
import { a, card, badgeTone, ghostBtn, input } from "./theme";
import { ActionModal } from "./ui";
import { useAdminConceptCompetencies, type AdminCompetency } from "./data/queries";
import { useSetConceptType, useUpsertCompetency, useDeleteCompetency } from "./data/mutations";
import { CONCEPT_TYPES, CONCEPT_TYPE_LABEL, CONCEPT_TYPE_HINT, EVIDENCE_TYPES, type ConceptType } from "../mytuta/data/competency";
import { DEPTHS, DEPTH_LABEL, type Depth } from "../mytuta/data/depth";

interface CompForm {
  id: string | null; depth: Depth; key: string; description: string;
  required: boolean; sequence: number; evidenceType: string; reviewStatus: string;
}
const REVIEW_STATES = ["draft", "approved", "published"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}

export default function CompetencyPanel({ conceptId }: { conceptId: string }) {
  const { data, isLoading, error } = useAdminConceptCompetencies(conceptId);
  const setType = useSetConceptType();
  const upsert = useUpsertCompetency();
  const remove = useDeleteCompetency();

  const [typeOpen, setTypeOpen] = useState(false);
  const [primary, setPrimary] = useState<string>("");
  const [secondary, setSecondary] = useState<string[]>([]);
  const [form, setForm] = useState<CompForm | null>(null);
  const [del, setDel] = useState<AdminCompetency | null>(null);

  if (isLoading) return <div style={{ ...card, padding: "16px 18px", fontSize: 13, color: a.faint }}>Loading competencies…</div>;
  if (error || !data) return <div style={{ ...card, padding: "16px 18px", fontSize: 13, color: a.red }}>Could not load competencies.</div>;

  const openType = () => { setPrimary(data.conceptType || ""); setSecondary(data.secondaryTypes || []); setTypeOpen(true); };
  const openAdd = (depth: Depth) => setForm({ id: null, depth, key: "", description: "", required: true, sequence: nextSeq(depth), evidenceType: "", reviewStatus: "draft" });
  const openEdit = (x: AdminCompetency) => setForm({ id: x.id, depth: x.depth as Depth, key: x.competency_key, description: x.description, required: x.required, sequence: x.sequence, evidenceType: x.evidence_type || "", reviewStatus: x.review_status });
  const set = (k: keyof CompForm, v: unknown) => setForm((p) => (p ? { ...p, [k]: v } : p));
  function nextSeq(depth: Depth) {
    const rows = data!.competencies.filter((c) => c.depth === depth);
    return rows.length ? Math.max(...rows.map((r) => r.sequence)) + 1 : 0;
  }

  return (
    <div>
      {/* Concept type */}
      <section style={{ ...card, padding: "16px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: a.ink }}>Concept type</div>
          <button type="button" onClick={openType} style={ghostBtn()}>Set type</button>
        </div>
        {data.conceptType
          ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={badgeTone("green")}>{CONCEPT_TYPE_LABEL[data.conceptType as ConceptType] || data.conceptType}</span>
              {data.secondaryTypes.map((t) => <span key={t} style={badgeTone("neutral")}>{CONCEPT_TYPE_LABEL[t as ConceptType] || t}</span>)}
              <span style={{ fontSize: 12, color: a.faint }}>{CONCEPT_TYPE_HINT[data.conceptType as ConceptType] || ""}</span>
            </div>
          : <div style={{ fontSize: 13, color: a.faint }}>No type set. The type selects this concept's Foundation Knowledge Block template.</div>}
      </section>

      {/* Competencies by depth */}
      {DEPTHS.map((depth) => {
        const rows = data.competencies.filter((c) => c.depth === depth).sort((x, y) => x.sequence - y.sequence);
        return (
          <section key={depth} style={{ ...card, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: a.ink }}>{DEPTH_LABEL[depth]} competencies <span style={{ color: a.faint, fontWeight: 400 }}>({rows.length})</span></div>
              <button type="button" onClick={() => openAdd(depth)} style={ghostBtn()}>Add competency</button>
            </div>
            {rows.length === 0
              ? <div style={{ fontSize: 13, color: a.faint }}>None defined. These are what the learner must know and do at {DEPTH_LABEL[depth]}.</div>
              : <div>
                  {rows.map((x) => (
                    <div key={x.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${a.border2}` }}>
                      <span style={{ fontSize: 12, color: a.faint, width: 20, flex: "none", paddingTop: 2 }}>{x.sequence}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: a.ink }}>{x.description}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 11.5, color: a.faint, fontFamily: "monospace" }}>{x.competency_key}</span>
                          <span style={badgeTone(x.required ? "amber" : "neutral")}>{x.required ? "Required" : "Optional"}</span>
                          {x.evidence_type && <span style={badgeTone("blue")}>{x.evidence_type}</span>}
                          <span style={badgeTone(x.review_status === "published" ? "green" : x.review_status === "approved" ? "blue" : "neutral")}>{x.review_status}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => openEdit(x)} style={{ ...ghostBtn(), fontSize: 12.5, padding: "4px 10px" }}>Edit</button>
                      <button type="button" onClick={() => setDel(x)} style={{ ...ghostBtn(), fontSize: 12.5, padding: "4px 10px", color: a.red }}>Delete</button>
                    </div>
                  ))}
                </div>}
          </section>
        );
      })}

      {/* Set type modal */}
      {typeOpen && (
        <ActionModal
          title="Concept type"
          description="The primary type selects this concept's Foundation Knowledge Block template. Secondary types are optional."
          confirmLabel="Save type"
          busy={setType.isPending}
          onClose={() => setTypeOpen(false)}
          onConfirm={(reason) => { void setType.mutateAsync({ conceptId, primary: primary || null, secondary: secondary.filter((s) => s !== primary), reason }).then(() => setTypeOpen(false)); }}
          extra={
            <div>
              <Field label="Primary type">
                <select value={primary} onChange={(e) => setPrimary(e.target.value)} style={input}>
                  <option value="">— none —</option>
                  {CONCEPT_TYPES.map((t) => <option key={t} value={t}>{CONCEPT_TYPE_LABEL[t]}</option>)}
                </select>
              </Field>
              {primary && <div style={{ fontSize: 12, color: a.faint, margin: "6px 0 12px" }}>{CONCEPT_TYPE_HINT[primary as ConceptType]}</div>}
              <Field label="Secondary types (optional)">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {CONCEPT_TYPES.filter((t) => t !== primary).map((t) => {
                    const on = secondary.includes(t);
                    return <button key={t} type="button" onClick={() => setSecondary((p) => on ? p.filter((x) => x !== t) : [...p, t])}
                      style={{ fontSize: 12.5, padding: "5px 11px", borderRadius: 16, cursor: "pointer", border: `1px solid ${on ? "#1D9E75" : a.border}`, background: on ? "#E1F5EE" : a.panel, color: on ? "#085041" : a.muted, fontWeight: on ? 600 : 400 }}>{CONCEPT_TYPE_LABEL[t]}</button>;
                  })}
                </div>
              </Field>
            </div>
          } />
      )}

      {/* Add / edit competency modal */}
      {form && (
        <ActionModal
          title={form.id ? "Edit competency" : "New competency"}
          confirmLabel={form.id ? "Save competency" : "Add competency"}
          busy={upsert.isPending}
          onClose={() => setForm(null)}
          onConfirm={(reason) => { void upsert.mutateAsync({ id: form.id, conceptId, depth: form.depth, key: form.key.trim(), description: form.description.trim(), required: form.required, sequence: form.sequence, evidenceType: form.evidenceType || null, reviewStatus: form.reviewStatus, reason }).then(() => setForm(null)); }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Depth">
                <select value={form.depth} onChange={(e) => set("depth", e.target.value)} style={input}>
                  {DEPTHS.map((d) => <option key={d} value={d}>{DEPTH_LABEL[d]}</option>)}
                </select>
              </Field>
              <Field label="Sequence"><input type="number" value={form.sequence} onChange={(e) => set("sequence", Number(e.target.value))} style={input} /></Field>
              <Field label="Key (stable slug)"><input value={form.key} onChange={(e) => set("key", e.target.value)} placeholder="define-density" style={input} /></Field>
              <Field label="Evidence type">
                <select value={form.evidenceType} onChange={(e) => set("evidenceType", e.target.value)} style={input}>
                  <option value="">— none —</option>
                  {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Description (learner-facing)"><input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Explain the relationship between mass, volume and density" style={input} /></Field></div>
              <Field label="Required for completeness">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: a.ink, paddingTop: 8 }}>
                  <input type="checkbox" checked={form.required} onChange={(e) => set("required", e.target.checked)} style={{ width: 16, height: 16 }} /> Required
                </label>
              </Field>
              <Field label="Review status">
                <select value={form.reviewStatus} onChange={(e) => set("reviewStatus", e.target.value)} style={input}>
                  {REVIEW_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          } />
      )}

      {del && (
        <ActionModal
          title="Delete competency?"
          description={del.description}
          confirmLabel="Delete competency"
          danger
          busy={remove.isPending}
          onClose={() => setDel(null)}
          onConfirm={(reason) => { void remove.mutateAsync({ id: del.id, reason }).then(() => setDel(null)); }}
        />
      )}
    </div>
  );
}
