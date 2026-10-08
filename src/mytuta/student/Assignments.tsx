import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { Loading } from "../ui";
import { useToast } from "@/hooks/use-toast";
import { useStudentAssignments, useMyClasses } from "../data/queries";
import { useJoinClass } from "../data/mutations";

function isOverdue(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("overdue") || s.includes("late") || s.includes("past due");
}
function isToday(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("today") || s.includes("due today");
}

export default function Assignments() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { data: assignments, isLoading } = useStudentAssignments();
  const { data: myClasses } = useMyClasses();
  const join = useJoinClass();
  const [code, setCode] = useState("");

  const joinCode = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    try {
      const res = await join.mutateAsync(value);
      toast({ title: "Joined", description: `You are now in ${res.class_name}.` });
      setCode("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not join that class.";
      toast({ title: "Could not join", description: msg, variant: "destructive" });
    }
  };
  const doJoin = () => joinCode(code);

  // Consume an invite-link code stashed by /join/:code (e.g. after sign-up).
  const consumedPending = useRef(false);
  useEffect(() => {
    if (consumedPending.current) return;
    const pending = localStorage.getItem("pendingJoinCode");
    if (pending) {
      consumedPending.current = true;
      localStorage.removeItem("pendingJoinCode");
      void joinCode(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Loading label="Loading your assignments…" />;
  const list = assignments || [];
  const classes = myClasses || [];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Assignments</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 28 }}>Work your teacher has set for you, and the classes you have joined.</div>

      {/* Join a class */}
      <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "20px 22px", marginBottom: 30 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Join a class</div>
        <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.5, marginBottom: 14 }}>Enter the code your teacher shared to get their assignments.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 4KP9X"
            maxLength={8}
            onKeyDown={(e) => { if (e.key === "Enter") doJoin(); }}
            style={{ flex: 1, border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, letterSpacing: ".08em", fontWeight: 600, background: "#fff", color: c.ink, outline: "none", fontFamily: font.body }}
          />
          <button onClick={doJoin} disabled={join.isPending || !code.trim()} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: "12px 22px", borderRadius: 11, cursor: "pointer", opacity: join.isPending || !code.trim() ? 0.6 : 1 }}>{join.isPending ? "Joining…" : "Join"}</button>
        </div>
        {classes.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {classes.map((cl) => (
              <span key={cl.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${c.greenTintBorder}`, borderRadius: 20, padding: "5px 11px", fontSize: 12.5, fontWeight: 600, color: c.greenDark }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: cl.color }} />{cl.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Assignments */}
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>From your teachers</div>
      {list.length === 0 ? (
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "18px 18px", fontSize: 13.5, color: c.muted, lineHeight: 1.6 }}>
          {classes.length === 0 ? "Join a class above to see the work your teacher sets." : "No assignments yet. Your teacher's assignments will appear here."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {list.map((a) => {
            const completed = a.status.startsWith("Completed");
            const target = a.assessmentId && !completed ? `/student/assessments/${a.assessmentId}` : a.experienceId ? `/student/experiences/${a.experienceId}` : null;
            const clickable = !!target;
            const label = a.assessmentId && !completed ? "Take now ›" : a.experienceId ? (completed ? "Completed · Open ›" : "Open ›") : a.status;
            return (
              <div
                key={a.id}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => nav(target!) : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === "Enter") nav(target!); } : undefined}
                style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 15px", display: "flex", alignItems: "center", gap: 12, cursor: clickable ? "pointer" : "default" }}
              >
                <div style={{ width: 36, height: 36, flex: "none", borderRadius: 9, background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: isOverdue(a.status) ? "#c05a2e" : isToday(a.status) ? "#c47a17" : c.faint }}>
                    {a.teacher} · {isOverdue(a.status) ? <strong>Overdue</strong> : `due ${a.due}`}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue(a.status) ? "#c05a2e" : clickable ? c.green : a.statusColor }}>{isOverdue(a.status) ? "Overdue" : label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
