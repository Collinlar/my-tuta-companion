import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { a, card, th, td, badgeTone, input, ghostBtn, primaryBtn } from "./theme";
import { useAdminConcepts, type ConceptRow } from "./data/queries";
import { useUpsertConcept, type ConceptInput } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

const PAGE = 100;

const statusTone: Record<string, "green" | "amber" | "blue" | "neutral" | "red"> = {
  published: "green", approved: "blue", under_review: "amber", needs_revision: "red", draft: "neutral", archived: "neutral",
};

const EMPTY: ConceptInput = { id: null, slug: "", subject: "", name: "", description: "", learning_stage: "", difficulty: "", related_areas: [], reason: "" };

export default function Concepts() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState<ConceptInput | null>(null);
  const { data, isLoading, error } = useAdminConcepts(search, subject, status, PAGE, offset);
  const upsert = useUpsertConcept();
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };
  const set = (k: keyof ConceptInput, v: unknown) => setForm((p) => (p ? { ...p, [k]: v } : p));

  return (
    <>
      <PageHeader title="Concepts" subtitle="The STEM concept library — create, edit, and govern content status."
        right={<button type="button" onClick={() => setForm({ ...EMPTY })} style={primaryBtn()}>+ New concept</button>} />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => resetTo(() => setSearch(e.target.value))} placeholder="Search name or slug" style={{ ...input, maxWidth: 260 }} />
          <input value={subject} onChange={(e) => resetTo(() => setSubject(e.target.value))} placeholder="Subject" style={{ ...input, maxWidth: 160 }} />
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 170 }}>
            <option value="">All statuses</option>
            {["draft", "under_review", "approved", "published", "needs_revision", "archived"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load concepts." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Concept</th><th style={th}>Subject</th><th style={th}>Stage</th><th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Learners</th><th style={{ ...th, textAlign: "right" }}>Stages</th><th style={{ ...th, textAlign: "right" }}>Misconceptions</th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={7}>No concepts match.</td></tr>}
                  {data.rows.map((c: ConceptRow) => (
                    <tr key={c.id} onClick={() => nav(`/admin/concepts/${c.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600, color: a.ink }}>{c.name}</td>
                      <td style={{ ...td, color: a.muted }}>{c.subject}</td>
                      <td style={{ ...td, color: a.muted }}>{c.learning_stage || "—"}</td>
                      <td style={td}><span style={badgeTone(statusTone[c.status] || "neutral")}>{c.status.replace("_", " ")}</span></td>
                      <td style={{ ...td, textAlign: "right" }}>{c.learners}</td>
                      <td style={{ ...td, textAlign: "right" }}>{c.stages}</td>
                      <td style={{ ...td, textAlign: "right" }}>{c.misconceptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, fontSize: 13, color: a.muted }}>
              <span>{data.total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE, data.total)} of {data.total}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))} style={{ ...ghostBtn(), opacity: offset === 0 ? 0.5 : 1 }}>Previous</button>
                <button type="button" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)} style={{ ...ghostBtn(), opacity: offset + PAGE >= data.total ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {form && (
        <ActionModal title="New concept" confirmLabel="Create concept" busy={upsert.isPending}
          onClose={() => setForm(null)}
          onConfirm={(reason) => { void upsert.mutateAsync({ ...form, reason }).then(() => setForm(null)); }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Name"><input value={form.name} onChange={(e) => set("name", e.target.value)} style={input} /></Field>
              <Field label="Slug"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} style={input} /></Field>
              <Field label="Subject"><input value={form.subject} onChange={(e) => set("subject", e.target.value)} style={input} /></Field>
              <Field label="Learning stage"><input value={form.learning_stage} onChange={(e) => set("learning_stage", e.target.value)} style={input} /></Field>
              <Field label="Difficulty"><input value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} style={input} /></Field>
              <Field label="Related areas (comma-sep)"><input value={form.related_areas.join(", ")} onChange={(e) => set("related_areas", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} style={input} /></Field>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Description"><input value={form.description} onChange={(e) => set("description", e.target.value)} style={input} /></Field></div>
            </div>
          } />
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}
