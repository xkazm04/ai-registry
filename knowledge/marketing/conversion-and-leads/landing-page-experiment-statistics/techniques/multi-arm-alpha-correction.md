---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: multi-arm-alpha-correction
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention]
shared_with: []
use_when: [a test has more than one challenger, choosing between correction methods, explaining why a third arm costs more traffic]
---

# Multi-arm alpha correction

Every challenger arm compared against the control is a separate question, and the
false-positive rate the business agreed to is a rate *per test*, not per question. A
surface that runs three challengers against a control at the two-arm threshold has
silently raised the chance of at least one false winner from one in twenty to roughly
one in seven. The correction tightens the per-comparison threshold so the family-wise
rate stays where it was set, and - the half that is usually forgotten - feeds the
tighter threshold back into the sample sizing, so the extra arm is paid for in traffic
rather than in honesty.

## Procedure

1. **Count comparisons as challengers, not arms.** The control is the reference; with
   `k` arms there are `k - 1` comparisons. A two-arm test has one comparison and the
   correction reduces to the raw threshold.
2. **Tighten the threshold.** Two formulas are in common use:
   - The product form: per-comparison threshold equals one minus (one minus the
     family-wise rate) to the power of one over the number of comparisons. For one in
     twenty and two comparisons this is about 0.0253; for three, about 0.0170.
   - The division form: family-wise rate divided by the number of comparisons. For two
     comparisons 0.025; for three, 0.0167.
   The product form is exact when the comparisons are independent and slightly less
   conservative than the division form; the division form is a bound that holds under
   any dependence. The two differ in the third decimal for a handful of arms.
3. **Size at the corrected threshold.** The required visits per arm are computed with
   the corrected threshold, not the raw one. This is what makes the cost of a third
   arm visible before the test starts: the requirement rises, and the operator can
   decide whether the third question is worth the traffic.
4. **Declare at the corrected threshold.** The winner is the arm with the highest rate
   *and* a confidence at or above one minus the corrected threshold. Report the
   effective threshold and the comparison count on the result, so a reader can see the
   bar that was cleared.

## The shared-control caveat

In a several-challengers-against-one-control design the comparisons are not
independent: every one of them shares the control's noise. A lucky control drags every
comparison the same way. The product-form correction assumes independence and is
therefore very slightly optimistic in this design; the division form does not assume it
and is the safe bound. With two or three challengers the difference is negligible and
practitioners use either; state which one the surface uses and why. Where the arms are
many - six is a sensible cap for a landing page, because the per-arm sample at six
becomes a quarter's traffic for most businesses - prefer the bound.

The correction controls *false winners*. It does not correct for reading several
metrics at once (rate, revenue per visit, form starts); a test declares one primary
metric before it starts and reads the others as descriptive. It does not correct for
reading the test repeatedly over time, which is the peeking guard's job.

## Decision rules

- When there is more than one challenger, use the corrected threshold for both sizing
  and verdict, because a verdict at a threshold the sizing did not use is a verdict on
  a sample that was never large enough for it.
- When the arms share one control, prefer the division form or say the product form is
  slightly optimistic, because the independence the product form assumes is not there.
- When an operator adds an arm mid-test, the comparison count rises for the whole test
  and the requirement rises with it; the added arm does not start from the same
  population as the others and the honest surface says the test was restarted.
- When only one metric is primary, correct across arms and not across metrics; when
  several metrics are all treated as primary, the correction must span them too, and
  the sample cost usually makes the operator pick one.

## When NOT to use

- A two-arm test: one comparison, no correction, and a surface that shows a "corrected
  threshold" identical to the raw one should say it reduced to the raw one rather than
  imply a correction was applied.
- A ranking question ("which of these five is best?") answered by a bandit or by a
  best-arm-identification design has its own error control; the pairwise correction is
  the wrong instrument and layering it on top double-counts.
- A test with a hierarchy of hypotheses - a primary comparison and pre-registered
  secondaries read only if the primary wins - uses a gatekeeping procedure, which
  spends the error budget differently; do not apply a flat correction across a
  hierarchy that was designed to avoid one.
