import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, filter } from "../theme";
import { Loading, EmptyState } from "../ui";
import { MathText } from "../MathText";
import { challengeLevels } from "../data/constants";
import { useChallenges, useMyChallengeSubmission, type ChallengeVM } from "../data/queries";
import { useSaveChallengeProgress, useSubmitChallenge } from "../data/mutations";
import type { Json } from "@/integrations/supabase/types";

type View = "list" | "detail" | "run" | "done";

function matchesChallengeScope(scope: string, levelLabel: string): boolean {
  if (levelLabel === "All") return true;
  const s = (scope || "").toLowerCase();
  const want = levelLabel.toLowerCase();
  if (want === "pan-african") return s.includes("pan-african") || s.includes("continental") || s.includes("africa");
  return s === want || s.includes(want);
}

export default function Challenges() {
  const nav = useNavigate();
  const { data: challenges, isLoading } = useChallenges();
  const submit = useSubmitChallenge();
  const saveProgress = useSaveChallengeProgress();
  const [view, setView] = useState<View>("list");
  const [levelIdx, setLevelIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [work, setWork] = useState<Record<number, string>>({});
  const resumedFor = useRef<string | null>(null);

  const all = challenges || [];
  const filtered = useMemo(() => {
    const label = challengeLevels[levelIdx] || "All";
    return all.filter((ch) => matchesChallengeScope(ch.scope, label));
  }, [all, levelIdx]);

  const current: ChallengeVM = all.find((ch) => ch.id === selectedId) || filtered[0] || all[0];
  const { data: mySubmission } = useMyChallengeSubmission(current?.id);

  // Once per challenge, resume from any saved in-progress work.
  useEffect(() => {
    if (!current || !mySubmission || resumedFor.current === current.id) return;
    resumedFor.current = current.id;
    const restored: Record<number, string> = {};
    Object.entries(mySubmission.work || {}).forEach(([k, v]) => { restored[Number(k)] = v; });
    setWork(restored);
  }, [current, mySubmission]);

  if (isLoading) return <Loading label="Loading challenges…" />;
  if (all.length === 0) return <EmptyState title="No challenges yet" body="Challenges will appear here once content is loaded from the STEM catalog." />;

  const open = (ch: ChallengeVM) => { setSelectedId(ch.id); setWork({}); resumedFor.current = null; setView("detail"); };
  const featured = all.find((ch) => ch.isFeatured) || all[0];
  const rest = filtered.filter((ch) => ch.id !== featured.id || levelIdx !== 0);
  const hasProgress = mySubmission?.status === "in_progress";

  const goToStage = (next: number) => {
    saveProgress.mutate({ challengeId: current.id, stage: next, work: Object.fromEntries(Object.entries(work).map(([k, v]) => [k, v])) });
    setStage(next);
  };

  if (view === "list") {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
        <div style={{ background: "linear-gradient(150deg,#6b5aa8,#463880)", borderRadius: 20, padding: "32px 34px", color: "#fff", marginBottom: 28, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 9 }}>Featured continental challenge</div>
            <h1 style={{ fontSize: 26, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>{featured.title}</h1>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.55, maxWidth: 520 }}>From the live challenge catalog. Work solo or as a team. Understand the problem, design a solution, build a model and present your reasoning.</p>
            <button type="button" onClick={() => open(featured)} style={{ marginTop: 18, background: "#fff", color: "#463880", border: "none", fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer" }}>Join challenge</button>
          </div>
          <div style={{ flex: "none", width: 150, height: 150, borderRadius: 16, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {challengeLevels.map((l, i) => (
            <button key={l} type="button" onClick={() => setLevelIdx(i)} style={filter(levelIdx === i)}>{l}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Nothing in this scope" body={`No catalog challenges match “${challengeLevels[levelIdx]}” yet. Try All.`} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {(levelIdx === 0 ? rest : filtered).map((ch) => (
              <button key={ch.id} type="button" onClick={() => open(ch)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ch.fg, background: ch.bg, padding: "4px 10px", borderRadius: 20 }}>{ch.type}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: c.faint }}>{ch.scope}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3, marginBottom: 8 }}>{ch.title}</div>
                <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5, marginBottom: 14 }}>{ch.body}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11.5, color: c.faint }}>{ch.mode} · {ch.timeline}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: c.plum }}>Enter ›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "detail") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
        <button onClick={() => setView("list")} style={backBtn}>← All challenges</button>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: current.fg, background: current.bg, padding: "4px 11px", borderRadius: 20, marginBottom: 12 }}>{current.type}</span>
        <h1 style={{ fontSize: 27, lineHeight: 1.15, marginBottom: 16 }}>{current.title}</h1>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", paddingBottom: 20, borderBottom: `1px solid ${c.border2}`, marginBottom: 22 }}>
          <Meta label="Scope" value={current.scope} />
          <Meta label="Who" value={current.mode} />
          <Meta label="Timeline" value={current.timeline} />
        </div>
        {mySubmission?.reviewedAt && (mySubmission.feedback || mySubmission.feedbackLevel) && (
          <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase" }}>Teacher feedback</span>
              {mySubmission.feedbackLevel && <span style={{ fontSize: 11.5, fontWeight: 600, color: c.greenDark, background: "#fff", border: `1px solid ${c.greenTintBorder}`, padding: "3px 10px", borderRadius: 20 }}>{mySubmission.feedbackLevel}</span>}
            </div>
            {mySubmission.feedback && <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{mySubmission.feedback}</div>}
          </div>
        )}
        <div style={labelStyle}>The brief</div>
        <p style={{ fontSize: 15, color: c.body, lineHeight: 1.65, marginBottom: 26 }}><MathText text={current.brief} /></p>
        <div style={labelStyle}>How it runs</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "8px 18px", marginBottom: 26 }}>
          {current.stages.map((st, i) => (
            <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < current.stages.length - 1 ? `1px solid ${c.divider}` : "none" }}>
              <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: c.plumTint, color: c.plum, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{st.name}</div>
                <div style={{ fontSize: 12.5, color: c.muted }}>{st.goal}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setStage(hasProgress ? mySubmission!.stage : 0); setView("run"); }} style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}>{hasProgress ? "Continue challenge" : "Join challenge"}</button>
      </div>
    );
  }

  if (view === "run") {
    const stageCur = current.stages[stage];
    const last = stage + 1 >= current.stages.length;
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.title}</button>
        <div style={{ display: "flex", gap: 6, marginBottom: 26 }}>
          {current.stages.map((st, i) => (
            <button key={st.name} onClick={() => setStage(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, margin: "0 auto 7px", borderRadius: "50%", background: i < stage ? c.green : i === stage ? current.accent : c.track, color: i <= stage ? "#fff" : c.faint, fontSize: 12.5, fontWeight: 700 }}>{i < stage ? "✓" : i + 1}</div>
              <div style={{ fontSize: 11.5, color: i === stage ? c.ink : c.faint, fontWeight: i === stage ? 600 : 500 }}>{st.name}</div>
            </button>
          ))}
        </div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 18, padding: "28px 26px", marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Stage {stage + 1} of {current.stages.length} · {stageCur.goal}</div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>{stageCur.name}</h2>
          <p style={{ fontSize: 15, color: c.body, lineHeight: 1.65, marginBottom: 20 }}><MathText text={stageCur.task} /></p>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Your work</div>
          <textarea
            value={work[stage] || ""}
            onChange={(e) => setWork((prev) => ({ ...prev, [stage]: e.target.value }))}
            placeholder="Add your notes, a sketch, data or a photo for this stage…"
            rows={4}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#fff", border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, color: c.ink, fontSize: 13.5, minHeight: 96, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { if (stage <= 0) setView("detail"); else goToStage(stage - 1); }} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Back</button>
          <button
            onClick={() => {
              if (last) {
                submit.mutate({ challengeId: current.id, work: work as unknown as Json });
                setView("done");
              } else {
                goToStage(stage + 1);
              }
            }}
            style={{ flex: 1, background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer" }}
          >{last ? "Submit challenge" : "Next stage"}</button>
        </div>
      </div>
    );
  }

  // done
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Submitted</div>
      <h1 style={{ fontSize: 27, lineHeight: 1.15, marginBottom: 8 }}>{current.title}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>Your entry is in. You worked the whole loop, from understanding the problem right through to presenting your reasoning.</p>
      <div style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>What happens next</div>
        <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}>A teacher reviews entries at the end of the {current.timeline} window. You'll get feedback on your reasoning, and strong entries are shared with the wider {current.scope} group.</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setView("list")} style={{ flex: 1, background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer" }}>Explore more challenges</button>
        <button onClick={() => nav("/student/progress")} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>My progress</button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: c.faint, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const backBtn = { background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 } as const;
const labelStyle = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 } as const;
