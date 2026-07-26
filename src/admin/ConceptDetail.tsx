import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { a, card, sectionLabel, badgeTone, ghostBtn, primaryBtn, input, td, th } from "./theme";
import { useAdminConceptDetail } from "./data/queries";
import { useSetConceptStatus, useUpsertConcept, useUpsertMisconception } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }

const STATUSES = ["draft", "under_review", "approved", "published", "needs_revision", "archived"];

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <section style={{ ...card, padding: "16px 18px" }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}><div style={sectionLabel}>{title}</div>{right && <div style={{ marginLeft: "auto" }}>{right}</div>}</div>
    {children}
  </section>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 13.5 }}><span style={{ color: a.muted }}>{k}</span><span style={{ color: a.ink, fontWeight: 500 }}>{v}</span></div>;
}

export default function ConceptDetail() {
  const { conceptId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminConceptDetail(conceptId);
  const setStatus = useSetConceptStatus();
  const editConcept = useUpsertConcept();
  const addMis = useUpsertMisconception();
  const [statusOpen, setStatusOpen] = useState(false);
  const [pickStatus, setPickStatus] = useState("published");
  const [misOpen, setMisOpen] = useState(false);
  const [misLabel, setMisLabel] = useState("");
  const [misDetail, setMisDetail] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [ef, setEf] = useState<Rec>({});

  if (isLoading) return <><PageHeader title="Concept" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Concept" /><ErrorNote message="Could not load this concept." /></>;

  const c = obj(data.concept);
  const usage = obj(data.usage);
  const mis = arr(data.misconceptions);
  const stages = arr(data.stages);

  const openEdit = () => { setEf({ ...c }); setEditOpen(true); };
  const es = (k: string, v: unknown) => setEf((p) => ({ ...p, [k]: v }));

  return (
    <>
      <PageHeader title={str(c.name)} subtitle={`${str(c.subject)} · ${str(c.slug)}`}
        right={<>
          <button type="button" onClick={() => nav("/admin/concepts")} style={ghostBtn()}>← Concepts</button>
          <button type="button" onClick={openEdit} style={ghostBtn()}>Edit</button>
          <button type="button" onClick={() => { setPickStatus(str(c.status) || "published"); setStatusOpen(true); }} style={primaryBtn()}>Set status</button>
        </>} />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Details">
            <div style={{ marginBottom: 10 }}><span style={badgeTone(str(c.status) === "published" ? "green" : "amber")}>{str(c.status).replace("_", " ")}</span></div>
            <Row k="Learning stage" v={str(c.learning_stage) || "—"} />
            <Row k="Difficulty" v={str(c.difficulty) || "—"} />
            <Row k="Related areas" v={arr(c.related_areas).length ? arr(c.related_areas).map(String).join(", ") : (Array.isArray(c.related_areas) ? (c.related_areas as string[]).join(", ") : "—")} />
            <Row k="Reviewer" v={str(c.reviewer) || "—"} />
            <Row k="Last reviewed" v={c.last_reviewed_at ? new Date(str(c.last_reviewed_at)).toLocaleDateString() : "—"} />
            <div style={{ fontSize: 13.5, color: a.body, lineHeight: 1.55, marginTop: 10 }}>{str(c.description)}</div>
          </Panel>

          <Panel title={`Misconceptions (${mis.length})`} right={<button type="button" onClick={() => { setMisLabel(""); setMisDetail(""); setMisOpen(true); }} style={ghostBtn()}>+ Add</button>}>
            {mis.length === 0 ? <div style={{ fontSize: 13, color: a.faint }}>None recorded.</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mis.map((m, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${a.amber}`, paddingLeft: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: a.ink }}>{str(m.label)}</div>
                    <div style={{ fontSize: 12.5, color: a.muted }}>{str(m.detail)}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title={`Mastery-path stages (${stages.length})`}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>#</th><th style={th}>Stage</th><th style={th}>Phase</th><th style={th}>Est.</th></tr></thead>
              <tbody>
                {stages.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={4}>No stages yet.</td></tr>}
                {stages.map((s, i) => (
                  <tr key={i}>
                    <td style={{ ...td, color: a.muted }}>{n(s.ord) + 1}</td>
                    <td style={{ ...td, fontWeight: 600, color: a.ink }}>{str(s.name)}</td>
                    <td style={{ ...td, color: a.muted }}>{str(s.loop_phase)}</td>
                    <td style={{ ...td, color: a.muted }}>{str(s.est_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div style={{ position: "sticky", top: 90 }}>
          <Panel title="Usage">
            <Row k="Learners" v={n(usage.learners)} />
            <Row k="Reaching secure" v={n(usage.secure)} />
            <Row k="Active paths" v={n(usage.paths)} />
          </Panel>
        </div>
      </div>

      {statusOpen && (
        <ActionModal title="Set concept status" confirmLabel="Update status" busy={setStatus.isPending}
          onClose={() => setStatusOpen(false)}
          onConfirm={(reason) => { if (conceptId) void setStatus.mutateAsync({ conceptId, status: pickStatus, reviewer: "", reason }).then(() => setStatusOpen(false)); }}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Status</label>
            <select value={pickStatus} onChange={(e) => setPickStatus(e.target.value)} style={input}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>} />
      )}
      {misOpen && (
        <ActionModal title="Add misconception" confirmLabel="Add" busy={addMis.isPending}
          onClose={() => setMisOpen(false)}
          onConfirm={(reason) => { if (conceptId) void addMis.mutateAsync({ id: null, conceptId, label: misLabel, detail: misDetail, reason }).then(() => setMisOpen(false)); }}
          extra={<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Label</label><input value={misLabel} onChange={(e) => setMisLabel(e.target.value)} style={input} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Detail</label><input value={misDetail} onChange={(e) => setMisDetail(e.target.value)} style={input} /></div>
          </div>} />
      )}
      {editOpen && (
        <ActionModal title="Edit concept" confirmLabel="Save concept" busy={editConcept.isPending}
          onClose={() => setEditOpen(false)}
          onConfirm={(reason) => { if (conceptId) void editConcept.mutateAsync({ id: conceptId, slug: str(ef.slug), subject: str(ef.subject), name: str(ef.name), description: str(ef.description), learning_stage: str(ef.learning_stage), difficulty: str(ef.difficulty), related_areas: Array.isArray(ef.related_areas) ? (ef.related_areas as string[]) : [], reason }).then(() => setEditOpen(false)); }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Name</label><input value={str(ef.name)} onChange={(e) => es("name", e.target.value)} style={input} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Subject</label><input value={str(ef.subject)} onChange={(e) => es("subject", e.target.value)} style={input} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Description</label><input value={str(ef.description)} onChange={(e) => es("description", e.target.value)} style={input} /></div>
            </div>
          } />
      )}
    </>
  );
}
