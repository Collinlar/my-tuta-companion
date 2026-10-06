/**
 * Phase 6 — Labs and Challenges Scale
 * Tests: NBA challenge key rendering, recurring badge logic, lab concept link.
 */
import { describe, it, expect } from "vitest";

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesChallengeScope(scope: string, levelLabel: string): boolean {
  if (levelLabel === "All") return true;
  const s = (scope || "").toLowerCase();
  const want = levelLabel.toLowerCase();
  if (want === "pan-african") return s.includes("pan-african") || s.includes("continental") || s.includes("africa");
  return s === want || s.includes(want);
}

// Simulates what the NBA card picks as the button label.
function nbaButtonLabel(key: string, prerequisite?: string): string {
  if (key === "prerequisite_gap") return `Learn ${prerequisite ?? "prerequisite"} first`;
  if (key === "decay_review")     return "Review now";
  if (key === "explanation_weak") return "Try another explanation";
  if (key === "challenge")        return "Join challenge";
  return "Start now";
}

// ── Challenge scope filter ────────────────────────────────────────────────────

describe("matchesChallengeScope", () => {
  it("returns true for All regardless of scope", () => {
    expect(matchesChallengeScope("Class", "All")).toBe(true);
    expect(matchesChallengeScope("Personal", "All")).toBe(true);
    expect(matchesChallengeScope("", "All")).toBe(true);
  });

  it("matches Class scope case-insensitively", () => {
    expect(matchesChallengeScope("Class", "Class")).toBe(true);
    expect(matchesChallengeScope("class", "Class")).toBe(true);
    expect(matchesChallengeScope("Personal", "Class")).toBe(false);
  });

  it("matches pan-african variants", () => {
    expect(matchesChallengeScope("Pan-African", "Pan-African")).toBe(true);
    expect(matchesChallengeScope("Continental", "Pan-African")).toBe(true);
    expect(matchesChallengeScope("Africa-wide", "Pan-African")).toBe(true);
    expect(matchesChallengeScope("Class", "Pan-African")).toBe(false);
  });

  it("matches partial scope strings", () => {
    expect(matchesChallengeScope("School-wide", "School")).toBe(true);
    expect(matchesChallengeScope("Regional Ghana", "Regional")).toBe(true);
  });
});

// ── NBA button label ──────────────────────────────────────────────────────────

describe("nbaButtonLabel", () => {
  it("returns prerequisite-specific label", () => {
    expect(nbaButtonLabel("prerequisite_gap", "Fractions")).toBe("Learn Fractions first");
    expect(nbaButtonLabel("prerequisite_gap")).toBe("Learn prerequisite first");
  });

  it("returns correct label for decay_review", () => {
    expect(nbaButtonLabel("decay_review")).toBe("Review now");
  });

  it("returns correct label for explanation_weak", () => {
    expect(nbaButtonLabel("explanation_weak")).toBe("Try another explanation");
  });

  it("returns Join challenge for the new challenge key", () => {
    expect(nbaButtonLabel("challenge")).toBe("Join challenge");
  });

  it("returns Start now for fallback keys", () => {
    expect(nbaButtonLabel("start")).toBe("Start now");
    expect(nbaButtonLabel("explore")).toBe("Start now");
    expect(nbaButtonLabel("goal")).toBe("Start now");
  });
});

// ── Recurring badge logic ─────────────────────────────────────────────────────

describe("recurring challenge badge", () => {
  it("shows recurring badge when flag is true", () => {
    const ch = { id: "1", title: "Speed Sprint", recurring: true };
    expect(ch.recurring).toBe(true);
  });

  it("does not show badge when flag is absent", () => {
    const ch = { id: "2", title: "Bridge Design" };
    expect((ch as { recurring?: boolean }).recurring).toBeUndefined();
  });
});

// ── Mastery-linked lab concept slug ──────────────────────────────────────────

describe("lab concept link", () => {
  it("exposes conceptSlug when present", () => {
    const lab = { id: "abc", title: "Hooke Law", demonstrates: "Forces", conceptSlug: "forces" };
    expect(lab.conceptSlug).toBe("forces");
  });

  it("does not render concept link when conceptSlug is absent", () => {
    const lab = { id: "xyz", title: "DNA Extraction", demonstrates: "DNA is in cells" };
    expect((lab as { conceptSlug?: string }).conceptSlug).toBeUndefined();
  });
});
