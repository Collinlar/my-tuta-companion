import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDueRecallCount } from "../data/queries";

// ---------------------------------------------------------------------------
// The mytuta Intelligence Layer — client data hooks over the rules engine
// (RPCs in 20260720430000_mytuta_intelligence_core.sql). Goals + memory are
// own-row tables, so those writes go direct; the model/NBA/insights are RPCs.
// ---------------------------------------------------------------------------

export interface NbaCandidate {
  key: string; action: string; reason: string; route: string; est_minutes?: number;
}
export interface NextBestAction {
  primary: NbaCandidate | null;
  alternatives: NbaCandidate[];
}

export function useNextBestAction() {
  return useQuery({
    queryKey: ["intel", "nba"],
    queryFn: async (): Promise<NextBestAction> => {
      const { data, error } = await supabase.rpc("next_best_action");
      if (error) throw error;
      const d = (data as unknown as NextBestAction) || { primary: null, alternatives: [] };
      return { primary: d.primary ?? null, alternatives: d.alternatives ?? [] };
    },
    staleTime: 30_000,
  });
}

export interface LearnerModel {
  identity: { learning_stage: string | null; subjects: string[]; onboarding: Record<string, unknown> };
  skills: Record<string, number>;
  strengths: string[];
  challenges: string[];
  top_mistake: string | null;
  concepts: { concept: string; state: string }[];
  goals: { id: string; title: string; kind: string; status: string }[];
  support_level: string;
  prefs: Record<string, unknown>;
  corrections: Record<string, unknown>;
  summary: string | null;
}

export function useLearnerModel() {
  return useQuery({
    queryKey: ["intel", "model"],
    queryFn: async (): Promise<LearnerModel> => {
      const { data, error } = await supabase.rpc("learner_model");
      if (error) throw error;
      return data as unknown as LearnerModel;
    },
    staleTime: 60_000,
  });
}

export interface Insight { text: string; action_label: string; action_route: string }

export function useLearningInsights() {
  return useQuery({
    queryKey: ["intel", "insights"],
    queryFn: async (): Promise<Insight[]> => {
      const { data, error } = await supabase.rpc("learning_insights");
      if (error) throw error;
      return (data as unknown as Insight[]) || [];
    },
    staleTime: 60_000,
  });
}

export interface SolveHistoryTopic {
  topic: string;
  attempted: number;
  saved: number;
  last_at: string;
}

export interface SolveHistorySession {
  id: string;
  prompt: string;
  concept_id: string | null;
  created_at: string;
  topic: string;
  help_mode: string;
  status: string;
  saved: boolean;
  final_answer: string;
  method: string;
  struggle: string;
  could_repeat: string;
  step_count: number;
  hint: string;
  explanation: string;
}

export interface SolveHistoryData {
  topics: SolveHistoryTopic[];
  sessions: SolveHistorySession[];
}

/** Older RPC returned a bare array of topics; new shape is { topics, sessions }. */
function normalizeSolveHistory(raw: unknown): SolveHistoryData {
  if (Array.isArray(raw)) {
    return { topics: raw as SolveHistoryTopic[], sessions: [] };
  }
  const obj = (raw || {}) as Partial<SolveHistoryData>;
  return {
    topics: obj.topics || [],
    sessions: obj.sessions || [],
  };
}

export function useSolveHistory() {
  return useQuery({
    queryKey: ["intel", "solve-history"],
    queryFn: async (): Promise<SolveHistoryData> => {
      const { data, error } = await supabase.rpc("solve_history");
      if (error) throw error;
      return normalizeSolveHistory(data);
    },
  });
}

export interface Goal { id: string; title: string; kind: string; concept_id: string | null; target: string | null; status: string }

export function useGoals() {
  return useQuery({
    queryKey: ["intel", "goals"],
    queryFn: async (): Promise<Goal[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("student_goals").select("*").eq("user_id", uid).eq("status", "active").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Goal[];
    },
  });
}

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

/** Quiet, contextual nav badges (spec §8): a dot on Home when there's a next
 * action, the due-review count on Progress. Kept minimal and non-noisy. */
export function useIntelligenceBadges(): Record<string, number> {
  const { data: nba } = useNextBestAction();
  const { data: due } = useDueRecallCount();
  return { home: nba?.primary ? 1 : 0, progress: due || 0 };
}

/** Fire-and-forget behavioral event (never blocks the UI). */
export async function recordEvent(kind: string, opts?: { conceptId?: string | null; pathId?: string | null; meta?: Record<string, unknown> }) {
  try {
    await supabase.rpc("record_learning_event", {
      p_kind: kind,
      p_concept_id: opts?.conceptId ?? undefined,
      p_path_id: opts?.pathId ?? undefined,
      p_meta: (opts?.meta as never) ?? undefined,
    });
  } catch {
    // intelligence is best-effort; a failed event must never break a flow
  }
}

function useIntelWrite<TArgs>(fn: (a: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intel"] });
    },
  });
}

export function useSetGoal() {
  return useIntelWrite(async (a: { title: string; kind?: "short" | "long"; conceptId?: string | null; target?: string }) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw new Error("Not signed in");
    const { error } = await supabase.from("student_goals").insert({
      user_id: uid, title: a.title, kind: a.kind ?? "short", concept_id: a.conceptId ?? null, target: a.target ?? null,
    });
    if (error) throw error;
    await recordEvent("goal_selected", { conceptId: a.conceptId ?? null, meta: { title: a.title } });
  });
}

export function useUpdateGoal() {
  return useIntelWrite(async (a: { id: string; status: "active" | "achieved" | "dropped" }) => {
    const { error } = await supabase.from("student_goals").update({ status: a.status }).eq("id", a.id);
    if (error) throw error;
  });
}

/** Upsert the editable learner profile (support level / prefs / corrections). */
export function useCorrectProfile() {
  return useIntelWrite(async (a: { support_level?: string; prefs?: Record<string, unknown>; corrections?: Record<string, unknown>; summary?: string }) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw new Error("Not signed in");
    const patch = {
      user_id: uid,
      ...(a.support_level !== undefined ? { support_level: a.support_level } : {}),
      ...(a.prefs !== undefined ? { prefs: a.prefs as never } : {}),
      ...(a.corrections !== undefined ? { corrections: a.corrections as never } : {}),
      ...(a.summary !== undefined ? { summary: a.summary } : {}),
    };
    const { error } = await supabase.from("learner_profile").upsert(patch, { onConflict: "user_id" });
    if (error) throw error;
  });
}
