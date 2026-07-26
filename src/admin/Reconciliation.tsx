import { a, afont, card, sectionLabel, th, td, badgeTone } from "./theme";
import { useReconciliation } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

type Rec = Record<string, unknown>;
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function num(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }
function str(v: unknown): string { return v == null ? "" : String(v); }

export default function Reconciliation() {
  const { data, isLoading, error } = useReconciliation();
  if (isLoading) return <><PageHeader title="Reconciliation" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Reconciliation" /><ErrorNote message="Could not load reconciliation." /></>;

  const unmatched = arr(data.unmatched_payments);
  const cards: [string, string][] = [
    ["Successful payments", num(data.payments_success).toLocaleString()],
    ["Gross collected", "GHS " + num(data.payments_gross_ghs).toLocaleString()],
    ["Failed", num(data.payments_failed).toLocaleString()],
    ["Pending", num(data.payments_pending).toLocaleString()],
    ["Refunds recorded", num(data.refunds_recorded).toLocaleString()],
    ["Refunded value", "GHS " + num(data.refunds_ghs).toLocaleString()],
  ];

  return (
    <>
      <PageHeader title="Reconciliation" subtitle="Payments matched against issued credits; mismatches flagged." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: 12, marginBottom: 26 }}>
          {cards.map(([l, v]) => (
            <div key={l} style={{ ...card, padding: "16px 18px" }}>
              <div style={{ ...sectionLabel, marginBottom: 8 }}>{l}</div>
              <div style={{ fontFamily: afont.display, fontSize: 22, fontWeight: 600, color: a.ink }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ ...sectionLabel, marginBottom: 10 }}>Unmatched successful payments</div>
        <div style={{ fontSize: 13, color: a.muted, marginBottom: 12 }}>Successful payments with no matching credit or purchase ledger entry — these need investigation.</div>
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Reference</th><th style={th}>Product</th><th style={{ ...th, textAlign: "right" }}>Amount</th><th style={th}>Date</th></tr></thead>
            <tbody>
              {unmatched.length === 0 && <tr><td style={{ ...td, color: a.green }} colSpan={4}>All payments reconcile cleanly.</td></tr>}
              {unmatched.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 12 }}>{str(r.ref)} <span style={{ ...badgeTone("red"), marginLeft: 8 }}>unmatched</span></td>
                  <td style={td}>{str(r.kind)}</td>
                  <td style={{ ...td, textAlign: "right" }}>GHS {str(r.amount_ghs)}</td>
                  <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{r.created_at ? new Date(str(r.created_at)).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
