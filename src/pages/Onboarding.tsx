import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { c, font, chip } from "@/mytuta/theme";
import { setStoredRole } from "@/mytuta/useRole";
import { studentSteps, teacherSteps } from "@/mytuta/data/onboarding";

type User = { id: string; email?: string; user_metadata?: { first_name?: string; last_name?: string } };

const firstActionRoutes: Record<string, string> = {
  "Learn a concept": "/student/learn",
  "Solve a problem": "/student/solve",
  "Take a diagnostic": "/student/learn",
  "Join a teacher class": "/student/assignments",
  "Explore a challenge": "/student/challenges",
  "Create a learning experience": "/teacher/experiences/new",
  "Create a class": "/teacher/classes",
  "Upload teaching material": "/teacher/experiences/new",
  "Diagnose a topic": "/teacher/home",
  "Explore a sample": "/teacher/experiences",
};

/** Templated initial learner-model summary from onboarding picks (spec §2). */
function buildSummary(subjects: string[], goals: string[]): string {
  const subj = subjects.slice(0, 3).join(" and ") || "STEM";
  const goalPhrase = goals[0] ? ` You want to ${goals[0].toLowerCase()}.` : "";
  return `You're working mainly on ${subj}.${goalPhrase} mytuta will start you with short, guided steps and give you more independence as you succeed.`;
}

const OnboardingSteps = () => {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get("type") as "student" | "teacher") || "student";
  const steps = userType === "teacher" ? teacherSteps : studentSteps;
  const total = steps.length;

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<number, Set<string>>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ summary: string; firstSubject: string; dest: string } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { user } = await AuthService.getCurrentUser();
      if (!user) { navigate(`/signup?type=${userType}`); return; }
      setCurrentUser(user as User);
    })();
  }, [userType, navigate]);

  const toggle = (opt: string) => {
    setSelected((prev) => {
      const set = new Set(prev[step] || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      return { ...prev, [step]: set };
    });
  };
  const isOn = (opt: string) => selected[step]?.has(opt) ?? false;

  const finish = async () => {
    setIsLoading(true);
    const subjects = Array.from(selected[userType === "teacher" ? 0 : 1] || []);
    const goals = Array.from(selected[userType === "teacher" ? 1 : 2] || []);
    const firstAction = Array.from(selected[total - 1] || [])[0];

    // Every step's picks, keyed by its kicker, so struggles/learning-style
    // (student) and challenges/resources (teacher) are captured too, not
    // just subjects/goals which have their own typed columns.
    const answers: Record<string, string[]> = {};
    steps.forEach((st, i) => {
      const picks = Array.from(selected[i] || []);
      if (picks.length) answers[st.kicker] = picks;
    });

    const name = currentUser
      ? `${currentUser.user_metadata?.first_name || ""} ${currentUser.user_metadata?.last_name || ""}`.trim() || currentUser.email?.split("@")[0] || "Learner"
      : "Learner";

    if (currentUser) {
      try {
        await AuthService.updateProfile(currentUser.id, {
          user_type: userType,
          onboarding_completed: true,
          onboarding_step: total,
          subjects,
          goals,
          onboarding_answers: answers,
        });
      } catch {
        // best-effort; local profile still lets the app run
      }
      // 30 welcome Tuta Credits, valid 14 days (idempotent server-side).
      try {
        await supabase.rpc("grant_welcome_credits");
      } catch {
        // non-fatal; the user can still use the app
      }
      // Kept for compatibility. Provision no longer seeds fake ownership data.
      localStorage.setItem("userProfile", JSON.stringify({ id: currentUser.id, name, email: currentUser.email, userType, subjects, goals }));

      // Seed the Intelligence Layer's initial learner model from onboarding —
      // so the app immediately reflects what the student told us (spec §2).
      if (userType === "student") {
        try { await supabase.rpc("record_learning_event", { p_kind: "onboarding_completed", p_meta: answers as never }); } catch { /* best-effort */ }
        if (goals.length) {
          try { await supabase.from("student_goals").insert(goals.map((g) => ({ user_id: currentUser.id, title: g }))); } catch { /* best-effort */ }
        }
        try {
          await supabase.from("learner_profile").upsert(
            { user_id: currentUser.id, support_level: "guided", summary: buildSummary(subjects, goals), prefs: { what_helps: ["Worked examples", "Step-by-step guidance", "Short practice sets"] } as never },
            { onConflict: "user_id" });
        } catch { /* best-effort */ }
      }
    }
    localStorage.setItem("isFirstTimeUser", "true");
    setStoredRole(userType);

    const dest = (firstAction && firstActionRoutes[firstAction]) || (userType === "teacher" ? "/teacher/home" : "/student/home");
    if (userType === "student") {
      setDone({ summary: buildSummary(subjects, goals), firstSubject: subjects[0] || "", dest });
      setIsLoading(false);
      return;
    }
    toast({ title: "You're set up", description: `Welcome to mytuta, ${name.split(" ")[0]}.` });
    navigate(dest);
  };

  const next = () => { if (step >= total - 1) { finish(); return; } setStep(step + 1); };
  const back = () => { if (step <= 0) { navigate(`/signup?type=${userType}`); return; } setStep(step - 1); };

  const s = steps[step];
  const pct = Math.round(((step + 1) / total) * 100);
  const cta = step >= total - 1 ? "Enter mytuta" : "Continue";

  // Closing card — shows the student their answers shaped mytuta (spec §2).
  if (done) {
    const plan = [
      done.firstSubject ? `Take a short diagnostic on ${done.firstSubject}` : "Take a short diagnostic",
      "Start your first Mastery Path",
      "Try one Solve session",
      "Complete your first Mastery Check",
    ];
    return (
      <div style={{ minHeight: "100dvh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: font.body, color: c.ink }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, marginBottom: 22 }}>mytuta<span style={{ color: c.green }}>.</span></div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, padding: "32px 30px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>You're set up</div>
            <h2 style={{ fontSize: 23, lineHeight: 1.2, marginBottom: 12 }}>Here's what mytuta understands about you</h2>
            <p style={{ fontSize: 15, color: c.soft, lineHeight: 1.6, marginBottom: 22 }}>{done.summary}</p>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Your first steps</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
              {plan.map((p, i) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14, color: c.ink }}>
                  <span style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", background: i === 0 ? c.green : c.greenTint, color: i === 0 ? "#fff" : c.greenDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
            <button onClick={() => navigate(done.dest)} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 11, cursor: "pointer" }}>Start learning</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: font.body, color: c.ink }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20 }}>mytuta<span style={{ color: c.green }}>.</span></div>
          <div style={{ flex: 1, height: 6, background: "#eae3d4", borderRadius: 4, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", background: c.green, borderRadius: 4, width: `${pct}%`, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 12.5, color: "#9a927f", fontWeight: 600 }}>{step + 1} of {total}</div>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, padding: "28px 20px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>{s.kicker}</div>
          <h2 style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 8 }}>{s.title}</h2>
          <p style={{ fontSize: 14.5, color: c.muted, marginBottom: 24 }}>{s.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {s.options.map((opt, i) => (
              <button key={opt} onClick={() => toggle(opt)} style={chip(isOn(opt))}>
                {opt}
                {s.soon?.includes(i) && (
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: c.amber, background: c.amberTint, border: `1px solid ${c.amberBorder}`, padding: "2px 7px", borderRadius: 10 }}>Soon</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}>
            <button onClick={back} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 11, cursor: "pointer" }}>Back</button>
            <button onClick={next} disabled={isLoading} style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 11, cursor: isLoading ? "default" : "pointer", opacity: isLoading ? 0.7 : 1 }}>{isLoading ? "Setting up…" : cta}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;
