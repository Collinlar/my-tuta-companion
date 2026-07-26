import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { a, card, sectionLabel, badgeTone, ghostBtn, primaryBtn, input, td, th } from "./theme";
import { useAdminAssessmentDetail } from "./data/queries";
import { useSetAssessmentStatus } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }
function options(v: unknown): string[] { return Array.isArray(v) ? (v as string[]) : []; }

const STATUSES = ["draft", "assigned", "closed", "archived"];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ ...card, padding: "16px 18px" }}><div style={{ ...sectionLabel, marginBottom: 12 }}>{title}</div>{children}</section>;
}

export default function AssessmentDetail() {
  const { assessmentId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminAssessmentDetail(assessmentId);
  const setStatus = useSetAssessmentStatus();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState("assigned");

  if (isLoading) return <><PageHeader title="Assessment" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Assessment" /><ErrorNote message="Could not load this assessment." /></>;

  const asmt = obj(data.assessment);
  const teacher = obj(data.teacher);
  const questions = arr(data.questions);
  const subs = obj(data.submissions);

  return (
    <>
      <PageHeader title={str(asmt.title)} subtitle={`${str(asmt.type)} · by ${str(teacher.name)}`}
        right={<>
          <button type="button" onClick={() => nav("/admin/assessments")} style={ghostBtn()}>← Assessments</button>
          <button type="button" onClick={() => { setPick(str(asmt.status) || "assigned"); setOpen(true); }} style={primaryBtn()}>Set status</button>
        </>} />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        <Panel title={`Questions (${questions.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {questions.length === 0 && <div style={{ fontSize: 13, color: a.faint }}>No questions.</div>}
            {questions.map((q, i) => {
              const opts = options(q.options);
              return (
                <div key={i} style={{ borderBottom: `1px solid ${a.border2}`, paddingBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: a.ink, marginBottom: 6 }}>{n(q.ord) + 1}. {str(q.prompt)} {q.dimension && <span style={{ ...badgeTone("neutral"), marginLeft: 6 }}>{str(q.dimension)}</span>}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {opts.map((o, oi) => (
                      <div key={oi} style={{ fontSize: 12.5, color: oi === n(q.correct_index) ? a.green : a.muted, fontWeight: oi === n(q.correct_index) ? 600 : 400 }}>
                        {String.fromCharCode(65 + oi)}. {o} {oi === n(q.correct_index) && "✓"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 90 }}>
          <Panel title="Status">
            <div><span style={badgeTone(str(asmt.status) === "assigned" ? "green" : "amber")}>{str(asmt.status)}</span></div>
          </Panel>
          <Panel title="Results">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}><span style={{ color: a.muted }}>Submitted</span><b>{n(subs.count)}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}><span style={{ color: a.muted }}>Average score</span><b>{n(subs.avg_score)}</b></div>
            <div style={{ ...sectionLabel, margin: "10px 0 6px" }}>Recent submissions</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {arr(subs.recent).length === 0 && <tr><td style={{ ...td, color: a.faint, fontSize: 12 }}>No submissions yet.</td></tr>}
                {arr(subs.recent).map((s, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontSize: 12 }}>{str(s.student) || "—"}</td>
                    <td style={{ ...td, fontSize: 12, textAlign: "right" }}>{n(s.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>

      {open && (
        <ActionModal title="Set assessment status" confirmLabel="Update status" busy={setStatus.isPending}
          onClose={() => setOpen(false)}
          onConfirm={(reason) => { if (assessmentId) void setStatus.mutateAsync({ assessmentId, status: pick, reason }).then(() => setOpen(false)); }}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Status</label>
            <select value={pick} onChange={(e) => setPick(e.target.value)} style={input}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>} />
      )}
    </>
  );
}
