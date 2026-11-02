import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Depth } from "./depth";
import type { BlockProgress, Prerequisite } from "./blockRuntime";

export function useBlockLearning(conceptId: string | undefined, depth: Depth, revision: string) {
  const cache = useQueryClient();
  const refresh = () => cache.invalidateQueries({ queryKey: ["block_progress", conceptId, depth] });
  const progress = useQuery({
    queryKey: ["block_progress", conceptId, depth, revision], enabled: !!conceptId,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("knowledge_block_progress", { p_concept_id: conceptId!, p_depth: depth });
      if (error) throw error;
      return Object.fromEntries((data as unknown as BlockProgress[]).map((row) => [row.id, row]));
    },
  });
  const activity = useMutation({ mutationFn: async (input: { blockId: string; version: number; event: string; modality: string; seconds?: number }) => {
    const { error } = await supabase.rpc("record_block_activity", { p_block_id: input.blockId, p_version: input.version, p_event: input.event, p_modality: input.modality, p_seconds: input.seconds || 0 });
    if (error) throw error;
  } });
  const repair = useMutation({ mutationFn: async (input: { blockId: string; version: number; prerequisite: Prerequisite; answer: number }) => {
    const { data, error } = await supabase.rpc("repair_block_prerequisite", { p_block_id: input.blockId, p_version: input.version, p_kind: input.prerequisite.kind, p_key: input.prerequisite.key, p_answer: input.answer });
    if (error) throw error;
    return data;
  }, onSuccess: refresh });
  const response = useMutation({ mutationFn: async (input: { blockId: string; version: number; text: string }) => {
    const { data, error } = await supabase.rpc("submit_block_response", { p_block_id: input.blockId, p_version: input.version, p_response: input.text });
    if (error) throw error;
    return data;
  }, onSuccess: refresh });
  return { progress, activity, repair, response, refresh };
}
