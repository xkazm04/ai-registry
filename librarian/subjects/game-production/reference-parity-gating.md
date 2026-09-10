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
