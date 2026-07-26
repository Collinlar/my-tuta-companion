import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { c, font, level, chip, seg } from "../theme";
import { Bar, Loading, EmptyState } from "../ui";
import { MathText } from "../MathText";
import { useToast } from "@/hooks/use-toast";
import { beginOptions, recallRatings, supportLevels } from "../data/constants";
import {
  answerConceptQuestion,
  generateConceptStages,
  generateDiagnostic,
  generateDiagnosticResult,
  generateMasteryQuestions,
  type DiagnosticQuestion,
  type DiagnosticResult,
  type MasteryQuestion,
} from "../data/ai";
import { useMasteryPaths, useConcept, useConceptsCatalog, type ConceptStageVM, type PathVM } from "../data/queries";
import { useAdvanceStage, useEnsureConceptStages, useEnsureRecallCards, useLogIndependentAttempt, useRateRecallCard, useSaveMasteryResult, useStartMasteryPath, useUploadIntakeFile, type RecallCardState, type UploadedIntakeFile } from "../data/mutations";
import { useCreditGate } from "../credits/CreditGate";
import { recordEvent } from "../intelligence/data";

export type PathEvidence = {
  recallRated: number;
  recallAgain: number;
  recallGood: number;
  guidedCorrect: number;
  guidedTotal: number;
  guidedSupport: number;
  independentCorrect: number;
  independentTotal: number;
  applySubmitted: boolean;
  applyWords: number;
};

type View = "begin" | "enter" | "pick" | "confirm" | "diagnostic" | "result" | "preview" | "workspace";
type EnterMode = "enter" | "upload" | "photo";

export default function Learn() {
  const nav = useNavigate();
  const location = useLocation();
  const { masteryPathId } = useParams();
  const qc = useQueryClient();
  const gate = useCreditGate();
  const [view, setView] = useState<View>("begin");
  const [slug, setSlug] = useState("photosynthesis");
  const [enterMode, setEnterMode] = useState<EnterMode>("enter");
  const [skipToCheck, setSkipToCheck] = useState(false);
  const [diagResult, setDiagResult] = useState<DiagnosticResult | null>(null);
  const [stage, setStage] = useState(0);
  const [explainMode, setExplainMode] = useState(0);
  const [supportLevel, setSupportLevel] = useState(0);
  const [buildingPath, setBuildingPath] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<PathEvidence>({
    recallRated: 0, recallAgain: 0, recallGood: 0,
    guidedCorrect: 0, guidedTotal: 0, guidedSupport: 0,
    independentCorrect: 0, independentTotal: 0,
    applySubmitted: false, applyWords: 0,
  });

  const { data: paths, isLoading: pathsLoading } = useMasteryPaths();
  const { data: catalog } = useConceptsCatalog();
  const { data: concept, isLoading: conceptLoading, refetch: refetchConcept } = useConcept(slug);
  const advance = useAdvanceStage();
  const startPath = useStartMasteryPath();
  const ensureStages = useEnsureConceptStages();
  const saveMastery = useSaveMasteryResult();

  const stages = concept?.stages || [];
  const activePath = useMemo(
    () => (paths || []).find((p) => p.concept.toLowerCase() === (concept?.concept.name || "").toLowerCase()),
    [paths, concept],
  );
  const conceptMeta = concept?.concept;
  const related = (conceptMeta?.related_areas as string[] | null) || [];

  const bootstrapped = useRef(false);

  // Continue: /student/mastery/:id opens that path's workspace directly, so
  // "Continue" from Home / Next-Best-Action lands in the path, not the picker.
  useEffect(() => {
    if (bootstrapped.current) return;
    if (!masteryPathId || !paths || !catalog) return;
    const path = paths.find((p) => p.id === masteryPathId);
    if (!path) return;
    bootstrapped.current = true;
    void openPath(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteryPathId, paths, catalog]);

  // Deep link from Solve follow-ups and Home quick-help chips. `presetConceptSlug`
  // comes from Solve; `presetConceptName` from a chip label — both resolve to the
  // concept and open the confirm screen (or the workspace when resuming).
  useEffect(() => {
    if (bootstrapped.current) return;
    const state = location.state as { presetConceptSlug?: string; presetConceptName?: string; mode?: "review" | "add" } | null;
    if ((!state?.presetConceptSlug && !state?.presetConceptName) || !catalog || !paths) return;
    const match = state.presetConceptSlug
      ? catalog.find((item) => item.slug === state.presetConceptSlug)
      : resolveTypedConcept(state.presetConceptName || "");
    if (!match) return;
    bootstrapped.current = true;
    setSlug(match.slug);
    const existing = paths.find((p) => p.concept.toLowerCase() === match.name.toLowerCase());
    if (existing) {
      // Already have a path for this concept — resume it instead of re-creating.
      setStage(existing.currentStage ?? 0);
      setView("workspace");
      return;
    }
    setView("confirm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, catalog, paths]);

  const ensurePathStages = async () => {
    if (!conceptMeta) return;
    if ((concept?.stages || []).length > 0) return;
    setBuildingPath(true);
    setBuildError(null);
    try {
      const generated = await generateConceptStages(conceptMeta.name, conceptMeta.subject || "Science");
      await ensureStages.mutateAsync({ conceptId: conceptMeta.id, stages: generated });
      await qc.invalidateQueries({ queryKey: ["concept", slug] });
      await refetchConcept();
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : "Could not build this path yet. Try again.");
      throw e;
    } finally {
      setBuildingPath(false);
    }
  };

  const openPath = async (path: PathVM) => {
    const match = (catalog || []).find((c) => c.name.toLowerCase() === path.concept.toLowerCase());
    if (match) setSlug(match.slug);
    setStage(path.currentStage ?? 0);
    setView("workspace");
  };

  // When workspace opens on a concept with no stages, generate them.
  useEffect(() => {
    if (view !== "workspace" && view !== "preview") return;
    if (conceptLoading || !conceptMeta) return;
    if (stages.length > 0 || buildingPath) return;
    void ensurePathStages().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, conceptMeta?.id, stages.length, conceptLoading]);

  const openWorkspace = () => {
    setStage(activePath?.currentStage ?? 0);
    setView("workspace");
  };

  const nextStage = () => {
    const next = Math.min(stages.length - 1, stage + 1);
    setStage(next);
    if (activePath) {
      advance.mutate({
        pathId: activePath.id,
        stage: next,
        stageLabel: stages[next]?.name,
        totalStages: stages.length,
        conceptId: conceptMeta?.id,
        conceptName: conceptMeta?.name,
        subject: conceptMeta?.subject || undefined,
      });
    }
  };

  const confirmStart = async () => {
    if (!conceptMeta) return;
    await startPath.mutateAsync({
      conceptId: conceptMeta.id,
      conceptName: conceptMeta.name,
      subject: conceptMeta.subject,
    });
    setDiagResult(null);
    setEvidence({
      recallRated: 0, recallAgain: 0, recallGood: 0,
      guidedCorrect: 0, guidedTotal: 0, guidedSupport: 0,
      independentCorrect: 0, independentTotal: 0,
      applySubmitted: false, applyWords: 0,
    });
    setView("diagnostic");
  };

  const onBeginOption = (key: string) => {
    if (key === "paste") {
      nav("/student/solve");
      return;
    }
    if (key === "enter" || key === "upload" || key === "photo") {
      setEnterMode(key);
      setSkipToCheck(false);
      setView("enter");
      return;
    }
    if (key === "check") {
      setSkipToCheck(true);
      setView("pick");
      return;
    }
    setSkipToCheck(false);
    setView("pick");
  };

  const resolveTypedConcept = (text: string) => {
    const q = text.trim().toLowerCase();
    if (!q) return null;
    const list = catalog || [];
    return (
      list.find((item) => item.name.toLowerCase() === q) ||
      list.find((item) => item.slug === q.replace(/\s+/g, "-")) ||
      list.find((item) => item.name.toLowerCase().includes(q) || q.includes(item.name.toLowerCase())) ||
      null
    );
  };

  if (view === "begin") {
    return (
      <Begin
        paths={paths || []}
        loading={pathsLoading}
        onOption={onBeginOption}
        onOpenPath={(p) => { void openPath(p); }}
      />
    );
  }
  if (view === "enter") {
    return (
      <EnterConcept
        mode={enterMode}
        catalog={catalog || []}
        onBack={() => setView("begin")}
        onResolve={(text) => {
          const match = resolveTypedConcept(text);
          if (!match) return false;
          setSlug(match.slug);
          setView("confirm");
          return true;
        }}
        onBrowse={() => setView("pick")}
      />
    );
  }
  if (view === "pick") {
    return (
      <PickConcept
        catalog={catalog || []}
        onBack={() => setView("begin")}
        onPick={(s) => {
          setSlug(s);
          setView(skipToCheck ? "confirm" : "confirm");
        }}
      />
    );
  }
  if (view === "confirm") {
    return (
      <Confirm
        name={conceptMeta?.name || "Concept"}
        subject={conceptMeta?.subject || ""}
        description={conceptMeta?.description || ""}
        related={related}
        loading={conceptLoading || startPath.isPending}
        back={() => setView("pick")}
        next={() => { void gate.run({ actionKey: "mastery_path", title: "Create this Mastery Path?", description: "Includes a diagnostic, explanations, worked examples, practice and a mastery check.", action: () => confirmStart() }); }}
      />
    );
  }
  if (view === "diagnostic") {
    return (
      <Diagnostic
        conceptName={conceptMeta?.name || "this concept"}
        subject={conceptMeta?.subject || "Science"}
        onDone={(result) => {
          setDiagResult(result);
          setView("result");
        }}
      />
    );
  }
  if (view === "result") {
    return (
      <Result
        conceptName={conceptMeta?.name || "this concept"}
        result={diagResult}
        building={buildingPath}
        error={buildError}
        onNext={async () => {
          try {
            await ensurePathStages();
            setView("preview");
          } catch {
            /* error shown in Result */
          }
        }}
      />
    );
  }
  if (view === "preview") {
    return (
      <Preview
        conceptName={conceptMeta?.name || "this concept"}
        stages={stages}
        loading={conceptLoading || buildingPath}
        error={buildError}
        onRetry={() => { void ensurePathStages().catch(() => undefined); }}
        onStart={openWorkspace}
      />
    );
  }
  return (
    <Workspace
      conceptName={conceptMeta?.name || "Concept"}
      subject={conceptMeta?.subject || ""}
      conceptId={conceptMeta?.id}
      pathId={activePath?.id}
      stages={stages}
      loading={conceptLoading || buildingPath}
      stage={stage}
      setStage={setStage}
      nextStage={nextStage}
      explainMode={explainMode}
      setExplainMode={setExplainMode}
      supportLevel={supportLevel}
      setSupportLevel={setSupportLevel}
      evidence={evidence}
      setEvidence={setEvidence}
      onSaveMastery={async (result) => {
        if (!activePath) return;
        await saveMastery.mutateAsync({
          pathId: activePath.id,
          conceptId: conceptMeta?.id,
          conceptName: conceptMeta?.name || "Concept",
          subject: conceptMeta?.subject || undefined,
          ...result,
        });
      }}
      onBack={() => setView("begin")}
    />
  );
}

function Begin({
  paths, loading, onOption, onOpenPath,
}: {
  paths: PathVM[];
  loading: boolean;
  onOption: (key: string) => void;
  onOpenPath: (p: PathVM) => void;
}) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Start a mastery path</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 30 }}>Type a topic, browse the catalog, or jump in from a question. mytuta builds a path from a quick check to proven mastery.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
        {beginOptions.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => onOption(b.key)}
            style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 15, padding: "20px 18px", cursor: "pointer" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: b.bg, color: b.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 13 }}>{b.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{b.title}</div>
            <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>{b.body}</div>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Your paths</div>
      {loading ? (
        <div style={{ fontSize: 13.5, color: c.muted }}>Loading your paths…</div>
      ) : paths.length === 0 ? (
        <div style={{ fontSize: 13.5, color: c.muted }}>No paths yet. Choose a concept above to build your first one.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {paths.map((p) => {
            const [lc, lb] = level(p.level);
            return (
              <button key={p.id} type="button" onClick={() => onOpenPath(p)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "15px 17px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", flex: "none", background: p.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.concept}</div>
                  <div style={{ fontSize: 12, color: c.faint }}>{p.subject} · {p.stage}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: lc, background: lb, padding: "4px 11px", borderRadius: 20 }}>{p.level}</span>
                <div style={{ width: 90 }}><Bar pct={p.pct} color={p.color} height={6} /></div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EnterConcept({
  mode, catalog, onBack, onResolve, onBrowse,
}: {
  mode: EnterMode;
  catalog: { id: string; slug: string; name: string; subject: string; description: string | null }[];
  onBack: () => void;
  onResolve: (text: string) => boolean;
  onBrowse: () => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [miss, setMiss] = useState(false);
  const [attachment, setAttachment] = useState<UploadedIntakeFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadIntakeFile();
  const titles: Record<EnterMode, { h: string; p: string; ph: string }> = {
    enter: { h: "What do you want to master?", p: "Type a concept. We match it to the STEM catalog.", ph: "e.g. Density, Fractions, Chemical bonding" },
    upload: { h: "What do your notes cover?", p: "Attach the file if you like, then name the topic so we can match it and build your path.", ph: "e.g. Linear equations" },
    photo: { h: "What is on the page or board?", p: "Attach a photo if you like, then name the topic so we can match it and build your path.", ph: "e.g. Photosynthesis" },
  };
  const copy = titles[mode];
  const suggestions = catalog.slice(0, 5);

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

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 18 }}>← Back</button>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{copy.h}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 22 }}>{copy.p}</p>
      {mode !== "enter" && (
        <div style={{ marginBottom: 18 }}>
          {attachment ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 12, padding: "10px 14px" }}>
              {mode === "photo" && <img src={attachment.signedUrl} alt="Attached photo preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flex: "none" }} />}
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
              {uploadFile.isPending ? "Uploading…" : mode === "photo" ? "Attach a photo" : "Attach a file"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={mode === "photo" ? "image/*" : "image/*,.pdf,.doc,.docx,.txt"}
            capture={mode === "photo" ? "environment" : undefined}
            onChange={(e) => void onPickFile(e)}
            style={{ display: "none" }}
          />
        </div>
      )}
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); setMiss(false); }}
        placeholder={copy.ph}
        style={{ width: "100%", boxSizing: "border-box", minHeight: 48, fontSize: 16, padding: "12px 16px", borderRadius: 12, border: `1px solid ${c.border}`, background: c.surface, color: c.ink, marginBottom: 12 }}
      />
      {miss && (
        <p style={{ fontSize: 13.5, color: c.amber, marginBottom: 12 }}>
          No match for that yet. Try one of the catalog topics below, or browse the full list.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          const ok = onResolve(text);
          if (!ok) setMiss(true);
        }}
        style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer", marginBottom: 18 }}
      >
        Find this concept
      </button>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>In the catalog</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onResolve(item.name)}
            style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", fontSize: 14 }}
          >
            {item.name} <span style={{ color: c.faint }}>· {item.subject}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={onBrowse} style={{ background: "none", border: "none", color: c.green, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0 }}>
        Browse all concepts ›
      </button>
    </div>
  );
}

function PickConcept({
  catalog, onBack, onPick,
}: {
  catalog: { id: string; slug: string; name: string; subject: string; description: string | null }[];
  onBack: () => void;
  onPick: (slug: string) => void;
}) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 18 }}>← Back</button>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Choose a concept</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>These come from the live STEM catalog in your database.</p>
      {catalog.length === 0 ? (
        <div style={{ fontSize: 14, color: c.muted }}>No concepts seeded yet. Apply the content migration first.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {catalog.map((item) => (
            <button key={item.id} type="button" onClick={() => onPick(item.slug)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 12.5, color: c.faint, marginBottom: 6 }}>{item.subject}</div>
              <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5 }}>{item.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Confirm({
  name, subject, description, related, loading, back, next,
}: {
  name: string; subject: string; description: string; related: string[];
  loading: boolean; back: () => void; next: () => void;
}) {
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontSize: 12.5, color: c.faint, marginBottom: 22 }}>Learn <span style={{ color: "#cbc3b2" }}>/</span> New path</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Concept identified</div>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>{name}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 26 }}>{subject}. {description}</p>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 24, marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>Related areas we will connect</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {(related.length ? related : ["Core ideas"]).map((r) => (
            <span key={r} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 20 }}>{r}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={back} disabled={loading} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "13px 22px", borderRadius: 12, cursor: "pointer" }}>Back</button>
        <button type="button" onClick={next} disabled={loading} style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Starting your path…" : "Take a quick check"}
        </button>
      </div>
    </div>
  );
}

function Diagnostic({
  conceptName, subject, onDone,
}: {
  conceptName: string;
  subject: string;
  onDone: (result: DiagnosticResult) => void;
}) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void generateDiagnostic(conceptName, subject)
      .then((qs) => {
        if (cancelled) return;
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(-1));
        setIdx(0);
        setPicked(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not write this check. Try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [conceptName, subject]);

  const finish = async (finalAnswers: number[]) => {
    setScoring(true);
    setError(null);
    try {
      const result = await generateDiagnosticResult({
        conceptName,
        subject,
        questions,
        answers: finalAnswers,
      });
      onDone(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not score this check. Try again.");
      setScoring(false);
    }
  };

  if (loading) return <Loading label={`Writing a quick check for ${conceptName}…`} />;
  if (error && questions.length === 0) {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 40px" }}>
        <EmptyState title="Check did not load" body={error} />
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            void generateDiagnostic(conceptName, subject)
              .then((qs) => { setQuestions(qs); setAnswers(Array(qs.length).fill(-1)); })
              .catch((e) => setError(e instanceof Error ? e.message : "Still could not write this check."))
              .finally(() => setLoading(false));
          }}
          style={{ marginTop: 16, width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer" }}
        >
          Try writing the check again
        </button>
      </div>
    );
  }

  const q = questions[idx];
  const total = questions.length;
  const pct = ((idx + (picked !== null ? 0.4 : 0)) / total) * 100;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase" }}>Quick check</span>
        <span style={{ flex: 1, height: 6, background: "#eae3d4", borderRadius: 4, overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", background: c.green, borderRadius: 4, width: `${Math.max(8, pct)}%` }} />
        </span>
        <span style={{ fontSize: 12.5, color: c.faint, fontWeight: 600 }}>{idx + 1} of {total}</span>
      </div>
      <p style={{ fontSize: 13, color: c.muted, marginBottom: 8 }}>This is not a test. It helps mytuta find the right starting point for {conceptName}.</p>
      <h2 style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 22 }}><MathText text={q.prompt} /></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
        {q.options.map((labelText, i) => {
          const on = picked === i;
          return (
            <button
              key={`${idx}-${labelText}`}
              type="button"
              onClick={() => setPicked(i)}
              style={{
                textAlign: "left", display: "flex", alignItems: "center", gap: 13, background: c.surface,
                border: `1px solid ${on ? c.greenTintBorder : c.border2}`, borderRadius: 12, padding: "14px 16px",
                fontSize: 14.5, color: c.ink, cursor: "pointer",
              }}
            >
              <span style={{
                width: 22, height: 22, flex: "none", borderRadius: "50%",
                border: `2px solid ${on ? c.green : "#cbc3b2"}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: on ? c.green : "#cbc3b2",
              }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <MathText text={labelText} />
            </button>
          );
        })}
      </div>
      {error && <p style={{ fontSize: 13.5, color: c.amber, marginBottom: 12 }}>{error}</p>}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          disabled={scoring}
          onClick={() => { void finish(answers); }}
          style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "13px 22px", borderRadius: 12, cursor: "pointer" }}
        >
          Skip check
        </button>
        <button
          type="button"
          disabled={picked === null || scoring}
          onClick={() => {
            const nextAnswers = [...answers];
            nextAnswers[idx] = picked ?? -1;
            setAnswers(nextAnswers);
            if (idx + 1 >= total) {
              void finish(nextAnswers);
            } else {
              setIdx(idx + 1);
              setPicked(null);
            }
          }}
          style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, cursor: "pointer", opacity: picked === null || scoring ? 0.65 : 1 }}
        >
          {scoring ? "Reading your answers…" : idx + 1 >= total ? "See my starting point" : "Next question"}
        </button>
      </div>
    </div>
  );
}

function Result({
  conceptName, result, building, error, onNext,
}: {
  conceptName: string;
  result: DiagnosticResult | null;
  building: boolean;
  error: string | null;
  onNext: () => void | Promise<void>;
}) {
  const known = result?.known?.length ? result.known : ["You completed the check"];
  const gaps = result?.gaps?.length ? result.gaps : [`Core ideas in ${conceptName}`];
  const summary = result?.summary || "We will start your path at the right place and skip what you already know.";

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Check complete</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Here is where you stand on {conceptName}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 26 }}>{summary}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 26 }}>
        <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 15, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.greenDark, marginBottom: 12 }}>You already understand</div>
          {known.map((k) => (
            <div key={k} style={{ display: "flex", gap: 9, fontSize: 13.5, color: c.ink, marginBottom: 9, lineHeight: 1.4 }}><span style={{ color: c.green, fontWeight: 700 }}>✓</span>{k}</div>
          ))}
        </div>
        <div style={{ background: c.amberTint, border: `1px solid ${c.amberBorder}`, borderRadius: 15, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.amber, marginBottom: 12 }}>Needs attention</div>
          {gaps.map((g) => (
            <div key={g} style={{ display: "flex", gap: 9, fontSize: 13.5, color: c.ink, marginBottom: 9, lineHeight: 1.4 }}><span style={{ color: c.amber, fontWeight: 700 }}>•</span>{g}</div>
          ))}
        </div>
      </div>
      {error && <p style={{ fontSize: 13.5, color: c.amber, marginBottom: 12 }}>{error}</p>}
      <button
        type="button"
        disabled={building}
        onClick={() => { void onNext(); }}
        style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer", opacity: building ? 0.7 : 1 }}
      >
        {building ? `Building your ${conceptName} path…` : "Build my mastery path"}
      </button>
    </div>
  );
}

function Preview({
  conceptName, stages, loading, error, onRetry, onStart,
}: {
  conceptName: string;
  stages: ConceptStageVM[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onStart: () => void;
}) {
  if (loading) return <Loading label={`Building your ${conceptName} mastery path…`} />;
  if (stages.length === 0) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "44px 40px" }}>
        <EmptyState title="Path not ready yet" body={error || "We could not build stages for this concept. Try again."} />
        <button type="button" onClick={onRetry} style={{ marginTop: 16, width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer" }}>
          Build path again
        </button>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Your path to mastering {conceptName}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 28 }}>{stages.length} stages, shaped by your check. Move at your own pace.</p>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 12, marginBottom: 24 }}>
        {stages.map((s, i) => (
          <div key={s.ord} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px", borderBottom: i < stages.length - 1 ? `1px solid ${c.divider}` : "none" }}>
            <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: i === 0 ? c.greenTint : "#f0ece1", color: i === 0 ? c.green : c.placeholder, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: c.faint }}>{s.description}</div>
            </div>
            <span style={{ fontSize: 11.5, color: c.placeholder }}>{s.estTime}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onStart} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: "pointer" }}>Start learning</button>
    </div>
  );
}

function Workspace({
  conceptName, subject, conceptId, pathId, stages, loading, stage, setStage, nextStage,
  explainMode, setExplainMode, supportLevel, setSupportLevel, evidence, setEvidence, onSaveMastery, onBack,
}: {
  conceptName: string; subject: string; conceptId?: string; pathId?: string;
  stages: ConceptStageVM[]; loading: boolean; stage: number; setStage: (n: number) => void; nextStage: () => void;
  explainMode: number; setExplainMode: (n: number) => void; supportLevel: number; setSupportLevel: (n: number) => void;
  evidence: PathEvidence; setEvidence: Dispatch<SetStateAction<PathEvidence>>;
  onSaveMastery: (r: { knowledge: number; application: number; analysis: number; overall: number; level: string; note: string }) => Promise<void>;
  onBack: () => void;
}) {
  if (loading) return <Loading label="Opening your workspace…" />;
  if (stages.length === 0) return <EmptyState title="Content is loading" body="This concept's stages will appear here once available." actionLabel="Back to paths" onAction={onBack} />;
  const cur = stages[Math.min(stage, stages.length - 1)];
  const content = cur.content as Record<string, any>;

  return (
    <div style={{ display: "flex", height: "100%", animation: "fadein .3s ease" }}>
      <div style={{ width: 230, flex: "none", borderRight: `1px solid ${c.border2}`, background: c.surface, padding: "22px 16px", overflowY: "auto" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← All paths</button>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{conceptName}</div>
        <div style={{ fontSize: 12, color: c.faint, marginBottom: 18 }}>{subject}</div>
        {stages.map((s, i) => {
          const done = i < stage, isCur = i === stage;
          return (
            <button key={s.ord} type="button" onClick={() => setStage(i)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, background: isCur ? c.greenTint : "transparent", border: `1px solid ${isCur ? c.greenTintBorder : "transparent"}`, borderRadius: 11, padding: "9px 10px", marginBottom: 3, cursor: "pointer" }}>
              <span style={{ width: 24, height: 24, flex: "none", borderRadius: "50%", background: done ? c.green : isCur ? c.greenTint : "#f0ece1", color: done ? "#fff" : isCur ? c.green : c.placeholder, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{done ? "✓" : i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: isCur ? 700 : 500 }}>{s.name}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "38px 40px 72px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Stage {stage + 1} of {stages.length} · {cur.loopPhase}</div>
          <h1 style={{ fontSize: 26, marginBottom: 18 }}>{cur.name}</h1>

          {cur.name === "Foundations" && <Foundations content={content} onNext={nextStage} />}
          {cur.name === "Understand" && <Understand content={content} conceptName={conceptName} subject={subject} explainMode={explainMode} setExplainMode={setExplainMode} onNext={nextStage} />}
          {cur.name === "Worked examples" && <Worked content={content} onNext={nextStage} />}
          {cur.name === "Recall" && (
            <Recall
              content={content}
              conceptId={conceptId}
              conceptName={conceptName}
              onRate={(label) => {
                setEvidence((e) => ({
                  ...e,
                  recallRated: e.recallRated + 1,
                  recallAgain: e.recallAgain + (label === "Again" || label === "Hard" ? 1 : 0),
                  recallGood: e.recallGood + (label === "Good" || label === "Easy" ? 1 : 0),
                }));
              }}
              onNext={nextStage}
            />
          )}
          {cur.name === "Guided practice" && (
            <Guided
              content={content}
              supportLevel={supportLevel}
              setSupportLevel={(n) => {
                setSupportLevel(n);
                setEvidence((e) => ({ ...e, guidedSupport: n }));
              }}
              onStepResult={(ok) => {
                setEvidence((e) => ({
                  ...e,
                  guidedTotal: e.guidedTotal + 1,
                  guidedCorrect: e.guidedCorrect + (ok ? 1 : 0),
                  guidedSupport: supportLevel,
                }));
              }}
              onNext={nextStage}
            />
          )}
          {cur.name === "Independent practice" && (
            <Independent
              content={content}
              conceptId={conceptId}
              conceptName={conceptName}
              onResult={(ok) => {
                setEvidence((e) => ({
                  ...e,
                  independentTotal: e.independentTotal + 1,
                  independentCorrect: e.independentCorrect + (ok ? 1 : 0),
                }));
              }}
              onNext={nextStage}
            />
          )}
          {cur.name === "Apply" && (
            <Apply
              content={content}
              conceptName={conceptName}
              onSubmit={(words) => {
                setEvidence((e) => ({ ...e, applySubmitted: true, applyWords: words }));
              }}
              onNext={nextStage}
            />
          )}
          {cur.name === "Mastery check" && (
            <Mastery
              content={content}
              conceptName={conceptName}
              subject={subject}
              evidence={evidence}
              pathId={pathId}
              onSave={onSaveMastery}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
}

function answerMatches(input: string, expected: string): boolean {
  const typed = input.trim().toLowerCase();
  if (!typed) return false;
  const exp = expected.trim().toLowerCase();
  if (!exp) return typed.length >= 8;
  if (exp.includes(typed) || typed.includes(exp)) return true;
  const a = tokens(typed);
  const b = new Set(tokens(exp));
  if (a.length === 0) return false;
  const hits = a.filter((w) => b.has(w)).length;
  return hits >= Math.max(1, Math.ceil(Math.min(a.length, b.size) * 0.35));
}

function Foundations({ content, onNext }: { content: Record<string, any>; onNext: () => void }) {
  const items = (content.items as { icon: string; title: string; body: string; status: string }[]) || [];
  return (
    <>
      <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 20 }}>{content.intro}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {items.map((f) => (
          <div key={f.title} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 13, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: c.muted }}>{f.body}</div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.green }}>{f.status}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={btnPrimary}>Continue to understand</button>
    </>
  );
}

function Understand({ content, conceptName, subject, explainMode, setExplainMode, onNext }: { content: Record<string, any>; conceptName: string; subject: string; explainMode: number; setExplainMode: (n: number) => void; onNext: () => void }) {
  const { toast } = useToast();
  const modes = (content.modes as string[]) || [];
  const texts = (content.texts as string[]) || [];
  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const explainAnother = () => {
    void recordEvent("simpler_explanation", { meta: { concept: conceptName } });
    setExplainMode((explainMode + 1) % Math.max(1, modes.length));
  };

  // Asking a clarifying question inside a Mastery Path is free — the path was
  // already paid for, and in-path help should never be a credit barrier
  // (matches the free in-path Mastery Check / diagnostic decision).
  const askQuestion = async () => {
    const q = askText.trim();
    if (!q) return;
    // Save the question (not the answer) — it's the confusion signal the
    // Intelligence Layer mines; the answer is derivable and low-value to hoard.
    void recordEvent("explanation_requested", { meta: { concept: conceptName, question: q } });
    setAsking(true);
    try {
      const answer = await answerConceptQuestion(conceptName, subject, texts[explainMode] || "", q);
      setAskAnswer(answer);
    } catch (e) {
      toast({ title: "Try again", description: e instanceof Error ? e.message : "Could not answer that just now.", variant: "destructive" });
    } finally {
      setAsking(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {modes.map((m, i) => (
          <button key={m} onClick={() => setExplainMode(i)} style={chip(explainMode === i)}>{m}</button>
        ))}
      </div>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 26, marginBottom: 16, fontSize: 15.5, lineHeight: 1.7, color: c.body }}><MathText text={texts[explainMode] || texts[0] || ""} /></div>
      {content.misconception && (
        <div style={{ background: c.amberTint, border: `1px solid ${c.amberBorder}`, borderRadius: 14, padding: "18px 20px", marginBottom: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.amber, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 7 }}>Common misconception</div>
          <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}><MathText text={content.misconception} /></div>
        </div>
      )}

      {askOpen && (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
          <textarea value={askText} onChange={(e) => setAskText(e.target.value)} placeholder="What do you want to ask about this?" rows={2} style={{ width: "100%", border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }} />
          {askAnswer && <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6, background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}><MathText text={askAnswer} /></div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => void askQuestion()} disabled={asking || !askText.trim()} style={{ ...btnPrimary, opacity: asking || !askText.trim() ? 0.6 : 1, cursor: asking || !askText.trim() ? "default" : "pointer" }}>{asking ? "Thinking…" : "Ask mytuta"}</button>
            <button type="button" onClick={() => { setAskOpen(false); setAskAnswer(""); setAskText(""); }} style={btnGhost}>Close</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onNext} style={btnPrimary}>I understand, continue</button>
        <button onClick={explainAnother} style={btnGhost}>Explain another way</button>
        {!askOpen && <button onClick={() => setAskOpen(true)} style={btnGhost}>Ask a question</button>}
      </div>
    </>
  );
}

function Worked({ content, onNext }: { content: Record<string, any>; onNext: () => void }) {
  const steps = (content.steps as { n: number; title: string; body: string }[]) || [];
  return (
    <>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "18px 22px", background: c.divider, fontWeight: 600, fontSize: 14.5 }}><MathText text={content.question} /></div>
        {steps.map((w) => (
          <div key={w.n} style={{ padding: "16px 22px", borderTop: `1px solid ${c.divider}`, display: "flex", gap: 14 }}>
            <span style={{ width: 24, height: 24, flex: "none", borderRadius: 7, background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{w.n}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}><MathText text={w.title} /></div>
              <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.6 }}><MathText text={w.body} /></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onNext} style={btnPrimary}>Let me try one</button>
        <button style={btnGhost}>Show another example</button>
      </div>
    </>
  );
}

function Recall({
  content, conceptId, conceptName, onRate, onNext,
}: {
  content: Record<string, any>;
  conceptId?: string;
  conceptName: string;
  onRate: (label: string) => void;
  onNext: () => void;
}) {
  const cards = useMemo(() => {
    const list = (content.cards as { front: string; back: string }[]) || [];
    if (list.length) return list;
    const front = String(content.card || content.intro || "Recall this idea");
    const back = String(content.answer || content.back || "Think through the key definition, then check your notes or the Understand stage.");
    return [{ front, back }];
  }, [content]);

  const ensureCards = useEnsureRecallCards();
  const rateCard = useRateRecallCard();
  const [cardState, setCardState] = useState<Record<string, RecallCardState>>({});

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const card = cards[Math.min(idx, cards.length - 1)];

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
    setDone(0);
    ensureCards.mutateAsync({ conceptId, conceptName, cards }).then(setCardState).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const rate = (label: string) => {
    if (!flipped) return;
    onRate(label);
    const persisted = cardState[card.front];
    if (persisted) {
      rateCard.mutate({ cardId: persisted.id, rating: label, priorIntervalDays: persisted.intervalDays });
    }
    const nextDone = done + 1;
    setDone(nextDone);
    if (idx + 1 >= cards.length) {
      onNext();
      return;
    }
    setIdx(idx + 1);
    setFlipped(false);
  };

  return (
    <>
      <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 20 }}>{content.intro || "Try to answer from memory, then reveal and rate yourself."}</p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        style={{
          width: "100%", background: "linear-gradient(160deg,#fffdf8,#f6f3ec)", border: `1px solid ${c.border}`,
          borderRadius: 18, padding: "44px 30px", textAlign: "center", marginBottom: 16, cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>
          Card {idx + 1} of {cards.length}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, marginBottom: 8, color: c.ink }}>
          <MathText text={flipped ? card.back : card.front} />
        </div>
        <div style={{ fontSize: 13, color: flipped ? c.green : c.placeholder }}>
          {flipped ? "How well did you remember? Rate below." : "Tap to reveal the answer"}
        </div>
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 12 }}>
        {recallRatings.map((r) => (
          <button
            key={r.label}
            type="button"
            disabled={!flipped}
            onClick={() => rate(r.label)}
            style={{
              background: c.surface, border: `1px solid ${r.bd}`, color: r.fg, fontWeight: 600, fontSize: 13,
              padding: 12, borderRadius: 11, cursor: flipped ? "pointer" : "not-allowed", opacity: flipped ? 1 : 0.45,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: c.faint }}>Rated {done} of {cards.length}. Reveal each answer before you rate.</p>
    </>
  );
}

function Guided({
  content, supportLevel, setSupportLevel, onStepResult, onNext,
}: {
  content: Record<string, any>;
  supportLevel: number;
  setSupportLevel: (n: number) => void;
  onStepResult: (ok: boolean) => void;
  onNext: () => void;
}) {
  const coach = ((content.coachSteps as { mark: string; bg: string; fg: string; q: string; hint: string; expected?: string }[]) || []).length
    ? (content.coachSteps as { mark: string; bg: string; fg: string; q: string; hint: string; expected?: string }[])
    : [
        { mark: "1", bg: "#eaf5ef", fg: "#2e9e6b", q: "What is the first idea you need?", hint: "Name the key concept in the question.", expected: "concept" },
        { mark: "2", bg: "#eaf1f7", fg: "#3f8fc4", q: "How do you use it here?", hint: "Link the concept to the situation in the question.", expected: "because" },
        { mark: "3", bg: "#fff7e9", fg: "#c47a17", q: "What is your conclusion?", hint: "State the final answer in one clear sentence.", expected: "therefore" },
      ];
  const [stepIdx, setStepIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealedWrong, setRevealedWrong] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setInput("");
    setFeedback(null);
    setShowHint(false);
    setRevealedWrong(false);
  }, [content, supportLevel]);

  const current = coach[Math.min(stepIdx, Math.max(0, coach.length - 1))];
  const expected = current?.expected || current?.hint || "";
  const supportNote =
    supportLevel === 0
      ? "Full guidance shows each coach step and the model reasoning."
      : supportLevel === 1
        ? "Light hints show the step question only. Ask for a hint if you need one."
        : "No hints. Solve the problem yourself. We only check your step.";

  const check = () => {
    if (!current) {
      onNext();
      return;
    }
    const ok = answerMatches(input, expected);
    onStepResult(ok);
    if (ok) {
      setFeedback("That step looks right. Move on.");
      setInput("");
      setShowHint(false);
      setRevealedWrong(false);
      if (stepIdx + 1 >= coach.length) {
        onNext();
      } else {
        setStepIdx(stepIdx + 1);
        setFeedback(null);
      }
    } else {
      setRevealedWrong(true);
      setFeedback(
        supportLevel === 2
          ? "Not quite. Try again with the key idea from the question."
          : "Not quite. Adjust your step, or open a hint.",
      );
      if (supportLevel === 0) setShowHint(true);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: c.faint, fontWeight: 600 }}>Support level</span>
        <div style={{ display: "inline-flex", background: "#efe9dc", borderRadius: 10, padding: 3 }}>
          {supportLevels.map((l, i) => (
            <button key={l} type="button" onClick={() => setSupportLevel(i)} style={seg(supportLevel === i)}>{l}</button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: c.muted, marginBottom: 16 }}>{supportNote}</p>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}><MathText text={content.question} /></div>

        {supportLevel === 0 && coach.map((cs, i) => (
          <div key={cs.q + i} style={{ display: "flex", gap: 13, padding: "13px 0", borderTop: `1px solid ${c.divider}`, opacity: i > stepIdx ? 0.35 : 1 }}>
            <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: cs.bg, color: cs.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{cs.mark}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}><MathText text={cs.q} /></div>
              {i <= stepIdx && <div style={{ fontSize: 13, color: c.soft, lineHeight: 1.55 }}><MathText text={cs.hint} /></div>}
            </div>
          </div>
        ))}

        {supportLevel === 1 && coach.slice(0, stepIdx + 1).map((cs, i) => (
          <div key={cs.q + i} style={{ display: "flex", gap: 13, padding: "13px 0", borderTop: `1px solid ${c.divider}` }}>
            <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: cs.bg, color: cs.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{cs.mark}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}><MathText text={cs.q} /></div>
              {(showHint && i === stepIdx) || i < stepIdx ? (
                <div style={{ fontSize: 13, color: c.soft, lineHeight: 1.55 }}><MathText text={i < stepIdx ? cs.hint : (showHint ? cs.hint : "")} /></div>
              ) : null}
            </div>
          </div>
        ))}

        {supportLevel === 2 && (
          <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 8, paddingTop: 8, borderTop: `1px solid ${c.divider}` }}>
            Step {Math.min(stepIdx + 1, coach.length || 1)} of {coach.length || 1}. Write your next reasoning step.
          </div>
        )}

        {current && supportLevel < 2 && (
          <div style={{ marginTop: 8, fontSize: 13, color: c.faint }}>
            Your turn: <MathText text={current.q} />
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") check(); }}
            placeholder="Type your next step"
            style={{ flex: 1, minHeight: 44, background: "#fff", border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 14px", color: c.ink, fontSize: 14 }}
          />
          <button type="button" onClick={check} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 18px", borderRadius: 10, cursor: "pointer" }}>Check</button>
        </div>
        {supportLevel === 1 && revealedWrong && !showHint && (
          <button type="button" onClick={() => setShowHint(true)} style={{ marginTop: 10, background: "none", border: "none", color: c.amber, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}>
            Show a light hint
          </button>
        )}
        {feedback && <p style={{ marginTop: 12, fontSize: 13.5, color: feedback.includes("right") ? c.green : c.amber }}>{feedback}</p>}
      </div>
    </>
  );
}

interface IndependentItem {
  mark: string; bg: string; fg: string; text: string; level: string;
  options: string[]; correctIndex: number; explanation: string;
  relatedConcept?: string; recommendedAction?: string; wrongCategories?: (string | null)[];
}

function Independent({
  content, conceptId, conceptName, onResult, onNext,
}: {
  content: Record<string, any>;
  conceptId?: string;
  conceptName: string;
  onResult: (ok: boolean) => void;
  onNext: () => void;
}) {
  const items = useMemo(() => (content.items as IndependentItem[]) || [], [content]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const logAttempt = useLogIndependentAttempt();

  useEffect(() => {
    setIdx(0);
    setPicked(null);
    setRevealed(false);
  }, [content]);

  if (items.length === 0 || !items[0]?.options?.length) {
    return (
      <>
        <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 20 }}>{content.intro || "Practise a mixed set of questions on your own."}</p>
        <button onClick={onNext} style={btnPrimary}>Continue to apply</button>
      </>
    );
  }

  const item = items[Math.min(idx, items.length - 1)];
  const isLast = idx + 1 >= items.length;
  const correct = picked !== null && picked === item.correctIndex;
  const mistakeCategory = picked !== null && !correct ? (item.wrongCategories?.[picked] || null) : null;

  const check = () => {
    if (picked === null) return;
    setRevealed(true);
    onResult(correct);
    logAttempt.mutate({ conceptId, conceptName, prompt: item.text, correct, mistakeCategory });
  };

  const next = () => {
    if (isLast) { onNext(); return; }
    setIdx(idx + 1);
    setPicked(null);
    setRevealed(false);
  };

  return (
    <>
      <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 16 }}>{content.intro || "Answer each question on your own, then check yourself."}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: c.faint, fontWeight: 600 }}>Question {idx + 1} of {items.length}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: item.fg || c.green, background: item.bg || c.greenTint, padding: "3px 10px", borderRadius: 20 }}>{item.level}</span>
      </div>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 16 }}><MathText text={item.text} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {item.options.map((opt, i) => {
            const on = picked === i;
            const isCorrectOpt = i === item.correctIndex;
            const showState = revealed && (on || isCorrectOpt);
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setPicked(i)}
                style={{
                  textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                  background: showState ? (isCorrectOpt ? c.greenTint : c.redTint) : on ? c.greenTint : c.surface,
                  border: `1px solid ${showState ? (isCorrectOpt ? c.greenTintBorder : "#f0c7b6") : on ? c.greenTintBorder : c.border2}`,
                  borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, cursor: revealed ? "default" : "pointer",
                }}
              >
                <span style={{ width: 20, height: 20, flex: "none", borderRadius: "50%", border: `2px solid ${on || (showState && isCorrectOpt) ? c.green : "#cbc3b2"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: on || (showState && isCorrectOpt) ? c.green : "#cbc3b2" }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <MathText text={opt} />
              </button>
            );
          })}
        </div>
      </div>

      {!revealed ? (
        <button type="button" disabled={picked === null} onClick={check} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: picked === null ? "not-allowed" : "pointer", opacity: picked === null ? 0.6 : 1 }}>Check answer</button>
      ) : (
        <div style={{ background: correct ? c.greenTint : c.amberTint, border: `1px solid ${correct ? c.greenTintBorder : c.amberBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: correct ? c.greenDark : c.amber, marginBottom: 8 }}>{correct ? "Correct" : "Not quite"}</div>
          {item.explanation && <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.6, marginBottom: 10 }}><MathText text={item.explanation} /></div>}
          {mistakeCategory && <div style={{ fontSize: 12.5, color: c.soft, marginBottom: 4 }}><strong>Mistake category:</strong> {mistakeCategory}</div>}
          {item.relatedConcept && <div style={{ fontSize: 12.5, color: c.soft, marginBottom: 4 }}><strong>Related concept:</strong> {item.relatedConcept}</div>}
          {item.recommendedAction && <div style={{ fontSize: 12.5, color: c.soft }}><strong>Try next:</strong> {item.recommendedAction}</div>}
          <button type="button" onClick={next} style={{ marginTop: 14, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>{isLast ? "Continue to apply" : "Next question"}</button>
        </div>
      )}
    </>
  );
}

function Apply({
  content, conceptName, onSubmit, onNext,
}: {
  content: Record<string, any>;
  conceptName: string;
  onSubmit: (words: number) => void;
  onNext: () => void;
}) {
  const badges = (content.badges as string[]) || ["Application"];
  const rubric = (content.rubric as string[]) || [
    "Name the concept clearly",
    "Connect it to a Ghanaian context",
    "Explain why your answer works",
  ];
  const takeHome = String(
    content.takeHome ||
      `Take-home task: Use ${conceptName} in a real situation near you (home, market, farm, clinic, or workshop). Write 4–6 sentences or short steps you could show a classmate.`,
  );
  const prompt = String(content.prompt || content.body || `Apply ${conceptName} to a real situation.`);
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const words = response.trim().split(/\s+/).filter(Boolean).length;
  const ready = words >= 25;

  const copyBrief = async () => {
    const text = `${content.title || conceptName}\n\n${takeHome}\n\nPrompt: ${prompt}\n\nChecklist:\n${rubric.map((r) => `- ${r}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: 8, background: c.plum }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {badges.map((b, i) => (
              <span key={b} style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? c.plum : c.green, background: i === 0 ? c.plumTint : c.greenTint, border: `1px solid ${i === 0 ? c.plumBorder : c.greenTintBorder}`, padding: "4px 11px", borderRadius: 20 }}>{b}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>{content.title || `Apply ${conceptName}`}</h2>
          <p style={{ fontSize: 14, color: c.soft, lineHeight: 1.65, marginBottom: 16 }}><MathText text={prompt} /></p>

          <div style={{ background: c.amberTint, border: `1px solid ${c.amberBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.amber, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Take home and practise</div>
            <div style={{ fontSize: 13.5, color: "#5c4a26", lineHeight: 1.55 }}><MathText text={takeHome} /></div>
            <button type="button" onClick={() => { void copyBrief(); }} style={{ marginTop: 10, background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 12.5, padding: "8px 12px", borderRadius: 9, cursor: "pointer" }}>
              {copied ? "Brief copied" : "Copy take-home brief"}
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>What a strong answer covers</div>
          <ul style={{ margin: "0 0 16px", paddingLeft: 18, color: c.soft, fontSize: 13.5, lineHeight: 1.55 }}>
            {rubric.map((r) => <li key={r}>{r}</li>)}
          </ul>

          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Your application</div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your solution here. Use a local example and show your reasoning."
            rows={6}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 14, lineHeight: 1.55, padding: 14, borderRadius: 12, border: `1px solid ${c.border}`, background: "#fff", color: c.ink, resize: "vertical", minHeight: 120 }}
          />
          <div style={{ fontSize: 12, color: ready ? c.green : c.faint, marginTop: 8 }}>
            {words} words · aim for at least 25 before you submit
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            onSubmit(words);
            setSubmitted(true);
          }}
          style={{ ...btnPrimary, opacity: ready ? 1 : 0.55, cursor: ready ? "pointer" : "not-allowed" }}
        >
          {submitted ? "Saved" : "Save my application"}
        </button>
        <button
          type="button"
          disabled={!submitted}
          onClick={onNext}
          style={{ ...btnGhost, opacity: submitted ? 1 : 0.55, cursor: submitted ? "pointer" : "not-allowed" }}
        >
          Continue to mastery check
        </button>
      </div>
    </>
  );
}

function scoreLabel(n: number): string {
  if (n >= 5) return "Secure";
  if (n >= 4) return "Strong";
  if (n >= 3) return "Developing";
  return "Beginning";
}

function Mastery({
  content, conceptName, subject, evidence, pathId, onSave,
}: {
  content: Record<string, any>;
  conceptName: string;
  subject: string;
  evidence: PathEvidence;
  pathId?: string;
  onSave: (r: { knowledge: number; application: number; analysis: number; overall: number; level: string; note: string }) => Promise<void>;
}) {
  const nav = useNavigate();
  const seeded = (content.questions as MasteryQuestion[]) || [];
  const [questions, setQuestions] = useState<MasteryQuestion[]>(seeded);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<"load" | "quiz" | "result">("load");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    knowledge: number; application: number; analysis: number; overall: number; level: string; note: string; how: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (seeded.length >= 4) {
      setQuestions(seeded.slice(0, 6));
      setAnswers(Array(Math.min(6, seeded.length)).fill(-1));
      setPhase("quiz");
      return;
    }
    setPhase("load");
    void generateMasteryQuestions(conceptName, subject)
      .then((qs) => {
        if (cancelled) return;
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(-1));
        setPhase("quiz");
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load mastery questions.");
          setPhase("quiz");
        }
      });
    return () => { cancelled = true; };
  }, [conceptName, subject, content]);

  const finish = async (finalAnswers: number[]) => {
    const byDim = { Knowledge: { ok: 0, n: 0 }, Application: { ok: 0, n: 0 }, Analysis: { ok: 0, n: 0 } };
    questions.forEach((q, i) => {
      const dim = q.dimension || "Knowledge";
      byDim[dim].n += 1;
      if (finalAnswers[i] === q.correctIndex) byDim[dim].ok += 1;
    });

    const quizScore = (d: keyof typeof byDim) => {
      if (byDim[d].n === 0) return 3;
      return Math.max(1, Math.round((byDim[d].ok / byDim[d].n) * 5));
    };

    let knowledge = quizScore("Knowledge");
    let application = quizScore("Application");
    let analysis = quizScore("Analysis");

    // Blend path evidence so earlier stages matter
    if (evidence.recallRated > 0) {
      const recallPct = evidence.recallGood / evidence.recallRated;
      knowledge = Math.round((knowledge * 0.7) + (recallPct * 5 * 0.3));
    }
    if (evidence.guidedTotal > 0) {
      const gPct = evidence.guidedCorrect / evidence.guidedTotal;
      analysis = Math.round((analysis * 0.65) + (gPct * 5 * 0.35));
      // More support used → slightly lower analysis credit for independence
      if (evidence.guidedSupport === 0) analysis = Math.max(1, analysis - 0.5);
    }
    if (evidence.independentTotal > 0) {
      const iPct = evidence.independentCorrect / evidence.independentTotal;
      knowledge = Math.round((knowledge * 0.8) + (iPct * 5 * 0.2));
    }
    if (evidence.applySubmitted) {
      const applyBoost = Math.min(5, 2 + Math.floor(evidence.applyWords / 40));
      application = Math.round((application * 0.55) + (applyBoost * 0.45));
    } else {
      application = Math.max(1, application - 1);
    }

    knowledge = Math.min(5, Math.max(1, Math.round(knowledge)));
    application = Math.min(5, Math.max(1, Math.round(application)));
    analysis = Math.min(5, Math.max(1, Math.round(analysis)));
    const overall = Math.round((knowledge + application + analysis) / 3);
    const level = overall >= 5 ? "Mastered" : overall >= 4 ? "Secure" : overall >= 3 ? "Developing" : "Beginning";
    const how = [
      `Knowledge ${knowledge}/5 from ${byDim.Knowledge.ok}/${byDim.Knowledge.n || 0} knowledge items` +
        (evidence.recallRated ? ` and recall ratings (${evidence.recallGood} solid of ${evidence.recallRated})` : "") +
        (evidence.independentTotal ? `, independent practice (${evidence.independentCorrect}/${evidence.independentTotal})` : ""),
      `Application ${application}/5 from ${byDim.Application.ok}/${byDim.Application.n || 0} application items` +
        (evidence.applySubmitted ? ` and your ${evidence.applyWords}-word Apply write-up` : " (Apply not submitted, score reduced)"),
      `Analysis ${analysis}/5 from ${byDim.Analysis.ok}/${byDim.Analysis.n || 0} analysis items` +
        (evidence.guidedTotal ? ` and guided practice (${evidence.guidedCorrect}/${evidence.guidedTotal} steps)` : ""),
      `Overall ${overall}/5 is the average of the three dimensions.`,
    ];
    const note = `You scored ${overall}/5 overall on ${conceptName}. ${level} means ${
      level === "Mastered" || level === "Secure"
        ? "you are ready to teach a peer the core ideas."
        : "keep practising the weaker dimension before you move on."
    }`;

    const payload = { knowledge, application, analysis, overall, level, note, how };
    setResult(payload);
    setPhase("result");
    if (pathId) {
      setSaving(true);
      try {
        await onSave(payload);
      } finally {
        setSaving(false);
      }
    }
  };

  if (phase === "load") return <Loading label={`Writing your ${conceptName} mastery check…`} />;

  if (phase === "result" && result) {
    const dims = [
      { name: "Knowledge", level: scoreLabel(result.knowledge), pct: result.knowledge * 20, color: "#2e9e6b", score: result.knowledge },
      { name: "Application", level: scoreLabel(result.application), pct: result.application * 20, color: "#c47a17", score: result.application },
      { name: "Analysis", level: scoreLabel(result.analysis), pct: result.analysis * 20, color: "#c05a2e", score: result.analysis },
    ];
    return (
      <>
        <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 22 }}>
          Your result is a profile from this check plus your path work, not a mystery score.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {dims.map((d) => (
            <div key={d.name} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "17px 19px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.score}/5 · {d.level}</span>
              </div>
              <Bar pct={d.pct} color={d.color} />
            </div>
          ))}
        </div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>How this was calculated</div>
          {result.how.map((line) => (
            <div key={line} style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.5, marginBottom: 8 }}>• {line}</div>
          ))}
        </div>
        <div style={{ background: "linear-gradient(135deg,#eaf5ef,#f3faf5)", border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: 22, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Overall status</div>
            <div style={{ fontFamily: font.display, fontSize: 24, color: c.ink }}>{result.overall}/5 · {result.level}</div>
            <div style={{ fontSize: 13.5, color: c.soft, marginTop: 6, lineHeight: 1.5 }}>{result.note}</div>
            {saving && <div style={{ fontSize: 12.5, color: c.faint, marginTop: 8 }}>Saving to your progress…</div>}
          </div>
          <button type="button" onClick={() => nav("/student/progress")} style={{ flex: "none", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 11, cursor: "pointer" }}>See progress</button>
        </div>
      </>
    );
  }

  if (!questions.length) {
    return (
      <EmptyState
        title="Mastery check unavailable"
        body={error || "Questions did not load. Go back a stage and try again."}
      />
    );
  }

  const q = questions[idx];
  return (
    <>
      <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 12 }}>
        Answer {questions.length} mixed items. Scores combine this quiz with Recall, Guided practice, and Apply.
      </p>
      <div style={{ fontSize: 12.5, color: c.faint, fontWeight: 600, marginBottom: 14 }}>
        Question {idx + 1} of {questions.length} · {q.dimension}
      </div>
      <h2 style={{ fontSize: 20, lineHeight: 1.35, marginBottom: 18 }}><MathText text={q.prompt} /></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {q.options.map((opt, i) => {
          const on = picked === i;
          return (
            <button
              key={opt + i}
              type="button"
              onClick={() => setPicked(i)}
              style={{
                textAlign: "left", display: "flex", alignItems: "center", gap: 13, background: c.surface,
                border: `1px solid ${on ? c.greenTintBorder : c.border2}`, borderRadius: 12, padding: "14px 16px",
                fontSize: 14.5, color: c.ink, cursor: "pointer",
              }}
            >
              <span style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", border: `2px solid ${on ? c.green : "#cbc3b2"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: on ? c.green : "#cbc3b2" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <MathText text={opt} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={picked === null}
        onClick={() => {
          const next = [...answers];
          next[idx] = picked ?? -1;
          setAnswers(next);
          if (idx + 1 >= questions.length) {
            void finish(next);
          } else {
            setIdx(idx + 1);
            setPicked(null);
          }
        }}
        style={{ ...btnPrimary, opacity: picked === null ? 0.55 : 1, width: "100%" }}
      >
        {idx + 1 >= questions.length ? "See my mastery profile" : "Next item"}
      </button>
    </>
  );
}

const btnPrimary = { background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 11, cursor: "pointer" } as const;
const btnGhost = { background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "12px 18px", borderRadius: 11, cursor: "pointer" } as const;
