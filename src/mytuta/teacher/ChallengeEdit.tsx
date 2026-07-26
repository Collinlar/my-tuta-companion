import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c, font } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useToast } from "@/hooks/use-toast";
import { useChallengeDetail, useClasses, type ChallengeStage } from "../data/queries";
import { useUpdateClassChallenge } from "../data/mutations";

export default function ChallengeEdit() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { classId, challengeId } = useParams();
  const { data: classes } = useClasses();
  const { data: challenge, isLoading } = useChallengeDetail(challengeId);
  const update = useUpdateClassChallenge();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [brief, setBrief] = useState("");
  const [stages, setStages] = useState<ChallengeStage[]>([]);
  const seededFor = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!challenge || seededFor.current === challenge.id) return;
    seededFor.current = challenge.id;
    setTitle(challenge.title);
    setBody(challenge.body);
    setBrief(challenge.brief);
    setStages(challenge.stages.map((s) => ({ ...s })));
  }, [challenge]);

  if (isLoading) return <Loading label="Loading this challenge…" />;
  const klass = (classes || []).find((cl) => cl.id === classId);
  if (!challenge) return <EmptyState title="Challenge not found" body="This challenge may have been removed." actionLabel="Back to classes" onAction={() => nav("/teacher/classes")} />;

  const editStage = (i: number, patch: Partial<ChallengeStage>) => {
    setStages((prev) => prev.map((s, si) => (si === i ? { ...s, ...patch } : s)));
  };

  const save = async () => {
    try {
      await update.mutateAsync({ id: challenge.id, classId, title, body, brief, stages });
      toast({ title: "Challenge updated" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your changes just now.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
      <button type="button" onClick={() => nav(`/teacher/classes/${classId || ""}`)} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← {klass?.name || "Class"}</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Edit challenge</h1>
        <span style={{ fontSize: 11, fontWeight: 600, color: challenge.fg, background: challenge.bg, padding: "3px 10px", borderRadius: 20 }}>{challenge.type}</span>
        <button type="button" onClick={() => nav(`/teacher/classes/${classId || ""}/challenge/${challenge.id}/submissions`)} style={{ marginLeft: "auto", background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>Review submissions</button>
      </div>
      <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>Refine the brief or a stage's wording. Students see your saved version immediately.</p>

      <div style={lbl}>Title</div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 18 }}
      />

      <div style={lbl}>One-line summary</div>
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 18 }}
      />

      <div style={lbl}>Brief</div>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={3}
        style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 24 }}
      />

      <div style={lbl}>Stages</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
        {stages.map((s, i) => (
          <div key={i} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.faint }}>{i + 1}.</span>
              <input
                value={s.name}
                onChange={(e) => editStage(i, { name: e.target.value })}
                placeholder="Stage name"
                style={{ flex: 1, fontWeight: 600, border: `1px solid ${c.border}`, borderRadius: 9, padding: "8px 10px", fontSize: 13.5, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 20 }}>
              <div>
                <div style={miniLbl}>Goal</div>
                <textarea
                  value={s.goal}
                  onChange={(e) => editStage(i, { goal: e.target.value })}
                  rows={2}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border2}`, borderRadius: 9, padding: "8px 10px", fontSize: 13, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
                />
              </div>
              <div>
                <div style={miniLbl}>Task</div>
                <textarea
                  value={s.task}
                  onChange={(e) => editStage(i, { task: e.target.value })}
                  rows={2}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border2}`, borderRadius: 9, padding: "8px 10px", fontSize: 13, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          disabled={update.isPending || !title.trim()}
          onClick={() => void save()}
          style={{ flex: 1, background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer", opacity: update.isPending || !title.trim() ? 0.6 : 1 }}
        >{update.isPending ? "Saving…" : "Save changes"}</button>
        <button type="button" onClick={() => nav(`/teacher/classes/${classId || ""}`)} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Done</button>
      </div>
    </div>
  );
}

const lbl = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase" as const, marginBottom: 11 };
const miniLbl = { fontSize: 10.5, fontWeight: 600, color: c.faint, letterSpacing: ".04em", textTransform: "uppercase" as const, marginBottom: 5 };
