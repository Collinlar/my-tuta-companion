import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MathText } from "../MathText";

interface Submission { id: string; user_id: string; learner_name?: string; title: string; depth: string; concept_name: string; response: string; task: { prompt: string; rubric: string[] } }
export default function BlockReviewQueue({ conceptId }: { conceptId?: string }) {
  const cache = useQueryClient();
  const query = useQuery({ queryKey: ["block_review_queue", conceptId], queryFn: async () => {
    const { data, error } = await supabase.rpc("block_review_queue", { p_concept_id: conceptId || null });
    if (error) throw error;
    return data as unknown as Submission[];
  } });
  return <section style={{ padding: 20, border: "1px solid #d9ded4", borderRadius: 14, margin: "20px 0" }}>
    <h3>Competency responses awaiting review</h3>
    {query.isLoading ? <p>Loading responses…</p> : query.error ? <p role="alert">Responses could not load.</p>
      : !query.data?.length ? <p>No responses are awaiting your review.</p> : query.data.map((row) => <Response key={row.id} row={row} onSaved={async () => {
        await cache.invalidateQueries({ queryKey: ["block_review_queue"] });
        await cache.invalidateQueries({ queryKey: ["block_progress"] });
      }} />)}
  </section>;
}
function Response({ row, onSaved }: { row: Submission; onSaved: () => Promise<unknown> }) {
  const [feedback, setFeedback] = useState("");
  const review = useMutation({ mutationFn: async (passed: boolean) => {
    const { error } = await supabase.rpc("review_block_response", { p_response_id: row.id, p_passed: passed, p_feedback: feedback });
    if (error) throw error;
  }, onSuccess: onSaved });
  return <article style={{ borderTop: "1px solid #d9ded4", padding: "16px 0" }}>
    <h4>{row.concept_name} · {row.depth} · {row.title}</h4>
    <small>{row.learner_name || "Learner"} · reference {row.user_id}</small><p><MathText text={row.task.prompt} /></p>
    <ul>{row.task.rubric.map((criterion, index) => <li key={index}><MathText text={criterion} /></li>)}</ul>
    <div style={{ whiteSpace: "pre-wrap", padding: 12, background: "#f6f7f2" }}><MathText text={row.response} /></div>
    <label>Feedback<textarea aria-label={`Feedback for ${row.id}`} rows={3} value={feedback} onChange={(event) => setFeedback(event.target.value)} style={{ display: "block", width: "100%" }} /></label>
    <button type="button" disabled={review.isPending || feedback.trim().length < 3} onClick={() => review.mutate(true)}>Meets the criteria</button>
    <button type="button" disabled={review.isPending || feedback.trim().length < 3} onClick={() => review.mutate(false)}>Needs revision</button>
    {review.error && <p role="alert">The review could not be saved. {review.error.message}</p>}
  </article>;
}
