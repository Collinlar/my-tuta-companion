import type { BlockContent, BlockQuickCheck, BlockState, KnowledgeBlock } from "./blocks";

export interface Prerequisite {
  kind: "concept" | "skill" | "formula" | "representation";
  key: string;
  label: string;
  refresher?: string;
  check?: BlockQuickCheck;
}

export interface BlockExample {
  key: string;
  body: string;
  category: "recognition" | "relationship" | "application" | "quantitative";
  difficulty: number;
  support: "guided" | "independent";
  prerequisites?: Prerequisite[];
  quickCheck: BlockQuickCheck;
}

export interface BlockProgress {
  id: string;
  version: number;
  covered: boolean;
  state: BlockState;
  gaps: Prerequisite[];
  selectedExample?: BlockExample | null;
  attempts?: number;
  supportRequests?: number;
  recommendedModality?: string | null;
  response?: { id: string; status: "pending" | "passed" | "needs_revision"; feedback: string | null; text: string } | null;
}

/** The effective example and its check always travel together. A server-selected
 * key is included with answers, so a client cannot grade a different example. */
export function learningContent(block: KnowledgeBlock, progress?: BlockProgress): BlockContent {
  const base = block.content || {};
  if (!progress?.selectedExample) return base;
  return { ...base, body: progress.selectedExample.body, quickCheck: progress.selectedExample.quickCheck };
}

export function suggestedBlock(blocks: KnowledgeBlock[], progress: Record<string, BlockProgress>): number {
  // Repair an observed weakness before opening new material. Keep authored
  // order as the tie-breaker, and never route into an unmet prerequisite.
  const review = blocks.findIndex((b) => b.required && progress[b.id]?.state === "needs_review" && !progress[b.id]?.gaps?.length);
  if (review >= 0) return review;
  const next = blocks.findIndex((b) => b.required && !progress[b.id]?.covered && !progress[b.id]?.gaps?.length && progress[b.id]?.response?.status !== "pending");
  return next < 0 ? 0 : next;
}
