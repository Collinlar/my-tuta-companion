import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Every admin write goes through one of these hooks (each backed by an
// admin-gated, audit-logged RPC). On success we invalidate the affected user
// detail + directory + audit feed so the UI reflects the change immediately.
function useAdminAction<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
}

export function useSetUserStatus() {
  return useAdminAction(async (a: { userId: string; status: "active" | "suspended"; reason: string }) => {
    const { error } = await supabase.rpc("admin_set_user_status", { p_user_id: a.userId, p_status: a.status, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useChangeUserRole() {
  return useAdminAction(async (a: { userId: string; role: "student" | "teacher"; reason: string }) => {
    const { error } = await supabase.rpc("admin_change_user_role", { p_user_id: a.userId, p_role: a.role, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useAddUserNote() {
  return useAdminAction(async (a: { userId: string; note: string }) => {
    const { error } = await supabase.rpc("admin_add_user_note", { p_user_id: a.userId, p_note: a.note });
    if (error) throw error;
  });
}

export function useAdjustCredits() {
  return useAdminAction(async (a: { userId: string; amount: number; reason: string }) => {
    const { error } = await supabase.rpc("admin_adjust_credits", { p_user_id: a.userId, p_amount: a.amount, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useExtendCreditExpiry() {
  return useAdminAction(async (a: { userId: string; days: number; reason: string }) => {
    const { error } = await supabase.rpc("admin_extend_credit_expiry", { p_user_id: a.userId, p_days: a.days, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useCancelSubscription() {
  return useAdminAction(async (a: { userId: string; reason: string }) => {
    const { error } = await supabase.rpc("admin_cancel_subscription", { p_user_id: a.userId, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useAdminRefundCredits() {
  return useAdminAction(async (a: { txnId: string; reason: string }) => {
    const { error } = await supabase.rpc("admin_refund_credits", { p_txn_id: a.txnId, p_reason: a.reason });
    if (error) throw error;
  });
}

function useCreditsAction<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "action-costs"] });
      qc.invalidateQueries({ queryKey: ["admin", "bundles"] });
      qc.invalidateQueries({ queryKey: ["admin", "liability"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function useSetActionCost() {
  return useCreditsAction(async (a: { actionKey: string; cost: number; active: boolean; reason: string }) => {
    const { error } = await supabase.rpc("admin_set_action_cost", { p_action_key: a.actionKey, p_cost: a.cost, p_active: a.active, p_reason: a.reason });
    if (error) throw error;
  });
}

export interface BundleInput {
  id: string; name: string; price_ghs: number; credits: number; bonus: number;
  target_role: string; positioning: string; featured: boolean; active: boolean; sort: number; reason: string;
}
export function useUpsertBundle() {
  return useCreditsAction(async (b: BundleInput) => {
    const { error } = await supabase.rpc("admin_upsert_bundle", {
      p_id: b.id, p_name: b.name, p_price_ghs: b.price_ghs, p_credits: b.credits, p_bonus: b.bonus,
      p_target_role: b.target_role, p_positioning: b.positioning, p_featured: b.featured, p_active: b.active, p_sort: b.sort, p_reason: b.reason,
    });
    if (error) throw error;
  });
}

function usePlanAction<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export interface PlanInput {
  id: string; name: string; role: string; price_ghs: number; included_credits: number;
  rollover_cap: number; founding_price: number | null; active: boolean; reason: string;
}
export function useUpsertPlan() {
  return usePlanAction(async (p: PlanInput) => {
    const { error } = await supabase.rpc("admin_upsert_plan", {
      p_id: p.id, p_name: p.name, p_role: p.role, p_price_ghs: p.price_ghs,
      p_included_credits: p.included_credits, p_rollover_cap: p.rollover_cap,
      p_founding_price: p.founding_price, p_active: p.active, p_reason: p.reason,
    });
    if (error) throw error;
  });
}

export function useSubscriptionAction() {
  return usePlanAction(async (a: { userId: string; action: string; value: number; reason: string }) => {
    const { error } = await supabase.rpc("admin_subscription_action", { p_user_id: a.userId, p_action: a.action, p_value: a.value, p_reason: a.reason });
    if (error) throw error;
  });
}

function useContentAction<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "concepts"] });
      qc.invalidateQueries({ queryKey: ["admin", "concept"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export interface ConceptInput {
  id: string | null; slug: string; subject: string; name: string; description: string;
  learning_stage: string; difficulty: string; related_areas: string[]; reason: string;
}
export function useUpsertConcept() {
  return useContentAction(async (c: ConceptInput) => {
    const { error } = await supabase.rpc("admin_upsert_concept", {
      p_id: c.id, p_slug: c.slug, p_subject: c.subject, p_name: c.name, p_description: c.description,
      p_learning_stage: c.learning_stage, p_difficulty: c.difficulty, p_related_areas: c.related_areas, p_reason: c.reason,
    });
    if (error) throw error;
  });
}

export function useSetConceptStatus() {
  return useContentAction(async (a: { conceptId: string; status: string; reviewer: string; reason: string }) => {
    const { error } = await supabase.rpc("admin_set_concept_status", { p_concept_id: a.conceptId, p_status: a.status, p_reviewer: a.reviewer, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useUpsertMisconception() {
  return useContentAction(async (a: { id: string | null; conceptId: string; label: string; detail: string; reason: string }) => {
    const { error } = await supabase.rpc("admin_upsert_misconception", { p_id: a.id, p_concept_id: a.conceptId, p_label: a.label, p_detail: a.detail, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useSetAssessmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { assessmentId: string; status: string; reason: string }) => {
      const { error } = await supabase.rpc("admin_set_assessment_status", { p_assessment_id: a.assessmentId, p_status: a.status, p_reason: a.reason });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "assessments"] });
      qc.invalidateQueries({ queryKey: ["admin", "assessment"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function useRefundAiJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { jobId: string; reason: string }) => {
      const { error } = await supabase.rpc("admin_refund_ai_job", { p_job_id: a.jobId, p_reason: a.reason });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ai-jobs"] });
      qc.invalidateQueries({ queryKey: ["admin", "ai-usage"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function useTicketAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { ticketId: string; action: string; body?: string; value?: number; assignee?: string; reason?: string }) => {
      const { error } = await supabase.rpc("admin_ticket_action", {
        p_ticket_id: a.ticketId, p_action: a.action, p_body: a.body, p_value: a.value ?? 0, p_assignee: a.assignee, p_reason: a.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "ticket"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

function useSettingsAction<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "config"] });
      qc.invalidateQueries({ queryKey: ["admin", "flags"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function useSetConfig() {
  return useSettingsAction(async (a: { key: string; value: unknown; reason: string }) => {
    const { error } = await supabase.rpc("admin_set_config", { p_key: a.key, p_value: a.value as never, p_reason: a.reason });
    if (error) throw error;
  });
}

export function useSetFlag() {
  return useSettingsAction(async (a: { key: string; enabled: boolean; reason: string }) => {
    const { error } = await supabase.rpc("admin_set_flag", { p_key: a.key, p_enabled: a.enabled, p_target: {} as never, p_reason: a.reason });
    if (error) throw error;
  });
}

// Money refund: goes through the serverless endpoint (it holds the Paystack
// secret + records the refund). We pass the admin's access token so the server
// can verify admin membership and attribute the audit row.
export function useRecordRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { reference: string; amountGhs: number; reason: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/paystack-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify(a),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Refund failed.");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payment"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "reconciliation"] });
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function usePromoteConceptTierB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conceptId, slug }: { conceptId: string; slug: string }) => {
      // Mark the concept as Tier B (approved, reviewer set to admin)
      const { error: conceptErr } = await supabase
        .from("concepts")
        .update({ status: "approved", reviewer: "admin", last_reviewed_at: new Date().toISOString() })
        .eq("id", conceptId);
      if (conceptErr) throw conceptErr;

      // Mark demand record as promoted
      await supabase
        .from("concept_demand")
        .update({ promoted_at: new Date().toISOString(), promoted_to_tier: "B" })
        .eq("concept_slug", slug);

      return conceptId;
    },
    onSuccess: (conceptId) => {
      void qc.invalidateQueries({ queryKey: ["admin", "concept", conceptId] });
      void qc.invalidateQueries({ queryKey: ["admin", "concept-demand"] });
      void qc.invalidateQueries({ queryKey: ["admin", "concepts"] });
    },
  });
}
