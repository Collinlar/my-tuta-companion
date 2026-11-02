// Knowledge Block model + concept-type Foundation templates (PRD 8, 9, 11).
// Pure data; no I/O. The template for a concept's primary type decides which
// required Foundation blocks it has, so Foundation is a deliberate journey
// through the whole concept rather than one explanation shown five ways.

import type { Depth } from "./depth";
import type { ConceptType } from "./competency";

/** Block type enum (PRD 11.2). Drives how a block renders. */
export const BLOCK_TYPES = [
  "orientation", "definition", "big_picture", "components", "categories", "process",
  "relationships", "vocabulary", "visual_model", "misconception", "example",
  "worked_example", "quick_check", "application", "synthesis",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  orientation: "Orientation", definition: "Definition", big_picture: "Big picture",
  components: "Components", categories: "Categories", process: "How it works",
  relationships: "Relationships", vocabulary: "Key vocabulary", visual_model: "Visual model",
  misconception: "Misconceptions", example: "Examples", worked_example: "Worked example",
  quick_check: "Quick check", application: "Real-world use", synthesis: "Put it together",
};

export interface BlockTemplateItem { title: string; block_type: BlockType }

export const DEPTH_BLOCK_TEMPLATES: Record<"applied" | "advanced", BlockTemplateItem[]> = {
  applied: [
    { title: "Readiness check", block_type: "quick_check" },
    { title: "Scenario", block_type: "big_picture" },
    { title: "Method selection", block_type: "process" },
    { title: "Guided application", block_type: "worked_example" },
    { title: "Independent application", block_type: "application" },
    { title: "Lab or practical task", block_type: "application" },
    { title: "Reflection", block_type: "synthesis" },
    { title: "Applied check", block_type: "quick_check" },
  ],
  advanced: [
    { title: "Readiness check", block_type: "quick_check" },
    { title: "Complex scenario", block_type: "big_picture" },
    { title: "Cross-concept connection", block_type: "relationships" },
    { title: "Evidence evaluation", block_type: "example" },
    { title: "Independent problem", block_type: "application" },
    { title: "Challenge or investigation", block_type: "application" },
    { title: "Justification", block_type: "synthesis" },
    { title: "Advanced check", block_type: "quick_check" },
  ],
};

/** Required Foundation blocks per concept type (PRD 8). Ordered. */
export const FOUNDATION_BLOCK_TEMPLATES: Record<ConceptType, BlockTemplateItem[]> = {
  structural: [
    { title: "Definition", block_type: "definition" },
    { title: "Big picture", block_type: "big_picture" },
    { title: "Components", block_type: "components" },
    { title: "What each part does", block_type: "components" },
    { title: "Categories", block_type: "categories" },
    { title: "Relationships", block_type: "relationships" },
    { title: "Visual model", block_type: "visual_model" },
    { title: "Scale and organisation", block_type: "big_picture" },
    { title: "Common misconceptions", block_type: "misconception" },
    { title: "Basic application", block_type: "application" },
  ],
  process: [
    { title: "Definition", block_type: "definition" },
    { title: "Purpose", block_type: "big_picture" },
    { title: "Inputs", block_type: "components" },
    { title: "Outputs", block_type: "components" },
    { title: "Conditions", block_type: "components" },
    { title: "Sequence and stages", block_type: "process" },
    { title: "Mechanism", block_type: "process" },
    { title: "Influencing factors", block_type: "relationships" },
    { title: "Visual process", block_type: "visual_model" },
    { title: "Common misconceptions", block_type: "misconception" },
    { title: "Basic application", block_type: "application" },
  ],
  procedural: [
    { title: "Definition", block_type: "definition" },
    { title: "Purpose", block_type: "big_picture" },
    { title: "Underlying principle", block_type: "relationships" },
    { title: "Required prior skills", block_type: "vocabulary" },
    { title: "Procedure", block_type: "process" },
    { title: "Why each step works", block_type: "relationships" },
    { title: "Variations", block_type: "categories" },
    { title: "Common errors", block_type: "misconception" },
    { title: "Worked examples", block_type: "worked_example" },
    { title: "Basic independent practice", block_type: "application" },
  ],
  quantitative: [
    { title: "Definition", block_type: "definition" },
    { title: "Variables", block_type: "components" },
    { title: "Units", block_type: "vocabulary" },
    { title: "Formula", block_type: "relationships" },
    { title: "Relationship between variables", block_type: "relationships" },
    { title: "Physical meaning", block_type: "big_picture" },
    { title: "Graph and representation", block_type: "visual_model" },
    { title: "Worked example", block_type: "worked_example" },
    { title: "Common errors", block_type: "misconception" },
    { title: "Real-world application", block_type: "application" },
  ],
  principle: [
    { title: "Definition", block_type: "definition" },
    { title: "Underlying idea", block_type: "big_picture" },
    { title: "Conditions", block_type: "components" },
    { title: "Cause and effect", block_type: "relationships" },
    { title: "Representations", block_type: "visual_model" },
    { title: "Examples", block_type: "example" },
    { title: "Non-examples", block_type: "example" },
    { title: "Misconceptions", block_type: "misconception" },
    { title: "Applications", block_type: "application" },
  ],
  classification: [
    { title: "Definition", block_type: "definition" },
    { title: "Classification criteria", block_type: "relationships" },
    { title: "Categories", block_type: "categories" },
    { title: "Category characteristics", block_type: "components" },
    { title: "Comparison", block_type: "relationships" },
    { title: "Identification", block_type: "quick_check" },
    { title: "Examples", block_type: "example" },
    { title: "Misconceptions", block_type: "misconception" },
  ],
  systems: [
    { title: "System purpose", block_type: "big_picture" },
    { title: "Components", block_type: "components" },
    { title: "Inputs and outputs", block_type: "components" },
    { title: "Interactions", block_type: "relationships" },
    { title: "Dependencies", block_type: "relationships" },
    { title: "Feedback", block_type: "process" },
    { title: "Failure points", block_type: "misconception" },
    { title: "Visual system map", block_type: "visual_model" },
    { title: "Common misconceptions", block_type: "misconception" },
  ],
  causal: [
    { title: "Cause", block_type: "definition" },
    { title: "Mechanism", block_type: "process" },
    { title: "Effect", block_type: "components" },
    { title: "Conditions", block_type: "components" },
    { title: "Variables", block_type: "components" },
    { title: "Alternative explanations", block_type: "misconception" },
    { title: "Misconceptions", block_type: "misconception" },
    { title: "Evidence", block_type: "example" },
    { title: "Real-world examples", block_type: "application" },
  ],
  representational: [
    { title: "Purpose of the representation", block_type: "big_picture" },
    { title: "Symbols", block_type: "vocabulary" },
    { title: "Rules", block_type: "relationships" },
    { title: "Reading it", block_type: "process" },
    { title: "Interpretation", block_type: "process" },
    { title: "Converting between forms", block_type: "process" },
    { title: "Common errors", block_type: "misconception" },
    { title: "Examples", block_type: "example" },
    { title: "Practice", block_type: "application" },
  ],
};

export interface BlockMode { label: string; text: string }
export interface BlockQuickCheck { prompt: string; options: string[]; correctIndex: number; explanation: string }
export interface BlockContent {
  narration?: string;
  visualCaption?: string;
  interactionPrompt?: string;
  body?: string;
  visual?: import("./visuals").BlockVisual;
  competencyKeys?: string[];
  prerequisites?: import("./blockRuntime").Prerequisite[];
  examples?: import("./blockRuntime").BlockExample[];
  task?: { prompt: string; rubric: string[] };
  modes?: BlockMode[];
  quickCheck?: BlockQuickCheck;
  misconception?: string;
}

export interface KnowledgeBlock {
  id: string;
  concept_id: string;
  depth: Depth;
  block_type: string;
  title: string;
  objective: string | null;
  required: boolean;
  sequence: number;
  content: BlockContent | null;
  estimated_time: string | null;
  review_status: string;
  version?: number;
}

/** Per-block learner state within a Foundation run (PRD 32). Local to a session
 * in Phase 1; persisted + fed to the completeness engine in Phase 2. */
export type BlockState = "not_started" | "in_progress" | "understood" | "needs_review";
