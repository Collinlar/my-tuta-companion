import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { blockContentSchema } from "@/mytuta/data/blockValidation";
import type { KnowledgeBlock } from "@/mytuta/data/blocks";
import { MathText } from "@/mytuta/MathText";
import KnowledgeBlockVisual from "@/mytuta/student/KnowledgeBlockVisual";
import { ActionModal } from "./ui";
import { input, ghostBtn } from "./theme";
import { generateBlockMedia } from "@/mytuta/data/ai";

export default function KnowledgeBlockEditor({ block }: { block: KnowledgeBlock }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(block.title);
  const [objective, setObjective] = useState(block.objective || "");
  const [required, setRequired] = useState(block.required);
  const [status, setStatus] = useState(block.review_status);
  const [json, setJson] = useState(JSON.stringify(block.content, null, 2));
  const qc = useQueryClient();
  let preview: ReturnType<typeof blockContentSchema.parse> | null = null;
  try { preview = blockContentSchema.parse(JSON.parse(json)); } catch { /* shown on save */ }
  const media = useMutation({ mutationFn: async () => generateBlockMedia(title, blockContentSchema.parse(JSON.parse(json))),
    onSuccess: (draft) => { setJson((current) => JSON.stringify({ ...JSON.parse(current), ...draft }, null, 2)); setStatus("draft"); },
  });
  const save = useMutation({
    mutationFn: async (reason: string) => {
      if (!title.trim()) throw new Error("A title is required");
      const content = blockContentSchema.parse(JSON.parse(json));
      const { error } = await supabase.rpc("admin_update_knowledge_block", {
        p_id: block.id, p_title: title.trim(), p_objective: objective.trim(),
        p_required: required, p_content: content, p_review_status: status, p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["knowledge_blocks"] });
      await qc.invalidateQueries({ queryKey: ["block_evidence"] });
      await qc.invalidateQueries({ queryKey: ["block_prerequisites"] });
      await qc.invalidateQueries({ queryKey: ["admin", "audit"] });
      setOpen(false);
    },
  });
  return <>
    <button type="button" style={ghostBtn()} onClick={() => {
      setTitle(block.title); setObjective(block.objective || ""); setRequired(block.required);
      setStatus(block.review_status); setJson(JSON.stringify(block.content, null, 2)); save.reset(); media.reset(); setOpen(true);
    }}>Review / edit</button>
    {open && <ActionModal title="Review Knowledge Block" confirmLabel="Save block" busy={save.isPending || media.isPending}
      onClose={() => { if (!save.isPending && !media.isPending) setOpen(false); }}
      onConfirm={(reason) => { save.mutate(reason); }} errorNote={save.error?.message}
      extra={<div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <label>Title<input disabled={media.isPending} aria-label="Block title" style={input} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Objective<input aria-label="Block objective" style={input} value={objective} onChange={(e) => setObjective(e.target.value)} /></label>
        <label><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Required</label>
        <label>Review status<select aria-label="Block review status" style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          {(block.review_status === "published" ? ["draft", "approved", "published"] : ["draft", "approved"]).map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <p>Use competencyKeys to link checks to the competency slugs above. Prerequisites accept kind (concept, skill, formula or representation), key, label and optional refresher. Concept keys are concept IDs.</p>
        <label>Teaching content, support modes and check (JSON)<textarea disabled={media.isPending} aria-label="Block content" rows={12} style={{ ...input, fontFamily: "monospace" }} value={json} onChange={(e) => setJson(e.target.value)} /></label>
        <button type="button" style={ghostBtn()} disabled={!preview || media.isPending || save.isPending} onClick={() => media.mutate()}>{media.isPending ? "Drafting media support…" : "Draft narration and diagram guidance"}</button>
        <p>Generated support stays in this editor until saved and requires academic review. Audio uses the learner's browser voice; diagram choices use the supported visual catalogue.</p>
        {media.error && <p role="alert">Media support could not be generated. Your current content is preserved; please retry.</p>}
        {preview && <div style={{ padding: 12 }}><strong>Preview</strong><MathText text={preview.body} />
          <KnowledgeBlockVisual visual={preview.visual} />
          {preview.visualCaption && <MathText text={preview.visualCaption} />}
          {preview.interactionPrompt && <MathText text={preview.interactionPrompt} />}
          {preview.narration && <div><strong>Audio script</strong><MathText text={preview.narration} /></div>}
          {preview.modes?.map((mode) => <div key={mode.label}><strong>{mode.label}</strong><MathText text={mode.text} /></div>)}
          {preview.quickCheck && <div><strong>Quick check</strong><MathText text={preview.quickCheck.prompt} />
            {preview.quickCheck.options.map((option, i) => <div key={i}>{i === preview.quickCheck!.correctIndex ? "✓ " : ""}<MathText text={option} /></div>)}
            <MathText text={preview.quickCheck.explanation} /></div>}
        </div>}
      </div>} />}
  </>;
}
