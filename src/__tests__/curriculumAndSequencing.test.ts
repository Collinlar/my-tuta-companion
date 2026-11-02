import { describe, expect, it } from "vitest";
import { curriculumMappingSchema } from "../mytuta/data/curriculum";
import { adaptiveBlockSequence, type BlockProgress } from "../mytuta/data/blockRuntime";
import { learningContent } from "../mytuta/data/blockRuntime";
import { blockMediaSchema } from "../mytuta/data/blockMedia";
import type { KnowledgeBlock } from "../mytuta/data/blocks";
const mapping = { competency_id: "12345678-1234-4234-8234-123456789abc", framework: "Example curriculum", framework_version: "2026", grade: "Year 7", standard_code: "M1", standard_description: "Interpret a ratio.", source_url: "https://example.org/curriculum", review_status: "draft" };
const block = (id: string): KnowledgeBlock => ({ id, concept_id: "concept", depth: "foundation", block_type: "definition", title: id, required: true, sequence: 0, objective: null, estimated_time: null, review_status: "published", version: 1, content: { body: id } });
const state = (id: string, overrides: Partial<BlockProgress> = {}): BlockProgress => ({ id, version: 1, state: "not_started", covered: false, gaps: [], ...overrides });
describe("curriculum provenance", () => {
  it("requires a version, standard and HTTPS source before storing an alignment", () => {
    expect(curriculumMappingSchema.safeParse(mapping).success).toBe(true);
    for (const change of [{ framework_version: " " }, { standard_code: "" }, { source_url: "javascript:alert(1)" }, { review_status: "published" }]) {
      expect(curriculumMappingSchema.safeParse({ ...mapping, ...change }).success).toBe(false);
    }
  });
});
describe("adaptive next-block sequencing", () => {
  it("prioritizes observed difficulty, then resumes started work, then authored order", () => {
    const blocks = ["new", "weak", "harder", "started", "later"].map(block);
    const ranked = adaptiveBlockSequence(blocks, { weak: state("weak", { state: "needs_review", attempts: 1 }), harder: state("harder", { state: "needs_review", attempts: 4 }), started: state("started", { state: "in_progress" }) });
    expect(ranked.map((r) => r.blockId)).toEqual(["harder", "weak", "started", "new", "later"]);
  });
  it("excludes covered, blocked, optional and pending-review material", () => {
    const blocks = [block("covered"), block("blocked"), { ...block("optional"), required: false }, block("pending"), block("revision")];
    const ranked = adaptiveBlockSequence(blocks, {
      covered: state("covered", { covered: true }), blocked: state("blocked", { gaps: [{ kind: "skill", key: "division", label: "Division" }] }),
      pending: state("pending", { state: "needs_review", response: { id: "r", status: "pending", text: "Response", feedback: null } }),
      revision: state("revision", { response: { id: "r2", status: "needs_revision", text: "Response", feedback: "Explain further" } }),
    });
    expect(ranked.map((r) => r.blockId)).toEqual(["revision"]);
  });
  it("returns no next block when all required evidence is covered or awaiting review", () => {
    expect(adaptiveBlockSequence([block("done")], { done: state("done", { covered: true }) })).toEqual([]);
  });
});
describe("generated media drafts", () => {
  it("accepts narration and supported diagram guidance", () => {
    expect(blockMediaSchema.safeParse({ narration: "Compare mass and volume.", visual: "density_mass_volume", visualCaption: "Compare the two quantities." }).success).toBe(true);
  });
  it("rejects invented visuals, empty speech and orphan diagram guidance", () => {
    for (const draft of [{ narration: "" }, { narration: "Speak", visual: "https://example.org/image.svg" }, { narration: "Speak", visualCaption: "Diagram" }]) expect(blockMediaSchema.safeParse(draft).success).toBe(false);
  });
  it("does not read an authored example's narration over a selected alternative", () => {
    const authored = { ...block("b"), content: { body: "Original example", narration: "Original audio" } };
    const alternative = { key: "simple", body: "Different example", category: "recognition" as const, support: "guided" as const, difficulty: 1, quickCheck: { prompt: "Choose", options: ["A", "B"], correctIndex: 0, explanation: "A" } };
    const content = learningContent(authored, state("b", { selectedExample: alternative }));
    expect(content.body).toBe("Different example");
    expect(content.narration).toBeUndefined();
  });
});
