import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { frameworkReadiness } from "@/mytuta/data/frameworkReadiness";
import { BLOCK_TYPE_LABEL, type BlockType, type KnowledgeBlock } from "@/mytuta/data/blocks";
import { DEPTH_LABEL, type Depth } from "@/mytuta/data/depth";
import { isConceptType } from "@/mytuta/data/competency";
import type { AdminCompetency } from "./data/queries";
import { ActionModal } from "./ui";
import { card, ghostBtn } from "./theme";

export default function FrameworkPublication({ conceptId, depth, conceptType, blocks, competencies }: { conceptId: string; depth: Depth; conceptType: string | null; blocks: KnowledgeBlock[]; competencies: AdminCompetency[] }) {
  const [open, setOpen] = useState(false);
  const ready = frameworkReadiness(blocks, competencies, isConceptType(conceptType) ? conceptType : null, depth);
  const cache = useQueryClient();
  const publish = useMutation({ mutationFn: async (reason: string) => {
    const { error } = await supabase.rpc("admin_publish_competency_depth", { p_concept_id: conceptId, p_depth: depth, p_reason: reason });
    if (error) throw error;
  }, onSuccess: async () => {
    await cache.invalidateQueries({ queryKey: ["knowledge_blocks"] });
    await cache.invalidateQueries({ queryKey: ["admin", "competencies"] });
    await cache.invalidateQueries({ queryKey: ["admin", "audit"] }); setOpen(false);
  } });
  return <section style={{ ...card, padding: 18, marginBottom: 16 }}>
    <h3>{DEPTH_LABEL[depth]} publication readiness</h3>
    <p>{ready.unreviewedBlocks} required blocks and {ready.unreviewedCompetencies} required competencies still need academic approval.</p>
    {!!ready.missingTypes.length && <p>Missing structure: {ready.missingTypes.map((type) => BLOCK_TYPE_LABEL[type as BlockType] || type).join(", ")}.</p>}
    {!!ready.missingCompetencies.length && <p>Missing competency checks: {ready.missingCompetencies.join(", ")}.</p>}
    {ready.needsIndependentTask && <p>Add an independent task with a review rubric.</p>}
    <button type="button" disabled={!ready.ready} style={ghostBtn()} onClick={() => setOpen(true)}>Publish reviewed {DEPTH_LABEL[depth]} journey</button>
    {open && <ActionModal title={`Publish ${DEPTH_LABEL[depth]} journey`} description="Publish the approved competencies and blocks together. Required structure and evidence mappings are checked again before saving." confirmLabel="Publish reviewed journey" busy={publish.isPending} errorNote={publish.error?.message} onClose={() => { if (!publish.isPending) setOpen(false); }} onConfirm={(reason) => publish.mutate(reason)} />}
  </section>;
}
