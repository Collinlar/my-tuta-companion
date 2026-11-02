import { useEffect, useMemo, useRef, useState } from "react";
import { c } from "../theme";
import { MathText } from "../MathText";
import PrerequisiteRepair from "./PrerequisiteRepair";
import BlockAudio from "./BlockAudio";
import ReviewedBlockTask from "./ReviewedBlockTask";
import { adaptiveBlockSequence, learningContent, suggestedBlock, type BlockProgress, type Prerequisite } from "../data/blockRuntime";
import { DEPTH_LABEL, type Depth } from "../data/depth";
import KnowledgeBlockVisual from "./KnowledgeBlockVisual";
import { BLOCK_TYPE_LABEL, type KnowledgeBlock, type BlockType, type BlockState } from "../data/blocks";

/** The Foundation block-runner (Concept Competency Framework, Phase 1). Replaces
 * the single "Understand" stage (one explanation shown five ways) with a
 * deliberate walk through the concept's required Knowledge Blocks. The five
 * support modalities live inside each block. Versioned server progress restores
 * coverage and feedback; adaptive navigation prioritizes eligible reinforcement. */
const EMPTY_PROGRESS: Record<string, BlockProgress> = {};
export default function KnowledgeBlocks({ conceptName, blocks, covered, progress = EMPTY_PROGRESS, initialBlockId, depth = "foundation", onBlockUnderstood, prerequisiteGaps = {}, onActivity, onRepair, onSubmitResponse, onNext }: {
  conceptName: string; blocks: KnowledgeBlock[]; covered?: Set<string>; progress?: Record<string, BlockProgress>; initialBlockId?: string; depth?: Depth;
  onBlockUnderstood?: (blockId: string, passed: boolean, answer?: number | null, exampleKey?: string | null) => Promise<unknown>;
  prerequisiteGaps?: Record<string, Prerequisite[]>;
  onActivity?: (blockId: string, version: number, event: string, modality: string, seconds?: number) => Promise<unknown>;
  onRepair?: (blockId: string, version: number, prerequisite: Prerequisite, answer: number) => Promise<boolean>;
  onSubmitResponse?: (blockId: string, version: number, text: string) => Promise<unknown>; onNext: () => void;
}) {
  // Seed from prior coverage so understanding persists across sessions (PRD 32),
  // and open on the first block not yet understood.
  const [state, setState] = useState<Record<string, BlockState>>(() => Object.fromEntries(blocks.map((b) => [b.id, progress[b.id]?.state || (covered?.has(b.id) ? "understood" : "not_started")])));
  const [active, setActive] = useState(() => { const direct = blocks.findIndex((b) => b.id === initialBlockId); if (direct >= 0) return direct; const i = Object.keys(progress).length ? suggestedBlock(blocks, progress) : blocks.findIndex((b) => !covered?.has(b.id)); return i < 0 ? 0 : i; });
  const [mode, setMode] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const [attemptContent, setAttemptContent] = useState<ReturnType<typeof learningContent> | null>(null);
  const [pendingResponses, setPendingResponses] = useState<Set<string>>(new Set());
  const [trackingError, setTrackingError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    if (!covered) return;
    setState((previous) => ({ ...previous, ...Object.fromEntries([...covered].map((id) => [id, "understood" as BlockState])) }));
  }, [covered]);

  useEffect(() => {
    if (Object.keys(progress).length) setState((previous) => ({ ...previous, ...Object.fromEntries(Object.values(progress).map((p) => [p.id, p.state])) }));
    setPendingResponses((previous) => new Set([...previous].filter((id) => !progress[id]?.response || progress[id].response?.status === "pending")));
  }, [progress]);
  const activityRef = useRef(onActivity);
  activityRef.current = onActivity;
  const cur = blocks[Math.min(active, blocks.length - 1)];
  const content = attemptContent || (cur ? learningContent(cur, progress[cur.id]) : {});
  const modes = content.modes || [];
  const qc = content.task ? undefined : content.quickCheck;
  const modality = audioPlaying ? "Audio" : mode === 0 ? "Main" : content.modes?.[mode - 1]?.label || "Main";
  useEffect(() => {
    if (!cur || !activityRef.current) return;
    const send = (event: string, seconds = 0) => { void activityRef.current?.(cur.id, cur.version || 1, event, modality, seconds).then(() => setTrackingError(false)).catch(() => setTrackingError(true)); };
    send("opened");
    let last = Date.now();
    const timer = setInterval(() => { const now = Date.now(); if (document.visibilityState === "visible") send("time", Math.min(30, Math.floor((now-last)/1000))); last = now; }, 30000);
    return () => { clearInterval(timer); const seconds = Math.min(30, Math.floor((Date.now()-last)/1000)); if (seconds > 0 && document.visibilityState === "visible") send("time", seconds); };
  }, [cur?.id, cur?.version, modality]);
  const readyToContinue = blocks.every((b) => !b.required || state[b.id] === "understood" || pendingResponses.has(b.id) || progress[b.id]?.response?.status === "pending");
  const requiredLeft = useMemo(() => blocks.filter((b) => b.required && state[b.id] !== "understood").length, [blocks, state]);

  const go = (i: number) => {
    setActive(i);
    setAudioPlaying(false);
    setMode(0);
    setPicked(null);
    setAttemptContent(null);
    setState((s) => (s[blocks[i].id] === "not_started" ? { ...s, [blocks[i].id]: "in_progress" } : s));
  };

  const mark = (st: BlockState) => setState((s) => ({ ...s, [cur.id]: st }));
  // Mark the active block understood and record coverage once (on the first
  // transition), which feeds the Foundation Completeness gate.
  const record = async (passed: boolean, answer?: number | null) => {
    setSaving(true);
    setSaveError(null);
    try {
      const serverResult = await onBlockUnderstood?.(cur.id, passed, answer, progress[cur.id]?.selectedExample?.key);
      const confirmed = typeof serverResult === "boolean" ? serverResult : passed;
      mark(confirmed ? "understood" : "needs_review");
      return true;
    } catch {
      setSaveError("Your progress could not be saved. Please try again.");
      return false;
    } finally { setSaving(false); }
  };

  const nextEligible = () => {
    const current = Object.fromEntries(blocks.map((b) => [b.id, {
      ...progress[b.id], id: b.id, version: b.version || 1, state: state[b.id],
      covered: b.id === cur.id || state[b.id] === "understood", gaps: prerequisiteGaps[b.id] || [],
      ...(pendingResponses.has(b.id) ? { response: { id: "pending", status: "pending" as const, text: "", feedback: null } } : {}),
    }]));
    return adaptiveBlockSequence(blocks, current)[0]?.index ?? -1;
  };
  const understood = async () => {
    if (state[cur.id] !== "understood" && !await record(true)) return;
    const next = nextEligible();
    if (next >= 0) go(next);
  };

  const answer = async (index: number) => {
    setAttemptContent(content);
    setPicked(index);
    if (!await record(index === qc.correctIndex, index)) setPicked(null);
  };

  const dot = (st: BlockState | undefined) =>
    st === "understood" ? c.green : st === "in_progress" ? c.blue : st === "needs_review" ? c.amber : "transparent";

  if (!cur) return null;
  const gaps = prerequisiteGaps[cur.id] || [];
  if (gaps.length) return <div>
    <h2>Build the prerequisites for {cur.title}</h2>
    <p>This example needs some earlier knowledge. Strengthen it before continuing.</p>
    {gaps.map((gap) => <PrerequisiteRepair key={`${cur.id}:${gap.kind}:${gap.key}`} gap={gap} onRepair={onRepair ? (answer) => onRepair(cur.id, cur.version || 1, gap, answer) : undefined} />)}
    {blocks.map((b, i) => <button key={b.id} type="button" onClick={() => go(i)}>{b.title}</button>)}
  </div>;

  return (
    <div>
      {/* Progress through the concept (PRD 32), not "stage 2 of 8" */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Your {DEPTH_LABEL[depth]} · {blocks.filter((b) => b.required).length - requiredLeft}/{blocks.filter((b) => b.required).length} understood</div>
      {(state[cur.id] === "needs_review" || progress[cur.id]?.response?.status === "needs_revision") && <p role="status">Review focus: revisit this block using your recent feedback and support options.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {blocks.map((b, i) => {
          const st = state[b.id];
          const on = i === active;
          return (
            <button key={b.id} type="button" disabled={saving} onClick={() => go(i)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: on ? c.greenTint : c.surface, border: `1px solid ${on ? c.green : c.border2}`, borderRadius: 18, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(st), border: st === "not_started" ? `1.5px solid ${c.border2}` : "none", flex: "none" }} />
              <span style={{ fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? c.greenDark : c.soft }}>{b.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active block */}
      <div style={{ fontSize: 11.5, fontWeight: 600, color: c.green, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 6 }}>{BLOCK_TYPE_LABEL[cur.block_type as BlockType] || cur.block_type}</div>
      <h2 style={{ fontSize: 21, marginBottom: cur.objective ? 4 : 14 }}>{cur.title}</h2>
      {cur.objective && <div style={{ fontSize: 13, color: c.faint, marginBottom: 16 }}>{cur.objective}</div>}

      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 24, marginBottom: 14, fontSize: 15.5, lineHeight: 1.7, color: c.body }}>
        <MathText text={(mode === 0 ? content.body : modes[mode - 1]?.text) || content.body || ""} />
        {mode === 0 && <><KnowledgeBlockVisual visual={content.visual} onInteract={() => { void onActivity?.(cur.id, cur.version || 1, "modality", "Interactive").catch(() => setTrackingError(true)); }} />
          {content.visual && content.visualCaption && <MathText text={content.visualCaption} />}
          {content.visual && content.interactionPrompt && <MathText text={content.interactionPrompt} />}</>}
      </div>

      <BlockAudio key={`${cur.id}:${mode}`} text={(mode === 0 ? content.narration || content.body : modes[mode - 1]?.text) || content.body || ""} onPlaying={(playing) => {
        setAudioPlaying(playing);
        if (playing) void onActivity?.(cur.id, cur.version || 1, "modality", "Audio").catch(() => setTrackingError(true));
      }} />
      {trackingError && <p role="status">Progress tracking is temporarily unavailable. Check your connection; answer saves will still be confirmed separately.</p>}
      {progress[cur.id]?.recommendedModality && progress[cur.id].recommendedModality !== "Main" && <p>Suggested support from your recent check outcomes: {progress[cur.id].recommendedModality}.</p>}
      {/* Explain this block another way */}
      {modes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
          <span style={{ fontSize: 12.5, color: c.faint, alignSelf: "center", marginRight: 2 }}>Explain another way:</span>
          <button type="button" onClick={() => { setMode(0); void onActivity?.(cur.id, cur.version || 1, "modality", "Main").catch(() => setTrackingError(true)); }} style={chip(mode === 0)}>Main</button>
          {modes.map((m, i) => (
            <button key={i} type="button" onClick={() => { setMode(i + 1); void onActivity?.(cur.id, cur.version || 1, "modality", m.label).catch(() => setTrackingError(true)); }} style={chip(mode === i + 1)}>{m.label}</button>
          ))}
        </div>
      )}

      {content.misconception && (
        <div style={{ background: c.amberTint, border: `1px solid ${c.amber}`, borderRadius: 13, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.amber, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 6 }}>Watch out</div>
          <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}><MathText text={content.misconception} /></div>
        </div>
      )}

      {content.task && <ReviewedBlockTask key={cur.id} task={content.task} response={progress[cur.id]?.response} onSubmit={async (text) => {
        await onSubmitResponse?.(cur.id, cur.version || 1, text);
        setPendingResponses((previous) => new Set([...previous, cur.id]));
      }} onContinue={() => { const next = nextEligible(); if (next >= 0) go(next); else if (readyToContinue) onNext(); }} />}
      {/* Quick check (PRD 16): confirm the block, don't restart the concept */}
      {qc && (
        <div style={{ background: c.paper, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "18px 20px", marginBottom: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: c.ink, marginBottom: 12 }}><MathText text={qc.prompt} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {qc.options.map((opt, j) => {
              const chosen = picked === j;
              const reveal = picked !== null;
              const correct = j === qc.correctIndex;
              const bg = reveal && correct ? c.greenTint : reveal && chosen ? c.amberTint : c.surface;
              const bd = reveal && correct ? c.green : reveal && chosen ? c.amber : chosen ? c.green : c.border2;
              return (
                <button key={j} type="button" disabled={picked !== null || saving} onClick={() => { void answer(j); }}
                  style={{ textAlign: "left", background: bg, border: `1px solid ${bd}`, borderRadius: 11, padding: "11px 14px", fontSize: 14.5, color: c.ink, cursor: picked === null ? "pointer" : "default", fontFamily: "inherit" }}>
                  <MathText text={`${["A", "B", "C", "D", "E", "F"][j]}. ${opt}`} />
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.6, marginTop: 12 }}>
              {picked === qc.correctIndex ? "Correct. " : "Not quite. "}<MathText text={qc.explanation} />
            </div>
          )}
        </div>
      )}

      {saveError && <div role="alert" style={{ color: c.amber, marginBottom: 12 }}>{saveError}</div>}
      {saving && <div role="status">Saving your progress…</div>}
      {/* Advance */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {readyToContinue
          ? <button type="button" disabled={saving} onClick={onNext} style={primary()}>{depth === "foundation" ? `Finish understanding ${conceptName}` : `Finish ${DEPTH_LABEL[depth]} learning for ${conceptName}`}</button>
          : content.task ? null : state[cur.id] === "understood" || (!qc)
            ? <button type="button" disabled={saving} onClick={() => { void understood(); }} style={primary()}>{qc ? "Next block" : "Got it, next block"}</button>
            : picked !== null
              ? <button type="button" disabled={saving} onClick={() => { setPicked(null); setAttemptContent(null); }} style={primary()}>Try the check again</button>
              : <span style={{ color: c.soft }}>Answer the quick check to continue.</span>}
        {requiredLeft > 0 && state[cur.id] === "understood" && (
          <span style={{ fontSize: 13, color: c.faint, alignSelf: "center" }}>{requiredLeft} block{requiredLeft === 1 ? "" : "s"} left</span>
        )}
      </div>
    </div>
  );
}

const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 12.5, fontWeight: on ? 600 : 500, padding: "6px 12px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit",
  background: on ? c.greenTint : c.surface, border: `1px solid ${on ? c.green : c.border2}`, color: on ? c.greenDark : c.soft,
});
const primary = (): React.CSSProperties => ({ background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: "12px 22px", borderRadius: 12, cursor: "pointer" });
