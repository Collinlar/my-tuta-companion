import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { frameworkReadiness } from "../mytuta/data/frameworkReadiness";
import { blockContentSchema } from "../mytuta/data/blockValidation";
import type { KnowledgeBlock } from "../mytuta/data/blocks";
import type { ConceptType } from "../mytuta/data/competency";
const read = (name: string) => JSON.parse(readFileSync(`${process.cwd()}/supabase/${name}`, "utf8"));

describe("flagship authoring packs", () => {
  const foundation = read("competency_pilot_drafts.json");
  const completion = read("competency_foundation_completion.json");
  const deeper = read("competency_depth_drafts.json");
  it("provides complete Foundation structure and competency checks for all ten concepts", () => {
    expect(foundation).toHaveLength(10);
    for (const concept of foundation) {
      const additions = completion.find((row) => row.slug === concept.slug);
      const blocks = [...concept.blocks.map((b) => ({ ...b, block_type: additions.retags[b.title] || b.block_type })), ...additions.additions];
      const competencies = [...concept.competencies.filter((c) => c.depth === "foundation").map((c) => ({ competency_key: c.key, required: true, review_status: "approved" })), ...additions.additions.map((b) => ({ competency_key: b.key, required: true, review_status: "approved" }))];
      const reviewed = blocks.map((b, i) => ({ ...b, id: String(i), required: true, review_status: "approved" })) as KnowledgeBlock[];
      expect(frameworkReadiness(reviewed, competencies, concept.concept_type as ConceptType, "foundation").ready, concept.slug).toBe(true);
      for (const block of blocks) expect(blockContentSchema.safeParse(block.content).success, `${concept.slug}: ${block.title}`).toBe(true);
    }
  });
  it("requires approval even when structure and mappings are present", () => {
    const concept = foundation.find((c) => c.slug === "density");
    const blocks = concept.blocks.map((b, i) => ({ ...b, id: String(i), review_status: "draft" })) as KnowledgeBlock[];
    const competencies = concept.competencies.filter((c) => c.depth === "foundation").map((c) => ({ competency_key: c.key, required: true, review_status: "draft" }));
    expect(frameworkReadiness(blocks, competencies, "quantitative", "foundation").ready).toBe(false);
  });
  it("provides eight blocks and reviewed independent work at both higher depths for every flagship", () => {
    expect(deeper).toHaveLength(20);
    for (const journey of deeper) {
      expect(journey.blocks).toHaveLength(8);
      const concept = foundation.find((c) => c.slug === journey.slug);
      const competencies = concept.competencies.filter((c) => c.depth === journey.depth).map((c) => ({ competency_key: c.key, required: true, review_status: "approved" }));
      const blocks = journey.blocks.map((b, i) => ({ ...b, id: String(i), review_status: "approved" })) as KnowledgeBlock[];
      expect(frameworkReadiness(blocks, competencies, concept.concept_type, journey.depth).ready, `${journey.slug}: ${journey.depth}`).toBe(true);
      for (const block of blocks) expect(blockContentSchema.safeParse(block.content).success).toBe(true);
    }
  });
  it("validates the prerequisite-aware pilot alternatives", () => {
    const examples = read("competency_example_drafts.json");
    for (const block of examples) expect(blockContentSchema.safeParse({ body: "Pilot", prerequisites: block.prerequisites, examples: block.examples }).success).toBe(true);
  });
});
