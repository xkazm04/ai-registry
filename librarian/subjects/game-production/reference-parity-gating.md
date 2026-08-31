---
subject: reference-parity-gating
domain: game-production
last_touched: 2026-08-31
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
