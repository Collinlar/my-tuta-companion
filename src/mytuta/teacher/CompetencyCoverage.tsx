import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { c } from "../theme";
type Summary = { learners: number; classes: number; competencies: { id: string; concept_name: string; depth: string; description: string; demonstrated: number; learners: number }[] };
export default function CompetencyCoverage({ classId }: { classId: string | null }) {
  const summary = useQuery({ queryKey: ["teacher_competency_coverage", classId], queryFn: async () => {
    const { data, error } = await supabase.rpc("teacher_competency_coverage", { p_class_id: classId });
    if (error) throw error;
    return data as unknown as Summary;
  } });
  return <section style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
    <h2>Competency coverage</h2>
    <p>Current published competencies demonstrated with current-version block evidence. All enrolled learners count in the denominator; learners in multiple selected classes count once.</p>
    {summary.isLoading && <p role="status">Loading competency evidence…</p>}
    {summary.error && <p role="alert">Coverage could not load. <button onClick={() => void summary.refetch()}>Retry</button></p>}
    {summary.data && <><p>{summary.data.classes} classes · {summary.data.learners} distinct learners</p>
      {!summary.data.competencies.length ? <p>No published competencies are available yet.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left" }}><thead><tr>{["Concept", "Depth", "Competency", "Demonstrated"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{summary.data.competencies.map((row) => <tr key={row.id}><td>{row.concept_name}</td><td>{row.depth}</td><td>{row.description}</td><td>{row.demonstrated}/{row.learners}{row.learners ? ` (${Math.round(100 * row.demonstrated / row.learners)}%)` : ""}</td></tr>)}</tbody></table></div>}</>}
  </section>;
}
