# Concept Competency Framework: status and continuation plan

Reviewed: 2 November 2026. Baseline: `96360de`.
Source requirements: `C:/Users/dell/Downloads/mytuta_Concept_Competency_Framework_PRD.md`.

This file retains the original audit below and records implementation progress at the end. The initial audit was read-only; the subsequent continuation changed application code and applied the targeted database migrations 0020–0023. The frontend changes are local and have not been deployed to hosting.

**Current status:** the Foundation infrastructure and initial prerequisite deferral are implemented. The live database has 74 draft Foundation blocks and 131 draft competencies across the ten flagship concepts. None are published. Academic review, browser acceptance, fuller example selection/routing, type-template expansion and Applied/Advanced journey content remain outstanding. The MVP is not declared complete.

## What exists

| Implementation stage | Evidence | Current scope |
| --- | --- | --- |
| Phase 0: schema and authoring | `f7d7c6b`; migrations 0015–0016 | Nine concept types, primary and secondary types, per-depth competencies, admin CRUD, audit logging. |
| Phase 1: Foundation blocks | `5fe0782`; migrations 0017–0018 | Nine ordered templates, AI content generation, block table, admin generation/list, student block runner, contextual text support, optional MCQs. |
| Phase 2: initial completeness gate | `1b95479`; migration 0019 | Block evidence persistence, coverage-based Foundation gate, completion feedback. |
| Latest commit | `96360de` | Supabase CLI dependency and local project linkage metadata; no further framework behavior. |

Key files: `src/mytuta/data/{competency,blocks,ai,depth,queries,mutations}.ts`, `src/mytuta/student/KnowledgeBlocks.tsx`, `src/mytuta/student/Learn.tsx`, `src/admin/CompetencyPanel.tsx`.

Concepts with blocks use the block runner inside the existing Understand stage. Concepts without blocks retain the previous experience. The whole Foundation journey has not been restructured around the PRD flow.

The schema intentionally uses `concept_type` rather than `primary_concept_type`. Migration 0015 describes required competencies as the intended completeness definition instead of adding separate depth completion-definition columns. However, the current completion engine does not evaluate those competencies yet.

## Incomplete requirements and concrete gaps

1. **Completion measures coverage rather than demonstrated competence.** `computeFoundationCompleteness` accepts a score-derived state, required block IDs, and covered IDs. It does not evaluate required competencies, unresolved misconceptions, basic application evidence, or prerequisite readiness. The PRD's `blocked_by_prerequisite` outcome is absent. The 70% coverage reinforcement threshold is an implementation choice, not a PRD rule.
2. **Quick checks can be bypassed.** The runner offers “Mark understood and continue” before a correct response, including after a wrong response. This records passing block evidence. Incorrect attempts are only local state, not persisted failure evidence. Coverage queries also do not filter on evidence score.
3. **Review/publishing is unfinished.** Blocks are generated as drafts, but the student query and read policy expose all review statuses. The admin panel lists blocks but has no block content editor or approve/publish controls. Competency review controls do exist.
4. **Content identity is unstable.** Regeneration deletes and reinserts the block set, producing new IDs. Existing learner evidence points to old IDs and no longer counts toward the replacement set. Versioning needs explicit semantics.
5. **Persistence needs hardening.** Block evidence writes and completion writes do not inspect Supabase errors. Block evidence writes are not awaited by the runner, and the evidence query cache is not invalidated. Restored coverage only initializes component state once, so late-arriving query data may not restore progress. Only understood coverage persists; other block states do not.
6. **Completion and readiness are not one decision.** The completion screen suppresses progression when coverage is incomplete, but persisted readiness is still computed from scores independently of the final gated state. Align all progression entry points with the authoritative result.
7. **Prerequisite-aware examples are not implemented.** No block prerequisite entity, example-to-block/competency mapping, or concept/skill/formula/representation eligibility checks were found. Existing concept relationships can be reused as a starting point.
8. **Generation is only partially constrained.** Templates fix block order/type, but generation can proceed with no authored competencies, inferring them only in the prompt. Prerequisite maps, evidence requirements and misconception structure are not mandatory inputs. Generated content is cast into types without structural validation, and missing content receives placeholder text.
9. **MVP content rollout is unverified.** No framework seed for the ten flagship concepts was found. Admin-authored remote content may exist; repository linkage metadata does not prove migrations were applied or content published.
10. **Remaining product scope:** competency-driven Applied/Advanced journeys, real visual assets, analogy boundaries, richer check formats, block/modality analytics, targeted misconception/prerequisite repair, and adaptive sequencing. Some belong to the PRD's later phases.

## Existing continuation intent

Commit messages describe implementation Phases 0–2. Migration 0017 explicitly names prerequisite gating of blocks/examples as implementation Phase 3 and suggests Density as the first rollout concept. No dedicated competency-framework roadmap was found in the repository. The existing Mastery Depth academic checklist predates this work and is not a complete continuation plan for this PRD.

Implementation phase numbering differs from the PRD's MVP / Phase 2 / Phase 3 release scope.

## Proposed work order

### 1. Verify deployment and establish a reliable pilot

- Read the connected database's migration history and confirm migrations 0015–0019 and admin RPCs exist; do not infer deployment from CLI linkage.
- Inventory competencies, block counts, review states, and existing evidence for the ten flagship concepts.
- Use Density as the first end-to-end pilot, then Solar System to validate a structural concept without irrelevant mathematics.

Exit: known deployed baseline and a clear content inventory.

### 2. Finish the current Foundation implementation

- Separate viewed/self-reported understanding from passed checks; persist wrong answers and needs-review state.
- Handle evidence write failures, await required saves, refresh caches, and restore asynchronously loaded state.
- Add block editing, preview, approval, publishing, and student publication filtering.
- Preserve stable block identity with explicit versions; validate generated content before saving or publishing.
- Add regression tests for failed checks, retries, save failures, resume, publication filtering, regeneration and coverage boundaries.

Exit: reviewed pilot content, reliable resume, and no failed check counted as passing evidence.

### 3. Implement evidence-based Foundation completeness

- Link blocks/checks/examples to stable competency IDs and define evidence requirements.
- Evaluate all mandatory dimensions, misconception resolution, basic application, and prerequisite state.
- Centralize completion and progression in a database transaction/RPC, returning secure, secure with reinforcement, developing, or blocked by prerequisite.
- Ensure readiness, completion cards, next-depth entry points and progress rollups agree.

Exit: a high end score or self-reported coverage cannot secure Foundation without required evidence.

### 4. Build prerequisite-aware examples and repair

- Store block/example concept, skill, formula and representation prerequisites.
- Filter examples using learner state; choose simpler examples, offer refreshers, or defer when needed.
- Attribute prerequisite failures to the missing skill rather than the current concept.
- Start Foundation examples with recognition/classification, relationships and simple application.

Exit: the Solar System example cannot require scientific notation without verifying it or offering appropriate support.

### 5. Complete the ten-concept MVP

- Author and academically review Fractions, Ratios, Percentages, Linear Equations, Graph Interpretation, Photosynthesis, Density, Forces, Electricity and Solar System.
- Supply competencies at all appropriate depths, Foundation blocks, checks, prerequisites, examples and completeness rules.
- Verify the complete student journey and teacher/admin review flow for each concept; enable depths only when suitable content exists.

Exit: a concept-by-concept acceptance matrix demonstrates the PRD section 39 scope.

### 6. Extend after MVP acceptance

Build competency-driven Applied/Advanced journeys, richer visuals and support, modality outcome tracking, Lab links, adaptive sequencing and teacher insights according to the PRD release phases.

## Validation

- Existing suite: 8 test files, 50 tests passed.
- No dedicated framework tests were found for completeness, generation or the block runner.
- Production build: passed. Vite reported bundle-size and mixed static/dynamic import warnings, plus outdated Browserslist data.
- No live database or browser acceptance testing was performed.

## Implementation progress — continuation

### Deployment verified

- Direct schema inspection confirmed that framework tables and admin RPCs already existed, despite missing migration-history entries. The original remote Density content was ten draft blocks without authored competencies.
- Applied only targeted migrations 0020–0023 using `supabase db query --linked --file`; no blanket database push or migration-history repair was performed.
- Migration runners now include the new files. Direct SQL execution does not populate Supabase's migration ledger; the deployment method and history divergence remain documented rather than silently repaired.
- Frontend changes are in the workspace; no hosting deployment was performed.

### Foundation implementation

- Removed self-certification of failed checks. Correctness is now checked in `record_knowledge_block_evidence` against the published block/version; direct client inserts of block evidence are disallowed.
- Block completion awaits durable saves and exposes retryable failures. Async coverage is restored, required counts exclude optional blocks, and content revision changes reset stale UI/cache state.
- Admins can edit/preview teaching content, support modes and checks, and approve/publish blocks. Student queries and RLS only expose published content. Draft generation validates content, requires authored competencies and keeps stable block IDs; published sets cannot be casually regenerated.
- Server validation rejects malformed checks, unknown competency keys and malformed prerequisite references. Content revisions increment block versions; previous-version evidence no longer proves the current version. Draft-only authoring preserves the existing score-based path; the new gate activates when reviewed Foundation blocks are published for that concept.
- `save_foundation_result` atomically evaluates required block coverage, published required competency mappings, passed application/check evidence, unresolved misconceptions and prerequisite readiness, then writes depth state, evidence and retention scheduling.
- Missing prerequisites yield `blocked_by_prerequisite`. Viewed blocks count as coverage but do not prove competencies. High end scores cannot rescue missing evidence.
- Incomplete Foundation results do not update the legacy headline mastery profile. Save failures are surfaced with retry. Starting a deeper depth requires the previous depth to be secure.

### Initial prerequisite routing

- Versioned block content can declare concept, skill, formula or representation prerequisites, with learner-facing labels and optional refresher text.
- The server checks prerequisite evidence before recording any attempt. The student runner defers blocked blocks, shows the gap/refresher and offers concept-review links or other blocks.
- This is initial deferral, not the PRD's full ranked example engine. Alternative-example selection, skill repair assessments and recent-error/support-aware ranking remain future work. Pilot examples intentionally use simple recognition/relationship/application checks and do not depend on unrelated advanced mathematics.

### Earlier draft content inventory (superseded below)

| Concept slug | Foundation blocks | Competencies across three depths | Published blocks |
| --- | ---: | ---: | ---: |
| density | 10 | 14 | 0 |
| space-solar-system | 11 | 16 | 0 |
| fractions | 6 | 12 | 0 |
| ratios-proportion | 6 | 12 | 0 |
| percentages | 6 | 12 | 0 |
| linear-equations | 7 | 13 | 0 |
| graphs-interpretation | 7 | 13 | 0 |
| photosynthesis | 7 | 13 | 0 |
| forces | 7 | 13 | 0 |
| electricity | 7 | 13 | 0 |
| **Total** | **74** | **131** | **0** |

Draft source: `supabase/competency_pilot_drafts.json`, generated by `supabase/build_competency_pilot_seed.py` into migration 0022. Draft updates preserve IDs and reviewed content; repeat application does not revise unchanged blocks. The eight additional concepts have compact competency-aligned journeys, not every block from their full concept-type templates. Treat this as an authoring starting point, not final curriculum coverage or academic approval.

### Previous next steps (superseded by November 2 continuation below)

1. Review Density and Solar System in Admin → Concepts → Competencies. Edit wording, check distractors, confirm mappings and prerequisite choices, publish the reviewed competencies, then publish the reviewed blocks. Repeat for the other eight concepts after expanding their full concept-type coverage.
2. Perform browser acceptance: failed check, retry, reload/resume, draft visibility, changed-version behavior, missing prerequisite, complete Foundation and blocked Applied progression. Database regression fixtures cover these rules where feasible, but do not replace an authenticated browser walkthrough.
3. Expand example eligibility into ranked alternative selection, explicit skill repair and formula/representation support.
4. Author and review competency-driven Applied/Advanced journeys, visual assets and required later-phase analytics/adaptation. The existing higher-depth ceiling settings have not been changed or represented as newly reviewed content.
5. Reconcile migration history separately after checking the full existing deployment; do not blindly mark unmatched historical migrations as applied.

### Validation during continuation

- Existing suite plus first five new tests: 9 files, 55 tests passed.
- All six new block tests passed, including prerequisite deferral, failed saves and asynchronous resume (50 existing tests plus six new tests).
- Rollback-only live database assertions passed for score-only rejection, failed attempts, complete evidence, low scores, unpublished competencies, reading-only application evidence, content-version invalidation, prerequisite blocking, student draft visibility and rejection of forged block evidence.
- Production build passed after the application changes, with existing bundle/import/Browserslist warnings.
- Repository-wide TypeScript checking remains failing in legacy areas. No errors were reported in the new block editor, validator, runner, tests or the modified Foundation completion/generation code in the latest check.
- No frontend hosting deployment or authenticated browser acceptance was performed.

## Pilot review follow-up

- Added a safe whole-journey admin preview for unpublished blocks.
- Reviewed Density/Solar System against NASA and OpenStax; corrected dwarf-planet wording, varied answer positions, and added accessible mass-volume and planet-order diagrams.
- Updated the unpublished database drafts; no content was published.
- Confirmed the signed-in local admin route, competency panel and initial Density journey preview in the browser.
- Browser automation stopped when the runtime could not identify the current URL confidently enough to enforce policy. Full student acceptance and production deployment remain pending.
- See `PILOT_RELEASE_REVIEW.md` for the acceptance evidence and release sequence.

- Final build and all eight targeted block/diagram tests passed. Draft PR upload to the public GitHub repository was rejected by automatic approval review pending explicit source-publication authorization. No PR, production deployment or content publication occurred. See `PILOT_RELEASE_REVIEW.md` and the local review bundle.

## November 2 continuation: block runtime and depth journeys

Implemented the remaining prioritized runtime and authoring work:

- Persisted current-version block states, visible learning time and support requests; server-graded checks restore after reload and a later failure revokes current coverage.
- Ranked eligible alternative examples with paired assessments; authored skill, formula and representation refreshers have assessed repair, without counting repair as concept mastery.
- Added complete eight-block Applied and Advanced journeys for each flagship, with independent responses, rubrics, teacher review, revision feedback and server-enforced depth completion.
- Added teacher review queues and class-scoped block summaries, admin block/modality analytics, weak-block recommendations and observed successful-modality suggestions.
- Added spoken explanations, ten concept diagrams and interactive Density, Solar System and circuit controls.
- Added generation/preview at each depth and atomic whole-journey publication after structural, mapping and review checks. Individual draft blocks cannot bypass this gate.
- Completed missing Foundation block types and assessments in the eight compact draft journeys. The authoring pack now contains 104 Foundation blocks, 80 Applied blocks and 80 Advanced blocks, with 161 competencies. These are draft content counts, not academic approval.

Migrations 0024–0032 are applied individually to the linked pilot database. The historical migration ledger remains divergent; do not run blanket `db push` or mark unrelated migrations as applied.

Still required before release: human academic review of all new draft content, authenticated browser acceptance across student/admin/teacher flows, deployment and controlled publication. Content remains unpublished. Public source upload remains unauthorized; local commits only.

Later PRD expansion remains separate: more concepts, generated audio/visual media, explicit curriculum mappings, school-wide competency analytics, and broader adaptive sequencing. The new weak-block routing and class insights provide initial support, not completion of every Phase 3 item.

Validation: rollback-only runtime and atomic-publication tests passed. An earlier full JavaScript run passed 68 tests; later final runs encountered worker startup stalls and are recorded separately in the release review. Repository-wide TypeScript errors in legacy areas remain a release consideration.

Final focused reruns passed 26 checks across runtime components, existing block/diagram tests and pure authoring/recommendation/audio helpers. The final production build and whitespace checks passed. Live inventory verified the draft counts above and zero published blocks. See the release review for the complete-suite worker timeout and outstanding browser acceptance.

## Further continuation: curriculum, class coverage and media drafts

- Added an Admin → Concept → Curriculum tab with competency alignments, curriculum versions, grade/year, standard codes, descriptions, HTTPS source references and draft/approved status. Approval records reviewer attribution. No unverified curriculum alignments were seeded.
- Added teacher competency coverage for the selected class or all of the teacher's classes. Counts use current published blocks, latest evidence and review status; duplicate class enrollment is deduplicated. Unrelated classes are rejected server-side.
- Expanded adaptive next-block navigation to prioritize observed difficulty and revision feedback, resume started work and preserve authored order for new material. Covered blocks, unmet prerequisites, optional blocks and pending responses are excluded from automatic selection.
- Added generated narration scripts and supported-diagram guidance in the block editor. Generated support resets the editor to draft and requires saving/review. Learner audio uses the narration script, with the original written text as fallback. Alternative examples do not inherit an unrelated narration script.
- Added server validation for narration, diagram captions and observation prompts. The implementation selects from the supported visual catalogue; generating new raster images or downloadable audio files remains a separate media-provider integration.
- Per the user's decision, school-level analytics and a school directory are deferred. The temporary empty school schema introduced during exploration was removed; the final implementation stays at teacher/class level.

Migrations 0033 (curriculum mappings), 0034 (class competency analytics) and 0035 (media contract/review attribution) are targeted additions. The full JavaScript suite passed 83 tests across 14 files using one reusable worker after fixing explicit DOM cleanup between files.

Remaining release work: academic approval, authored curriculum mappings against chosen source documents, authenticated student/teacher/admin acceptance and deployment/controlled publication. Additional concept packs and externally generated media assets remain future content/integration work; school analytics remains deferred by request.
