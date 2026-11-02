# Density and Solar System pilot: release review

Reviewed 2 November 2026. Status: prepared for review; not released to students.

## Content review

The pilot has ten Density blocks and eleven Solar System blocks. Required Foundation competencies are mapped to checks. Drafts are still unpublished; the automated content review is not a human academic sign-off.

Corrections made during this review:

- Varied correct-answer positions instead of putting every answer first.
- Added a mass-volume graph with labelled axes, units and two materials, plus an accessible text description.
- Added a labelled Solar System model with the correct planet order/categories and an explicit warning that sizes and distances are not to scale.
- Clarified that a dwarf planet is not a moon.
- Added an admin preview of the complete draft Foundation journey. Preview answers do not write learner evidence or publish content.

Source checks: [OpenStax density](https://openstax.org/books/college-physics-2e/pages/11-2-density), [NASA planet categories](https://science.nasa.gov/solar-system/planets/), and [NASA planet/dwarf-planet definition](https://science.nasa.gov/solar-system/planets/what-is-a-planet/). The diagrams are locally authored illustrations rather than copies of source graphics.

## Acceptance evidence

| Check | Result |
| --- | --- |
| Signed-in local admin route | Density loaded with Super Admin access |
| Competency inventory | Eight Density Foundation competencies and ten blocks visible |
| Draft journey preview | Density's complete navigation, teaching content and first check rendered in the browser |
| Failed check, retry, durable-save wait and failed save | Covered by component regression tests |
| Prerequisite deferral and asynchronous coverage restore | Covered by component regression tests |
| Actual server grading, version invalidation and Foundation gate | Covered by rollback-only database assertions |
| Student draft visibility and forged block evidence | Covered by authenticated-role database assertions |
| New diagrams | Accessible labels and units covered by component tests |
| Full live student walkthrough, including reload and progression | Incomplete: browser runtime stopped because it could not identify the current URL confidently enough to enforce policy |
| Human academic approval | Pending; draft statuses were preserved |

## Release sequence

1. Review the code and finish authenticated browser acceptance for both pilots.
2. Deploy the frontend while the content remains unpublished.
3. Have the academic reviewer inspect the draft journeys, competency/check mappings, distractors, vocabulary, diagrams and prerequisite choices.
4. Approve the required competencies and blocks, then use the whole-journey publication action for each reviewed depth. Applied/Advanced drafts require their own academic approval.
5. Verify the deployed student flow and monitor save failures before expanding the rollout.

The local GitHub CLI token is invalid, but the connected GitHub app has repository access. The remote main branch matched the local baseline `96360de` at the time of review. Both Vercel and Netlify configuration files exist; README describes a main-branch deployment, while the existing Netlify project tab requires login. Production hosting was not changed without completing acceptance.

## Final checks and release blocker

- Production build passed after the preview and diagram changes.
- Full existing/component suite passed 56 tests before the two diagram assertions were added; the final targeted block/diagram suite passed all eight tests (50 existing plus eight framework tests).
- No frontend deployment or content publication occurred.
- A draft PR was prepared for `Collinlar/my-tuta-companion`, but automatic approval review rejected the source upload because the repository is public and the user had not specifically authorized publishing this source and draft/database content there. No branch or pull request was created by this attempt.
- Approval is required to upload the 25 reviewed implementation files to that public repository. A local review bundle and SHA-256 manifest identify the exact files; no environment files, credentials or database learner records are included.

## November 2 continuation handoff

The implementation now includes persistent block learning, prerequisite repair, ranked examples, teacher-reviewed independent tasks, complete higher-depth draft journeys, ten diagrams, spoken explanations, class insights, block analytics and weak-block reinforcement. Atomic publication validates review status, required block types and competency mappings before releasing a depth.

The new draft inventory is 264 blocks across ten concepts (104 Foundation, 80 Applied, 80 Advanced), with 161 competencies. No new content was published. The previous review bundle represents the earlier commit and does not include this continuation.

Targeted migrations 0024–0032 were applied to the linked pilot database; historical ledger reconciliation remains separate. Runtime regression fixtures cover alternative eligibility, assessed repair attribution, failed evidence, task submission, reviewer authorization and depth gating. Publication fixtures cover unreviewed content, incomplete structure, individual-block bypass and atomic publication. Both suites roll back their fixture changes.

An earlier full component suite passed 68 tests. Subsequent final runs stalled while starting test workers, so the newest additions must not be represented as a fully green final suite without a completed rerun. Full authenticated browser acceptance is still pending; prior browser checks only covered the local admin panel and initial draft preview.

Final focused reruns succeeded: 10 runtime component tests, eight existing block/diagram tests, and eight pure-helper/authoring tests (26 checks across separate runs). The production build passed after the final depth-routing fixes. `git diff --check` passed. A fresh complete-suite result remains unavailable because separate-worker startup timed out; this is distinct from the passing focused results. Live inventory confirms 104/80/80 blocks by depth, 161 competencies and zero published blocks.

Release remains pending human academic approval, completed browser acceptance and frontend deployment. User authorization is for local commits; no public upload, push or deployment is authorized by this handoff.
