/**
 * useExplanationTracker
 *
 * Tracks which explanation content unit a learner most recently encountered
 * during a Mastery Path session, then records pass/fail effectiveness after
 * the next attempt result.
 *
 * Usage:
 *   const { setLastExplanation, recordResult } = useExplanationTracker(conceptId);
 *
 *   // When the learner reaches a Core Explanation or Alternative Explanation stage:
 *   setLastExplanation(contentUnitId);
 *
 *   // When the learner submits an answer (pass/fail) in the same session:
 *   recordResult(passed);
 */
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useExplanationTracker(conceptId: string | null) {
  const lastExplanationId = useRef<string | null>(null);

  function setLastExplanation(contentUnitId: string) {
    lastExplanationId.current = contentUnitId;
  }

  async function recordResult(passed: boolean) {
    const unitId = lastExplanationId.current;
    if (!unitId) return;

    try {
      await supabase.rpc("record_explanation_result", {
        p_content_unit_id: unitId,
        p_passed:          passed,
        p_concept_id:      conceptId ?? undefined,
      });
    } catch {
      // Non-fatal — effectiveness tracking must never interrupt learning.
    }
  }

  return { setLastExplanation, recordResult };
}
