# Applying the mytuta STEM migrations

Apply these in order (they are already timestamp-named so `supabase db push`
runs them in sequence):

1. `20260720090000_mytuta_stem_core.sql` — all new tables, indexes, RLS policies,
   `generate_class_code()`, and `updated_at` triggers.
2. `20260720090100_mytuta_seed_content.sql` — global reference content (concepts,
   concept stages with rich content, 6 lab activities, 7 challenges,
   misconceptions). Idempotent via stable slugs + `ON CONFLICT DO NOTHING`.
3. `20260720090200_mytuta_provision.sql` — original per-user seeder (superseded
   by step 4; kept for history).
4. `20260720100000_mytuta_real_user_data.sql` — clears demo ownership rows, makes
   `provision_starter_data()` a no-op (real data only), adds `switch_user_role()`.
5. `20260720110000_mytuta_ensure_concept_stages.sql` — `ensure_concept_stages()`
   persists an AI-built mastery path for a concept that has none yet.
6. `20260720120000_mytuta_class_link.sql` — connects students to teachers:
   `join_class(code)` RPC, `is_class_member` / `is_experience_assigned_to_me`
   SECURITY DEFINER helpers, student-read policies on `classes` and
   `learning_experiences`, and a denormalized `assignments.teacher_name`.
7. `20260720130000_mytuta_teacher_dashboard.sql` — `teacher_dashboard()` RPC:
   live teacher analytics (stats, skill breakdown, misconception flags)
   aggregated from the real mastery_profiles of the teacher's joined students.
8. `20260720140000_mytuta_assessment_loop.sql` — the full assessment loop:
   `assessment_questions` + `assessment_submissions` tables and RLS;
   `assign_assessment(assessment_id, class_id)` (publish a draft to a class),
   `get_assessment_for_taking(assessment_id)` (student view, no answers
   exposed), `submit_assessment(assessment_id, answers)` (server-side scoring,
   mastery banding, distribution rollup, and an `attempts` log entry per item).
9. `20260720150000_mytuta_teacher_challenges.sql` — teacher-created, class-scoped
   challenges: `challenges.class_id`, updated read/insert RLS (a class challenge
   is visible to its teacher and to that class's members only; the platform
   catalog stays open to everyone), and a teacher-read policy on
   `challenge_submissions` so teachers can see who has submitted.
10. `20260720160000_mytuta_notifications.sql` — real notifications:
    `notify_class` / `notify_teacher` SECURITY DEFINER broadcast helpers,
    `notify_challenge_submission`, a new `assign_experience` RPC (mirrors
    `assign_assessment`), and patches to `assign_assessment` / `submit_assessment`
    / `join_class` so assigning work, submitting an assessment, and joining a
    class all generate real `notifications` rows for the right person.
11. `20260720170000_mytuta_recall_cards.sql` — a `recall_cards` table (own-row
    RLS) that persists each learner's spaced-repetition state per card, keyed
    by `(user_id, concept_name, front)`. No new RPCs; scheduling math lives
    client-side in `src/mytuta/data/mutations.ts`.
12. `20260720180000_mytuta_account_settings.sql` — `delete_my_account()`
    SECURITY DEFINER RPC: deletes the caller's `auth.users` row. No other
    schema change; `profiles.school/grade/subjects/goals/parent_contact/
    teaching_experience` already existed from the pre-mytuta migration
    `20250115000000_add_profile_fields.sql` — `types.ts` just hadn't reflected
    them until now.
13. `20260720190000_mytuta_avatar_storage.sql` — a public `avatars` Storage
    bucket plus RLS on `storage.objects` scoped to each user's own folder
    (`avatars/{user_id}/...`), so users can upload a profile photo. Public
    read so avatars display to other users (teachers, classmates).
    `profiles.avatar_url` already existed; nothing wrote to it until now.
14. `20260720200000_mytuta_upload_storage.sql` — a private `uploads` Storage
    bucket (unlike avatars, no public read: only the owner can access their
    own files) for Learn's "Upload notes" / "Photograph material" intake
    attachments.
15. `20260720210000_mytuta_challenge_edit.sql` — an own-row UPDATE policy on
    `challenges` (`created_by = auth.uid()`), which previously had SELECT and
    INSERT but nothing letting a teacher edit a challenge after creating it.
16. `20260720220000_mytuta_onboarding_answers.sql` — adds
    `profiles.onboarding_answers jsonb` so every onboarding step's picks are
    captured (not just subjects/goals, which already had typed columns).
17. `20260720230000_mytuta_experience_progress.sql` — a `"students read
    assigned sections"` policy on `experience_sections` (closes an RLS gap for
    unpublished assigned experiences) + an `experience_progress` table for real
    assignment status.
18. `20260720240000_mytuta_insights_detail.sql` — extends `teacher_dashboard()`
    with `class_progress` (per-student status) and `question_analysis`
    (per-question % correct + top wrong option). Additive; no new tables.
19. `20260720250000_mytuta_assessment_autosave.sql` — `autosave_assessment_
    answers` RPC (draft rows for Controlled Assessment Mode) + patched
    `get_assessment_for_taking` so drafts don't leak as fake prior results.
20. `20260720260000_mytuta_class_settings.sql` — five typed setting columns on
    `classes` (AI/challenges/sharing/notify/assessment_rules).
21. `20260720270000_mytuta_lab_dimensions.sql` — `difficulty` / `team_mode` /
    `dimensions` on `lab_activities` for the Lab facet filters + dimension chips.
22. `20260720280000_mytuta_challenge_feedback.sql` — `feedback` /
    `feedback_level` / `reviewed_at` on `challenge_submissions` +
    `get_challenge_submissions` / `review_challenge_submission` RPCs.
23. `20260720290000_mytuta_scheduled_reminders.sql` — `notify_due_deadlines()`
    / `notify_due_recall()` + daily pg_cron schedules (needs pg_cron enabled in
    the Supabase dashboard; scheduling is guarded so the file applies either way).
24. `20260720300000_mytuta_credits_core.sql` — Tuta Credits: `credit_lots`,
    `credit_transactions`, `credit_action_costs` (seeded), `subscriptions`,
    `payments`; `wallet_summary` / `grant_welcome_credits` / `spend_credits` /
    `refund_credits` / `credit_purchase` / `expire_credit_lots` RPCs.
25. `20260720310000_mytuta_credit_reminders.sql` — `notify_expiring_credits()`
    daily pg_cron nudge for credits within 3 days of expiry.
26. `20260720320000_mytuta_subscription_renewal.sql` — `apply_subscription_charge`
    / `cancel_subscription_state` (webhook, service-role) + `flag_past_due_
    subscriptions()` daily safety net.
27. `20260720330000_mytuta_admin_core.sql` — Master Admin Panel foundation:
    `admin_users`, immutable `admin_audit_log`; `current_user_is_admin` /
    `current_admin_role` / `admin_has_role` / `admin_log` helpers;
    `platform_overview()` + `admin_audit_list()` RPCs. Seeds the first Super
    Admin by email (`kofcollkcl100@gmail.com` — change if needed).
28. `20260720340000_mytuta_admin_users.sql` — Admin Users module: adds
    `profiles.status`; admin-gated `admin_list_users` / `admin_user_detail`
    (read) and `admin_set_user_status` / `admin_change_user_role` /
    `admin_add_user_note` / `admin_adjust_credits` / `admin_extend_credit_expiry`
    / `admin_cancel_subscription` / `admin_refund_credits` / `admin_export_user_data`
    (write, each audit-logged). Suspend sets a flag + audits; session-blocking is
    a documented follow-on.
29. `20260720350000_mytuta_admin_credits.sql` — Admin Credits module:
    `credit_bundles` table (DB-configurable, seeded from the hardcoded four);
    `admin_set_action_cost` / `admin_upsert_bundle` / `admin_credit_liability`
    RPCs. `bundles.ts` now reads the table with the hardcoded list as fallback;
    the server price map in `api/paystack-verify.ts` is unchanged (anti-tamper).
30. `20260720360000_mytuta_admin_plans.sql` — Admin Plans & Subscriptions:
    `plans` config table; `admin_upsert_plan`, `admin_list_subscriptions`,
    `admin_subscription_action` (cancel/reactivate/extend/set_founding/comp_credits)
    RPCs. Editing plans does not yet re-wire live billing (documented follow-on).
31. `20260720370000_mytuta_admin_payments.sql` — Admin Payments: `refunds`
    table; `admin_list_payments` / `admin_payment_detail` / `admin_record_refund`
    / `admin_reconciliation` RPCs. Money refunds go through the new admin-gated
    `api/paystack-refund.ts` serverless endpoint (verifies admin via the caller's
    JWT, calls Paystack, records via `admin_record_refund`).
32. `20260720380000_mytuta_admin_content.sql` — Admin Concepts & Content: adds
    `concepts.status/reviewer/last_reviewed_at`; admin write RPCs for concepts /
    misconceptions / stages (tables had no write policy before); read RPCs
    `admin_list_concepts` / `admin_concept_detail` / `admin_list_questions` /
    `admin_list_paths` / `admin_list_experiences`.
33. `20260720390000_mytuta_admin_assessments.sql` — Admin Assessments:
    `admin_list_assessments` / `admin_assessment_detail` (read) +
    `admin_set_assessment_status` (write, audited).
34. `20260720400000_mytuta_admin_ai_ops.sql` — Admin AI Operations: `ai_jobs`
    table + `admin_list_ai_jobs` / `admin_ai_usage` / `admin_refund_ai_job`.
    Logging into `ai_jobs` from `api/groq.ts` is deferred instrumentation — the
    table + admin UI ship now, empty until that lands.
35. `20260720410000_mytuta_admin_support.sql` — Admin Support: `support_tickets`
    + `ticket_messages`; `admin_list_tickets` / `admin_ticket_detail` /
    `admin_create_ticket` / `admin_ticket_action` (reply/note/assign/resolve/
    reopen/add_credits). User-facing ticket creation is a deferred follow-on.
36. `20260720420000_mytuta_admin_settings.sql` — Admin Platform Settings:
    `platform_config` (seeded) + `feature_flags` (seeded); `admin_set_config` /
    `admin_set_flag`. Editing is live; wiring config keys into runtime credit/
    limit logic is a deferred follow-on.
37. `20260720430000_mytuta_intelligence_core.sql` — Intelligence Layer Phase 1:
    `learning_events` / `student_goals` / `learner_profile` (own-row RLS) +
    attempts indexes; rules-first RPCs `record_learning_event` /
    `next_best_action` / `learner_model` / `learning_insights` / `solve_history`
    (templated text, no AI). See "Intelligence Layer" below.

> Already applied 1–16? Migrations 17–37 (`20260720230000` … `20260720430000`)
> are new. `20260720290000` / `20260720300000` / `20260720310000` /
> `20260720320000` additionally schedule pg_cron jobs (guarded; re-run once
> pg_cron is enabled to register them).

## How to apply

With the Supabase CLI (linked to project `jjynszwhwmbkwuoezorb`):

```bash
supabase db push
```

Or paste each file, in order, into the SQL editor in the Supabase dashboard.

## After applying — regenerate the typed client (recommended)

`src/integrations/supabase/types.ts` was hand-updated to match these migrations
so the app compiles today. Once the migrations are live, regenerate it to stay in
sync automatically:

```bash
supabase gen types typescript --project-id jjynszwhwmbkwuoezorb > src/integrations/supabase/types.ts
```

## What the app does at runtime

- `src/pages/Onboarding.tsx` calls `supabase.rpc('provision_starter_data')` when a
  user finishes onboarding, so their Home / Progress / Classes screens are
  populated with real, owned rows immediately.
- All screens read through `src/mytuta/data/queries.ts` (react-query) and write
  through `src/mytuta/data/mutations.ts`. RLS scopes every per-user query to the
  signed-in user automatically.
- Content that is genuinely product scaffolding (scripted Solve demo, Create
  wizard steps, Studio section templates, assessment-type item mixes) stays in
  `src/mytuta/data/constants.ts` — it is UI config, not per-user data.

## AI content generation (local + Vercel)

Create and Studio call Groq through `POST /api/groq` (key never ships to the browser).

1. Copy `.env.example` to `.env` and set `GROQ_API_KEY=...`
2. Restart `npm run dev` (Vite loads the key into the local `/api/groq` proxy)
3. On Vercel, set the same `GROQ_API_KEY` project env var (no `VITE_` prefix)

`provision_starter_data` is now a no-op. Per-user rows are created only by real
actions (start a path, create a class, generate an experience). **Correction:**
`switch_user_role()` exists in the database but is unused by design, not wired
— role is fixed at signup and there is no in-app student↔teacher switch
(`AppShell.tsx` has an explicit comment saying so). An earlier version of this
note implied the RPC was in active use; it isn't called from anywhere in `src/`.

## The assessment loop

Teacher: Assessments → New assessment → pick a type, a class, an optional focus
topic → "Generate draft" (AI writes ~8 MCQs proportioned across the item mix,
stored in `assessment_questions`) → review items in the "created" view (correct
answers highlighted) → "Assign to <class>" (`assign_assessment` flips the
assessment to `assigned`, sets `class_id`, and writes a row into `assignments`
so it appears in students' assignment feed).

The "created" draft-review step is now editable, not read-only: each
question's wording and options are inline text fields, a dot next to each
option marks the correct answer, and a ✕ removes a question you don't want.
Edits are tracked locally and saved in a batch via "Save changes (n)"
(`useUpdateAssessmentQuestion`); "Assign to class" is disabled while there
are unsaved edits so a stale version can't go out by accident. Both
mutations are plain `assessment_questions` UPDATE/DELETE calls, already
permitted by the existing "teacher manage questions" RLS policy (`FOR ALL`,
scoped to the assessment's `teacher_id`) — no new migration.

Student: Assignments screen shows the assignment with a "Take now" action →
`/student/assessments/:id` (`AssessmentTake.tsx`) fetches questions via
`get_assessment_for_taking` (RLS-safe, no correct answers sent to the client) →
one question at a time → "Submit assessment" calls `submit_assessment`, which
scores server-side, bands the result (Beginning/Developing/Secure/Mastered),
logs one `attempts` row per question, and updates the assessment's
`submitted`/`total`/`distribution`/`avg_level` so the teacher's Assessments
list and result view are live.

## Teacher-created class challenges

From a class's detail page (Classes → a class), "＋ Class challenge" opens
`ChallengeCreate.tsx` (`/teacher/classes/:classId/challenge/new`): pick a type
(Knowledge sprint / Design / Data / Build / Problem solving), an optional focus
topic, and "Create challenge" — `generateClassChallenge` (ai.ts) writes a title,
brief, and 4 stages, inserted into `challenges` with `class_id` set and
`scope: 'Class'`. RLS makes it visible only to that class's teacher and members
(`is_class_member`), so it shows up in the student Challenges screen exactly
like a catalog entry, scoped to "Class" in the level filter. The class detail
page lists each challenge with a live submission count.

## Notifications

Real notifications now fire from five places, each a `notifications` row for
the right person: a teacher assigns an experience (`assign_experience` RPC,
notifies the class) or an assessment (`assign_assessment`, notifies the class);
a student submits an assessment (`submit_assessment`, notifies the teacher) or
a challenge (`notify_challenge_submission`, notifies the challenge's creator,
skipped for platform-catalog challenges with no owner); a student joins a
class (`join_class`, notifies the teacher). Teacher class-challenge creation
also notifies the class (client-side best-effort call to `notify_class`).

The header bell in `AppShell.tsx` shows a live unread count
(`useUnreadNotificationCount`, polled every 60s) and the `/notifications`
screen (now inside the app shell, not a standalone placeholder) marks visible
notifications as read shortly after they render.

## Recall scheduling (spaced repetition)

The Recall stage in `Learn.tsx` already showed flip-and-rate cards (front from
`concept_stages.content.cards`, which is stable per concept since it's global
reference content, not per-user). What was missing was persistence: rating a
card did nothing beyond a local counter. Now, on entering a Recall stage,
`useEnsureRecallCards` upserts a `recall_cards` row per card the learner hasn't
seen before (existing rows are left untouched, so their schedule survives).
Each rating calls `useRateRecallCard`, which runs a simple Leitner-style
scheduler (`nextRecallSchedule` in `mutations.ts`): "Again"/"Hard" bring the
card back within a day, "Good"/"Easy" push its next due date out further each
time, roughly doubling. This is a transparent heuristic, not a validated
forgetting-curve model, in keeping with the PRD's instruction not to oversell
precision. `Progress.tsx`'s "Review due" card now shows a real due count via
`useDueRecallCount()` instead of a static line.

## Cross-concept Review

`Learn.tsx`'s Recall stage only ever showed cards for the concept it's on.
`/student/review` (`src/mytuta/student/Review.tsx`) is a new standalone
session that pulls every `recall_cards` row due today or earlier for the
signed-in user, across every concept, oldest-due first (`useDueRecallCards`
in `queries.ts`, capped at 30 a session): intro (due count + concept count)
→ session (flip-and-rate, same UI pattern as Learn's Recall, each card
tagged with its concept name) → done (a tally by rating). Rating reuses the
existing `useRateRecallCard` mutation unchanged. `Progress.tsx`'s "Review
due" card now routes here when cards are due, instead of always sending the
student back to Learn. No new migration; reuses `recall_cards` entirely.

## Profile, settings and account deletion

`/profile` and `/settings` are real screens now (nested inside the app shell,
reachable from the rail avatar and the header gear icon). Profile lets a
student or teacher edit name, bio, school, learning/teaching stage, subjects,
and (students only) goals and a parent/guardian contact — all direct
`profiles` table updates under its existing "own row" RLS, no new policies
needed. Settings shows the account email, a sign-out button (the app had no
sign-out entry point before this), and a "Danger zone" with a type-DELETE-to-
confirm flow that calls `delete_my_account()`. Every mytuta table that
references `auth.users(id)` was created with `ON DELETE CASCADE`, so this one
delete removes everything the user owns.

## Lab observations and challenge stage work (no new migration)

Both reuse existing tables, so no schema change was needed:

- **Lab** (`src/mytuta/student/Lab.tsx`) — the "Record your result" textarea
  in a step that has `record: true` now saves to `attempts` on "Next step" /
  "Finish activity" (`useRecordLabObservation` in `mutations.ts`): `kind:
  'lab'`, `prompt` set to `"<activity title> — <step title>"`, `response:
  { observation }`. Best-effort (non-blocking); nothing shows this back to
  the user yet beyond the activity itself.
- **Challenges** (`src/mytuta/student/Challenges.tsx`) — the "Your work"
  textarea per stage now persists to `challenge_submissions.work` (a jsonb
  map of stage index → text) and `.stage`, upserted on every Back/Next via
  `useSaveChallengeProgress`. Opening a challenge's detail view now reads
  `useMyChallengeSubmission` and, if an `in_progress` row exists, shows
  "Continue challenge" (resuming at the saved stage with the saved text)
  instead of "Join challenge".

## Help

`/help` (`src/mytuta/Help.tsx`) is a real, role-aware FAQ now, nested inside
the app shell like Profile/Settings. It's static content grounded in what's
actually built (Learn's loop, Solve, Lab, Challenges resume, join-by-code,
recall scheduling, assessment scoring, notifications for students; Create vs.
assessments, AI question generation, class challenges, Insights for
teachers), filterable by topic chips, no database involved. Reachable via a
new "?" header icon next to the settings gear, since nothing linked to
`/help` before this. The old standalone `Placeholder.tsx` component (used
only by the pre-existing `/help` route) was deleted as dead code.

## Google sign-in

`AuthService.signInWithGoogle(userType?)` (`src/services/authService.ts`)
calls `supabase.auth.signInWithOAuth({ provider: 'google' })`, redirecting to
`/auth/callback` (with `?type=student|teacher` when starting from Sign Up's
role toggle). New `src/pages/AuthCallback.tsx` runs once the browser returns:
it reads the now-established session, checks `profiles.onboarding_completed`,
and routes to `/onboarding?type=...` if not finished, or straight to the
role's home if it is — the same destination logic email sign-up/sign-in use,
just resolved after an async redirect instead of a synchronous form submit.
"Continue with Google" buttons are on both `SignIn.tsx` and `SignUp.tsx`.

**This does not work until Google OAuth is enabled in the Supabase Auth
dashboard** (Authentication → Providers → Google, with a Google Cloud OAuth
client ID/secret and `https://<project>.supabase.co/auth/v1/callback`
registered as an authorized redirect URI on the Google side) — same kind of
external, one-time setup as the `GROQ_API_KEY` env var. Until then the button
is visible and wired but the OAuth handshake itself will fail.

## STEM notation rendering

Formulas, fractions, and chemical notation used to render as raw text (e.g.
`v^2 = u^2 + 2as`). Added `katex` and a new `MathText` component
(`src/mytuta/MathText.tsx`) that scans a string for `$...$` (inline) and
`$$...$$` (block) delimiters and renders matched spans through KaTeX,
HTML-escaping everything else; anything that fails to parse falls back to
its raw delimited text instead of crashing (KaTeX's own `throwOnError:
false` plus a wrapping try/catch). The shared `SYSTEM` prompt in
`src/mytuta/data/ai.ts`, and Solve's separate inline system prompt (it uses
the legacy `groqApiService`, not `ai.ts`), now both instruct the model to
wrap math in those delimiters. Swapped into every read-only AI-content
display site: Learn's diagnostic/mastery questions, Understand explanations
and misconceptions, Worked Examples, Recall cards, Guided Practice's coach
steps, Apply's prompt/take-home; Solve's question/coaching steps/final
answer; `AssessmentTake.tsx`'s question prompts and options; Challenges'
brief and stage task. Deliberately **not** touched: Independent Practice
(being rebuilt in a later pass anyway), Studio's AI preview and Assessments'
question-review fields (those are editable text inputs, not read display —
KaTeX renders to HTML, not into a textarea; the raw `$...$` syntax stays
visible there for editing, and renders correctly wherever it's later shown
read-only to a student).

## Independent Practice

Was a static list with a single "Continue" button — no answer input, no
feedback. `generateConceptStages`'s prompt (`ai.ts`) now specifies a real
schema for this stage: 5 MCQ items across Foundational/Standard/Advanced/
Mixed application difficulty, each with 4 options, an explanation, a related
concept, a recommended next step, and a `wrongCategories` array (same length
as options, `null` at the correct index) classifying *why* each specific
wrong answer might be picked, using the PRD's 7 named categories (Concept
error, Method error, Formula error, Calculation error, Unit error,
Interpretation error, Incomplete reasoning) — authored once at generation
time rather than via a live classification call per attempt.

The `Independent` component in `Learn.tsx` is now a real per-item loop:
answer, "Check answer," see Correctness / Explanation / Mistake category
(only when wrong) / Related concept / Recommended action, then move to the
next item. Each attempt logs to the existing `attempts` table (`kind:
'independent_practice'`, using its pre-existing `concept_id`/`correct`/
`mistake_category` columns — built for exactly this, no new migration).
Results also blend into Mastery Check's knowledge score, the same way
Recall and Guided Practice already blend into their dimensions.

## Solve: reflection + follow-up actions

`Solve.tsx`'s "solved" view used to be a dead end (final answer + one "Solve
another question" button). It now has a **Reflect** block (3 short text
prompts: method used, where you struggled, could you repeat it — saved as
one `attempts` row, `kind: 'solve'`, via new `useLogSolveReflection`) and a
**What next** block with the PRD's 5 follow-up actions:

- *Try a similar question* — new `generateSimilarQuestion` (`ai.ts`) writes
  one new question practising the same skill, then re-enters coaching with
  it directly (`start()` now takes an optional override question).
- *Add to mastery path* / *Review this concept* — the coaching system prompt
  now also returns a `topic` field; a local `resolveConcept` (same fuzzy
  match pattern as Learn's `EnterConcept`) matches it against the STEM
  catalog and navigates to `/student/learn` with `location.state =
  { presetConceptSlug, mode }`. `Learn.tsx` gained a one-time bootstrap
  effect that reads this state: `mode: "review"` reopens an existing path at
  its current stage if one exists, otherwise (and always for `mode: "add"`)
  it lands on the Confirm step so the student proceeds through the normal
  quick-check → build flow. No duplicated path-starting logic.
- *Save this problem* — flags the same `attempts` row shape with
  `response.saved = true`; intentionally no dedicated "saved problems" list
  screen in this pass.
- *Share with teacher* — reuses the existing `notify_teacher` RPC (already
  enforces class membership) with a new `share` notification kind, added to
  `Notifications.tsx`'s icon map. Auto-shares if the student has exactly one
  class, offers a picker if more, and shows a disabled state if they have
  none.

No new migration — everything reuses `attempts` and `notify_teacher`.

## Student experience viewer + real assignment status

A student assigned a **Learning Experience** (as opposed to an assessment)
previously had no way to open it at all — `learning_experiences`/
`experience_sections` had zero student-facing consumer, and `Assignments.tsx`
only made a row clickable when `assessmentId` was set. Two real bugs, not
just missing polish: (1) `experience_sections` had no RLS path for a student
reading an *unpublished* assigned experience (`assign_experience` never
required `status = 'published'`), and (2) assignment status was hardcoded to
"Not started" regardless of actual progress.

New migration `20260720230000_mytuta_experience_progress.sql`: a
`"students read assigned sections"` SELECT policy on `experience_sections`
(mirrors the existing `is_experience_assigned_to_me` policy already on the
parent table), and a new `experience_progress` table (own-row RLS) tracking
per-student `in_progress`/`completed` state per experience.

New `src/mytuta/student/ExperienceView.tsx` at
`/student/experiences/:experienceId`: reuses the already-existing
`useExperience`/`useExperienceSections` (previously Studio-only, but always
generic) to render a read-only section-by-section view (same section list as
Studio, minus "Teacher guide" which is authoring-only), marks itself
`in_progress` on first open (`useMarkExperienceProgress`, guarded so it never
downgrades an already-`completed` row), and offers "Mark as done" on the
last section.

`useStudentAssignments` (`queries.ts`) now computes real status instead of a
hardcoded string: assessment assignments check `assessment_submissions`
(`Completed · <mastery level>`), experience assignments check
`experience_progress` (`Not started` / `In progress` / `Completed`).
`Assignments.tsx` rows are clickable whenever there's somewhere real to go —
an unsubmitted assessment ("Take now") or any experience ("Open" /
"Completed · Open" to revisit) — not just assessments.

## Create wizard material + Studio AI edit/regenerate

**Create's "Add your material" step** (`Create.tsx` step 2) used to be pure
theatre: selecting "Upload notes"/"Paste content" chips toggled label state
that never reached generation. It now really does something: picking an
upload-type chip reveals the same attach control pattern used in Learn/
Solve (`useUploadIntakeFile`, private `uploads` bucket), and "Paste content"
reveals a real textarea. `generateExperienceDraft` (`ai.ts`) gained
`materialNote`/`pastedContent` params threaded into the prompt (pasted text
is capped at 4000 chars and the model is told to adapt it, not invent
unrelated content).

**Studio's AI assistant** previously showed the generated preview as a
static `<div>` (no edit before accepting) and had no way to ask for a
different version distinct from a first-time click. The preview is now an
editable `<textarea>` bound directly to the same state used for "Insert into
section," and a new "Regenerate" button calls `generateStudioAssist` again
with a `regenerate: true` flag — the prompt then explicitly asks for a
genuinely different take (different example/wording/structure), not a
reroll that happens to land similarly.

No new migration for either — both reuse existing tables/buckets.

## Insights: class progress + question analysis

`Insights.tsx` had only misconceptions and a skill-breakdown bar chart, plus
one hardcoded "Create remedial activity" button. Migration
`20260720240000_mytuta_insights_detail.sql` extends `teacher_dashboard()`
additively (new jsonb keys, nothing removed or renamed) with two more
aggregations, both computed purely from existing tables:

- **`class_progress`** — one row per student the teacher has (via
  `class_students`/`classes`), status derived from their `mastery_profiles`:
  `Not started` (no rows) / `Needs support` (>50% of concepts still
  Beginning) / `In progress` / `Mastered` (all concepts Mastered). This is a
  deliberate 4-state simplification of the PRD's 5 states — "Completed" has
  no signal distinct from "Mastered" anywhere in the data model, so it isn't
  fabricated.
- **`question_analysis`** — per-question % correct and the most-picked wrong
  option, computed by unnesting `assessment_submissions.answers` jsonb
  against `assessment_questions` (a `DISTINCT ON` "top wrong option per
  question" idiom), worst 10 questions across all the teacher's assessments.

`Insights.tsx` gained a Class progress table, an expandable Question
analysis list, and each misconception now has its own **distinct**
recommended-action buttons (Reteach concept / Create support path → Create
wizard, Retest students → Assessments builder) instead of one generic CTA at
the bottom of the page.

## Assessment type catalog + Controlled Assessment Mode

`assessTypesData` (`constants.ts`) grew from 3 to 9 types: existing Mastery
check/Topic test/Examination-style plus Diagnostic, Timed test, Mixed STEM
test, Partner assessment, Mock examination, Olympiad preparation. Each
carries `timed`/`controlled` flags. **Deliberately excluded**: Practical
Assessment and Design Challenge from the PRD's catalog — those are staged,
submission-based work already covered by the Challenges feature, not the
MCQ model `assessment_questions`/`assessment_submissions` drives; adding
them here would mean half-building a second submission format.

New migration `20260720250000_mytuta_assessment_autosave.sql`:
- `autosave_assessment_answers(assessment_id, answers)` — a new SECURITY
  DEFINER RPC that upserts a **draft** `assessment_submissions` row
  (`submitted_at = NULL`, never scored, never counted in the assessment's
  rollup), guarded so it can never clobber an already-finalized submission.
- `get_assessment_for_taking` patched so a draft's default score/level
  (0 / 'Beginning') never leaks as a fake prior result — `prior_score`/
  `prior_level` only come from a row with `submitted_at` set; an
  unsubmitted draft's answers come back separately as `draft_answers` so
  the client can resume.

`AssessmentTake.tsx` now branches on the assessment's type (matched against
`assessTypesData` by title): **timed** types get a countdown
(`max(10 min, 90s × question count)`) that auto-submits at zero;
**controlled** types additionally show a "Controlled · independent work
only" badge, autosave a draft on every question navigation, and resume from
`draftAnswers` on load. Every type gets per-question **flagging** (local
state, marked on the progress dots) regardless of timed/controlled status.
**Delayed explanations** needed no new work — the screen never showed
per-question explanations to begin with, only the final score/level after
submit, which already satisfies that requirement. **AI disabled** is
likewise inherent — there's no AI-assist affordance on this screen for any
assessment type; controlled mode just makes that explicit with the badge.

## Class settings + invite methods

Migration `20260720260000_mytuta_class_settings.sql` adds five typed toggles
to `classes` (`ai_assistance`, `allow_challenges`, `allow_sharing`,
`notify_on_submission`, `assessment_rules` text) — minimal columns, not a
generic jsonb blob. No new RPC: the existing `"teacher update"` RLS policy
(`teacher_id = auth.uid()`) already permits writing them, so
`useUpdateClassSettings` updates `classes` directly. New `Classes.tsx`
"Settings" sub-view with toggle switches + an assessment-rules textarea,
plus `useClassSettings` query.

**Invite by link** needs no backend: `Classes.tsx` has a "Copy invite link"
button that copies `${origin}/join/${code}`. New public route
`/join/:code` (`src/mytuta/JoinClass.tsx`) stashes the code in
`localStorage.pendingJoinCode` and, if signed in, calls `join_class`
immediately → Assignments; if not, sends the visitor to sign-in and
`Assignments.tsx` auto-consumes `pendingJoinCode` on its next mount (so it
survives sign-up → onboarding → home).

**Roster upload** is scoped to "paste one name per line": `useAddRosterStudents`
bulk-inserts placeholder `class_students` rows (nullable `student_id` +
`display_name` snapshot — the exact case the original schema was built for),
covered by the existing teacher-scoped `class_students` INSERT policy. No new
migration for invites or roster.

## Lab filters + assessment dimensions

Migration `20260720270000_mytuta_lab_dimensions.sql` adds `difficulty`,
`team_mode`, and a `dimensions jsonb` array to `lab_activities` (which
already had `subject`/`equipment`/`time_estimate`). `Lab.tsx`'s single
equipment filter row became a facet selector: a segmented control
(Equipment / Subject / Difficulty / Team) whose value chips are derived from
the distinct values actually present in the catalog, so empty facets only
offer "All" instead of showing fake buckets. The activity detail replaces
the single "Demonstrates" line with **Assessment dimension** chips (subset
of the PRD's Understanding / Process / Application / Creativity /
Communication) when `dimensions` is populated, falling back to the old
`demonstrates` string otherwise — existing seed rows keep working. No
numeric per-dimension scoring is fabricated (the PRD doesn't define how it
would be computed). `labFilters` in `constants.ts` is now unused dead config
(left in place, harmless).

## Challenges feedback loop

Submitting a challenge used to dead-end at a canned "a teacher reviews
entries" message with no actual review path. Migration
`20260720280000_mytuta_challenge_feedback.sql` adds `feedback` /
`feedback_level` / `reviewed_at` to `challenge_submissions` plus two
SECURITY DEFINER RPCs (both owner-checked against `challenges.created_by`):
- `get_challenge_submissions(challenge_id)` — every submission for a
  challenge the teacher owns, with each student's name resolved server-side
  (client-side profile lookups are blocked by profiles' own-row RLS).
- `review_challenge_submission(submission_id, feedback, level)` — writes the
  feedback and fires a `feedback` notification to the student. Written via
  RPC rather than a broadened UPDATE policy so a student can't author
  feedback on their own submission.

New teacher screen `ChallengeReview.tsx` at
`/teacher/classes/:classId/challenge/:challengeId/submissions` (reached from
a "Review submissions" button on `ChallengeEdit.tsx`): lists submissions,
expands one to show the student's per-stage `work`, and takes a level
(Beginning/Developing/Secure/Mastered) + free-text feedback. The student
sees that feedback on the challenge's detail view in `Challenges.tsx`
(`useMyChallengeSubmission` now also selects the feedback columns).
**Showcase** (stage 10, a class-visible gallery) is deferred — it raises
consent/moderation questions worth their own decision.

## Scheduled reminders (pg_cron)

The remaining PRD notification kinds are time-based, not event-triggered.
Migration `20260720290000_mytuta_scheduled_reminders.sql` adds two SECURITY
DEFINER functions — `notify_due_deadlines()` (assignments due within 24h →
one `deadline` notification per signed-up class student, de-duped per
student per day) and `notify_due_recall()` (each learner with a card due
today → one `recall` nudge, de-duped per day) — and schedules both daily via
`cron.schedule` (07:00 / 07:30). `Notifications.tsx` gained icons for the
`deadline`, `recall`, and `feedback` kinds.

**Requires pg_cron**, which on Supabase is enabled once via the dashboard
(Database → Extensions → pg_cron) — same class of external one-time setup as
`GROQ_API_KEY` and the Google OAuth provider. The scheduling is wrapped in a
`DO` block that checks `pg_extension` first, so the migration applies cleanly
whether or not pg_cron is on yet; if it wasn't enabled, turn it on and re-run
this file (idempotent) to register the jobs. The two functions themselves are
plain SQL and always install regardless. This session cannot verify the jobs
actually fire (no live scheduler) — that's a post-apply check for Collins.

## Analytics instrumentation

`src/lib/analytics.ts` already had a GA-backed `trackEvent` but zero
mytuta-specific call sites (the flashcard/quiz/revision helpers there are
dead pre-mytuta code). Added typed wrappers following the existing
`trackSignUp`/`trackSignIn` pattern (`trackMasteryPathStarted`,
`trackStageCompleted`, `trackIndependentAttempt`, `trackSolveCompleted`,
`trackAssessmentCreated`/`Submitted`, `trackChallengeCreated`/`Submitted`,
`trackClassCreated`/`Joined`, `trackExperienceCreated`,
`trackAiContentInserted`), each grouped under a `student`/`teacher`/`study`
GA category. Wired mostly at mutation success points in `mutations.ts`
(so they fire once, on real success, next to the query invalidations), plus
two component-level ones: Studio's "Insert into section" and Solve reaching
its conclusion. No infra change. Can't confirm GA receipt from this session
(no live gtag) — that's a post-deploy check for Collins. Monetization/upsell
events are omitted along with the skipped monetization work.

## Accessibility sweep

Mechanical, highest-leverage a11y fixes (PRD §39) — not a full WCAG AA
certification:
- `src/index.css`: a global `:focus-visible` ring (2px brand green) so
  keyboard focus is visible everywhere despite the app's inline
  `outline: none` inputs; a `@media (prefers-reduced-motion: reduce)` block
  that near-zeroes animation/transition durations app-wide (cutting the
  `fadeup`/`fadein` entrance animations for users who ask for it).
- `AppShell.tsx`: `aria-label="Primary"` on the icon rail `<nav>`;
  `aria-label`s on the icon-only header buttons (notifications — including
  the unread count, settings, help) and the rail avatar, with their glyphs
  marked `aria-hidden`.
- `alt` audit on real `<img>`: profile photo and the two upload thumbnails
  (Learn/Solve) now carry descriptive alt; the decorative rail avatar image
  keeps `alt=""` since its button is already labelled.

The focus ring and reduced-motion behavior depend on keyboard/OS state the
build session's browser tools can't drive, so those were verified by CSS
validity + build rather than live — a spot check for Collins.

## Avatar upload

`Profile.tsx` now has a "Change photo" control next to the profile fields:
picking an image (client-validated as an image type, under 3MB) uploads it
to the `avatars` bucket at `avatars/{user_id}/avatar.<ext>` via
`useUploadAvatar` (`upsert: true`, so re-uploading replaces the old file),
then writes the bucket's public URL (with a cache-busting `?t=` timestamp)
to `profiles.avatar_url`. `useProfile` now exposes `avatarUrl`; both
`Profile.tsx`'s own preview circle and the rail avatar button in
`AppShell.tsx` show the photo when set, falling back to initials.

## File-upload intake

Learn's "Upload notes" and "Photograph material" intake options used to just
say "full upload/camera capture comes next" and ask the student to type the
topic name regardless. They now really do accept a file: `EnterConcept` in
`Learn.tsx` shows an "Attach a file"/"Attach a photo" control (photo mode
sets `capture="environment"` so mobile opens the camera directly), uploads
it via `useUploadIntakeFile` to the private `uploads` bucket at
`{user_id}/{timestamp}-{filename}`, and shows a thumbnail/filename chip with
a "Remove" option once it's up (8MB limit, client-checked).

Scope is deliberately bounded: there's no vision-capable model wired into
Groq (`groqApiService`'s `AVAILABLE_MODELS` are all text-only), so the
attachment is not OCR'd or analyzed — the student still types the topic to
match it against the catalog, same as before. The file itself isn't
persisted anywhere beyond the upload (no DB row references it), since
nothing else in the product reads it back yet. Solve's `solveInputs`
constant (`Type/Photograph/Upload image/Paste from notes`) is unrelated and
still unused dead config — Solve's UI never built an input-mode selector in
the first place, so wiring that up is a separate, bigger feature than this
fix.

## Editing a challenge after creation

`challenges` had SELECT and INSERT RLS policies but no UPDATE, so a teacher
could never fix a typo or reword a stage once a class challenge was created.
`20260720210000_mytuta_challenge_edit.sql` adds an own-row UPDATE policy
(mirrors the INSERT policy's ownership check). New `useChallengeDetail`
query + `useUpdateClassChallenge` mutation (`queries.ts`/`mutations.ts`),
and a new screen `src/mytuta/teacher/ChallengeEdit.tsx` at
`/teacher/classes/:classId/challenge/:challengeId/edit`: title, one-line
summary, brief, and each of the 4 stages' name/goal/task are all editable
inline (same pattern as the assessment question review), saved in one
"Save changes" call. Each class challenge row in `Classes.tsx`'s class
detail view is now a button that opens this edit screen (previously just a
static row).

## Solve's input-mode selector

`solveInputs` (`Type` / `Photograph` / `Upload image` / `Paste from notes`)
was defined in `constants.ts` but never used — Solve only ever had a plain
textarea. It's now a real chip row above the question box in `Solve.tsx`.
`Photograph` and `Upload image` reveal an attach control (photo mode sets
`capture="environment"` for the mobile camera) that uploads to the same
private `uploads` bucket as Learn via `useUploadIntakeFile`, showing a
thumbnail/filename chip once up. As with Learn, there's no vision model
wired in, so the student still types the question text; a small note under
the attach control says so directly, and the textarea placeholder changes
per mode. `Paste from notes` and `Type` share the same textarea with
different placeholder copy only.

## Solve's help modes (now genuinely differentiated)

The five "How should mytuta help?" options used to be cosmetic — every one
ran the identical step coach (the system prompt hard-coded "give 3 to 5
coaching steps" and only the mode's label was passed through), and two were
structurally broken: "Check my working" never collected the student's
working, and "Create similar questions" solved the given question instead of
generating practice. Each mode now behaves distinctly (`helpModes` carries a
`mode: HelpModeKind` key; `Solve.tsx` branches on it):
- **Give me a hint** → one-nudge response card (no full solution), with a
  "Guide me step by step" escalation button.
- **Guide me step by step** → the step coach (unchanged path).
- **Explain the concept** → a plain-language explanation of the underlying
  idea (does not solve the specific question), plus "Now solve it step by
  step" and "Review this concept" actions.
- **Check my working** → reveals a "Your working so far" textarea on the
  input screen; the coach prompt takes the student's attempt and pinpoints
  where it goes wrong. The CTA is gated until working is pasted.
- **Create similar questions** → generates 3 new practice questions (no
  answers), each with a "Solve this one" button that re-enters the step coach.

Non-step modes render in a new `response` view; the CTA label and busy text
are mode-specific (`modeCta`). Only the step-coach path leads to the
reflection + follow-up "solved" screen.

**Robustness fix (after live testing surfaced JSON crashes).** The models
routinely emit LaTeX backslashes (`\(`, `\mathbb`, `\$`) and literal
newlines *inside* JSON string values — both illegal JSON — so the naive
`JSON.parse` threw ("Bad escaped character", "Bad control character",
"Expected ',' or ']'…") and every non-step mode failed. `askJson` now tries
a fast `JSON.parse`, then falls back to `sanitizeLlmJson`, a string-state
machine that (inside string values only) doubles any backslash that isn't a
valid JSON escape and escapes stray control characters, leaving structural
whitespace alone. Verified with a standalone node harness against the exact
failing shapes. Separately, `MathText` now also normalizes TeX/MathJax
delimiters (`\(…\)` → `$…$`, `\[…\]` → `$$…$$`) so AI content that ignores
the "use `$`" instruction — like the garbled dinner-bill question — still
renders. Verified by tsc + build; live click-testing of the AI flows is the
user's step (screen is auth-gated).

## Tuta Credits monetization (hybrid model)

Implements the monetization spec: free learning access, **Tuta Credits** to
power AI creation/solving, monthly plans for regular users, plus 30 welcome
credits for activation. Guiding rule enforced everywhere: **accessing
learning is free; only NEW AI creation spends credits.**

**Data model** (`20260720300000`): bucketed `credit_lots`
(welcome/promo/subscription/purchased, per-lot expiry), an append-only
`credit_transactions` ledger, an editable `credit_action_costs` table (edit
in the Supabase dashboard = "configure costs without code"), `subscriptions`,
`payments`. Clients only READ their own rows; every mutation goes through a
SECURITY DEFINER RPC. `spend_credits(action_key)` deducts atomically in the
spec's order (promo→welcome→subscription→purchased, nearest expiry first),
returns `ok:false` without deducting when short; `refund_credits(txn_id)`
restores a failed generation's spend into a non-expiring lot.

**Wallet** (`src/mytuta/Wallet.tsx`, `/wallet`): per-bucket balances,
nearest expiry, usage history. Header chip in `AppShell.tsx` shows the live
balance (polled like the notification badge).

**Action gating** (`src/mytuta/credits/CreditGate.tsx`): a
`CreditGateProvider` around every app screen exposes `useCreditGate().run({
actionKey, title, description, action })` — confirm modal (cost / balance
before+after, with a "don't ask again for 1-credit actions" flag) → atomic
`spend_credits` → run the AI action → `refund_credits` on throw; a
low-credit modal (Buy / Plans / Cancel) when short. Wired at **8 real
generation sites**: mastery-path start (Learn), the three Solve modes,
experience create (Create), Studio assist, assessment generate, class-
challenge generate. Learn's Understand stage "Ask a question" box
(`answerConceptQuestion`) and its "Explain another way" button are **free and
ungated** — in-path help is already covered by the path's price and must not be
a credit barrier (`concept_question` is deliberately unseeded in
`credit_action_costs`). Costs are read from `credit_action_costs` and shown
before charging. **Free by decision** (not gated): the in-path Mastery Check
and diagnostic (already paid for via the path), and reading/opening/
completing anything. Enforcement is **client-gated**: a technical user could
call `/api/groq` directly and bypass the charge — accepted for MVP; server-
side generation is the documented future hardening.

**Welcome + activation** (`20260720310000`): `grant_welcome_credits()` (30
credits / 14 days, idempotent) fires at `Onboarding.finish()`. A
`CreditBanner` on both Home screens nudges by wallet state (welcome present /
expiring / empty). `notify_expiring_credits()` (daily pg_cron) warns before
expiry via a `credits` notification.

**Pricing** (`src/pages/Pricing.tsx`, rebuilt): the four bundles
(`src/mytuta/credits/bundles.ts` — 50/140/320/700 for GHS 20/50/100/200),
"what N credits can do" examples, Student Free/Plus (GHS 100) and Teacher
Free/Pro Founding (GHS 150), a custom-bundle line.

**Payment — Paystack** (`api/paystack-verify.ts`, `api/paystack-webhook.ts`;
`src/mytuta/credits/paystack.ts`): the inline popup collects payment; a
serverless endpoint verifies the reference with the secret key and re-derives
credits from the **actually-paid amount** (a tampered client cannot over-
credit), then grants via `credit_purchase` (service role, idempotent on
`provider_ref`, +10% subscriber bonus). Subscriptions use Paystack Plans; the
webhook (HMAC-verified) calls `apply_subscription_charge` on each successful
charge to reset the monthly lot (rolling over up to 100), and
`cancel_subscription_state` on disable/failure. `flag_past_due_subscriptions`
(daily) only flags lapses — billing is Paystack-driven, credits are granted
only on real payments. Subscription management lives in `Settings.tsx`.

**External setup required before payments work live** (nothing testable from
the build session — no Paystack keys, no authenticated session):
- `PAYSTACK_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (Vercel env, server-only);
  `VITE_PAYSTACK_PUBLIC_KEY` (`.env` + Vercel).
- Create Paystack Plans for Student Plus / Teacher Pro; set their codes as
  `PAYSTACK_PLAN_STUDENT_PLUS` / `PAYSTACK_PLAN_TEACHER_PRO` (webhook env) and
  `VITE_PAYSTACK_PLAN_*` (client env).
- Register the `/api/paystack-webhook` URL in the Paystack dashboard.
- Enable pg_cron for the expiry/reminder/renewal jobs (guarded; re-run the
  migrations to register).

Verified: libpg_query parse for all three migrations; `tsc --noEmit` + `npm
run build` clean; deduction-order logic reviewed; rebuilt `/pricing` spot-
checked in the browser. Live payment/subscription flows are Collins's post-
setup step.

## Master Admin Panel

Implements the Master Admin Panel PRD: the internal control centre for users,
credits, subscriptions, payments, content, assessments, AI, support, settings,
and audit. Migrations `20260720330000`…`20260720420000`; a new `src/admin/` client
tree (slate professional theme, separate from the student/teacher app); routes at
`/admin/*`.

**Authorization (the core design):** a revived `admin_users` table (dropped in
`20250929170449`) + `current_user_is_admin()` / `current_admin_role()` /
`admin_has_role()` helpers gate every admin RPC. All cross-user access goes through
**admin-gated `SECURITY DEFINER` RPCs** under the anon key — no broad admin-read
RLS on the 30 app tables, no service-role admin backend. Every mutating RPC calls
`admin_log(...)`, writing an immutable `admin_audit_log` row (actor / action /
target / before / after / reason), so the audit trail is automatic. The route
guard `src/admin/AdminProtectedRoute.tsx` checks `current_user_is_admin()` and
redirects non-admins (verified: an anonymous `/admin` visit redirects to
`/signin`). Admin auth reuses Supabase email/password; **MFA, impersonation, and
second-approval are deferred** to a security-hardening phase.

**Modules (all 11 PRD MVP modules):** Overview (`platform_overview()`), Users
(directory + detail + suspend/role/note/credit-adjust/expiry/refund/cancel-sub/
export), Credits (action-cost editor, DB-configurable `credit_bundles`, liability
dashboard), Plans (`plans` config) + Subscriptions (directory + cancel/extend/
comp/founding), Payments + `refunds` + Reconciliation (+ `api/paystack-refund.ts`,
admin-gated), Concepts/Content (concept+misconception+stage CRUD — tables had no
write policy before; question review; read-only path/experience directories),
Assessments (directory + detail + status), AI Operations + `ai_jobs` + AI Jobs
directory, Support (`support_tickets`+`ticket_messages` inbox), Platform Settings
(`platform_config`+`feature_flags` editors), and the Audit Log viewer.

**Sensitive-action UX:** a shared `ActionModal` requires a typed reason before any
write (PRD §32); the reason lands in the audit row.

**Deferred main-app instrumentation** (admin surfaces + tables ship now, populated
/ live once these land): AI-job logging from `api/groq.ts` into `ai_jobs`; a
user-facing support-ticket creation path; and wiring `platform_config` keys (e.g.
welcome-credit amount) into the live credit/limit RPCs. Also deferred: suspend
**enforcement** (blocking a suspended user's session needs an auth hook — MVP sets
the flag + audits); full switch of `api/paystack-verify.ts`'s server price map to
`credit_bundles` (kept independent as anti-tamper).

**External setup Collins must do:** confirm/seed the first Super Admin (migration
`20260720330000` seeds `kofcollkcl100@gmail.com` — change the email there if
needed, or add admins via Users → change-role once one super admin exists); apply
migrations `20260720330000`…`20260720420000`; refunds reuse the existing
`PAYSTACK_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (no new secret).

Verified per phase: libpg_query parse for every migration; `tsc --noEmit` + `npm
run build` clean; the route guard's non-admin redirect confirmed in-browser. Full
admin-screen testing needs an admin session the build environment cannot create
(same standing constraint as credits/OAuth) — that is Collins's step once seeded;
the audit log is the live traceability proof.

## Intelligence Layer (Phase 1: connected foundations)

The connective "brain" that ties the student modules together — a per-learner
model that knows what they understand, what they misunderstand, and **what to do
next**. Introduced *underneath* the existing product (no rebuild); most raw signal
already existed and is reused rather than duplicated. Migration
`20260720430000`; client in `src/mytuta/intelligence/`.

**Reuse over rebuild:** `attempts` (already written on every graded interaction,
read by nothing before) is the correctness/mistake spine; `mastery_profiles` is
Knowledge + Skill state; `recall_cards` is at-risk-of-forgetting;
`onboarding_answers` (captured but unused) is the cold-start signal. **New:**
`learning_events` (behavioral stream `attempts` lacks), `student_goals`,
`learner_profile` (editable memory). All own-row RLS, so goal/memory edits are
direct client writes.

**Engine = rules-first, templated text (no AI, no credit spend, deterministic,
auditable).** Five `auth.uid()`-scoped `SECURITY DEFINER STABLE` RPCs (same shape
as `teacher_dashboard`, so the logic can later drive nudges + admin metrics):
`next_best_action()` (priority: urgent assignment → unfinished path → forgetting
risk → repeated misconception → goal → explore), `learner_model()` (six-part
profile), `learning_insights()` (actionable cards), `solve_history()` (grouped by
topic), `record_learning_event()`.

**Surfaces:** Home is now a command centre — *mytuta Today* (Next Best Action with
a real continue-where-you-left-off deep-link into `/student/mastery/:pathId`),
*Your Tutor* line, *mytuta noticed* insights, current goals, what's due, momentum
(`Home.tsx` + `intelligence/{NextActionCard,TutorPanel,InsightCard}`). Progress
hosts the editable **Learning Profile** (strengths/challenges/what-helps/support +
goal & correction controls → `learner_profile`/`student_goals`; no new nav item,
per spec). Solve gained a **history view** (`solve_history()`) over data it already
wrote. Onboarding **seeds the model** (goals + templated `learner_profile` summary)
and shows a "what mytuta understands + first steps" closing card. Quiet nav badges
(Home = has-next-action dot, Progress = due-review count).

**Event wiring:** `hint_requested` (Solve), `simpler_explanation` /
`explanation_requested` (Learn Understand), `revision_completed` (Review),
`goal_selected` (goal add), `onboarding_completed` (onboarding). Solve now stamps
`topic` into the attempt so history groups meaningfully.

**Roadmap (not built):** Phase 2 adaptive learning; Phase 3 push/email + credit-
aware nudges (in-app nudging already delivered via Home) — reuse the RPCs as
pg_cron `_for(user_id)` variants; Phase 4 teacher intelligence; Phase 5 predictive;
admin intelligence metrics fold into the admin panel. **AI narration** of insights/
tutor is a deliberate later enhancement (MVP is templated).

Verified: libpg_query parse; `tsc` + `npm run build` clean per phase. The engine is
deterministic, so it's verifiable on seeded `attempts`/`mastery_profiles` rows;
full signal richness accrues with real usage. No external setup — runs under the
existing anon key + RLS; apply migration `20260720430000`.

## PRD coverage status

A full audit against `mytuta_STEM_Mastery_PRD.md` drove a 16-phase
gap-closure pass. Everything that audit surfaced has now been built and
verified (`tsc --noEmit` + `npm run build`, plus libpg_query SQL parse for
every migration): onboarding persistence, Google sign-in, STEM notation
(KaTeX), Independent Practice interaction + mistake categories, Solve
reflection/follow-ups, the student experience viewer + real assignment
status, Create material upload + Studio edit/regenerate, Insights
per-student/question analysis, the assessment type catalog + Controlled
Assessment Mode, class settings + invite methods, Lab filters + assessment
dimensions, the challenge feedback loop, scheduled reminders, analytics
instrumentation, and the accessibility sweep.

### Deliberately out of scope / deferred
- **Monetization & usage limits (PRD §33–34)** — skipped by decision;
  Pricing stays static marketing copy. Its own future project.
- **Challenge showcase gallery (PRD §18 stage 10)** — deferred; raises
  consent/moderation questions worth a separate decision.
- **Practical Assessment / Design Challenge assessment types** — deferred;
  they're staged submission work already served by the Challenges feature,
  not the MCQ model the assessment builder drives.

### Needs one-time external setup before it works live
These are code-complete but depend on Supabase/provider configuration Collins
must do outside this repo (each documented in its section above):
- **Google sign-in** — enable the Google provider + OAuth client in Supabase Auth.
- **Scheduled reminders** — enable the `pg_cron` extension, then re-run
  `20260720290000` to register the daily jobs.
- **AI content generation** — `GROQ_API_KEY` env var (pre-existing).

### Verification note
This build environment can't apply migrations or hold an authenticated
Supabase session, so nothing data-backed was click-tested live — each phase
was verified by SQL parse + typecheck + build, and UI-only changes by
browser-preview spot checks where auth wasn't required. Live end-to-end
testing is Collins's step after applying the migrations.
