import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** True if the signed-in user is an active admin. Drives the route guard. */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("current_user_is_admin");
      if (error) throw error;
      return data === true;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** The admin's role (super/product/content/finance/support/analyst) or null. */
export function useAdminRole() {
  return useQuery({
    queryKey: ["admin", "role"],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.rpc("current_admin_role");
      if (error) throw error;
      return (data as string | null) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface PlatformOverview {
  users: { students: number; teachers: number; new_7d: number; active_7d: number; active_30d: number };
  learning: { paths_created: number; paths_completed: number; solve_sessions: number; mastery_checks: number; concepts_mastered: number };
  commercial: { revenue_today: number; revenue_month: number; subs_active: number; subs_student_plus: number; subs_teacher_pro: number; failed_payments: number; refunds_month: number };
  credits: { issued: number; purchased: number; consumed: number; outstanding_welcome: number; outstanding_promo: number; outstanding_subscription: number; outstanding_purchased: number; expiring_7d: number };
  attention: { failed_payments: number; past_due_subs: number; expiring_credit_users: number };
}

export function usePlatformOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async (): Promise<PlatformOverview> => {
      const { data, error } = await supabase.rpc("platform_overview");
      if (error) throw error;
      return data as unknown as PlatformOverview;
    },
    refetchInterval: 60_000,
  });
}

export interface ActionCostRow { action_key: string; label: string; category: string; cost: number; active: boolean }

export function useActionCostsAdmin() {
  return useQuery({
    queryKey: ["admin", "action-costs"],
    queryFn: async (): Promise<ActionCostRow[]> => {
      const { data, error } = await supabase.from("credit_action_costs").select("*").order("category").order("cost");
      if (error) throw error;
      return (data ?? []) as ActionCostRow[];
    },
  });
}

export interface BundleRow { id: string; name: string; price_ghs: number; credits: number; bonus: number; target_role: string; positioning: string | null; featured: boolean; active: boolean; sort: number }

export function useBundlesAdmin() {
  return useQuery({
    queryKey: ["admin", "bundles"],
    queryFn: async (): Promise<BundleRow[]> => {
      const { data, error } = await supabase.from("credit_bundles").select("*").order("sort");
      if (error) throw error;
      return (data ?? []) as BundleRow[];
    },
  });
}

export function useCreditLiability() {
  return useQuery({
    queryKey: ["admin", "liability"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase.rpc("admin_credit_liability");
      if (error) throw error;
      return data as unknown as Record<string, number>;
    },
  });
}

export interface PlanRow { id: string; name: string; role: string; price_ghs: number; included_credits: number; rollover_cap: number; founding_price: number | null; active: boolean }

export function usePlansAdmin() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async (): Promise<PlanRow[]> => {
      const { data, error } = await supabase.from("plans").select("*").order("role");
      if (error) throw error;
      return (data ?? []) as PlanRow[];
    },
  });
}

export interface SubscriptionRow {
  user_id: string; plan: string; status: string; monthly_credits: number;
  current_period_end: string | null; founding: boolean; provider: string | null;
  email: string | null; name: string;
}

export function useAdminSubscriptions(plan: string, status: string, founding: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "subscriptions", plan, status, founding, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: SubscriptionRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_subscriptions", {
        p_plan: plan || undefined, p_status: status || undefined,
        p_founding: founding === "" ? undefined : founding === "yes",
        p_limit: limit, p_offset: offset,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: SubscriptionRow[] };
    },
  });
}

export interface PaymentRow {
  id: string; provider: string; provider_ref: string; kind: string;
  amount_ghs: number | null; credits: number | null; status: string; created_at: string;
  email: string | null; name: string;
}

export function useAdminPayments(search: string, status: string, kind: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "payments", search, status, kind, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: PaymentRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_payments", {
        p_search: search || undefined, p_status: status || undefined, p_kind: kind || undefined,
        p_limit: limit, p_offset: offset,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: PaymentRow[] };
    },
  });
}

export function useAdminPaymentDetail(paymentId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "payment", paymentId],
    enabled: !!paymentId,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_payment_detail", { p_payment_id: paymentId! });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export function useReconciliation() {
  return useQuery({
    queryKey: ["admin", "reconciliation"],
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_reconciliation");
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export interface ConceptRow {
  id: string; slug: string; name: string; subject: string; learning_stage: string | null;
  difficulty: string | null; status: string; last_reviewed_at: string | null;
  learners: number; stages: number; misconceptions: number;
}

export function useAdminConcepts(search: string, subject: string, status: string, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["admin", "concepts", search, subject, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: ConceptRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_concepts", {
        p_search: search || undefined, p_subject: subject || undefined, p_status: status || undefined, p_limit: limit, p_offset: offset,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: ConceptRow[] };
    },
  });
}

export function useAdminConceptDetail(conceptId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "concept", conceptId],
    enabled: !!conceptId,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_concept_detail", { p_concept_id: conceptId! });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export interface QuestionRow {
  id: string; prompt: string; options: unknown; correct_index: number | null; dimension: string | null;
  assessment_title: string | null; assessment_type: string | null; needs_review: boolean;
}

export function useAdminQuestions(search: string, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["admin", "questions", search, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: QuestionRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_questions", { p_search: search || undefined, p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data as unknown as { total: number; rows: QuestionRow[] };
    },
  });
}

export function useAdminPaths(search: string, status: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "paths", search, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: Record<string, unknown>[] }> => {
      const { data, error } = await supabase.rpc("admin_list_paths", { p_search: search || undefined, p_status: status || undefined, p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data as unknown as { total: number; rows: Record<string, unknown>[] };
    },
  });
}

export function useAdminExperiences(search: string, status: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "experiences", search, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: Record<string, unknown>[] }> => {
      const { data, error } = await supabase.rpc("admin_list_experiences", { p_search: search || undefined, p_status: status || undefined, p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data as unknown as { total: number; rows: Record<string, unknown>[] };
    },
  });
}

export interface AssessmentRow {
  id: string; title: string; type: string; status: string; class_label: string | null;
  submitted: number; total: number; avg_level: string | null; created_at: string; teacher: string; questions: number;
}

export function useAdminAssessments(search: string, type: string, status: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "assessments", search, type, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: AssessmentRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_assessments", {
        p_search: search || undefined, p_type: type || undefined, p_status: status || undefined, p_limit: limit, p_offset: offset,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: AssessmentRow[] };
    },
  });
}

export function useAdminAssessmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "assessment", id],
    enabled: !!id,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_assessment_detail", { p_assessment_id: id! });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export interface AiJobRow {
  id: string; task: string; provider: string; model: string | null; tokens_in: number | null;
  tokens_out: number | null; cost_estimate: number | null; latency_ms: number | null;
  status: string; error: string | null; ref: string | null; created_at: string; email: string | null;
}

export function useAiJobs(task: string, status: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "ai-jobs", task, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: AiJobRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_ai_jobs", { p_task: task || undefined, p_status: status || undefined, p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data as unknown as { total: number; rows: AiJobRow[] };
    },
  });
}

export function useAiUsage() {
  return useQuery({
    queryKey: ["admin", "ai-usage"],
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_ai_usage");
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export interface TicketRow {
  id: string; subject: string; category: string; status: string; priority: string;
  assignee: string | null; created_at: string; updated_at: string; email: string | null; name: string;
}

export function useAdminTickets(status: string, category: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "tickets", status, category, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: TicketRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_tickets", { p_status: status || undefined, p_category: category || undefined, p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data as unknown as { total: number; rows: TicketRow[] };
    },
  });
}

export function useAdminTicketDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "ticket", id],
    enabled: !!id,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_ticket_detail", { p_ticket_id: id! });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export interface ConfigRow { key: string; value: unknown; label: string; category: string }
export interface FlagRow { key: string; label: string; enabled: boolean; target: unknown }

export function useConfig() {
  return useQuery({
    queryKey: ["admin", "config"],
    queryFn: async (): Promise<ConfigRow[]> => {
      const { data, error } = await supabase.from("platform_config").select("*").order("category");
      if (error) throw error;
      return (data ?? []) as ConfigRow[];
    },
  });
}

export function useFlags() {
  return useQuery({
    queryKey: ["admin", "flags"],
    queryFn: async (): Promise<FlagRow[]> => {
      const { data, error } = await supabase.from("feature_flags").select("*").order("label");
      if (error) throw error;
      return (data ?? []) as FlagRow[];
    },
  });
}

export interface AuditRow {
  id: string; actor_id: string | null; actor_name: string; action: string;
  target_type: string | null; target_id: string | null; reason: string | null; created_at: string;
}

export interface AdminUserRow {
  user_id: string; email: string | null; name: string; user_type: string;
  status: string; school: string | null; created_at: string;
  sub_plan: string | null; sub_status: string | null; credit_balance: number;
}

export function useAdminUsers(search: string, role: string, status: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "users", search, role, status, limit, offset],
    queryFn: async (): Promise<{ total: number; rows: AdminUserRow[] }> => {
      const { data, error } = await supabase.rpc("admin_list_users", {
        p_search: search || undefined, p_role: role || undefined, p_status: status || undefined,
        p_limit: limit, p_offset: offset,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: AdminUserRow[] };
    },
  });
}

// Shape is broad (composed jsonb); the screen reads fields defensively.
export function useAdminUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Record<string, unknown>> => {
      const { data, error } = await supabase.rpc("admin_user_detail", { p_user_id: userId! });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
  });
}

export function useAuditLog(limit = 50, offset = 0, action?: string, targetType?: string) {
  return useQuery({
    queryKey: ["admin", "audit", limit, offset, action ?? "", targetType ?? ""],
    queryFn: async (): Promise<{ total: number; rows: AuditRow[] }> => {
      const { data, error } = await supabase.rpc("admin_audit_list", {
        p_limit: limit, p_offset: offset,
        p_action: action ?? undefined, p_target_type: targetType ?? undefined,
      });
      if (error) throw error;
      return data as unknown as { total: number; rows: AuditRow[] };
    },
  });
}

export type DemandRow = {
  id: string;
  concept_slug: string;
  concept_name: string;
  subject: string | null;
  request_count: number;
  last_requested_at: string;
  promoted_at: string | null;
  promoted_to_tier: string | null;
};

export function useConceptDemand(limit = 50) {
  return useQuery({
    queryKey: ["admin", "concept-demand", limit],
    queryFn: async (): Promise<DemandRow[]> => {
      const { data, error } = await supabase
        .from("concept_demand")
        .select("id, concept_slug, concept_name, subject, request_count, last_requested_at, promoted_at, promoted_to_tier")
        .is("promoted_at", null)
        .order("request_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as DemandRow[];
    },
    staleTime: 60_000,
  });
}
