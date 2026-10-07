/**
 * mytuta AI helpers — Ghana-grounded STEM content via Groq proxy (/api/groq).
 */
import { groqApiService } from "@/services/groqApiService";
import { studioAiText } from "./constants";
import { sanitizeLlmJson } from "./jsonRepair";

const SYSTEM = `You write STEM teaching content for Ghanaian secondary learners (JHS/SHS and WASSCE).
Use clear English. Prefer local examples from Accra, Kumasi, Takoradi, farms, markets, and household life.
Never use em dashes. Never use filler phrases like unlock the power, cutting-edge, or game-changing.
Wrap every formula, fraction, equation, unit expression, or chemical notation in single dollar signs for
inline math (e.g. $v^2 = u^2 + 2as$, $\\frac{1}{2}mv^2$, $H_2O$) or double dollar signs for a standalone
equation on its own line (e.g. $$F = ma$$). Do this even for simple expressions like $x = 5$ or $6 \\text{ cm}$.
Never use dollar signs for anything that is not math.
Respond with ONLY valid JSON when asked for JSON. No markdown fences.`;

// LLM output often contains raw LaTeX backslashes or literal control characters
// inside JSON string values, both illegal in strict JSON. Try the fast path
// first; only pay for the character-by-character repair when that fails.
function parseJsonSlice<T>(slice: string): T {
  try { return JSON.parse(slice) as T; }
  catch { return JSON.parse(sanitizeLlmJson(slice)) as T; }
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return parseJsonSlice<T>(cleaned.slice(start, end + 1));
  }
  const a = cleaned.indexOf("[");
  const b = cleaned.lastIndexOf("]");
  if (a >= 0 && b > a) {
    return parseJsonSlice<T>(cleaned.slice(a, b + 1));
  }
  return parseJsonSlice<T>(cleaned);
}

export type ExperienceDraft = {
  title: string;
  subject: string;
  form: string;
  stages_count: number;
  sections: { name: string; body: string }[];
};

export async function generateExperienceDraft(input: {
  subject: string;
  concept: string;
  stage: string;
  objective: string;
  components: string[];
  constraints: string[];
  materialNote?: string;
  pastedContent?: string;
}): Promise<ExperienceDraft> {
  const concept = input.concept.trim() || "Photosynthesis";
  const subject = input.subject.trim() || "Integrated Science";
  const stage = input.stage.trim() || "Form 2 · Lower secondary";
  const objective = input.objective.trim() || `Explain ${concept}`;
  const components = input.components.length
    ? input.components
    : ["Diagnostic", "Concept explanation", "Worked examples", "Guided practice", "Practical application", "Mastery check"];
  const constraints = input.constraints.length ? input.constraints : ["Household materials"];
  const pasted = input.pastedContent?.trim();

  try {
    const raw = await groqApiService.makeRequest(
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Create a learning experience draft as JSON with keys:
title (string), subject (string), form (string, e.g. "${subject} · ${stage}"), stages_count (number),
sections (array of {name, body} for these stage names in order: ${JSON.stringify(components)}).
Each body is 2-4 short paragraphs teachers can edit. Ground the concept "${concept}".
Learning objective: ${objective}. Practical constraints: ${constraints.join(", ")}.
${input.materialNote ? `Source material: ${input.materialNote}.` : ""}
${pasted ? `Base the content on this material the teacher provided, adapting it rather than inventing unrelated content:\n${pasted.slice(0, 4000)}` : ""}
Keep each body under 120 words.`,
        },
      ],
      3500,
    );
    const parsed = parseJson<ExperienceDraft>(raw);
    if (!parsed.title || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new Error("Incomplete draft");
    }
    return {
      title: parsed.title,
      subject: parsed.subject || subject,
      form: parsed.form || `${subject} · ${stage}`,
      stages_count: parsed.stages_count || parsed.sections.length,
      sections: parsed.sections.map((s) => ({
        name: s.name || "Section",
        body: s.body || `Draft content for ${concept}.`,
      })),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Missing key / proxy down: fail loudly so the UI does not look like "mock mode"
    if (/GROQ_API_KEY|not configured|Failed to fetch|All models failed/i.test(msg)) {
      throw new Error(
        "AI is not reachable. Check GROQ_API_KEY in .env (no VITE_ prefix) and restart npm run dev.",
      );
    }
    throw err;
  }
}

export async function generateStudioAssist(input: {
  action: string;
  topic: string;
  sectionName: string;
  sectionBody: string;
  regenerate?: boolean;
}): Promise<string> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Teacher action: "${input.action}".
Topic: ${input.topic}.
Current section (${input.sectionName}): ${input.sectionBody.slice(0, 800)}

Return JSON: {"text":"..."} with 80-160 words the teacher can insert into this section.
Match the action exactly (simplify, local Ghana example, worked example, misconception, etc.).
${input.regenerate ? "The teacher asked for another version of this. Write a genuinely different take (different example, different wording, different structure), not a paraphrase of the same one." : ""}`,
      },
    ],
    1200,
  );
  try {
    const parsed = parseJson<{ text: string }>(raw);
    if (parsed.text?.trim()) return parsed.text.trim();
  } catch {
    // Model returned prose instead of JSON — still usable
    if (raw?.trim()) return raw.trim();
  }
  const fallback = studioAiText[input.action];
  if (fallback) return fallback;
  throw new Error("The assistant returned an empty draft. Try that action again.");
}

export type DiagnosticQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type DiagnosticResult = {
  known: string[];
  gaps: string[];
  summary: string;
};

export async function generateDiagnostic(conceptName: string, subject: string): Promise<DiagnosticQuestion[]> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Create a 5-question diagnostic for "${conceptName}" (${subject}) for Ghana lower/upper secondary.
Return JSON: {"questions":[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0}]}.
Exactly 5 questions. correctIndex is 0-3. Questions must be about ${conceptName}, not a different topic.`,
      },
    ],
    2200,
  );
  const parsed = parseJson<{ questions: DiagnosticQuestion[] }>(raw);
  const qs = (parsed.questions || []).filter((q) => q.prompt && Array.isArray(q.options) && q.options.length >= 2);
  if (qs.length < 3) throw new Error("Diagnostic came back incomplete. Try again.");
  return qs.slice(0, 5).map((q) => ({
    prompt: q.prompt,
    options: q.options.slice(0, 4),
    correctIndex: Math.min(Math.max(0, Number(q.correctIndex) || 0), Math.min(3, q.options.length - 1)),
  }));
}

export async function generateDiagnosticResult(input: {
  conceptName: string;
  subject: string;
  questions: DiagnosticQuestion[];
  answers: number[];
}): Promise<DiagnosticResult> {
  const transcript = input.questions.map((q, i) => ({
    prompt: q.prompt,
    chosen: q.options[input.answers[i]] ?? "(skipped)",
    correct: q.options[q.correctIndex],
    ok: input.answers[i] === q.correctIndex,
  }));
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Learner diagnostic on "${input.conceptName}" (${input.subject}).
Answers: ${JSON.stringify(transcript)}
Return JSON: {"known":["..."],"gaps":["..."],"summary":"..."}.
known = 1-3 secure ideas. gaps = 1-4 things to teach next. Ground in the answers.`,
      },
    ],
    1200,
  );
  const parsed = parseJson<DiagnosticResult>(raw);
  return {
    known: parsed.known?.length ? parsed.known : ["You attempted the check"],
    gaps: parsed.gaps?.length ? parsed.gaps : [`Core ideas in ${input.conceptName}`],
    summary: parsed.summary || `We will start your ${input.conceptName} path from what still needs work.`,
  };
}

export type GeneratedStage = {
  ord: number;
  name: string;
  loop_phase: string;
  description: string;
  est_time: string;
  content: Record<string, unknown>;
};

export async function generateConceptStages(conceptName: string, subject: string): Promise<GeneratedStage[]> {
  const names = [
    "Foundations",
    "Understand",
    "Worked examples",
    "Recall",
    "Guided practice",
    "Independent practice",
    "Apply",
    "Mastery check",
  ];
  const phases = ["Diagnose", "Understand", "Understand", "Recall", "Practise", "Practise", "Apply", "Prove"];
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Build an 8-stage mastery path for "${conceptName}" (${subject}).
Return JSON: {"stages":[{"ord":0,"name":"Foundations","loop_phase":"Diagnose","description":"...","est_time":"3 min","content":{...}}]}.
Use these stage names in order: ${JSON.stringify(names)}.
Phases in order: ${JSON.stringify(phases)}.
content must be rich JSON matching the stage:
- Foundations: {intro, items:[{icon,title,body,question:{prompt,options:["A","B","C","D"],correctIndex:0,explanation}}]} — each item has one diagnostic MCQ question that tests prior knowledge of that specific idea before the student starts
- Understand: {modes:["Core explanation","Analogy","Step by step","Visual description","Real-world example"], texts:[5 paragraphs — one per mode, each a genuinely different angle on the concept], misconception}
- Worked examples: {question, steps:[{n,title,body}]}
- Recall: {intro, cards:[{front,back}], count}
- Guided practice: {question, coachSteps:[{mark,bg,fg,q,hint,expected}]}
- Independent practice: {intro, items:[{mark,bg,fg,text,level,options:["A","B","C","D"],correctIndex:0,explanation:"...",relatedConcept:"...",recommendedAction:"...",wrongCategories:["...","...","...","..."]}]}
- Apply: {badges, title, body, takeHome, prompt, rubric:["..."]}
- Mastery check: {intro, questions:[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0,"dimension":"Knowledge|Application|Analysis"}]}
All content must be about ${conceptName}, Ghana-grounded. expected is a short model answer for checking learner steps.
For Understand: modes must be exactly ["Core explanation","Analogy","Step by step","Visual description","Real-world example"] in that order. Each text in texts[] is a plain-English paragraph written for that specific mode — do not use "Reading", "Video", "Simulation", "Discussion", or "Summary" as mode names. The app renders all modes as text; do not promise video or interactive content.
CRITICAL: every question-like field (Worked examples "question", Guided practice "question" and each coachStep "q",
Independent practice "text", Apply "prompt", Mastery check "prompt") MUST be fully self-contained: state every
number, equation, or given value needed to answer it right there in that field. Never write a vague stem like
"What is the value of x?" that depends on an equation shown elsewhere; write the full equation or scenario inline,
e.g. "Solve for x: $\\frac{1}{2}x = \\frac{3}{4}$. What is the value of x?". A student must be able to answer using
only that one field, with no other stage open.
For Independent practice: exactly 5 items, MCQ with 4 options each. "level" must be one of exactly
Foundational, Standard, Advanced, Mixed application (progress roughly in that order across the 5 items).
"explanation" explains why the correct option is right. "relatedConcept" names one connected idea worth
reviewing. "recommendedAction" is one short next step for a student who got it wrong. "wrongCategories" has
the SAME length as "options": put null at correctIndex, and at every other index put exactly one of these
7 labels describing why a student might pick that specific wrong option: Concept error, Method error,
Formula error, Calculation error, Unit error, Interpretation error, Incomplete reasoning.`,
      },
    ],
    6000,
  );
  const parsed = parseJson<{ stages: GeneratedStage[] }>(raw);
  const stages = parsed.stages || [];
  if (stages.length < 6) throw new Error("Path build was incomplete. Try again.");
  return names.map((name, ord) => {
    const found = stages.find((s) => s.name === name) || stages[ord];
    return {
      ord,
      name,
      loop_phase: found?.loop_phase || phases[ord],
      description: found?.description || `Stage for ${conceptName}`,
      est_time: found?.est_time || "8 min",
      content: found?.content || { intro: `Work on ${conceptName}.` },
    };
  });
}

export interface ConfirmationQuestion {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export async function generateConfirmationQuestion(
  conceptName: string,
  subject: string,
): Promise<ConfirmationQuestion> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Generate one unseen application question to confirm a student has genuinely understood "${conceptName}" (${subject}).

Rules:
- This question tests TRANSFER — the student must apply the concept to a scenario they have not seen before, not just recall a definition or repeat a worked example.
- Use a real-world Ghanaian context (market, farm, household, road, trotro, Accra, Kumasi, etc.).
- MCQ with exactly 4 options. Only one is correct.
- The explanation must say WHY the correct answer is right and what concept it demonstrates.
- Do not use em dashes. Do not use filler phrases.

Return JSON exactly: {"prompt":"...","options":["A text","B text","C text","D text"],"correctIndex":0,"explanation":"..."}
correctIndex is 0-based.`,
      },
    ],
    800,
  );
  const q = parseJson<ConfirmationQuestion>(raw);
  if (!q?.prompt || !q?.options || q.correctIndex === undefined) {
    throw new Error("Confirmation question generation failed");
  }
  return q;
}

export async function answerConceptQuestion(conceptName: string, subject: string, contextText: string, question: string): Promise<string> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `A student learning "${conceptName}" (${subject}) just read this explanation:
"""${contextText}"""
They asked: "${question}"
Answer their question directly in plain language, grounded in ${conceptName}, in 2 to 3 short paragraphs.
Return JSON: {"answer":"..."}.`,
      },
    ],
    900,
  );
  const parsed = parseJson<{ answer?: string }>(raw);
  return parsed.answer || "Bring this question to your teacher for a closer look.";
}

export type MasteryQuestion = DiagnosticQuestion & { dimension: "Knowledge" | "Application" | "Analysis" };

export async function generateMasteryQuestions(conceptName: string, subject: string): Promise<MasteryQuestion[]> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Create 6 mastery-check MCQs for "${conceptName}" (${subject}).
Return JSON: {"questions":[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0,"dimension":"Knowledge"}]}.
Exactly 2 Knowledge, 2 Application, 2 Analysis. Ghana-grounded.`,
      },
    ],
    2200,
  );
  const parsed = parseJson<{ questions: MasteryQuestion[] }>(raw);
  const qs = (parsed.questions || []).filter((q) => q.prompt && Array.isArray(q.options));
  if (qs.length < 4) throw new Error("Mastery check questions were incomplete. Try again.");
  return qs.slice(0, 6).map((q) => ({
    prompt: q.prompt,
    options: q.options.slice(0, 4),
    correctIndex: Math.min(Math.max(0, Number(q.correctIndex) || 0), 3),
    dimension: (["Knowledge", "Application", "Analysis"].includes(q.dimension) ? q.dimension : "Knowledge") as MasteryQuestion["dimension"],
  }));
}

export type AssessmentQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  dimension: string;
};

/** Build a mixed-item assessment (mastery check, topic test, exam-style) proportioned across the teacher's chosen item mix. */
export async function generateAssessmentQuestions(input: {
  type: string;
  mix: { label: string; pct: number }[];
  topic?: string;
}): Promise<AssessmentQuestion[]> {
  const TOTAL = 8;
  const mix = input.mix.length ? input.mix : [{ label: "Knowledge", pct: 100 }];
  const counts = mix.map((m) => Math.max(1, Math.round((m.pct / 100) * TOTAL)));
  const diff = TOTAL - counts.reduce((s, n) => s + n, 0);
  counts[counts.length - 1] = Math.max(1, counts[counts.length - 1] + diff);
  const plan = mix.map((m, i) => ({ label: m.label, count: counts[i] }));
  const topic = input.topic?.trim() || "a mix of core Ghanaian JHS/SHS Mathematics and Science topics";

  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Build a "${input.type}" assessment on ${topic}.
Return JSON: {"questions":[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0,"dimension":"..."}]}.
Produce exactly this many items per dimension, in order: ${JSON.stringify(plan)}.
Set each question's "dimension" field to match the label it was written for.
Exactly 4 options per question, options plain text (no "A)" prefixes). Ghana-grounded, WASSCE-appropriate difficulty.`,
      },
    ],
    3200,
  );
  const parsed = parseJson<{ questions: AssessmentQuestion[] }>(raw);
  const qs = (parsed.questions || []).filter((q) => q.prompt && Array.isArray(q.options) && q.options.length >= 2);
  if (qs.length < 4) throw new Error("Assessment items were incomplete. Try again.");
  return qs.slice(0, TOTAL).map((q) => ({
    prompt: q.prompt,
    options: q.options.slice(0, 4),
    correctIndex: Math.min(Math.max(0, Number(q.correctIndex) || 0), Math.min(3, q.options.length - 1)),
    dimension: q.dimension || mix[0].label,
  }));
}

export type ClassChallengeDraft = {
  title: string;
  body: string;
  brief: string;
  stages: { name: string; goal: string; task: string }[];
};

/** Build a class-scoped challenge (design/build/data/knowledge/problem-solving) for one teacher's class. */
export async function generateClassChallenge(input: { type: string; className: string; topic?: string }): Promise<ClassChallengeDraft> {
  const focus = input.topic?.trim() || "a practical STEM application that fits the class's subject";
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Design a "${input.type}" for the class "${input.className}", focused on ${focus}.
Return JSON: {"title":"...","body":"one short sentence summary","brief":"2-3 sentence brief describing the task","stages":[{"name":"...","goal":"...","task":"..."}]}.
Produce exactly 4 stages that walk students from understanding the problem to presenting their result, in the spirit of a project like "understand, design/plan, build/collect, present".
Use materials Ghanaian JHS/SHS students can realistically access (household or basic classroom items). No em dashes.`,
      },
    ],
    2200,
  );
  const parsed = parseJson<ClassChallengeDraft>(raw);
  if (!parsed.title || !Array.isArray(parsed.stages) || parsed.stages.length < 3) {
    throw new Error("Challenge draft was incomplete. Try again.");
  }
  return {
    title: parsed.title,
    body: parsed.body || `A ${input.type.toLowerCase()} for ${input.className}.`,
    brief: parsed.brief || parsed.body || "",
    stages: parsed.stages.slice(0, 4).map((s) => ({
      name: s.name || "Stage",
      goal: s.goal || "",
      task: s.task || "",
    })),
  };
}

// ----------------------------------------------------------------
// Teacher Intervention Builder
// ----------------------------------------------------------------

export type InterventionDraft = {
  title:             string;
  intervention_type: string;
  summary:           string;
  content: {
    opening:    string;
    explanation:string;
    example:    string;
    follow_up:  string;
  };
  estimated_minutes: number;
};

/**
 * Generate a targeted intervention draft for a teacher.
 * Used by InterventionBuilder.tsx when a class misconception pattern is detected.
 */
export async function generateInterventionDraft(input: {
  concept:              string;
  misconceptionPattern: string;
  studentCount:         number;
  className?:           string;
}): Promise<InterventionDraft> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `A teacher needs a targeted intervention for their class.

Concept: ${input.concept}
Misconception pattern: ${input.misconceptionPattern}
Affected students: ${input.studentCount}${input.className ? ` in ${input.className}` : ""}

Write a short intervention a teacher can deliver in 8-10 minutes. Return JSON:
{
  "title": "Short title for the intervention (under 10 words)",
  "intervention_type": one of: "misconception_correction" | "guided_practice" | "prerequisite_review",
  "summary": "1-sentence summary of what this addresses",
  "content": {
    "opening": "How the teacher introduces the topic (1 sentence, direct, no em dash)",
    "explanation": "The correct concept explained clearly (2-3 sentences, Ghana context where relevant)",
    "example": "One worked example relevant to the misconception",
    "follow_up": "One practice question to check understanding"
  },
  "estimated_minutes": 8
}
No em dashes. No filler phrases. JSON only.`,
      },
    ],
    1200,
  );

  const parsed = parseJson<InterventionDraft>(raw);
  if (!parsed.title || !parsed.content?.explanation) {
    throw new Error("Intervention draft was incomplete. Try again.");
  }
  return parsed;
}

// ----------------------------------------------------------------

/** Solve's "Try Similar Question" follow-up: one new question practising the
 * same skill with different numbers/context. Plain text, not JSON. */
export async function generateSimilarQuestion(question: string): Promise<string> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Write ONE new STEM question that practises the same skill as this question, with different numbers or context.
Return ONLY the question text. No JSON, no preamble, no quotation marks, no markdown.

Original question:
${question}`,
      },
    ],
    400,
  );
  return raw.trim().replace(/^["'`]+|["'`]+$/g, "");
}

// ---------- Lab Assistant ----------

/**
 * Returns a single coaching hint for the current lab step.
 * The prompt instructs the AI to ask a further question rather than reveal the answer.
 * Free — no credit deduction.
 */
export async function getLabAssistantHint(input: {
  labTitle: string;
  stepTitle: string;
  stepBody: string;
  studentObservation: string;
  conceptName: string;
}): Promise<string> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `You are the Lab Assistant in a secondary school practical activity.
Lab: "${input.labTitle}"
Step: "${input.stepTitle}"
Step instruction: "${input.stepBody}"
Concept being studied: "${input.conceptName}"
Student's observation so far: "${input.studentObservation || "(nothing written yet)"}"

Your job: give ONE short coaching hint (2-3 sentences) that helps the student think more carefully.
Do NOT reveal the expected result or conclusion. Ask a question that pushes their thinking forward.
Write directly to the student. Use plain English. No bullet points. No preamble.
Return only the hint text, nothing else.`,
      },
    ],
    400,
  );
  return raw.trim().replace(/^["'`]+|["'`]+$/g, "");
}

// ---------- Challenge Coach ----------

/**
 * Returns a single coaching nudge for the current challenge stage.
 * Helps the student think, never completes the work for them.
 * Free — no credit deduction.
 */
export async function getChallengeCoachHint(input: {
  challengeTitle: string;
  stageName: string;
  stageTask: string;
  studentWork: string;
  conceptNames: string[];
}): Promise<string> {
  const raw = await groqApiService.makeRequest(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `You are the Challenge Coach in a STEM challenge activity.
Challenge: "${input.challengeTitle}"
Current stage: "${input.stageName}"
Stage task: "${input.stageTask}"
Related concepts: ${input.conceptNames.join(", ") || "general STEM"}
Student's work so far: "${input.studentWork || "(nothing written yet)"}"

Your job: give ONE short coaching nudge (2-3 sentences) that helps the student develop their thinking.
Do NOT write their answer or solution for them. Ask a question or point to something they may have missed.
Write directly to the student. Use plain English. No bullet points. No preamble.
Return only the nudge text, nothing else.`,
      },
    ],
    400,
  );
  return raw.trim().replace(/^["'`]+|["'`]+$/g, "");
}
