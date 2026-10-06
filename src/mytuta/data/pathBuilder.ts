/**
 * pathBuilder — Retrieve → Compose → Adapt → Generate
 *
 * For Tier A/B Concepts: assembles a Mastery Path from approved Content Units.
 * For Tier C / open Concepts: falls back to Groq generation, marks as ai_generated,
 * and shows a transparency notice to the student.
 */
import { supabase } from "@/integrations/supabase/client";
import { groqApiService } from "@/services/groqApiService";
import { sanitizeLlmJson } from "./jsonRepair";

// Standard 10-stage Mastery Path structure (maps to Content Unit types).
const STAGE_ORDER: Array<{ phase: string; unitTypes: string[]; label: string }> = [
  { phase: "Diagnose",            unitTypes: ["Quick Check"],           label: "Foundations check" },
  { phase: "Foundations",         unitTypes: ["Core Explanation"],      label: "Understand" },
  { phase: "Understand",          unitTypes: ["Alternative Explanation","Analogy"], label: "See it differently" },
  { phase: "Worked Examples",     unitTypes: ["Worked Example"],        label: "Worked examples" },
  { phase: "Recall",              unitTypes: ["Recall Cards"],          label: "Recall" },
  { phase: "Guided Practice",     unitTypes: ["Guided Problem"],        label: "Guided practice" },
  { phase: "Independent Practice",unitTypes: ["Independent Problem"],   label: "Independent practice" },
  { phase: "Apply",               unitTypes: ["Practical Activity","Extension"], label: "Apply" },
  { phase: "Prove",               unitTypes: ["Mastery Check Item"],    label: "Mastery check" },
  { phase: "Revision",            unitTypes: ["Revision Activity"],     label: "Revision" },
];

export type PathStage = {
  phase:         string;
  label:         string;
  contentUnit?:  ConceptContentUnit;
  aiGenerated:   boolean;
  aiContent?:    string;
};

type ConceptContentUnit = {
  id:           string;
  unit_type:    string;
  difficulty:   string | null;
  content:      Record<string, unknown>;
  hints?:       unknown;
  review_status:string;
  ai_generated: boolean;
};

type ConceptRow = {
  id:            string;
  name:          string;
  slug:          string;
  subject:       string;
  description:   string | null;
  learning_stage:string | null;
  difficulty:    string | null;
};

export type BuiltPath = {
  concept:       ConceptRow;
  stages:        PathStage[];
  aiGenerated:   boolean; // true if any stage was AI-generated
  provisional:   boolean; // true if the concept itself is provisional (Tier C)
  notice?:       string;  // shown to student when provisional
};

// ----------------------------------------------------------------
// Main entry point
// ----------------------------------------------------------------
export async function buildMasteryPath(
  conceptQuery: string,
  userId: string,
): Promise<BuiltPath> {
  // 1. Retrieve: look up the concept by slug or name.
  const concept = await findOrCreateConcept(conceptQuery);

  // 2. Retrieve approved Content Units for this concept.
  const { data: units } = await supabase
    .from("content_units")
    .select("id, unit_type, difficulty, content, hints, review_status, ai_generated")
    .eq("concept_id", concept.id)
    .in("review_status", ["approved", "published"])
    .order("unit_type");

  const unitsByType: Record<string, ConceptContentUnit[]> = {};
  for (const u of units ?? []) {
    if (!unitsByType[u.unit_type]) unitsByType[u.unit_type] = [];
    unitsByType[u.unit_type].push(u as ConceptContentUnit);
  }

  const approvedCount = Object.values(unitsByType).flat().length;

  // 3. Compose stages — prefer approved content, fall back to AI generation.
  const stages: PathStage[] = [];
  let anyAiGenerated = false;

  for (const stageDef of STAGE_ORDER) {
    let chosen: ConceptContentUnit | undefined;
    for (const t of stageDef.unitTypes) {
      const available = unitsByType[t];
      if (available?.length) {
        chosen = available[0];
        break;
      }
    }

    if (chosen) {
      stages.push({
        phase:       stageDef.phase,
        label:       stageDef.label,
        contentUnit: chosen,
        aiGenerated: false,
      });
    } else {
      // Generate this stage with Groq.
      anyAiGenerated = true;
      const aiContent = await generateStageContent(
        concept,
        stageDef.phase,
        stageDef.unitTypes[0],
      );
      stages.push({
        phase:      stageDef.phase,
        label:      stageDef.label,
        aiGenerated:true,
        aiContent,
      });
    }
  }

  // 4. Adapt — apply Intelligence Layer (support level, prerequisite skips).
  const adapted = await adaptPath(stages, userId, concept.id);

  const provisional = concept.id.startsWith("provisional:");
  return {
    concept,
    stages: adapted,
    aiGenerated: anyAiGenerated,
    provisional,
    notice: provisional
      ? "This topic is AI-generated and has not yet been fully reviewed. A reviewed version is on the way."
      : approvedCount < 5
      ? "Some stages use AI-generated content while our team reviews this concept."
      : undefined,
  };
}

// ----------------------------------------------------------------
// Find existing concept or create a provisional one (Tier C fallback)
// ----------------------------------------------------------------
async function findOrCreateConcept(query: string): Promise<ConceptRow> {
  const q = query.trim().toLowerCase();

  // Try slug match first.
  const { data: bySlug } = await supabase
    .from("concepts")
    .select("id, name, slug, subject, description, learning_stage, difficulty")
    .eq("slug", q.replace(/\s+/g, "-"))
    .maybeSingle();
  if (bySlug) return bySlug as ConceptRow;

  // Try name match (case-insensitive).
  const { data: byName } = await supabase
    .from("concepts")
    .select("id, name, slug, subject, description, learning_stage, difficulty")
    .ilike("name", query.trim())
    .maybeSingle();
  if (byName) return byName as ConceptRow;

  // Tier C: concept not in catalog — create provisional.
  return createProvisionalConcept(query);
}

async function createProvisionalConcept(query: string): Promise<ConceptRow> {
  // Ask Groq to classify the concept.
  let classified: { subject: string; domain: string; stage: string; valid: boolean } = {
    subject: "Science",
    domain: query,
    stage: "Lower secondary",
    valid: true,
  };

  try {
    const raw = await groqApiService.makeRequest(
      [
        {
          role: "system",
          content:
            "You classify STEM topics for Ghanaian secondary students. Respond with only JSON. No markdown.",
        },
        {
          role: "user",
          content: `Classify this topic: "${query}". Respond as JSON: {"subject":"Mathematics|Biology|Chemistry|Physics|Science","domain":"string","stage":"Lower secondary|Upper secondary","valid":true|false}. valid is false only if the topic is not STEM.`,
        },
      ],
      300,
    );
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const j = JSON.parse(sanitizeLlmJson(cleaned));
    if (j.subject) classified = j;
  } catch {
    // Fallback classification — non-fatal.
  }

  const slug = `provisional-${query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

  const { data: inserted } = await supabase
    .from("concepts")
    .insert({
      slug,
      name:           query.trim(),
      subject:        classified.subject,
      description:    `Provisional concept: ${query}. Pending academic review.`,
      learning_stage: classified.stage,
      difficulty:     "medium",
      related_areas:  [],
    })
    .select("id, name, slug, subject, description, learning_stage, difficulty")
    .single();

  if (inserted) return inserted as ConceptRow;

  // If insert failed (e.g. duplicate), fall back to a local stub.
  return {
    id:            `provisional:${slug}`,
    name:          query.trim(),
    slug,
    subject:       classified.subject,
    description:   `Provisional concept: ${query}`,
    learning_stage: classified.stage,
    difficulty:    "medium",
  };
}

// ----------------------------------------------------------------
// Generate a single stage via Groq (Tier C fallback)
// ----------------------------------------------------------------
async function generateStageContent(
  concept: ConceptRow,
  phase: string,
  unitType: string,
): Promise<string> {
  try {
    const raw = await groqApiService.makeRequest(
      [
        {
          role: "system",
          content:
            "You write STEM teaching content for Ghanaian secondary learners. Use local examples (Accra, Kumasi, markets, farms). Never use em dashes. Respond with only JSON.",
        },
        {
          role: "user",
          content: `Generate a ${unitType} for the concept "${concept.name}" (${concept.subject}, ${concept.learning_stage ?? "secondary"}).
Phase: ${phase}. Return JSON with keys relevant to this unit type (e.g. for Worked Example: {"problem","steps","common_mistake"}).
Keep it under 150 words total. JSON only, no markdown.`,
        },
      ],
      800,
    );
    return raw;
  } catch {
    return JSON.stringify({ phase, unitType, content: `AI content for ${concept.name} — ${phase}.` });
  }
}

// ----------------------------------------------------------------
// Adapt path based on Intelligence Layer (support level, prerequisite state)
// ----------------------------------------------------------------
async function adaptPath(
  stages: PathStage[],
  userId: string,
  conceptId: string,
): Promise<PathStage[]> {
  // Fetch learner support level.
  const { data: profile } = await supabase
    .from("learner_profile")
    .select("support_level")
    .eq("user_id", userId)
    .maybeSingle();

  const supportLevel = (profile?.support_level as string | null) ?? "guided";

  // For "independent" learners: skip the Diagnose and Recall stages if mastery > 50%.
  if (supportLevel === "independent") {
    const { data: masteryProfile } = await supabase
      .from("mastery_profiles")
      .select("overall_state")
      .eq("user_id", userId)
      .eq("concept_id", conceptId)
      .maybeSingle();

    const masteredStates = ["Secure", "Mastered"];
    if (masteryProfile && masteredStates.includes(masteryProfile.overall_state ?? "")) {
      return stages.filter((s) => !["Diagnose", "Foundations"].includes(s.phase));
    }
  }

  return stages;
}
