import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { a, card, sectionLabel, badgeTone, ghostBtn, primaryBtn, input, td, th } from "./theme";
import { useAdminConceptDetail } from "./data/queries";
import { useSetConceptStatus, useUpsertConcept, useUpsertMisconception } from "./data/mutations";
import { useConceptContentUnits, useSetContentUnitStatus } from "./data/contentUnitQueries";
import { useConceptRelationships, useUpsertRelationship, useDeleteRelationship } from "./data/relationshipQueries";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }

const STATUSES = ["draft", "under_review", "approved", "published", "needs_revision", "archived"];
const REL_TYPES = [
  "prerequisite_of", "builds_on", "related_to", "applied_in",
  "extension_of", "commonly_confused_with", "assessed_by", "used_in_lab", "used_in_challenge",
];

const STATUS_COLOR: Record<string, string> = {
  published: "#1D9E75", approved: "#185FA5", under_review: "#E8A020",
  draft: "#9CA3AF", needs_revision: "#EF4444", archived: "#6B7280",
};

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <section style={{ ...card, padding: "16px 18px" }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
      <div style={sectionLabel}>{title}</div>
      {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
    </div>
    {children}
  </section>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 13.5 }}>
    <span style={{ color: a.muted }}>{k}</span>
    <span style={{ color: a.ink, fontWeight: 500 }}>{v}</span>
  </div>;
}

const TABS = ["Overview", "Misconceptions", "Stages", "Graph", "Content", "Examples", "Practice", "Assessment", "Analytics"] as const;
type Tab = typeof TABS[number];

export default function ConceptDetail() {
  const { conceptId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminConceptDetail(conceptId);
  const setStatus = useSetConceptStatus();
  const editConcept = useUpsertConcept();
  const addMis = useUpsertMisconception();
  const setUnitStatus = useSetContentUnitStatus();
  const upsertRel = useUpsertRelationship();
  const deleteRel = useDeleteRelationship();

  const units = useConceptContentUnits(conceptId);
  const rels = useConceptRelationships(conceptId);

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [statusOpen, setStatusOpen] = useState(false);
  const [pickStatus, setPickStatus] = useState("published");
  const [misOpen, setMisOpen] = useState(false);
  const [misLabel, setMisLabel] = useState("");
  const [misDetail, setMisDetail] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [ef, setEf] = useState<Rec>({});
  const [relOpen, setRelOpen] = useState(false);
  const [relForm, setRelForm] = useState({ target_concept_id: "", relationship_type: "prerequisite_of", strength: "strong" });
  const [unitFilter, setUnitFilter] = useState("");

  if (isLoading) return <><PageHeader title="Concept" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Concept" /><ErrorNote message="Could not load this concept." /></>;

  const c = obj(data.concept);
  const usage = obj(data.usage);
  const mis = arr(data.misconceptions);
  const stages = arr(data.stages);
  const unitRows = units.data ?? [];
  const relRows = rels.data ?? [];

  const openEdit = () => { setEf({ ...c }); setEditOpen(true); };
  const es = (k: string, v: unknown) => setEf((p) => ({ ...p, [k]: v }));

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: activeTab === t ? 600 : 400,
    color: activeTab === t ? a.ink : a.muted,
    background: "none",
    border: "none",
    borderBottom: activeTab === t ? `2px solid #1D9E75` : "2px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  });

  const unitsFiltered = unitFilter
    ? unitRows.filter((u) => (u as Rec).unit_type === unitFilter)
    : unitRows;

  return (
    <>
      <PageHeader
        title={str(c.name)}
        subtitle={`${str(c.subject)} · ${str(c.slug)}`}
        right={<>
          <button type="button" onClick={() => nav("/admin/concepts")} style={ghostBtn()}>Back to Concepts</button>
          <button type="button" onClick={openEdit} style={ghostBtn()}>Edit</button>
          <button type="button" onClick={() => { setPickStatus(str(c.status) || "published"); setStatusOpen(true); }} style={primaryBtn()}>Set status</button>
        </>}
      />

      <div style={{ padding: "0 30px", borderBottom: "1px solid #E5E7EB", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setActiveTab(t)} style={tabStyle(t)}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 30 }}>
        {activeTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Panel title="Details">
                <div style={{ marginBottom: 10 }}>
                  <span style={badgeTone(str(c.status) === "published" ? "green" : "amber")}>{str(c.status).replace("_", " ")}</span>
                </div>
                <Row k="Learning stage" v={str(c.learning_stage) || "—"} />
                <Row k="Difficulty" v={str(c.difficulty) || "—"} />
                <Row k="Related areas" v={arr(c.related_areas).length ? arr(c.related_areas).map(String).join(", ") : "—"} />
                <Row k="Reviewer" v={str(c.reviewer) || "—"} />
                <Row k="Last reviewed" v={c.last_reviewed_at ? new Date(str(c.last_reviewed_at)).toLocaleDateString() : "—"} />
                <div style={{ fontSize: 13.5, color: a.body, lineHeight: 1.55, marginTop: 10 }}>{str(c.description)}</div>
              </Panel>
              <Panel title="Content summary">
                <Row k="Total content units" v={unitRows.length} />
                <Row k="Approved / Published" v={unitRows.filter((u) => ["approved","published"].includes(str((u as Rec).review_status))).length} />
                <Row k="AI generated" v={unitRows.filter((u) => (u as Rec).ai_generated).length} />
                <Row k="Concept relationships" v={relRows.length} />
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
        )}

        {activeTab === "Misconceptions" && (
          <Panel title={`Misconceptions (${mis.length})`} right={<button type="button" onClick={() => { setMisLabel(""); setMisDetail(""); setMisOpen(true); }} style={ghostBtn()}>Add misconception</button>}>
            {mis.length === 0
              ? <div style={{ fontSize: 13, color: a.faint }}>None recorded.</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {mis.map((m, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${a.amber}`, paddingLeft: 12, paddingBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: a.ink }}>{str(m.label)}</div>
                    <div style={{ fontSize: 12.5, color: a.muted, marginBottom: 6 }}>{str(m.detail)}</div>
                    {m.error_pattern && <div style={{ fontSize: 12, color: a.body }}><span style={{ color: a.muted }}>Error pattern: </span>{str(m.error_pattern)}</div>}
                    {m.teacher_guidance && <div style={{ fontSize: 12, color: a.body, marginTop: 4 }}><span style={{ color: a.muted }}>Teacher guidance: </span>{str(m.teacher_guidance)}</div>}
                    <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12 }}>
                      {m.confidence && <span style={{ color: a.muted }}>Confidence: <strong style={{ color: a.ink }}>{str(m.confidence)}</strong></span>}
                      {m.frequency != null && <span style={{ color: a.muted }}>Frequency: <strong style={{ color: a.ink }}>{n(m.frequency)}</strong></span>}
                      {m.resolution_rate != null && <span style={{ color: a.muted }}>Resolution rate: <strong style={{ color: a.ink }}>{(Number(m.resolution_rate) * 100).toFixed(0)}%</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            }
          </Panel>
        )}

        {activeTab === "Stages" && (
          <Panel title={`Mastery path stages (${stages.length})`}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>#</th><th style={th}>Stage</th><th style={th}>Phase</th><th style={th}>Est.</th></tr></thead>
              <tbody>
                {stages.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={4}>No stages configured.</td></tr>}
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
        )}

        {activeTab === "Graph" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel title={`Concept relationships (${relRows.length})`} right={<button type="button" onClick={() => { setRelForm({ target_concept_id: "", relationship_type: "prerequisite_of", strength: "strong" }); setRelOpen(true); }} style={ghostBtn()}>Add relationship</button>}>
              {rels.isLoading
                ? <div style={{ fontSize: 13, color: a.muted }}>Loading relationships...</div>
                : relRows.length === 0
                  ? <div style={{ fontSize: 13, color: a.faint }}>No relationships defined. Add prerequisite, extension, and related concept links here.</div>
                  : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={th}>From</th><th style={th}>Type</th><th style={th}>To</th><th style={th}>Strength</th><th style={th}></th></tr></thead>
                    <tbody>
                      {relRows.map((r) => {
                        const rel = r as Record<string, unknown>;
                        const isSource = rel.source_concept_id === conceptId;
                        return (
                          <tr key={str(rel.id)}>
                            <td style={{ ...td, color: isSource ? a.ink : a.muted, fontWeight: isSource ? 600 : 400 }}>{str(rel.source_name)}</td>
                            <td style={{ ...td }}>
                              <span style={{ fontSize: 11.5, background: "#E6F1FB", color: "#185FA5", borderRadius: 4, padding: "2px 6px" }}>
                                {str(rel.relationship_type).replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={{ ...td, color: isSource ? a.muted : a.ink, fontWeight: isSource ? 400 : 600 }}>{str(rel.target_name)}</td>
                            <td style={{ ...td, color: a.muted }}>{str(rel.strength)}</td>
                            <td style={{ ...td, textAlign: "right" }}>
                              <button type="button"
                                onClick={() => void deleteRel.mutateAsync({ id: str(rel.id), conceptId: conceptId! })}
                                style={{ ...ghostBtn(), fontSize: 12, color: "#EF4444", padding: "2px 8px" }}>
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              }
            </Panel>
          </div>
        )}

        {(activeTab === "Content" || activeTab === "Examples" || activeTab === "Practice" || activeTab === "Assessment") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: a.muted }}>Filter:</div>
              {["", "Core Explanation", "Worked Example", "Guided Problem", "Independent Problem", "Recall Cards", "Quick Check", "Mastery Check Item", "Intervention", "Extension"].map((type) => (
                <button key={type} type="button"
                  onClick={() => setUnitFilter(type)}
                  style={{ ...ghostBtn(), fontSize: 12, padding: "4px 10px", fontWeight: unitFilter === type ? 600 : 400, color: unitFilter === type ? "#1D9E75" : a.muted }}>
                  {type || "All"}
                </button>
              ))}
            </div>
            <Panel title={`Content units${unitFilter ? ` — ${unitFilter}` : ""} (${unitsFiltered.length})`}>
              {units.isLoading
                ? <div style={{ fontSize: 13, color: a.muted }}>Loading content units...</div>
                : unitsFiltered.length === 0
                  ? <div style={{ fontSize: 13, color: a.faint }}>No content units {unitFilter ? `of type "${unitFilter}"` : ""}. Tier A concepts have reviewed packages seeded.</div>
                  : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Type</th>
                        <th style={th}>Difficulty</th>
                        <th style={th}>Status</th>
                        <th style={th}>AI</th>
                        <th style={th}>Uses</th>
                        <th style={th}>Correct rate</th>
                        <th style={th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitsFiltered.map((u) => {
                        const unit = u as Rec;
                        const status = str(unit.review_status);
                        return (
                          <tr key={str(unit.id)}>
                            <td style={{ ...td, fontWeight: 600, color: a.ink, fontSize: 13 }}>{str(unit.unit_type)}</td>
                            <td style={{ ...td, color: a.muted }}>{str(unit.difficulty) || "—"}</td>
                            <td style={{ ...td }}>
                              <span style={{ fontSize: 11.5, borderRadius: 4, padding: "2px 7px", background: `${STATUS_COLOR[status] ?? "#9CA3AF"}18`, color: STATUS_COLOR[status] ?? a.muted }}>
                                {status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={{ ...td, color: a.muted }}>{unit.ai_generated ? "Yes" : "No"}</td>
                            <td style={{ ...td, color: a.muted }}>{n(unit.usage_count)}</td>
                            <td style={{ ...td, color: a.muted }}>
                              {unit.correct_rate != null ? `${(Number(unit.correct_rate) * 100).toFixed(0)}%` : "—"}
                            </td>
                            <td style={{ ...td, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              {status === "draft" && (
                                <button type="button"
                                  onClick={() => void setUnitStatus.mutateAsync({ id: str(unit.id), status: "under_review", conceptId: conceptId! })}
                                  style={{ ...ghostBtn(), fontSize: 11.5, padding: "2px 8px" }}>
                                  Submit for review
                                </button>
                              )}
                              {status === "under_review" && (
                                <button type="button"
                                  onClick={() => void setUnitStatus.mutateAsync({ id: str(unit.id), status: "approved", conceptId: conceptId! })}
                                  style={{ ...ghostBtn(), fontSize: 11.5, padding: "2px 8px", color: "#1D9E75" }}>
                                  Approve
                                </button>
                              )}
                              {status === "approved" && (
                                <button type="button"
                                  onClick={() => void setUnitStatus.mutateAsync({ id: str(unit.id), status: "published", conceptId: conceptId! })}
                                  style={{ ...ghostBtn(), fontSize: 11.5, padding: "2px 8px", color: "#1D9E75" }}>
                                  Publish
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              }
            </Panel>
          </div>
        )}

        {activeTab === "Analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel title="Content performance">
              {units.isLoading
                ? <div style={{ fontSize: 13, color: a.muted }}>Loading analytics...</div>
                : unitRows.length === 0
                  ? <div style={{ fontSize: 13, color: a.faint }}>No content units to analyse yet.</div>
                  : <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                      {[
                        { label: "Total units", value: unitRows.length },
                        { label: "Published", value: unitRows.filter((u) => str((u as Rec).review_status) === "published").length },
                        { label: "Total uses", value: unitRows.reduce((s, u) => s + n((u as Rec).usage_count), 0) },
                        {
                          label: "Avg correct rate",
                          value: (() => {
                            const rated = unitRows.filter((u) => (u as Rec).correct_rate != null);
                            if (!rated.length) return "—";
                            const avg = rated.reduce((s, u) => s + Number((u as Rec).correct_rate), 0) / rated.length;
                            return `${(avg * 100).toFixed(0)}%`;
                          })()
                        },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ ...card, padding: "14px 16px" }}>
                          <div style={{ fontSize: 11.5, color: a.muted, marginBottom: 6 }}>{label}</div>
                          <div style={{ fontSize: 22, fontWeight: 600, color: a.ink }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Uses</th><th style={th}>Correct rate</th></tr></thead>
                      <tbody>
                        {[...unitRows].sort((ua, ub) => n((ub as Rec).usage_count) - n((ua as Rec).usage_count)).map((u) => {
                          const unit = u as Rec;
                          return (
                            <tr key={str(unit.id)}>
                              <td style={{ ...td, fontWeight: 500, color: a.ink }}>{str(unit.unit_type)}</td>
                              <td style={{ ...td, color: a.muted }}>{str(unit.review_status).replace(/_/g, " ")}</td>
                              <td style={{ ...td, color: a.ink, fontWeight: 600 }}>{n(unit.usage_count)}</td>
                              <td style={{ ...td }}>
                                {unit.correct_rate != null
                                  ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ height: 6, background: "#E1F5EE", borderRadius: 3, flex: 1, overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${Number(unit.correct_rate) * 100}%`, background: "#1D9E75", borderRadius: 3 }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: a.muted }}>{(Number(unit.correct_rate) * 100).toFixed(0)}%</span>
                                  </div>
                                  : <span style={{ color: a.faint }}>No data</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
              }
            </Panel>
          </div>
        )}
      </div>

      {statusOpen && (
        <ActionModal title="Set concept status" confirmLabel="Update status" busy={setStatus.isPending}
          onClose={() => setStatusOpen(false)}
          onConfirm={(reason) => {
            if (conceptId) void setStatus.mutateAsync({ conceptId, status: pickStatus, reviewer: "", reason })
              .then(() => setStatusOpen(false));
          }}
          extra={
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Status</label>
              <select value={pickStatus} onChange={(e) => setPickStatus(e.target.value)} style={input}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          } />
      )}

      {misOpen && (
        <ActionModal title="Add misconception" confirmLabel="Add misconception" busy={addMis.isPending}
          onClose={() => setMisOpen(false)}
          onConfirm={(reason) => {
            if (conceptId) void addMis.mutateAsync({ id: null, conceptId, label: misLabel, detail: misDetail, reason })
              .then(() => setMisOpen(false));
          }}
          extra={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Label</label>
                <input value={misLabel} onChange={(e) => setMisLabel(e.target.value)} style={input} placeholder="What's the common mistake?" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Detail</label>
                <input value={misDetail} onChange={(e) => setMisDetail(e.target.value)} style={input} placeholder="What causes this error?" />
              </div>
            </div>
          } />
      )}

      {editOpen && (
        <ActionModal title="Edit concept" confirmLabel="Save concept" busy={editConcept.isPending}
          onClose={() => setEditOpen(false)}
          onConfirm={(reason) => {
            if (conceptId) void editConcept.mutateAsync({
              id: conceptId, slug: str(ef.slug), subject: str(ef.subject), name: str(ef.name),
              description: str(ef.description), learning_stage: str(ef.learning_stage),
              difficulty: str(ef.difficulty),
              related_areas: Array.isArray(ef.related_areas) ? (ef.related_areas as string[]) : [],
              reason,
            }).then(() => setEditOpen(false));
          }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Name</label><input value={str(ef.name)} onChange={(e) => es("name", e.target.value)} style={input} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Subject</label><input value={str(ef.subject)} onChange={(e) => es("subject", e.target.value)} style={input} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Description</label><input value={str(ef.description)} onChange={(e) => es("description", e.target.value)} style={input} /></div>
            </div>
          } />
      )}

      {relOpen && (
        <ActionModal title="Add concept relationship" confirmLabel="Add relationship" busy={upsertRel.isPending}
          onClose={() => setRelOpen(false)}
          onConfirm={(_reason) => {
            if (conceptId && relForm.target_concept_id) {
              void upsertRel.mutateAsync({
                source_concept_id: conceptId,
                target_concept_id: relForm.target_concept_id,
                relationship_type: relForm.relationship_type,
                strength: relForm.strength,
              }).then(() => setRelOpen(false));
            }
          }}
          extra={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Target concept ID</label>
                <input value={relForm.target_concept_id} onChange={(e) => setRelForm((p) => ({ ...p, target_concept_id: e.target.value }))} style={input} placeholder="UUID of the target concept" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Relationship type</label>
                <select value={relForm.relationship_type} onChange={(e) => setRelForm((p) => ({ ...p, relationship_type: e.target.value }))} style={input}>
                  {REL_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Strength</label>
                <select value={relForm.strength} onChange={(e) => setRelForm((p) => ({ ...p, strength: e.target.value }))} style={input}>
                  {["strong", "moderate", "weak"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          } />
      )}
    </>
  );
}
