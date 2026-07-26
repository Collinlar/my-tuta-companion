import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminPayments, type PaymentRow } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

const PAGE = 50;

function statusTone(s: string) { return s === "success" ? "green" as const : s === "failed" ? "red" as const : "amber" as const; }

export default function Payments() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminPayments(search, status, kind, PAGE, offset);
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="Payments" subtitle="Every transaction, searchable by reference or customer." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => resetTo(() => setSearch(e.target.value))} placeholder="Reference or email" style={{ ...input, maxWidth: 280 }} />
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 150 }}>
            <option value="">All statuses</option><option value="success">Success</option><option value="failed">Failed</option><option value="pending">Pending</option>
          </select>
          <select value={kind} onChange={(e) => resetTo(() => setKind(e.target.value))} style={{ ...input, maxWidth: 150 }}>
            <option value="">All products</option><option value="bundle">Bundle</option><option value="subscription">Subscription</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load payments." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Reference</th><th style={th}>Customer</th><th style={th}>Product</th>
                  <th style={{ ...th, textAlign: "right" }}>Amount</th><th style={{ ...th, textAlign: "right" }}>Credits</th>
                  <th style={th}>Status</th><th style={th}>Date</th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={7}>No payments match.</td></tr>}
                  {data.rows.map((p: PaymentRow) => (
                    <tr key={p.id} onClick={() => nav(`/admin/payments/${p.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 12, color: a.body }}>{p.provider_ref}</td>
                      <td style={td}><div style={{ color: a.ink }}>{p.name || "—"}</div><div style={{ fontSize: 12, color: a.muted }}>{p.email}</div></td>
                      <td style={td}>{p.kind}</td>
                      <td style={{ ...td, textAlign: "right" }}>{p.amount_ghs != null ? "GHS " + p.amount_ghs : "—"}</td>
                      <td style={{ ...td, textAlign: "right", color: a.muted }}>{p.credits ?? "—"}</td>
                      <td style={td}><span style={badgeTone(statusTone(p.status))}>{p.status}</span></td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{new Date(p.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" })}</td>
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
