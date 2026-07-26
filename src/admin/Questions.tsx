import { useState } from "react";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminQuestions, type QuestionRow } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 100;

function options(v: unknown): string[] { return Array.isArray(v) ? (v as string[]) : []; }

export default function Questions() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminQuestions(search, PAGE, offset);
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="Question bank" subtitle="Review assessment questions; items flagged for missing answers or options surface first." />
      <div style={{ padding: 30 }}>
        <input value={search} onChange={(e) => resetTo(() => setSearch(e.target.value))} placeholder="Search question text" style={{ ...input, maxWidth: 320, marginBottom: 16 }} />

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load questions." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Question</th><th style={th}>Assessment</th><th style={th}>Dimension</th>
                  <th style={{ ...th, textAlign: "right" }}>Options</th><th style={th}>Correct</th><th style={th}>Review</th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={6}>No questions match.</td></tr>}
                  {data.rows.map((q: QuestionRow) => {
                    const opts = options(q.options);
                    const correct = q.correct_index != null ? opts[q.correct_index] : null;
                    return (
                      <tr key={q.id}>
                        <td style={{ ...td, maxWidth: 420, color: a.ink }}>{q.prompt}</td>
                        <td style={{ ...td, color: a.muted }}>{q.assessment_title || "—"}<div style={{ fontSize: 11, color: a.faint }}>{q.assessment_type}</div></td>
                        <td style={{ ...td, color: a.muted }}>{q.dimension || "—"}</td>
                        <td style={{ ...td, textAlign: "right" }}>{opts.length}</td>
                        <td style={{ ...td, color: a.green, fontWeight: 600 }}>{correct ?? "—"}</td>
                        <td style={td}>{q.needs_review ? <span style={badgeTone("red")}>needs review</span> : <span style={badgeTone("green")}>ok</span>}</td>
                      </tr>
                    );
                  })}
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
