import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { useLayout, pageBox } from "../layout";
import { Loading } from "../ui";
import {
  useTeacherInterventions,
  useInterventionFollowUps,
  useSaveAsTemplate,
  type InterventionRow,
} from "./data/interventionQueries";
import { useToast } from "@/hooks/use-toast";

const statusTone: Record<string, { text: string; bg: string }> = {
  draft:     { text: "#4B5563", bg: "#F3F4F6" },
  assigned:  { text: "#185FA5", bg: "#E6F1FB" },
  completed: { text: "#085041", bg: "#E1F5EE" },
  ignored:   { text: "#9CA3AF", bg: "#F9FAFB" },
};

function FollowUpStats({ interventionId }: { interventionId: string }) {
  const { data: followUps } = useInterventionFollowUps(interventionId);
  if (!followUps?.length) return <span style={{ fontSize: 12, color: c.faint }}>No students assigned</span>;

  const completed = followUps.filter((f) => f.completed_at).length;
  const withImprovement = followUps.filter((f) => f.post_score != null && f.pre_score != null);
  const avgImprovement = withImprovement.length
    ? Math.round(withImprovement.reduce((s, f) => s + (f.post_score! - f.pre_score!), 0) / withImprovement.length)
    : null;

  return (
    <div style={{ display: "flex", gap: 16, fontSize: 12.5 }}>
      <span style={{ color: c.muted }}>{followUps.length} assigned</span>
      <span style={{ color: completed === followUps.length ? "#085041" : c.muted }}>
        {completed}/{followUps.length} completed
      </span>
      {avgImprovement != null && (
        <span style={{ color: avgImprovement >= 0 ? "#085041" : c.amber, fontWeight: 600 }}>
          {avgImprovement >= 0 ? "+" : ""}{avgImprovement}% avg improvement
        </span>
      )}
    </div>
  );
}

export default function InterventionList() {
  const L = useLayout();
  const nav = useNavigate();
  const { toast } = useToast();
  const { data: interventions, isLoading } = useTeacherInterventions();
  const saveAsTemplate = useSaveAsTemplate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSaveTemplate = async (id: string) => {
    try {
      await saveAsTemplate.mutateAsync(id);
      toast({ title: "Saved as template", description: "You can reuse this intervention from the builder." });
    } catch {
      toast({ title: "Could not save template", variant: "destructive" });
    }
  };

  return (
    <div style={pageBox(L.pad, 860)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 22, color: c.ink }}>Interventions</div>
          <div style={{ fontSize: 14, color: c.soft, marginTop: 3 }}>Track assignments, follow-up completion, and improvement.</div>
        </div>
        <button
          type="button"
          onClick={() => nav("/teacher/intervention/new")}
          style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 20px", borderRadius: 11, cursor: "pointer" }}>
          Build intervention
        </button>
      </div>

      {isLoading ? <Loading label="Loading interventions..." /> : (
        <>
          {(!interventions || interventions.length === 0) && (
            <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: c.muted, marginBottom: 14 }}>No interventions yet. Build one from Teacher Insights when you spot a misconception pattern.</div>
              <button type="button" onClick={() => nav("/teacher/insights")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Go to Insights</button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(interventions ?? []).map((item: InterventionRow) => {
              const tone = statusTone[item.status] ?? statusTone.draft;
              const isOpen = expandedId === item.id;
              return (
                <div key={item.id} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", fontFamily: font.body }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5, color: c.ink, flex: 1, minWidth: 0 }}>{item.title}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: tone.text, background: tone.bg, whiteSpace: "nowrap" }}>
                        {item.status}
                      </span>
                      <span style={{ fontSize: 12, color: c.faint, whiteSpace: "nowrap" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12.5, color: c.muted }}>
                      {item.intervention_type.replace(/_/g, " ")}
                      {item.ai_generated && <span style={{ marginLeft: 8, fontSize: 11, color: c.faint }}>(AI draft)</span>}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <FollowUpStats interventionId={item.id} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${c.border2}`, padding: "16px 20px", background: "#FAFAFA" }}>
                      {item.content?.explanation && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.faint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Explanation</div>
                          <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.6 }}>{String(item.content.explanation)}</div>
                        </div>
                      )}
                      {item.content?.follow_up && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.faint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Follow-up task</div>
                          <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.6 }}>{String(item.content.follow_up)}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        {item.status === "draft" && (
                          <button type="button"
                            onClick={() => nav(`/teacher/intervention/new?edit=${item.id}`)}
                            style={outlineBtn}>
                            Edit draft
                          </button>
                        )}
                        {!item.template_id && (
                          <button type="button"
                            disabled={saveAsTemplate.isPending}
                            onClick={() => void handleSaveTemplate(item.id)}
                            style={outlineBtn}>
                            Save as template
                          </button>
                        )}
                        {item.template_id && (
                          <span style={{ fontSize: 12, color: "#085041", background: "#E1F5EE", padding: "5px 11px", borderRadius: 8, fontWeight: 500 }}>Saved as template</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  background: "none", border: "1px solid #E5E7EB", color: "#4B5563",
  fontWeight: 600, fontSize: 12.5, padding: "7px 14px", borderRadius: 9, cursor: "pointer",
};
