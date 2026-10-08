import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { c, font } from "../theme";
import { Loading, EmptyState } from "../ui";
import { MathText } from "../MathText";
import { studioSectionNames } from "../data/constants";
import { useExperience, useExperienceSections, useMyExperienceProgress } from "../data/queries";
import { useMarkExperienceProgress } from "../data/mutations";
import { useLayout } from "../layout";

// "Teacher guide" is authoring-only content, not for students.
const studentSections = studioSectionNames.filter((s) => s !== "Teacher guide");

export default function ExperienceView() {
  const L = useLayout();
  const nav = useNavigate();
  const { experienceId } = useParams();
  const { data: exp, isLoading } = useExperience(experienceId);
  const { data: sections } = useExperienceSections(experienceId);
  const { data: progress } = useMyExperienceProgress(experienceId);
  const markProgress = useMarkExperienceProgress();

  const [section, setSection] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const markedViewed = useRef(false);

  const goToSection = (i: number) => {
    setVisited((prev) => { const next = new Set(prev); next.add(i); return next; });
    setSection(i);
  };

  useEffect(() => {
    if (markedViewed.current || !experienceId) return;
    if (progress === undefined) return; // still loading
    if (progress === null) {
      markedViewed.current = true;
      markProgress.mutate({ experienceId, status: "in_progress" });
    } else {
      markedViewed.current = true;
    }
  }, [progress, experienceId, markProgress]);

  if (isLoading) return <Loading label="Opening this experience…" />;
  if (!exp) return <EmptyState title="Not available" body="This experience may have been removed or is no longer assigned to you." actionLabel="Back to assignments" onAction={() => nav("/student/assignments")} />;

  const sectionName = studentSections[section] || "Overview";
  const row = sections?.[section];
  const body = row?.body?.trim();
  const inserts = row?.ai_blocks || [];
  const completed = progress?.status === "completed";

  return (
    <div style={{ display: "flex", flexDirection: L.mobile ? "column" : "row", height: "100%", animation: "fadein .3s ease" }}>
      {!L.mobile && (
        <div style={{ width: 220, flex: "none", borderRight: `1px solid ${c.border2}`, background: c.surface, padding: "22px 16px", overflowY: "auto" }}>
          <button type="button" onClick={() => nav("/student/assignments")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Assignments</button>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{exp.title}</div>
          <div style={{ fontSize: 12, color: c.faint, marginBottom: 18 }}>{exp.subject}{exp.form ? ` · ${exp.form}` : ""}</div>
          {studentSections.map((name, i) => {
            const on = section === i;
            const done = visited.has(i) && !on;
            return (
              <button
                key={name}
                type="button"
                onClick={() => goToSection(i)}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8, background: on ? c.greenTint : "transparent", border: `1px solid ${on ? c.greenTintBorder : "transparent"}`, borderRadius: 11, padding: "9px 10px", marginBottom: 3, cursor: "pointer", fontSize: 13, fontWeight: on ? 700 : 500 }}
              >
                <span style={{ flex: 1 }}>{name}</span>
                {done && <span style={{ fontSize: 10, color: c.green, fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {L.mobile && (
        <div style={{ background: c.surface, borderBottom: `1px solid ${c.border2}`, padding: "12px 16px 10px" }}>
          <button type="button" onClick={() => nav("/student/assignments")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8 }}>← Assignments</button>
          <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 10 }}>{exp.title}</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
            {studentSections.map((name, i) => {
              const on = section === i;
              const done = visited.has(i) && !on;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => goToSection(i)}
                  style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5, background: on ? c.greenTint : c.paper, border: `1px solid ${on ? c.greenTintBorder : c.border2}`, borderRadius: 20, padding: "8px 14px", fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? c.greenDark : c.soft, cursor: "pointer" }}
                >
                  {name}{done && <span style={{ fontSize: 10, color: c.green, fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: L.mobile ? "24px 16px 72px" : "38px 40px 72px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>{sectionName}</div>
          <h1 style={{ fontSize: L.mobile ? 20 : 24, marginBottom: 18 }}>{exp.title}</h1>

          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: L.mobile ? 18 : 26, marginBottom: 16, fontSize: 15, lineHeight: 1.7, color: c.body }}>
            {body ? <MathText text={body} /> : <span style={{ color: c.faint }}>Your teacher hasn't added content to this section yet.</span>}
          </div>

          {inserts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {inserts.map((block, i) => (
                <div key={i} style={{ background: c.plumTint, border: `1px solid ${c.plumBorder}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.plum, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>{block.action}</div>
                  <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.6 }}><MathText text={block.text} /></div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {section > 0 && (
              <button type="button" onClick={() => goToSection(section - 1)} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13.5, padding: "12px 18px", borderRadius: 11, cursor: "pointer" }}>Back</button>
            )}
            {section + 1 < studentSections.length ? (
              <button type="button" onClick={() => goToSection(section + 1)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "12px 18px", borderRadius: 11, cursor: "pointer" }}>Next section</button>
            ) : (
              <button
                type="button"
                disabled={completed || markProgress.isPending}
                onClick={() => experienceId && markProgress.mutate({ experienceId, status: "completed" })}
                style={{ background: completed ? c.greenTint : c.green, color: completed ? c.greenDark : "#fff", border: completed ? `1px solid ${c.greenTintBorder}` : "none", fontWeight: 700, fontSize: 13.5, padding: "12px 18px", borderRadius: 11, cursor: completed ? "default" : "pointer", opacity: markProgress.isPending ? 0.7 : 1 }}
              >{completed ? "Marked as done" : markProgress.isPending ? "Saving…" : "Mark as done"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
