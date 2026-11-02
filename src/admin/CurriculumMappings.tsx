import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminConceptCompetencies } from "./data/queries";
import { curriculumMappingSchema, type CurriculumMapping } from "../mytuta/data/curriculum";
import { card, input, primaryBtn, ghostBtn } from "./theme";

const empty = { competency_id: "", framework: "", framework_version: "", grade: "", standard_code: "", standard_description: "", source_url: "", review_status: "draft" as const };
export default function CurriculumMappings({ conceptId }: { conceptId: string }) {
  const cache = useQueryClient();
  const key = ["curriculum_mappings", conceptId];
  const competencies = useAdminConceptCompetencies(conceptId);
  const [form, setForm] = useState<CurriculumMapping | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const rows = useQuery({ queryKey: key, queryFn: async () => {
    const { data, error } = await supabase.rpc("concept_curriculum_mappings", { p_concept_id: conceptId });
    if (error) throw error;
    return data as unknown as CurriculumMapping[];
  } });
  const save = useMutation({ mutationFn: async () => {
    const value = curriculumMappingSchema.parse(form);
    const { error } = await supabase.rpc("admin_save_curriculum_mapping", { p_mapping: value });
    if (error) throw error;
  }, onSuccess: async () => { await cache.invalidateQueries({ queryKey: key }); setForm(null); setError(null); }, onError: () => setError("Could not save. Check required fields, source URL and duplicate standard codes.") });
  const remove = useMutation({ mutationFn: async (id: string) => {
    const { error } = await supabase.rpc("admin_delete_curriculum_mapping", { p_id: id });
    if (error) throw error;
  }, onSuccess: async () => { await cache.invalidateQueries({ queryKey: key }); setDeleting(null); }, onError: () => setError("Could not remove this mapping. Please retry.") });
  return <section style={{ ...card, padding: 20 }}>
    <h2>Curriculum mappings</h2><p>Link competencies to a specific curriculum version and source. Approval records a reviewed alignment.</p>
    <button disabled={save.isPending || remove.isPending} style={primaryBtn()} onClick={() => { setForm({ ...empty }); setError(null); }}>Add mapping</button>
    {(rows.isLoading || competencies.isLoading) && <p role="status">Loading mappings…</p>}
    {(rows.error || competencies.error) && <p role="alert">Mappings could not load. <button onClick={() => { void rows.refetch(); void competencies.refetch(); }}>Retry</button></p>}
    {!rows.isLoading && !rows.error && !rows.data?.length && <p>No curriculum mappings have been authored for this concept.</p>}
    {rows.data?.map((row) => <article key={row.id} style={{ borderBottom: "1px solid #ddd", padding: "14px 0" }}>
      <strong>{row.framework} · {row.framework_version} · {row.grade} · {row.standard_code}</strong>
      <p>{row.depth} / {row.competency_key} · {row.review_status}</p><p>{row.standard_description}</p>
      <a href={row.source_url} target="_blank" rel="noopener noreferrer">Curriculum source</a>{" "}
      <button disabled={save.isPending || remove.isPending} style={ghostBtn()} onClick={() => { setForm(row); setError(null); }}>Edit</button>
      <button disabled={save.isPending || remove.isPending} style={ghostBtn()} onClick={() => setDeleting(row.id!)}>Remove</button>
      {deleting === row.id && <div>Remove this alignment? <button disabled={remove.isPending} onClick={() => remove.mutate(row.id!)}>Confirm removal</button><button onClick={() => setDeleting(null)}>Cancel</button></div>}
    </article>)}
    {form && <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} style={{ display: "grid", gap: 12, marginTop: 20 }}>
      <label>Competency<select required style={input} value={form.competency_id} onChange={(e) => setForm({ ...form, competency_id: e.target.value })}><option value="">Select competency</option>{competencies.data?.competencies.map((c) => <option key={c.id} value={c.id}>{c.depth} · {c.competency_key}: {c.description}</option>)}</select></label>
      {([ ["framework", "Curriculum / framework"], ["framework_version", "Edition / version"], ["grade", "Grade / year"], ["standard_code", "Standard code"], ["standard_description", "Standard description"], ["source_url", "Source URL (HTTPS)"] ] as const).map(([field, label]) => <label key={field}>{label}<input required style={input} type={field === "source_url" ? "url" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></label>)}
      <label>Review status<select style={input} value={form.review_status} onChange={(e) => setForm({ ...form, review_status: e.target.value as "draft" | "approved" })}><option value="draft">Draft</option><option value="approved">Approved alignment</option></select></label>
      <div><button type="submit" disabled={save.isPending} style={primaryBtn()}>{save.isPending ? "Saving…" : "Save mapping"}</button><button type="button" disabled={save.isPending} style={ghostBtn()} onClick={() => setForm(null)}>Cancel</button></div>
    </form>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
