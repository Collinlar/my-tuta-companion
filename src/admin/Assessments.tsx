import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminAssessments, type AssessmentRow } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 50;

export default function Assessments() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminAssessments(search, "", status, PAGE, offset);
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="Assessments" subtitle="Every assessment across all teachers, with results." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => resetTo(() => setSearch(e.target.value))} placeholder="Search title" style={{ ...input, maxWidth: 280 }} />
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 170 }}>
            <option value="">All statuses</option><option value="draft">Draft</option><option value="assigned">Assigned</option><option value="closed">Closed</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load assessments." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Title</th><th style={th}>Type</th><th style={th}>Teacher</th><th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Questions</th><th style={{ ...th, textAlign: "right" }}>Submitted</th><th style={th}>Created</th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={7}>No assessments match.</td></tr>}
                  {data.rows.map((x: AssessmentRow) => (
                    <tr key={x.id} onClick={() => nav(`/admin/assessments/${x.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600, color: a.ink }}>{x.title}</td>
                      <td style={{ ...td, color: a.muted }}>{x.type}</td>
                      <td style={{ ...td, color: a.muted }}>{x.teacher || "—"}</td>
                      <td style={td}><span style={badgeTone(x.status === "assigned" ? "green" : x.status === "closed" ? "neutral" : "amber")}>{x.status}</span></td>
                      <td style={{ ...td, textAlign: "right" }}>{x.questions}</td>
                      <td style={{ ...td, textAlign: "right" }}>{x.submitted}/{x.total}</td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{new Date(x.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" })}</td>
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
    </>
  );
}
