import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase and Groq before importing pathBuilder
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
    from: vi.fn(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
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
  (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnValue, error: null });
  return chain;
}

const CONCEPT_ROW = {
  id: "concept-linear", name: "Linear Equations", slug: "linear-equations",
  subject: "Mathematics", description: "Solve linear equations",
  learning_stage: "Lower secondary", difficulty: "core",
};

function unit(id: string, unitType: string, rules: Record<string, unknown> | null = null) {
  return { id, unit_type: unitType, difficulty: "core", content: {}, hints: null, review_status: "approved", ai_generated: false, adaptation_rules: rules };
}

function setupFrom(conceptRow: unknown, contentUnits: unknown[], supportLevel = "guided") {
  mockFrom.mockImplementation((table: string) => {
    const chain = makeSelectChain(null);
    if (table === "concepts") {
      (chain.maybeSingle as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ data: conceptRow, error: null })
        .mockResolvedValue({ data: null, error: null });
    }
    if (table === "content_units") {
      (chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: contentUnits, error: null });
    }
    if (table === "learner_profile") {
      (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { support_level: supportLevel }, error: null });
    }
    if (table === "mastery_profiles") {
      (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
    }
    return chain;
  });
}

describe("buildMasteryPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
  });

  it("assembles stages from approved content units for a Tier A concept", async () => {
    const units = [
      unit("u1", "Quick Check"),
      unit("u2", "Core Explanation"),
      unit("u3", "Worked Example"),
    ];
    setupFrom(CONCEPT_ROW, units);

    const result = await buildMasteryPath("linear-equations", "user-1");

    expect(result.concept.slug).toBe("linear-equations");
    const approvedStages = result.stages.filter((s) => !s.aiGenerated);
    expect(approvedStages.length).toBeGreaterThanOrEqual(3);
  });

  it("marks all stages as aiGenerated for unknown provisional concept", async () => {
    const provRow = { id: "new-prov-id", name: "Quantum Tunnelling", slug: "provisional-quantum-tunnelling", subject: "Physics", description: "Provisional", learning_stage: "Upper secondary", difficulty: "medium" };
    mockFrom.mockImplementation((table: string) => {
      const chain = makeSelectChain(null);
      if (table === "concepts") {
        (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
        (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data: provRow, error: null });
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
    expect(result.stages.every((s) => s.aiGenerated)).toBe(true);
  });

  it("does not call Groq when concept has full approved content coverage", async () => {
    const { groqApiService } = await import("@/services/groqApiService");
    const spy = groqApiService.makeRequest as ReturnType<typeof vi.fn>;
    spy.mockClear();

    const fullUnits = [
      "Quick Check", "Core Explanation", "Alternative Explanation", "Worked Example",
      "Recall Cards", "Guided Problem", "Independent Problem", "Practical Activity",
      "Mastery Check Item", "Revision Activity",
    ].map((t, i) => unit(`u${i}`, t));

    setupFrom(CONCEPT_ROW, fullUnits);

    await buildMasteryPath("linear-equations", "user-1");

    expect(spy).not.toHaveBeenCalled();
  });

  it("calls Groq when concept has fewer than 3 approved units", async () => {
    const { groqApiService } = await import("@/services/groqApiService");
    const spy = groqApiService.makeRequest as ReturnType<typeof vi.fn>;
    spy.mockClear();

    // Only 2 approved units — below the AI_FALLBACK_THRESHOLD of 3
    const fewUnits = [unit("u1", "Quick Check"), unit("u2", "Core Explanation")];
    setupFrom(CONCEPT_ROW, fewUnits);

    await buildMasteryPath("linear-equations", "user-1");

    // Groq should have been called to fill missing stages
    expect(spy).toHaveBeenCalled();
  });

  it("filters out units where learner support_level is in skip_for_levels", async () => {
    // This unit has skip_for_levels: ["independent"] — should be excluded for independent learner
    const units = [
      unit("u1", "Quick Check", { skip_for_levels: ["independent"], boost_for_levels: ["struggling"], variant: "core" }),
      unit("u2", "Core Explanation", null),
      unit("u3", "Worked Example", null),
    ];
    setupFrom(CONCEPT_ROW, units, "independent");

    const result = await buildMasteryPath("linear-equations", "user-1");

    // The Quick Check stage (Diagnose) should not appear since u1 is skipped for independent
    const diagnoseStage = result.stages.find((s) => s.phase === "Diagnose");
    // Either omitted (no approved unit for Diagnose after filtering) or not present
    // Since approvedCount after filtering is 2 (below threshold), it may be AI-generated
    // What we can assert: u1 is not in any served content unit
    const servedIds = result.stages.filter((s) => s.contentUnit).map((s) => s.contentUnit!.id);
    expect(servedIds).not.toContain("u1");
  });

  it("increments usage_count via RPC for served approved units", async () => {
    const units = [
      unit("u1", "Quick Check"),
      unit("u2", "Core Explanation"),
      unit("u3", "Worked Example"),
    ];
    setupFrom(CONCEPT_ROW, units);

    await buildMasteryPath("linear-equations", "user-1");

    // rpc("record_content_unit_usage") should have been called with served unit IDs
    // It's fire-and-forget so we need to wait a tick
    await new Promise((r) => setTimeout(r, 0));
    expect(supabase.rpc).toHaveBeenCalledWith("record_content_unit_usage", expect.objectContaining({ unit_ids: expect.any(Array) }));
  });
});
