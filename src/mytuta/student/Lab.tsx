import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, filter, seg } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useLayout, pageBox } from "../layout";
import { MathText } from "../MathText";
import type { LabActivityVM } from "../data/queries";
import { useLabActivities } from "../data/queries";
import { useRecordLabObservation, useCompleteLabActivity } from "../data/mutations";
import { getLabAssistantHint } from "../data/ai";

type View = "list" | "detail" | "prediction" | "run" | "reflection" | "done";

const facets: { label: string; get: (a: LabActivityVM) => string }[] = [
  { label: "Equipment", get: (a) => a.equip },
  { label: "Subject", get: (a) => a.subject },
  { label: "Difficulty", get: (a) => a.difficulty },
  { label: "Team", get: (a) => a.teamMode },
];

export default function Lab() {
  const L = useLayout();
  const nav = useNavigate();
  const { data: activities, isLoading } = useLabActivities();
  const [view, setView] = useState<View>("list");
  const [facetIdx, setFacetIdx] = useState(0);
  const [value, setValue] = useState("All");
  const [sel, setSel] = useState(0);
  const [step, setStep] = useState(0);
  const [observations, setObservations] = useState<Record<number, string>>({});
  const [prediction, setPrediction] = useState("");
  const [predictionAccurate, setPredictionAccurate] = useState<boolean | undefined>(undefined);
  const [reflection, setReflection] = useState<Record<number, string>>({});
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const recordObservation = useRecordLabObservation();
  const completeActivity = useCompleteLabActivity();

  const all = activities || [];
  const facet = facets[facetIdx];

  const values = useMemo(() => {
    const set = new Set<string>();
    all.forEach((a) => { const v = facet.get(a).trim(); if (v) set.add(v); });
    return ["All", ...Array.from(set).sort()];
  }, [all, facet]);

  const list = useMemo(() => {
    if (value === "All") return all;
    return all.filter((a) => facet.get(a).toLowerCase().includes(value.toLowerCase()));
  }, [all, facet, value]);

  if (isLoading) return <Loading label="Loading practical activities…" />;
  if (all.length === 0) return <EmptyState title="No activities yet" body="Practical activities will appear here once content is loaded from the STEM catalog." />;
  const current = list[Math.min(sel, Math.max(0, list.length - 1))] || all[0];

  const resetActivity = () => {
    setObservations({});
    setPrediction("");
    setPredictionAccurate(undefined);
    setReflection({});
    setHint(null);
    setStep(0);
  };

  const openActivity = (i: number) => {
    setSel(i);
    resetActivity();
    setView("detail");
  };

  const askLabAssistant = async () => {
    const stepCur = current.steps[step];
    if (!stepCur) return;
    setHint(null);
    setHintLoading(true);
    try {
      const h = await getLabAssistantHint({
        labTitle: current.title,
        stepTitle: stepCur.title,
        stepBody: stepCur.body,
        studentObservation: observations[step] || "",
        conceptName: current.conceptName || current.demonstrates,
      });
      setHint(h);
    } catch {
      setHint("Could not reach the Lab Assistant right now. Try again in a moment.");
    } finally {
      setHintLoading(false);
    }
  };

  if (view === "list") {
    return (
      <div style={pageBox(L.pad, 1080)}>
        <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 18 }}>Apply what you learn through practical activities from the STEM catalog. Filter by what fits your class.</p>
        <div style={{ display: "inline-flex", background: "#efe9dc", borderRadius: 10, padding: 3, marginBottom: 14, flexWrap: "wrap" }}>
          {facets.map((f, i) => (
            <button key={f.label} type="button" onClick={() => { setFacetIdx(i); setValue("All"); setSel(0); }} style={seg(facetIdx === i)}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {values.map((v) => (
            <button key={v} type="button" onClick={() => { setValue(v); setSel(0); }} style={filter(value === v)}>{v}</button>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState title="Nothing in this filter" body={`No catalog activities match "${value}" yet. Try All or another facet.`} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: L.g3, gap: 14 }}>
            {list.map((a, i) => (
              <button key={a.id} type="button" onClick={() => openActivity(i)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 6, background: a.color }} />
                <div style={{ padding: "18px 19px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: a.catFg, background: a.catBg, padding: "3px 9px", borderRadius: 20 }}>{a.cat}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3, marginBottom: 7 }}>{a.title}</div>
                  {a.mission && <div style={{ fontSize: 12.5, color: c.body, lineHeight: 1.5, marginBottom: 8, fontStyle: "italic" }}>{a.mission}</div>}
                  <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5, marginBottom: 13 }}>{a.body}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, color: c.faint }}>
                    <span style={{ fontWeight: 600, color: c.green }}>{a.equip}</span>
                    <span>·</span>
                    <span>{a.time}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "detail") {
    return (
      <div style={pageBox(L.pad, 720)}>
        <button onClick={() => setView("list")} style={backBtn}>← All activities</button>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: current.catFg, background: current.catBg, padding: "4px 11px", borderRadius: 20, marginBottom: 12 }}>{current.cat}</span>
        <h1 style={{ fontSize: 27, lineHeight: 1.15, marginBottom: 8 }}>{current.title}</h1>
        {current.mission && (
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>The question you are investigating</div>
            <p style={{ fontSize: 16, fontWeight: 500, color: c.ink, lineHeight: 1.45, margin: 0 }}>{current.mission}</p>
          </div>
        )}
        <p style={{ fontSize: 15, color: c.muted, marginBottom: 18 }}>{current.body}</p>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", padding: "14px 0 22px", borderBottom: `1px solid ${c.border2}`, marginBottom: 22 }}>
          <Meta label="Equipment" value={current.equip} valueColor={c.green} />
          <Meta label="Time" value={current.time} />
          {current.difficulty && <Meta label="Difficulty" value={current.difficulty} />}
          {current.teamMode && <Meta label="Best done" value={current.teamMode} />}
        </div>
        {current.skillTags && current.skillTags.length > 0 && (
          <>
            <div style={labelStyle}>Skills you will practise</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {current.skillTags.map((s) => (
                <span key={s} style={{ fontSize: 12, fontWeight: 600, color: current.catFg, background: current.catBg, padding: "5px 12px", borderRadius: 20 }}>{s}</span>
              ))}
            </div>
          </>
        )}
        {current.dimensions.length > 0 && current.skillTags?.length === 0 && (
          <>
            <div style={labelStyle}>Assessment dimensions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {current.dimensions.map((d) => (
                <span key={d} style={{ fontSize: 12, fontWeight: 600, color: current.catFg, background: current.catBg, padding: "5px 12px", borderRadius: 20 }}>{d}</span>
              ))}
            </div>
          </>
        )}
        <div style={labelStyle}>Objective</div>
        <p style={{ fontSize: 14.5, color: c.body, lineHeight: 1.6, marginBottom: 22 }}>{current.objective}</p>
        <div style={labelStyle}>What you will need</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {current.materials.map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 11, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 11, padding: "11px 14px", fontSize: 13.5, color: c.body }}>
              <span style={{ width: 6, height: 6, flex: "none", borderRadius: "50%", background: c.green }} />{m}
            </div>
          ))}
        </div>
        <div style={{ background: c.amberTint, border: `1px solid ${c.amberBorder}`, borderRadius: 14, padding: "15px 17px", marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.amber, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 7 }}>Safety</div>
          <div style={{ fontSize: 13.5, color: "#5c4a26", lineHeight: 1.55 }}>{current.safety}</div>
        </div>
        <button
          onClick={() => { resetActivity(); setView(current.predictionPrompt ? "prediction" : "run"); }}
          style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer" }}
        >Start activity</button>
      </div>
    );
  }

  // PREDICTION VIEW — appears before the first step when the lab has a predictionPrompt
  if (view === "prediction") {
    return (
      <div style={pageBox(L.pad, 680)}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.title}</button>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Before you begin</div>
        <h2 style={{ fontSize: 23, lineHeight: 1.2, marginBottom: 16 }}>{current.mission}</h2>
        <p style={{ fontSize: 14.5, color: c.muted, lineHeight: 1.6, marginBottom: 22 }}>Scientists write down their predictions before collecting data. This forces you to think first, not just observe. Your prediction does not need to be correct — what matters is the reasoning behind it.</p>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 18, padding: "24px 22px", marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, lineHeight: 1.5, marginBottom: 14 }}>{current.predictionPrompt}</div>
          <textarea
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Write your prediction and the reason behind it…"
            rows={4}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#fff", border: `1px solid ${c.border}`, borderRadius: 11, padding: "14px 15px", color: c.ink, fontSize: 14, minHeight: 96, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <button
          onClick={() => setView("run")}
          style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", opacity: prediction.trim().length < 10 ? 0.55 : 1 }}
          disabled={prediction.trim().length < 10}
        >Start the activity</button>
        {prediction.trim().length < 10 && (
          <p style={{ fontSize: 12.5, color: c.faint, textAlign: "center", marginTop: 10 }}>Write at least a sentence before starting.</p>
        )}
      </div>
    );
  }

  // RUN VIEW
  if (view === "run") {
    const stepCur = current.steps[Math.min(step, current.steps.length - 1)];
    const last = step + 1 >= current.steps.length;
    return (
      <div style={pageBox(L.pad, 680)}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.title}</button>
        <div style={{ display: "flex", gap: 7, marginBottom: 24 }}>
          {current.steps.map((st, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 5, borderRadius: 3, background: i <= step ? c.green : c.track, marginBottom: 6 }} />
              <div style={{ fontSize: 10.5, fontWeight: 600, color: i <= step ? c.greenDark : c.placeholder }}>{st.phase}</div>
            </div>
          ))}
        </div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 18, padding: "28px 26px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>{stepCur.phase} · Step {step + 1} of {current.steps.length}</div>
          <h2 style={{ fontSize: 21, marginBottom: 10 }}>{stepCur.title}</h2>
          <p style={{ fontSize: 15, color: c.body, lineHeight: 1.65 }}><MathText text={stepCur.body} /></p>
          {stepCur.watchFor && (
            <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 11, padding: "12px 14px", marginTop: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase" }}>Watch for: </span>
              <span style={{ fontSize: 13, color: c.ink, lineHeight: 1.55 }}><MathText text={stepCur.watchFor} /></span>
            </div>
          )}
          {stepCur.record && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Record your result</div>
              <textarea
                value={observations[step] || ""}
                onChange={(e) => setObservations((prev) => ({ ...prev, [step]: e.target.value }))}
                placeholder={stepCur.thinkingPrompt || "Write what you observed…"}
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#fff", border: `1px solid ${c.border}`, borderRadius: 11, padding: "14px 15px", color: c.ink, fontSize: 13.5, minHeight: 64, outline: "none", fontFamily: "inherit" }}
              />
            </div>
          )}
        </div>

        {/* Lab Assistant */}
        <div style={{ marginBottom: 16 }}>
          {hint && (
            <div style={{ background: "#F5F0FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#5c2d91", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Lab Assistant</div>
              <p style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.6, margin: 0 }}>{hint}</p>
            </div>
          )}
          <button
            type="button"
            onClick={askLabAssistant}
            disabled={hintLoading}
            style={{ background: "none", border: `1px solid #C4B5FD`, color: "#5c2d91", fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 9, cursor: hintLoading ? "default" : "pointer", opacity: hintLoading ? 0.6 : 1 }}
          >{hintLoading ? "Thinking…" : hint ? "Ask again" : "Ask for a hint"}</button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              setHint(null);
              if (step <= 0) setView(current.predictionPrompt ? "prediction" : "detail");
              else setStep(step - 1);
            }}
            style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}
          >Back</button>
          <button
            onClick={() => {
              if (stepCur.record && observations[step]?.trim()) {
                recordObservation.mutate({ activityTitle: current.title, stepTitle: stepCur.title, observation: observations[step] });
              }
              setHint(null);
              if (last) {
                setView(current.reflectionPrompts?.length ? "reflection" : "done");
              } else {
                setStep(step + 1);
              }
            }}
            style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer" }}
          >{last ? (current.reflectionPrompts?.length ? "Reflect on this activity" : "Finish activity") : "Next step"}</button>
        </div>
      </div>
    );
  }

  // REFLECTION VIEW
  if (view === "reflection" && current.reflectionPrompts) {
    const prompts = current.reflectionPrompts;
    const allAnswered = prompts.every((_, i) => reflection[i]?.trim().length > 0);
    return (
      <div style={pageBox(L.pad, 680)}>
        <button onClick={() => setView("run")} style={backBtn}>← Back to activity</button>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Reflection</div>
        <h2 style={{ fontSize: 23, lineHeight: 1.2, marginBottom: 8 }}>What did you learn?</h2>
        <p style={{ fontSize: 14.5, color: c.muted, lineHeight: 1.6, marginBottom: 24 }}>Good scientists do not just collect data — they think about what it means. Answer these short questions before you finish.</p>

        {prediction && (
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 18px", marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Your original prediction</div>
            <p style={{ fontSize: 14, color: c.ink, lineHeight: 1.55, margin: "0 0 12px" }}>{prediction}</p>
            <div style={{ fontSize: 13, color: c.muted, marginBottom: 8 }}>Was your prediction accurate?</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Yes, it matched","Partly right","No, it was different"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setPredictionAccurate(i === 0 ? true : i === 2 ? false : true)}
                  style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: `1px solid ${c.border}`, background: predictionAccurate === (i === 0 ? true : i === 2 ? false : true) && predictionAccurate !== undefined ? c.green : "#fff", color: predictionAccurate === (i === 0 ? true : i === 2 ? false : true) && predictionAccurate !== undefined ? "#fff" : c.ink, cursor: "pointer" }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}

        {prompts.map((prompt, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, marginBottom: 10 }}>{prompt}</div>
            <textarea
              value={reflection[i] || ""}
              onChange={(e) => setReflection((prev) => ({ ...prev, [i]: e.target.value }))}
              placeholder="Write your answer…"
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#fff", border: `1px solid ${c.border}`, borderRadius: 11, padding: "14px 15px", color: c.ink, fontSize: 13.5, minHeight: 72, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        ))}

        <button
          onClick={() => {
            completeActivity.mutate({
              labId: current.id,
              labTitle: current.title,
              conceptSlug: current.conceptSlug,
              conceptName: current.conceptName,
              skillTags: current.skillTags,
              observations,
              reflection,
              prediction: prediction || undefined,
              predictionAccurate,
            });
            setView("done");
          }}
          style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, cursor: "pointer", opacity: allAnswered ? 1 : 0.55 }}
          disabled={!allAnswered}
        >Finish and save my work</button>
        {!allAnswered && <p style={{ fontSize: 12.5, color: c.faint, textAlign: "center", marginTop: 10 }}>Answer all three questions to finish.</p>}
      </div>
    );
  }

  // DONE VIEW
  return (
    <div style={pageBox(L.padTall, 640)}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Activity complete</div>
      <h1 style={{ fontSize: 27, lineHeight: 1.15, marginBottom: 8 }}>{current.title}</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>Nicely done. You have turned a concept into something you did with your own hands.</p>

      {current.whatThisProves ? (
        <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>What this proves</div>
          <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.65 }}>{current.whatThisProves}</div>
        </div>
      ) : (
        <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>What this shows</div>
          <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6 }}>This activity is evidence of <strong>{current.demonstrates}</strong>. Open Learn to connect this practical work to a mastery path and track it in Progress.</div>
        </div>
      )}

      {current.skillTags && current.skillTags.length > 0 && (
        <div style={{ background: "#F5F0FF", border: "1px solid #C4B5FD", borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5c2d91", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Skills demonstrated</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {current.skillTags.map((s) => (
              <span key={s} style={{ fontSize: 12.5, fontWeight: 600, color: "#5c2d91", background: "#EDE9FE", padding: "5px 12px", borderRadius: 20 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {current.conceptSlug && (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>Concept link</div>
          <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.55, marginBottom: 10 }}>This activity connects to <strong>{current.conceptName || "a concept"}</strong> in your mastery library. Build on what you just did.</div>
          <button type="button" onClick={() => nav(`/student/learn?concept=${current.conceptSlug}`)} style={{ background: "#7c3aed", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 9, cursor: "pointer" }}>
            Go to mastery path
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => nav("/student/progress")} style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer" }}>See it in Progress</button>
        <button onClick={() => setView("list")} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>More activities</button>
      </div>
    </div>
  );
}

function Meta({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: c.faint, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: valueColor }}>{value}</div>
    </div>
  );
}

const backBtn = { background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 } as const;
const labelStyle = { fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 11 } as const;
