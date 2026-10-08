import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c, font, level } from "../theme";
import { Loading, EmptyState } from "../ui";
import { MathText } from "../MathText";
import { useToast } from "@/hooks/use-toast";
import { assessTypesData } from "../data/constants";
import { useAssessmentForTaking } from "../data/queries";
import { useAutosaveAssessment, useSubmitAssessment } from "../data/mutations";

function formatClock(totalSeconds: number): string {
  const m = Math.max(0, Math.floor(totalSeconds / 60));
  const s = Math.max(0, Math.floor(totalSeconds % 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AssessmentTake() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { assessmentId } = useParams();
  const { data: assessment, isLoading, error } = useAssessmentForTaking(assessmentId);
  const submit = useSubmitAssessment();
  const autosave = useAutosaveAssessment();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ score: number; level: string; correct: number; total: number } | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, number>>({});
  const [showReview, setShowReview] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const hydrated = useRef(false);
  const autoSubmitted = useRef(false);

  const typeMeta = assessTypesData.find((t) => t.title.toLowerCase() === (assessment?.type || "").toLowerCase());
  const timed = !!typeMeta?.timed;
  const controlled = !!typeMeta?.controlled;

  // Resume any autosaved draft, and start the clock for timed types.
  useEffect(() => {
    if (hydrated.current || !assessment) return;
    hydrated.current = true;
    if (assessment.draftAnswers?.length) {
      const restored: Record<string, number> = {};
      assessment.draftAnswers.forEach((a) => { restored[a.question_id] = a.chosen_index; });
      setAnswers(restored);
    }
    if (timed && assessment.questions.length) {
      setSecondsLeft(Math.max(600, assessment.questions.length * 90));
    }
  }, [assessment, timed]);

  const submitAll = async () => {
    if (!assessment) return;
    try {
      const payload = assessment.questions.map((qq) => ({ question_id: qq.id, chosen_index: answers[qq.id] ?? -1 }));
      const res = await submit.mutateAsync({ assessmentId: assessment.id, answers: payload });
      setSubmittedAnswers({ ...answers });
      setResult(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not submit this assessment.";
      toast({ title: "Submit failed", description: msg, variant: "destructive" });
    }
  };

  // Countdown for timed types; auto-submits once at zero.
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      if (!autoSubmitted.current) {
        autoSubmitted.current = true;
        toast({ title: "Time's up", description: "Your answers were submitted automatically." });
        void submitAll();
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  const saveDraft = (next: Record<string, number>) => {
    if (!controlled || !assessment) return;
    const payload = assessment.questions.map((qq) => ({ question_id: qq.id, chosen_index: next[qq.id] ?? -1 })).filter((a) => a.chosen_index >= 0);
    if (payload.length === 0) return;
    autosave.mutate({ assessmentId: assessment.id, answers: payload });
  };

  const toggleFlag = (qid: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid); else next.add(qid);
      return next;
    });
  };

  if (isLoading) return <Loading label="Opening your assessment…" />;
  if (error || !assessment) {
    return <EmptyState title="Not available" body={error instanceof Error ? error.message : "This assessment could not be opened."} actionLabel="Back to assignments" onAction={() => nav("/student/assignments")} />;
  }
  if (assessment.questions.length === 0) {
    return <EmptyState title="Not ready yet" body="Your teacher hasn't finished setting up this assessment." actionLabel="Back to assignments" onAction={() => nav("/student/assignments")} />;
  }

  if (result) {
    const [fg, bg] = level(result.level);
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "56px 40px 72px", animation: "fadeup .3s ease" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Submitted</div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{assessment.title}</h1>
        <p style={{ fontSize: 15, color: c.muted, marginBottom: 26 }}>You answered {result.correct} of {result.total} correctly.</p>
        <div style={{ background: bg, border: `1px solid ${fg}33`, borderRadius: 18, padding: "26px 24px", marginBottom: 22, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: font.display, fontSize: 40, color: fg, lineHeight: 1 }}>{result.score}%</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: c.ink }}>{result.level}</div>
            <div style={{ fontSize: 13, color: c.soft }}>This is a mastery indicator, not an official exam result.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowReview((v) => !v)}
          style={{ width: "100%", background: c.surface, border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: 13, borderRadius: 12, cursor: "pointer", marginBottom: 12 }}
        >{showReview ? "Hide your answers" : "Review your answers"}</button>
        {showReview && (
          <div style={{ marginBottom: 22 }}>
            {assessment.questions.map((qq, i) => {
              const chosen = submittedAnswers[qq.id] ?? -1;
              return (
                <div key={qq.id} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, marginBottom: 6 }}>Question {i + 1}</div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.45, color: c.ink, marginBottom: 10 }}><MathText text={qq.prompt} /></div>
                  {chosen >= 0 ? (
                    <div style={{ fontSize: 13, color: c.soft }}>
                      <span style={{ fontWeight: 600, color: c.ink }}>Your answer:</span> {String.fromCharCode(65 + chosen)}. <MathText text={qq.options[chosen] ?? ""} />
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: c.faint, fontStyle: "italic" }}>Not answered</div>
                  )}
                </div>
              );
            })}
            <div style={{ fontSize: 12.5, color: c.faint, textAlign: "center", padding: "8px 0" }}>
              Compare these with your notes to find what to review.
            </div>
          </div>
        )}
        <button type="button" onClick={() => nav("/student/assignments")} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}>Back to assignments</button>
      </div>
    );
  }

  const q = assessment.questions[Math.min(step, assessment.questions.length - 1)];
  const total = assessment.questions.length;
  const last = step + 1 >= total;
  const chosen = answers[q.id];
  const isFlagged = flagged.has(q.id);

  const goTo = (nextStep: number) => {
    saveDraft(answers);
    setStep(nextStep);
  };

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, color: c.faint }}>{assessment.type}</span>
        {controlled && <span style={{ fontSize: 10.5, fontWeight: 600, color: c.plum, background: c.plumTint, border: `1px solid ${c.plumBorder}`, padding: "3px 9px", borderRadius: 20 }}>Controlled · independent work only</span>}
        {timed && secondsLeft !== null && (
          <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 700, color: secondsLeft < 60 ? "#c05a2e" : c.soft, fontVariantNumeric: "tabular-nums" }}>⏱ {formatClock(secondsLeft)}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 26 }}>
        {assessment.questions.map((qq, i) => (
          <span key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: flagged.has(qq.id) ? c.amber : i < step ? c.green : i === step ? "#9fd3ba" : c.track }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase" }}>Question {step + 1} of {total}</div>
        <button type="button" onClick={() => toggleFlag(q.id)} style={{ marginLeft: "auto", background: isFlagged ? c.amberTint : "none", border: `1px solid ${isFlagged ? c.amberBorder : c.border}`, color: isFlagged ? c.amber : c.faint, fontWeight: 600, fontSize: 11.5, padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>
          {isFlagged ? "Flagged ✓" : "Flag for review"}
        </button>
      </div>
      <h2 style={{ fontSize: 21, lineHeight: 1.35, marginBottom: 22 }}><MathText text={q.prompt} /></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
        {q.options.map((opt, i) => {
          const on = chosen === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
              style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 13, background: on ? c.greenTint : c.surface, border: `1px solid ${on ? c.greenTintBorder : c.border2}`, borderRadius: 12, padding: "14px 16px", fontSize: 14.5, color: c.ink, cursor: "pointer" }}
            >
              <span style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", border: `2px solid ${on ? c.green : "#cbc3b2"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: on ? c.green : "#cbc3b2" }}>{String.fromCharCode(65 + i)}</span>
              <MathText text={opt} />
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {step > 0 && (
          <button type="button" onClick={() => goTo(step - 1)} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "13px 22px", borderRadius: 12, cursor: "pointer" }}>Back</button>
        )}
        <button
          type="button"
          disabled={chosen === undefined || submit.isPending}
          onClick={() => { if (last) void submitAll(); else goTo(step + 1); }}
          style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, cursor: "pointer", opacity: chosen === undefined || submit.isPending ? 0.6 : 1 }}
        >{submit.isPending ? "Submitting…" : last ? "Submit assessment" : "Next question"}</button>
      </div>
    </div>
  );
}
