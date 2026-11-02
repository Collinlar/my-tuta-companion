import { useState } from "react";
import { MathText } from "../MathText";
import type { Prerequisite } from "../data/blockRuntime";

export default function PrerequisiteRepair({ gap, onRepair }: { gap: Prerequisite; onRepair?: (answer: number) => Promise<boolean> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <section style={{ padding: 16, marginBottom: 12, border: "1px solid #d9ded4", borderRadius: 12 }}>
    <strong>{gap.label}</strong>{gap.refresher && <p><MathText text={gap.refresher} /></p>}
    {gap.kind === "concept" ? <a href={`/student/learn?concept=${encodeURIComponent(gap.key)}`}>Review this concept</a>
      : gap.check && onRepair ? <>
        <p><MathText text={gap.check.prompt} /></p>
        {gap.check.options.map((option, index) => <button key={index} type="button" disabled={busy || picked !== null} style={{ display: "block", margin: "8px 0", padding: 10 }} onClick={async () => {
          setBusy(true);
          try { const passed = await onRepair(index); setPicked(index); setMessage(passed ? "Prerequisite check passed. You can return to the example." : `Not quite. ${gap.check!.explanation}`); }
          catch { setMessage("The check could not be saved. Please try again."); }
          finally { setBusy(false); }
        }}><MathText text={option} /></button>)}
        {picked !== null && <button type="button" onClick={() => { setPicked(null); setMessage(""); }}>Try again</button>}
      </> : <p>Ask your teacher for practice in this prerequisite before attempting this example.</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
