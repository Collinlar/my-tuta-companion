# Mastery Depth: Academic Team Checklist

**Who this is for:** the academic / content team configuring and authoring Mastery Depth.
**What it covers:** everything that is *not* code. The depth engine is built, tested, and live. What it needs now is content and configuration, concept by concept.

---

## The model in one paragraph

Every concept progresses through up to three depths plus a retention layer:

- **Foundation** ("Understand it") — the core concept. This is what most concepts already have.
- **Applied** ("Use it") — the concept in realistic, multi-step problems and hands-on work.
- **Advanced** ("Handle complexity") — transfer, edge cases, and higher-order reasoning.
- **Retention** — spaced checks that keep a secured depth from fading.

A learner secures one depth to unlock the next. A concept only offers depths up to its **`max_depth`**. The default `max_depth` is `foundation`, so **a concept shows no Applied or Advanced until the academic team raises its ceiling and supplies the content.** Today only **Fractions** is set to `applied`. Everything else is Foundation-only.

---

## Per-concept checklist

Run this for each concept you want to take beyond Foundation. Start with your highest-traffic concepts.

### 1. Decide the depth ceiling
- [ ] Choose the concept's **`max_depth`**: `foundation`, `applied`, or `advanced`.
- [ ] Only promise a depth you can supply content for. A concept set to `advanced` with no Advanced content will show "Start Advanced" and then have nothing to run.

### 2. Set it in the admin panel (no SQL needed)
- [ ] Go to **Admin → Concepts → [the concept] → Mastery depth → Set depth**.
- [ ] Set `max_depth` and the **Retention** toggle. The system derives the depth sequence automatically.
- [ ] Every change is audited (you enter a reason), so there is a record of who set what and why.

### 3. Author the content for each depth you enabled
The stage runner (diagnostic, teaching, practice, mastery check) is reused per depth and the first draft of each depth's stages is AI-generated, but **the quality of each depth depends on the items and materials you provide and review:**

- [ ] **Foundation** — confirm the existing core content is solid (most concepts already have this).
- [ ] **Applied** — supply application and transfer problems: multi-step, realistic, Ghana-context word problems. Review the generated Applied stages and correct them.
- [ ] **Advanced** — supply harder problems: edge cases, combined concepts, higher-order reasoning. Review the generated Advanced stages.

### 4. Add a Lab for Applied (optional but recommended)
A hands-on lab both gives the learner **Applied-depth evidence** and powers the "Try the [lab] lab" recommendation on their home screen.
- [ ] Create a lab in the **same subject** as the concept.
- [ ] Make sure the concept's name or slug appears in the lab's **title, slug, or "demonstrates" field** (this is how the recommendation matches a lab to a concept, since there is no explicit link). Example: concept *Density* matches lab *"Density Investigation"*.

### 5. Add a Challenge for Advanced (optional but recommended)
- [ ] Create a challenge that exercises the concept. Completing it contributes **Advanced-depth evidence** and is recommended once the learner is strong.

### 6. Turn on Retention (for concepts worth keeping sharp)
- [ ] Enable **Retention** in the Set depth modal (step 2) for concepts that fade without review.
- [ ] Once on, the system schedules adaptive spaced checks automatically after a depth is secured. No further setup.

---

## Cross-concept setup (do once, then maintain)

### Prerequisites
- [ ] Define prerequisite relationships between concepts (e.g. *Fractions* is a prerequisite of *Algebraic Expressions*).
- [ ] This powers the "Learn X first" guidance when a learner starts a concept they are not ready for.

### Clusters
- [ ] Go to **Admin → Clusters** to group related concepts into a named skill (e.g. *Number and Proportion* = Fractions, Decimals, Percentages, Ratio).
- [ ] Create / rename / delete clusters and manage their members from this page (audited).
- [ ] A learner's cluster depth is derived automatically: the cluster reaches a depth when **every** member is secure at that depth. You do not award cluster depth directly.

---

## Rollout order (suggested)

1. **Pick 5 to 10 flagship concepts** (highest learner traffic, clearest progression).
2. For each: set `max_depth = applied`, author Applied content, add a matching Lab, enable Retention.
3. Add prerequisites between them and group them into 1 to 2 clusters.
4. QA: sign in as a test student, secure Foundation, confirm Applied opens and runs, confirm the retention check and the "Go deeper" prompt appear.
5. Only then extend the strongest concepts to `advanced` with Advanced content and Challenges.
6. Repeat in batches. Leave the rest at `foundation` until their content is ready, so learners never hit an empty depth.

---

## What "done" looks like for one concept

- [ ] `max_depth` set correctly in the admin panel
- [ ] Foundation content reviewed
- [ ] Applied content authored and reviewed (if `max_depth >= applied`)
- [ ] Advanced content authored and reviewed (if `max_depth = advanced`)
- [ ] A matching Lab exists (for Applied)
- [ ] A Challenge exists (for Advanced)
- [ ] Retention enabled if the concept warrants it
- [ ] Prerequisites defined
- [ ] Added to the right cluster
- [ ] QA walkthrough passed as a test student

---

## What the team does *not* need to do

- No code changes. All of the above is admin-panel configuration plus content authoring.
- No database / SQL work. The "Set depth" modal and the Clusters page handle the data safely and keep an audit trail.
- No manual scheduling of retention. The engine handles the spaced intervals once Retention is on.

---

*The depth engine (progression, Next-Best-Action recommendations, retention scheduling, clusters, teacher and admin views) is complete and verified. The ceiling on how much of it learners experience is content and configuration, which is this checklist.*
