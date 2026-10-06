# mytuta — STEM Mastery Platform

**Live:** https://mytuta.org  
**Stack:** React 18 + Vite + TypeScript · Supabase (PostgreSQL + Auth) · Groq AI · Paystack

mytuta is a mastery-based STEM learning platform for Ghanaian secondary school students and their teachers. Students follow concept-level Mastery Paths built from reviewed content, labs, and challenges. Teachers create experiences, set assignments, run assessments, and act on misconception intelligence.

---

## Quick start

```bash
git clone https://github.com/Collinlar/my-tuta-companion.git
cd my-tuta-companion
npm install
cp .env.example .env          # fill in GROQ_API_KEY at minimum
npm run dev                   # http://localhost:5000
```

### Required env vars (local dev)

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Server-side Groq key — proxied via `/api/groq`, never exposed to the browser |
| `VITE_SUPABASE_URL` | Supabase project URL (optional — falls back to hard-coded dev project) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (optional with above) |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key for the credit purchase popup |
| `PAYSTACK_SECRET_KEY` | Server-side Paystack secret for `/api/paystack-verify` |
| `SUPABASE_SERVICE_ROLE_KEY` | Grants credits after payment verification |

See `.env.example` for the full list. See `.env.staging.example` for staging.

---

## Architecture overview

```
src/
  main.tsx                 Entry — mounts React, installs global error handlers
  App.tsx                  Router — public pages, app shell, admin panel
  mytuta/
    AppShell.tsx           Authenticated shell: side rail, header, mobile nav
    student/               Student views: Home, Learn, Solve, Lab, Challenges, Progress
    teacher/               Teacher views: Home, Experiences, Classes, Assessments, Insights
    intelligence/          NBA engine: NextActionCard, learner model hooks
    data/                  Shared React Query hooks and mutations
    credits/               CreditGate provider and wallet
  admin/                   Full admin panel (users, payments, AI ops, support)
  components/              Shared UI: ErrorBoundary, ProtectedRoute
  lib/
    monitoring.ts          Error + RPC monitoring (Sentry-compatible, Supabase fallback)
    analytics.ts           GA4 event wrappers

api/
  groq.ts                  Vercel serverless — proxies Groq requests server-side
  paystack-verify.ts       Vercel serverless — verifies payments, grants credits

supabase/migrations/       Ordered migration files (apply with supabase db push)
```

### AI architecture — Retrieve → Compose → Adapt → Generate

`src/mytuta/data/pathBuilder.ts` builds every Mastery Path in four steps:

1. **Retrieve** — fetch approved `content_units` for the concept, filtered by `review_status`
2. **Compose** — assemble into the standard 10-stage structure
3. **Adapt** — apply `adaptation_rules` per unit (skip/boost based on `support_level`)
4. **Generate** — call Groq only when fewer than 3 approved units exist for a stage

Open concepts (not in the DB) get a provisional AI-generated path with a transparency notice.

### Intelligence layer

`next_best_action()` (Supabase RPC) fires on every Home load and returns one primary action plus up to three alternatives, prioritised:

| Priority | Signal | Condition |
|----------|--------|-----------|
| 0 | `prerequisite_gap` | Active path < 30% and a prerequisite is not Secure |
| 0b | `decay_review` | Mastery decayed within 14 days |
| 0c | `explanation_weak` | Same explanation unit failed 3+ times in 30 days |
| 1 | `assignment` | Teacher assignment due within 5 days |
| 2 | `continue` | Unfinished active Mastery Path |
| 3 | `recall` | Recall cards due today |
| 4 | `misconception` | Same mistake category 3+ times in 30 days |
| 5 | `goal` | Active student goal |
| 6 | `challenge` | Secure/Mastered concept + unsubmitted platform challenge |
| — | `start` / `explore` | Fallback |

---

## Database — key tables

| Table | Purpose |
|-------|---------|
| `concepts` | 100+ STEM concepts (Mathematics, Biology, Chemistry, Physics) |
| `concept_relationships` | Typed prerequisite/extension/lab/challenge graph |
| `content_units` | Modular learning content with adaptation rules and review workflow |
| `mastery_paths` | Per-student per-concept journey with stage progress |
| `mastery_profiles` | Per-student per-concept skill dimensions + forgetting curve state |
| `lab_activities` | 40+ practical activities across all subjects |
| `challenges` | Platform-level STEM challenges with scope and recurrence |
| `teacher_interventions` | AI-drafted teacher interventions with follow-up tracking |
| `intervention_templates` | Reusable intervention blueprints |
| `rpc_error_log` | Slow/failed RPC events (Phase 7 monitoring) |
| `frontend_error_log` | Uncaught JS exceptions from ErrorBoundary (Phase 7 monitoring) |

Apply migrations in order: `supabase db push` or run each `.sql` file via the Supabase SQL editor.

---

## Testing

```bash
npm run test:run    # vitest run — 50 tests across 8 suites
npm test            # vitest watch mode
```

Test files live in `src/__tests__/`. Each PRD phase has its own suite.

---

## Environment separation

| Environment | Vercel target | Supabase project | Paystack keys |
|-------------|--------------|-----------------|---------------|
| Production  | `main` branch | prod project | Live keys |
| Staging     | Preview deployments | Separate staging project | Test keys |
| Local dev   | `npm run dev` | Dev project or prod (read-only) | Test keys |

Set staging vars in Vercel's **Preview** environment scope. Never use production DB or live Paystack keys in staging.

---

## Error monitoring (Phase 7)

`src/lib/monitoring.ts` provides:

- **`captureException(error, context)`** — routes to Sentry if `window.Sentry` is initialised, otherwise writes to `frontend_error_log` via Supabase RPC
- **`trackedRpc(name, call)`** — wraps any Supabase RPC call; logs failures and calls slower than 3 s to `rpc_error_log`
- **`installGlobalErrorHandlers()`** — called once in `main.tsx`; catches `unhandledrejection` and `window.onerror`

To activate Sentry: `npm install @sentry/react`, add `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })` to `main.tsx` before `installGlobalErrorHandlers()`.

Admin AI Ops panel queries `rpc_error_log` and the `rpc_slow_summary` view.

---

## Deployment

```bash
# Production — push to main; Vercel deploys automatically
git push origin main

# Manual build check
npm run build
```

`vercel.json` configures rewrites (SPA fallback), security headers, and asset caching. `VITE_APP_RELEASE` is automatically set to `VERCEL_GIT_COMMIT_SHA` by Vercel for release tagging in error logs.

---

*mytuta Platform Evolution — 7 phases complete. Built for Ghana, designed for Africa.*
