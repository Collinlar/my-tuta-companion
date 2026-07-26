import { useState } from "react";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAdminSubscriptions, type SubscriptionRow } from "./data/queries";
import { useSubscriptionAction } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

const PAGE = 50;

type Act = { row: SubscriptionRow; action: "cancel" | "reactivate" | "extend" | "set_founding" | "comp_credits" } | null;

export default function Subscriptions() {
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [founding, setFounding] = useState("");
  const [offset, setOffset] = useState(0);
  const [act, setAct] = useState<Act>(null);
  const [value, setValue] = useState("30");
  const { data, isLoading, error } = useAdminSubscriptions(plan, status, founding, PAGE, offset);
  const run = useSubscriptionAction();

  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  const label: Record<string, string> = {
    cancel: "Cancel subscription", reactivate: "Reactivate subscription",
    extend: "Extend period", set_founding: "Toggle founding price", comp_credits: "Comp credits",
  };
  const needsValue = act && (act.action === "extend" || act.action === "comp_credits");

  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Every subscriber, with plan actions." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={plan} onChange={(e) => resetTo(() => setPlan(e.target.value))} style={{ ...input, maxWidth: 180 }}>
            <option value="">All plans</option><option value="student_plus">Student Plus</option><option value="teacher_pro">Teacher Pro</option>
          </select>
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 160 }}>
            <option value="">All statuses</option><option value="active">Active</option><option value="past_due">Past due</option><option value="canceled">Canceled</option>
          </select>
          <select value={founding} onChange={(e) => resetTo(() => setFounding(e.target.value))} style={{ ...input, maxWidth: 160 }}>
            <option value="">Any pricing</option><option value="yes">Founding</option><option value="no">Standard</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load subscriptions." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Subscriber</th><th style={th}>Plan</th><th style={th}>Status</th>
                  <th style={th}>Renews</th><th style={th}>Pricing</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={6}>No subscriptions match.</td></tr>}
                  {data.rows.map((s) => (
                    <tr key={s.user_id}>
                      <td style={td}><div style={{ fontWeight: 600, color: a.ink }}>{s.name || "—"}</div><div style={{ fontSize: 12, color: a.muted }}>{s.email}</div></td>
                      <td style={td}>{s.plan === "teacher_pro" ? "Teacher Pro" : "Student Plus"}</td>
                      <td style={td}><span style={badgeTone(s.status === "active" ? "green" : s.status === "past_due" ? "amber" : "neutral")}>{s.status}</span></td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                      <td style={td}>{s.founding ? <span style={badgeTone("amber")}>founding</span> : <span style={{ color: a.muted, fontSize: 12 }}>standard</span>}</td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                        {s.status === "active"
                          ? <button type="button" onClick={() => setAct({ row: s, action: "cancel" })} style={ghostBtn()}>Cancel</button>
                          : <button type="button" onClick={() => setAct({ row: s, action: "reactivate" })} style={ghostBtn()}>Reactivate</button>}
                        <button type="button" onClick={() => { setValue("30"); setAct({ row: s, action: "extend" }); }} style={{ ...ghostBtn(), marginLeft: 6 }}>Extend</button>
                        <button type="button" onClick={() => { setValue("100"); setAct({ row: s, action: "comp_credits" }); }} style={{ ...ghostBtn(), marginLeft: 6 }}>Comp</button>
                        <button type="button" onClick={() => setAct({ row: s, action: "set_founding" })} style={{ ...ghostBtn(), marginLeft: 6 }}>Founding</button>
                      </td>
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

      {act && (
        <ActionModal
          title={label[act.action]}
          description={act.action === "set_founding" ? `${act.row.founding ? "Remove" : "Apply"} founding pricing for ${act.row.name || act.row.email}.` : `For ${act.row.name || act.row.email}.`}
          confirmLabel={label[act.action]} danger={act.action === "cancel"} busy={run.isPending}
          onClose={() => setAct(null)}
          onConfirm={(reason) => {
            const v = act.action === "set_founding" ? (act.row.founding ? 0 : 1) : act.action === "cancel" || act.action === "reactivate" ? 0 : parseInt(value || "0", 10);
            void run.mutateAsync({ userId: act.row.user_id, action: act.action, value: v, reason }).then(() => setAct(null));
          }}
          extra={needsValue ? (
            <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{act.action === "extend" ? "Days to add" : "Credits to grant"}</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={input} /></div>
          ) : undefined}
        />
      )}
    </>
  );
}
