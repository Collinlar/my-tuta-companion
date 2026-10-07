import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase-backed read hooks. RLS scopes per-user tables to the caller
 * automatically, so most queries are a plain select. Content tables
 * (concepts, lab_activities, challenges) are globally readable.
 */

// ---------- view-model types ----------
export interface PathVM { id: string; concept: string; subject: string; stage: string; pct: number; color: string; level: string; next: string; currentStage: number; conceptSlug?: string }
export interface StudentAssignmentVM { id: string; icon: string; color: string; title: string; teacher: string; due: string; status: string; statusColor: string; assessmentId: string | null; experienceId: string | null }
export interface LearnerStatsVM { mastered: number; developing: number; accuracy: number; streak: number; skills: { name: string; pct: number }[] }
export interface LabStep { phase: string; title: string; body: string; record?: boolean; watchFor?: string; thinkingPrompt?: string }
export interface LabActivityVM {
  id: string; slug: string; color: string; cat: string; catFg: string; catBg: string;
  title: string; body: string; equip: string; time: string; demonstrates: string;
  objective: string; materials: string[]; safety: string; steps: LabStep[];
  subject: string; difficulty: string; teamMode: string; dimensions: string[];
  // MVP experience fields
  mission?: string;
  predictionPrompt?: string;
  reflectionPrompts?: string[];
  whatThisProves?: string;
  skillTags?: string[];
  conceptSlug?: string;
  conceptName?: string;
}
export interface ChallengeStage { name: string; goal: string; task: string; weight?: number }
export interface ChallengeVM {
  id: string; type: string; fg: string; bg: string; scope: string; mode: string;
  timeline: string; accent: string; title: string; body: string; brief: string;
  stages: ChallengeStage[]; isFeatured: boolean;
  // MVP experience fields
  story?: string;
  rubric?: { criterion: string; description: string; max: number }[];
  conceptNames?: string[];
  coachContext?: string;
}
export interface MasteryMapVM { concept: string; subject: string; level: string }
export interface ConceptStageVM { ord: number; name: string; loopPhase: string; description: string; estTime: string; content: Record<string, unknown> }
export interface ExperienceVM { id: string; cover: string; subject: string; form: string; title: string; stages: number; status: string; tags: string[] }
export interface ClassVM { id: string; name: string; students: number; code: string; color: string; mark: string; stats: { v: string; l: string }[] }
export interface ClassStudentVM { name: string; mark: string; color: string; concept: string; stage: string; level: string }
export interface AssessmentVM { id: string; title: string; type: string; klass: string; avg: string; color: string; submitted: number; total: number; dist: { l: string; v: number; c: string }[] }
export interface TeacherInsightVM { concept: string; pct: string; detail: string }
export interface TeacherStatsVM { activeClasses: number; students: number; reachingSecure: number; conceptsTaught: number; classSkills: { name: string; pct: number; color: string }[] }

const AVG_COLOR: Record<string, string> = { Mastered: "#6b5aa8", Secure: "#2e9e6b", Developing: "#3f8fc4", Beginning: "#c47a17" };

// ---------- student ----------

export function useMasteryPaths() {
  return useQuery({
    queryKey: ["mastery_paths"],
    queryFn: async (): Promise<PathVM[]> => {
      const { data, error } = await supabase.from("mastery_paths").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p) => {
        const currentStage = p.current_stage || 0;
        const pct = p.pct && p.pct > 0 ? p.pct : Math.min(100, Math.round(((currentStage + 1) / 8) * 100));
        const level = p.level && p.level !== "Beginning"
          ? p.level
          : pct >= 90 ? "Mastered" : pct >= 70 ? "Secure" : pct >= 40 ? "Developing" : "Beginning";
        return {
          id: p.id, concept: p.concept_name, subject: p.subject || "", stage: p.stage_label || "", pct,
          color: p.color || "#2e9e6b", level, next: p.next_action || "Continue", currentStage,
        };
      });
    },
  });
}

export function useStudentAssignments() {
  return useQuery({
    queryKey: ["student_assignments"],
    queryFn: async (): Promise<StudentAssignmentVM[]> => {
      // Real teacher assignments for the classes this student has joined.
      // RLS scopes assignments to the student's class memberships automatically.
      const { data, error } = await supabase
        .from("assignments")
        .select("id, title, teacher_name, deadline, assessment_id, experience_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data || [];

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;

      const assessmentIds = rows.map((a) => a.assessment_id).filter((v): v is string => !!v);
      const experienceIds = rows.map((a) => a.experience_id).filter((v): v is string => !!v);

      const submissionByAssessment = new Map<string, string>();
      if (uid && assessmentIds.length) {
        const { data: subs } = await supabase.from("assessment_submissions").select("assessment_id, mastery_level").eq("student_id", uid).in("assessment_id", assessmentIds);
        (subs || []).forEach((s) => submissionByAssessment.set(s.assessment_id, s.mastery_level || "Complete"));
      }
      const progressByExperience = new Map<string, string>();
      if (uid && experienceIds.length) {
        const { data: prog } = await supabase.from("experience_progress").select("experience_id, status").eq("user_id", uid).in("experience_id", experienceIds);
        (prog || []).forEach((p) => progressByExperience.set(p.experience_id, p.status));
      }

      return rows.map((a) => {
        let status = "Not started";
        let statusColor = "#9a927f";
        if (a.assessment_id) {
          const level = submissionByAssessment.get(a.assessment_id);
          if (level) { status = `Completed · ${level}`; statusColor = "#2e9e6b"; }
        } else if (a.experience_id) {
          const st = progressByExperience.get(a.experience_id);
          if (st === "completed") { status = "Completed"; statusColor = "#2e9e6b"; }
          else if (st === "in_progress") { status = "In progress"; statusColor = "#3f8fc4"; }
        }
        return {
          id: a.id,
          icon: a.assessment_id ? "◉" : "▤",
          color: a.assessment_id ? "#3f8fc4" : "#2e9e6b",
          title: a.title || "Assignment",
          teacher: a.teacher_name || "Your teacher",
          due: a.deadline ? new Date(a.deadline).toLocaleDateString(undefined, { weekday: "short" }) : "soon",
          status,
          statusColor,
          assessmentId: a.assessment_id,
          experienceId: a.experience_id,
        };
      });
    },
  });
}

/** Classes the signed-in student has joined (for the join-class screen). */
export function useMyClasses() {
  return useQuery({
    queryKey: ["my_classes"],
    queryFn: async (): Promise<{ id: string; name: string; code: string; color: string }[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data: memberships } = await supabase.from("class_students").select("class_id").eq("student_id", uid);
      const ids = (memberships || []).map((m) => m.class_id);
      if (ids.length === 0) return [];
      const { data: classes } = await supabase.from("classes").select("id, name, code, color").in("id", ids);
      return (classes || []).map((c) => ({ id: c.id, name: c.name, code: c.code, color: c.color || "#2e9e6b" }));
    },
  });
}

export function useLearnerStats() {
  return useQuery({
    queryKey: ["learner_stats"],
    queryFn: async (): Promise<LearnerStatsVM | null> => {
      // Always prefer live mastery_paths so Progress matches real work
      const { data: paths } = await supabase.from("mastery_paths").select("level, pct, concept_name");
      const list = paths || [];
      if (list.length > 0) {
        const mastered = list.filter((p) => p.level === "Mastered" || p.level === "Secure").length;
        const developing = list.filter((p) => p.level === "Developing" || p.level === "Beginning").length;
        const accuracy = Math.round(list.reduce((s, p) => s + (p.pct || 0), 0) / list.length);
        const skills = list.slice(0, 8).map((p) => ({ name: p.concept_name, pct: p.pct || 0 }));
        return { mastered, developing, accuracy, streak: list.length > 0 ? 1 : 0, skills };
      }
      const { data, error } = await supabase.from("learner_stats").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return { mastered: 0, developing: 0, accuracy: 0, streak: 0, skills: [] };
      return {
        mastered: data.mastered || 0,
        developing: data.developing || 0,
        accuracy: data.accuracy || 0,
        streak: data.streak || 0,
        skills: (data.skills as { name: string; pct: number }[]) || [],
      };
    },
  });
}

export function useConceptsCatalog() {
  return useQuery({
    queryKey: ["concepts_catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("concepts").select("id, slug, name, subject, description, related_areas").order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMasteryMap() {
  return useQuery({
    queryKey: ["mastery_profiles"],
    queryFn: async (): Promise<MasteryMapVM[]> => {
      const { data: profiles, error } = await supabase.from("mastery_profiles").select("concept_name, subject, overall_state");
      if (error) throw error;
      if (profiles && profiles.length > 0) {
        return profiles.map((m) => ({ concept: m.concept_name || "", subject: m.subject || "", level: m.overall_state || "Beginning" }));
      }
      // Fall back to paths so Progress is never empty after real work
      const { data: paths } = await supabase.from("mastery_paths").select("concept_name, subject, level");
      return (paths || []).map((p) => ({
        concept: p.concept_name || "",
        subject: p.subject || "",
        level: p.level || "Beginning",
      }));
    },
  });
}

export function useConcept(slug: string) {
  return useQuery({
    queryKey: ["concept", slug],
    queryFn: async () => {
      const { data: concept, error } = await supabase.from("concepts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!concept) return null;
      const { data: stages } = await supabase.from("concept_stages").select("*").eq("concept_id", concept.id).order("ord");
      return {
        concept,
        stages: (stages || []).map((s): ConceptStageVM => ({ ord: s.ord, name: s.name, loopPhase: s.loop_phase || "", description: s.description || "", estTime: s.est_time || "", content: (s.content as Record<string, unknown>) || {} })),
      };
    },
  });
}

export function useLabActivities() {
  return useQuery({
    queryKey: ["lab_activities"],
    queryFn: async (): Promise<LabActivityVM[]> => {
      const { data, error } = await supabase.from("lab_activities").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map((a) => {
        const content = (a.content as Record<string, unknown>) || {};
        return {
          id: a.id, slug: a.slug, color: a.color || "#2e9e6b", cat: a.category, catFg: a.cat_fg || "#2e9e6b", catBg: a.cat_bg || "#eaf5ef",
          title: a.title, body: a.body || "", equip: a.equipment || "", time: a.time_estimate || "", demonstrates: a.demonstrates || "",
          objective: a.objective || "", materials: (a.materials as unknown as string[]) || [], safety: a.safety || "", steps: (a.steps as unknown as LabStep[]) || [],
          subject: a.subject || "", difficulty: a.difficulty || "", teamMode: a.team_mode || "", dimensions: (a.dimensions as unknown as string[]) || [],
          mission: (content.mission as string) || undefined,
          predictionPrompt: (content.predictionPrompt as string) || undefined,
          reflectionPrompts: (content.reflectionPrompts as string[]) || undefined,
          whatThisProves: (content.whatThisProves as string) || undefined,
          skillTags: (content.skillTags as string[]) || undefined,
          conceptSlug: (content.conceptSlug as string) || (a as Record<string, unknown>).concept_slug as string || undefined,
          conceptName: (content.conceptName as string) || undefined,
        };
      });
    },
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async (): Promise<ChallengeVM[]> => {
      const { data, error } = await supabase.from("challenges").select("*").order("is_featured", { ascending: false }).order("created_at");
      if (error) throw error;
      return (data || []).map((c) => {
        const content = (c.content as Record<string, unknown>) || {};
        return {
          id: c.id, type: c.type, fg: c.fg || "#6b5aa8", bg: c.bg || "#f0edf7", scope: c.scope || "", mode: c.mode || "",
          timeline: c.timeline || "", accent: c.accent || "#6b5aa8", title: c.title, body: c.body || "", brief: c.brief || "",
          stages: (c.stages as unknown as ChallengeStage[]) || [], isFeatured: !!c.is_featured,
          story: (content.story as string) || undefined,
          rubric: (content.rubric as ChallengeVM["rubric"]) || undefined,
          conceptNames: (content.conceptNames as string[]) || undefined,
          coachContext: (content.coachContext as string) || undefined,
        };
      });
    },
  });
}

// ---------- teacher ----------

export function useExperiences() {
  return useQuery({
    queryKey: ["learning_experiences"],
    queryFn: async (): Promise<ExperienceVM[]> => {
      const { data, error } = await supabase.from("learning_experiences").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map((e) => ({ id: e.id, cover: e.cover || "linear-gradient(135deg,#2e9e6b,#1f7d53)", subject: e.subject || "", form: e.form || "", title: e.title, stages: e.stages_count || 0, status: e.status || "draft", tags: e.tags || [] }));
    },
  });
}

export function useExperience(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["learning_experience", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("learning_experiences").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export interface ExperienceProgressVM { status: string; completedAt: string | null }

/** The signed-in student's own progress on an assigned experience (if any). */
export function useMyExperienceProgress(experienceId: string | undefined) {
  return useQuery({
    enabled: !!experienceId,
    queryKey: ["experience_progress", experienceId],
    queryFn: async (): Promise<ExperienceProgressVM | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("experience_progress")
        .select("status, completed_at")
        .eq("experience_id", experienceId!)
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { status: data.status, completedAt: data.completed_at };
    },
  });
}

export interface SectionRow { ord: number; body: string | null; ai_blocks: { action: string; text: string }[] }
export function useExperienceSections(experienceId: string | undefined) {
  return useQuery({
    enabled: !!experienceId,
    queryKey: ["experience_sections", experienceId],
    queryFn: async (): Promise<Record<number, SectionRow>> => {
      const { data, error } = await supabase.from("experience_sections").select("*").eq("experience_id", experienceId!);
      if (error) throw error;
      const map: Record<number, SectionRow> = {};
      (data || []).forEach((s) => { map[s.ord] = { ord: s.ord, body: s.body, ai_blocks: (s.ai_blocks as { action: string; text: string }[]) || [] }; });
      return map;
    },
  });
}

export interface ClassSettingsVM {
  aiAssistance: boolean;
  allowChallenges: boolean;
  allowSharing: boolean;
  notifyOnSubmission: boolean;
  assessmentRules: string;
}

export function useClassSettings(classId: string | undefined) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["class_settings", classId],
    queryFn: async (): Promise<ClassSettingsVM | null> => {
      const { data, error } = await supabase
        .from("classes")
        .select("ai_assistance, allow_challenges, allow_sharing, notify_on_submission, assessment_rules")
        .eq("id", classId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        aiAssistance: data.ai_assistance ?? true,
        allowChallenges: data.allow_challenges ?? true,
        allowSharing: data.allow_sharing ?? true,
        notifyOnSubmission: data.notify_on_submission ?? true,
        assessmentRules: data.assessment_rules || "",
      };
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async (): Promise<ClassVM[]> => {
      const { data: classes, error } = await supabase.from("classes").select("*").order("created_at");
      if (error) throw error;
      const { data: students } = await supabase.from("class_students").select("class_id, mastery_level");
      const byClass = new Map<string, { total: number; mastered: number; developing: number; need: number }>();
      (students || []).forEach((s) => {
        const g = byClass.get(s.class_id) || { total: 0, mastered: 0, developing: 0, need: 0 };
        g.total += 1;
        if (s.mastery_level === "Mastered") g.mastered += 1;
        else if (s.mastery_level === "Beginning") g.need += 1;
        else g.developing += 1; // Secure + Developing
        byClass.set(s.class_id, g);
      });
      return (classes || []).map((c) => {
        const g = byClass.get(c.id) || { total: 0, mastered: 0, developing: 0, need: 0 };
        return { id: c.id, name: c.name, students: g.total, code: c.code, color: c.color || "#2e9e6b", mark: c.mark || "", stats: [{ v: String(g.mastered), l: "Mastered" }, { v: String(g.developing), l: "Developing" }, { v: String(g.need), l: "Need support" }] };
      });
    },
  });
}

export interface ClassChallengeVM { id: string; title: string; type: string; fg: string; bg: string; submitted: number }

/** Challenges the teacher has created for a specific class, with submission counts. */
export function useClassChallenges(classId: string | undefined) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["class_challenges", classId],
    queryFn: async (): Promise<ClassChallengeVM[]> => {
      const { data: challenges, error } = await supabase.from("challenges").select("id, title, type, fg, bg").eq("class_id", classId!).order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (challenges || []).map((c) => c.id);
      const counts = new Map<string, number>();
      if (ids.length) {
        const { data: subs } = await supabase.from("challenge_submissions").select("challenge_id").in("challenge_id", ids).eq("status", "submitted");
        (subs || []).forEach((s) => counts.set(s.challenge_id, (counts.get(s.challenge_id) || 0) + 1));
      }
      return (challenges || []).map((c) => ({ id: c.id, title: c.title, type: c.type, fg: c.fg || "#6b5aa8", bg: c.bg || "#f0edf7", submitted: counts.get(c.id) || 0 }));
    },
  });
}

/** A single challenge's full editable fields, for the teacher's edit screen. */
export function useChallengeDetail(challengeId: string | undefined) {
  return useQuery({
    enabled: !!challengeId,
    queryKey: ["challenge_detail", challengeId],
    queryFn: async (): Promise<ChallengeVM | null> => {
      const { data, error } = await supabase.from("challenges").select("*").eq("id", challengeId!).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id, type: data.type, fg: data.fg || "#6b5aa8", bg: data.bg || "#f0edf7", scope: data.scope || "", mode: data.mode || "",
        timeline: data.timeline || "", accent: data.accent || "#6b5aa8", title: data.title, body: data.body || "", brief: data.brief || "",
        stages: (data.stages as unknown as ChallengeStage[]) || [], isFeatured: !!data.is_featured,
      };
    },
  });
}

export function useClassStudents(classId: string | undefined) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["class_students", classId],
    queryFn: async (): Promise<ClassStudentVM[]> => {
      const { data, error } = await supabase.from("class_students").select("*").eq("class_id", classId!).order("created_at");
      if (error) throw error;
      return (data || []).map((s) => ({ name: s.display_name, mark: s.mark || "", color: s.color || "#2e9e6b", concept: s.current_concept || "", stage: s.stage || "", level: s.mastery_level || "Beginning" }));
    },
  });
}

export function useAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: async (): Promise<AssessmentVM[]> => {
      const { data, error } = await supabase.from("assessments").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map((a) => ({
        id: a.id, title: a.title || "Untitled", type: a.type, klass: a.class_label || "", avg: a.avg_level || "Developing",
        color: AVG_COLOR[a.avg_level || "Developing"] || "#3f8fc4", submitted: a.submitted || 0, total: a.total || 0,
        dist: (a.distribution as { l: string; v: number; c: string }[]) || [],
      }));
    },
  });
}

export interface AssessmentQuestionVM { id: string; ord: number; prompt: string; options: string[]; correctIndex: number; dimension: string }

/** Teacher's own review of the AI-generated items behind an assessment. */
export function useAssessmentQuestions(assessmentId: string | undefined) {
  return useQuery({
    enabled: !!assessmentId,
    queryKey: ["assessment_questions", assessmentId],
    queryFn: async (): Promise<AssessmentQuestionVM[]> => {
      const { data, error } = await supabase.from("assessment_questions").select("*").eq("assessment_id", assessmentId!).order("ord");
      if (error) throw error;
      return (data || []).map((q) => ({ id: q.id, ord: q.ord, prompt: q.prompt, options: (q.options as unknown as string[]) || [], correctIndex: q.correct_index, dimension: q.dimension || "" }));
    },
  });
}

export interface AssessmentTakingVM {
  id: string;
  title: string;
  type: string;
  questions: { id: string; ord: number; prompt: string; options: string[] }[];
  priorScore: number | null;
  priorLevel: string | null;
  draftAnswers: { question_id: string; chosen_index: number }[] | null;
}

/** Student view of an assigned assessment — no correct answers included. */
export function useAssessmentForTaking(assessmentId: string | undefined) {
  return useQuery({
    enabled: !!assessmentId,
    queryKey: ["assessment_for_taking", assessmentId],
    queryFn: async (): Promise<AssessmentTakingVM> => {
      const { data, error } = await supabase.rpc("get_assessment_for_taking", { p_assessment_id: assessmentId! });
      if (error) throw error;
      const d = (data || {}) as {
        id: string; title: string; type: string;
        questions?: { id: string; ord: number; prompt: string; options: string[] }[];
        prior_score?: number | null; prior_level?: string | null;
        draft_answers?: { question_id: string; chosen_index: number }[] | null;
      };
      return {
        id: d.id, title: d.title || "Assessment", type: d.type || "",
        questions: d.questions || [],
        priorScore: d.prior_score ?? null,
        priorLevel: d.prior_level ?? null,
        draftAnswers: d.draft_answers || null,
      };
    },
  });
}

export function useTeacherInsights() {
  return useQuery({
    queryKey: ["teacher_insights"],
    queryFn: async (): Promise<TeacherInsightVM[]> => {
      const { data, error } = await supabase.from("teacher_insights").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map((m) => ({ concept: m.concept, pct: m.pct_label || "", detail: m.detail || "" }));
    },
  });
}

export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher_stats"],
    queryFn: async (): Promise<TeacherStatsVM | null> => {
      const { data, error } = await supabase.from("teacher_stats").select("*").maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          activeClasses: data.active_classes || 0,
          students: data.students || 0,
          reachingSecure: data.reaching_secure || 0,
          conceptsTaught: data.concepts_taught || 0,
          classSkills: (data.class_skills as { name: string; pct: number; color: string }[]) || [],
        };
      }
      const { data: classes } = await supabase.from("classes").select("id");
      const classIds = (classes || []).map((c) => c.id);
      let students = 0;
      if (classIds.length) {
        const { count } = await supabase
          .from("class_students")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);
        students = count || 0;
      }
      const { count: conceptsTaught } = await supabase
        .from("learning_experiences")
        .select("*", { count: "exact", head: true });
      return {
        activeClasses: classIds.length,
        students,
        reachingSecure: 0,
        conceptsTaught: conceptsTaught || 0,
        classSkills: [],
      };
    },
  });
}

export interface TeacherDashboardVM {
  activeClasses: number;
  students: number;
  reachingSecure: number;
  conceptsTaught: number;
  classSkills: { name: string; pct: number; color: string }[];
  misconceptions: { concept: string; pct: string; detail: string }[];
  classProgress: { name: string; mark: string; color: string; status: string }[];
  questionAnalysis: { assessmentTitle: string; prompt: string; attempts: number; pctCorrect: number; mostWrongOption: string | null }[];
}

/** Live teacher analytics aggregated from real students' mastery_profiles
 * and assessment_submissions. */
export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher_dashboard"],
    queryFn: async (): Promise<TeacherDashboardVM> => {
      const { data, error } = await supabase.rpc("teacher_dashboard");
      if (error) throw error;
      const d = (data || {}) as {
        active_classes?: number; students?: number; reaching_secure?: number; concepts_taught?: number;
        class_skills?: { name: string; pct: number; color: string }[];
        misconceptions?: { concept: string; pct_label: string; detail: string }[];
        class_progress?: { name: string; mark: string; color: string; status: string }[];
        question_analysis?: { assessment_title: string; prompt: string; attempts: number; pct_correct: number; most_wrong_option: string | null }[];
      };
      return {
        activeClasses: Number(d.active_classes || 0),
        students: Number(d.students || 0),
        reachingSecure: Number(d.reaching_secure || 0),
        conceptsTaught: Number(d.concepts_taught || 0),
        classSkills: (d.class_skills || []).map((s) => ({ name: s.name, pct: Number(s.pct || 0), color: s.color || "#2e9e6b" })),
        misconceptions: (d.misconceptions || []).map((m) => ({ concept: m.concept, pct: m.pct_label || "", detail: m.detail || "" })),
        classProgress: (d.class_progress || []).map((p) => ({ name: p.name, mark: p.mark, color: p.color || "#2e9e6b", status: p.status })),
        questionAnalysis: (d.question_analysis || []).map((q) => ({ assessmentTitle: q.assessment_title, prompt: q.prompt, attempts: Number(q.attempts || 0), pctCorrect: Number(q.pct_correct || 0), mostWrongOption: q.most_wrong_option })),
      };
    },
  });
}

export interface NotificationVM { id: string; kind: string; title: string; body: string; read: boolean; createdAt: string }

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationVM[]> => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data || []).map((n) => ({ id: n.id, kind: n.kind || "update", title: n.title, body: n.body || "", read: !!n.read, createdAt: n.created_at || "" }));
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications_unread_count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60_000,
  });
}

// ---------- Tuta Credits ----------

export interface WalletVM {
  total: number;
  welcome: number;
  promo: number;
  subscription: number;
  purchased: number;
  nextExpiry: string | null;
  expiringAmount: number;
}

/** The signed-in user's live credit balance (per-bucket + nearest expiry). */
export interface PendingConfirmation {
  id: string;
  concept_name: string;
  subject: string | null;
  path_id: string | null;
  question: { prompt: string; options: string[]; correctIndex: number; explanation: string };
  scheduled_for: string;
}

export function usePendingConfirmation() {
  return useQuery({
    queryKey: ["pending_confirmation"],
    queryFn: async (): Promise<PendingConfirmation | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("mastery_confirmations")
        .select("id, concept_name, subject, path_id, question, scheduled_for")
        .eq("user_id", user.id)
        .is("answered_at", null)
        .lte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data as PendingConfirmation | null;
    },
    staleTime: 60_000,
  });
}

export function useWalletSummary() {
  return useQuery({
    queryKey: ["wallet_summary"],
    queryFn: async (): Promise<WalletVM> => {
      const { data, error } = await supabase.rpc("wallet_summary");
      if (error) throw error;
      const d = (data || {}) as {
        total?: number; welcome?: number; promo?: number; subscription?: number;
        purchased?: number; next_expiry?: string | null; expiring_amount?: number;
      };
      return {
        total: Number(d.total || 0),
        welcome: Number(d.welcome || 0),
        promo: Number(d.promo || 0),
        subscription: Number(d.subscription || 0),
        purchased: Number(d.purchased || 0),
        nextExpiry: d.next_expiry ?? null,
        expiringAmount: Number(d.expiring_amount || 0),
      };
    },
    refetchInterval: 60_000,
  });
}

export interface CreditTxnVM { id: string; kind: string; amount: number; description: string; balanceAfter: number; createdAt: string }

export function useCreditTransactions(limit = 50) {
  return useQuery({
    queryKey: ["credit_transactions", limit],
    queryFn: async (): Promise<CreditTxnVM[]> => {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("id, kind, amount, description, balance_after, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map((t) => ({ id: t.id, kind: t.kind, amount: t.amount, description: t.description || "", balanceAfter: t.balance_after, createdAt: t.created_at || "" }));
    },
  });
}

export interface SubscriptionVM { plan: string; status: string; monthlyCredits: number; currentPeriodEnd: string | null; founding: boolean }

/** The signed-in user's subscription, if any. */
export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<SubscriptionVM | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status, monthly_credits, current_period_end, founding")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { plan: data.plan, status: data.status, monthlyCredits: data.monthly_credits, currentPeriodEnd: data.current_period_end, founding: data.founding };
    },
  });
}

export interface ActionCostVM { actionKey: string; label: string; category: string; cost: number }

/** Editable per-action credit costs (from credit_action_costs). Cached long —
 * costs change rarely and are read to label gated buttons. */
export function useActionCosts() {
  return useQuery({
    queryKey: ["action_costs"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Record<string, ActionCostVM>> => {
      const { data, error } = await supabase.from("credit_action_costs").select("action_key, label, category, cost").eq("active", true);
      if (error) throw error;
      const map: Record<string, ActionCostVM> = {};
      (data || []).forEach((r) => { map[r.action_key] = { actionKey: r.action_key, label: r.label, category: r.category, cost: r.cost }; });
      return map;
    },
  });
}

/** Count of recall cards due today or earlier, across every concept. */
export function useDueRecallCount() {
  return useQuery({
    queryKey: ["recall_due_count"],
    queryFn: async (): Promise<number> => {
      const today = new Date().toISOString().slice(0, 10);
      const { count, error } = await supabase.from("recall_cards").select("*", { count: "exact", head: true }).lte("due_at", today);
      if (error) throw error;
      return count || 0;
    },
  });
}

export interface DueRecallCardVM { id: string; conceptName: string; front: string; back: string; intervalDays: number }

/** Every recall card due today or earlier, across every concept, oldest due
 * first — the cross-concept review session (as opposed to Learn's per-concept
 * Recall stage, which only ever shows cards for the concept it's on). */
export function useDueRecallCards(limit = 30) {
  return useQuery({
    queryKey: ["recall_due_cards", limit],
    queryFn: async (): Promise<DueRecallCardVM[]> => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("recall_cards")
        .select("id, concept_name, front, back, interval_days")
        .lte("due_at", today)
        .order("due_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, conceptName: r.concept_name, front: r.front, back: r.back, intervalDays: r.interval_days }));
    },
  });
}

export interface ProfileVM {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "student" | "teacher";
  bio: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  parentContact: string;
  teachingExperience: string;
  avatarUrl: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileVM | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return {
        userId: user.id,
        email: user.email || "",
        firstName: data?.first_name || "",
        lastName: data?.last_name || "",
        userType: data?.user_type === "teacher" ? "teacher" : "student",
        bio: data?.bio || "",
        school: data?.school || "",
        grade: data?.grade || "",
        subjects: data?.subjects || [],
        goals: data?.goals || [],
        parentContact: data?.parent_contact || "",
        teachingExperience: data?.teaching_experience || "",
        avatarUrl: data?.avatar_url || "",
      };
    },
  });
}

export interface ChallengeSubmissionVM { status: string; stage: number; work: Record<string, string>; feedback: string; feedbackLevel: string; reviewedAt: string | null }

/** The signed-in student's own progress on a challenge, if any (for resuming). */
export function useMyChallengeSubmission(challengeId: string | undefined) {
  return useQuery({
    enabled: !!challengeId,
    queryKey: ["my_challenge_submission", challengeId],
    queryFn: async (): Promise<ChallengeSubmissionVM | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase.from("challenge_submissions").select("status, stage, work, feedback, feedback_level, reviewed_at").eq("challenge_id", challengeId!).eq("user_id", uid).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { status: data.status || "in_progress", stage: data.stage || 0, work: (data.work as Record<string, string> | null) || {}, feedback: data.feedback || "", feedbackLevel: data.feedback_level || "", reviewedAt: data.reviewed_at };
    },
  });
}

export interface TeacherSubmissionVM { id: string; studentName: string; status: string; stage: number; work: Record<string, string>; feedback: string; feedbackLevel: string; reviewedAt: string | null; submitted: boolean }

/** Teacher view of every submission for a challenge they created, with
 * resolved student names (server-side, past profiles RLS). */
export function useChallengeSubmissions(challengeId: string | undefined) {
  return useQuery({
    enabled: !!challengeId,
    queryKey: ["challenge_submissions", challengeId],
    queryFn: async (): Promise<TeacherSubmissionVM[]> => {
      const { data, error } = await supabase.rpc("get_challenge_submissions", { p_challenge_id: challengeId! });
      if (error) throw error;
      const rows = (data || []) as {
        id: string; student_name: string; status: string; stage: number;
        work: Record<string, string> | null; feedback: string | null;
        feedback_level: string | null; reviewed_at: string | null; submitted: boolean;
      }[];
      return rows.map((r) => ({
        id: r.id, studentName: r.student_name || "Student", status: r.status || "in_progress", stage: r.stage || 0,
        work: r.work || {}, feedback: r.feedback || "", feedbackLevel: r.feedback_level || "", reviewedAt: r.reviewed_at, submitted: !!r.submitted,
      }));
    },
  });
}

// ---------- shared ----------

export function useDisplayName() {
  return useQuery({
    queryKey: ["display_name"],
    queryFn: async (): Promise<string> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return "there";
      const { data } = await supabase.from("profiles").select("first_name").eq("user_id", uid).maybeSingle();
      return data?.first_name || userData.user?.email?.split("@")[0] || "there";
    },
  });
}
