---
domain: recruiting
subject: adverse-impact-and-proxy-neutrality
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# adverse-impact-and-proxy-neutrality

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-aipn-0926)

The Curator lane dispatched this run on the finding "never swept by the
librarian", with registry HEAD 55c6bce2 at dispatch. It worked from origin/main
f358426b in a detached worktree. It read the one joined consumer, kp, at
a7340185d and again after its own commit, 3aae8e801 (Node 24, Python 3.12).

**Depth rung: L3.** Both flips were measured on kp's own primitive, and the
mutation claim was reproduced on kp's tree. L2 primary sources supplied the
conditions:
- the federal regulation text and its Q&A;
- a municipal hiring-audit FAQ;
- the statute;
- the applied-psychology literature on adverse-impact tests;
- a 2010 practitioner technical advisory report;
- audit-study and model-bias papers.

**Lanes:**
- a counter-evidence lane on the web, unconstrained, eight claims;
- a blind training-data lane, nine questions;
- arithmetic;
- the consumer tree.

**Counter-evidence: two absolutes refuted, the rest conditioned or confirmed.**
- **Refuted: "at least five selected in each compared group".** All three
  lanes plus arithmetic agree. It conditions on the outcome and hides the group
  nobody selected: 0/100 against 50/100 is p ≈ 1e-19. The classical condition
  is about expected counts.
- **Refuted: "believe the shortfall".** All three lanes plus arithmetic agree.
  Shortfall is scale-bound like a p-value. A 2010 practitioner report records
  that its statistics group "was skeptical of the shortfall as a useful measure
  of practical significance". At 40 short of 100,000, p = 0.86.
- **Conditioned:**
  - The significance test: mid-P or an unconditional exact test, because the
    conditional exact test is conservative (web and blind).
  - A multiple-comparison correction, fixed in policy (web and blind).
  - The rule's own wording is "may not constitute", not "does not establish"
    (web, verbatim from the regulation).
  - Inference: never attached to people. Aggregate-only bounds are the narrow
    practice elsewhere, and a municipal regime forbids inferred data outright
    (web and blind).
  - A name is a bundle of signals, so a group needs several names (web and
    blind).
  - Dialect is a proxy that needs no name (web and blind).
- **Updated, dated:** the federal enforcement posture went from softened to
  withdrawn, as of 2026-09. An April 2025 executive order and September 2025
  charge closures are the evidence, and a proposal to rescind the interpretive
  guidance is projected for November 2026. The statute and private claims are
  unchanged. This is regulatory, so it should be re-checked within 12 months,
  and sooner if the rescission is finalized.
- **Verified and left untouched:**
  - the four-fifths text and its age (1972 state guideline, 1978 federal);
  - per-gate over bottom line (the blind lane cites the 1982 bottom-line case);
  - the ±18-point interval at n = 30;
  - highest-rate reference with sub-floor exclusion (web: the federal Q&A and
    the municipal "most selected category");
  - the municipal 2% exclusion;
  - no codified floor of 30;
  - the three-state verdict and the cohort shield technique.

**Convergence.** The blind lane reached both refutations independently: "it
conditions on the outcome", and "a large shortfall is not always meaningful".
It also reached mid-P, several names per group, and aggregate-only proxy
estimation.

**Tree lane.** All three applications were re-read. Line references in the
node files had all moved. kp had grown three things since 2026-08-20:
- a neutrality registry that discovers 41 candidate-typed functions;
- a registry-derived archetype shield with a live union reader, which now
  covers career-changers;
- an index-tracked reference and an exactly-three-fields parse in the
  adverse-impact primitive.

The registry's planted-mutation claim was reproduced by hand: three suites (38
tests) stay green under a gender-marked-surname penalty, and the registry
flags two ranking functions.

**Landed** (744db88f):
- two flipped rules, one on minimum-cohort and one on selection-rate;
- five conditions across the golden path and two techniques;
- one widening on the perturbation technique: the suite covers the inventory
  and is proven able to fail. It came from the tree lane and was measured;
- three new failure modes in the golden path;
- all three applications re-verified to 2026-09-26, the node ones with
  `verified_against: node@24`.

No new technique was added: the one tree-only widening sits in an existing
technique with its measured case.

**Applied** (5 rows in [[applied]]):
- code, better: kp 3aae8e801, the mid-P test, shortfall and four-state verdict,
  plus two headline defects (the "no group reaches 30" line when one did, and a
  mixed report silent on its unassessed groups);
- simulation, better: the expected-count floor, one of three decisions moves;
- experiment, better: the planted mutation, reproduced;
- two unapplied: several names per group, and aggregate-only inference.

## Impact

kp has 5 contexts paired with this subject: group-eval-comparison,
group-eval-shared, jobs-candidates-compare, screening-fairness and
tests-scoring-fairness. None has been judged, so 0 verdicts went stale. The map
was regenerated in kp 69645cad6, committed and not pushed. kp's impact
table showed 19 stale verdicts, none of them on this subject.

## Owed to projects

For kp, recorded and not fixed:
- The neutrality registry proves only the deterministic fallback
  (`provider=None`). There is no distributional lane over the model path. That
  lane is where several names per group, repeated samples and randomised order
  would apply.
- No postcode, school, first-language, employment-gap or dialect axis is
  perturbed.
- A custom archetype's shield can be flipped at runtime by an operator with no
  audit record. A built-in's shield is locked.
- There is no shield for long-absence returners or non-linear-path profiles.
- The adverse-impact primitive uses a single α with no multiple-comparison
  policy. It is single-gate, and its results are unstamped (no gate, window or
  scoring version).

## Open leads

Each lead came from a single lane:
- **Reference-group changes between periods.** From the web lane: a practitioner
  committee said a shifting highest group "could be evidence". Log and report a
  change of reference across periods. Return when a second source agrees.
- **Simpson's paradox across requisitions.** From the blind lane: pool strata
  with a stratified test rather than summing counts. Return when a web or tree
  lane corroborates, or a project pools across requisitions.
- **Selection-rate and rejection-rate ratios disagree.** From the blind lane:
  the ratio is asymmetric. Return on a second lane.
- **Equivalence testing to claim "no name effect".** From the blind lane: a
  distributional lane uses equivalence testing (TOST) with a pre-declared
  smallest effect. Return when a project builds that lane.
- **A published resume-screening bias study's gender result is inverted** by a
  code bug, per the authors' repository notice of 2026-08-29. The race and
  intersectional results stand. The subject does not cite it. Keep this in mind
  if a later pass reaches for it.

## Declines

- **Naming the specific regulation, executive order or municipal law in upper
  layers.** The subject's voice keeps jurisdictions generic ("one well-known
  municipal regime"), and the dates carry the currency. Named citations belong
  in an application, if one is ever written for a regulatory stack.
