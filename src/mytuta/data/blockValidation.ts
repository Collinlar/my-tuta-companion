import { BLOCK_VISUALS } from "./visuals";
import { z } from "zod";
export const quickCheckSchema = z.object({
  prompt: z.string().trim().min(1), options: z.array(z.string().trim().min(1)).min(2).max(6),
  correctIndex: z.number().int().nonnegative(), explanation: z.string().trim().min(1),
}).refine((c) => c.correctIndex < c.options.length, "Correct answer must reference an option");
export const prerequisiteSchema = z.object({
  kind: z.enum(["concept", "skill", "formula", "representation"]), key: z.string().trim().min(1),
  label: z.string().trim().min(1), refresher: z.string().optional(), check: quickCheckSchema.optional(),
});
export const blockContentSchema = z.object({
  body: z.string().trim().min(1, "Teaching content is required"),
  narration: z.string().trim().min(1).max(6000).optional(),
  visualCaption: z.string().trim().min(1).max(1000).optional(),
  interactionPrompt: z.string().trim().min(1).max(1000).optional(),
  visual: z.enum(BLOCK_VISUALS).optional(),
  competencyKeys: z.array(z.string().trim().min(1)).optional(), prerequisites: z.array(prerequisiteSchema).optional(),
  examples: z.array(z.object({
    key: z.string().trim().min(1), body: z.string().trim().min(1),
    category: z.enum(["recognition", "relationship", "application", "quantitative"]),
    difficulty: z.number().int().min(1).max(5), support: z.enum(["guided", "independent"]),
    prerequisites: z.array(prerequisiteSchema).optional(), quickCheck: quickCheckSchema,
  })).max(10).optional(),
  task: z.object({ prompt: z.string().trim().min(1), rubric: z.array(z.string().trim().min(1)).min(1).max(10) }).optional(),
  modes: z.array(z.object({ label: z.string().trim().min(1), text: z.string().trim().min(1) })).optional(),
  misconception: z.string().optional(), quickCheck: quickCheckSchema.optional(),
}).refine((c) => !c.examples || new Set(c.examples.map((e) => e.key)).size === c.examples.length, "Example keys must be unique")
  .refine((c) => !c.visualCaption && !c.interactionPrompt || !!c.visual, "Diagram guidance requires a supported visual");
