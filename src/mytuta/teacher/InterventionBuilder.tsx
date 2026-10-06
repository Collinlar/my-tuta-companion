import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { c, font } from "../theme";
import { useLayout, pageBox } from "../layout";
import { supabase } from "@/integrations/supabase/client";
import { generateInterventionDraft, type InterventionDraft } from "../data/ai";
import { useToast } from "@/hooks/use-toast";
import { useInterventionTemplates, useSaveAsTemplate } from "./data/interventionQueries";

const INTERVENTION_TYPES = [
  "prerequisite_review", "misconception_correction", "guided_practice",
  "support_version", "extension_version", "practical_application", "short_reassessment",
];

export default function InterventionBuilder() {
  const L = useLayout();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const conceptParam = params.get("concept") ?? "";
  const misconceptionParam = params.get("misconception") ?? "";
  const studentCountParam = parseInt(params.get("count") ?? "0", 10) || 0;

  const [concept, setConcept] = useState(conceptParam);
  const [misconceptionPattern, setMisconceptionPattern] = useState(misconceptionParam);
  const [studentCount, setStudentCount] = useState(studentCountParam);
  const [interventionType, setInterventionType] = useState("misconception_correction");
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState<InterventionDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const { data: templates } = useInterventionTemplates();
  const saveAsTemplate = useSaveAsTemplate();

  const canGenerate = concept.trim().length > 0 && misconceptionPattern.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const result = await generateInterventionDraft({ concept, misconceptionPattern, studentCount });
      setDraft(result);
      if (!title) setTitle(result.title);
      setInterventionType(result.intervention_type ?? "misconception_correction");
    } catch {
      toast({ title: "Could not generate a draft", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!draft || !title) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      let conceptId: string | null = null;
      if (concept) {
        const { data: conceptRow } = await supabase
          .from("concepts")
          .select("id")
          .ilike("name", concept)
          .maybeSingle();
        conceptId = conceptRow?.id ?? null;
      }

      const { data: insertedData, error } = await supabase.from("teacher_interventions").insert({
        teacher_id: user.id,
        concept_id: conceptId,
        intervention_type: interventionType,
        title,
        content: draft.content,
        ai_generated: true,
        status: "draft",
      }).select("id").single();

      if (error) throw error;
      setSavedId(insertedData?.id ?? null);
      toast({ title: "Intervention saved", description: "It is ready to assign to students." });
    } catch {
      toast({ title: "Could not save", description: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={pageBox(L.pad, 720)}>
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => nav("/teacher/insights")} style={{ background: "none", border: "none", color: c.faint, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 8 }}>Back to Insights</button>
        <div style={{ fontFamily: font.display, fontSize: 22, color: c.ink }}>Build an intervention</div>
        <div style={{ fontSize: 14, color: c.soft, marginTop: 4 }}>AI drafts a focused session to address a specific misconception. You review, edit, and assign.</div>
      </div>

      {/* Load from template */}
      {templates && templates.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button type="button" onClick={() => setShowTemplates(!showTemplates)}
            style={{ background: "none", border: `1px solid ${c.border2}`, color: c.soft, fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>
            {showTemplates ? "Hide templates" : `Load from template (${templates.length})`}
          </button>
          {showTemplates && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {templates.map((tmpl) => (
                <button key={tmpl.id} type="button"
                  onClick={() => {
                    setTitle(tmpl.title);
                    setInterventionType(tmpl.intervention_type);
                    setDraft({ title: tmpl.title, intervention_type: tmpl.intervention_type, content: tmpl.content as InterventionDraft["content"] });
                    setShowTemplates(false);
                  }}
                  style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: c.ink }}>{tmpl.title}</div>
                  <div style={{ fontSize: 12, color: c.faint, marginTop: 2 }}>{tmpl.intervention_type.replace(/_/g, " ")} · used {tmpl.use_count} {tmpl.use_count === 1 ? "time" : "times"}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6 }}>Concept</label>
            <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Which concept is causing trouble?" style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6 }}>Students affected</label>
            <input type="number" value={studentCount || ""} onChange={(e) => setStudentCount(parseInt(e.target.value, 10) || 0)} placeholder="How many students?" style={fieldStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6 }}>What misconception or error pattern?</label>
          <input value={misconceptionPattern} onChange={(e) => setMisconceptionPattern(e.target.value)} placeholder="Describe the error students keep making..." style={fieldStyle} />
        </div>
        <button type="button" onClick={handleGenerate} disabled={!canGenerate || generating}
          style={{ background: canGenerate ? c.green : c.border2, color: canGenerate ? "#fff" : c.faint, border: "none", fontWeight: 600, fontSize: 14, padding: "11px 22px", borderRadius: 10, cursor: canGenerate ? "pointer" : "default" }}>
          {generating ? "Writing draft..." : "Generate intervention draft"}
        </button>
        {generating && <div style={{ fontSize: 12.5, color: c.faint, marginTop: 10 }}>Writing a focused teaching sequence for {concept}...</div>}
      </div>

      {draft && (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>Review and edit draft</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6 }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6 }}>Type</label>
            <select value={interventionType} onChange={(e) => setInterventionType(e.target.value)} style={fieldStyle}>
              {INTERVENTION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          {(["opening", "explanation", "example", "follow_up"] as const).map((key) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.faint, display: "block", marginBottom: 6, textTransform: "capitalize" }}>{key.replace("_", " ")}</label>
              <textarea
                value={draft.content[key] ?? ""}
                onChange={(e) => setDraft((d) => d ? { ...d, content: { ...d.content, [key]: e.target.value } } : d)}
                rows={key === "explanation" ? 5 : 3}
                style={{ ...fieldStyle, resize: "vertical" as const, fontFamily: "inherit" }}
              />
            </div>
          ))}

          {savedId ? (
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#085041", background: "#E1F5EE", padding: "8px 14px", borderRadius: 9, fontWeight: 600 }}>Intervention saved</span>
              <button type="button"
                disabled={saveAsTemplate.isPending}
                onClick={() => void saveAsTemplate.mutateAsync(savedId).then(() => toast({ title: "Saved as template" }))}
                style={{ background: "none", border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>
                Save as template
              </button>
              <button type="button" onClick={() => nav("/teacher/interventions")}
                style={{ background: "none", border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 500, fontSize: 13, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>
                View all interventions
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="button" onClick={handleSave} disabled={saving}
                style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 24px", borderRadius: 11, cursor: "pointer" }}>
                {saving ? "Saving..." : "Save intervention"}
              </button>
              <button type="button" onClick={handleGenerate} disabled={generating}
                style={{ background: "none", border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 500, fontSize: 13, padding: "12px 18px", borderRadius: 11, cursor: "pointer" }}>
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 13px", fontSize: 14, borderRadius: 9,
  border: "1px solid #E5E7EB", background: "#FAFAFA",
  color: "#111827", outline: "none",
};
