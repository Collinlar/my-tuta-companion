import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { a, card, sectionLabel, badgeTone, ghostBtn, dangerBtn, td } from "./theme";
import { useAdminPaymentDetail } from "./data/queries";
import { useRecordRefund } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ ...card, padding: "16px 18px" }}><div style={{ ...sectionLabel, marginBottom: 12 }}>{title}</div>{children}</section>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 13.5 }}><span style={{ color: a.muted }}>{k}</span><span style={{ color: a.ink, fontWeight: 500 }}>{v}</span></div>;
}

export default function PaymentDetail() {
  const { paymentId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminPaymentDetail(paymentId);
  const refund = useRecordRefund();
  const [open, setOpen] = useState(false);

  if (isLoading) return <><PageHeader title="Payment" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Payment" /><ErrorNote message="Could not load this payment." /></>;

  const pm = obj(data.payment);
  const user = obj(data.user);
  const refunds = arr(data.refunds);
  const canRefund = str(pm.status) === "success" && str(pm.kind) === "bundle" && refunds.every((r) => str(r.status) !== "success");
  const amount = Number(pm.amount_ghs) || 0;

  return (
    <>
      <PageHeader title={`Payment ${str(pm.provider_ref)}`} subtitle={str(pm.kind)}
        right={<button type="button" onClick={() => nav("/admin/payments")} style={ghostBtn()}>← Payments</button>} />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <Panel title="Transaction">
          <Row k="Reference" v={<span style={{ fontFamily: "monospace", fontSize: 12 }}>{str(pm.provider_ref)}</span>} />
          <Row k="Provider" v={str(pm.provider)} />
          <Row k="Product" v={str(pm.kind)} />
          <Row k="Amount" v={pm.amount_ghs != null ? "GHS " + str(pm.amount_ghs) : "—"} />
          <Row k="Credits" v={str(pm.credits) || "—"} />
          <Row k="Status" v={<span style={badgeTone(str(pm.status) === "success" ? "green" : str(pm.status) === "failed" ? "red" : "amber")}>{str(pm.status)}</span>} />
          <Row k="Date" v={pm.created_at ? new Date(str(pm.created_at)).toLocaleString() : "—"} />
          {canRefund && <div style={{ marginTop: 14 }}><button type="button" onClick={() => setOpen(true)} style={dangerBtn()}>Refund GHS {amount}</button></div>}
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Customer">
            <Row k="Name" v={str(user.name) || "—"} />
            <Row k="Email" v={str(user.email) || "—"} />
            <button type="button" onClick={() => user.user_id && nav(`/admin/users/${str(user.user_id)}`)} style={{ ...ghostBtn(), marginTop: 10 }}>Open user →</button>
          </Panel>

          <Panel title="Refunds">
            {refunds.length === 0 ? <div style={{ fontSize: 13, color: a.faint }}>No refunds on this payment.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {refunds.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontSize: 12 }}>{new Date(str(r.created_at)).toLocaleDateString()}</td>
                      <td style={{ ...td, fontSize: 12 }}>GHS {str(r.amount_ghs)}</td>
                      <td style={{ ...td, fontSize: 12 }}><span style={badgeTone(str(r.status) === "success" ? "green" : str(r.status) === "failed" ? "red" : "neutral")}>{str(r.status)}</span></td>
                      <td style={{ ...td, fontSize: 12, color: a.muted }}>{str(r.reason)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      </div>

      {open && (
        <ActionModal title={`Refund GHS ${amount}?`}
          description="Calls Paystack to reverse this charge and records the refund. Requires Paystack refunds to be enabled on the account."
          confirmLabel="Issue refund" danger busy={refund.isPending}
          onClose={() => setOpen(false)}
          onConfirm={(reason) => { void refund.mutateAsync({ reference: str(pm.provider_ref), amountGhs: amount, reason }).then(() => setOpen(false)).catch(() => setOpen(false)); }}
        />
      )}
    </>
  );
}
