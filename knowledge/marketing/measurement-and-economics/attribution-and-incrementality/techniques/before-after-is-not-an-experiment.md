---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: before-after-is-not-an-experiment
status: forged
laws: [platform-reported-is-not-causal, statistical-honesty-before-a-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [an applied budget change is being measured by the window after it, a surface or prompt wants to say a change "produced" or "caused" a delta, a projection is being calibrated against what actually happened]
---

# Before/after is not an experiment

The read after any change - the window after against the window before - is a
description. It is worth taking, because it is the only observable that lets a
projection be checked against reality. It is not an experiment, because nothing was
held constant: the account moved for many reasons in those days, and a change made in
response to bad performance is followed by improvement whether or not the change did
anything. The technique is to take the read honestly and refuse the causal verb.

## What the read is for

A before/after read has exactly one legitimate consumer: **calibration**. The
projection said plus X; the touched campaigns then did plus Y; the ratio Y/X, taken
over several applied changes, is a measure of how optimistic the projection is, and it
tempers the next projection. That is a claim about the forecasting model, not about
the world, and it survives the confounders because the confounders push in both
directions across many changes.

The read is not for: deciding whether the change worked, scoring an agency, feeding a
"track record", or justifying the next change of the same kind.

## Procedure

1. Windows are equal and whole weeks on both sides of the change day, so weekday shape
   cancels. Seven before and seven after is the practical minimum; convention, and
   said so. The change day belongs to the after window.
2. A coverage floor: each window must be substantially covered by stored data before
   the read is trusted - five of seven days is a convention that tolerates an
   edge-of-period gap without letting a window that mostly rolled out of storage pose
   as a measurement. Below the floor the read is `insufficient`, which is a state and
   not a number.
3. "Not due yet" is a different state again: an after window that has not elapsed is
   not persisted as a degraded measurement, because it will be a real one next week.
4. Measure the touched campaigns only, and only campaigns with an identifier. A pause
   has no recipient; measuring a blank identifier pulls the account's un-keyed series
   into the sums.
5. Show the delta. Show the ratio against the projection only when the window was
   covered and the projection was positive; a ratio against a zero-or-worse projection
   divides by nothing meaningful and reads null.
6. The sentence beside the number says "did", never "caused": "the projection said
   +X, the touched campaigns then did +Y".

## Decision rules

- When a surface narrates a before/after delta with a causal verb, rewrite it as a
  description, because nothing in the read held the world constant.
- When either window is under the coverage floor, render `insufficient` and no ratio,
  because a ratio over a half-covered window is a number dressed as a measurement.
- When several reads exist for the same kind of change, feed their median ratio into
  the projection's calibration, clamped, and disclose the calibration where the
  projection is shown, because that is the one inference the read supports.
- When the change was made because the campaign was doing badly, expect improvement
  and discount it, because regression to the mean is the confounder with no cure short
  of a control.

## What is convention here

The equal-whole-week window, the five-of-seven floor and the clamp on the calibration
ratio are practitioner conventions. That two windows around a change do not identify a
cause is not a convention; it is what "experiment" means.

## When NOT to use

Do not use a before/after read where a control is available: if the change was
applied to some regions or campaigns and not others, the untouched set is the control
and the read becomes a difference-in-differences, which belongs to the holdout
technique. Do not use it on a change smaller than the account's daily noise; the
comparison subject's significance tiers say whether there is a delta to describe at
all, and a `noise` delta is not described, let alone calibrated on. Do not let the read
calibrate a projection across change kinds - a pause and a shift have different
optimism, and one median across both hides both.
