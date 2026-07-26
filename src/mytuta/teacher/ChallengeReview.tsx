import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c, font, level } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useToast } from "@/hooks/use-toast";
import { useChallengeDetail, useChallengeSubmissions, type TeacherSubmissionVM } from "../data/queries";
import { useReviewChallengeSubmission } from "../data/mutations";

const feedbackLevels = ["Beginning", "Developing", "Secure", "Mastered"];

export default function ChallengeReview() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { classId, challengeId } = useParams();
  const { data: challenge } = useChallengeDetail(challengeId);
  const { data: submissions, isLoading } = useChallengeSubmissions(challengeId);
  const review = useReviewChallengeSubmission();

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ feedback: string; level: string }>({ feedback: "", level: "" });

  const open = (s: TeacherSubmissionVM) => {
    setOpenId(s.id);
    setDraft({ feedback: s.feedback, level: s.feedbackLevel });
  };

  useEffect(() => { setOpenId(null); }, [challengeId]);

  if (isLoading) return <Loading label="Loading submissions…" />;
  const list = submissions || [];
  const stages = challenge?.stages || [];

  const saveReview = async (submissionId: string) => {
    if (!challengeId) return;
    try {
      await review.mutateAsync({ submissionId, challengeId, feedback: draft.feedback, level: draft.level });
      toast({ title: "Feedback sent", description: "The student has been notified." });
      setOpenId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send feedback just now.";
      toast({ title: "Review failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
      <button type="button" onClick={() => nav(`/teacher/classes/${classId || ""}`)} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← {challenge?.title || "Challenge"}</button>
      <div style={{ fontFamily: font.display, fontSize: 24, marginBottom: 4 }}>Review submissions</div>
      <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 24 }}>{challenge?.title}</div>

      {list.length === 0 ? (
        <EmptyState title="No submissions yet" body="Once students work through and submit this challenge, their entries appear here for you to review." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((s) => {
            const isOpen = openId === s.id;
            const [fg, bg] = s.feedbackLevel ? level(s.feedbackLevel) : [c.faint, c.paper];
            return (
              <div key={s.id} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <button type="button" onClick={() => (isOpen ? setOpenId(null) : open(s))} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, fontFamily: font.body }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: c.ink }}>{s.studentName}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: s.submitted ? c.green : c.faint }}>{s.submitted ? "Submitted" : "In progress"}</span>
                  {s.reviewedAt && <span style={{ fontSize: 11, fontWeight: 600, color: fg, background: bg, padding: "3px 9px", borderRadius: 20 }}>{s.feedbackLevel || "Reviewed"}</span>}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Their work</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {stages.map((st, i) => {
                        const work = s.work[String(i)];
                        return (
                          <div key={i} style={{ background: c.paper, border: `1px solid ${c.border2}`, borderRadius: 11, padding: "11px 13px" }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: c.soft, marginBottom: 4 }}>{i + 1}. {st.name}</div>
                            <div style={{ fontSize: 13, color: work ? c.ink : c.placeholder, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{work || "No work recorded for this stage."}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Level</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {feedbackLevels.map((l) => {
                        const on = draft.level === l;
                        const [lf, lb] = level(l);
                        return (
                          <button key={l} type="button" onClick={() => setDraft((d) => ({ ...d, level: l }))} style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 20, cursor: "pointer", color: on ? lf : c.soft, background: on ? lb : c.surface, border: `1px solid ${on ? lf + "55" : c.border2}` }}>{l}</button>
                        );
                      })}
                    </div>

                    <textarea
                      value={draft.feedback}
                      onChange={(e) => setDraft((d) => ({ ...d, feedback: e.target.value }))}
                      placeholder="Write feedback for this student…"
                      rows={3}
                      style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 12 }}
                    />
                    <button type="button" disabled={review.isPending || (!draft.feedback.trim() && !draft.level)} onClick={() => void saveReview(s.id)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 20px", borderRadius: 10, cursor: "pointer", opacity: review.isPending || (!draft.feedback.trim() && !draft.level) ? 0.6 : 1 }}>{review.isPending ? "Sending…" : s.reviewedAt ? "Update feedback" : "Send feedback"}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
