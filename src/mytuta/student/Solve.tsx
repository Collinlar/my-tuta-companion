import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font, chip } from "../theme";
import { MathText } from "../MathText";
import { helpModes, solveInputs, type HelpModeKind } from "../data/constants";
import { generateSimilarQuestion } from "../data/ai";
import { trackSolveCompleted } from "@/lib/analytics";
import { groqApiService } from "@/services/groqApiService";
import { useToast } from "@/hooks/use-toast";
import { useConceptsCatalog, useMyClasses } from "../data/queries";
import {
  useLogSolveSession,
  useShareSolveWithTeacher,
  useUpdateSolveSession,
  useUploadIntakeFile,
  type SolveHelpMode,
} from "../data/mutations";
import type { UploadedIntakeFile } from "../data/mutations";
import { useCreditGate } from "../credits/CreditGate";
import { sanitizeLlmJson } from "../data/jsonRepair";
import { recordEvent, useSolveHistory, type SolveHistorySession } from "../intelligence/data";

type View = "input" | "coaching" | "response" | "solved" | "history";

type CoachStep = { q: string; hint: string; answer: string };

// The non-step modes (hint / explain / similar) render as a single response,
// not the step coach.
type SolveResponse =
  | { kind: "hint"; hint: string }
  | { kind: "concept"; explanation: string }
  | { kind: "similar"; questions: string[] };

// CTA + busy label per help mode.
const modeCta: Record<HelpModeKind, { label: string; busy: string }> = {
  hint: { label: "Get a hint", busy: "Thinking of a hint…" },
  steps: { label: "Start solving together", busy: "Preparing your coach…" },
  concept: { label: "Explain the concept", busy: "Writing an explanation…" },
  check: { label: "Check my working", busy: "Checking your working…" },
  similar: { label: "Create practice questions", busy: "Writing practice questions…" },
};

const placeholders: Record<string, string> = {
  Type: "Paste a question from class, homework, or a past paper…",
  Photograph: "Type out the question from your photo below…",
  "Upload image": "Type out the question from your image below…",
  "Paste from notes": "Paste the question text straight from your notes…",
};

export default function Solve() {
  const nav = useNavigate();
  const { toast } = useToast();
  const uploadFile = useUploadIntakeFile();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: catalog } = useConceptsCatalog();
  const { data: myClasses } = useMyClasses();
  const logSession = useLogSolveSession();
  const updateSession = useUpdateSolveSession();
  const shareWithTeacher = useShareSolveWithTeacher();
  const gate = useCreditGate();

  const [view, setView] = useState<View>("input");
  const [question, setQuestion] = useState("");
  const [working, setWorking] = useState("");
  const [helpMode, setHelpMode] = useState(1);
  const [inputModeIdx, setInputModeIdx] = useState(0);
  const [attachment, setAttachment] = useState<UploadedIntakeFile | null>(null);
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<CoachStep[]>([]);
  const [response, setResponse] = useState<SolveResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeHelpMode, setActiveHelpMode] = useState<SolveHelpMode>("steps");

  const [reflection, setReflection] = useState({ method: "", struggle: "", couldRepeat: "" });
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [similarBusy, setSimilarBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareClassId, setShareClassId] = useState("");

  const matchConceptId = (topicName: string, questionText: string) => {
    const match = resolveConcept(topicName) || resolveConcept(questionText.slice(0, 80));
    return match?.id ?? null;
  };

  const persistSession = async (input: {
    question: string;
    helpMode: SolveHelpMode;
    topic?: string;
    finalAnswer?: string;
    status?: "started" | "completed" | "saved";
    saved?: boolean;
    stepCount?: number;
    hint?: string;
    explanation?: string;
    method?: string;
    struggle?: string;
    couldRepeat?: string;
  }) => {
    try {
      const id = await logSession.mutateAsync({
        ...input,
        conceptId: matchConceptId(input.topic || "", input.question),
      });
      if (id) setAttemptId(id);
      return id;
    } catch {
      return null;
    }
  };

  const inputMode = solveInputs[inputModeIdx];
  const isPhotoMode = inputMode === "Photograph" || inputMode === "Upload image";
  const helpKind: HelpModeKind = helpModes[helpMode].mode;

  const resolveConcept = (text: string) => {
    const q = text.trim().toLowerCase();
    if (!q) return null;
    const list = catalog || [];
    return (
      list.find((item) => item.name.toLowerCase() === q) ||
      list.find((item) => item.slug === q.replace(/\s+/g, "-")) ||
      list.find((item) => q.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(q)) ||
      null
    );
  };

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

  const MATH_RULE = `Wrap every formula, fraction, equation or unit expression in single dollar signs for inline math (e.g. $v = u + at$) or double dollar signs for a standalone equation ($$F = ma$$). Never use dollar signs for anything that is not math. Never use em dashes.`;

  // Returns the parsed JSON object from a Groq response (tolerant of fences).
  const askJson = async (system: string, user: string, tokens = 2000) => {
    const raw = await groqApiService.makeRequest(
      [{ role: "system", content: system }, { role: "user", content: user }],
      tokens,
    );
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s < 0 || e <= s) throw new Error("The coach did not return usable content.");
    const slice = cleaned.slice(s, e + 1);
    // Fast path first, then repair LaTeX backslashes / stray control chars.
    try { return JSON.parse(slice); }
    catch { return JSON.parse(sanitizeLlmJson(slice)); }
  };

  // "Guide me step by step" and "Check my working" both produce the step
  // coach; check mode additionally feeds the student's own working in.
  const startSteps = async (q: string, forceMode?: HelpModeKind) => {
    const kind = forceMode || helpKind;
    const checking = kind === "check";
    const system = `You coach Ghanaian secondary STEM students. Return ONLY JSON:
{"steps":[{"q":"...","hint":"...","answer":"..."}],"finalAnswer":"...","topic":"..."}.
Give 3 to 5 coaching steps. "topic" is the single STEM concept this question is really about (e.g. "Density", "Linear equations").
${checking ? "The student has attempted this. In the steps, point out where their working goes wrong and what the correct step is, without simply handing over the whole answer." : "Never give the full answer in the first hint."}
${MATH_RULE}`;
    const user = checking
      ? `Question: ${q}\n\nStudent's working:\n${working.trim() || "(the student did not paste any working)"}`
      : `Question: ${q}`;
    const parsed = await askJson(system, user) as { steps?: CoachStep[]; finalAnswer?: string; topic?: string };
    if (!parsed.steps?.length) throw new Error("Empty coaching steps");
    const nextTopic = parsed.topic || "";
    const nextAnswer = parsed.finalAnswer || "Check your working against the steps above.";
    setQuestion(q);
    setSteps(parsed.steps);
    setFinalAnswer(nextAnswer);
    setTopic(nextTopic);
    setActiveHelpMode(kind === "check" ? "check" : "steps");
    setAttemptId(null);
    setStep(0);
    setReflection({ method: "", struggle: "", couldRepeat: "" });
    setReflectionSaved(false);
    setSaved(false);
    setView("coaching");
    void persistSession({
      question: q,
      helpMode: kind === "check" ? "check" : "steps",
      topic: nextTopic,
      finalAnswer: nextAnswer,
      status: "started",
      stepCount: parsed.steps.length,
    });
  };

  const startResponse = async (q: string, kind: "hint" | "concept" | "similar") => {
    let nextTopic = "";
    let hint = "";
    let explanation = "";
    if (kind === "hint") {
      const parsed = await askJson(
        `You coach Ghanaian secondary STEM students. Return ONLY JSON: {"hint":"...","topic":"..."}.
"hint" is ONE nudge that points the student toward the first move, WITHOUT solving it or revealing the answer. Two sentences at most. ${MATH_RULE}`,
        `Question: ${q}`,
        800,
      ) as { hint?: string; topic?: string };
      hint = parsed.hint || "Start by naming what the question is actually asking for.";
      nextTopic = parsed.topic || "";
      setResponse({ kind: "hint", hint });
      setTopic(nextTopic);
    } else if (kind === "concept") {
      const parsed = await askJson(
        `You teach Ghanaian secondary STEM students. Return ONLY JSON: {"explanation":"...","topic":"..."}.
"explanation" teaches the underlying idea this question tests, in plain language with a local example, in 2-4 short paragraphs. Use \\n between paragraphs. Do NOT solve this specific question. ${MATH_RULE}`,
        `Question: ${q}`,
        1600,
      ) as { explanation?: string; topic?: string };
      explanation = parsed.explanation || "This question tests a core STEM idea. Review the related concept in Learn.";
      nextTopic = parsed.topic || "";
      setResponse({ kind: "concept", explanation });
      setTopic(nextTopic);
    } else {
      const parsed = await askJson(
        `You write practice questions for Ghanaian secondary STEM students. Return ONLY JSON: {"questions":["...","..."],"topic":"..."}.
Write 3 NEW questions that practise the same skill as the given one, with different numbers or context. Do not include answers. ${MATH_RULE}`,
        `Original question: ${q}`,
        1400,
      ) as { questions?: string[]; topic?: string };
      const qs = (parsed.questions || []).filter((x) => x && x.trim());
      if (qs.length === 0) throw new Error("No practice questions came back.");
      nextTopic = parsed.topic || "";
      setResponse({ kind: "similar", questions: qs });
      setTopic(nextTopic);
    }
    setQuestion(q);
    setActiveHelpMode(kind);
    setAttemptId(null);
    setView("response");
    void persistSession({
      question: q,
      helpMode: kind,
      topic: nextTopic,
      status: "completed",
      hint,
      explanation,
    });
  };

  const gateMeta: Record<HelpModeKind, { key: string; title: string; desc: string }> = {
    hint: { key: "solve_hint", title: "Get a hint?", desc: "mytuta gives you one nudge toward the first step." },
    concept: { key: "solve_hint", title: "Explain the concept?", desc: "mytuta teaches the idea behind this question." },
    steps: { key: "solve_steps", title: "Solve step by step?", desc: "mytuta coaches you through this question one step at a time." },
    check: { key: "solve_steps", title: "Check my working?", desc: "mytuta finds where your working goes wrong." },
    similar: { key: "solve_similar", title: "Create practice questions?", desc: "mytuta writes three new questions like this one." },
  };

  const start = async (overrideQuestion?: string, forceKind?: HelpModeKind) => {
    const q = (overrideQuestion ?? question).trim();
    if (!q) {
      toast({ title: "Add a question first", description: "Paste or type the problem you want help with.", variant: "destructive" });
      return;
    }
    const kind = forceKind || helpKind;
    if (kind === "check" && !working.trim()) {
      toast({ title: "Add your working", description: "Paste what you tried so mytuta can find where it went wrong.", variant: "destructive" });
      return;
    }
    const meta = gateMeta[kind];
    await gate.run({
      actionKey: meta.key,
      title: meta.title,
      description: meta.desc,
      action: async () => {
        setBusy(true);
        void recordEvent("hint_requested", { meta: { mode: kind } });
        try {
          if (kind === "steps" || kind === "check") await startSteps(q, kind);
          else await startResponse(q, kind);
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const markCompleted = async () => {
    trackSolveCompleted(topic);
    setView("solved");
    if (!attemptId) return;
    try {
      await updateSession.mutateAsync({
        attemptId,
        topic,
        finalAnswer,
        status: "completed",
        conceptId: matchConceptId(topic, question),
      });
    } catch {
      /* non-blocking */
    }
  };

  const saveReflection = async () => {
    try {
      if (attemptId) {
        await updateSession.mutateAsync({
          attemptId,
          topic,
          finalAnswer,
          status: "completed",
          method: reflection.method,
          struggle: reflection.struggle,
          couldRepeat: reflection.couldRepeat,
        });
      } else {
        await persistSession({
          question,
          helpMode: activeHelpMode,
          topic,
          finalAnswer,
          status: "completed",
          method: reflection.method,
          struggle: reflection.struggle,
          couldRepeat: reflection.couldRepeat,
        });
      }
      setReflectionSaved(true);
      toast({ title: "Reflection saved" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your reflection just now.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  const trySimilar = async () => {
    setSimilarBusy(true);
    try {
      const next = await generateSimilarQuestion(question);
      if (!next.trim()) throw new Error("Could not write a similar question.");
      await start(next, "steps");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not write a similar question just now.";
      toast({ title: "Try again", description: msg, variant: "destructive" });
    } finally {
      setSimilarBusy(false);
    }
  };

  const goToConcept = (mode: "add" | "review") => {
    const match = resolveConcept(topic);
    if (!match) {
      toast({ title: "Not in the catalog yet", description: `We could not match "${topic || "this question"}" to a STEM concept. Try Learn and search for it directly.`, variant: "destructive" });
      nav("/student/learn");
      return;
    }
    nav("/student/learn", { state: { presetConceptSlug: match.slug, mode } });
  };

  const saveProblem = async () => {
    try {
      if (attemptId) {
        await updateSession.mutateAsync({
          attemptId,
          topic,
          finalAnswer,
          status: "saved",
          saved: true,
        });
      } else {
        await logSession.mutateAsync({
          question,
          helpMode: activeHelpMode,
          topic,
          finalAnswer,
          status: "saved",
          saved: true,
          conceptId: matchConceptId(topic, question),
        });
      }
      setSaved(true);
      toast({ title: "Problem saved" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save this problem just now.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  const resetToInput = () => {
    setView("input");
    setStep(0);
    setQuestion("");
    setWorking("");
    setAttachment(null);
    setInputModeIdx(0);
    setTopic("");
    setResponse(null);
    setAttemptId(null);
    setFinalAnswer("");
    setSteps([]);
    setReflection({ method: "", struggle: "", couldRepeat: "" });
    setReflectionSaved(false);
    setSaved(false);
  };

  const reopenFromHistory = (session: SolveHistorySession) => {
    setQuestion(session.prompt || "");
    setTopic(session.topic === "General practice" ? "" : session.topic);
    setFinalAnswer(session.final_answer || "");
    setAttemptId(session.id);
    setActiveHelpMode((session.help_mode as SolveHelpMode) || "steps");
    setWorking("");
    setSteps([]);
    setResponse(null);
    setView("input");
    toast({ title: "Question loaded", description: "Edit it if you want, then pick a help mode." });
  };

  const shareNow = async (classId: string) => {
    if (!classId) return;
    try {
      await shareWithTeacher.mutateAsync({ classId, question });
      toast({ title: "Shared with your teacher" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not share this just now.";
      toast({ title: "Share failed", description: msg, variant: "destructive" });
    }
  };

  if (view === "history") {
    return <SolveHistoryView onBack={() => setView("input")} onOpen={reopenFromHistory} />;
  }

  if (view === "input") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 6 }}>
          <h1 style={{ fontSize: 28, flex: 1 }}>Solve a problem</h1>
          <button type="button" onClick={() => setView("history")} style={{ flex: "none", marginTop: 6, background: c.surface, border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 10, cursor: "pointer" }}>Your Solve history</button>
        </div>
        <p style={{ fontSize: 15, color: c.muted, marginBottom: 22 }}>Bring your own question. mytuta coaches your reasoning instead of handing over the answer.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {solveInputs.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => { setInputModeIdx(i); setAttachment(null); }}
              style={chip(inputModeIdx === i)}
            >{label}</button>
          ))}
        </div>
        {isPhotoMode && (
          <div style={{ marginBottom: 16 }}>
            {attachment ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 12, padding: "10px 14px" }}>
                {inputMode === "Photograph" && <img src={attachment.signedUrl} alt="Attached photo preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flex: "none" }} />}
                <span style={{ flex: 1, fontSize: 13.5, color: c.greenDark, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} style={{ background: "none", border: "none", color: c.greenDark, fontSize: 13, cursor: "pointer", padding: 0 }}>Remove</button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadFile.isPending}
                onClick={() => fileRef.current?.click()}
                style={{ width: "100%", background: c.surface, border: `1px dashed ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13.5, padding: "14px 16px", borderRadius: 12, cursor: "pointer", opacity: uploadFile.isPending ? 0.7 : 1 }}
              >
                {uploadFile.isPending ? "Uploading…" : inputMode === "Photograph" ? "Attach a photo" : "Attach an image"}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture={inputMode === "Photograph" ? "environment" : undefined}
              onChange={(e) => void onPickFile(e)}
              style={{ display: "none" }}
            />
            <p style={{ fontSize: 12, color: c.faint, marginTop: 8 }}>mytuta can't read text from images yet, so type the question below and keep the attachment as your reference.</p>
          </div>
        )}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholders[inputMode] || placeholders.Type}
            rows={5}
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical",
              background: c.divider, border: "none", borderRadius: 11,
              padding: "16px 18px", fontSize: 16, lineHeight: 1.55, color: c.ink,
              minHeight: 120, outline: "none", fontFamily: font.body,
            }}
          />
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 }}>How should mytuta help?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {helpModes.map((h, i) => (
            <button key={h.title} type="button" onClick={() => setHelpMode(i)} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2, background: helpMode === i ? c.greenTint : c.surface, border: `1px solid ${helpMode === i ? c.greenTintBorder : c.border2}`, borderRadius: 13, padding: "15px 16px", cursor: "pointer" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{h.title}</span>
              <span style={{ fontSize: 12, color: c.muted }}>{h.body}</span>
            </button>
          ))}
        </div>
        {helpKind === "check" && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Your working so far</div>
            <textarea
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              placeholder="Paste the steps you tried. mytuta finds where it went wrong…"
              rows={4}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 14.5, lineHeight: 1.55, color: c.ink, minHeight: 96, outline: "none", fontFamily: font.body }}
            />
          </div>
        )}
        <button type="button" onClick={() => void start()} disabled={busy} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? modeCta[helpKind].busy : modeCta[helpKind].label}
        </button>
      </div>
    );
  }

  if (view === "coaching") {
    const cur = steps[Math.min(step, steps.length - 1)];
    const done = steps.slice(0, step);
    const last = step + 1 >= steps.length;
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 40px 72px", animation: "fadeup .3s ease" }}>
        <button type="button" onClick={() => { setView("input"); setStep(0); }} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Change question</button>
        <div style={{ background: c.divider, borderRadius: 11, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.55, color: c.body }}><MathText text={question} /></div>
        <div style={{ display: "flex", gap: 6, margin: "18px 0 24px" }}>
          {steps.map((_, i) => (
            <span key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? c.green : i === step ? "#9fd3ba" : c.track }} />
          ))}
        </div>
        {done.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 13, padding: "0 0 16px" }}>
            <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}><MathText text={d.q} /></div>
              <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.55 }}><MathText text={d.answer} /></div>
            </div>
          </div>
        ))}
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22, marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Step {step + 1} of {steps.length}</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}><MathText text={cur.q} /></div>
          <div style={{ fontSize: 14, color: c.soft, lineHeight: 1.6, marginBottom: 16 }}><MathText text={cur.hint} /></div>
          <button type="button" onClick={() => { if (last) void markCompleted(); else setStep(step + 1); }} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 10, cursor: "pointer" }}>
            {last ? "See the conclusion" : "Reveal this step"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "response" && response) {
    const heading = response.kind === "hint" ? "A hint" : response.kind === "concept" ? "The concept" : "Practice questions";
    return (
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
        <button type="button" onClick={() => setView("input")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Change question</button>
        <div style={{ background: c.divider, borderRadius: 11, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.55, color: c.body, marginBottom: 20 }}><MathText text={question} /></div>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>{heading}</div>

        {response.kind === "hint" && (
          <>
            <div style={{ background: c.amberTint, border: `1px solid ${c.amberBorder}`, borderRadius: 16, padding: "20px 22px", marginBottom: 20, fontSize: 15.5, lineHeight: 1.65, color: "#5c4a26" }}>
              <MathText text={response.hint} />
            </div>
            <button type="button" onClick={() => void start(question, "steps")} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer", marginBottom: 12 }}>Guide me step by step</button>
          </>
        )}

        {response.kind === "concept" && (
          <>
            <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "22px 24px", marginBottom: 20, fontSize: 15, lineHeight: 1.75, color: c.body, whiteSpace: "pre-wrap" }}>
              <MathText text={response.explanation} />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void start(question, "steps")} style={{ flex: 1, minWidth: 200, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: "pointer" }}>Now solve it step by step</button>
              <button type="button" onClick={() => goToConcept("review")} style={{ ...followBtn, flex: "none" }}>Review this concept</button>
            </div>
          </>
        )}

        {response.kind === "similar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {response.questions.map((pq, i) => (
              <div key={i} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 14.5, lineHeight: 1.6, color: c.ink, marginBottom: 12 }}><span style={{ fontWeight: 700, color: c.faint, marginRight: 6 }}>{i + 1}.</span><MathText text={pq} /></div>
                <button type="button" onClick={() => void start(pq, "steps")} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontWeight: 600, fontSize: 13, padding: "8px 15px", borderRadius: 10, cursor: "pointer" }}>Solve this one</button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={resetToInput} style={{ width: "100%", background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: "pointer" }}>Ask something else</button>
      </div>
    );
  }

  // solved
  const classes = myClasses || [];
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Solved together</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}><MathText text={finalAnswer} /></h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 26 }}>You reached the answer one step at a time. That reasoning is what carries over to the next question.</p>

      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22, marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>Reflect</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          <ReflectField label="What method did you use?" value={reflection.method} onChange={(v) => setReflection((r) => ({ ...r, method: v }))} />
          <ReflectField label="Where did you struggle?" value={reflection.struggle} onChange={(v) => setReflection((r) => ({ ...r, struggle: v }))} />
          <ReflectField label="Could you solve a similar question?" value={reflection.couldRepeat} onChange={(v) => setReflection((r) => ({ ...r, couldRepeat: v }))} />
        </div>
        <button
          type="button"
          disabled={updateSession.isPending || logSession.isPending || reflectionSaved || (!reflection.method.trim() && !reflection.struggle.trim() && !reflection.couldRepeat.trim())}
          onClick={() => void saveReflection()}
          style={{ background: reflectionSaved ? c.greenTint : c.surface, border: `1px solid ${reflectionSaved ? c.greenTintBorder : c.border}`, color: reflectionSaved ? c.greenDark : c.soft, fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 10, cursor: "pointer", opacity: updateSession.isPending || logSession.isPending ? 0.7 : 1 }}
        >{reflectionSaved ? "Reflection saved" : updateSession.isPending || logSession.isPending ? "Saving…" : "Save reflection"}</button>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>What next</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        <button type="button" disabled={similarBusy} onClick={() => void trySimilar()} style={followBtn}>
          {similarBusy ? "Writing a similar question…" : "Try a similar question"}
        </button>
        <button type="button" onClick={() => goToConcept("add")} style={followBtn}>Add to mastery path</button>
        <button type="button" onClick={() => goToConcept("review")} style={followBtn}>Review this concept</button>
        <button type="button" disabled={saved || updateSession.isPending || logSession.isPending} onClick={() => void saveProblem()} style={followBtn}>{saved ? "Problem saved" : "Save this problem"}</button>

        {classes.length === 0 ? (
          <div style={{ ...followBtn, cursor: "default", color: c.faint }}>Share with teacher (join a class first)</div>
        ) : classes.length === 1 ? (
          <button type="button" disabled={shareWithTeacher.isPending} onClick={() => void shareNow(classes[0].id)} style={followBtn}>
            {shareWithTeacher.isPending ? "Sharing…" : `Share with ${classes[0].name}'s teacher`}
          </button>
        ) : (
          <div style={{ ...followBtn, display: "flex", alignItems: "center", gap: 10, cursor: "default" }}>
            <span>Share with teacher</span>
            <select
              value={shareClassId}
              onChange={(e) => { setShareClassId(e.target.value); void shareNow(e.target.value); }}
              style={{ marginLeft: "auto", border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 8px", fontSize: 13, fontFamily: font.body, background: "#fff", color: c.ink }}
            >
              <option value="">Choose a class…</option>
              {classes.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <button type="button" onClick={resetToInput} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer" }}>Solve another question</button>
    </div>
  );
}

function ReflectField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12.5, color: c.soft, marginBottom: 6 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A short answer is fine…"
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
      />
    </label>
  );
}

const followBtn: React.CSSProperties = {
  textAlign: "left", background: c.surface, border: `1px solid ${c.border}`, color: c.ink,
  fontWeight: 600, fontSize: 14, padding: "13px 16px", borderRadius: 12, cursor: "pointer",
};

const HELP_MODE_LABEL: Record<string, string> = {
  hint: "Hint",
  steps: "Step coach",
  check: "Check working",
  concept: "Concept explain",
  similar: "Similar practice",
};

function previewText(text: string, max = 140) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "No question text saved";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Topic rollups + individual sessions with question, mode, answer, reflection. */
function SolveHistoryView({
  onBack, onOpen,
}: {
  onBack: () => void;
  onOpen: (session: SolveHistorySession) => void;
}) {
  const { data, isLoading } = useSolveHistory();
  const topics = data?.topics || [];
  const sessions = data?.sessions || [];
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!openTopic && topics[0]?.topic) setOpenTopic(topics[0].topic);
  }, [topics, openTopic]);

  const detail = sessions.find((s) => s.id === detailId) || null;
  const topicSessions = (topic: string) =>
    sessions.filter((s) => (s.topic || "General practice") === topic);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <h1 style={{ fontSize: 26, flex: 1 }}>Your Solve history</h1>
        <button type="button" onClick={onBack} style={{ background: c.surface, border: `1px solid ${c.border2}`, color: c.soft, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 10, cursor: "pointer" }}>← Solve</button>
      </div>
      <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 22 }}>
        Grouped by topic. Open a topic to see each question, how you practised it, and what you saved.
      </p>

      {isLoading ? (
        <div style={{ color: c.muted, fontSize: 14 }}>Reading your Solve sessions…</div>
      ) : topics.length === 0 && sessions.length === 0 ? (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "20px 22px", fontSize: 14, color: c.muted }}>
          No solved problems yet. Every problem you work through here will be tracked with its question and help mode.
        </div>
      ) : detail ? (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22 }}>
          <button type="button" onClick={() => setDetailId(null)} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 14 }}>← Back to topic</button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.green, background: c.greenTint, padding: "4px 10px", borderRadius: 20 }}>{detail.topic}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.soft, background: c.paper, border: `1px solid ${c.border2}`, padding: "4px 10px", borderRadius: 20 }}>
              {HELP_MODE_LABEL[detail.help_mode] || detail.help_mode}
            </span>
            {detail.saved && <span style={{ fontSize: 11, fontWeight: 600, color: c.amber, background: c.amberTint, padding: "4px 10px", borderRadius: 20 }}>Saved</span>}
          </div>
          <div style={{ fontSize: 12, color: c.faint, marginBottom: 10 }}>
            {new Date(detail.created_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Question</div>
          <div style={{ fontSize: 15, lineHeight: 1.55, color: c.ink, marginBottom: 18 }}><MathText text={detail.prompt || ""} /></div>

          {detail.final_answer && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Conclusion</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: c.body, marginBottom: 18 }}><MathText text={detail.final_answer} /></div>
            </>
          )}
          {detail.hint && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Hint</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: c.body, marginBottom: 18 }}><MathText text={detail.hint} /></div>
            </>
          )}
          {detail.explanation && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Explanation</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: c.body, marginBottom: 18, whiteSpace: "pre-wrap" }}><MathText text={detail.explanation} /></div>
            </>
          )}
          {(detail.method || detail.struggle || detail.could_repeat) && (
            <div style={{ background: c.paper, border: `1px solid ${c.border2}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Your reflection</div>
              {detail.method && <div style={{ fontSize: 13.5, color: c.soft, marginBottom: 6 }}><b style={{ color: c.ink }}>Method:</b> {detail.method}</div>}
              {detail.struggle && <div style={{ fontSize: 13.5, color: c.soft, marginBottom: 6 }}><b style={{ color: c.ink }}>Struggle:</b> {detail.struggle}</div>}
              {detail.could_repeat && <div style={{ fontSize: 13.5, color: c.soft }}><b style={{ color: c.ink }}>Similar next time:</b> {detail.could_repeat}</div>}
            </div>
          )}
          <button
            type="button"
            onClick={() => onOpen(detail)}
            style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: "pointer" }}
          >
            Practise this question again
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(topics.length ? topics : [{ topic: "Recent", attempted: sessions.length, saved: sessions.filter((s) => s.saved).length, last_at: sessions[0]?.created_at || "" }]).map((r) => {
            const list = r.topic === "Recent" ? sessions : topicSessions(r.topic);
            const open = openTopic === r.topic;
            return (
              <div key={r.topic} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setOpenTopic(open ? null : r.topic)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "16px 18px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 15.5, flex: 1, color: c.ink }}>{r.topic}</div>
                    <div style={{ fontSize: 12, color: c.faint }}>{r.last_at ? new Date(r.last_at).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 13, color: c.soft }}>
                    <span><b style={{ color: c.ink }}>{r.attempted}</b> attempted</span>
                    <span><b style={{ color: c.green }}>{r.saved}</b> saved</span>
                    <span style={{ marginLeft: "auto", color: c.faint }}>{open ? "Hide" : "Show questions"}</span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: `1px solid ${c.divider}`, padding: "8px 12px 12px" }}>
                    {list.length === 0 ? (
                      <div style={{ fontSize: 13.5, color: c.muted, padding: "10px 6px" }}>
                        Older sessions only stored totals. New Solve work will list each question here.
                      </div>
                    ) : (
                      list.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDetailId(s.id)}
                          style={{
                            width: "100%", textAlign: "left", background: c.paper, border: `1px solid ${c.border2}`,
                            borderRadius: 12, padding: "12px 14px", marginTop: 8, cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: c.soft }}>
                              {HELP_MODE_LABEL[s.help_mode] || s.help_mode}
                            </span>
                            {s.saved && <span style={{ fontSize: 11, fontWeight: 600, color: c.green }}>Saved</span>}
                            <span style={{ marginLeft: "auto", fontSize: 11, color: c.faint }}>
                              {new Date(s.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.45 }}>{previewText(s.prompt)}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
