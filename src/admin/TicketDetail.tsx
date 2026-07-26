import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { a, card, sectionLabel, badgeTone, ghostBtn, primaryBtn, input, td } from "./theme";
import { useAdminTicketDetail } from "./data/queries";
import { useTicketAction } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

type Rec = Record<string, unknown>;
function obj(v: unknown): Rec { return (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Rec; }
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function str(v: unknown): string { return v == null ? "" : String(v); }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ ...card, padding: "16px 18px" }}><div style={{ ...sectionLabel, marginBottom: 12 }}>{title}</div>{children}</section>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 13.5 }}><span style={{ color: a.muted }}>{k}</span><span style={{ color: a.ink, fontWeight: 500 }}>{v}</span></div>;
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useAdminTicketDetail(ticketId);
  const act = useTicketAction();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [modal, setModal] = useState<null | "credits" | "assign">(null);
  const [amount, setAmount] = useState("50");
  const [assignee, setAssignee] = useState("");

  if (isLoading) return <><PageHeader title="Ticket" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Ticket" /><ErrorNote message="Could not load this ticket." /></>;

  const ticket = obj(data.ticket);
  const account = obj(data.account);
  const messages = arr(data.messages);
  const sub = obj(data.subscription);
  const status = str(ticket.status);

  const send = () => {
    if (!ticketId || !reply.trim()) return;
    void act.mutateAsync({ ticketId, action: internal ? "note" : "reply", body: reply.trim() }).then(() => setReply(""));
  };
  const quick = (action: string) => { if (ticketId) void act.mutateAsync({ ticketId, action }); };

  return (
    <>
      <PageHeader title={str(ticket.subject)} subtitle={`${str(ticket.category)} · ${str(ticket.priority)} priority`}
        right={<>
          <button type="button" onClick={() => nav("/admin/support")} style={ghostBtn()}>← Support</button>
          {status !== "resolved" ? <button type="button" onClick={() => quick("resolve")} style={primaryBtn()}>Resolve</button>
            : <button type="button" onClick={() => quick("reopen")} style={ghostBtn()}>Reopen</button>}
        </>} />
      <div style={{ padding: 30, display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Conversation">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {messages.length === 0 && <div style={{ fontSize: 13, color: a.faint }}>No messages yet.</div>}
              {messages.map((m, i) => (
                <div key={i} style={{ background: m.internal ? a.amberTint : a.panelAlt, border: `1px solid ${m.internal ? "#f0dcb6" : a.border2}`, borderRadius: 10, padding: "10px 13px" }}>
                  <div style={{ fontSize: 11.5, color: a.muted, marginBottom: 4 }}>{str(m.author) || "Admin"}{m.internal && <span style={{ ...badgeTone("amber"), marginLeft: 8 }}>internal note</span>} · {new Date(str(m.created_at)).toLocaleString()}</div>
                  <div style={{ fontSize: 13.5, color: a.ink, lineHeight: 1.5 }}>{str(m.body)}</div>
                </div>
              ))}
            </div>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder={internal ? "Internal note (not shown to the user)…" : "Reply to the user…"} style={{ ...input, resize: "vertical", marginBottom: 10 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ display: "flex", gap: 6, fontSize: 13, color: a.body }}><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note</label>
              <button type="button" onClick={send} disabled={!reply.trim() || act.isPending} style={{ ...primaryBtn(!reply.trim() || act.isPending), marginLeft: "auto" }}>{internal ? "Add note" : "Send reply"}</button>
            </div>
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 90 }}>
          <Panel title="Ticket">
            <Row k="Status" v={<span style={badgeTone(status === "open" ? "blue" : status === "pending" ? "amber" : "green")}>{status}</span>} />
            <Row k="Priority" v={str(ticket.priority)} />
            <Row k="Assignee" v={str(ticket.assignee) || "—"} />
            <Row k="Opened" v={ticket.created_at ? new Date(str(ticket.created_at)).toLocaleDateString() : "—"} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setModal("assign")} style={ghostBtn()}>Assign</button>
              <button type="button" onClick={() => setModal("credits")} style={ghostBtn()}>Add credits</button>
            </div>
          </Panel>
          <Panel title="Account context">
            <Row k="User" v={str(account.name) || "—"} />
            <Row k="Email" v={str(account.email) || "—"} />
            <Row k="Role" v={str(account.user_type)} />
            <Row k="Status" v={str(account.status)} />
            <Row k="Credit balance" v={n(data.credit_balance).toLocaleString()} />
            {sub.plan && <Row k="Subscription" v={`${str(sub.plan)} (${str(sub.status)})`} />}
            <button type="button" onClick={() => account.user_id && nav(`/admin/users/${str(account.user_id)}`)} style={{ ...ghostBtn(), marginTop: 10 }}>Open user →</button>
          </Panel>
        </div>
      </div>

      {modal === "credits" && (
        <ActionModal title="Add goodwill credits" confirmLabel="Add credits" busy={act.isPending}
          onClose={() => setModal(null)}
          onConfirm={(reason) => { if (ticketId) void act.mutateAsync({ ticketId, action: "add_credits", value: parseInt(amount || "0", 10), reason }).then(() => setModal(null)); }}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Credits</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} /></div>} />
      )}
      {modal === "assign" && (
        <ActionModal title="Assign ticket" confirmLabel="Assign" busy={act.isPending}
          onClose={() => setModal(null)}
          onConfirm={(reason) => { if (ticketId) void act.mutateAsync({ ticketId, action: "assign", assignee, reason }).then(() => setModal(null)); }}
          extra={<div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>Assignee</label><input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Admin name" style={input} /></div>} />
      )}
    </>
  );
}
