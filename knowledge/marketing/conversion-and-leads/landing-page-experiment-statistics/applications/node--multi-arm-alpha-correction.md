---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: multi-arm-alpha-correction
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Multi-arm alpha correction - the shared control made the product form safe, not optimistic

Verified against `systedo-case` at commit `99a9707d` (2026-10-22). The version witness
is `package.json` engines `node: 24.x`. The whole verdict is the pure `evaluate()` in
`src/lib/lp-exp/compute.ts`, and arms are capped at `VARIANT_MAX = 6` in
`src/lib/lp-exp/types.ts`.

## What the tree already did

The tree follows the procedure. It counts comparisons as challengers
(`comparisons = variants - 1`). `correctedAlpha()` is the product form,
`1 - (1 - α)^(1/m)`, and it reduces to α at one comparison. The sizing reads the
corrected threshold: `requiredSampleSize(controlCvr, MDE, effectiveAlpha, power)`.
`effectiveAlpha` and `comparisons` both go out on the result, and the card adds an
"adjusted for n variants" line when `comparisons > 1`. The 2026-09-09 reconcile left one
open point, the technique's caveat that the product form is "slightly optimistic" on a
shared control. The technique's advice was to prefer the division form.

## The seam chosen to falsify the caveat

The caveat predicts a measurable thing. Under the null, with every challenger compared
against one control, the product form's family-wise rate should come in above the 0.05 it
was set at. Sidak's inequality predicts the opposite: two-sided tests on jointly normal
statistics hold the product bound under any correlation. A caught outcome would have
confirmed the caveat and made switching forms a real change. A held outcome inverts a
sentence the corpus prints in three files.

## A and B

The experiment was a null replay over the real `evaluate()`, with no product code
changed. Each arm got 2,000 visitors at a common 10% rate. There were 100,000 tests per
arm count, under two seeds of a seeded generator. Arm A is the tree's product form on a
shared control. Arm B is the technique's recommendation, the division form `α/m`. The
control is the product form with an independent control per comparison, which is the
case the form is exact for.

| arms | product, shared control | division, shared control | product, independent | `evaluate()` false winners |
| --- | --- | --- | --- | --- |
| 2 | 0.0507 / 0.0493 | same | 0.0507 / 0.0500 | 0.0254 / 0.0248 |
| 3 | 0.0458 / 0.0459 | 0.0452 / 0.0454 | 0.0498 / 0.0490 | 0.0228 / 0.0229 |
| 4 | 0.0444 / 0.0452 | 0.0438 / 0.0446 | 0.0502 / 0.0504 | 0.0223 / 0.0227 |
| 6 | 0.0415 / 0.0423 | 0.0407 / 0.0417 | 0.0496 / 0.0498 | 0.0203 / 0.0208 |

Each cell gives seed 1 / seed 2. At 100,000 tests one standard error is about 0.0007.
The positive control held: the two-arm rate sits at the nominal 0.05, and the
independent-control column stays at 0.05 for every arm count.

**Target:** the family-wise false-positive rate stays at or under 0.05. Arm A already
does that at every arm count, and the shared control pushes it *down*, not up. Arm B
lowers it by under a thousandth. **Floor:** the per-arm sample requirement. At a 10%
baseline and a 15% lift, B raises it from 8,080 to 8,105 visitors at three arms, and
from 9,918 to 9,959 at six (+0.3-0.4%). Switching costs traffic and buys nothing the
target needed, so the verdict on the technique's recommendation is **not-better**. The
technique, its golden path and the sibling trust-gate application were corrected in the
same change.

## What the replay also showed

The rightmost column is the product's real error, and it is about half the budget.
`evaluate()` only declares the highest-rate arm, and only when that arm is not the
control. So a two-sided confidence is read in one direction, and the false-winner rate
sits near α/2. That is conservative, and the traffic for it was paid in the sizing's
two-sided quantile. The tree makes this choice by default and says so nowhere. The
technique now asks a surface to state it.

## What this realization cannot do

Nothing restarts a test when its arm count changes. `replaceExperiment()` swaps the
variant list of a running experiment in place. The comparison count and the requirement
rise, but the old arms keep visitors gathered under a different design, and the card
does not say the test changed shape. This is the technique's mid-test-arm rule, and the
tree does not meet it. The replay also used the normal approximation the tree uses. At
very low rates, a few signups per arm, the exact binomial error differs, and this replay
does not speak to that region.
