import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface BlockSummary { id: string; title: string; depth: string; concept_name: string; learners: number; understood: number; needs_review: number; support_requests: number }
export default function BlockLearningSummary({ classId }: { classId: string | null }) {
  const query = useQuery({ queryKey: ["teacher_block_summary", classId], queryFn: async () => {
    const { data, error } = await supabase.rpc("teacher_block_learning_summary", { p_class_id: classId });
    if (error) throw error;
    return data as unknown as BlockSummary[];
  } });
  return <section style={{ margin: "20px 0", padding: 20, border: "1px solid #d9ded4", borderRadius: 14 }}>
    <h3>Knowledge Blocks needing attention</h3>
    {query.isLoading ? <p>Loading block understanding…</p> : query.error ? <p role="alert">Block understanding could not load.</p>
      : !query.data?.length ? <p>Your learners have not started any Knowledge Blocks yet.</p>
      : <div style={{ overflowX: "auto" }}><table><thead><tr>{["Concept / block", "Depth", "Learners", "Understood", "Needs review", "Support requested"].map((label) => <th key={label} style={{ textAlign: "left", padding: 8 }}>{label}</th>)}</tr></thead>
        <tbody>{query.data.map((row) => <tr key={row.id}><td>{row.concept_name}: {row.title}</td><td>{row.depth}</td><td>{row.learners}</td><td>{row.understood}</td><td>{row.needs_review}</td><td>{row.support_requests}</td></tr>)}</tbody></table></div>}
  </section>;
}
