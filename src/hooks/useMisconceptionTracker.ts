import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type MisconceptionResult = {
  matched: boolean;
  misconceptionId: string | null;
  interventionContent: Record<string, unknown> | null;
  teacherGuidance: string | null;
};

/**
 * Tracks when a student triggers a known misconception.
 *
 * Call `trackWrongAnswer(conceptId, mistakeCategory)` after a failed attempt.
 * Returns whether a misconception was matched and any intervention content to show.
 *
 * Records to `misconception_resolutions` for teacher insights and NBA input.
 */
export function useMisconceptionTracker() {
  const trackWrongAnswer = useCallback(
    async (conceptId: string, mistakeCategory: string | null): Promise<MisconceptionResult> => {
      if (!mistakeCategory) return { matched: false, misconceptionId: null, interventionContent: null, teacherGuidance: null };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { matched: false, misconceptionId: null, interventionContent: null, teacherGuidance: null };

      // Look for a matching misconception record for this concept.
      const { data: mis } = await supabase
        .from("misconceptions")
        .select("id, intervention_content, teacher_guidance, error_pattern")
        .eq("concept_id", conceptId)
        .ilike("label", `%${mistakeCategory}%`)
        .maybeSingle();

      if (!mis) {
        return { matched: false, misconceptionId: null, interventionContent: null, teacherGuidance: null };
      }

      // Upsert a resolution record — increment occurrence_count on conflict.
      const { data: existing } = await supabase
        .from("misconception_resolutions")
        .select("id, occurrence_count")
        .eq("user_id", user.id)
        .eq("misconception_id", mis.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("misconception_resolutions")
          .update({ occurrence_count: (existing.occurrence_count ?? 1) + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("misconception_resolutions").insert({
          user_id: user.id,
          misconception_id: mis.id,
          concept_id: conceptId,
          first_detected_at: new Date().toISOString(),
          occurrence_count: 1,
        });
      }

      return {
        matched: true,
        misconceptionId: mis.id,
        interventionContent: (mis.intervention_content as Record<string, unknown>) ?? null,
        teacherGuidance: mis.teacher_guidance ?? null,
      };
    },
    []
  );

  const markInterventionShown = useCallback(async (misconceptionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("misconception_resolutions")
      .update({ intervention_shown_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("misconception_id", misconceptionId);
  }, []);

  const markFollowUpResult = useCallback(async (misconceptionId: string, passed: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const update: Record<string, unknown> = { follow_up_passed: passed };
    if (passed) update.resolved_at = new Date().toISOString();
    await supabase
      .from("misconception_resolutions")
      .update(update)
      .eq("user_id", user.id)
      .eq("misconception_id", misconceptionId)
      .is("resolved_at", null);
  }, []);

  return { trackWrongAnswer, markInterventionShown, markFollowUpResult };
}
