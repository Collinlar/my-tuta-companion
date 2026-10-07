import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { generateAssessmentQuestions, generateClassChallenge } from "./ai";
import { CHALLENGE_TYPE_COLORS } from "./constants";
import {
  trackAssessmentCreated, trackAssessmentSubmitted, trackChallengeCreated, trackChallengeSubmitted,
  trackClassCreated, trackClassJoined, trackExperienceCreated, trackIndependentAttempt,
  trackMasteryPathStarted, trackStageCompleted,
} from "@/lib/analytics";

async function uid(): Promise<string | undefined> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

// ---------- Tuta Credits: spend / refund ----------

export interface SpendResult { ok: boolean; cost: number; balanceAfter?: number; txnId?: string; balance?: number; needed?: number }

/** Atomically deducts credits for a paid action (or reports insufficient
 * funds without deducting). Invalidates the wallet on success. */
export function useSpendCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (actionKey: string): Promise<SpendResult> => {
      const { data, error } = await supabase.rpc("spend_credits", { p_action_key: actionKey });
      if (error) throw error;
      const d = (data || {}) as { ok?: boolean; cost?: number; balance_after?: number; txn_id?: string; balance?: number; needed?: number };
      return { ok: !!d.ok, cost: Number(d.cost || 0), balanceAfter: d.balance_after, txnId: d.txn_id, balance: d.balance, needed: d.needed };
    },
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["wallet_summary"] });
        qc.invalidateQueries({ queryKey: ["credit_transactions"] });
      }
    },
  });
}

/** Refunds a spend whose generation failed. Best-effort; never blocks the UI. */
export function useRefundCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txnId: string) => {
      const { error } = await supabase.rpc("refund_credits", { p_txn_id: txnId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet_summary"] });
      qc.invalidateQueries({ queryKey: ["credit_transactions"] });
    },
  });
}

/** One-shot: grant welcome credits (idempotent server-side). */
export function useGrantWelcomeCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("grant_welcome_credits");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallet_summary"] }),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; subject?: string; year_group?: string }) => {
      const teacher_id = await uid();
      if (!teacher_id) throw new Error("Not signed in");
      const { data, error } = await supabase.from("classes").insert({ teacher_id, name: input.name, subject: input.subject, year_group: input.year_group }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); trackClassCreated(); },
  });
}

export interface ClassSettingsInput {
  aiAssistance: boolean;
  allowChallenges: boolean;
  allowSharing: boolean;
  notifyOnSubmission: boolean;
  assessmentRules: string;
}

/** Teacher edits a class's settings toggles. Covered by the existing
 * "teacher update" RLS policy on classes (teacher_id = auth.uid()). */
export function useUpdateClassSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { classId: string; settings: ClassSettingsInput }) => {
      const { error } = await supabase.from("classes").update({
        ai_assistance: input.settings.aiAssistance,
        allow_challenges: input.settings.allowChallenges,
        allow_sharing: input.settings.allowSharing,
        notify_on_submission: input.settings.notifyOnSubmission,
        assessment_rules: input.settings.assessmentRules || null,
      }).eq("id", input.classId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["class_settings", v.classId] });
      qc.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

/** Bulk-adds placeholder (not-yet-signed-up) students to a class roster from
 * a list of names — one per line. Reuses class_students' nullable student_id
 * + display_name snapshot design; INSERT is already teacher-scoped by RLS. */
export function useAddRosterStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { classId: string; names: string[] }) => {
      const clean = input.names.map((n) => n.trim()).filter(Boolean);
      if (clean.length === 0) return 0;
      const palette = ["#2e9e6b", "#3f8fc4", "#c47a17", "#6b5aa8", "#c05a2e"];
      const rows = clean.map((name, i) => {
        const parts = name.split(/\s+/);
        const mark = ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name.slice(0, 2).toUpperCase();
        return { class_id: input.classId, display_name: name, mark, color: palette[i % palette.length], mastery_level: "Beginning" };
      });
      const { error } = await supabase.from("class_students").insert(rows);
      if (error) throw error;
      return clean.length;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["class_students", v.classId] });
      qc.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useCreateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      subject?: string;
      form?: string;
      stages_count?: number;
      sections?: { name: string; body: string }[];
    }) => {
      const teacher_id = await uid();
      if (!teacher_id) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("learning_experiences")
        .insert({
          teacher_id,
          title: input.title,
          subject: input.subject,
          form: input.form,
          status: "draft",
          stages_count: input.stages_count ?? input.sections?.length ?? 8,
          cover: "linear-gradient(135deg,#2e9e6b,#1f7d53)",
        })
        .select()
        .single();
      if (error) throw error;

      if (input.sections?.length) {
        const rows = input.sections.map((s, ord) => ({
          experience_id: data.id,
          ord,
          name: s.name,
          body: s.body,
          ai_blocks: [] as unknown as Json,
        }));
        const { error: secErr } = await supabase.from("experience_sections").insert(rows);
        if (secErr) throw secErr;
      }
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["learning_experiences"] });
      if (v) qc.invalidateQueries({ queryKey: ["experience_sections"] });
      trackExperienceCreated();
    },
  });
}

/** Persist AI-built stages for a catalog concept that has none yet. */
export function useEnsureConceptStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      conceptId: string;
      stages: {
        ord: number;
        name: string;
        loop_phase: string;
        description: string;
        est_time: string;
        content: Record<string, unknown>;
      }[];
    }) => {
      const { error } = await supabase.rpc("ensure_concept_stages", {
        p_concept_id: input.conceptId,
        p_stages: input.stages as unknown as Json,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["concept"] });
    },
  });
}

/** Start (or resume) a mastery path for a catalog concept. */
export function useStartMasteryPath() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { conceptId: string; conceptName: string; subject: string }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const { data: existing } = await supabase
        .from("mastery_paths")
        .select("*")
        .eq("user_id", user_id)
        .eq("concept_id", input.conceptId)
        .maybeSingle();
      if (existing) return existing;

      const { data, error } = await supabase
        .from("mastery_paths")
        .insert({
          user_id,
          concept_id: input.conceptId,
          concept_name: input.conceptName,
          subject: input.subject,
          current_stage: 0,
          stage_label: "Foundations",
          pct: 0,
          level: "Beginning",
          color: "#2e9e6b",
          next_action: "Start with a quick check",
        })
        .select()
        .single();
      if (error) throw error;

      const stages = Array.from({ length: 8 }, (_, ord) => ({
        path_id: data.id,
        ord,
        state: ord === 0 ? "current" : "not_started",
      }));
      await supabase.from("path_stage_progress").insert(stages);
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["mastery_paths"] });
      qc.invalidateQueries({ queryKey: ["learner_stats"] });
      trackMasteryPathStarted(v.conceptName);
    },
  });
}

/** Upsert a section's saved body and/or AI blocks (keyed by experience_id + ord). */
export function useSaveSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { experienceId: string; ord: number; name: string; body?: string; aiBlocks?: { action: string; text: string }[] }) => {
      const { data: existing } = await supabase.from("experience_sections").select("*").eq("experience_id", input.experienceId).eq("ord", input.ord).maybeSingle();
      const aiBlocks: { action: string; text: string }[] = input.aiBlocks ?? (existing?.ai_blocks as { action: string; text: string }[] | null) ?? [];
      const payload = {
        experience_id: input.experienceId,
        ord: input.ord,
        name: input.name,
        body: input.body ?? existing?.body ?? null,
        ai_blocks: aiBlocks as unknown as Json,
      };
      const { error } = await supabase.from("experience_sections").upsert(payload, { onConflict: "experience_id,ord" });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["experience_sections", v.experienceId] }),
  });
}

/** Assigns an experience to a class server-side (computes teacher name, writes
 * the assignment row, and notifies the class) in one round trip. */
export function useAssignExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { experienceId: string; classId: string }) => {
      const { error } = await supabase.rpc("assign_experience", { p_experience_id: input.experienceId, p_class_id: input.classId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

/** Student joins a teacher's class by its share code. */
export function useJoinClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("join_class", { p_code: code.trim() });
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as { class_id: string; class_name: string } | undefined;
      if (!row) throw new Error("Could not join that class");
      return row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student_assignments"] });
      qc.invalidateQueries({ queryKey: ["my_classes"] });
      trackClassJoined();
    },
  });
}

/** Creates the assessment draft, then generates and persists its AI items.
 * Rolls back the draft row if item generation fails, so no empty drafts linger. */
export function useGenerateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: string; title: string; classId?: string | null; classLabel?: string; itemMix: { label: string; pct: number }[]; topic?: string }) => {
      const teacher_id = await uid();
      if (!teacher_id) throw new Error("Not signed in");
      const { data, error } = await supabase.from("assessments").insert({ teacher_id, type: input.type, title: input.title, class_id: input.classId ?? null, class_label: input.classLabel, item_mix: input.itemMix, status: "draft", submitted: 0, total: 0, distribution: [] }).select().single();
      if (error) throw error;

      try {
        const items = await generateAssessmentQuestions({ type: input.type, mix: input.itemMix, topic: input.topic });
        const rows = items.map((q, ord) => ({
          assessment_id: data.id,
          ord,
          prompt: q.prompt,
          options: q.options as unknown as Json,
          correct_index: q.correctIndex,
          dimension: q.dimension,
        }));
        const { error: qErr } = await supabase.from("assessment_questions").insert(rows);
        if (qErr) throw qErr;
      } catch (e) {
        await supabase.from("assessments").delete().eq("id", data.id);
        throw e;
      }
      return data;
    },
    onSuccess: (data, v) => {
      qc.invalidateQueries({ queryKey: ["assessments"] });
      qc.invalidateQueries({ queryKey: ["assessment_questions", data.id] });
      trackAssessmentCreated(v.type);
    },
  });
}

/** Edits a single AI-drafted question before the assessment is assigned.
 * Covered by the existing "teacher manage questions" RLS policy (FOR ALL,
 * scoped to assessments.teacher_id = auth.uid()) — no new migration. */
export function useUpdateAssessmentQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; assessmentId: string; prompt: string; options: string[]; correctIndex: number }) => {
      const { error } = await supabase.from("assessment_questions").update({
        prompt: input.prompt,
        options: input.options as unknown as Json,
        correct_index: input.correctIndex,
      }).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["assessment_questions", v.assessmentId] }),
  });
}

/** Removes a drafted question the teacher decided not to use. */
export function useDeleteAssessmentQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; assessmentId: string }) => {
      const { error } = await supabase.from("assessment_questions").delete().eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["assessment_questions", v.assessmentId] }),
  });
}

/** Teacher publishes a draft assessment to a class (flips status to "assigned"). */
export function useAssignAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { assessmentId: string; classId: string }) => {
      const { error } = await supabase.rpc("assign_assessment", { p_assessment_id: input.assessmentId, p_class_id: input.classId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

/** Autosaves in-progress answers during Controlled Assessment Mode (draft
 * row, submitted_at stays NULL, never scored or counted). Best-effort —
 * callers should not surface every autosave failure as a blocking error. */
export function useAutosaveAssessment() {
  return useMutation({
    mutationFn: async (input: { assessmentId: string; answers: { question_id: string; chosen_index: number }[] }) => {
      const { error } = await supabase.rpc("autosave_assessment_answers", { p_assessment_id: input.assessmentId, p_answers: input.answers as unknown as Json });
      if (error) throw error;
    },
  });
}

/** Student submits their answers; scoring and aggregate rollup happen server-side. */
export function useSubmitAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { assessmentId: string; answers: { question_id: string; chosen_index: number }[] }) => {
      const { data, error } = await supabase.rpc("submit_assessment", { p_assessment_id: input.assessmentId, p_answers: input.answers as unknown as Json });
      if (error) throw error;
      return data as { score: number; level: string; correct: number; total: number };
    },
    onSuccess: (d, v) => {
      qc.invalidateQueries({ queryKey: ["assessment_for_taking", v.assessmentId] });
      qc.invalidateQueries({ queryKey: ["student_assignments"] });
      if (d?.level) trackAssessmentSubmitted(d.level);
    },
  });
}

/** Teacher generates and creates a class-scoped challenge in one step. */
export function useCreateClassChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { classId: string; className: string; type: string; topic?: string }) => {
      const teacher_id = await uid();
      if (!teacher_id) throw new Error("Not signed in");
      const draft = await generateClassChallenge({ type: input.type, className: input.className, topic: input.topic });
      const colors = CHALLENGE_TYPE_COLORS[input.type] || CHALLENGE_TYPE_COLORS["Knowledge sprint"];
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          created_by: teacher_id,
          class_id: input.classId,
          type: input.type,
          scope: "Class",
          mode: `Team · ${input.className}`,
          timeline: "This term",
          accent: colors.accent,
          fg: colors.fg,
          bg: colors.bg,
          title: draft.title,
          body: draft.body,
          brief: draft.brief,
          stages: draft.stages as unknown as Json,
          is_featured: false,
        })
        .select()
        .single();
      if (error) throw error;

      // Best-effort: a notify failure should not block the challenge from being created.
      await supabase.rpc("notify_class", {
        p_class_id: input.classId,
        p_kind: "challenge",
        p_title: `New challenge: ${draft.title}`,
        p_body: `${input.className} can now join this challenge.`,
      }).then(undefined, () => {});

      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["class_challenges", v.classId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      trackChallengeCreated(v.type);
    },
  });
}

/** Edits a challenge's title/brief/stages after creation. Covered by the
 * new "teachers update own challenges" RLS policy (created_by = auth.uid()). */
export function useUpdateClassChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; classId?: string | null; title: string; body: string; brief: string; stages: { name: string; goal: string; task: string }[] }) => {
      const { error } = await supabase.from("challenges").update({
        title: input.title,
        body: input.body,
        brief: input.brief,
        stages: input.stages as unknown as Json,
      }).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["challenge_detail", v.id] });
      qc.invalidateQueries({ queryKey: ["challenges"] });
      if (v.classId) qc.invalidateQueries({ queryKey: ["class_challenges", v.classId] });
    },
  });
}

/** Teacher writes feedback + a level on a student's challenge submission and
 * notifies them. Goes through review_challenge_submission (SECURITY DEFINER,
 * owner-checked) so students can never author their own feedback. */
export function useReviewChallengeSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { submissionId: string; challengeId: string; feedback: string; level: string }) => {
      const { error } = await supabase.rpc("review_challenge_submission", {
        p_submission_id: input.submissionId,
        p_feedback: input.feedback,
        p_level: input.level,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["challenge_submissions", v.challengeId] }),
  });
}

/** Saves in-progress challenge work (per-stage notes + current stage) so a
 * student can leave and resume later. Not a submission. */
export function useSaveChallengeProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { challengeId: string; stage: number; work: Record<string, string> }) => {
      const user_id = await uid();
      if (!user_id) return;
      const { error } = await supabase.from("challenge_submissions").upsert(
        { challenge_id: input.challengeId, user_id, status: "in_progress", stage: input.stage, work: input.work as unknown as Json },
        { onConflict: "challenge_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["my_challenge_submission", v.challengeId] }),
  });
}

export function useSubmitChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { challengeId: string; work?: Json }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const { error } = await supabase.from("challenge_submissions").upsert({ challenge_id: input.challengeId, user_id, status: "submitted", work: input.work ?? {} }, { onConflict: "challenge_id,user_id" });
      if (error) throw error;

      // Best-effort: notify the challenge's teacher (no-op for platform-catalog challenges).
      await supabase.rpc("notify_challenge_submission", { p_challenge_id: input.challengeId }).then(undefined, () => {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["challenge_submissions"] }); trackChallengeSubmitted(); },
  });
}

/** Mark one or more notifications as read (direct update; RLS scopes to the caller). */
export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications_unread_count"] });
    },
  });
}

function levelFromPct(pct: number): string {
  if (pct >= 90) return "Mastered";
  if (pct >= 70) return "Secure";
  if (pct >= 40) return "Developing";
  return "Beginning";
}

async function refreshLearnerStats(userId: string) {
  const { data: paths } = await supabase.from("mastery_paths").select("level, pct, concept_name").eq("user_id", userId);
  const list = paths || [];
  const mastered = list.filter((p) => p.level === "Mastered" || p.level === "Secure").length;
  const developing = list.filter((p) => p.level === "Developing" || p.level === "Beginning").length;
  const accuracy = list.length ? Math.round(list.reduce((s, p) => s + (p.pct || 0), 0) / list.length) : 0;
  const skills = list.slice(0, 6).map((p) => ({ name: p.concept_name, pct: p.pct || 0 }));
  await supabase.from("learner_stats").upsert(
    { user_id: userId, mastered, developing, accuracy, streak: 1, skills: skills as unknown as Json },
    { onConflict: "user_id" },
  );
}

/** Advance a path stage and keep Progress / mastery map in sync. */
export function useAdvanceStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      pathId: string;
      stage: number;
      stageLabel?: string;
      totalStages?: number;
      conceptId?: string | null;
      conceptName?: string;
      subject?: string;
    }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const total = input.totalStages || 8;
      const pct = Math.min(100, Math.round(((input.stage + 1) / total) * 100));
      const level = levelFromPct(pct);
      const { error } = await supabase
        .from("mastery_paths")
        .update({
          current_stage: input.stage,
          stage_label: input.stageLabel || null,
          pct,
          level,
          next_action: input.stage >= total - 1 ? "Review mastery profile" : `Continue ${input.stageLabel || "path"}`,
        })
        .eq("id", input.pathId);
      if (error) throw error;

      // Mark completed stages on the path
      for (let ord = 0; ord < total; ord++) {
        const state = ord < input.stage ? "done" : ord === input.stage ? "current" : "not_started";
        await supabase.from("path_stage_progress").upsert(
          { path_id: input.pathId, ord, state },
          { onConflict: "path_id,ord" },
        );
      }

      if (input.conceptName) {
        await supabase.from("mastery_profiles").upsert(
          {
            user_id,
            concept_id: input.conceptId || null,
            concept_name: input.conceptName,
            subject: input.subject || null,
            overall_state: level,
            concept_knowledge: Math.min(5, Math.round(pct / 20)),
            procedural_fluency: Math.min(5, Math.round(pct / 22)),
            recall: Math.min(5, Math.round(pct / 25)),
            reasoning: Math.min(5, Math.round(pct / 24)),
            application: Math.min(5, Math.round(pct / 23)),
          },
          { onConflict: "user_id,concept_id" },
        );
      }

      await refreshLearnerStats(user_id);
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["mastery_paths"] });
      qc.invalidateQueries({ queryKey: ["mastery_profiles"] });
      qc.invalidateQueries({ queryKey: ["learner_stats"] });
      if (v.conceptName) trackStageCompleted(v.conceptName, v.stageLabel || String(v.stage));
    },
  });
}

/** Persist a computed mastery-check profile for Progress. */
export function useSaveMasteryResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      pathId: string;
      conceptId?: string | null;
      conceptName: string;
      subject?: string;
      knowledge: number;
      application: number;
      analysis: number;
      overall: number;
      level: string;
      note: string;
    }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const pct = Math.min(100, Math.round((input.overall / 5) * 100));
      // Schedule a confirmation question 48–72 hours from now (random offset to vary delivery)
      const hoursAhead = 48 + Math.floor(Math.random() * 24);
      const scheduledFor = new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
      let confirmationStored = false;
      try {
        const { generateConfirmationQuestion } = await import("./ai");
        const q = await generateConfirmationQuestion(input.conceptName, input.subject || "STEM");
        await supabase.from("mastery_confirmations").insert({
          user_id,
          concept_id: input.conceptId || null,
          concept_name: input.conceptName,
          subject: input.subject || null,
          path_id: input.pathId,
          question: q,
          scheduled_for: scheduledFor,
        });
        confirmationStored = true;
      } catch {
        // If question generation fails, still complete the path normally
      }

      await supabase
        .from("mastery_paths")
        .update({
          current_stage: 7,
          stage_label: "Mastery check",
          pct: Math.max(pct, 85),
          level: input.level,
          next_action: confirmationStored ? "Confirmation pending" : "See progress",
          status: confirmationStored ? "awaiting_confirmation" : "completed",
        })
        .eq("id", input.pathId);

      await supabase.from("mastery_profiles").upsert(
        {
          user_id,
          concept_id: input.conceptId || null,
          concept_name: input.conceptName,
          subject: input.subject || null,
          // Gate 2 pending: hold at "Mastery check passed" until confirmation answered
          overall_state: confirmationStored ? "Mastery check passed" : input.level,
          concept_knowledge: input.knowledge,
          application: input.application,
          reasoning: input.analysis,
          procedural_fluency: Math.round((input.knowledge + input.application) / 2),
          recall: Math.round((input.knowledge + input.analysis) / 2),
        },
        { onConflict: "user_id,concept_id" },
      );

      await refreshLearnerStats(user_id);
      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mastery_paths"] });
      qc.invalidateQueries({ queryKey: ["mastery_profiles"] });
      qc.invalidateQueries({ queryKey: ["learner_stats"] });
    },
  });
}

// ---------- Mastery confirmation (Gate 2) ----------

export function useAnswerConfirmation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      confirmationId: string;
      pathId: string | null;
      conceptId?: string | null;
      conceptName: string;
      subject?: string;
      correct: boolean;
      level: string;
    }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");

      // Record the answer
      await supabase
        .from("mastery_confirmations")
        .update({ answered_at: new Date().toISOString(), correct: input.correct })
        .eq("id", input.confirmationId);

      if (input.correct) {
        // Gate 2 passed: mark concept as Secured
        await supabase
          .from("mastery_profiles")
          .update({ overall_state: "Secured" })
          .eq("user_id", user_id)
          .eq("concept_name", input.conceptName);

        if (input.pathId) {
          await supabase
            .from("mastery_paths")
            .update({ status: "completed", next_action: "See progress" })
            .eq("id", input.pathId);
        }
      } else {
        // Gate 2 failed: back to in_progress, path re-opened for review
        await supabase
          .from("mastery_profiles")
          .update({ overall_state: "In progress" })
          .eq("user_id", user_id)
          .eq("concept_name", input.conceptName);

        if (input.pathId) {
          await supabase
            .from("mastery_paths")
            .update({ status: "in_progress", next_action: "Review and retry" })
            .eq("id", input.pathId);
        }
      }

      await refreshLearnerStats(user_id);
      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending_confirmation"] });
      qc.invalidateQueries({ queryKey: ["mastery_profiles"] });
      qc.invalidateQueries({ queryKey: ["mastery_paths"] });
      qc.invalidateQueries({ queryKey: ["learner_stats"] });
    },
  });
}

// ---------- Recall (spaced repetition) ----------

export interface RecallCardState { id: string; state: string; intervalDays: number }

/** Ensures a recall_cards row exists for every card shown in a Recall stage,
 * without disturbing the schedule of cards the learner has already rated
 * before. Front text is the natural key per user + concept. */
export function useEnsureRecallCards() {
  return useMutation({
    mutationFn: async (input: { conceptId?: string | null; conceptName: string; cards: { front: string; back: string }[] }): Promise<Record<string, RecallCardState>> => {
      const user_id = await uid();
      if (!user_id || input.cards.length === 0) return {};
      const fronts = input.cards.map((c) => c.front);

      const { data: existing } = await supabase
        .from("recall_cards")
        .select("id, front, state, interval_days")
        .eq("user_id", user_id)
        .eq("concept_name", input.conceptName)
        .in("front", fronts);

      const map: Record<string, RecallCardState> = {};
      (existing || []).forEach((r) => { map[r.front] = { id: r.id, state: r.state, intervalDays: r.interval_days }; });

      const missing = input.cards.filter((c) => !map[c.front]);
      if (missing.length > 0) {
        const rows = missing.map((c) => ({ user_id, concept_id: input.conceptId || null, concept_name: input.conceptName, front: c.front, back: c.back }));
        const { data: inserted, error } = await supabase.from("recall_cards").insert(rows).select("id, front, state, interval_days");
        if (error) throw error;
        (inserted || []).forEach((r) => { map[r.front] = { id: r.id, state: r.state, intervalDays: r.interval_days }; });
      }
      return map;
    },
  });
}

/** Simple Leitner-style scheduler: "Again"/"Hard" bring a card back soon,
 * "Good"/"Easy" push it out further each time it is rated well. This is a
 * transparent heuristic, not a validated forgetting-curve model. */
function nextRecallSchedule(priorIntervalDays: number, rating: string): { intervalDays: number; state: string } {
  switch (rating) {
    case "Again":
      return { intervalDays: 0, state: "Difficult" };
    case "Hard":
      return { intervalDays: 1, state: "Difficult" };
    case "Easy":
      return { intervalDays: priorIntervalDays > 0 ? Math.round(priorIntervalDays * 2.5) : 6, state: "Secure" };
    default: // "Good"
      return { intervalDays: priorIntervalDays > 0 ? Math.round(priorIntervalDays * 2) : 3, state: "Secure" };
  }
}

export function useRateRecallCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { cardId: string; rating: string; priorIntervalDays: number }) => {
      const { intervalDays, state } = nextRecallSchedule(input.priorIntervalDays, input.rating);
      const due = new Date();
      due.setDate(due.getDate() + intervalDays);
      const { error } = await supabase
        .from("recall_cards")
        .update({ state, interval_days: intervalDays, due_at: due.toISOString().slice(0, 10), last_rating: input.rating })
        .eq("id", input.cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recall_due_count"] });
      qc.invalidateQueries({ queryKey: ["recall_due_cards"] });
    },
  });
}

/** Persists a Lab activity's "Record your result" observation. Reuses the
 * existing attempts table (kind: 'lab') rather than a new one. */
export function useRecordLabObservation() {
  return useMutation({
    mutationFn: async (input: { activityTitle: string; stepTitle: string; observation: string }) => {
      const user_id = await uid();
      if (!user_id || !input.observation.trim()) return;
      const { error } = await supabase.from("attempts").insert({
        user_id,
        kind: "lab",
        prompt: `${input.activityTitle} — ${input.stepTitle}`,
        response: { observation: input.observation.trim() } as unknown as Json,
      });
      if (error) throw error;
    },
  });
}

/** Marks an assigned experience as opened (in_progress) or done (completed).
 * Always writes exactly the status it's given — callers are responsible for
 * only firing "in_progress" when there's no existing (possibly completed)
 * row yet, so reopening a finished experience doesn't downgrade it. */
export function useMarkExperienceProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { experienceId: string; status: "in_progress" | "completed" }) => {
      const user_id = await uid();
      if (!user_id) return;
      const { error } = await supabase.from("experience_progress").upsert(
        { user_id, experience_id: input.experienceId, status: input.status, completed_at: input.status === "completed" ? new Date().toISOString() : null },
        { onConflict: "user_id,experience_id" },
      );
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["experience_progress", v.experienceId] });
      qc.invalidateQueries({ queryKey: ["student_assignments"] });
    },
  });
}

/** Logs one Independent Practice attempt. Reuses the existing `attempts`
 * table (already has concept_id/correct/mistake_category columns, built for
 * exactly this) — no new migration. */
export function useLogIndependentAttempt() {
  return useMutation({
    mutationFn: async (input: { conceptId?: string; conceptName: string; prompt: string; correct: boolean; mistakeCategory: string | null }) => {
      const user_id = await uid();
      if (!user_id) return;
      const { error } = await supabase.from("attempts").insert({
        user_id,
        concept_id: input.conceptId || null,
        kind: "independent_practice",
        prompt: input.prompt,
        correct: input.correct,
        mistake_category: input.mistakeCategory,
        response: { conceptName: input.conceptName } as unknown as Json,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => trackIndependentAttempt(v.correct, v.mistakeCategory),
  });
}

export type SolveHelpMode = "hint" | "steps" | "check" | "concept" | "similar";

export type SolveSessionPayload = {
  question: string;
  helpMode: SolveHelpMode;
  topic?: string;
  conceptId?: string | null;
  finalAnswer?: string;
  status?: "started" | "completed" | "saved";
  saved?: boolean;
  method?: string;
  struggle?: string;
  couldRepeat?: string;
  stepCount?: number;
  hint?: string;
  explanation?: string;
};

/** Start a Solve session row so history captures every problem, not only saves. */
export function useLogSolveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SolveSessionPayload): Promise<string | null> => {
      const user_id = await uid();
      if (!user_id) return null;
      const { data, error } = await supabase
        .from("attempts")
        .insert({
          user_id,
          kind: "solve",
          prompt: input.question,
          concept_id: input.conceptId || null,
          response: {
            topic: input.topic || "",
            helpMode: input.helpMode,
            finalAnswer: input.finalAnswer || "",
            status: input.status || "started",
            saved: !!input.saved,
            method: input.method || "",
            struggle: input.struggle || "",
            couldRepeat: input.couldRepeat || "",
            stepCount: input.stepCount || 0,
            hint: input.hint || "",
            explanation: input.explanation || "",
          } as unknown as Json,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data?.id ?? null;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intel", "solve-history"] });
    },
  });
}

/** Enrich an existing Solve session (reflection, final answer, saved flag). */
export function useUpdateSolveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      attemptId: string;
      topic?: string;
      finalAnswer?: string;
      status?: "started" | "completed" | "saved";
      saved?: boolean;
      method?: string;
      struggle?: string;
      couldRepeat?: string;
      conceptId?: string | null;
    }) => {
      const user_id = await uid();
      if (!user_id) return;
      const { data: existing, error: readErr } = await supabase
        .from("attempts")
        .select("response")
        .eq("id", input.attemptId)
        .eq("user_id", user_id)
        .maybeSingle();
      if (readErr) throw readErr;
      const prev = (existing?.response as Record<string, unknown>) || {};
      const response = {
        ...prev,
        topic: input.topic ?? prev.topic ?? "",
        finalAnswer: input.finalAnswer ?? prev.finalAnswer ?? "",
        status: input.status ?? prev.status ?? "completed",
        saved: input.saved ?? prev.saved ?? false,
        method: input.method ?? prev.method ?? "",
        struggle: input.struggle ?? prev.struggle ?? "",
        couldRepeat: input.couldRepeat ?? prev.couldRepeat ?? "",
      };
      const patch: { response: Json; concept_id?: string | null } = {
        response: response as unknown as Json,
      };
      if (input.conceptId !== undefined) patch.concept_id = input.conceptId;
      const { error } = await supabase.from("attempts").update(patch).eq("id", input.attemptId).eq("user_id", user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intel", "solve-history"] });
    },
  });
}

/** @deprecated Prefer useLogSolveSession / useUpdateSolveSession. Kept for older call sites. */
export function useLogSolveReflection() {
  const log = useLogSolveSession();
  return useMutation({
    mutationFn: async (input: {
      question: string;
      finalAnswer: string;
      topic?: string;
      method?: string;
      struggle?: string;
      couldRepeat?: string;
      saved?: boolean;
    }) => {
      await log.mutateAsync({
        question: input.question,
        helpMode: "steps",
        topic: input.topic,
        finalAnswer: input.finalAnswer,
        status: input.saved ? "saved" : "completed",
        saved: !!input.saved,
        method: input.method,
        struggle: input.struggle,
        couldRepeat: input.couldRepeat,
      });
    },
  });
}

/** Solve's "Share with Teacher" follow-up. Reuses the existing notify_teacher
 * RPC (already enforces class membership) with a new "share" notification kind. */
export function useShareSolveWithTeacher() {
  return useMutation({
    mutationFn: async (input: { classId: string; question: string }) => {
      const preview = input.question.length > 140 ? `${input.question.slice(0, 140)}…` : input.question;
      const { error } = await supabase.rpc("notify_teacher", {
        p_class_id: input.classId,
        p_kind: "share",
        p_title: "A student shared a solved question",
        p_body: preview,
      });
      if (error) throw error;
    },
  });
}

// ---------- Profile & account ----------

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      firstName?: string; lastName?: string; bio?: string; school?: string; grade?: string;
      subjects?: string[]; goals?: string[]; parentContact?: string; teachingExperience?: string;
    }) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update({
        first_name: input.firstName, last_name: input.lastName, bio: input.bio,
        school: input.school, grade: input.grade, subjects: input.subjects, goals: input.goals,
        parent_contact: input.parentContact, teaching_experience: input.teachingExperience,
      }).eq("user_id", user_id);
      if (error) throw error;

      // Keep the locally-cached profile (used for greetings/initials) in sync.
      try {
        const local = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const name = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
        localStorage.setItem("userProfile", JSON.stringify({ ...local, ...(name ? { name } : {}) }));
      } catch {
        // non-fatal
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export interface UploadedIntakeFile { path: string; signedUrl: string; name: string }

/** Uploads a Learn-intake attachment (notes photo/file) to the private
 * "uploads" bucket, own folder enforced by storage RLS. Returns a short-lived
 * signed URL for an in-session preview; nothing else reads this file back,
 * so no DB row is created for it. */
export function useUploadIntakeFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadedIntakeFile> => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user_id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: signed, error: signError } = await supabase.storage.from("uploads").createSignedUrl(path, 3600);
      if (signError) throw signError;

      return { path, signedUrl: signed.signedUrl, name: file.name };
    },
  });
}

/** Uploads a new avatar image to the "avatars" bucket (own folder, enforced
 * by storage RLS) and points profiles.avatar_url at its public URL. */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const user_id = await uid();
      if (!user_id) throw new Error("Not signed in");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user_id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user_id);
      if (error) throw error;
      return avatarUrl;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/** Permanently deletes the signed-in user's account. Every owned row cascades
 * away via the existing auth.users(id) ON DELETE CASCADE foreign keys. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      localStorage.clear();
      await supabase.auth.signOut();
    },
  });
}
