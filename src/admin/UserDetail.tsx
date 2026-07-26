import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { a, afont, card, badgeTone, sectionLabel, ghostBtn, primaryBtn, dangerBtn, input, td, th } from "./theme";
import { useAdminUserDetail } from "./data/queries";
import { useSetUserStatus, useChangeUserRole, useAddUserNote, useAdjustCredits, useExtendCreditExpiry, useCancelSubscription, useAdminRefundCredits } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }

type Action =
  | { t: "status"; to: "active" | "suspended" }
  | { t: "role"; to: "student" | "teacher" }
  | { t: "note" }
  | { t: "credits" }
  | { t: "expiry" }
  | { t: "cancelSub" }
  | { t: "refund"; txnId: string }
  | null;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ ...card, padding: "16px 18px" }}>
      <div style={{ ...sectionLabel, marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 13.5 }}>
      <span style={{ color: a.muted }}>{k}</span>
      <span style={{ color: a.ink, fontWeight: 500, textAlign: "right" }}>{v}</span>
    </div>
  );
}

export default function UserDetail() {
  const { userId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminUserDetail(userId);
  const [action, setAction] = useState<Action>(null);
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("30");

  const setStatus = useSetUserStatus();
  const changeRole = useChangeUserRole();
  const addNote = useAddUserNote();
  const adjust = useAdjustCredits();
  const extend = useExtendCreditExpiry();
  const cancelSub = useCancelSubscription();
  const refund = useAdminRefundCredits();
  const busy = setStatus.isPending || changeRole.isPending || addNote.isPending || adjust.isPending || extend.isPending || cancelSub.isPending || refund.isPending;

  if (isLoading) return <><PageHeader title="User" /><Loading /></>;
  if (error || !data) return <><PageHeader title="User" /><ErrorNote message="Could not load this user." /></>;

  const acc = obj(data.account);
  const usage = obj(data.usage);
  const wallet = obj(data.wallet);
  const sub = obj(data.subscription);
  const learning = obj(data.learning);
  const teaching = obj(data.teaching);
  const name = `${str(acc.first_name)} ${str(acc.last_name)}`.trim() || str(acc.email) || "User";
  const status = str(acc.status) || "active";
  const isTeacher = str(acc.user_type) === "teacher";
  const hasActiveSub = str(sub.status) === "active";

  const close = () => setAction(null);
  const run = (fn: Promise<unknown>) => { void fn.then(close); };

  const onConfirm = (reason: string) => {
    if (!userId || !action) return;
    switch (action.t) {
      case "status": run(setStatus.mutateAsync({ userId, status: action.to, reason })); break;
      case "role": run(changeRole.mutateAsync({ userId, role: action.to, reason })); break;
      case "note": run(addNote.mutateAsync({ userId, note: reason })); break;
      case "credits": run(adjust.mutateAsync({ userId, amount: parseInt(amount || "0", 10), reason })); break;
      case "expiry": run(extend.mutateAsync({ userId, days: parseInt(days || "0", 10), reason })); break;
      case "cancelSub": run(cancelSub.mutateAsync({ userId, reason })); break;
      case "refund": run(refund.mutateAsync({ txnId: action.txnId, reason })); break;
    }
  };

  const exportData = async () => {
    if (!userId) return;
    const { data: dump } = await supabase.rpc("admin_export_user_data", { p_user_id: userId });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `user-${userId}.json`; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title={name}
        subtitle={str(acc.email)}
        right={
          <>
            <button type="button" onClick={() => nav("/admin/users")} style={ghostBtn()}>← Users</button>
            <button type="button" onClick={() => void exportData()} style={ghostBtn()}>Export data</button>
          </>
        }
      />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left: profile panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Account">
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={badgeTone(isTeacher ? "purple" : "blue")}>{str(acc.user_type)}</span>
              <span style={badgeTone(status === "suspended" ? "red" : "green")}>{status}</span>
              {str(acc.onboarding_completed) === "true" && <span style={badgeTone("neutral")}>onboarded</span>}
            </div>
            <Row k="School" v={str(acc.school) || "—"} />
            <Row k="Grade" v={str(acc.grade) || "—"} />
            <Row k="Joined" v={acc.created_at ? new Date(str(acc.created_at)).toLocaleDateString() : "—"} />
            <Row k="Last active" v={usage.last_active ? new Date(str(usage.last_active)).toLocaleDateString() : "—"} />
          </Panel>

          <Panel title="Usage">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[["Mastery Paths", usage.mastery_paths], ["Solve sessions", usage.solve_sessions], ["Attempts", usage.attempts],
                ["Assessments", usage.assessments], ["Challenges", usage.challenges]].map(([l, v]) => (
                <div key={String(l)}>
                  <div style={{ fontFamily: afont.display, fontSize: 20, fontWeight: 600, color: a.ink }}>{n(v).toLocaleString()}</div>
                  <div style={{ fontSize: 11.5, color: a.muted }}>{String(l)}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Credit wallet">
            <Row k="Total balance" v={<b>{n(wallet.total).toLocaleString()} credits</b>} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 14px" }}>
              {arr(wallet.lots).map((l, i) => (
                <span key={i} style={badgeTone("neutral")}>{str(l.kind)}: {n(l.remaining)}{l.expires_at ? ` · exp ${new Date(str(l.expires_at)).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""}</span>
              ))}
            </div>
            <div style={{ ...sectionLabel, margin: "6px 0 8px" }}>Recent transactions</div>
            <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${a.border2}`, borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {arr(wallet.transactions).map((t) => (
                    <tr key={str(t.id)}>
                      <td style={{ ...td, whiteSpace: "nowrap", color: a.muted, fontSize: 12 }}>{new Date(str(t.created_at)).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</td>
                      <td style={{ ...td, fontSize: 12 }}>{str(t.description) || str(t.kind)}</td>
                      <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", color: n(t.amount) < 0 ? a.red : a.green, fontWeight: 600, fontSize: 12 }}>{n(t.amount) > 0 ? "+" : ""}{n(t.amount)}</td>
                      <td style={{ ...td, textAlign: "right", padding: "6px 10px" }}>
                        {str(t.kind) === "spend" && <button type="button" onClick={() => setAction({ t: "refund", txnId: str(t.id) })} style={{ background: "none", border: `1px solid ${a.border}`, borderRadius: 6, fontSize: 11, color: a.blue, padding: "3px 8px", cursor: "pointer" }}>Refund</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {isTeacher ? (
            <Panel title="Teaching">
              <Row k="Classes" v={n(teaching.classes)} />
              <Row k="Experiences created" v={n(teaching.experiences)} />
              <Row k="Assessments created" v={n(teaching.assessments)} />
            </Panel>
          ) : (
            <Panel title="Learning">
              <Row k="Classes" v={arr(learning.classes).map(String).join(", ") || "—"} />
              <div style={{ ...sectionLabel, margin: "10px 0 6px" }}>Concepts</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {arr(learning.concepts).slice(0, 20).map((cpt, i) => (
                  <span key={i} style={badgeTone(str(cpt.state) === "Secure" || str(cpt.state) === "Mastered" ? "green" : "amber")}>{str(cpt.concept)}</span>
                ))}
                {arr(learning.concepts).length === 0 && <span style={{ fontSize: 13, color: a.faint }}>No concepts yet.</span>}
              </div>
            </Panel>
          )}
        </div>

        {/* Right: actions + subscription + notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 90 }}>
          <Panel title="Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {status === "active"
                ? <button type="button" style={dangerBtn()} onClick={() => setAction({ t: "status", to: "suspended" })}>Suspend account</button>
                : <button type="button" style={primaryBtn()} onClick={() => setAction({ t: "status", to: "active" })}>Reactivate account</button>}
              <button type="button" style={ghostBtn()} onClick={() => { setAmount(""); setAction({ t: "credits" }); }}>Adjust credits</button>
              <button type="button" style={ghostBtn()} onClick={() => { setDays("30"); setAction({ t: "expiry" }); }}>Extend credit expiry</button>
              <button type="button" style={ghostBtn()} onClick={() => setAction({ t: "role", to: isTeacher ? "student" : "teacher" })}>Change role to {isTeacher ? "student" : "teacher"}</button>
              {hasActiveSub && <button type="button" style={ghostBtn()} onClick={() => setAction({ t: "cancelSub" })}>Cancel subscription</button>}
              <button type="button" style={ghostBtn()} onClick={() => setAction({ t: "note" })}>Add note</button>
            </div>
          </Panel>

          <Panel title="Subscription">
            {hasActiveSub ? (
              <>
                <Row k="Plan" v={str(sub.plan) === "teacher_pro" ? "Teacher Pro" : "Student Plus"} />
                <Row k="Status" v={<span style={badgeTone("green")}>{str(sub.status)}</span>} />
                <Row k="Monthly credits" v={n(sub.monthly_credits)} />
                <Row k="Renews" v={sub.current_period_end ? new Date(str(sub.current_period_end)).toLocaleDateString() : "—"} />
                {str(sub.founding) === "true" && <Row k="Pricing" v={<span style={badgeTone("amber")}>Founding</span>} />}
              </>
            ) : <div style={{ fontSize: 13, color: a.faint }}>No active subscription.</div>}
          </Panel>

          <Panel title="Admin notes & history">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {arr(data.notes).length === 0 && <div style={{ fontSize: 13, color: a.faint }}>No admin actions yet.</div>}
              {arr(data.notes).map((nt, i) => (
                <div key={i} style={{ fontSize: 12.5, color: a.body, borderLeft: `2px solid ${a.border}`, paddingLeft: 10 }}>
                  <div style={{ color: a.muted, fontSize: 11 }}>{str(nt.action)} · {new Date(str(nt.created_at)).toLocaleDateString()}</div>
                  {str(nt.reason) && <div>{str(nt.reason)}</div>}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {action?.t === "status" && (
        <ActionModal title={action.to === "suspended" ? "Suspend this account?" : "Reactivate this account?"}
          description={action.to === "suspended" ? "The account is flagged suspended and this is audited. Session-blocking enforcement lands in a later phase." : undefined}
          confirmLabel={action.to === "suspended" ? "Suspend" : "Reactivate"} danger={action.to === "suspended"} busy={busy}
          onConfirm={onConfirm} onClose={close} />
      )}
      {action?.t === "role" && (
        <ActionModal title={`Change role to ${action.to}?`} confirmLabel="Change role" busy={busy} onConfirm={onConfirm} onClose={close} />
      )}
      {action?.t === "note" && (
        <ActionModal title="Add an internal note" description="Notes are stored on the audit trail for this user." confirmLabel="Save note" busy={busy} onConfirm={onConfirm} onClose={close} />
      )}
      {action?.t === "cancelSub" && (
        <ActionModal title="Cancel this subscription?" description="Clears remaining subscription credits and marks the subscription canceled." confirmLabel="Cancel subscription" danger busy={busy} onConfirm={onConfirm} onClose={close} />
      )}
      {action?.t === "refund" && (
        <ActionModal title="Refund this spend?" description="Returns the credits into a non-expiring lot. Guarded against double refunds." confirmLabel="Refund credits" busy={busy} onConfirm={onConfirm} onClose={close} />
      )}
      {action?.t === "credits" && (
        <ActionModal title="Adjust credits" description="Positive adds a non-expiring promo lot; negative draws down live credits." confirmLabel="Apply adjustment" busy={busy} onConfirm={onConfirm} onClose={close}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Amount (+ add / − remove)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50 or -20" style={input} /></div>} />
      )}
      {action?.t === "expiry" && (
        <ActionModal title="Extend credit expiry" description="Pushes the expiry of all this user's expiring live lots forward." confirmLabel="Extend expiry" busy={busy} onConfirm={onConfirm} onClose={close}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Days to add</label><input type="number" value={days} onChange={(e) => setDays(e.target.value)} style={input} /></div>} />
      )}
    </>
  );
}
