import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface BlockStats { id: string; title: string; depth: string; version: number; learners: number; understood: number; needs_review: number; time_seconds: number; modalities: { modality: string; attempts: number; passed: number }[] }
export default function BlockAnalytics({ conceptId }: { conceptId: string }) {
  const query = useQuery({ queryKey: ["block_analytics", conceptId], queryFn: async () => {
    const { data, error } = await supabase.rpc("block_learning_analytics", { p_concept_id: conceptId });
    if (error) throw error;
    return data as unknown as BlockStats[];
  } });
  return <section><h3>Knowledge Block outcomes</h3><p>Observed check outcomes and support use, grouped by the current content version.</p>
    {query.isLoading ? <p>Loading block analytics…</p> : query.error ? <p role="alert">Block analytics could not load.</p>
      : <div style={{ overflowX: "auto" }}><table><thead><tr>{["Block", "Depth", "Learners", "Understood", "Needs review", "Visible time", "Support outcomes"].map((label) => <th key={label} style={{ padding: 8, textAlign: "left" }}>{label}</th>)}</tr></thead>
        <tbody>{query.data?.map((block) => <tr key={block.id}><td>{block.title} (v{block.version})</td><td>{block.depth}</td><td>{block.learners}</td><td>{block.understood}</td><td>{block.needs_review}</td><td>{Math.round(block.time_seconds/60)} min</td><td>{block.modalities.map((mode) => `${mode.modality}: ${mode.passed}/${mode.attempts} passed`).join("; ") || "No attempts yet"}</td></tr>)}</tbody></table></div>}
  </section>;
}
