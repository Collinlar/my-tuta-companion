import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ContentUnitRow = {
  id: string;
  unit_type: string;
  difficulty: string | null;
  learning_stage: string | null;
  review_status: string;
  ai_generated: boolean;
  usage_count: number;
  correct_rate: number | null;
  content: Record<string, unknown>;
  estimated_duration_mins: number | null;
  author: string | null;
  reviewer: string | null;
  created_at: string;
  updated_at: string;
};

export function useConceptContentUnits(conceptId?: string) {
  return useQuery({
    queryKey: ["admin", "content-units", conceptId],
    enabled: !!conceptId,
    queryFn: async (): Promise<ContentUnitRow[]> => {
      const { data, error } = await supabase
        .from("content_units")
        .select(
          "id, unit_type, difficulty, learning_stage, review_status, ai_generated, usage_count, correct_rate, content, estimated_duration_mins, author, reviewer, created_at, updated_at"
        )
        .eq("concept_id", conceptId!)
        .order("unit_type");
      if (error) throw error;
      return (data ?? []) as ContentUnitRow[];
    },
    staleTime: 30_000,
  });
}

export function useUpsertContentUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { id, ...fields } = row;
      const op = id
        ? supabase.from("content_units").update(fields).eq("id", id as string).select().single()
        : supabase.from("content_units").insert(fields).select().single();
      const { data, error } = await op;
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ["admin", "content-units", vars.concept_id] });
    },
  });
}

export function useSetContentUnitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, conceptId }: { id: string; status: string; conceptId: string }) => {
      const { error } = await supabase
        .from("content_units")
        .update({ review_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return conceptId;
    },
    onSuccess: (conceptId) => {
      void qc.invalidateQueries({ queryKey: ["admin", "content-units", conceptId] });
    },
  });
}
