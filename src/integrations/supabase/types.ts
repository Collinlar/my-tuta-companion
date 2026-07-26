export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      concepts: {
        Row: { id: string; slug: string; subject: string; name: string; description: string | null; learning_stage: string | null; difficulty: string | null; related_areas: string[] | null; created_at: string | null }
        Insert: { id?: string; slug: string; subject: string; name: string; description?: string | null; learning_stage?: string | null; difficulty?: string | null; related_areas?: string[] | null; created_at?: string | null }
        Update: { id?: string; slug?: string; subject?: string; name?: string; description?: string | null; learning_stage?: string | null; difficulty?: string | null; related_areas?: string[] | null; created_at?: string | null }
        Relationships: []
      }
      misconceptions: {
        Row: { id: string; concept_id: string | null; label: string; detail: string | null; created_at: string | null }
        Insert: { id?: string; concept_id?: string | null; label: string; detail?: string | null; created_at?: string | null }
        Update: { id?: string; concept_id?: string | null; label?: string; detail?: string | null; created_at?: string | null }
        Relationships: []
      }
      concept_stages: {
        Row: { id: string; concept_id: string; ord: number; name: string; loop_phase: string | null; description: string | null; est_time: string | null; content: Json | null }
        Insert: { id?: string; concept_id: string; ord: number; name: string; loop_phase?: string | null; description?: string | null; est_time?: string | null; content?: Json | null }
        Update: { id?: string; concept_id?: string; ord?: number; name?: string; loop_phase?: string | null; description?: string | null; est_time?: string | null; content?: Json | null }
        Relationships: []
      }
      lab_activities: {
        Row: { id: string; slug: string; category: string; subject: string | null; title: string; body: string | null; equipment: string | null; time_estimate: string | null; demonstrates: string | null; objective: string | null; materials: Json | null; safety: string | null; steps: Json | null; color: string | null; cat_fg: string | null; cat_bg: string | null; created_at: string | null; difficulty: string | null; team_mode: string | null; dimensions: Json | null }
        Insert: { id?: string; slug: string; category: string; subject?: string | null; title: string; body?: string | null; equipment?: string | null; time_estimate?: string | null; demonstrates?: string | null; objective?: string | null; materials?: Json | null; safety?: string | null; steps?: Json | null; color?: string | null; cat_fg?: string | null; cat_bg?: string | null; created_at?: string | null; difficulty?: string | null; team_mode?: string | null; dimensions?: Json | null }
        Update: { id?: string; slug?: string; category?: string; subject?: string | null; title?: string; body?: string | null; equipment?: string | null; time_estimate?: string | null; demonstrates?: string | null; objective?: string | null; materials?: Json | null; safety?: string | null; steps?: Json | null; color?: string | null; cat_fg?: string | null; cat_bg?: string | null; created_at?: string | null; difficulty?: string | null; team_mode?: string | null; dimensions?: Json | null }
        Relationships: []
      }
      challenges: {
        Row: { id: string; slug: string | null; created_by: string | null; class_id: string | null; type: string; scope: string | null; mode: string | null; timeline: string | null; accent: string | null; fg: string | null; bg: string | null; title: string; body: string | null; brief: string | null; stages: Json | null; is_featured: boolean | null; created_at: string | null }
        Insert: { id?: string; slug?: string | null; created_by?: string | null; class_id?: string | null; type: string; scope?: string | null; mode?: string | null; timeline?: string | null; accent?: string | null; fg?: string | null; bg?: string | null; title: string; body?: string | null; brief?: string | null; stages?: Json | null; is_featured?: boolean | null; created_at?: string | null }
        Update: { id?: string; slug?: string | null; created_by?: string | null; class_id?: string | null; type?: string; scope?: string | null; mode?: string | null; timeline?: string | null; accent?: string | null; fg?: string | null; bg?: string | null; title?: string; body?: string | null; brief?: string | null; stages?: Json | null; is_featured?: boolean | null; created_at?: string | null }
        Relationships: []
      }
      learner_stats: {
        Row: { id: string; user_id: string; mastered: number | null; developing: number | null; accuracy: number | null; streak: number | null; skills: Json | null; updated_at: string | null }
        Insert: { id?: string; user_id: string; mastered?: number | null; developing?: number | null; accuracy?: number | null; streak?: number | null; skills?: Json | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; mastered?: number | null; developing?: number | null; accuracy?: number | null; streak?: number | null; skills?: Json | null; updated_at?: string | null }
        Relationships: []
      }
      mastery_paths: {
        Row: { id: string; user_id: string; concept_id: string | null; concept_name: string; subject: string | null; current_stage: number | null; stage_label: string | null; pct: number | null; level: string | null; status: string | null; color: string | null; next_action: string | null; created_at: string | null; updated_at: string | null }
        Insert: { id?: string; user_id: string; concept_id?: string | null; concept_name: string; subject?: string | null; current_stage?: number | null; stage_label?: string | null; pct?: number | null; level?: string | null; status?: string | null; color?: string | null; next_action?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; concept_id?: string | null; concept_name?: string; subject?: string | null; current_stage?: number | null; stage_label?: string | null; pct?: number | null; level?: string | null; status?: string | null; color?: string | null; next_action?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
      }
      path_stage_progress: {
        Row: { id: string; path_id: string; ord: number; state: string | null }
        Insert: { id?: string; path_id: string; ord: number; state?: string | null }
        Update: { id?: string; path_id?: string; ord?: number; state?: string | null }
        Relationships: []
      }
      mastery_profiles: {
        Row: { id: string; user_id: string; concept_id: string | null; concept_name: string | null; subject: string | null; concept_knowledge: number | null; procedural_fluency: number | null; recall: number | null; reasoning: number | null; application: number | null; overall_state: string | null; updated_at: string | null }
        Insert: { id?: string; user_id: string; concept_id?: string | null; concept_name?: string | null; subject?: string | null; concept_knowledge?: number | null; procedural_fluency?: number | null; recall?: number | null; reasoning?: number | null; application?: number | null; overall_state?: string | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; concept_id?: string | null; concept_name?: string | null; subject?: string | null; concept_knowledge?: number | null; procedural_fluency?: number | null; recall?: number | null; reasoning?: number | null; application?: number | null; overall_state?: string | null; updated_at?: string | null }
        Relationships: []
      }
      student_assignments: {
        Row: { id: string; user_id: string; title: string; teacher_name: string | null; subject: string | null; due: string | null; status: string | null; status_color: string | null; icon: string | null; color: string | null; created_at: string | null }
        Insert: { id?: string; user_id: string; title: string; teacher_name?: string | null; subject?: string | null; due?: string | null; status?: string | null; status_color?: string | null; icon?: string | null; color?: string | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; title?: string; teacher_name?: string | null; subject?: string | null; due?: string | null; status?: string | null; status_color?: string | null; icon?: string | null; color?: string | null; created_at?: string | null }
        Relationships: []
      }
      attempts: {
        Row: { id: string; user_id: string; path_id: string | null; concept_id: string | null; activity_id: string | null; kind: string | null; prompt: string | null; correct: boolean | null; mistake_category: string | null; response: Json | null; created_at: string | null }
        Insert: { id?: string; user_id: string; path_id?: string | null; concept_id?: string | null; activity_id?: string | null; kind?: string | null; prompt?: string | null; correct?: boolean | null; mistake_category?: string | null; response?: Json | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; path_id?: string | null; concept_id?: string | null; activity_id?: string | null; kind?: string | null; prompt?: string | null; correct?: boolean | null; mistake_category?: string | null; response?: Json | null; created_at?: string | null }
        Relationships: []
      }
      challenge_submissions: {
        Row: { id: string; challenge_id: string; user_id: string; status: string | null; stage: number | null; work: Json | null; created_at: string | null; updated_at: string | null; feedback: string | null; feedback_level: string | null; reviewed_at: string | null }
        Insert: { id?: string; challenge_id: string; user_id: string; status?: string | null; stage?: number | null; work?: Json | null; created_at?: string | null; updated_at?: string | null; feedback?: string | null; feedback_level?: string | null; reviewed_at?: string | null }
        Update: { id?: string; challenge_id?: string; user_id?: string; status?: string | null; stage?: number | null; work?: Json | null; created_at?: string | null; updated_at?: string | null; feedback?: string | null; feedback_level?: string | null; reviewed_at?: string | null }
        Relationships: []
      }
      classes: {
        Row: { id: string; teacher_id: string; name: string; subject: string | null; year_group: string | null; code: string; color: string | null; mark: string | null; created_at: string | null; ai_assistance: boolean; allow_challenges: boolean; allow_sharing: boolean; notify_on_submission: boolean; assessment_rules: string | null }
        Insert: { id?: string; teacher_id: string; name: string; subject?: string | null; year_group?: string | null; code?: string; color?: string | null; mark?: string | null; created_at?: string | null; ai_assistance?: boolean; allow_challenges?: boolean; allow_sharing?: boolean; notify_on_submission?: boolean; assessment_rules?: string | null }
        Update: { id?: string; teacher_id?: string; name?: string; subject?: string | null; year_group?: string | null; code?: string; color?: string | null; mark?: string | null; created_at?: string | null; ai_assistance?: boolean; allow_challenges?: boolean; allow_sharing?: boolean; notify_on_submission?: boolean; assessment_rules?: string | null }
        Relationships: []
      }
      class_students: {
        Row: { id: string; class_id: string; student_id: string | null; display_name: string; mark: string | null; color: string | null; current_concept: string | null; stage: string | null; mastery_level: string | null; created_at: string | null }
        Insert: { id?: string; class_id: string; student_id?: string | null; display_name: string; mark?: string | null; color?: string | null; current_concept?: string | null; stage?: string | null; mastery_level?: string | null; created_at?: string | null }
        Update: { id?: string; class_id?: string; student_id?: string | null; display_name?: string; mark?: string | null; color?: string | null; current_concept?: string | null; stage?: string | null; mastery_level?: string | null; created_at?: string | null }
        Relationships: []
      }
      learning_experiences: {
        Row: { id: string; teacher_id: string; title: string; subject: string | null; form: string | null; concept_id: string | null; status: string | null; cover: string | null; tags: string[] | null; stages_count: number | null; created_at: string | null; updated_at: string | null }
        Insert: { id?: string; teacher_id: string; title: string; subject?: string | null; form?: string | null; concept_id?: string | null; status?: string | null; cover?: string | null; tags?: string[] | null; stages_count?: number | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; teacher_id?: string; title?: string; subject?: string | null; form?: string | null; concept_id?: string | null; status?: string | null; cover?: string | null; tags?: string[] | null; stages_count?: number | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
      }
      experience_sections: {
        Row: { id: string; experience_id: string; ord: number; name: string; body: string | null; ai_blocks: Json | null }
        Insert: { id?: string; experience_id: string; ord: number; name: string; body?: string | null; ai_blocks?: Json | null }
        Update: { id?: string; experience_id?: string; ord?: number; name?: string; body?: string | null; ai_blocks?: Json | null }
        Relationships: []
      }
      experience_progress: {
        Row: { id: string; user_id: string; experience_id: string; status: string; completed_at: string | null; created_at: string | null; updated_at: string | null }
        Insert: { id?: string; user_id: string; experience_id: string; status?: string; completed_at?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; experience_id?: string; status?: string; completed_at?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
      }
      assessments: {
        Row: { id: string; teacher_id: string; class_id: string | null; type: string; title: string | null; class_label: string | null; item_mix: Json | null; status: string | null; submitted: number | null; total: number | null; distribution: Json | null; avg_level: string | null; created_at: string | null }
        Insert: { id?: string; teacher_id: string; class_id?: string | null; type: string; title?: string | null; class_label?: string | null; item_mix?: Json | null; status?: string | null; submitted?: number | null; total?: number | null; distribution?: Json | null; avg_level?: string | null; created_at?: string | null }
        Update: { id?: string; teacher_id?: string; class_id?: string | null; type?: string; title?: string | null; class_label?: string | null; item_mix?: Json | null; status?: string | null; submitted?: number | null; total?: number | null; distribution?: Json | null; avg_level?: string | null; created_at?: string | null }
        Relationships: []
      }
      assignments: {
        Row: { id: string; teacher_id: string; class_id: string | null; experience_id: string | null; assessment_id: string | null; title: string | null; teacher_name: string | null; required_stages: string[] | null; deadline: string | null; mastery_threshold: string | null; created_at: string | null }
        Insert: { id?: string; teacher_id: string; class_id?: string | null; experience_id?: string | null; assessment_id?: string | null; title?: string | null; teacher_name?: string | null; required_stages?: string[] | null; deadline?: string | null; mastery_threshold?: string | null; created_at?: string | null }
        Update: { id?: string; teacher_id?: string; class_id?: string | null; experience_id?: string | null; assessment_id?: string | null; title?: string | null; teacher_name?: string | null; required_stages?: string[] | null; deadline?: string | null; mastery_threshold?: string | null; created_at?: string | null }
        Relationships: []
      }
      assessment_questions: {
        Row: { id: string; assessment_id: string; ord: number; prompt: string; options: Json; correct_index: number; dimension: string | null }
        Insert: { id?: string; assessment_id: string; ord: number; prompt: string; options?: Json; correct_index?: number; dimension?: string | null }
        Update: { id?: string; assessment_id?: string; ord?: number; prompt?: string; options?: Json; correct_index?: number; dimension?: string | null }
        Relationships: []
      }
      assessment_submissions: {
        Row: { id: string; assessment_id: string; student_id: string; answers: Json; score: number; mastery_level: string; submitted_at: string | null }
        Insert: { id?: string; assessment_id: string; student_id: string; answers?: Json; score?: number; mastery_level?: string; submitted_at?: string | null }
        Update: { id?: string; assessment_id?: string; student_id?: string; answers?: Json; score?: number; mastery_level?: string; submitted_at?: string | null }
        Relationships: []
      }
      teacher_insights: {
        Row: { id: string; teacher_id: string; concept: string; pct_label: string | null; detail: string | null; created_at: string | null }
        Insert: { id?: string; teacher_id: string; concept: string; pct_label?: string | null; detail?: string | null; created_at?: string | null }
        Update: { id?: string; teacher_id?: string; concept?: string; pct_label?: string | null; detail?: string | null; created_at?: string | null }
        Relationships: []
      }
      teacher_stats: {
        Row: { id: string; teacher_id: string; active_classes: number | null; students: number | null; reaching_secure: number | null; concepts_taught: number | null; class_skills: Json | null; updated_at: string | null }
        Insert: { id?: string; teacher_id: string; active_classes?: number | null; students?: number | null; reaching_secure?: number | null; concepts_taught?: number | null; class_skills?: Json | null; updated_at?: string | null }
        Update: { id?: string; teacher_id?: string; active_classes?: number | null; students?: number | null; reaching_secure?: number | null; concepts_taught?: number | null; class_skills?: Json | null; updated_at?: string | null }
        Relationships: []
      }
      notifications: {
        Row: { id: string; user_id: string; kind: string | null; title: string; body: string | null; read: boolean | null; created_at: string | null }
        Insert: { id?: string; user_id: string; kind?: string | null; title: string; body?: string | null; read?: boolean | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; kind?: string | null; title?: string; body?: string | null; read?: boolean | null; created_at?: string | null }
        Relationships: []
      }
      recall_cards: {
        Row: { id: string; user_id: string; concept_id: string | null; concept_name: string; front: string; back: string; state: string; interval_days: number; due_at: string; last_rating: string | null; created_at: string | null; updated_at: string | null }
        Insert: { id?: string; user_id: string; concept_id?: string | null; concept_name: string; front: string; back: string; state?: string; interval_days?: number; due_at?: string; last_rating?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; concept_id?: string | null; concept_name?: string; front?: string; back?: string; state?: string; interval_days?: number; due_at?: string; last_rating?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
      }
      credit_lots: {
        Row: { id: string; user_id: string; kind: string; amount_remaining: number; amount_original: number; expires_at: string | null; created_at: string | null }
        Insert: { id?: string; user_id: string; kind: string; amount_remaining?: number; amount_original?: number; expires_at?: string | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; kind?: string; amount_remaining?: number; amount_original?: number; expires_at?: string | null; created_at?: string | null }
        Relationships: []
      }
      credit_transactions: {
        Row: { id: string; user_id: string; kind: string; amount: number; action_key: string | null; description: string | null; balance_after: number; ref: string | null; created_at: string | null }
        Insert: { id?: string; user_id: string; kind: string; amount: number; action_key?: string | null; description?: string | null; balance_after?: number; ref?: string | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; kind?: string; amount?: number; action_key?: string | null; description?: string | null; balance_after?: number; ref?: string | null; created_at?: string | null }
        Relationships: []
      }
      credit_action_costs: {
        Row: { action_key: string; label: string; category: string; cost: number; active: boolean }
        Insert: { action_key: string; label: string; category?: string; cost: number; active?: boolean }
        Update: { action_key?: string; label?: string; category?: string; cost?: number; active?: boolean }
        Relationships: []
      }
      credit_bundles: {
        Row: { id: string; name: string; price_ghs: number; credits: number; bonus: number; target_role: string; positioning: string | null; featured: boolean; active: boolean; country: string | null; sort: number; updated_at: string }
        Insert: { id: string; name: string; price_ghs: number; credits: number; bonus?: number; target_role?: string; positioning?: string | null; featured?: boolean; active?: boolean; country?: string | null; sort?: number; updated_at?: string }
        Update: { id?: string; name?: string; price_ghs?: number; credits?: number; bonus?: number; target_role?: string; positioning?: string | null; featured?: boolean; active?: boolean; country?: string | null; sort?: number; updated_at?: string }
        Relationships: []
      }
      plans: {
        Row: { id: string; name: string; role: string; price_ghs: number; currency: string; period: string; included_credits: number; rollover_cap: number; founding_price: number | null; active: boolean; updated_at: string }
        Insert: { id: string; name: string; role: string; price_ghs: number; currency?: string; period?: string; included_credits?: number; rollover_cap?: number; founding_price?: number | null; active?: boolean; updated_at?: string }
        Update: { id?: string; name?: string; role?: string; price_ghs?: number; currency?: string; period?: string; included_credits?: number; rollover_cap?: number; founding_price?: number | null; active?: boolean; updated_at?: string }
        Relationships: []
      }
      subscriptions: {
        Row: { user_id: string; plan: string; status: string; monthly_credits: number; rollover_cap: number; current_period_end: string | null; provider: string | null; provider_ref: string | null; founding: boolean; created_at: string | null; updated_at: string | null }
        Insert: { user_id: string; plan: string; status?: string; monthly_credits?: number; rollover_cap?: number; current_period_end?: string | null; provider?: string | null; provider_ref?: string | null; founding?: boolean; created_at?: string | null; updated_at?: string | null }
        Update: { user_id?: string; plan?: string; status?: string; monthly_credits?: number; rollover_cap?: number; current_period_end?: string | null; provider?: string | null; provider_ref?: string | null; founding?: boolean; created_at?: string | null; updated_at?: string | null }
        Relationships: []
      }
      payments: {
        Row: { id: string; user_id: string; provider: string; provider_ref: string; kind: string; amount_ghs: number | null; credits: number | null; status: string; created_at: string | null }
        Insert: { id?: string; user_id: string; provider?: string; provider_ref: string; kind: string; amount_ghs?: number | null; credits?: number | null; status?: string; created_at?: string | null }
        Update: { id?: string; user_id?: string; provider?: string; provider_ref?: string; kind?: string; amount_ghs?: number | null; credits?: number | null; status?: string; created_at?: string | null }
        Relationships: []
      }
      admin_users: {
        Row: { user_id: string; role: string; permissions: Json; active: boolean; note: string | null; created_by: string | null; created_at: string }
        Insert: { user_id: string; role?: string; permissions?: Json; active?: boolean; note?: string | null; created_by?: string | null; created_at?: string }
        Update: { user_id?: string; role?: string; permissions?: Json; active?: boolean; note?: string | null; created_by?: string | null; created_at?: string }
        Relationships: []
      }
      admin_audit_log: {
        Row: { id: string; actor_id: string | null; action: string; target_type: string | null; target_id: string | null; reason: string | null; before: Json | null; after: Json | null; created_at: string }
        Insert: { id?: string; actor_id?: string | null; action: string; target_type?: string | null; target_id?: string | null; reason?: string | null; before?: Json | null; after?: Json | null; created_at?: string }
        Update: { id?: string; actor_id?: string | null; action?: string; target_type?: string | null; target_id?: string | null; reason?: string | null; before?: Json | null; after?: Json | null; created_at?: string }
        Relationships: []
      }
      platform_config: {
        Row: { key: string; value: Json; label: string; category: string; updated_at: string }
        Insert: { key: string; value: Json; label: string; category?: string; updated_at?: string }
        Update: { key?: string; value?: Json; label?: string; category?: string; updated_at?: string }
        Relationships: []
      }
      feature_flags: {
        Row: { key: string; label: string; enabled: boolean; target: Json; updated_at: string }
        Insert: { key: string; label: string; enabled?: boolean; target?: Json; updated_at?: string }
        Update: { key?: string; label?: string; enabled?: boolean; target?: Json; updated_at?: string }
        Relationships: []
      }
      learning_events: {
        Row: { id: string; user_id: string; kind: string; concept_id: string | null; path_id: string | null; meta: Json; created_at: string }
        Insert: { id?: string; user_id: string; kind: string; concept_id?: string | null; path_id?: string | null; meta?: Json; created_at?: string }
        Update: { id?: string; user_id?: string; kind?: string; concept_id?: string | null; path_id?: string | null; meta?: Json; created_at?: string }
        Relationships: []
      }
      student_goals: {
        Row: { id: string; user_id: string; title: string; kind: string; concept_id: string | null; target: string | null; status: string; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; kind?: string; concept_id?: string | null; target?: string | null; status?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; title?: string; kind?: string; concept_id?: string | null; target?: string | null; status?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      learner_profile: {
        Row: { user_id: string; support_level: string; prefs: Json; corrections: Json; summary: string | null; updated_at: string }
        Insert: { user_id: string; support_level?: string; prefs?: Json; corrections?: Json; summary?: string | null; updated_at?: string }
        Update: { user_id?: string; support_level?: string; prefs?: Json; corrections?: Json; summary?: string | null; updated_at?: string }
        Relationships: []
      }
      contest_participants: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          contest_id: string
          id: string
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          contest_id: string
          id?: string
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          contest_id?: string
          id?: string
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_participants_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          difficulty: string | null
          duration_minutes: number
          end_time: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          start_time: string | null
          subject: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty?: string | null
          duration_minutes: number
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          start_time?: string | null
          subject?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          start_time?: string | null
          subject?: string | null
          title?: string
        }
        Relationships: []
      }
      flashcard_sets: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          created_at: string | null
          difficulty: string | null
          front_text: string
          id: string
          image_url: string | null
          set_id: string
        }
        Insert: {
          back_text: string
          created_at?: string | null
          difficulty?: string | null
          front_text: string
          id?: string
          image_url?: string | null
          set_id: string
        }
        Update: {
          back_text?: string
          created_at?: string | null
          difficulty?: string | null
          front_text?: string
          id?: string
          image_url?: string | null
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          subject: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          subject?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          subject?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string | null
          file_type: string | null
          file_url: string | null
          id: string
          processed: boolean | null
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          processed?: boolean | null
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          processed?: boolean | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          onboarding_answers: Json | null
          updated_at: string | null
          user_id: string
          user_type: string
          school: string | null
          grade: string | null
          subjects: string[] | null
          goals: string[] | null
          parent_contact: string | null
          teaching_experience: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          onboarding_answers?: Json | null
          updated_at?: string | null
          user_id: string
          user_type?: string
          school?: string | null
          grade?: string | null
          subjects?: string[] | null
          goals?: string[] | null
          parent_contact?: string | null
          teaching_experience?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          onboarding_answers?: Json | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
          school?: string | null
          grade?: string | null
          subjects?: string[] | null
          goals?: string[] | null
          parent_contact?: string | null
          teaching_experience?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          subject: string | null
          time_limit: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          content: string | null
          content_url: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_time_minutes: number | null
          id: string
          is_public: boolean | null
          subject: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          duration_minutes: number | null
          goal_id: string | null
          id: string
          notes: string | null
          resource_id: string | null
          score: number | null
          session_type: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          score?: number | null
          session_type: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          score?: number | null
          session_type?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "learning_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          flashcards_reviewed: number | null
          id: string
          last_activity_date: string | null
          notes_created: number | null
          quizzes_completed: number | null
          streak_days: number | null
          subject: string
          total_study_time_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flashcards_reviewed?: number | null
          id?: string
          last_activity_date?: string | null
          notes_created?: number | null
          quizzes_completed?: number | null
          streak_days?: number | null
          subject: string
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flashcards_reviewed?: number | null
          id?: string
          last_activity_date?: string | null
          notes_created?: number | null
          quizzes_completed?: number | null
          streak_days?: number | null
          subject?: string
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      provision_starter_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      switch_user_role: {
        Args: { new_role: string }
        Returns: undefined
      }
      ensure_concept_stages: {
        Args: { p_concept_id: string; p_stages: Json }
        Returns: undefined
      }
      generate_class_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      join_class: {
        Args: { p_code: string }
        Returns: { class_id: string; class_name: string }[]
      }
      teacher_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      assign_assessment: {
        Args: { p_assessment_id: string; p_class_id: string }
        Returns: undefined
      }
      get_assessment_for_taking: {
        Args: { p_assessment_id: string }
        Returns: Json
      }
      submit_assessment: {
        Args: { p_assessment_id: string; p_answers: Json }
        Returns: Json
      }
      autosave_assessment_answers: {
        Args: { p_assessment_id: string; p_answers: Json }
        Returns: undefined
      }
      get_challenge_submissions: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      review_challenge_submission: {
        Args: { p_submission_id: string; p_feedback: string; p_level: string }
        Returns: undefined
      }
      wallet_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      platform_overview: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_audit_list: {
        Args: { p_limit?: number; p_offset?: number; p_action?: string; p_target_type?: string }
        Returns: Json
      }
      admin_list_users: {
        Args: { p_search?: string; p_role?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_user_detail: {
        Args: { p_user_id: string }
        Returns: Json
      }
      admin_set_user_status: {
        Args: { p_user_id: string; p_status: string; p_reason: string }
        Returns: undefined
      }
      admin_change_user_role: {
        Args: { p_user_id: string; p_role: string; p_reason: string }
        Returns: undefined
      }
      admin_add_user_note: {
        Args: { p_user_id: string; p_note: string }
        Returns: undefined
      }
      admin_adjust_credits: {
        Args: { p_user_id: string; p_amount: number; p_reason: string }
        Returns: Json
      }
      admin_extend_credit_expiry: {
        Args: { p_user_id: string; p_days: number; p_reason: string }
        Returns: undefined
      }
      admin_cancel_subscription: {
        Args: { p_user_id: string; p_reason: string }
        Returns: undefined
      }
      admin_refund_credits: {
        Args: { p_txn_id: string; p_reason: string }
        Returns: undefined
      }
      admin_export_user_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      admin_set_action_cost: {
        Args: { p_action_key: string; p_cost: number; p_active: boolean; p_reason: string }
        Returns: undefined
      }
      admin_upsert_bundle: {
        Args: { p_id: string; p_name: string; p_price_ghs: number; p_credits: number; p_bonus: number; p_target_role: string; p_positioning: string; p_featured: boolean; p_active: boolean; p_sort: number; p_reason: string }
        Returns: undefined
      }
      admin_credit_liability: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_upsert_plan: {
        Args: { p_id: string; p_name: string; p_role: string; p_price_ghs: number; p_included_credits: number; p_rollover_cap: number; p_founding_price: number | null; p_active: boolean; p_reason: string }
        Returns: undefined
      }
      admin_list_subscriptions: {
        Args: { p_plan?: string; p_status?: string; p_founding?: boolean; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_subscription_action: {
        Args: { p_user_id: string; p_action: string; p_value: number; p_reason: string }
        Returns: undefined
      }
      admin_list_payments: {
        Args: { p_search?: string; p_status?: string; p_kind?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_payment_detail: {
        Args: { p_payment_id: string }
        Returns: Json
      }
      admin_record_refund: {
        Args: { p_payment_ref: string; p_amount: number; p_reason: string; p_status?: string }
        Returns: string
      }
      admin_reconciliation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_list_concepts: {
        Args: { p_search?: string; p_subject?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_concept_detail: {
        Args: { p_concept_id: string }
        Returns: Json
      }
      admin_upsert_concept: {
        Args: { p_id: string | null; p_slug: string; p_subject: string; p_name: string; p_description: string; p_learning_stage: string; p_difficulty: string; p_related_areas: string[]; p_reason: string }
        Returns: string
      }
      admin_set_concept_status: {
        Args: { p_concept_id: string; p_status: string; p_reviewer: string; p_reason: string }
        Returns: undefined
      }
      admin_upsert_misconception: {
        Args: { p_id: string | null; p_concept_id: string; p_label: string; p_detail: string; p_reason: string }
        Returns: string
      }
      admin_upsert_concept_stage: {
        Args: { p_id: string | null; p_concept_id: string; p_ord: number; p_name: string; p_loop_phase: string; p_description: string; p_est_time: string; p_content: Json; p_reason: string }
        Returns: string
      }
      admin_list_questions: {
        Args: { p_search?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_list_paths: {
        Args: { p_search?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_list_experiences: {
        Args: { p_search?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_list_assessments: {
        Args: { p_search?: string; p_type?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_assessment_detail: {
        Args: { p_assessment_id: string }
        Returns: Json
      }
      admin_set_assessment_status: {
        Args: { p_assessment_id: string; p_status: string; p_reason: string }
        Returns: undefined
      }
      admin_list_ai_jobs: {
        Args: { p_task?: string; p_status?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_ai_usage: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_refund_ai_job: {
        Args: { p_job_id: string; p_reason: string }
        Returns: undefined
      }
      admin_list_tickets: {
        Args: { p_status?: string; p_category?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_ticket_detail: {
        Args: { p_ticket_id: string }
        Returns: Json
      }
      admin_create_ticket: {
        Args: { p_user_id: string; p_category: string; p_subject: string; p_priority: string }
        Returns: string
      }
      admin_ticket_action: {
        Args: { p_ticket_id: string; p_action: string; p_body?: string; p_value?: number; p_assignee?: string; p_reason?: string }
        Returns: undefined
      }
      admin_set_config: {
        Args: { p_key: string; p_value: Json; p_reason: string }
        Returns: undefined
      }
      admin_set_flag: {
        Args: { p_key: string; p_enabled: boolean; p_target: Json; p_reason: string }
        Returns: undefined
      }
      record_learning_event: {
        Args: { p_kind: string; p_concept_id?: string | null; p_path_id?: string | null; p_meta?: Json }
        Returns: undefined
      }
      next_best_action: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      learner_model: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      learning_insights: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      solve_history: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      grant_welcome_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      spend_credits: {
        Args: { p_action_key: string }
        Returns: Json
      }
      refund_credits: {
        Args: { p_txn_id: string }
        Returns: undefined
      }
      notify_class: {
        Args: { p_class_id: string; p_kind: string; p_title: string; p_body: string }
        Returns: undefined
      }
      notify_teacher: {
        Args: { p_class_id: string; p_kind: string; p_title: string; p_body: string }
        Returns: undefined
      }
      notify_challenge_submission: {
        Args: { p_challenge_id: string }
        Returns: undefined
      }
      assign_experience: {
        Args: { p_experience_id: string; p_class_id: string }
        Returns: undefined
      }
      delete_my_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
