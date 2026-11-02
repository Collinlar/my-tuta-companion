import { FOUNDATION_BLOCK_TEMPLATES, DEPTH_BLOCK_TEMPLATES, type KnowledgeBlock } from "./blocks";
import type { ConceptType } from "./competency";
import type { Depth } from "./depth";

export function frameworkReadiness(blocks: KnowledgeBlock[], competencies: { competency_key: string; required: boolean; review_status: string }[], conceptType: ConceptType | null, depth: Depth) {
  const required = blocks.filter((b) => b.required);
  const template = (depth === "foundation" ? conceptType ? FOUNDATION_BLOCK_TEMPLATES[conceptType] : [] : DEPTH_BLOCK_TEMPLATES[depth]) || [];
  const types = new Set(required.map((b) => b.block_type));
  if (required.some((b) => b.content?.visual)) types.add("visual_model");
  const missingTypes = [...new Set(template.map((b) => b.block_type))].filter((type) => !types.has(type));
  const mapped = new Set(required.filter((b) => b.content?.quickCheck || b.content?.task).flatMap((b) => b.content?.competencyKeys || []));
  const missingCompetencies = competencies.filter((c) => c.required && !mapped.has(c.competency_key)).map((c) => c.competency_key);
  const unreviewedBlocks = required.filter((b) => !["approved", "published"].includes(b.review_status)).length;
  const unreviewedCompetencies = competencies.filter((c) => c.required && !["approved", "published"].includes(c.review_status)).length;
  const needsIndependentTask = depth !== "foundation" && !required.some((b) => b.content?.task);
  return { missingTypes, missingCompetencies, unreviewedBlocks, unreviewedCompetencies, needsIndependentTask,
    ready: !!required.length && !!competencies.filter((c) => c.required).length && !!template.length && !missingTypes.length && !missingCompetencies.length && !unreviewedBlocks && !unreviewedCompetencies && !needsIndependentTask };
}
