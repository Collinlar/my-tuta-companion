import { c, font } from "../theme";
import { useLayout, pageBox } from "../layout";
import { useConceptDepthMastery } from "../data/queries";
import { DEPTHS, DEPTH_ORDER, DEPTH_LABEL, DEPTH_TAGLINE, type Depth, type DepthState } from "../data/depth";

interface Props {
  conceptId: string;
  conceptName: string;
  subject: string;
  maxDepth: string;
  retentionEnabled: boolean;
  foundationPath?: { pct: number; currentStage: number; level: string } | null;
  loading?: boolean;
  onEnterDepth: (depth: Depth) => void;
  onReview?: (depth: Depth) => void;
  onBack: () => void;
}

const SECURE_LEVELS = ["Secure", "Secured", "Mastered"];

// [foreground, background] per depth state, reusing the mytuta palette.
const STATE_STYLE: Record<DepthState, { fg: string; bg: string; label: string }> = {
  not_started: { fg: c.muted, bg: c.track, label: "Not started" },
  in_progress: { fg: c.blue, bg: c.blueTint, label: "In progress" },
  secure: { fg: c.green, bg: c.greenTint, label: "Secure" },
  needs_reinforcement: { fg: c.amber, bg: c.amberTint, label: "Needs work" },
};

export default function ConceptOverview({
  conceptId, conceptName, subject, maxDepth, retentionEnabled, foundationPath, loading, onEnterDepth, onReview, onBack,
}: Props) {
  const L = useLayout();
  const { data: ladder } = useConceptDepthMastery(conceptId);

  const stateFor = (d: Depth): DepthState => {
    const s = ladder?.[d]?.state as DepthState | undefined;
    if (s) return s;
    if (d === "foundation" && foundationPath) {
      if (SECURE_LEVELS.includes(foundationPath.level)) return "secure";
      if (foundationPath.pct > 0) return "in_progress";
    }
    return "not_started";
  };

  const cap = DEPTH_ORDER[(["foundation", "applied", "advanced"].includes(maxDepth) ? maxDepth : "foundation") as Depth];
  const overall = [...DEPTHS].reverse().find((d) => stateFor(d) === "secure");
  // Earliest-due retention review across the secured depths.
  const reviewable = DEPTHS
    .map((d) => ({ d, nr: ladder?.[d]?.nextReviewAt || null }))
    .filter((e) => e.nr && stateFor(e.d) === "secure") as { d: Depth; nr: string }[];
  reviewable.sort((a, b) => a.nr.localeCompare(b.nr));
  const earliest = reviewable[0];
  const nextReview = earliest?.nr || null;
  const dueDepth: Depth | null = earliest && new Date(earliest.nr).getTime() <= Date.now() ? earliest.d : null;

  return (
    <div style={pageBox(L.padTall, 680)}>
      <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Learn</button>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Mastery Depth</div>
      <h1 style={{ fontSize: L.mobile ? 24 : 28, marginBottom: 4 }}>{conceptName}</h1>
      <div style={{ fontSize: 14, color: c.muted, marginBottom: 18 }}>{subject || "STEM"}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink, background: c.surface, border: `1px solid ${c.border2}`, padding: "7px 13px", borderRadius: 20 }}>
          Overall depth: {overall ? DEPTH_LABEL[overall] : "Getting started"}
        </span>
        {retentionEnabled && dueDepth && onReview && (
          <button type="button" onClick={() => onReview(dueDepth)} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: c.amber, border: "none", fontFamily: "inherit", padding: "8px 14px", borderRadius: 20, cursor: "pointer" }}>
            Retention review due · start check
          </button>
        )}
        {retentionEnabled && !dueDepth && nextReview && (
          <span style={{ fontSize: 13, fontWeight: 600, color: c.greenDark, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, padding: "7px 13px", borderRadius: 20 }}>
            Retention on track · next {new Date(nextReview).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 14, color: c.muted }}>Loading this concept…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEPTHS.map((d, i) => {
            const available = DEPTH_ORDER[d] <= cap;
            const prevSecure = i === 0 || stateFor(DEPTHS[i - 1]) === "secure";
            const st = stateFor(d);
            const style = STATE_STYLE[st];

            // CTA resolution
            let cta = "";
            let actionable = false;
            let note = "";
            if (!available) {
              note = "Opens for this concept as its content grows.";
            } else if (!prevSecure) {
              note = `Secure ${DEPTH_LABEL[DEPTHS[i - 1]]} first.`;
            } else if (st === "secure") {
              cta = "Review";
              actionable = true;
            } else if (st === "in_progress") {
              cta = "Continue";
              actionable = true;
            } else if (st === "needs_reinforcement") {
              cta = "Strengthen";
              actionable = true;
            } else {
              cta = `Start ${DEPTH_LABEL[d]}`;
              actionable = true;
            }

            const dim = !available || !prevSecure;

            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "16px 18px", opacity: dim ? 0.68 : 1 }}>
                <span style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: style.bg, color: style.fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: c.ink }}>{DEPTH_LABEL[d]}</span>
                    <span style={{ fontSize: 13, color: c.muted }}>{DEPTH_TAGLINE[d]}</span>
                  </div>
                  <div style={{ fontSize: 12.5, marginTop: 3, color: available && prevSecure ? style.fg : c.faint }}>
                    {available && prevSecure ? style.label : note}
                  </div>
                </div>
                {actionable ? (
                  <button type="button" onClick={() => onEnterDepth(d)} style={{ flex: "none", minHeight: 40, background: st === "secure" ? c.surface : c.green, color: st === "secure" ? c.greenDark : "#fff", border: st === "secure" ? `1px solid ${c.greenTintBorder}` : "none", fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 11, cursor: "pointer", whiteSpace: "nowrap" }}>{cta}</button>
                ) : (
                  <span style={{ flex: "none", fontSize: 12, color: c.faint }}>{!available ? "Coming soon" : "Locked"}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: c.faint, marginTop: 20, lineHeight: 1.5 }}>
        Each level runs the full learning loop. Secure one to unlock the next. Applied and Advanced open as this concept's depth content is added.
      </p>
    </div>
  );
}
