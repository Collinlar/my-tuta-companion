// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { blockContentSchema } from "../mytuta/data/blockValidation";
import { frameworkReadiness } from "../mytuta/data/frameworkReadiness";
import type { KnowledgeBlock } from "../mytuta/data/blocks";
import type { Depth } from "../mytuta/data/depth";

const packs = JSON.parse(readFileSync(`${process.cwd()}/supabase/competency_geometry_drafts.json`, "utf8"));
describe("geometry expansion packs", () => {
  it("covers the template and every competency at all three depths", () => {
    expect(packs.map((p) => p.slug)).toEqual(["perimeter-area", "angles"]);
    for (const pack of packs) for (const depth of ["foundation", "applied", "advanced"] as Depth[]) {
      const blocks = pack.blocks.filter((b) => b.depth === depth).map((b, i) => ({ ...b, id: String(i), review_status: "approved" })) as KnowledgeBlock[];
      const competencies = pack.competencies.filter((c) => c.depth === depth).map((c) => ({ competency_key: c.key, required: true, review_status: "approved" }));
      expect(blocks).toHaveLength(depth === "foundation" ? 11 : 8);
      expect(frameworkReadiness(blocks, competencies, "quantitative", depth).ready, `${pack.slug}/${depth}`).toBe(true);
      for (const block of blocks) expect(blockContentSchema.safeParse(block.content).success, block.title).toBe(true);
    }
  });
  it("keeps independent higher-depth work reviewable with rubrics", () => {
    for (const pack of packs) for (const depth of ["applied", "advanced"]) {
      const tasks = pack.blocks.filter((b) => b.depth === depth && b.content.task);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      for (const task of tasks) {
        expect(task.content.competencyKeys).toHaveLength(3);
        expect(task.content.task.rubric).toHaveLength(3);
        expect(task.content.examples).toBeUndefined();
      }
    }
  });
  it("uses consistent answers for rectangle, shared-edge and angle calculations", () => {
    const correct = (slug: string, depth: string, title: string) => {
      const q = packs.find((p) => p.slug === slug).blocks.find((b) => b.depth === depth && b.title === title).content.quickCheck;
      return q.options[q.correctIndex];
    };
    expect(correct("perimeter-area", "foundation", "A rectangular school garden")).toBe(`${2 * (8 + 3)} metres`);
    expect(correct("perimeter-area", "applied", "Guided application")).toBe(`${12 * 8 + 4 * 3} square metres`);
    expect(correct("angles", "foundation", "Missing angle at a point")).toBe(`${360 - 120 - 95} degrees`);
    expect(correct("angles", "advanced", "Advanced check")).toBe(`${(6 - 2) * 180} degrees`);
  });
});
