---
subject: reference-parity-gating
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# reference-parity-gating

First touch: 2026-08-31, an `/intake` run on a public browser-game repository whose
procedural vehicle rebuild program is gated against community reference models
([[../../sources/2026-08-31-claude-of-tanks-geometry-gate]]). Created by that run —
this is the subject's birth, not a sweep.

## State

New subject: 6 techniques, 3 applications (2 `process` from the source tree, 1 `node`
from a connected project's eval harness). Placed in `content-pipeline`, not
`asset-production`.

## Why it exists

Found by the enumeration hunt, not from the source. `generated-mesh-acceptance` declares
its own boundary in prose — perceptual judgment and "is this the right shape" are *"a
different subject"* — and nothing owned the other side. The bundle already had a quality
gate for motion (`motion-quality-gating`) and none for geometry measured against a
reference, which is the same gap seen as an asymmetry: two concerns that both read as
covered until you ask which one is actually *measured*.

The distinction the subject holds: a **health** gate asks whether an artifact is
well-formed and fails by rejecting good work; a **parity** gate asks whether it is the
thing it was supposed to be and fails by *accepting*, which is worse because the number is
quantitative and travels downstream as evidence.

## Placement

`asset-production` was the obvious home and is **wrong**: it sits at exactly 10 child
directories, the profile's hard cap, so an 11th subject there is a gate failure rather
than a preference. `content-pipeline` (6/10) is also correct on the merits — these are
parity-*measurement* techniques that transplant across asset types, which is the seam
between that category and the per-asset-type craft in `asset-production`. Checked against
`taxonomy.json`, not against a subject count.

## Boundaries stated, so a later run does not re-litigate them

- Well-formedness, import readiness, component shattering, face budgets →
  `generated-mesh-acceptance`. Runs first and cheaper.
- Craft and aesthetic verdicts on rendered output → the perceptual tier; this subject hands
  it a registered, measured artifact and stops.
- Verdict storage, staleness, rubric supersession → `quality-verdict-integrity`. That
  subject fully owns candidate-hash freezing, which this run caught as already-covered.
- Repair-versus-re-roll cost decisions → `regeneration-vs-repair-economics`.
- Setting the specification, budgets, world scale → `asset-class-poly-budgeting`,
  `generated-asset-world-scale`.

## Open

- `dual-anchor-scoring` carries a same-run `not-better` from a connected project's
  specification gate: a second anchor over the *same representation* is not a second
  authority. The amendment is in the technique. Return condition is that project's
  golden-output layer, which would supply a genuinely behavioural anchor.
- `instrument-blindness-register` has no `librarian/applied.md` row yet — landed same-run
  and the apply budget went to `dual-anchor-scoring`. It is the strongest remaining apply
  candidate in the subject, and the seam class is any gate whose witnesses all read one
  representation.
- Four of six techniques are unapplied. The subject's applications are 2/3 from the source
  tree, which is the thin-evidence shape a later sweep should widen.
- The corpus's L9 (`structural proof is necessary and never sufficient`) now has a measured
  0/12 negative behind it at *dimensional* parity, cited in
  `applications/process--dual-anchor-scoring.md`. If a second such measurement appears, the
  pair is law-altitude material about metric–perception divergence.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/reference-parity-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ee48cfdfb85749c1",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "If four of 100 samples have a severe defect and 96 have zero error, a common empirical p95 is zero.",
    "A repair alternating between two incompatible dimensional targets can keep emitting precise signed findings forever.",
    "A hollow and a solid object can have identical outer silhouettes and dimensions."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/content-pipeline/reference-parity-gating",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "reference-parity-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify dual anchors as sufficient correctness, translation-only alignment as universally mirror-blind, producer input categorically forbidden and no iteration cap. Scale and silhouette can both pass while internal geometry is wrong. Two techniques repaired; golden path still needs reconciliation."
    },
    "techniques/defect-cap-bounded-to-its-reach.md": {
      "disposition": "reverify",
      "reason": "Waiver reach depends on actual shared sampling, framing and normalization dependencies, not component names alone. Specification sources can also be wrong. Replaying a recipe from pristine bytes twice proves determinism, not idempotence on its own output. An approved master may still be defective under a separate requirement."
    },
    "techniques/dual-anchor-scoring.md": {
      "disposition": "reverify",
      "reason": "Two constraints do not establish complete correctness or statistical independence. Different checks of the same representation can detect distinct defects; a faulty regex experiment does not invalidate all static checks. Comparing measured candidate dimensions to generation targets still checks execution even if both use the same specification."
    },
    "techniques/findings-carry-the-correction.md": {
      "disposition": "clarify",
      "reason": "Repaired actionable diagnostics versus guaranteed remedies, bounded iteration, cycles, missing evidence and explicit budget-exhausted outcomes. Located deviations do not prove monotone progress or termination."
    },
    "techniques/instrument-blindness-register.md": {
      "disposition": "reverify",
      "reason": "Blindness depends on configuration and criterion. Translation-only alignment may expose an asymmetric mirror; geometry checks can expose winding without rendered views. Uncapped slab rasterization is a measurement limitation, not automatically bad authoring; splitting a valid mesh to improve its score risks optimizing the instrument. Known unresolved blind spots should remain registered."
    },
    "techniques/no-average-hides-a-failure.md": {
      "disposition": "clarify",
      "reason": "Repaired p95 and trimming blind spots, small-sample conventions, hard-failure precedence, missing required rows and calibrated units. A minimum over scores is useful only when every required score shares a pass basis."
    },
    "techniques/register-once-from-the-invariant.md": {
      "disposition": "reverify",
      "reason": "Compensate nuisance transforms according to the target contract, not universal translation-only policy. Landmark uncertainty and rotational ambiguity may require registration changes. Per-view transforms can hide cross-view inconsistency; an offset can itself be a defect when placement is required."
    },
    "applications/node--dual-anchor-scoring.md": {
      "disposition": "reverify",
      "reason": "Historical four-specification probe demonstrates two parser false positives, not that every second static rule inherits every blind spot. Section existence and enumeration can differ because of the artifact. Consumer experiment not rerun or verification date refreshed."
    },
    "applications/process--dual-anchor-scoring.md": {
      "disposition": "reverify",
      "reason": "Historical 0/12 perceptual outcome is limited to that selected slate. Similar policy constants are not independent corroboration without separate provenance; both anchors passing does not certify all geometry. Source commit and live artifacts not reverified."
    },
    "applications/process--instrument-blindness-register.md": {
      "disposition": "reverify",
      "reason": "Historical register mixes structural information loss with fixable configuration behavior. Culling can be matched to runtime, and mesh splitting can game slab sampling. Register presence is not proof that mandatory witnesses ran; source commit and measurements not refreshed."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all six techniques and all three applications at their reverted bytes.
Checked the two `process` applications' pinned external evidence: they cite a public
browser-game repository at commit `286bd2a`, which is not in the local fleet (I enumerated
`C:/Users/kazda/kiro`) and which I did not fetch. The `node` application's own A/B
experiment I could not re-run because the connected project's specification library is not
identified by path in the document.

This is the strongest subject in my group. The dual-anchor conjunction argument, the answer
it gives to the one-authority-per-quantity objection, the registration cost argument, the
adversarial statistic choices and the waiver-reach derivation are each specific, falsifiable
and internally consistent. The blindness register is the rarest thing here: an instrument
that enumerates what it structurally cannot see and assigns each class a different witness.
The `node--dual-anchor-scoring` application carries an honest negative result
(`ab_verdict: not-better`) whose whole value is that the cheap second anchor produced two
false positives and zero real catches, and it amends the technique rather than being quietly
dropped.

One finding I can defend, in `findings-carry-the-correction`. The document claims that once
findings are work orders the loop "terminates, and it needs no iteration cap", and that an
uncapped loop is safe "because every iteration consumes a specific, located instruction and
the score cannot improve except by satisfying one". The second clause does not imply the
first. Convergence needs the fixes to be independent, or at least monotone in the aggregate,
and this subject supplies its own counterexample: `no-average-hides-a-failure` records a
normalisation correction that collapsed one-sided coverage from 5.29 to 1.12 while the
headline did not move, which is exactly a case where satisfying one term moved others. Where
rows are coupled - a candidate widened to satisfy a cross-section row now failing the
silhouette coverage term - a producer can oscillate indefinitely while every iteration
consumes a real located instruction. The termination claim needs its condition stated:
uncapped is safe where the findings are separable, and a non-converging loop with an
informative payload is a coupling finding rather than a reason to add a cap.

Two things I deliberately did not carry forward as findings. That a p95 can be gamed by a
defect narrower than the tail is true and the document already says so, routing it to the
payload as a locator finding rather than re-weighting the score. And the trimmed-mean
exception on cross-section rows is labelled with the defect class it admits, which is the
rule the section states.

The gap I could not close: both `process` applications rest on a pinned external commit. The
design claims they report are internally coherent and quoted at length, and the strongest
evidence in the subject - twelve vehicles all within about 4% of published dimensions and
all twelve failing perceptual review - is a number I have no way to check. That is exactly
the shape of evidence this corpus should not silently refresh, so those two documents are
`reverify` on their evidence rather than on their reasoning.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/reference-parity-gating",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:4155fac43bb39973",
  "disposition": "clarify",
  "coverage": "Golden path, six techniques and three applications read in full at reverted bytes. Explicitly not evaluated: the external repository pinned at commit 286bd2a that both process applications quote (not in the local fleet, not fetched); the 0/12 perceptual-review figure; the node application's A/B experiment, which names no repository path and was not re-run; any measurement rig executed.",
  "counterexamples": [
    "An uncapped iteration loop does not terminate merely because its findings are located. Where score terms are coupled - the subject's own record of a normalisation fix moving one-sided coverage while the headline stayed floored is such a case - a producer can satisfy one located instruction per round forever and oscillate between rows.",
    "The waiver machinery assumes a reference defect whose reach can be computed from the registration. It is silent on a defect in the published specification itself, where the rule that the specification anchor is never waivable leaves no legal move at all.",
    "The blindness register's guidance to assign each class a different witness has no answer for a class whose only honest witness is unavailable - the node application's own case, where the genuine behavioural anchor exists but costs too much, and the conclusion is that a cheap substitute is worse than nothing."
  ],
  "sources": [
    {"path": "knowledge/game-production/content-pipeline/reference-parity-gating/techniques/no-average-hides-a-failure.md", "result": "Supplies the coupled-terms case that refutes the unconditional termination claim in findings-carry-the-correction. Establishes the internal contradiction; does not establish how often coupled rows actually stall a real loop."},
    {"path": "C:/Users/kazda/kiro (fleet enumeration)", "result": "Establishes that the external browser-game repository pinned at commit 286bd2a has no local checkout in the eleven-tree fleet, so its rows could not be re-read this run. Establishes nothing about whether those rows are still accurate."}
  ],
  "documents": {
    "reference-parity-gating.md": {"disposition": "keep", "reason": "The accept-versus-reject asymmetry that opens it, the two-anchor conjunction, register-once, the adversarial statistics and the waiver-reach rule are consistent with every technique below and with each other. The one-authority-per-quantity objection is raised and answered rather than ignored."},
    "techniques/defect-cap-bounded-to-its-reach.md": {"disposition": "keep", "reason": "The reach bound is derived from the registration rather than negotiated, which is what makes it enforceable, and the repair-retires-verdicts rule is carried with the incident that produced it. The coupled-landing rule for a candidate that faithfully reproduced a reference defect is a real and non-obvious consequence."},
    "techniques/dual-anchor-scoring.md": {"disposition": "keep", "reason": "The independence test - could one anchor be satisfied and the other violated for a reason about the artifact - is stated as a usable question, and the amendment that two anchors over one representation are one anchor with two thresholds is earned by a recorded negative experiment rather than asserted."},
    "techniques/findings-carry-the-correction.md": {"disposition": "clarify", "reason": "The claim that an informative payload makes the loop terminate and a cap unnecessary is unconditional and unsupported. Located instructions guarantee each iteration does something, not that the sequence converges; coupled score terms permit indefinite oscillation. State the separability condition, and route non-convergence to a coupling finding rather than to a cap."},
    "techniques/instrument-blindness-register.md": {"disposition": "keep", "reason": "Each of the five classes names the property of the rig that makes it structural and a witness that does not share it, and the rule that a witness's known limit is recorded with the witness is the step most instruments skip. The register-as-argument use against retiring a human pass is the correct consequence of the enumeration."},
    "techniques/no-average-hides-a-failure.md": {"disposition": "keep", "reason": "Min for aggregation, p95 in the score with the maximum as locator, and symmetric coverage each name the specific gaming they prevent, and the floored-score section is a genuine, costly failure most gate designs never state. The trimmed-mean exception is labelled with the defect class it admits, which is the rule the section demands."},
    "techniques/register-once-from-the-invariant.md": {"disposition": "keep", "reason": "That anything the registration compensates for is an error class the gate agreed not to find is the load-bearing sentence and it is correct. The invariant-region choice, the sampling-derivation rule and the frame-moved-retires-conclusions rule follow from it without gaps."},
    "applications/node--dual-anchor-scoring.md": {"disposition": "keep", "reason": "A negative result reported as one, with its scope stated honestly - four specifications is an existence proof of the correlated-anchor failure, not a false-positive rate - and a named return condition. Its finding is the amendment the technique now carries."},
    "applications/process--dual-anchor-scoring.md": {"disposition": "reverify", "reason": "Every claim rests on an external repository pinned at commit 286bd2a which is not in the local fleet and which I did not fetch. The reasoning quoted is coherent and the corroboration it reports on the grace band and the 0/12 perceptual-review result would be the strongest evidence in the subject, which is exactly why it must not be re-dated without being re-read."},
    "applications/process--instrument-blindness-register.md": {"disposition": "reverify", "reason": "Same unresolved evidence: the five register entries, the 54.2-to-76.1 cross-section recovery and the curve-scores-never-certify rule are all quoted from the same unfetched external commit. Its own stated gaps - the register is prose across three documents and is never re-derived when the rig changes - would survive re-reading, but the underlying rows are unconfirmed this run."}
  }
}
```
