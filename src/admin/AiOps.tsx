import { a, afont, card, sectionLabel, th, td } from "./theme";
import { useAiUsage } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

type Rec = Record<string, unknown>;
function arr(v: unknown): Rec[] { return Array.isArray(v) ? (v as Rec[]) : []; }
function n(v: unknown): number { return typeof v === "number" ? v : Number(v) || 0; }
function str(v: unknown): string { return v == null ? "" : String(v); }

export default function AiOps() {
  const { data, isLoading, error } = useAiUsage();
  if (isLoading) return <><PageHeader title="AI Operations" /><Loading /></>;
  if (error || !data) return <><PageHeader title="AI Operations" /><ErrorNote message="Could not load AI usage." /></>;

  const total = n(data.total_jobs);
  const cards: [string, string][] = [
    ["Total jobs", total.toLocaleString()],
    ["Success", n(data.success).toLocaleString()],
    ["Failed", n(data.failed).toLocaleString()],
    ["Refunded", n(data.refunded).toLocaleString()],
    ["Cost today", "$" + n(data.cost_today).toFixed(2)],
    ["Cost this month", "$" + n(data.cost_month).toFixed(2)],
    ["Avg latency", n(data.avg_latency_ms) + " ms"],
    ["Success rate", total > 0 ? Math.round((100 * n(data.success)) / total) + "%" : "—"],
  ];

  return (
    <>
      <PageHeader title="AI Operations" subtitle="AI generation cost and reliability. Populated once generation logging is wired into /api/groq." />
      <div style={{ padding: 30 }}>
        {total === 0 && (
          <div style={{ ...card, padding: "14px 18px", marginBottom: 22, background: a.blueTint, borderColor: "#c7d9f5", color: a.blue, fontSize: 13.5 }}>
            No AI jobs recorded yet. Logging into <code>ai_jobs</code> from the Groq proxy is deferred instrumentation — this dashboard lights up once it lands.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12, marginBottom: 26 }}>
          {cards.map(([l, v]) => (
            <div key={l} style={{ ...card, padding: "16px 18px" }}>
              <div style={{ ...sectionLabel, marginBottom: 8 }}>{l}</div>
              <div style={{ fontFamily: afont.display, fontSize: 22, fontWeight: 600, color: a.ink }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <section>
            <div style={{ ...sectionLabel, marginBottom: 10 }}>By task</div>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Task</th><th style={{ ...th, textAlign: "right" }}>Jobs</th><th style={{ ...th, textAlign: "right" }}>Failed</th><th style={{ ...th, textAlign: "right" }}>Cost</th></tr></thead>
                <tbody>
                  {arr(data.by_task).length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={4}>No data.</td></tr>}
                  {arr(data.by_task).map((t, i) => (
                    <tr key={i}><td style={td}>{str(t.task)}</td><td style={{ ...td, textAlign: "right" }}>{n(t.jobs)}</td><td style={{ ...td, textAlign: "right", color: n(t.failed) > 0 ? a.red : a.muted }}>{n(t.failed)}</td><td style={{ ...td, textAlign: "right" }}>${n(t.cost).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <div style={{ ...sectionLabel, marginBottom: 10 }}>By model</div>
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Model</th><th style={{ ...th, textAlign: "right" }}>Jobs</th><th style={{ ...th, textAlign: "right" }}>Cost</th></tr></thead>
                <tbody>
                  {arr(data.by_model).length === 0 && <tr><td style={{ ...td, color: a.faint }} colSpan={3}>No data.</td></tr>}
                  {arr(data.by_model).map((m, i) => (
                    <tr key={i}><td style={td}>{str(m.model)}</td><td style={{ ...td, textAlign: "right" }}>{n(m.jobs)}</td><td style={{ ...td, textAlign: "right" }}>${n(m.cost).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
