import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font, filter, sectionLabel } from "./theme";
import { useRole } from "./useRole";

interface Faq {
  q: string;
  a: string;
  tags: string[];
}

const studentFaqs: Faq[] = [
  {
    q: "How does Learn actually build mastery?",
    a: "Pick or search a concept and Learn runs you through a quick diagnostic, then a mastery path built for exactly what you need: Foundations, Understand (with more than one way to explain it if the first doesn't land), Worked Examples, Recall cards, Guided Practice with a step coach, Independent Practice, an Apply activity, and a Mastery Check. Your state on each concept moves through Beginning, Developing, Secure and Mastered as you go.",
    tags: ["learn"],
  },
  {
    q: "What's the difference between Solve and Learn?",
    a: "Solve is for one question, right now, when you're stuck on homework or an exercise. Pick a help mode and the step coach walks you through it. Learn is for building lasting mastery of a whole concept over several sessions.",
    tags: ["learn", "solve"],
  },
  {
    q: "How do Recall cards work?",
    a: "Cards you meet in Learn's Recall stage get scheduled with a simple spaced-repetition rule: rating a card Again or Hard brings it back within a day, Good or Easy pushes its next review further out each time. Progress shows how many cards are due right now. This is a transparent heuristic to help you revisit things before you forget them, not a scientifically validated forgetting-curve model.",
    tags: ["progress"],
  },
  {
    q: "How do I join my teacher's class?",
    a: "Ask your teacher for their class code, then enter it wherever mytuta asks for a class code. Once you join, anything they assign to that class (an experience or an assessment) shows up in your Assignments feed and your teacher gets notified.",
    tags: ["classes"],
  },
  {
    q: "What happens when I submit an assessment or a challenge?",
    a: "Assessments are scored the moment you submit: you get a mastery band (Beginning, Developing, Secure or Mastered) right away, and your teacher's class view updates automatically. Challenges save your work stage by stage as you go, so if you leave partway through, opening the challenge again shows Continue challenge and picks up exactly where you left off.",
    tags: ["assess", "challenges"],
  },
  {
    q: "Lab activities ask me to record a result. What happens to that?",
    a: "Whatever you write in a Lab step's result box is saved against that activity, so what you observed isn't lost when you move to the next step or finish.",
    tags: ["lab"],
  },
  {
    q: "Where do notifications come from?",
    a: "You get a notification when your teacher assigns something to your class. Your teacher gets one when you join their class or submit an assessment or challenge. The bell in the header shows how many are unread.",
    tags: ["classes"],
  },
];

const teacherFaqs: Faq[] = [
  {
    q: "What's the difference between an experience and an assessment?",
    a: "An experience is a learning activity you build in Create and edit in Studio (sections, an AI assistant that can rewrite or simplify text, add a local example, and so on). An assessment is a set of scored questions students take to prove mastery. Both get assigned to a class and show up in students' Assignments feed.",
    tags: ["create", "assess"],
  },
  {
    q: "How does an assessment get built and scored?",
    a: "In Assessments, pick a type, a class, and an optional focus topic, then generate a draft: mytuta writes roughly eight questions proportioned across your chosen item mix. Review the draft (correct answers are shown to you, never to students) before assigning. Once a student submits, scoring, mastery banding and the class distribution update immediately, no manual grading.",
    tags: ["assess"],
  },
  {
    q: "How do class challenges work?",
    a: "From a class's detail page, ＋ Class challenge lets you pick a type (knowledge sprint, design, data, build, or problem solving) and an optional focus topic. mytuta writes a title, a brief and four stages. It's only visible to that class, and the class page shows a live submission count as students work through it.",
    tags: ["classes", "challenges"],
  },
  {
    q: "Where do I see how my classes are actually doing?",
    a: "Insights aggregates real mastery data from every student in your classes: overall stats, a skill breakdown, and flagged misconceptions worth addressing. It updates as students work through concepts, it isn't a static report.",
    tags: ["insights"],
  },
  {
    q: "How do students join my class?",
    a: "Every class gets a unique code. Share it with your students and they enter it once to join. You'll get a notification the first time each student joins.",
    tags: ["classes"],
  },
];

const studentTags = [
  { key: "all", label: "All" },
  { key: "learn", label: "Learn" },
  { key: "solve", label: "Solve" },
  { key: "lab", label: "Lab" },
  { key: "challenges", label: "Challenges" },
  { key: "assess", label: "Assessments" },
  { key: "classes", label: "Classes" },
  { key: "progress", label: "Progress" },
];

const teacherTags = [
  { key: "all", label: "All" },
  { key: "create", label: "Create" },
  { key: "assess", label: "Assessments" },
  { key: "challenges", label: "Challenges" },
  { key: "classes", label: "Classes" },
  { key: "insights", label: "Insights" },
];

export default function Help() {
  const nav = useNavigate();
  const [role] = useRole();
  const [tag, setTag] = useState("all");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const isTeacher = role === "teacher";
  const faqs = isTeacher ? teacherFaqs : studentFaqs;
  const tags = isTeacher ? teacherTags : studentTags;

  const visible = useMemo(
    () => (tag === "all" ? faqs : faqs.filter((f) => f.tags.includes(tag))),
    [faqs, tag],
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Help</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>
        Answers for the {isTeacher ? "teacher" : "student"} side of mytuta. Switch topics below.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {tags.map((t) => (
          <button key={t.key} type="button" onClick={() => { setTag(t.key); setOpenIdx(0); }} style={filter(tag === t.key)}>{t.label}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ color: c.muted, fontSize: 14, padding: "24px 0" }}>Nothing under this topic yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 34 }}>
          {visible.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, fontFamily: font.body }}
                >
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: c.ink }}>{f.q}</span>
                  <span style={{ color: c.faint, fontSize: 15, flex: "none", transform: open ? "rotate(45deg)" : "none", transition: "transform .12s" }}>+</span>
                </button>
                {open && (
                  <div style={{ padding: "0 18px 18px", fontSize: 13.5, color: c.body, lineHeight: 1.65 }}>{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={sectionLabel}>Still stuck</div>
      <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, fontSize: 13.5, color: c.ink, lineHeight: 1.6 }}>
          If something looks wrong or a feature isn't behaving the way this page describes, reach your school or programme contact, they can escalate it to the mytuta team.
        </div>
        <button type="button" onClick={() => nav(isTeacher ? "/teacher/home" : "/student/home")} style={{ flex: "none", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "11px 18px", borderRadius: 10, cursor: "pointer" }}>Back to home</button>
      </div>
    </div>
  );
}
