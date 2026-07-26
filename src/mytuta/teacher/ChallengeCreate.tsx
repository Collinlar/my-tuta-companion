import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c, font, chip } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useToast } from "@/hooks/use-toast";
import { challengeTypeOptions } from "../data/constants";
import { useClasses } from "../data/queries";
import { useCreateClassChallenge } from "../data/mutations";
import { useCreditGate } from "../credits/CreditGate";

export default function ChallengeCreate() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { classId } = useParams();
  const { data: classes, isLoading } = useClasses();
  const create = useCreateClassChallenge();
  const gate = useCreditGate();

  const [typeIdx, setTypeIdx] = useState(0);
  const [topic, setTopic] = useState("");
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<{ title: string; brief: string } | null>(null);

  if (isLoading) return <Loading label="Loading your class…" />;
  const klass = (classes || []).find((cl) => cl.id === classId);
  if (!klass) return <EmptyState title="Class not found" body="This class may have been removed." actionLabel="Back to classes" onAction={() => nav("/teacher/classes")} />;

  if (created) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Challenge created</div>
        <h1 style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 8 }}>{created.title}</h1>
        <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>{created.brief}</p>
        <div style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.6 }}>{klass.name} can see and join this challenge now. Track submissions from the class page.</div>
        </div>
        <button type="button" onClick={() => nav("/teacher/classes")} style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}>Back to {klass.name}</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
      <button type="button" onClick={() => nav("/teacher/classes")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← {klass.name}</button>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Create a class challenge</h1>
      <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>mytuta drafts a brief and the stages your students work through. Visible to {klass.name} as soon as it's created.</p>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>Type</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {challengeTypeOptions.map((t, i) => (
          <button type="button" key={t} onClick={() => setTypeIdx(i)} style={chip(typeIdx === i)}>{t}</button>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>Focus topic (optional)</div>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. clean water, forces, ratios — leave blank for a general STEM application"
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 11, padding: "13px 14px", fontSize: 15, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 24 }}
      />

      {err && <p style={{ marginBottom: 16, fontSize: 13.5, color: "#c05a2e" }}>{err}</p>}

      <button
        type="button"
        disabled={create.isPending}
        onClick={() => void gate.run({
          actionKey: "challenge_generate",
          title: "Create this class challenge?",
          description: `mytuta writes a brief and stages for ${klass.name}.`,
          action: async () => {
            setErr("");
            try {
              const row = await create.mutateAsync({ classId: klass.id, className: klass.name, type: challengeTypeOptions[typeIdx], topic });
              toast({ title: "Challenge created", description: `${klass.name} can now join "${row.title}".` });
              setCreated({ title: row.title, brief: row.brief || "" });
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Could not create this challenge just now.";
              setErr(msg);
              throw e; // let the gate refund
            }
          },
        })}
        style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", opacity: create.isPending ? 0.7 : 1 }}
      >{create.isPending ? "Writing the challenge…" : "Create challenge"}</button>
    </div>
  );
}
