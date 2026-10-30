/**
 * Mastery Depth model (Phase 1).
 *
 * Depth is a dimension of a concept's mastery: Foundation -> Applied -> Advanced.
 * Retention is a separate ongoing layer, not a fourth depth. This module holds the
 * pure, deterministic logic (ordering, labels, next-depth, readiness) that the
 * Concept Overview, the depth-aware path and the completion screen all read.
 * No DB access here, so it is trivially testable and reusable.
 */

export type Depth = "foundation" | "applied" | "advanced";

export const DEPTHS: Depth[] = ["foundation", "applied", "advanced"];
export const DEPTH_ORDER: Record<Depth, number> = { foundation: 0, applied: 1, advanced: 2 };

/** Headline state of one depth for one learner (mirrors concept_depth_mastery.state). */
export type DepthState = "not_started" | "in_progress" | "secure" | "needs_reinforcement";

/** Readiness for the NEXT depth (mirrors concept_depth_mastery.readiness_state). */
export type ReadinessState = "not_ready" | "building" | "ready" | "strongly_ready";

/** The progression-timing outcome shown on the depth completion screen (PRD section 14). */
export type ProgressionOutcome =
  | "progress_now"       // A: strong evidence, go deeper in this session
  | "progress_later"     // B: ready, but spacing is better; come back tomorrow
  | "reinforce_first"    // C: passed, but weak areas to strengthen before the next depth
  | "max_depth_reached"; // no deeper level exists for this concept
// Note: PRD outcome D (prerequisite repair) is handled globally by the
// Next-Best-Action engine's prerequisite_gap, not on the completion screen.

export const DEPTH_LABEL: Record<Depth, string> = {
  foundation: "Foundation",
  applied: "Applied",
  advanced: "Advanced",
};

/** Learner-facing one-liners (PRD section 6). */
export const DEPTH_TAGLINE: Record<Depth, string> = {
  foundation: "Understand it.",
  applied: "Use it.",
  advanced: "Handle complexity.",
};

/** Default scaffolding per depth: support fades as depth rises (PRD section 17). */
export const DEPTH_DEFAULT_SUPPORT: Record<Depth, "full" | "guided" | "light" | "independent"> = {
  foundation: "guided",
  applied: "light",
  advanced: "independent",
};

function asDepth(value: string | null | undefined): Depth {
  return value === "applied" || value === "advanced" ? value : "foundation";
}

/** The depths a concept offers, capped by its max_depth. */
export function depthsUpTo(maxDepth: string | null | undefined): Depth[] {
  const cap = DEPTH_ORDER[asDepth(maxDepth)];
  return DEPTHS.filter((d) => DEPTH_ORDER[d] <= cap);
}

/** The next deeper depth, or null if the current one is already the concept's max. */
export function nextDepth(current: Depth, maxDepth: string | null | undefined): Depth | null {
  const cap = DEPTH_ORDER[asDepth(maxDepth)];
  const n = DEPTHS[DEPTH_ORDER[current] + 1];
  return n && DEPTH_ORDER[n] <= cap ? n : null;
}

/** Map a mastery-check result (overall 0-5, string level) to this depth's state. */
export function depthStateFromResult(overall: number, level: string): DepthState {
  if (level === "Mastered" || level === "Secure" || level === "Secured" || overall >= 4) return "secure";
  if (overall >= 3) return "in_progress";
  return "needs_reinforcement";
}

export interface DepthResult {
  knowledge: number;   // 0-5
  application: number; // 0-5
  analysis: number;    // 0-5
  overall: number;     // 0-5
  level: string;
}

export interface DepthReadiness {
  targetDepth: Depth | null;
  readiness: ReadinessState;
  outcome: ProgressionOutcome;
  reason: string;
  blockers: string[];
  recommendedDelayHours: number;
  estMinutes: number;
}

// Which dimension matters most as a learner goes deeper: Applied leans on
// application, Advanced on reasoning/transfer (PRD sections 10.3, 11.3).
const KEY_DIMENSION: Record<Depth, { label: string; pick: (r: DepthResult) => number }> = {
  applied: { label: "using it in real situations", pick: (r) => r.application },
  advanced: { label: "reasoning and transfer", pick: (r) => r.analysis },
  foundation: { label: "the core idea", pick: (r) => r.knowledge },
};

/** Evidence a learner has accrued at the TARGET depth (Lab for Applied,
 * Challenge for Advanced), used as a positive readiness signal. */
export interface DepthEvidenceSignal {
  count: number;
  hasLab: boolean;
  hasChallenge: boolean;
}

const READINESS_RANK: ReadinessState[] = ["not_ready", "building", "ready", "strongly_ready"];
function bumpReadiness(r: ReadinessState): ReadinessState {
  return READINESS_RANK[Math.min(READINESS_RANK.indexOf(r) + 1, READINESS_RANK.length - 1)];
}

/**
 * Rules-first readiness for the next depth, given the depth the learner just
 * finished and that depth's result. Deterministic, no AI. `targetEvidence` lets
 * Lab/Challenge work at the target depth raise readiness (PRD 13.2).
 */
export function computeDepthReadiness(
  justFinished: Depth,
  result: DepthResult,
  maxDepth: string | null | undefined,
  estMinutes = 20,
  targetEvidence?: DepthEvidenceSignal,
): DepthReadiness {
  const target = nextDepth(justFinished, maxDepth);
  if (!target) {
    return {
      targetDepth: null,
      readiness: "strongly_ready",
      outcome: "max_depth_reached",
      reason: `You have reached the deepest level for this concept. mytuta will keep it sharp with short retention checks.`,
      blockers: [],
      recommendedDelayHours: 0,
      estMinutes: 0,
    };
  }

  const keyDim = KEY_DIMENSION[target];
  const keyScore = keyDim.pick(result);
  const blockers = keyScore < 3 ? [keyDim.label] : [];

  let out: DepthReadiness;
  if (result.overall >= 4.5 && keyScore >= 4) {
    // Strong across the board: go deeper now.
    out = { targetDepth: target, readiness: "strongly_ready", outcome: "progress_now",
      reason: "You are ready to go deeper.", blockers: [], recommendedDelayHours: 0, estMinutes };
  } else if (blockers.length > 0 && result.overall >= 3) {
    // Secure but a key area is weak: strengthen before progressing.
    out = { targetDepth: target, readiness: "building", outcome: "reinforce_first",
      reason: `${DEPTH_LABEL[justFinished]} achieved, but ${keyDim.label} is worth strengthening before ${DEPTH_LABEL[target]}.`,
      blockers, recommendedDelayHours: 0, estMinutes: 8 };
  } else if (result.overall >= 3.5) {
    // Solid result: ready, but spacing is pedagogically better.
    out = { targetDepth: target, readiness: "ready", outcome: "progress_later",
      reason: `${DEPTH_LABEL[justFinished]} achieved. ${DEPTH_LABEL[target]} Mastery is recommended tomorrow.`,
      blockers: [], recommendedDelayHours: 24, estMinutes };
  } else {
    // Passed, but thin: reinforce this depth first.
    out = { targetDepth: target, readiness: "not_ready", outcome: "reinforce_first",
      reason: `${DEPTH_LABEL[justFinished]} is not quite secure yet. A short reinforcement will set up ${DEPTH_LABEL[target]}.`,
      blockers: blockers.length ? blockers : ["a secure foundation"], recommendedDelayHours: 0, estMinutes: 8 };
  }

  // Evidence at the target depth (a Lab for Applied, a Challenge for Advanced)
  // means the learner is already working at that level: raise readiness. It does
  // not override a genuine weakness (reinforce_first keeps its blockers).
  if (targetEvidence && targetEvidence.count > 0) {
    const src = targetEvidence.hasChallenge ? "a challenge" : targetEvidence.hasLab ? "a lab" : "related work";
    if (out.outcome === "progress_later") {
      out = { ...out, outcome: "progress_now", readiness: "strongly_ready", recommendedDelayHours: 0,
        reason: `${DEPTH_LABEL[justFinished]} achieved, and you have already practised ${DEPTH_LABEL[target]} through ${src}. You are ready to go deeper now.` };
    } else if (out.outcome === "progress_now") {
      out = { ...out, readiness: "strongly_ready",
        reason: `You are ready to go deeper, and ${src} already shows you working at the ${DEPTH_LABEL[target]} level.` };
    } else {
      // reinforce_first: keep the guidance but acknowledge the head start.
      out = { ...out, readiness: bumpReadiness(out.readiness),
        reason: `${out.reason} You have started ${DEPTH_LABEL[target]} through ${src}, so this will be quick.` };
    }
  }

  return out;
}

// ---------- Adaptive retention scheduling ----------

/** A learner's self-reported difficulty right after a retention check, plus the
 * implicit "again" grade a wrong answer carries. Mirrors the SM-2 grade bands. */
export type RetentionGrade = "again" | "hard" | "good" | "easy";

export const EASE_START = 2.5;
export const EASE_MIN = 1.3;
export const EASE_MAX = 2.8;

const EASE_DELTA: Record<RetentionGrade, number> = { again: -0.3, hard: -0.15, good: 0, easy: 0.15 };

export interface RetentionStep {
  intervalDays: number;
  easeFactor: number;
  result: "on_track" | "weakening";
}

/** Adaptive spaced-retention scheduler (SM-2 inspired). The ease factor carries
 * the learner's durability for this (concept, depth) across reviews: consistent
 * recall lets the gap grow faster, shaky recall slows it, so two learners on the
 * same concept diverge to the cadence each actually needs instead of a shared
 * fixed ladder. A failed review ("again") never removes mastery (PRD 12.3); it
 * brings the next check close and trims ease so later growth stays cautious. */
export function nextRetentionStep(priorIntervalDays: number, priorEase: number, grade: RetentionGrade): RetentionStep {
  const prior = priorIntervalDays > 0 ? priorIntervalDays : 3;
  const ease = Math.min(EASE_MAX, Math.max(EASE_MIN, (priorEase > 0 ? priorEase : EASE_START) + EASE_DELTA[grade]));

  if (grade === "again") {
    // Review again soon, but keep the mastery. Ease already took its penalty.
    return { intervalDays: 2, easeFactor: ease, result: "weakening" };
  }

  let interval: number;
  if (grade === "hard") {
    // Recalled, but with effort: grow gently regardless of ease.
    interval = Math.max(3, Math.round(prior * 1.2));
  } else {
    interval = Math.round(prior * ease);
    if (grade === "easy") interval = Math.round(interval * 1.15);
    interval = Math.max(prior + 1, interval); // a clean pass always pushes the gap out
  }
  return { intervalDays: Math.min(interval, 365), easeFactor: ease, result: "on_track" };
}
