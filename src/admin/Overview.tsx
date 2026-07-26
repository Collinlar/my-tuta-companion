import { a, afont, card, sectionLabel, badgeTone } from "./theme";
import { usePlatformOverview } from "./data/queries";
import { PageHeader, Loading, ErrorNote } from "./ui";

function ghs(n: number) { return "GHS " + (n || 0).toLocaleString(); }
function num(n: number) { return (n || 0).toLocaleString(); }

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ ...card, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: a.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: afont.display, fontSize: 24, fontWeight: 600, color: a.ink, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: a.faint, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <div style={{ ...sectionLabel, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>{children}</div>
    </section>
  );
}

export default function Overview() {
  const { data, isLoading, error } = usePlatformOverview();

  if (isLoading) return <><PageHeader title="Overview" /><Loading label="Loading platform metrics…" /></>;
  if (error || !data) return <><PageHeader title="Overview" /><ErrorNote message="Could not load platform metrics." /></>;

  const attn = data.attention;
  const attnItems = [
    { label: "Failed payments", n: attn.failed_payments, tone: "red" as const },
    { label: "Past-due subscriptions", n: attn.past_due_subs, tone: "amber" as const },
    { label: "Users with credits expiring (3d)", n: attn.expiring_credit_users, tone: "amber" as const },
  ].filter((x) => x.n > 0);

  return (
    <>
      <PageHeader title="Overview" subtitle="Platform health, activity, revenue, and what needs attention." />
      <div style={{ padding: 30 }}>
        {attnItems.length > 0 && (
          <section style={{ ...card, padding: "16px 18px", marginBottom: 26, borderColor: "#f0d9b6", background: a.amberTint }}>
            <div style={{ ...sectionLabel, color: a.amber, marginBottom: 10 }}>Needs attention</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {attnItems.map((x) => (
                <span key={x.label} style={badgeTone(x.tone)}>{x.label}: {num(x.n)}</span>
              ))}
            </div>
          </section>
        )}

        <Group title="Users">
          <Metric label="Students" value={num(data.users.students)} />
          <Metric label="Teachers" value={num(data.users.teachers)} />
          <Metric label="New (7 days)" value={num(data.users.new_7d)} />
          <Metric label="Active (7 days)" value={num(data.users.active_7d)} hint={`${num(data.users.active_30d)} active in 30 days`} />
        </Group>

        <Group title="Learning">
          <Metric label="Mastery Paths created" value={num(data.learning.paths_created)} />
          <Metric label="Paths completed" value={num(data.learning.paths_completed)} />
          <Metric label="Solve sessions" value={num(data.learning.solve_sessions)} />
          <Metric label="Mastery Checks" value={num(data.learning.mastery_checks)} />
          <Metric label="Concepts mastered" value={num(data.learning.concepts_mastered)} />
        </Group>

        <Group title="Commercial">
          <Metric label="Revenue today" value={ghs(data.commercial.revenue_today)} />
          <Metric label="Revenue this month" value={ghs(data.commercial.revenue_month)} />
          <Metric label="Active subscriptions" value={num(data.commercial.subs_active)} hint={`${num(data.commercial.subs_student_plus)} Plus · ${num(data.commercial.subs_teacher_pro)} Pro`} />
          <Metric label="Failed payments" value={num(data.commercial.failed_payments)} />
          <Metric label="Refunds this month" value={num(data.commercial.refunds_month)} />
        </Group>

        <Group title="Credits">
          <Metric label="Credits issued" value={num(data.credits.issued)} />
          <Metric label="Credits purchased" value={num(data.credits.purchased)} />
          <Metric label="Credits consumed" value={num(data.credits.consumed)} />
          <Metric label="Purchased outstanding" value={num(data.credits.outstanding_purchased)} hint="service liability" />
          <Metric label="Welcome outstanding" value={num(data.credits.outstanding_welcome)} />
          <Metric label="Subscription outstanding" value={num(data.credits.outstanding_subscription)} />
          <Metric label="Expiring (7 days)" value={num(data.credits.expiring_7d)} />
        </Group>
      </div>
    </>
  );
}
