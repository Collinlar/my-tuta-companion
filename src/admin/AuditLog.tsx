import { useState } from "react";
import { a, card, th, td, badgeTone, ghostBtn } from "./theme";
import { useAuditLog } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 50;

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AuditLog() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAuditLog(PAGE, offset);

  if (isLoading) return <><PageHeader title="Audit Log" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Audit Log" /><ErrorNote message="Could not load the audit log." /></>;

  const from = data.total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE, data.total);

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Every privileged admin action, immutably recorded." />
      <div style={{ padding: 30 }}>
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>When</th>
                <th style={th}>Admin</th>
                <th style={th}>Action</th>
                <th style={th}>Target</th>
                <th style={th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 && (
                <tr><td style={{ ...td, color: a.faint }} colSpan={5}>No admin actions recorded yet.</td></tr>
              )}
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...td, whiteSpace: "nowrap", color: a.muted }}>{when(r.created_at)}</td>
                  <td style={td}>{r.actor_name}</td>
                  <td style={td}><span style={badgeTone("blue")}>{r.action}</span></td>
                  <td style={{ ...td, color: a.muted }}>{r.target_type ? `${r.target_type}${r.target_id ? " · " + r.target_id.slice(0, 8) : ""}` : "—"}</td>
                  <td style={{ ...td, color: a.muted, maxWidth: 320 }}>{r.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, fontSize: 13, color: a.muted }}>
          <span>{from}–{to} of {data.total}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))} style={{ ...ghostBtn(), opacity: offset === 0 ? 0.5 : 1 }}>Previous</button>
            <button type="button" disabled={to >= data.total} onClick={() => setOffset(offset + PAGE)} style={{ ...ghostBtn(), opacity: to >= data.total ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
