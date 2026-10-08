import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, filter } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useLayout, pageBox } from "../layout";
import { MathText } from "../MathText";
import { challengeLevels } from "../data/constants";
import { useChallenges, useMyChallengeSubmission, type ChallengeVM } from "../data/queries";
import { useSaveChallengeProgress, useSubmitChallenge } from "../data/mutations";
import { getChallengeCoachHint } from "../data/ai";
import type { Json } from "@/integrations/supabase/types";

type View = "list" | "detail" | "story" | "run" | "confirm" | "done";

const MIN_WORK = 80; // characters per stage — forces more than a single sentence

type ChallengeVMExt = ChallengeVM & { recurring?: boolean; masteryLinked?: boolean };

function matchesChallengeScope(scope: string, levelLabel: string): boolean {
  if (levelLabel === "All") return true;
  const s = (scope || "").toLowerCase();
  const want = levelLabel.toLowerCase();
  if (want === "pan-african") return s.includes("pan-african") || s.includes("continental") || s.includes("africa");
  return s === want || s.includes(want);
}

export default function Challenges() {
  const L = useLayout();
  const nav = useNavigate();
  const { data: challenges, isLoading } = useChallenges();
  const submit = useSubmitChallenge();
  const saveProgress = useSaveChallengeProgress();
  const [view, setView] = useState<View>("list");
  const [levelIdx, setLevelIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [work, setWork] = useState<Record<number, string>>({});
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hint) hintRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hint]);
  const resumedFor = useRef<string | null>(null);

  const all = (challenges || []) as ChallengeVMExt[];
  const filtered = useMemo(() => {
    const label = challengeLevels[levelIdx] || "All";
    return all.filter((ch) => matchesChallengeScope(ch.scope, label));
  }, [all, levelIdx]);

  const current = (all.find((ch) => ch.id === selectedId) || filtered[0] || all[0]) as ChallengeVMExt;
  const { data: mySubmission } = useMyChallengeSubmission(current?.id);

  useEffect(() => {
    if (!current || !mySubmission || resumedFor.current === current.id) return;
    resumedFor.current = current.id;
    const restored: Record<number, string> = {};
    Object.entries(mySubmission.work || {}).forEach(([k, v]) => { restored[Number(k)] = v; });
    setWork(restored);
  }, [current, mySubmission]);

  if (isLoading) return <Loading label="Loading challenges…" />;
  if (all.length === 0) return <EmptyState title="No challenges yet" body="Challenges will appear here once content is loaded from the STEM catalog." />;

  const open = (ch: ChallengeVMExt) => {
    setSelectedId(ch.id);
    setWork({});
    setHint(null);
    resumedFor.current = null;
    setView("detail");
  };
  const featured = all.find((ch) => ch.isFeatured) || all[0];
  const rest = filtered.filter((ch) => ch.id !== featured.id || levelIdx !== 0);
  const hasProgress = mySubmission?.status === "in_progress";

  const goToStage = (next: number) => {
    saveProgress.mutate({ challengeId: current.id, stage: next, work: Object.fromEntries(Object.entries(work).map(([k, v]) => [k, v])) });
    setHint(null);
    setStage(next);
  };

  const askChallengeCoach = async () => {
    const stageCur = current.stages[stage];
    if (!stageCur) return;
    setHint(null);
    setHintLoading(true);
    try {
      const h = await getChallengeCoachHint({
        challengeTitle: current.title,
        stageName: stageCur.name,
        stageTask: stageCur.task,
        studentWork: work[stage] || "",
        conceptNames: current.conceptNames || [],
      });
      setHint(h);
    } catch {
      setHint("Could not reach the Challenge Coach right now. Try again in a moment.");
    } finally {
      setHintLoading(false);
    }
  };

  if (view === "list") {
    return (
      <div style={pageBox(L.pad, 1080)}>
        <div style={{ background: "linear-gradient(150deg,#6b5aa8,#463880)", borderRadius: 20, padding: L.mobile ? "24px 20px" : "32px 34px", color: "#fff", marginBottom: 28, display: "flex", alignItems: "center", gap: 28, flexDirection: L.mobile ? "column" : "row" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 9 }}>Featured challenge</div>
            <h1 style={{ fontSize: L.mobile ? 22 : 26, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>{featured.title}</h1>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.55, maxWidth: 520 }}>{featured.body}</p>
            <button type="button" onClick={() => open(featured)} style={{ marginTop: 18, background: "#fff", color: "#463880", border: "none", fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer" }}>Join challenge</button>
          </div>
          {!L.mobile && <div style={{ flex: "none", width: 150, height: 150, borderRadius: 16, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }} />}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {challengeLevels.map((l, i) => (
            <button key={l} type="button" onClick={() => setLevelIdx(i)} style={filter(levelIdx === i)}>{l}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Nothing in this scope" body={`No catalog challenges match "${challengeLevels[levelIdx]}" yet. Try All.`} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 14 }}>
            {(levelIdx === 0 ? rest : filtered).map((ch) => (
              <button key={ch.id} type="button" onClick={() => open(ch)} style={{ textAlign: "left", background: ch.masteryLinked ? "#F0FDF8" : c.surface, border: `1px solid ${ch.masteryLinked ? "#A7F3D0" : c.border2}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ch.fg, background: ch.bg, padding: "4px 10px", borderRadius: 20 }}>{ch.type}</span>
                  {ch.recurring && <span style={{ fontSize: 10.5, fontWeight: 600, color: "#185fa5", background: "#E6F1FB", padding: "3px 8px", borderRadius: 20 }}>Recurring</span>}
                  {ch.masteryLinked && <span style={{ fontSize: 10.5, fontWeight: 600, color: "#085041", background: "#E1F5EE", padding: "3px 8px", borderRadius: 20 }}>Ready for you</span>}
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
      <div style={pageBox(L.pad, 720)}>
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
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "8px 18px", marginBottom: current.rubric ? 22 : 26 }}>
          {current.stages.map((st, i) => (
            <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < current.stages.length - 1 ? `1px solid ${c.divider}` : "none" }}>
              <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: c.plumTint, color: c.plum, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{st.name}</div>
                <div style={{ fontSize: 12.5, color: c.muted }}>{st.goal}</div>
              </div>
              {st.weight && <span style={{ fontSize: 11, fontWeight: 600, color: c.faint }}>{st.weight}%</span>}
            </div>
          ))}
        </div>
        {current.rubric && current.rubric.length > 0 && (
          <>
            <div style={labelStyle}>How you will be marked</div>
            <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "8px 18px", marginBottom: 26 }}>
              {current.rubric.map((r, i) => (
                <div key={r.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 0", borderBottom: i < current.rubric!.length - 1 ? `1px solid ${c.divider}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.criterion}</div>
                    <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>{r.description}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.plum, flex: "none" }}>{r.max} marks</span>
                </div>
              ))}
            </div>
          </>
        )}
        {current.story ? (
          <button onClick={() => setView("story")} style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", marginBottom: 10 }}>{hasProgress ? "Continue challenge" : "Read the full story and start"}</button>
        ) : (
          <button onClick={() => { setStage(hasProgress ? mySubmission!.stage : 0); setView("run"); }} style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}>{hasProgress ? "Continue challenge" : "Join challenge"}</button>
        )}
      </div>
    );
  }

  // STORY VIEW — shown when the challenge has a `story` field
  if (view === "story") {
    return (
      <div style={pageBox(L.pad, 680)}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.title}</button>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>The challenge story</div>
        <h2 style={{ fontSize: 23, lineHeight: 1.2, marginBottom: 20 }}>{current.title}</h2>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "24px 22px", marginBottom: 24 }}>
          <p style={{ fontSize: 15, color: c.body, lineHeight: 1.7, margin: 0 }}><MathText text={current.story!} /></p>
        </div>
        {current.conceptNames && current.conceptNames.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Concepts this challenge draws on</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {current.conceptNames.map((n) => (
                <span key={n} style={{ fontSize: 12.5, fontWeight: 600, color: current.fg, background: current.bg, padding: "5px 12px", borderRadius: 20 }}>{n}</span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => { setStage(hasProgress ? mySubmission!.stage : 0); setView("run"); }}
          style={{ width: "100%", background: c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}
        >{hasProgress ? "Continue challenge" : "Start this challenge"}</button>
      </div>
    );
  }

  if (view === "run") {
    const stageCur = current.stages[stage];
    const last = stage + 1 >= current.stages.length;
    const totalWeight = current.stages.reduce((s, st) => s + (st.weight || 0), 0);
    const completedWeight = current.stages.slice(0, stage).reduce((s, st) => s + (st.weight || 0), 0);
    const progressPct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : Math.round((stage / current.stages.length) * 100);
    const stageRubric = current.rubric?.[stage];
    const charCount = (work[stage] || "").length;
    const canProceed = charCount >= MIN_WORK;

    return (
      <div style={pageBox(L.pad, 760)}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.title}</button>

        {/* Stage progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {current.stages.map((st, i) => (
            <button key={st.name} onClick={() => i < stage && setStage(i)} style={{ flex: st.weight || 1, background: "none", border: "none", cursor: i < stage ? "pointer" : "default", textAlign: "center", padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, margin: "0 auto 5px", borderRadius: "50%", background: i < stage ? c.green : i === stage ? current.accent : c.track, color: i <= stage ? "#fff" : c.faint, fontSize: 12, fontWeight: 700 }}>{i < stage ? "✓" : i + 1}</div>
              <div style={{ fontSize: 10.5, color: i === stage ? c.ink : c.faint, fontWeight: i === stage ? 600 : 500, lineHeight: 1.2 }}>{st.name}</div>
            </button>
          ))}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: c.track, marginBottom: 24 }}>
          <div style={{ height: "100%", borderRadius: 2, background: c.green, width: `${progressPct}%`, transition: "width .3s" }} />
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 18, padding: "28px 26px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>
            Stage {stage + 1} of {current.stages.length} · {stageCur.goal}
            {stageCur.weight ? <span style={{ marginLeft: 10, color: c.faint }}>{stageCur.weight} marks</span> : null}
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>{stageCur.name}</h2>
          <p style={{ fontSize: 15, color: c.body, lineHeight: 1.65, marginBottom: stageRubric ? 20 : 20 }}><MathText text={stageCur.task} /></p>

          {/* Rubric criterion for this stage */}
          {stageRubric && (
            <div style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 5 }}>
                What the marker looks for · {stageRubric.max} marks
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, marginBottom: 2 }}>{stageRubric.criterion}</div>
              <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>{stageRubric.description}</div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Your work</div>
          <textarea
            value={work[stage] || ""}
            onChange={(e) => setWork((prev) => ({ ...prev, [stage]: e.target.value }))}
            placeholder="Add your notes, calculations, sketch description, or data for this stage…"
            rows={5}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#fff", border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, color: c.ink, fontSize: 13.5, minHeight: 110, outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 11.5, color: canProceed ? c.green : c.faint }}>
              {charCount} chars
            </span>
            {!canProceed && (
              <span style={{ fontSize: 11.5, color: c.faint }}>
                {MIN_WORK - charCount} more to continue
              </span>
            )}
          </div>
        </div>

        {/* Challenge Coach */}
        <div style={{ marginBottom: 16 }}>
          {hint && (
            <div ref={hintRef} style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#92400E", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Challenge Coach</div>
              <p style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.6, margin: 0 }}>{hint}</p>
            </div>
          )}
          <button
            type="button"
            onClick={askChallengeCoach}
            disabled={hintLoading}
            style={{ background: "none", border: "1px solid #FDE68A", color: "#92400E", fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 9, cursor: hintLoading ? "default" : "pointer", opacity: hintLoading ? 0.6 : 1 }}
          >{hintLoading ? "Thinking…" : hint ? "Ask again" : "Ask the Challenge Coach"}</button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { if (stage <= 0) setView(current.story ? "story" : "detail"); else goToStage(stage - 1); }} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Back</button>
          <button
            disabled={!canProceed}
            onClick={() => {
              if (last) {
                goToStage(stage); // save current stage work first
                setView("confirm");
              } else {
                goToStage(stage + 1);
              }
            }}
            style={{ flex: 1, background: canProceed ? c.plum : c.track, color: canProceed ? "#fff" : c.faint, border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: canProceed ? "pointer" : "default", transition: "background .2s" }}
          >{last ? "Review and submit" : "Save and continue"}</button>
        </div>
      </div>
    );
  }

  // CONFIRM — review all work before final submission
  if (view === "confirm") {
    const totalChars = Object.values(work).reduce((sum, w) => sum + (w || "").length, 0);
    const totalWords = Object.values(work).join(" ").split(/\s+/).filter(Boolean).length;

    return (
      <div style={pageBox(L.pad, 720)}>
        <button onClick={() => setView("run")} style={backBtn}>← Back to stage {current.stages.length}</button>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Review your submission</div>
        <h1 style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 6 }}>{current.title}</h1>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>
          {totalWords} words across {current.stages.length} stages. Check your work below before it goes to the marker.
        </p>

        {/* Work summary per stage */}
        <div style={{ marginBottom: 24 }}>
          {current.stages.map((st, i) => {
            const stageWork = (work[i] || "").trim();
            const preview = stageWork.length > 220 ? stageWork.slice(0, 220) + "…" : stageWork;
            return (
              <div key={st.name} style={{ borderBottom: `1px solid ${c.divider}`, paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 24, height: 24, flex: "none", borderRadius: "50%", background: stageWork ? c.green : c.track, color: stageWork ? "#fff" : c.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{stageWork ? "✓" : i + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{st.name}</span>
                  {st.weight && <span style={{ fontSize: 11, color: c.faint, marginLeft: "auto" }}>{st.weight} marks</span>}
                </div>
                {preview ? (
                  <p style={{ fontSize: 13, color: c.body, lineHeight: 1.6, margin: "0 0 0 34px" }}>{preview}</p>
                ) : (
                  <p style={{ fontSize: 13, color: "#e53e3e", margin: "0 0 0 34px", fontStyle: "italic" }}>Nothing written for this stage.</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Rubric reminder */}
        {current.rubric && current.rubric.length > 0 && (
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>What you are marked on</div>
            {current.rubric.map((r, i) => (
              <div key={r.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < current.rubric!.length - 1 ? `1px solid ${c.divider}` : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.criterion}</div>
                  <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4 }}>{r.description}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.plum, flex: "none" }}>{r.max}m</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: c.ink, textAlign: "right" }}>
              Total: {current.rubric.reduce((s, r) => s + r.max, 0)} marks
            </div>
          </div>
        )}

        <div style={{ background: "#FFF8F0", border: "1px solid #FED7AA", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#7C2D12", lineHeight: 1.55, margin: 0 }}>
            Once submitted, you cannot edit your entry. Make sure you are happy with every stage before continuing.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { setStage(current.stages.length - 1); setView("run"); }} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Edit work</button>
          <button
            disabled={submit.isPending}
            onClick={async () => {
              try {
                await submit.mutateAsync({ challengeId: current.id, work: work as unknown as Json });
                setView("done");
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Could not save your entry just now. Check your connection and try again.";
                toast({ title: "Submit failed", description: msg, variant: "destructive" });
              }
            }}
            style={{ flex: 1, background: submit.isPending ? "#7c5ab8" : c.plum, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: submit.isPending ? "default" : "pointer", opacity: submit.isPending ? 0.75 : 1 }}
          >{submit.isPending ? "Submitting…" : "Submit my entry"}</button>
        </div>
        <p style={{ fontSize: 11.5, color: c.faint, textAlign: "center", marginTop: 10 }}>
          {totalChars} characters · {current.stages.length} stages complete
        </p>
      </div>
    );
  }

  // DONE
  const totalWords = Object.values(work).join(" ").split(/\s+/).filter(Boolean).length;
  const doneVerb = current.type.toLowerCase().includes("engineering") ? "engineered" :
                   current.type.toLowerCase().includes("investigation") ? "investigated" : "designed";

  return (
    <div style={pageBox(L.padTall, 640)}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: c.plumTint, border: `2px solid ${c.plumBorder}`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>★</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.plum, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Entry submitted</div>
        <h1 style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 10 }}>You {doneVerb} something real.</h1>
        <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
          {totalWords} words. {current.stages.length} stages. A complete entry for <strong>{current.title}</strong>, ready for the marker.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.plum }}>{totalWords}</div>
          <div style={{ fontSize: 11.5, color: c.faint, marginTop: 3 }}>Words written</div>
        </div>
        <div style={{ flex: 1, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.green }}>{current.stages.length}</div>
          <div style={{ fontSize: 11.5, color: c.faint, marginTop: 3 }}>Stages complete</div>
        </div>
        {current.rubric && (
          <div style={{ flex: 1, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#92400E" }}>{current.rubric.reduce((s, r) => s + r.max, 0)}</div>
            <div style={{ fontSize: 11.5, color: c.faint, marginTop: 3 }}>Marks available</div>
          </div>
        )}
      </div>

      <div style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>What happens next</div>
        <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.65 }}>
          A teacher reviews entries at the end of the {current.timeline} window. You will receive feedback on your reasoning. Strong entries are recognised and shared with the wider {current.scope} community.
        </div>
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
