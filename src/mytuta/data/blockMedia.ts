import { z } from "zod";
import { BLOCK_VISUALS } from "./visuals";
export const blockMediaSchema = z.object({
  narration: z.string().trim().min(1).max(6000),
  visual: z.enum(BLOCK_VISUALS).optional(),
  visualCaption: z.string().trim().min(1).max(1000).optional(),
  interactionPrompt: z.string().trim().min(1).max(1000).optional(),
}).refine((value) => !value.visualCaption && !value.interactionPrompt || !!value.visual, "Diagram guidance requires a supported visual");
