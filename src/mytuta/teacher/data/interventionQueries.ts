/**
 * React Query hooks for teacher interventions, templates, and follow-up tracking.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface InterventionRow {
  id:                string;
  teacher_id:        string;
  class_id:          string | null;
  concept_id:        string | null;
  template_id:       string | null;
  intervention_type: string;
  title:             string;
  content:           Record<string, unknown>;
  ai_generated:      boolean;
  status:            "draft" | "assigned" | "completed" | "ignored";
  assigned_to:       string[] | null;
  created_at:        string;
}

export interface TemplateRow {
  id:                string;
  title:             string;
  intervention_type: string;
  content:           Record<string, unknown>;
  concept_id:        string | null;
  use_count:         number;
  created_at:        string;
}

export interface FollowUpRow {
  id:              string;
  intervention_id: string;
  student_id:      string;
  assigned_at:     string;
  completed_at:    string | null;
  pre_score:       number | null;
  post_score:      number | null;
}

export interface MisconceptionPattern {
  concept_name:    string;
  concept_id:      string;
  concept_slug:    string;
  pattern:         string;
  detail:          string;
  student_count:   number;
  pct_of_class:    number;
  avg_occurrences: number;
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useTeacherInterventions() {
  return useQuery({
    queryKey: ["teacher", "interventions"],
    queryFn: async (): Promise<InterventionRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("teacher_interventions")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InterventionRow[];
    },
    staleTime: 30_000,
  });
}

export function useInterventionTemplates() {
  return useQuery({
    queryKey: ["teacher", "intervention-templates"],
    queryFn: async (): Promise<TemplateRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("intervention_templates")
        .select("*")
        .eq("teacher_id", user.id)
        .order("use_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TemplateRow[];
    },
    staleTime: 60_000,
  });
}

export function useInterventionFollowUps(interventionId: string | null) {
  return useQuery({
    queryKey: ["teacher", "follow-ups", interventionId],
    enabled: !!interventionId,
    queryFn: async (): Promise<FollowUpRow[]> => {
      const { data, error } = await supabase
        .from("intervention_follow_ups")
        .select("*")
        .eq("intervention_id", interventionId!)
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FollowUpRow[];
    },
    staleTime: 30_000,
  });
}

export function useClassMisconceptionSummary(classId: string | null) {
  return useQuery({
    queryKey: ["teacher", "misconception-summary", classId],
    enabled: !!classId,
    queryFn: async (): Promise<MisconceptionPattern[]> => {
      const { data, error } = await supabase.rpc("class_misconception_summary", {
        p_class_id: classId!,
      });
      if (error) throw error;
      return (data as MisconceptionPattern[]) ?? [];
    },
    staleTime: 60_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────

export function useSaveAsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (interventionId: string): Promise<string> => {
      const { data, error } = await supabase.rpc("save_intervention_as_template", {
        p_intervention_id: interventionId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["teacher", "intervention-templates"] });
      void qc.invalidateQueries({ queryKey: ["teacher", "interventions"] });
    },
  });
}

export function useAssignIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      interventionId,
      studentIds,
      preScores,
    }: {
      interventionId: string;
      studentIds:     string[];
      preScores?:     Record<string, number>;
    }) => {
      // Create one follow-up row per student.
      const rows = studentIds.map((sid) => ({
        intervention_id: interventionId,
        student_id:      sid,
        pre_score:       preScores?.[sid] ?? null,
      }));

      const { error: insertErr } = await supabase
        .from("intervention_follow_ups")
        .insert(rows);
      if (insertErr) throw insertErr;

      // Mark the intervention as assigned.
      await supabase
        .from("teacher_interventions")
        .update({ status: "assigned", assigned_to: studentIds })
        .eq("id", interventionId);
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["teacher", "interventions"] });
      void qc.invalidateQueries({ queryKey: ["teacher", "follow-ups", vars.interventionId] });
    },
  });
}
