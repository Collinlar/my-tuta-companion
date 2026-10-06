import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase and Groq before importing pathBuilder
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
    from: vi.fn(),
  },
}));
vi.mock("@/services/groqApiService", () => ({
  groqApiService: { makeRequest: vi.fn().mockResolvedValue('{"content":"AI-generated content"}') },
}));
vi.mock("../mytuta/data/jsonRepair", () => ({
  sanitizeLlmJson: (s: string) => s,
}));

import { supabase } from "@/integrations/supabase/client";
import { buildMasteryPath } from "../mytuta/data/pathBuilder";

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

function makeSelectChain(returnValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["select","eq","in","order","ilike","maybeSingle","single","insert","upsert"];
  for (const m of methods) chain[m] = vi.fn(() => chain);
  chain.then = undefined;
  // make it thenable at the end
  Object.defineProperty(chain, Symbol.iterator, { value: undefined });
  // Return value for terminal calls
  (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  return chain;
}

describe("buildMasteryPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assembles stages from approved content units for a Tier A concept", async () => {
    const conceptRow = { id: "concept-linear", name: "Linear Equations", slug: "linear-equations", subject: "Mathematics", description: "Solve linear equations", learning_stage: "Lower secondary", difficulty: "core" };
    const approvedUnits = [
      { id: "u1", unit_type: "Quick Check", difficulty: "core", content: { question: "Solve 2x=4" }, hints: null, review_status: "approved", ai_generated: false },
      { id: "u2", unit_type: "Core Explanation", difficulty: "core", content: { text: "A linear equation..." }, hints: null, review_status: "approved", ai_generated: false },
      { id: "u3", unit_type: "Worked Example", difficulty: "core", content: { problem: "Solve 3x+1=10", steps: ["Step 1"] }, hints: null, review_status: "approved", ai_generated: false },
    ];

    mockFrom.mockImplementation((table: string) => {
      const chain = makeSelectChain(null);
      if (table === "concepts") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>)
          .mockResolvedValueOnce({ data: conceptRow, error: null }) // slug match
      }
      if (table === "content_units") {
        (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: approvedUnits, error: null });
      }
      if (table === "learner_profile") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { support_level: "guided" }, error: null });
      }
      if (table === "mastery_profiles") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    const result = await buildMasteryPath("linear-equations", "user-1");

    expect(result.concept.slug).toBe("linear-equations");
    expect(result.stages.length).toBeGreaterThan(0);
    // Stages with approved content should not be AI-generated
    const approvedStages = result.stages.filter((s) => !s.aiGenerated);
    expect(approvedStages.length).toBeGreaterThan(0);
  });

  it("marks content as aiGenerated and sets provisional flag for unknown concept", async () => {
    mockFrom.mockImplementation((table: string) => {
      const chain = makeSelectChain(null);
      if (table === "concepts") {
        // Both slug and name lookups return null (not found)
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
        // Insert returns a generated provisional row
        (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({
          data: { id: "new-prov-id", name: "Quantum Tunnelling", slug: "provisional-quantum-tunnelling", subject: "Physics", description: "Provisional", learning_stage: "Upper secondary", difficulty: "medium" },
          error: null,
        });
      }
      if (table === "content_units") {
        (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
      }
      if (table === "learner_profile") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
      }
      if (table === "mastery_profiles") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    const result = await buildMasteryPath("Quantum Tunnelling", "user-1");

    expect(result.aiGenerated).toBe(true);
    expect(result.notice).toBeTruthy();
    // All stages should be AI-generated since there are no approved content units
    expect(result.stages.every((s) => s.aiGenerated)).toBe(true);
  });

  it("retrieves approved content before generating", async () => {
    const { groqApiService } = await import("@/services/groqApiService");
    const makeRequestSpy = groqApiService.makeRequest as ReturnType<typeof vi.fn>;
    makeRequestSpy.mockClear();

    const conceptRow = { id: "concept-fractions", name: "Fractions", slug: "fractions", subject: "Mathematics", description: "Fractions", learning_stage: "Lower secondary", difficulty: "core" };
    // Provide units covering all 10 stage types so no AI generation is needed
    const fullUnits = [
      "Quick Check", "Core Explanation", "Alternative Explanation", "Worked Example",
      "Recall Cards", "Guided Problem", "Independent Problem", "Practical Activity",
      "Mastery Check Item", "Revision Activity",
    ].map((t, i) => ({ id: `u${i}`, unit_type: t, difficulty: "core", content: {}, hints: null, review_status: "approved", ai_generated: false }));

    mockFrom.mockImplementation((table: string) => {
      const chain = makeSelectChain(null);
      if (table === "concepts") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: conceptRow, error: null });
      }
      if (table === "content_units") {
        (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: fullUnits, error: null });
      }
      if (table === "learner_profile") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
      }
      if (table === "mastery_profiles") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    await buildMasteryPath("fractions", "user-1");

    // Groq should not have been called since all stages had approved content
    expect(makeRequestSpy).not.toHaveBeenCalled();
  });
});
