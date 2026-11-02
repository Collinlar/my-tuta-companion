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
  return { ...base, body: progress.selectedExample.body, quickCheck: progress.selectedExample.quickCheck, narration: undefined, visualCaption: undefined, interactionPrompt: undefined };
}

export function suggestedBlock(blocks: KnowledgeBlock[], progress: Record<string, BlockProgress>): number {
  return adaptiveBlockSequence(blocks, progress)[0]?.index ?? 0;
}

/** Adapt only among eligible unfinished required blocks. Authored sequence is
 * retained for new material; observed difficulty prioritizes reinforcement. */
export function adaptiveBlockSequence(blocks: KnowledgeBlock[], progress: Record<string, BlockProgress>) {
  return blocks.flatMap((block, index) => {
    const p = progress[block.id];
    if (!block.required || p?.covered || p?.state === "understood" || p?.gaps?.length || p?.response?.status === "pending") return [];
    const review = p?.state === "needs_review" || p?.response?.status === "needs_revision";
    const difficulty = Math.min(10, p?.attempts || 0) + Math.min(5, p?.supportRequests || 0);
    return [{ index, blockId: block.id, priority: review ? 2 : p?.state === "in_progress" ? 1 : 0, difficulty,
      reason: review ? "Revisit this block using your recent feedback and support." : p?.state === "in_progress" ? "Continue the block you started." : "Build the next part of the concept." }];
  }).sort((a, b) => b.priority - a.priority || (a.priority === 2 ? b.difficulty - a.difficulty : 0) || a.index - b.index);
}
