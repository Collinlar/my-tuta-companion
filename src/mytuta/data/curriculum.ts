import { z } from "zod";
export const curriculumMappingSchema = z.object({
  id: z.string().uuid().optional(), competency_id: z.string().uuid(),
  framework: z.string().trim().min(1).max(120), framework_version: z.string().trim().min(1).max(60),
  grade: z.string().trim().min(1).max(60), standard_code: z.string().trim().min(1).max(100),
  standard_description: z.string().trim().min(1).max(3000),
  source_url: z.string().trim().url().refine((url) => url.startsWith("https://"), "Use an HTTPS source URL"),
  review_status: z.enum(["draft", "approved"]),
});
export type CurriculumMapping = z.infer<typeof curriculumMappingSchema> & { depth?: string; competency_key?: string };
