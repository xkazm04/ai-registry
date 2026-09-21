---
subject: scoring-rubrics
domain: software-engineering
last_touched: 2026-09-20
dry_streak: 0
---

# scoring-rubrics

First touch: 2026-09-20, from `/intake` on a sponsored AI-video demo
(`youtube:QW2nS4DO-s8`). The subject has nothing to do with the source; it was
reached by the seam hunt, which opened a fleet project's frame-composition
context to look for somewhere to apply the source's camera-language claims and
found the project's own context-map join misbehaving instead.

## State

7 techniques, unchanged in count. One amendment landed inside
`normalization`.

Landed:

- `normalization` gains **"Many cohorts, one decision: anchor the cutoff on the
  population"** — the boundary the technique's cohort-relative section did not
  reach. Its stated costs are all *within* one cohort (yesterday's score is not
  comparable, one entity's gain lowers everyone's number, an outlier compresses
  the scale). The unlisted cost appears when the same rule runs **per group**
  and the result feeds a decision made **across groups**: each group's frame is
  set by its own leader, so admission rides on how dominant that leader happens
  to be, and the failure is an **inversion** rather than a compressed scale —
  the strongest group rejects a candidate a weaker group admits comfortably.
  The section carries the one-query diagnosis (per group, the weakest candidate
  it admitted; then ask whether any group rejected a stronger one) and the fix:
  `bar = min(group best, population centre) x the kept fraction`, so the
  leader may lower the bar and never raise it.

## Why an amendment and not a technique

The file's own rule survives the finding — cohort-relative framing is still the
right instrument for ranking within a group, and the amendment says so. What it
did not reach is the many-cohort case; and its stated corrective there
(percentile anchors over the raw min and max) does not help, because the
incomparability is *between* frames rather than within one. That is a boundary
case of a mechanism the subject already models, which is the shape an amendment
is for.

## Evidence

Measured on one project's generated context map, then fleet-wide across 13
checkouts and 997 contexts:

- the motivating case: a context whose leader scored 1675.4 rejected its own
  **#2 at 732.3** (`use_when`-grounded) against a bar of 921.5, while **25 of
  26 sibling contexts admitted a pair weaker than that** — down to 298.1, a
  2.46x inversion. The project's median leader is 666.7, so the rejected pair
  would lead half the repo's contexts.
- applied to the instrument: **4208 → 4689 pairs (+481, +11.4%)**, 461 of them
  `use_when`-grounded, **0 lost**, contexts with no map unchanged at 6, and the
  corpus-wide lexical-only share improved 6.18% → 5.99%.

The instrument already computed the population statistic the fix needs — it
uses it twenty lines later to flag weak governance and to qualify confidence,
and never reached for it at admission. That asymmetry is how the finding was
located and it is the generalisable half.

## Leads

- The `TOP` cap and the retained-verdict merge interact: 35 contexts already
  exceeded the nominal cap before this change and 41 do after, in both arms.
  Pre-existing and out of scope here. Return condition: when someone asks why a
  context carries nine pairs against a cap of five.
