import { useState } from "react";
import { a, card, th, td, badgeTone, input, ghostBtn } from "./theme";
import { useAiJobs, type AiJobRow } from "./data/queries";
import { useRefundAiJob } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

const PAGE = 50;

export default function AiJobs() {
  const [status, setStatus] = useState("");
  const [task, setTask] = useState("");
  const [offset, setOffset] = useState(0);
  const [refundJob, setRefundJob] = useState<AiJobRow | null>(null);
  const { data, isLoading, error } = useAiJobs(task, status, PAGE, offset);
  const refund = useRefundAiJob();
  const resetTo = (fn: () => void) => { fn(); setOffset(0); };

  return (
    <>
      <PageHeader title="AI Jobs" subtitle="Every generation, with failed-job inspection and credit refunds." />
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={task} onChange={(e) => resetTo(() => setTask(e.target.value))} placeholder="Task" style={{ ...input, maxWidth: 200 }} />
          <select value={status} onChange={(e) => resetTo(() => setStatus(e.target.value))} style={{ ...input, maxWidth: 160 }}>
            <option value="">All statuses</option><option value="success">Success</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
          </select>
        </div>

        {isLoading ? <Loading /> : error || !data ? <ErrorNote message="Could not load AI jobs." /> : (
          <>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Task</th><th style={th}>Model</th><th style={th}>User</th>
                  <th style={{ ...th, textAlign: "right" }}>Latency</th><th style={{ ...th, textAlign: "right" }}>Cost</th>
                  <th style={th}>Status</th><th style={th}>When</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {data.rows.length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={8}>No AI jobs recorded yet (logging is deferred instrumentation).</td></tr>}
                  {data.rows.map((j: AiJobRow) => (
                    <tr key={j.id}>
                      <td style={{ ...td, fontWeight: 600, color: a.ink }}>{j.task}</td>
                      <td style={{ ...td, color: a.muted, fontSize: 12 }}>{j.model || "—"}</td>
                      <td style={{ ...td, color: a.muted, fontSize: 12 }}>{j.email || "—"}</td>
                      <td style={{ ...td, textAlign: "right", color: a.muted }}>{j.latency_ms != null ? j.latency_ms + " ms" : "—"}</td>
                      <td style={{ ...td, textAlign: "right" }}>{j.cost_estimate != null ? "$" + Number(j.cost_estimate).toFixed(3) : "—"}</td>
                      <td style={td}><span style={badgeTone(j.status === "success" ? "green" : j.status === "failed" ? "red" : "neutral")}>{j.status}</span></td>
                      <td style={{ ...td, color: a.muted, whiteSpace: "nowrap" }}>{new Date(j.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</td>
                      <td style={{ ...td, textAlign: "right" }}>{j.status === "failed" && j.ref && <button type="button" onClick={() => setRefundJob(j)} style={ghostBtn()}>Refund</button>}</td>
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

      {refundJob && (
        <ActionModal title="Refund this failed job?" description="Returns the linked credit spend to the user and marks the job refunded."
          confirmLabel="Refund credits" busy={refund.isPending} onClose={() => setRefundJob(null)}
          onConfirm={(reason) => { void refund.mutateAsync({ jobId: refundJob.id, reason }).then(() => setRefundJob(null)); }} />
      )}
    </>
  );
}
