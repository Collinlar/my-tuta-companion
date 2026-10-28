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

/**
 * Rules-first readiness for the next depth, given the depth the learner just
 * finished and that depth's result. Deterministic, no AI, no DB.
 */
export function computeDepthReadiness(
  justFinished: Depth,
  result: DepthResult,
  maxDepth: string | null | undefined,
  estMinutes = 20,
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

  // Strong across the board: go deeper now.
  if (result.overall >= 4.5 && keyScore >= 4) {
    return {
      targetDepth: target,
      readiness: "strongly_ready",
      outcome: "progress_now",
      reason: "You are ready to go deeper.",
      blockers: [],
      recommendedDelayHours: 0,
      estMinutes,
    };
  }

  // Secure but a key area is weak: strengthen before progressing.
  if (blockers.length > 0 && result.overall >= 3) {
    return {
      targetDepth: target,
      readiness: "building",
      outcome: "reinforce_first",
      reason: `${DEPTH_LABEL[justFinished]} achieved, but ${keyDim.label} is worth strengthening before ${DEPTH_LABEL[target]}.`,
      blockers,
      recommendedDelayHours: 0,
      estMinutes: 8,
    };
  }

  // Solid result: ready, but spacing is pedagogically better.
  if (result.overall >= 3.5) {
    return {
      targetDepth: target,
      readiness: "ready",
      outcome: "progress_later",
      reason: `${DEPTH_LABEL[justFinished]} achieved. ${DEPTH_LABEL[target]} Mastery is recommended tomorrow.`,
      blockers: [],
      recommendedDelayHours: 24,
      estMinutes,
    };
  }

  // Passed, but thin: reinforce this depth first.
  return {
    targetDepth: target,
    readiness: "not_ready",
    outcome: "reinforce_first",
    reason: `${DEPTH_LABEL[justFinished]} is not quite secure yet. A short reinforcement will set up ${DEPTH_LABEL[target]}.`,
    blockers: blockers.length ? blockers : ["a secure foundation"],
    recommendedDelayHours: 0,
    estMinutes: 8,
  };
}
