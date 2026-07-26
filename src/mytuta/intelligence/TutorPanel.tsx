import { c, font } from "../theme";
import { useLearnerModel, useNextBestAction } from "./data";

const SKILL_LABEL: Record<string, string> = {
  recall: "recall", calculation: "calculation", reasoning: "reasoning",
  application: "applying concepts", knowledge: "concept knowledge",
};

/** "Your Tutor" — a small contextual companion line, not a chat window
 * (spec §9). Templated from the learner model + next best action, so it is
 * free and deterministic. Renders nothing until there's something to say. */
export default function TutorPanel({ context = "home" }: { context?: "home" | "progress" }) {
  const { data: model } = useLearnerModel();
  const { data: nba } = useNextBestAction();

  if (!model) return null;

  const challenge = model.challenges?.[0];
  const strength = model.strengths?.[0];
  const primary = nba?.primary;

  let line = "";
  if (context === "progress") {
    if (strength && challenge) line = `Your ${SKILL_LABEL[strength] || strength} is improving, but ${SKILL_LABEL[challenge] || challenge} is still your weakest area.`;
    else if (strength) line = `You're building real strength in ${SKILL_LABEL[strength] || strength}. Keep it up.`;
    else line = "Your learning profile fills in as you practise. Complete a few activities to see it grow.";
  } else {
    if (challenge && primary) line = `${SKILL_LABEL[challenge] ? "Your weaker area right now is " + SKILL_LABEL[challenge] + ". " : ""}${primary.action} to make progress.`;
    else if (primary) line = primary.reason;
    else line = "You're on track. Pick a concept and keep going.";
  }

  if (!line) return null;

  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "15px 17px", marginBottom: 30 }}>
      <div style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: c.greenTint, color: c.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontWeight: 700, fontSize: 15 }}>m</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: c.faint, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 3 }}>Your tutor</div>
        <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.5 }}>{line}</div>
      </div>
    </div>
  );
}
