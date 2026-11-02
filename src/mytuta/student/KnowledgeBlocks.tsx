import { useMemo, useState } from "react";
import { c } from "../theme";
import { MathText } from "../MathText";
import { BLOCK_TYPE_LABEL, type KnowledgeBlock, type BlockType, type BlockState } from "../data/blocks";

/** The Foundation block-runner (Concept Competency Framework, Phase 1). Replaces
 * the single "Understand" stage (one explanation shown five ways) with a
 * deliberate walk through the concept's required Knowledge Blocks. The five
 * support modalities now live INSIDE each block as "explain this block another
 * way". Block state is local to the session in Phase 1; Phase 2 persists it and
 * feeds coverage to the completeness engine. */
export default function KnowledgeBlocks({ conceptName, blocks, covered, onBlockUnderstood, onNext }: { conceptName: string; blocks: KnowledgeBlock[]; covered?: Set<string>; onBlockUnderstood?: (blockId: string, passed: boolean) => void; onNext: () => void }) {
  // Seed from prior coverage so understanding persists across sessions (PRD 32),
  // and open on the first block not yet understood.
  const [state, setState] = useState<Record<string, BlockState>>(() => Object.fromEntries(blocks.map((b) => [b.id, covered?.has(b.id) ? "understood" : "not_started"])));
  const [active, setActive] = useState(() => { const i = blocks.findIndex((b) => !covered?.has(b.id)); return i < 0 ? 0 : i; });
  const [mode, setMode] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const cur = blocks[Math.min(active, blocks.length - 1)];
  const content = cur?.content || {};
  const modes = content.modes || [];
  const qc = content.quickCheck;
  const requiredLeft = useMemo(() => blocks.filter((b) => b.required && state[b.id] !== "understood").length, [blocks, state]);

  const go = (i: number) => {
    setActive(i);
    setMode(0);
    setPicked(null);
    setState((s) => (s[blocks[i].id] === "not_started" ? { ...s, [blocks[i].id]: "in_progress" } : s));
  };

  const mark = (st: BlockState) => setState((s) => ({ ...s, [cur.id]: st }));
  // Mark the active block understood and record coverage once (on the first
  // transition), which feeds the Foundation Completeness gate.
  const markUnderstood = (passed: boolean) => {
    if (state[cur.id] !== "understood") onBlockUnderstood?.(cur.id, passed);
    setState((s) => ({ ...s, [cur.id]: "understood" }));
  };

  const understood = () => {
    markUnderstood(true);
    const nextNotDone = blocks.findIndex((b, i) => i > active && state[b.id] !== "understood");
    if (nextNotDone >= 0) go(nextNotDone);
    else {
      const anyLeft = blocks.findIndex((b) => b.required && b.id !== cur.id && state[b.id] !== "understood");
      if (anyLeft >= 0) go(anyLeft);
    }
  };

  const dot = (st: BlockState | undefined) =>
    st === "understood" ? c.green : st === "in_progress" ? c.blue : st === "needs_review" ? c.amber : "transparent";

  if (!cur) return null;

  return (
    <div>
      {/* Progress through the concept (PRD 32), not "stage 2 of 8" */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Your Foundation · {blocks.length - requiredLeft}/{blocks.filter((b) => b.required).length} understood</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {blocks.map((b, i) => {
          const st = state[b.id];
          const on = i === active;
          return (
            <button key={b.id} type="button" onClick={() => go(i)}
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
      </div>

      {/* Explain this block another way */}
      {modes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
          <span style={{ fontSize: 12.5, color: c.faint, alignSelf: "center", marginRight: 2 }}>Explain another way:</span>
          <button type="button" onClick={() => setMode(0)} style={chip(mode === 0)}>Main</button>
          {modes.map((m, i) => (
            <button key={i} type="button" onClick={() => setMode(i + 1)} style={chip(mode === i + 1)}>{m.label}</button>
          ))}
        </div>
      )}

      {content.misconception && (
        <div style={{ background: c.amberTint, border: `1px solid ${c.amber}`, borderRadius: 13, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.amber, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 6 }}>Watch out</div>
          <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}><MathText text={content.misconception} /></div>
        </div>
      )}

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
                <button key={j} type="button" disabled={picked !== null} onClick={() => { setPicked(j); if (j === qc.correctIndex) markUnderstood(true); else mark("needs_review"); }}
                  style={{ textAlign: "left", background: bg, border: `1px solid ${bd}`, borderRadius: 11, padding: "11px 14px", fontSize: 14.5, color: c.ink, cursor: picked === null ? "pointer" : "default", fontFamily: "inherit" }}>
                  <MathText text={`${["A", "B", "C", "D"][j]}. ${opt}`} />
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

      {/* Advance */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {requiredLeft === 0
          ? <button type="button" onClick={onNext} style={primary()}>Finish understanding {conceptName}</button>
          : state[cur.id] === "understood" || (!qc)
            ? <button type="button" onClick={understood} style={primary()}>{qc ? "Next block" : "Got it, next block"}</button>
            : <button type="button" onClick={understood} style={{ ...primary(), background: c.surface, color: c.greenDark, border: `1px solid ${c.greenTintBorder}` }}>Mark understood and continue</button>}
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
