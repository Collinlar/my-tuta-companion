import { describe, expect, it } from "vitest";
import { withBlockReinforcement } from "../mytuta/intelligence/blockRecommendations";
const repair = { key: "block_reinforcement", action: "Review units", reason: "A recent check needs review", route: "/student/learn?concept=density&depth=foundation&block=units" };
describe("block-level recommendations", () => {
  it("preserves urgent assignments and active journeys", () => {
    for (const key of ["assignment", "continue", "prerequisite_gap"]) {
      const primary = { key, action: "Required work", reason: "Required", route: "/required" };
      const result = withBlockReinforcement({ primary, alternatives: [] }, repair);
      expect(result.primary).toBe(primary);
      expect(result.alternatives[0]).toBe(repair);
    }
  });
  it("offers specific reinforcement before optional exploration", () => {
    const explore = { key: "explore", action: "Explore", reason: "Optional", route: "/explore" };
    expect(withBlockReinforcement({ primary: explore, alternatives: [] }, repair)).toEqual({ primary: repair, alternatives: [explore] });
  });
  it("preserves the original recommendation when no block needs review", () => {
    const base = { primary: null, alternatives: [] };
    expect(withBlockReinforcement(base, null)).toBe(base);
  });
});
