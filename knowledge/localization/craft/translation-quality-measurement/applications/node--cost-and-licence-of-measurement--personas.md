---
layer: application
type: application
subject: translation-quality-measurement
technique: cost-and-licence-of-measurement
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
applied: experiment
ab_verdict: unmeasurable
---

# Break-even read off four months of history: append-mostly, rewritten in bursts (personas)

`personas` at `792b828ae3`. The catalog is `src/i18n/locales/en.json` (24,778 leaf
strings) with thirteen target files beside it. The node version is witnessed by
`.nvmrc` (`22`). The seam is a decision the tree has not yet made: the translation
pipeline's only automated quality rung is deterministic (placeholder parity in
`scripts/i18n/translate-merge.mjs`, the coverage gate), so a rung-2 estimator and its
weight licence are still ahead of it. The technique says to compute "units times
regenerations" before building that rung. This run computed it.

## What ran

An experiment, no product code changed. A replay script flattened `en.json`, `cs.json`,
`de.json` and `ja.json` at the last commit before each month boundary
(2026-07-01, 08-01, 09-01, 10-01) and at the tip, then counted per window keys added,
keys whose value changed, and keys deleted. Source strings changing in `en.json`
separates a source edit from a rewrite of the translation.

| Window | Base keys | Added (per target) | Target rewritten, source unchanged | Source edits | Deleted |
| --- | --- | --- | --- | --- | --- |
| Jul | 16,075 | 2,311 (14%) | 2,910 (18%) | 13 | 154 |
| Aug | 18,232 | 2,121 (12%) | 1,214 (6.7%) | 13 | 183 |
| Sep | 20,170 | 5,775 (29%) | 78 (0.4%) | 47 | 2,526 |
| Oct (to tip) | 23,419 | 1,693 (7.2%) | 6 (0.03%) | 6 | 334 |

Adds are identical across the three targets sampled in every window, so the thirteen
files grow in lockstep and each add is thirteen units to score.

## What was read

The technique's falsifiable half is its multiplier. Had rewrites dominated every
window, the standing local estimator would have been the obvious rung. They did not:
the multiplier started high (the first window rewrote 18% of the target text with the
source almost untouched, a rewrite campaign) and fell by three orders of magnitude.
The steady load is new strings, which are scored once. So the store is append-mostly
with bursts, and the quantity to put in the break-even is scored units per window
(here 22k to 75k unit-translations a month across thirteen targets), not 24,778 times
thirteen. At the reported local rates that load is minutes for the distilled student
and a couple of hours for the large estimator, so compute does not decide the rung
here. The licence of the exact checkpoint would, and no pin or licence record exists
in the tree yet.

## What this realization cannot say

No hosted-judge price was available, so the other side of the break-even is not
computed, and the verdict is `unmeasurable`. The instrument that would make it
measurable is a priced hosted-judge arm over one month's delta. Diffs at month
boundaries undercount rewrites inside a window, and the July rewrite may be a
one-off cleanup. One tree, four windows. The technique gained a paragraph (units are
scored units per period, read from history) and no rule changed.

## Proof

`proof: replay`. Four boundary revisions of one repository, key-level diffs, no
sampling. Floor: no product file touched, so nothing could regress.
