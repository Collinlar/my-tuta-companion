import { useEffect, useState } from "react";
import { c, font } from "../theme";
import { useLayout, pageBox } from "../layout";
import { Loading } from "../ui";
import { MathText } from "../MathText";
import { generateConfirmationQuestion, type ConfirmationQuestion } from "../data/ai";
import { useCompleteRetentionReview } from "../data/mutations";
import { DEPTH_LABEL, type Depth, type RetentionGrade } from "../data/depth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  conceptId: string;
  conceptName: string;
  subject: string;
  depth: Depth;
  onDone: () => void;
}

/** A short spaced-retention check for one (concept, depth): one unseen transfer
 * question, no re-teaching. The result advances the review interval. A weak
 * result never removes mastery, it just schedules a sooner review (PRD 12). */
export default function RetentionCheck({ conceptId, conceptName, subject, depth, onDone }: Props) {
  const L = useLayout();
  const { toast } = useToast();
  const complete = useCompleteRetentionReview();
  const [phase, setPhase] = useState<"load" | "quiz" | "grade" | "result">("load");
  const [q, setQ] = useState<ConfirmationQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPhase("load");
    void generateConfirmationQuestion(conceptName, subject)
      .then((res) => { if (!cancelled) { setQ(res); setPhase("quiz"); } })
      .catch(() => { if (!cancelled) { toast({ title: "Could not load the check", description: "Try again in a moment." }); onDone(); } });
    return () => { cancelled = true; };
  }, [conceptId, depth, conceptName, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal correctness first. A correct answer goes to a quick self-grade (how
  // hard it felt) so the schedule can adapt; a miss grades itself "again".
  const check = async () => {
    if (picked === null || q === null) return;
    const ok = picked === q.correctIndex;
    setPassed(ok);
    if (ok) { setPhase("grade"); return; }
    await record("again");
  };

  const record = async (grade: RetentionGrade) => {
    try {
      const res = await complete.mutateAsync({ conceptId, depth, grade });
      setNextDue(res.nextDue);
    } catch {
      /* non-blocking: still show the result */
    }
    setPhase("result");
  };

  if (phase === "load") return <Loading label={`Setting up your ${conceptName} retention check…`} />;

  return (
    <div style={pageBox(L.padTall, 660)}>
      <button type="button" onClick={onDone} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Back</button>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Retention check · {DEPTH_LABEL[depth]}</div>
      <h1 style={{ fontSize: L.mobile ? 22 : 26, marginBottom: 6 }}>{conceptName}</h1>
      <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>One quick question to keep this secure. No re-teaching.</p>

      {phase === "quiz" && q && (
        <>
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "22px 24px", marginBottom: 16 }}>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: c.ink, lineHeight: 1.6, marginBottom: 18 }}><MathText text={q.prompt} /></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, j) => (
                <button key={j} type="button" onClick={() => setPicked(j)}
                  style={{ textAlign: "left", background: picked === j ? c.greenTint : c.surface, border: `1px solid ${picked === j ? c.green : c.border2}`, borderRadius: 11, padding: "12px 16px", fontSize: 14.5, color: c.ink, cursor: "pointer", fontFamily: "inherit" }}>
                  <MathText text={`${["A", "B", "C", "D"][j]}. ${opt}`} />
                </button>
              ))}
            </div>
          </div>
          <button type="button" disabled={picked === null || complete.isPending} onClick={() => void check()}
            style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, cursor: picked === null ? "default" : "pointer", opacity: picked === null ? 0.5 : 1 }}>
            {complete.isPending ? "Checking…" : "Check my answer"}
          </button>
        </>
      )}

      {phase === "grade" && (
        <>
          <div style={{ background: c.greenTint, border: `1px solid ${c.green}`, borderRadius: 16, padding: "22px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: c.greenDark, marginBottom: 8 }}>Correct.</div>
            <p style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}>How did that feel? Your answer sets when this comes back.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([
              { grade: "easy" as const, label: "Easy, I knew it", hint: "Comes back later" },
              { grade: "good" as const, label: "Fine, took a second", hint: "Normal spacing" },
              { grade: "hard" as const, label: "Hard, I nearly missed it", hint: "Comes back sooner" },
            ]).map((o) => (
              <button key={o.grade} type="button" disabled={complete.isPending} onClick={() => void record(o.grade)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 18px", fontSize: 14.5, fontWeight: 500, color: c.ink, cursor: complete.isPending ? "default" : "pointer", fontFamily: "inherit", opacity: complete.isPending ? 0.6 : 1 }}>
                <span>{o.label}</span>
                <span style={{ fontSize: 12, color: c.faint, flex: "none" }}>{o.hint}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "result" && q && (
        <>
          <div style={{ background: passed ? c.greenTint : c.amberTint, border: `1px solid ${passed ? c.green : c.amber}`, borderRadius: 16, padding: "22px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: passed ? c.greenDark : c.amber, marginBottom: 8 }}>
              {passed ? `${conceptName} is still secure.` : "Worth another look."}
            </div>
            <p style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}><MathText text={q.explanation} /></p>
            {!passed && (
              <p style={{ fontSize: 13, color: c.soft, marginTop: 10 }}>Your mastery stays, but mytuta will bring this back sooner to strengthen it.</p>
            )}
          </div>
          {nextDue && (
            <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 18 }}>
              Next retention check: {new Date(nextDue).toLocaleDateString(undefined, { day: "numeric", month: "long" })}.
            </div>
          )}
          <button type="button" onClick={onDone} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer" }}>Done</button>
        </>
      )}
    </div>
  );
}
