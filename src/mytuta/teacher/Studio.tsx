import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useLayout } from "../layout";
import { studioSectionNames, studioBodies, studioAiActions } from "../data/constants";
import { generateStudioAssist } from "../data/ai";
import { useExperience, useExperienceSections, useClasses } from "../data/queries";
import { useSaveSection, useAssignExperience } from "../data/mutations";
import { trackAiContentInserted } from "@/lib/analytics";
import { useCreditGate } from "../credits/CreditGate";

export default function Studio() {
  const L = useLayout();
  const nav = useNavigate();
  const { experienceId } = useParams();
  const { data: exp, isLoading } = useExperience(experienceId);
  const { data: sections } = useExperienceSections(experienceId);
  const { data: classes } = useClasses();
  const saveSection = useSaveSection();
  const gate = useCreditGate();
  const assignExp = useAssignExperience();

  const [section, setSection] = useState(0);
  const [aiAction, setAiAction] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const sectionName = studioSectionNames[section] || "Overview";
  const saved_ = sections?.[section];
  const templateBody = (studioBodies[sectionName] || "").split("{t}").join((exp?.title || "this topic").toLowerCase());
  const body = saved_?.body || templateBody;
  const sectionInserts = saved_?.ai_blocks || [];

  useEffect(() => {
    setAiAction("");
    setAiPreview("");
  }, [section]);

  if (isLoading) return <Loading label="Opening the studio…" />;
  if (!exp) return <EmptyState title="Experience not found" body="This experience may have been removed." actionLabel="Back to experiences" onAction={() => nav("/teacher/experiences")} />;

  const status = assignedTo ? `Assigned · ${assignedTo}` : saved ? "Saved draft" : "Draft, not assigned";
  const statusOn = !!assignedTo || saved;

  const pickAi = async (action: string, regenerate = false) => {
    await gate.run({
      actionKey: "studio_assist",
      title: regenerate ? "Regenerate this?" : `AI assistant: ${action}?`,
      description: "mytuta writes a block you can edit before inserting into this section.",
      action: async () => {
        setAiAction(action);
        if (!regenerate) setAiPreview("");
        setAiBusy(true);
        try {
          const text = await generateStudioAssist({ action, topic: exp.title, sectionName, sectionBody: body, regenerate });
          setAiPreview(text);
        } catch (e) {
          if (!regenerate) setAiAction("");
          throw e; // let the gate refund
        } finally {
          setAiBusy(false);
        }
      },
    });
  };

  const insertAi = () => {
    if (!aiAction || !aiPreview) return;
    const next = [...sectionInserts, { action: aiAction, text: aiPreview }];
    saveSection.mutate({ experienceId: exp.id, ord: section, name: sectionName, body, aiBlocks: next });
    trackAiContentInserted(aiAction);
    setAiAction("");
    setAiPreview("");
    setSaved(true);
  };
  const removeInsert = (idx: number) => {
    const next = sectionInserts.filter((_, i) => i !== idx);
    saveSection.mutate({ experienceId: exp.id, ord: section, name: sectionName, body, aiBlocks: next });
  };
  const doSave = () => { saveSection.mutate({ experienceId: exp.id, ord: section, name: sectionName, body, aiBlocks: sectionInserts }); setSaved(true); };
  const assign = (name: string, id: string) => { assignExp.mutate({ experienceId: exp.id, classId: id }); setAssignedTo(name); setAssignOpen(false); setSaved(true); };

  return (
    <div style={{ display: "flex", flexDirection: L.mobile ? "column" : "row", height: "100%", animation: "fadein .3s ease" }}>
      {!L.mobile && (
        <div style={{ width: 210, flex: "none", borderRight: `1px solid ${c.border2}`, background: c.surface, padding: "22px 14px", overflowY: "auto" }}>
          <button type="button" onClick={() => nav("/teacher/experiences")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Experiences</button>
          <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{exp.title}</div>
          <div style={{ fontSize: 12, color: c.faint, marginBottom: 18 }}>{exp.form}</div>
          {studioSectionNames.map((label, i) => {
            const on = section === i;
            return (
              <button key={label} type="button" onClick={() => setSection(i)} style={{ width: "100%", textAlign: "left", background: on ? c.greenTint : "transparent", border: `1px solid ${on ? c.greenTintBorder : "transparent"}`, borderRadius: 10, padding: "9px 11px", marginBottom: 2, fontSize: 13, fontWeight: on ? 600 : 500, color: on ? c.greenDark : c.soft, cursor: "pointer" }}>{label}</button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {L.mobile && (
          <div style={{ background: c.surface, borderBottom: `1px solid ${c.border2}`, padding: "12px 16px 10px" }}>
            <button type="button" onClick={() => nav("/teacher/experiences")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8 }}>← Experiences</button>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{exp.title}</div>
            <div style={{ fontSize: 12, color: c.faint, marginBottom: 10 }}>{exp.form}</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
              {studioSectionNames.map((label, i) => {
                const on = section === i;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSection(i)}
                    style={{
                      flex: "none", whiteSpace: "nowrap",
                      background: on ? c.greenTint : c.paper,
                      border: `1px solid ${on ? c.greenTintBorder : c.border2}`,
                      borderRadius: 20, padding: "8px 14px",
                      fontSize: 12.5, fontWeight: on ? 600 : 500,
                      color: on ? c.greenDark : c.soft, cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: L.pad }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: L.mobile ? 22 : 24 }}>{sectionName}</h1>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, color: statusOn ? c.greenDark : c.faint, background: statusOn ? c.greenTint : c.paper, border: `1px solid ${statusOn ? c.greenTintBorder : c.border2}` }}>{status}</span>
          </div>

          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: L.mobile ? 18 : 24, marginBottom: 18 }}>
            <div style={{ fontSize: 14.5, lineHeight: 1.7, color: c.body }}>{body}</div>
            {sectionInserts.map((b, i) => (
              <div key={i} style={{ marginTop: 16, borderTop: `1px dashed ${c.border}`, paddingTop: 15, animation: "fadeup .2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".04em", textTransform: "uppercase" }}>✦ {b.action}</span>
                  <button type="button" onClick={() => removeInsert(i)} style={{ background: "none", border: "none", color: "#b0a894", fontSize: 12, cursor: "pointer" }}>Remove</button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: c.body }}>{b.text}</div>
              </div>
            ))}
          </div>

          <div style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>AI assistant</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {studioAiActions.map((a) => {
                const on = aiAction === a;
                return (
                  <button key={a} type="button" disabled={aiBusy} onClick={() => pickAi(a)} style={{ background: on ? c.plum : "#fff", border: `1px solid ${on ? c.plum : c.plumBorder}`, color: on ? "#fff" : "#544390", fontWeight: 600, fontSize: 12.5, padding: "8px 13px", borderRadius: 9, cursor: "pointer", opacity: aiBusy && !on ? 0.6 : 1 }}>{a}</button>
                );
              })}
            </div>
            {(aiAction || aiBusy) && (
              <div style={{ marginTop: 14, background: "#fff", border: `1px solid ${c.plumBorder}`, borderRadius: 12, padding: "16px 17px", animation: "fadeup .2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: c.plum, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✦</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.plum }}>{aiAction || "Assistant"}</span>
                </div>
                {aiBusy ? (
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: c.body, marginBottom: 14 }}>Writing for your class…</div>
                ) : (
                  <textarea
                    value={aiPreview}
                    onChange={(e) => setAiPreview(e.target.value)}
                    rows={5}
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.plumBorder}`, borderRadius: 9, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.6, color: c.body, background: "#fdfcfe", outline: "none", fontFamily: "inherit", marginBottom: 14 }}
                  />
                )}
                {!aiBusy && aiPreview && (
                  <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                    <button type="button" onClick={insertAi} style={{ background: c.plum, color: "#fff", border: "none", fontWeight: 600, fontSize: 12.5, padding: "8px 15px", borderRadius: 9, cursor: "pointer" }}>Insert into section</button>
                    <button type="button" onClick={() => void pickAi(aiAction, true)} style={{ background: "none", border: `1px solid ${c.plumBorder}`, color: "#544390", fontWeight: 600, fontSize: 12.5, padding: "8px 15px", borderRadius: 9, cursor: "pointer" }}>Regenerate</button>
                    <button type="button" onClick={() => { setAiAction(""); setAiPreview(""); }} style={{ background: "none", border: `1px solid ${c.plumBorder}`, color: "#544390", fontWeight: 600, fontSize: 12.5, padding: "8px 15px", borderRadius: 9, cursor: "pointer" }}>Dismiss</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <button type="button" onClick={doSave} style={{ background: saved ? c.greenDark : c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer" }}>{saved ? "✓ Saved" : "Save experience"}</button>
            <button type="button" onClick={() => setAssignOpen(!assignOpen)} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 11, cursor: "pointer" }}>Assign to a class</button>
          </div>
          {assignOpen && (
            <div style={{ marginTop: 14, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: "16px 18px", animation: "fadeup .2s ease" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Choose a class to assign to</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(classes || []).length === 0 && <div style={{ fontSize: 13, color: c.muted }}>Create a class first, or finish onboarding so starter classes appear.</div>}
                {(classes || []).map((cl) => (
                  <button key={cl.id} type="button" onClick={() => assign(cl.name, cl.id)} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${c.border2}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer" }}>
                    <span style={{ width: 32, height: 32, flex: "none", borderRadius: 8, background: cl.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{cl.mark}</span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{cl.name}</span>
                    <span style={{ fontSize: 12, color: c.faint }}>{cl.students} students</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
