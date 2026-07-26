import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminTickets, type TicketRow } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 50;
function priorityTone(p: string) { return p === "urgent" ? "red" as const : p === "high" ? "amber" as const : "neutral" as const; }
function statusTone(s: string) { return s === "open" ? "blue" as const : s === "pending" ? "amber" as const : "green" as const; }

export default function Support() {
  const nav = useNavigate();
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminTickets(status, "", PAGE, offset);
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="Support" subtitle="Ticket inbox with full account context. (User-facing ticket creation is a deferred follow-on.)" />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 170 }}>
            <option value="">All statuses</option><option value="open">Open</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load tickets." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Subject</th><th style={th}>User</th><th style={th}>Category</th>
                  <th style={th}>Priority</th><th style={th}>Status</th><th style={th}>Assignee</th><th style={th}>Updated</th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={7}>No tickets. (User ticket creation is deferred.)</td></tr>}
                  {data.rows.map((t: TicketRow) => (
                    <tr key={t.id} onClick={() => nav(`/admin/support/${t.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600, color: a.ink }}>{t.subject}</td>
                      <td style={{ ...td, color: a.muted }}>{t.name || t.email || "—"}</td>
                      <td style={{ ...td, color: a.muted }}>{t.category}</td>
                      <td style={td}><span style={badgeTone(priorityTone(t.priority))}>{t.priority}</span></td>
                      <td style={td}><span style={badgeTone(statusTone(t.status))}>{t.status}</span></td>
                      <td style={{ ...td, color: a.muted }}>{t.assignee || "—"}</td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{new Date(t.updated_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</td>
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
