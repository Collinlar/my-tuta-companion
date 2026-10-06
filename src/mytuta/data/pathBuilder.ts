/**
 * pathBuilder — Retrieve → Compose → Adapt → Generate
 *
 * For Tier A/B Concepts (>=3 approved units): assembles a Mastery Path from
 * reviewed Content Units only.  No AI generation is used.
 * For Tier C / open Concepts (<3 approved units): falls back to Groq for any
 * stage that has no approved unit, marks content as ai_generated, and shows a
 * transparency notice to the student.
 *
 * Phase 3 additions:
 *   - adaptation_rules filtering: units tagged skip_for_levels are excluded;
 *     boost_for_levels units are sorted first within a stage type bucket.
 *   - Content reuse tracking: all served approved units have their usage_count
 *     incremented in a single RPC call after the path is composed.
 *   - AI fallback threshold: Groq is only called when approvedCount < 3.
 */
import { supabase } from "@/integrations/supabase/client";
import { groqApiService } from "@/services/groqApiService";
import { sanitizeLlmJson } from "./jsonRepair";

// Minimum approved units before we treat a concept as well-covered and stop
// calling AI to fill gaps.
const AI_FALLBACK_THRESHOLD = 3;

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

type AdaptationRules = {
  skip_for_levels?:  string[];
  boost_for_levels?: string[];
  variant?:          "support" | "core" | "extension";
};

type ConceptContentUnit = {
  id:               string;
  unit_type:        string;
  difficulty:       string | null;
  content:          Record<string, unknown>;
  hints?:           unknown;
  review_status:    string;
  ai_generated:     boolean;
  adaptation_rules: AdaptationRules | null;
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
  concept:     ConceptRow;
  stages:      PathStage[];
  aiGenerated: boolean; // true if any stage was AI-generated
  provisional: boolean; // true if the concept itself is provisional (Tier C)
  notice?:     string;  // shown to student when provisional
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

  // 2. Retrieve approved Content Units — include adaptation_rules for Phase 3 filtering.
  const { data: units } = await supabase
    .from("content_units")
    .select("id, unit_type, difficulty, content, hints, review_status, ai_generated, adaptation_rules")
    .eq("concept_id", concept.id)
    .in("review_status", ["approved", "published"])
    .order("unit_type");

  const approvedCount = (units ?? []).length;

  // 3. Fetch learner support level once so both compose and adapt can use it.
  const { data: profile } = await supabase
    .from("learner_profile")
    .select("support_level")
    .eq("user_id", userId)
    .maybeSingle();
  const supportLevel = (profile?.support_level as string | null) ?? "guided";

  // Group units by type, applying adaptation_rules filtering and ordering.
  const unitsByType: Record<string, ConceptContentUnit[]> = {};
  for (const u of units ?? []) {
    const unit = u as ConceptContentUnit;
    const rules = unit.adaptation_rules;

    // Skip units the learner's support level should not see.
    if (rules?.skip_for_levels?.includes(supportLevel)) continue;

    if (!unitsByType[unit.unit_type]) unitsByType[unit.unit_type] = [];
    unitsByType[unit.unit_type].push(unit);
  }

  // Within each type bucket: boost_for_levels units sort first.
  for (const key of Object.keys(unitsByType)) {
    unitsByType[key].sort((ua, ub) => {
      const aBoost = ua.adaptation_rules?.boost_for_levels?.includes(supportLevel) ? 0 : 1;
      const bBoost = ub.adaptation_rules?.boost_for_levels?.includes(supportLevel) ? 0 : 1;
      return aBoost - bBoost;
    });
  }

  // 4. Compose stages.
  //    If the concept has < AI_FALLBACK_THRESHOLD approved units it is under-covered
  //    and we fall back to Groq for any missing stage.
  //    If it has enough reviewed content we compose strictly from approved units
  //    and skip stages that have no approved unit rather than generating.
  const stages: PathStage[] = [];
  let anyAiGenerated = false;
  const servedUnitIds: string[] = [];

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
      servedUnitIds.push(chosen.id);
      stages.push({
        phase:       stageDef.phase,
        label:       stageDef.label,
        contentUnit: chosen,
        aiGenerated: false,
      });
    } else if (approvedCount < AI_FALLBACK_THRESHOLD) {
      // Under-covered concept: fill the gap with Groq.
      anyAiGenerated = true;
      const aiContent = await generateStageContent(
        concept,
        stageDef.phase,
        stageDef.unitTypes[0],
      );
      stages.push({
        phase:       stageDef.phase,
        label:       stageDef.label,
        aiGenerated: true,
        aiContent,
      });
    }
    // Well-covered concept with no unit for this stage: omit the stage silently.
    // The path is still complete enough to learn from.
  }

  // 5. Adapt — prerequisite skips via Intelligence Layer.
  const adapted = await adaptPath(stages, userId, concept.id, supportLevel);

  // 6. Track reuse — fire-and-forget; never blocks the learner.
  if (servedUnitIds.length > 0) {
    void recordUsage(servedUnitIds);
  }

  const provisional = concept.id.startsWith("provisional:");
  return {
    concept,
    stages: adapted,
    aiGenerated: anyAiGenerated,
    provisional,
    notice: provisional
      ? "This topic is AI-generated and has not yet been fully reviewed. A reviewed version is on the way."
      : approvedCount < AI_FALLBACK_THRESHOLD
      ? "Some stages use AI-generated content while our team reviews this concept."
      : undefined,
  };
}

// ----------------------------------------------------------------
// Content reuse tracking — single RPC, non-blocking
// ----------------------------------------------------------------
async function recordUsage(unitIds: string[]): Promise<void> {
  try {
    await supabase.rpc("record_content_unit_usage", { unit_ids: unitIds });
  } catch {
    // Non-fatal — usage metrics should never block learning.
  }
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

  if (inserted) {
    void trackConceptDemand(slug, query.trim(), classified.subject);
    return inserted as ConceptRow;
  }

  // Insert failed (e.g. concurrent duplicate) — look it up instead.
  const { data: existing } = await supabase
    .from("concepts")
    .select("id, name, slug, subject, description, learning_stage, difficulty")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    void trackConceptDemand(slug, query.trim(), classified.subject);
    return existing as ConceptRow;
  }

  // Ultimate fallback — local stub (never reaches DB).
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
// Demand tracking — upsert / increment concept_demand row
// ----------------------------------------------------------------
async function trackConceptDemand(
  slug: string,
  name: string,
  subject: string,
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("concept_demand")
      .select("id, request_count")
      .eq("concept_slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("concept_demand")
        .update({ request_count: (existing.request_count ?? 0) + 1, last_requested_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("concept_demand").insert({
        concept_slug: slug,
        concept_name: name,
        subject,
        request_count: 1,
        last_requested_at: new Date().toISOString(),
      });
    }
  } catch {
    // Non-fatal — demand tracking should never block learning.
  }
}

// ----------------------------------------------------------------
// Generate a single stage via Groq (Tier C fallback only)
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
// Adapt path based on Intelligence Layer (prerequisite state)
// supportLevel is already known from the compose step — passed in to avoid
// a second DB round-trip.
// ----------------------------------------------------------------
async function adaptPath(
  stages: PathStage[],
  userId: string,
  conceptId: string,
  supportLevel: string,
): Promise<PathStage[]> {
  // For "independent" learners: skip the Diagnose and Foundations stages if
  // the learner already has a mastered state on this concept.
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
