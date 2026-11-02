import { z } from "zod";

export const blockContentSchema = z.object({
  body: z.string().trim().min(1, "Teaching content is required"),
  visual: z.enum(["density_mass_volume", "solar_system"]).optional(),
  competencyKeys: z.array(z.string().trim().min(1)).optional(),
  prerequisites: z.array(z.object({
    kind: z.enum(["concept", "skill", "formula", "representation"]),
    key: z.string().trim().min(1), label: z.string().trim().min(1),
    refresher: z.string().optional(),
  })).optional(),
  modes: z.array(z.object({ label: z.string().trim().min(1), text: z.string().trim().min(1) })).optional(),
  misconception: z.string().optional(),
  quickCheck: z.object({
    prompt: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2).max(6),
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().trim().min(1),
  }).refine((check) => check.correctIndex < check.options.length, "Correct answer must reference an option").optional(),
});
