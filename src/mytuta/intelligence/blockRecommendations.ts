import type { NextBestAction, NbaCandidate } from "./data";
export function withBlockReinforcement(base: NextBestAction, repair: NbaCandidate | null): NextBestAction {
  if (!repair) return base;
  const urgent = base.primary && ["assignment", "continue", "prerequisite_gap"].includes(base.primary.key);
  const candidates = [base.primary, ...base.alternatives].filter((item): item is NbaCandidate => !!item && item.route !== repair.route);
  return urgent
    ? { primary: base.primary, alternatives: [repair, ...base.alternatives.filter((item) => item.route !== repair.route)].slice(0, 3) }
    : { primary: repair, alternatives: candidates.slice(0, 3) };
}
