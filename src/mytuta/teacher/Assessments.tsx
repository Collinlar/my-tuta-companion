import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { c, font, chip } from "../theme";
import { Loading } from "../ui";
import { useLayout, pageBox } from "../layout";
import { useToast } from "@/hooks/use-toast";
import { assessTypesData } from "../data/constants";
import { useAssessments, useClasses, useAssessmentQuestions } from "../data/queries";
import { useGenerateAssessment, useAssignAssessment, useUpdateAssessmentQuestion, useDeleteAssessmentQuestion } from "../data/mutations";
import { useCreditGate } from "../credits/CreditGate";

interface EditableQuestion { id: string; prompt: string; options: string[]; correctIndex: number; dimension: string }

type View = "list" | "build" | "created" | "result";

export default function Assessments() {
  const L = useLayout();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: assessments, isLoading } = useAssessments();
  const { data: classes } = useClasses();
  const generate = useGenerateAssessment();
  const gate = useCreditGate();
  const assign = useAssignAssessment();
  const updateQuestion = useUpdateAssessmentQuestion();
  const deleteQuestion = useDeleteAssessmentQuestion();

  const [view, setView] = useState<View>(searchParams.get("concept") ? "build" : "list");
  const [typeIdx, setTypeIdx] = useState(0);
  const [classIdx, setClassIdx] = useState(0);
  const [topic, setTopic] = useState(searchParams.get("concept") ?? "");
  const [rowId, setRowId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [items, setItems] = useState<EditableQuestion[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = useState(false);
  const seededFor = useRef<string | null>(null);

  const { data: questions } = useAssessmentQuestions(createdId || undefined);

  useEffect(() => {
    if (!questions || !createdId || seededFor.current === createdId) return;
    seededFor.current = createdId;
    setItems(questions.map((q) => ({ id: q.id, prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex, dimension: q.dimension })));
    setDirtyIds(new Set());
  }, [questions, createdId]);

  const editField = (id: string, patch: Partial<EditableQuestion>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const removeQuestion = async (id: string) => {
    if (!createdId) return;
    try {
      await deleteQuestion.mutateAsync({ id, assessmentId: createdId });
      setItems((prev) => prev.filter((it) => it.id !== id));
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not remove this question.";
      toast({ title: "Delete failed", description: msg, variant: "destructive" });
    }
  };

  const saveEdits = async () => {
    if (!createdId || dirtyIds.size === 0) return;
    setSavingAll(true);
    try {
      await Promise.all(
        items.filter((it) => dirtyIds.has(it.id)).map((it) =>
          updateQuestion.mutateAsync({ id: it.id, assessmentId: createdId, prompt: it.prompt, options: it.options, correctIndex: it.correctIndex }),
        ),
      );
      setDirtyIds(new Set());
      toast({ title: "Changes saved" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your changes just now.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSavingAll(false);
    }
  };

  if (isLoading) return <Loading label="Loading assessments…" />;
  const rows = assessments || [];
  const classList = classes || [];
  const buildType = assessTypesData[typeIdx];
  const buildClass = classList[classIdx];

  if (view === "list") {
    return (
      <div style={pageBox(L.pad, 1020)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <p style={{ fontSize: 14, color: c.muted }}>Build mastery checks, topic tests and examination-style papers. Exams live here as one way to prove mastery.</p>
          <button type="button" onClick={() => { setView("build"); setTypeIdx(0); setClassIdx(0); setTopic(""); setErr(""); }} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>＋ New assessment</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 12, marginBottom: 26 }}>
          {assessTypesData.map((a, i) => (
            <button type="button" key={a.title} onClick={() => { setTypeIdx(i); setClassIdx(0); setTopic(""); setErr(""); setView("build"); }} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 18, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: a.bg, color: a.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginBottom: 11 }}>{a.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>{a.body}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Recent assessments</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflowX: "auto" }}>
          <div style={{ minWidth: L.mobile ? 520 : undefined }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", fontSize: 11, fontWeight: 600, color: c.faint, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: `1px solid ${c.divider}` }}>
              <span>Assessment</span><span>Type</span><span>Class</span><span style={{ textAlign: "right" }}>Avg mastery</span>
            </div>
            {rows.length === 0 && <div style={{ padding: "16px 18px", fontSize: 13, color: c.muted }}>No assessments yet. Create your first one above.</div>}
            {rows.map((r) => (
              <button type="button" key={r.id} onClick={() => { setRowId(r.id); setView("result"); }} style={{ width: "100%", textAlign: "left", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", padding: "14px 18px", border: "none", borderBottom: `1px solid ${c.paper}`, background: c.surface, fontSize: 13.5, cursor: "pointer" }}>
                <span style={{ fontWeight: 500 }}>{r.title}</span>
                <span style={{ color: "#6b6456" }}>{r.type}</span>
                <span style={{ color: "#6b6456" }}>{r.klass}</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: r.color }}>{r.avg}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "build") {
    return (
      <div style={pageBox(L.pad, 680)}>
        <button type="button" onClick={() => setView("list")} style={backBtn}>← Assessments</button>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>New assessment</h1>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>Choose a type and a class. mytuta drafts the items; you review before assigning.</p>
        <div style={lbl}>Type</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {assessTypesData.map((a, i) => (
            <button type="button" key={a.title} onClick={() => setTypeIdx(i)} style={chip(typeIdx === i)}>{a.title}</button>
          ))}
        </div>
        <div style={lbl}>Class</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {classList.length === 0 && <span style={{ fontSize: 13, color: c.muted }}>Create a class first to assign this to.</span>}
          {classList.map((cl, i) => (
            <button type="button" key={cl.id} onClick={() => setClassIdx(i)} style={chip(classIdx === i)}>{cl.name}</button>
          ))}
        </div>
        <div style={lbl}>Focus topic (optional)</div>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Respiration, Linear equations — leave blank for mixed STEM revision"
          style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 11, padding: "13px 14px", fontSize: 15, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 22 }}
        />
        <div style={lbl}>Item mix — {buildType.title}</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
          {buildType.mix.map((m) => (
            <div key={m.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{m.label}</span>
                <span style={{ color: c.faint }}>{m.pct}%</span>
              </div>
              <div style={{ height: 7, background: c.track, borderRadius: 5, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", borderRadius: 5, background: c.green, width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {err && <p style={{ marginBottom: 16, fontSize: 13.5, color: "#c05a2e" }}>{err}</p>}
        <button
          type="button"
          disabled={generate.isPending || classList.length === 0}
          onClick={() => void gate.run({
            actionKey: "assessment_generate",
            title: "Generate this assessment?",
            description: "mytuta writes the items across your chosen mix. You review before assigning.",
            action: async () => {
              setErr("");
              try {
                const created = await generate.mutateAsync({ type: buildType.title, title: `${buildType.title}${buildClass ? " · " + buildClass.name : ""}`, classId: null, classLabel: buildClass?.name, itemMix: buildType.mix, topic });
                setCreatedId(created.id);
                setView("created");
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Could not draft this assessment just now.";
                setErr(msg);
                throw e; // let the gate refund
              }
            },
          })}
          style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", opacity: generate.isPending || classList.length === 0 ? 0.6 : 1 }}
        >{generate.isPending ? "Writing items…" : "Generate draft"}</button>
      </div>
    );
  }

  if (view === "created") {
    return (
      <div style={pageBox(L.pad, 680)}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Draft ready</div>
        <h1 style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 8 }}>{buildType.title}{buildClass ? ` · ${buildClass.name}` : ""}</h1>
        <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>mytuta has drafted {items.length} items in the mix you set. Edit the wording, the options, or which answer is correct, then assign it. Nothing is shared with {buildClass?.name || "a class"} until you do.</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
          <div style={lbl}>Items</div>
          {dirtyIds.size > 0 && (
            <button type="button" disabled={savingAll} onClick={saveEdits} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontWeight: 600, fontSize: 12.5, padding: "7px 14px", borderRadius: 9, cursor: "pointer", opacity: savingAll ? 0.6 : 1 }}>
              {savingAll ? "Saving…" : `Save changes (${dirtyIds.size})`}
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {items.length === 0 && <div style={{ fontSize: 13, color: c.muted, padding: "12px 0" }}>No items left. Go back and generate a new draft.</div>}
          {items.map((q, i) => (
            <div key={q.id} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: c.faint, marginTop: 10 }}>{i + 1}.</span>
                <textarea
                  value={q.prompt}
                  onChange={(e) => editField(q.id, { prompt: e.target.value })}
                  rows={2}
                  style={{ flex: 1, resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 9, padding: "8px 10px", fontSize: 13.5, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
                />
                {q.dimension && <span style={{ fontSize: 10.5, fontWeight: 600, color: c.green, background: c.greenTint, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", marginTop: 6 }}>{q.dimension}</span>}
                <button type="button" onClick={() => removeQuestion(q.id)} title="Remove this question" style={{ background: "none", border: "none", color: c.faint, fontSize: 15, cursor: "pointer", padding: "6px 2px", marginTop: 2 }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingLeft: 20 }}>
                {q.options.map((o, oi) => (
                  <div key={oi} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <button
                      type="button"
                      onClick={() => editField(q.id, { correctIndex: oi })}
                      title="Mark as the correct answer"
                      style={{ width: 17, height: 17, flex: "none", borderRadius: "50%", border: `2px solid ${oi === q.correctIndex ? c.green : c.border}`, background: oi === q.correctIndex ? c.green : "transparent", cursor: "pointer", padding: 0 }}
                    />
                    <input
                      value={o}
                      onChange={(e) => {
                        const opts = [...q.options];
                        opts[oi] = e.target.value;
                        editField(q.id, { options: opts });
                      }}
                      style={{ flex: 1, fontSize: 12.5, padding: "7px 10px", borderRadius: 8, border: `1px solid ${oi === q.correctIndex ? c.greenTintBorder : c.border2}`, background: oi === q.correctIndex ? c.greenTint : c.paper, color: oi === q.correctIndex ? c.greenDark : c.soft, fontWeight: oi === q.correctIndex ? 600 : 500, outline: "none", fontFamily: font.body }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {dirtyIds.size > 0 && <p style={{ fontSize: 12.5, color: c.amber, marginBottom: 12 }}>Save your changes before assigning.</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            disabled={assign.isPending || !buildClass || !createdId || dirtyIds.size > 0 || items.length === 0}
            onClick={async () => {
              if (!createdId || !buildClass) return;
              try {
                await assign.mutateAsync({ assessmentId: createdId, classId: buildClass.id });
                toast({ title: "Assigned", description: `${buildClass.name} can now take this assessment.` });
                setView("list");
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Could not assign this assessment.";
                toast({ title: "Assign failed", description: msg, variant: "destructive" });
              }
            }}
            style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer", opacity: assign.isPending || !buildClass || dirtyIds.size > 0 || items.length === 0 ? 0.6 : 1 }}
          >{assign.isPending ? "Assigning…" : `Assign to ${buildClass?.name || "a class"}`}</button>
          <button type="button" onClick={() => setView("list")} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Back to list</button>
        </div>
      </div>
    );
  }

  // result
  const row = rows.find((r) => r.id === rowId) || rows[0];
  if (!row) { setView("list"); return null; }
  return (
    <div style={pageBox(L.pad, 680)}>
      <button type="button" onClick={() => setView("list")} style={backBtn}>← Assessments</button>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>{row.title}</h1>
      <div style={{ fontSize: 13, color: c.faint, marginBottom: 22 }}>{row.type} · {row.klass} · {row.submitted} of {row.total} submitted</div>
      <div style={lbl}>Mastery distribution</div>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "20px 22px", marginBottom: 22 }}>
        {row.dist.length === 0 && <div style={{ fontSize: 13, color: c.muted }}>No submissions yet. Assign this to a class to gather results.</div>}
        {row.dist.map((d) => {
          const pct = row.submitted ? Math.round((d.v / row.submitted) * 100) : 0;
          return (
            <div key={d.l} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{d.l}</span>
                <span style={{ color: c.faint }}>{d.v} students · {pct}%</span>
              </div>
              <div style={{ height: 8, background: c.track, borderRadius: 5, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", borderRadius: 5, background: d.c, width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {(() => {
        const struggling = row.dist.find((d) => d.l === "Beginning" || d.l === "Developing");
        const strongBand = row.dist.find((d) => d.l === "Mastered" || d.l === "Secure");
        const noSubmissions = row.submitted === 0;
        const mostStruggling = row.dist.reduce((best, d) => (d.v > (best?.v ?? 0) ? d : best), row.dist[0]);
        let nextStepText = "";
        if (noSubmissions) {
          nextStepText = "No submissions yet. Once students complete this assessment, results will show here.";
        } else if (struggling && struggling.v > 0) {
          const pct = Math.round((struggling.v / row.submitted) * 100);
          nextStepText = `${struggling.v} student${struggling.v === 1 ? "" : "s"} (${pct}%) are at ${struggling.l}. A focused support activity on the same concept would move most of them up a band.`;
        } else if (strongBand && strongBand.v === row.submitted) {
          nextStepText = "All students reached Secure or Mastered. Consider an extension challenge to push understanding further.";
        } else if (mostStruggling) {
          nextStepText = `Most students landed at ${mostStruggling.l}. Review the items with the lowest correct rate and consider a short reteach before the next assessment.`;
        }
        const btnLabel = (!struggling || struggling.v === 0) ? "Create extension activity" : "Create support activity";
        return (
          <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 9 }}>Next step</div>
            <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.55, marginBottom: 14 }}>{nextStepText}</div>
            {!noSubmissions && (
              <button type="button" onClick={() => nav(`/teacher/experiences/new?concept=${encodeURIComponent(row.title)}`)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>{btnLabel}</button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

const backBtn = { background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 } as const;
const lbl = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 } as const;
