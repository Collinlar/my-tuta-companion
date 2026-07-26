/**
 * UI configuration and product templates — NOT per-user data.
 * Everything a real user generates (paths, progress, classes, content library,
 * assessments, insights) now comes from Supabase (see queries.ts / mutations.ts).
 * What remains here is scripted product scaffolding: intake flows, filter labels,
 * wizard steps and the Studio / assessment templates the AI fills in.
 */

export const loopWords = ["Diagnose", "Understand", "Recall", "Practise", "Apply", "Prove"];

// Home "Ask mytuta" suggestion chips.
export const askChips = ["Linear equations", "Forces and motion", "Photosynthesis", "Chemical bonding", "Ratios"];

// ---------- Learn: intake flow (scripted) ----------
export const beginOptions = [
  { key: "enter", icon: "✎", title: "Enter a concept", body: "Type any topic you want to understand.", bg: "#eaf5ef", fg: "#2e9e6b" },
  { key: "choose", icon: "▤", title: "Choose a topic", body: "Browse Maths and Science concepts.", bg: "#eaf1f7", fg: "#3f8fc4" },
  { key: "upload", icon: "⇧", title: "Upload notes", body: "Name the topic your notes cover, then build a path.", bg: "#fff7e9", fg: "#c47a17" },
  { key: "photo", icon: "⌨", title: "Photograph material", body: "Name what is on the page or board, then start.", bg: "#f0edf7", fg: "#6b5aa8" },
  { key: "paste", icon: "◇", title: "Paste a question", body: "Start from a question you are stuck on.", bg: "#eaf5ef", fg: "#2e9e6b" },
  { key: "check", icon: "◔", title: "Start with a check", body: "Pick a concept and find your level first.", bg: "#eaf1f7", fg: "#3f8fc4" },
] as const;

export const recallRatings = [
  { label: "Again", bd: "#f0c7b6", fg: "#c05a2e" },
  { label: "Hard", bd: "#f0dcb6", fg: "#c47a17" },
  { label: "Good", bd: "#cfe6d8", fg: "#2e9e6b" },
  { label: "Easy", bd: "#cfe6d8", fg: "#1f7d53" },
];
export const supportLevels = ["Full guidance", "Light hints", "No hints"];

// ---------- Solve: scripted coaching demo ----------
export const solveInputs = ["Type", "Photograph", "Upload image", "Paste from notes"];
export type HelpModeKind = "hint" | "steps" | "concept" | "check" | "similar";
export const helpModes: { title: string; body: string; mode: HelpModeKind }[] = [
  { title: "Give me a hint", body: "A nudge, not the answer.", mode: "hint" },
  { title: "Guide me step by step", body: "Work through it together.", mode: "steps" },
  { title: "Explain the concept", body: "Teach the idea behind it.", mode: "concept" },
  { title: "Check my working", body: "Find where I went wrong.", mode: "check" },
  { title: "Create similar questions", body: "More practice like this.", mode: "similar" },
];
export const solveQuestion = "A stone of mass 2 kg is dropped from a height of 20 m. Calculate its speed just before it hits the ground. Take g as 10 m/s².";
export const solveStepsData = [
  { q: "What is the question really asking?", hint: "You need the speed of the stone the instant before it hits the ground.", answer: "The speed after falling 20 m." },
  { q: "Which information actually matters?", hint: "Height h = 20 m and g = 10 m/s². The 2 kg mass is not needed to find speed.", answer: "h = 20 m, g = 10 m/s²" },
  { q: "Which relationship connects them?", hint: "Energy is conserved — the kinetic energy gained equals the potential energy lost, so ½v² = gh.", answer: "½v² = gh" },
  { q: "Now put the numbers in.", hint: "v² = 2gh = 2 × 10 × 20 = 400, so v = √400.", answer: "v = √400 = 20 m/s" },
];

// ---------- Filter labels ----------
export const labFilters = ["All", "No equipment", "Household", "Classroom", "Laboratory", "Device"];
export const challengeLevels = ["All", "Personal", "Class", "School", "Regional", "Pan-African"];
export const expFilters = ["All", "Published", "Drafts", "Mathematics", "Science"];

// ---------- Teacher: Create wizard ----------
export interface CreateStep {
  kicker: string; title: string; sub: string;
  kind: "fields" | "chips" | "review";
  fields?: { label: string; placeholder: string }[];
  options?: string[];
}
export const createSteps: CreateStep[] = [
  { kicker: "Step 1", title: "Define the learning goal", sub: "What concept and level are you building for?", kind: "fields", fields: [{ label: "Subject", placeholder: "Integrated Science" }, { label: "Concept", placeholder: "Respiration" }, { label: "Learner stage", placeholder: "Form 2 · Lower secondary" }, { label: "Learning objective", placeholder: "Explain how cells release energy" }] },
  { kicker: "Step 2", title: "Add your material", sub: "Start from your own content or let mytuta draft from scratch.", kind: "chips", options: ["Upload notes", "Upload textbook extract", "Paste content", "Add questions", "Start without material"] },
  { kicker: "Step 3", title: "Choose the components", sub: "Pick the stages your experience should include.", kind: "chips", options: ["Diagnostic", "Concept explanation", "Visual explanation", "Worked examples", "Recall", "Guided practice", "Independent practice", "Practical application", "Mastery check"] },
  { kicker: "Step 4", title: "Set practical constraints", sub: "mytuta only suggests activities you can actually run.", kind: "chips", options: ["No equipment", "Household materials", "Classroom materials", "Laboratory available", "Student devices", "Low connectivity"] },
  { kicker: "Step 5", title: "Generate the structure", sub: "Review the proposed sequence. Nothing is assigned until you choose to.", kind: "review" },
];
export const createReview = ["Diagnostic", "Understand", "Worked examples", "Guided practice", "Application activity", "Mastery check"].map((name, i) => ({
  n: i + 1, name, detail: ["3 questions", "2 explanations", "4 steps", "Full to no hints", "Household materials", "Mixed, 10 min"][i],
}));

// ---------- Teacher: Studio templates ----------
export const studioSectionNames = ["Overview", "Diagnostic", "Understand", "Worked examples", "Recall", "Guided practice", "Independent practice", "Apply", "Mastery check", "Teacher guide"];
export const studioBodies: Record<string, string> = {
  Overview: "This experience takes learners through the full mastery loop for {t} — from a quick diagnostic to a mastery check. Reorder, edit or remove any stage. Nothing is shared with a class until you assign it.",
  Diagnostic: "A short check that surfaces what learners already know about {t} and what they build it on. mytuta uses the result to set each learner's starting stage. Edit the questions, or ask the assistant to reshape them.",
  Understand: "The core explanation of {t}, written for your class. Learners can switch how it is explained. Edit this text, or ask the assistant to reshape it for a different reading level.",
  "Worked examples": "Fully worked examples for {t} with the reasoning shown step by step. Learners follow the thinking before trying their own. Add or replace an example below.",
  Recall: "Retrieval cards that lock {t} into memory, scheduled by spaced repetition. Edit a card, or let the assistant generate more from the explanation.",
  "Guided practice": "Practice on {t} with a Step Coach that adjusts its support. Set how much scaffolding learners start with, then let it fade.",
  "Independent practice": "Unscaffolded practice on {t}. After each answer mytuta names the type of mistake, not just right or wrong. Tune the difficulty spread below.",
  Apply: "A real-world task that asks learners to use {t} in a new situation. Swap in a context that fits your community.",
  "Mastery check": "A mixed check across every way of knowing {t}. The result is a profile, not a single score. Adjust the balance of item types.",
  "Teacher guide": "Notes for teaching {t}: common misconceptions, timing, and what to do when learners get stuck. Edit freely before you assign.",
};
export const studioAiActions = ["Explain another way", "Simplify", "Add a local example", "Another worked example", "No-equipment activity", "Detect misconceptions"];
export const studioAiText: Record<string, string> = {
  "Explain another way": "Think of a cell like a tiny kitchen. Glucose is the food and oxygen is the fire that lets it cook. The cooking releases energy the cell can use, giving off carbon dioxide and water as waste.",
  Simplify: "Cells break down glucose using oxygen to get energy. This also produces carbon dioxide and water.",
  "Add a local example": "Link it to a cooking fire at home: fuel (glucose) plus air (oxygen) gives heat (energy), with smoke and steam standing in for carbon dioxide and water.",
  "Another worked example": "Q: A learner runs and starts breathing faster. Explain why.  A: Running needs more energy, so cells respire faster, needing more oxygen and releasing more carbon dioxide, so breathing speeds up.",
  "No-equipment activity": "Ask learners to hold their breath, then notice how the body reacts. Discuss why the body forces a breath, linking it to the cell's need for oxygen.",
  "Detect misconceptions": "Watch for two common slips: confusing respiration with breathing, and believing plants only photosynthesise. In fact they respire too, day and night.",
};

// ---------- Teacher: Assessment type templates ----------
// Practical Assessment and Design Challenge from the PRD's catalog are
// intentionally not here: they're staged, submission-based work, already
// covered by the Challenges feature, not the MCQ model this table drives.
export interface AssessType {
  icon: string; bg: string; fg: string; title: string; body: string;
  mix: { label: string; pct: number }[];
  /** Shows a countdown timer during the attempt. */
  timed?: boolean;
  /** Controlled Assessment Mode: timer + flagging + no AI help + delayed explanations. */
  controlled?: boolean;
}
export const assessTypesData: AssessType[] = [
  { icon: "◔", bg: "#eaf5ef", fg: "#2e9e6b", title: "Mastery check", body: "Mixed items across knowledge, procedure and application.", mix: [{ label: "Knowledge", pct: 40 }, { label: "Procedure", pct: 35 }, { label: "Application", pct: 25 }] },
  { icon: "◉", bg: "#eaf1f7", fg: "#3f8fc4", title: "Topic test", body: "Focused on one concept, timed or untimed.", mix: [{ label: "Recall", pct: 50 }, { label: "Procedure", pct: 30 }, { label: "Application", pct: 20 }] },
  { icon: "◈", bg: "#fff7e9", fg: "#c47a17", title: "Examination-style", body: "Paper tuned to the national exam format, marked as practice.", mix: [{ label: "Section A", pct: 40 }, { label: "Section B", pct: 40 }, { label: "Section C", pct: 20 }], timed: true, controlled: true },
  { icon: "◑", bg: "#f0edf7", fg: "#6b5aa8", title: "Diagnostic", body: "A quick, low-stakes check of where a class stands before you teach.", mix: [{ label: "Recall", pct: 60 }, { label: "Procedure", pct: 40 }] },
  { icon: "◷", bg: "#fff0eb", fg: "#c05a2e", title: "Timed test", body: "Same items as a topic test, run against the clock.", mix: [{ label: "Recall", pct: 40 }, { label: "Procedure", pct: 40 }, { label: "Application", pct: 20 }], timed: true },
  { icon: "◫", bg: "#eaf5ef", fg: "#2e9e6b", title: "Mixed STEM test", body: "Items drawn across subjects, for a general STEM check.", mix: [{ label: "Mathematics", pct: 34 }, { label: "Science", pct: 33 }, { label: "Application", pct: 33 }] },
  { icon: "◕", bg: "#eaf1f7", fg: "#3f8fc4", title: "Partner assessment", body: "Built for sharing with another class or partner school.", mix: [{ label: "Knowledge", pct: 35 }, { label: "Procedure", pct: 35 }, { label: "Application", pct: 30 }] },
  { icon: "◎", bg: "#fff7e9", fg: "#c47a17", title: "Mock examination", body: "Full-length, exam-conditions practice ahead of the real thing.", mix: [{ label: "Section A", pct: 40 }, { label: "Section B", pct: 40 }, { label: "Section C", pct: 20 }], timed: true, controlled: true },
  { icon: "★", bg: "#f0edf7", fg: "#6b5aa8", title: "Olympiad preparation", body: "Harder, competition-style problems for your strongest students.", mix: [{ label: "Reasoning", pct: 50 }, { label: "Application", pct: 50 }], timed: true, controlled: true },
];
export const classNewFields = ["Class name", "Subject", "Year group"];

// ---------- Teacher: class challenge templates ----------
export const challengeTypeOptions = ["Knowledge sprint", "Design challenge", "Data challenge", "Build challenge", "Problem solving"];

/** Accent colours per challenge type, matching the catalog seed's convention. */
export const CHALLENGE_TYPE_COLORS: Record<string, { fg: string; bg: string; accent: string }> = {
  "Knowledge sprint": { fg: "#2e9e6b", bg: "#eaf5ef", accent: "#2e9e6b" },
  "Design challenge": { fg: "#6b5aa8", bg: "#f0edf7", accent: "#6b5aa8" },
  "Data challenge": { fg: "#3f8fc4", bg: "#eaf1f7", accent: "#3f8fc4" },
  "Build challenge": { fg: "#c47a17", bg: "#fff7e9", accent: "#c47a17" },
  "Problem solving": { fg: "#2e9e6b", bg: "#eaf5ef", accent: "#2e9e6b" },
};
