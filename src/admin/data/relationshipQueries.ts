import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type RelRow = {
  id: string;
  source_concept_id: string;
  target_concept_id: string;
  relationship_type: string;
  strength: string;
  notes: string | null;
  source_name?: string;
  target_name?: string;
};

export function useConceptRelationships(conceptId?: string) {
  return useQuery({
    queryKey: ["admin", "relationships", conceptId],
    enabled: !!conceptId,
    queryFn: async (): Promise<RelRow[]> => {
      const { data: rels, error } = await supabase
        .from("concept_relationships")
        .select("id, source_concept_id, target_concept_id, relationship_type, strength, notes")
        .or(`source_concept_id.eq.${conceptId},target_concept_id.eq.${conceptId}`)
        .order("relationship_type");
      if (error) throw error;
      if (!rels?.length) return [];

      const ids = [...new Set(rels.flatMap((r) => [r.source_concept_id, r.target_concept_id]))];
      const { data: concepts } = await supabase
        .from("concepts")
        .select("id, name")
        .in("id", ids);
      const nameMap: Record<string, string> = {};
      for (const c of concepts ?? []) nameMap[c.id] = c.name;

      return rels.map((r) => ({
        ...r,
        source_name: nameMap[r.source_concept_id] ?? r.source_concept_id,
        target_name: nameMap[r.target_concept_id] ?? r.target_concept_id,
      }));
    },
    staleTime: 30_000,
  });
}

export function useUpsertRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: {
      source_concept_id: string;
      target_concept_id: string;
      relationship_type: string;
      strength?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("concept_relationships")
        .upsert(row, { onConflict: "source_concept_id,target_concept_id,relationship_type" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ["admin", "relationships", vars.source_concept_id] });
      void qc.invalidateQueries({ queryKey: ["admin", "relationships", vars.target_concept_id] });
    },
  });
}

export function useDeleteRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, conceptId }: { id: string; conceptId: string }) => {
      const { error } = await supabase.from("concept_relationships").delete().eq("id", id);
      if (error) throw error;
      return conceptId;
    },
    onSuccess: (conceptId) => {
      void qc.invalidateQueries({ queryKey: ["admin", "relationships", conceptId] });
    },
  });
}
