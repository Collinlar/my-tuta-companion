import { useEffect, useState } from "react";
import { MathText } from "../MathText";
import type { BlockContent } from "../data/blocks";
import type { BlockProgress } from "../data/blockRuntime";

export default function ReviewedBlockTask({ task, response, onSubmit, onContinue }: {
  task: NonNullable<BlockContent["task"]>; response?: BlockProgress["response"];
  onSubmit: (text: string) => Promise<unknown>; onContinue: () => void;
}) {
  const [text, setText] = useState(response?.text || "");
  const [pending, setPending] = useState(response?.status === "pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (response) { setPending(response.status === "pending"); setText(response.text); } }, [response?.id, response?.status]);
  return <section>
    <h3>Demonstrate your understanding</h3><MathText text={task.prompt} />
    <p>Your response will be reviewed against these criteria:</p>
    <ul>{task.rubric.map((criterion, i) => <li key={i}><MathText text={criterion} /></li>)}</ul>
    {response?.feedback && <p><strong>Reviewer feedback: </strong>{response.feedback}</p>}
    {response?.status === "passed" ? <p role="status">This response has passed review.</p> : <>
      <label>Your response<textarea aria-label="Your task response" rows={7} value={text} maxLength={20000} onChange={(event) => setText(event.target.value)} style={{ width: "100%" }} /></label>
      <button type="button" disabled={busy || text.trim().length < 20} onClick={async () => {
        setBusy(true); setError(null);
        try { await onSubmit(text); setPending(true); }
        catch { setError("Your response could not be submitted. Please try again."); }
        finally { setBusy(false); }
      }}>{busy ? "Submitting…" : pending ? "Update submitted response" : "Submit for review"}</button>
      {pending && <p role="status">Awaiting review. Submission alone does not secure this competency.</p>}
    </>}
    {(pending || response?.status === "passed") && <button type="button" onClick={onContinue}>Continue to the next block</button>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
