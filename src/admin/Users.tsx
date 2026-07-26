import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminUsers, type AdminUserRow } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 50;

function roleTone(t: string) { return t === "teacher" ? "purple" as const : "blue" as const; }

export default function Users() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminUsers(search, role, status, PAGE, offset);

  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="Users" subtitle="Search, inspect, and manage every student and teacher." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => resetTo(() => setSearch(e.target.value))} placeholder="Search name or email" style={{ ...input, maxWidth: 300 }} />
          <select value={role} onChange={(e) => resetTo(() => setRole(e.target.value))} style={{ ...input, maxWidth: 160 }}>
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 160 }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load users." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Role</th>
                    <th style={th}>Status</th>
                    <th style={th}>Plan</th>
                    <th style={{ ...th, textAlign: "right" }}>Credits</th>
                    <th style={th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={7}>No users match.</td></tr>}
                  {data.rows.map((u: AdminUserRow) => (
                    <tr key={u.user_id} onClick={() => nav(`/admin/users/${u.user_id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600, color: a.ink }}>{u.name || "—"}</td>
                      <td style={{ ...td, color: a.muted }}>{u.email || "—"}</td>
                      <td style={td}><span style={badgeTone(roleTone(u.user_type))}>{u.user_type}</span></td>
                      <td style={td}><span style={badgeTone(u.status === "suspended" ? "red" : "green")}>{u.status}</span></td>
                      <td style={{ ...td, color: a.muted }}>{u.sub_plan && u.sub_status === "active" ? (u.sub_plan === "teacher_pro" ? "Teacher Pro" : "Student Plus") : "Free"}</td>
                      <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{u.credit_balance.toLocaleString()}</td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{new Date(u.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" })}</td>
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
