import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, chip } from "../theme";
import { createSteps, createReview, studioSectionNames, studioBodies } from "../data/constants";
import { generateExperienceDraft } from "../data/ai";
import { useCreateExperience, useUploadIntakeFile } from "../data/mutations";
import type { UploadedIntakeFile } from "../data/mutations";
import { useCreditGate } from "../credits/CreditGate";
import { useToast } from "@/hooks/use-toast";

const fieldKeys = ["subject", "concept", "stage", "objective"] as const;
const MATERIAL_STEP = 1;

export default function Create() {
  const nav = useNavigate();
  const create = useCreateExperience();
  const uploadFile = useUploadIntakeFile();
  const gate = useCreditGate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<number, Set<number>>>({});
  const [fields, setFields] = useState({
    subject: "",
    concept: "",
    stage: "",
    objective: "",
  });
  const [attachment, setAttachment] = useState<UploadedIntakeFile | null>(null);
  const [pastedContent, setPastedContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const cs = createSteps[Math.min(step, 4)];

  const toggle = (opt: number) => {
    setSelected((prev) => {
      const set = new Set(prev[step] || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      return { ...prev, [step]: set };
    });
  };
  const isOn = (opt: number) => selected[step]?.has(opt) ?? false;

  const selectedLabels = (stepIndex: number) => {
    const opts = createSteps[stepIndex]?.options || [];
    return Array.from(selected[stepIndex] || []).map((i) => opts[i]).filter(Boolean);
  };

  const materialLabels = selectedLabels(MATERIAL_STEP);
  const wantsUpload = materialLabels.includes("Upload notes") || materialLabels.includes("Upload textbook extract");
  const wantsPaste = materialLabels.includes("Paste content");

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "File too large", description: "Keep attachments under 8MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      setAttachment(uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not upload that file just now.";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const next = async () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    await gate.run({
      actionKey: "experience_create",
      title: "Create this Learning Experience?",
      description: "mytuta drafts every section you can then edit in the studio.",
      action: () => runGeneration(),
    });
  };

  const runGeneration = async () => {
    setBusy(true);
    setErr("");
    try {
      const materialNote = attachment
        ? `${materialLabels.join(", ") || "Upload notes"} (attached: ${attachment.name})`
        : materialLabels.length
          ? materialLabels.join(", ")
          : undefined;
      const draft = await generateExperienceDraft({
        subject: fields.subject,
        concept: fields.concept,
        stage: fields.stage,
        objective: fields.objective,
        components: selectedLabels(2),
        constraints: selectedLabels(3),
        materialNote,
        pastedContent: wantsPaste ? pastedContent : undefined,
      });
      // Align AI output to studio section order so the editor and DB stay in sync.
      const topic = (draft.title || fields.concept).toLowerCase();
      const sections = studioSectionNames.map((name, i) => {
        const match =
          draft.sections.find((s) => s.name.toLowerCase() === name.toLowerCase()) ||
          draft.sections[i];
        const fallback = (studioBodies[name] || "").split("{t}").join(topic);
        return { name, body: match?.body?.trim() || fallback };
      });
      const exp = await create.mutateAsync({
        title: draft.title,
        subject: draft.subject,
        form: draft.form,
        stages_count: sections.length,
        sections,
      });
      toast({ title: "Draft ready", description: `Open the studio to refine ${draft.title}.` });
      nav(`/teacher/experiences/${exp.id}/edit`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "We could not draft this experience just now.";
      setErr(msg);
      throw e; // let the credit gate refund
    } finally {
      setBusy(false);
    }
  };
  const back = () => { if (step <= 0) { nav("/teacher/experiences"); return; } setStep(step - 1); };

  const pending = busy || create.isPending;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "38px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
        <h1 style={{ fontSize: 24 }}>Create a learning experience</h1>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: c.faint, fontWeight: 600 }}>Step {step + 1} of 5</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? c.green : "#eae3d4" }} />
        ))}
      </div>
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: "32px 30px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 9 }}>{cs.kicker}</div>
        <h2 style={{ fontSize: 23, marginBottom: 8 }}>{cs.title}</h2>
        <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>{cs.sub}</p>

        {cs.kind === "chips" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {cs.options!.map((o, i) => (
              <button key={o} type="button" onClick={() => toggle(i)} style={chip(isOn(i))}>{o}</button>
            ))}
          </div>
        )}
        {step === MATERIAL_STEP && wantsUpload && (
          <div style={{ marginTop: 16 }}>
            {attachment ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 12, padding: "10px 14px" }}>
                <span style={{ flex: 1, fontSize: 13.5, color: c.greenDark, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} style={{ background: "none", border: "none", color: c.greenDark, fontSize: 13, cursor: "pointer", padding: 0 }}>Remove</button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadFile.isPending}
                onClick={() => fileRef.current?.click()}
                style={{ width: "100%", background: c.paper, border: `1px dashed ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13.5, padding: "14px 16px", borderRadius: 12, cursor: "pointer", opacity: uploadFile.isPending ? 0.7 : 1 }}
              >
                {uploadFile.isPending ? "Uploading…" : "Attach a file"}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => void onPickFile(e)} style={{ display: "none" }} />
          </div>
        )}
        {step === MATERIAL_STEP && wantsPaste && (
          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste your notes or textbook content here…"
            rows={6}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", marginTop: 16, border: `1px solid ${c.border}`, borderRadius: 11, padding: "13px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: "inherit" }}
          />
        )}
        {cs.kind === "fields" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cs.fields!.map((f, i) => {
              const key = fieldKeys[i];
              return (
                <label key={f.label} style={{ display: "block" }}>
                  <div style={{ fontSize: 12, color: c.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>{f.label}</div>
                  <input
                    value={fields[key]}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: `1px solid ${c.border}`, borderRadius: 11,
                      padding: "13px 14px", fontSize: 16, color: c.ink, background: "#fff",
                      minHeight: 44, outline: "none",
                    }}
                  />
                </label>
              );
            })}
          </div>
        )}
        {cs.kind === "review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 6 }}>
              Drafting <strong style={{ color: c.ink }}>{fields.concept}</strong> for {fields.stage}. mytuta will write section bodies you can edit in the studio.
            </div>
            {createReview.map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: c.paper, border: `1px solid ${c.border2}`, borderRadius: 12 }}>
                <span style={{ width: 26, height: 26, flex: "none", borderRadius: 7, background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{r.n}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: c.faint }}>{r.detail}</span>
              </div>
            ))}
          </div>
        )}
        {err && <p style={{ marginTop: 16, fontSize: 13.5, color: "#c05a2e" }}>{err}</p>}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        <button type="button" onClick={back} disabled={pending} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "13px 22px", borderRadius: 12, cursor: "pointer" }}>Back</button>
        <button type="button" onClick={next} disabled={pending} style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, cursor: "pointer", opacity: pending ? 0.7 : 1 }}>
          {step >= 4 ? (pending ? "Drafting your experience…" : "Generate draft") : "Continue"}
        </button>
      </div>
    </div>
  );
}
