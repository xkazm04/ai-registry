---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: sample-size-trust-gate
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero, label-convention-as-convention]
shared_with: []
use_when: [deciding whether an experiment may show a winner, building a progress indicator for a running test, handling a control with no conversions]
---

# Sample-size trust gate

A landing-page experiment surface computes, before any verdict, the number of visits
each arm needs for the test to be able to see the effect it was built to see - and
refuses to declare a winner until the *smallest* arm has reached it. The gate is a
first-class state ("collecting"), it is sized from the control's own base rate against
the threshold the test will actually use, and when it cannot be computed it is shut.

The reason is that a two-proportion test on a thin sample is not conservative by
accident; it is wrong with confidence. Eight conversions on sixty-five visits against
three on sixty is a two-and-a-half-fold lift with a respectable-looking z, and it is
noise. Nothing in the significance arithmetic complains. The gate is the thing that
complains.

## Procedure

1. **Fix the three parameters before the test starts.** The minimum detectable effect
   as a *relative* lift on the control's rate; the family-wise false-positive rate;
   the power. Fifteen percent, one in twenty and eighty percent are practitioner
   defaults for a landing page and are labelled as convention. The right minimum
   detectable effect is the smallest lift the business would act on: a page that will
   be redesigned for five percent needs roughly nine times the sample of one that only
   cares about fifteen, because sample scales with the inverse square of the effect.
2. **Take the threshold from the correction, not the raw rate.** With more than one
   challenger the per-comparison threshold is tighter (see the multi-arm correction),
   and sizing at the raw threshold under-sizes every multi-arm test. Sizing and
   verdict must read the same threshold or the gate opens before the verdict can be
   trusted.
3. **Compute visits per arm** with the standard pooled two-proportion formula: the
   square of (the two-sided critical value times the root of twice the pooled
   variance, plus the power quantile times the root of the sum of the two arms'
   variances), over the square of the absolute difference between the control's rate
   and the control's rate lifted by the minimum detectable effect. Round up.
4. **Progress is the smallest arm over the requirement**, clamped to one. Not the
   total over the requirement times the arm count: an uneven split (see the ratio
   check) can leave one arm starved while the total looks healthy.
5. **Fail closed.** When the control's rate is zero, or one, or the sizing is
   otherwise not a finite positive number, progress is zero and the gate is shut. The
   surface says the sample is not yet sizeable, and says why.
6. **Print the requirement and the date.** "Needs 3,841 per arm; at the current pace,
   reachable on the 27th." A refusal that names its own end is what stops a stakeholder
   from calling the winner by hand.

## The incident behind fail-closed

A surface computed the requirement, found it infinite because the control had no
conversions yet, and resolved the non-finite branch to the permissive value - progress
one, enough data true - on the reasoning that "no requirement" meant "nothing to
wait for". A control on forty visits with zero conversions and a challenger on
forty-five with six then produced a large z, cleared the confidence bar, and the
surface printed a significant winner on eighty-five visits. The gate was the only
thing standing between that test and a false verdict, and it had been wired open at
exactly the moment data was scarcest. A zero-rate control is a brand-new or broken
control; it can never be trusted, and "not computable" resolves to shut. This is
[not measured is not zero](../../../_laws.md#not-measured-is-not-zero) in the
opposite direction: an absent requirement is not a met one.

## Decision rules

- When any arm is below the requirement, do not render a winner badge, because the
  arithmetic that would justify it assumes a sample it does not have; render the
  leader as "leading" with its counts.
- When the control's rate is zero, shut the gate rather than skipping it, because a
  gate that cannot compute is not a gate that has passed.
- When the number of arms changes, recompute the requirement, because the corrected
  threshold changed with it.
- When the test is on illustrative or sample numbers, the gate still runs, and the
  verdict carries the illustrative label through; it never enters a track record.
- When the requirement is reached inside a partial week, the runtime gate (a
  convention of two full weeks, same weekday to same weekday) still holds; sample is
  one condition of two.

## When NOT to use

- A test the operator stopped deliberately is read on its confidence at the stop and
  labelled as stopped; the gate governs *running* tests. Promoting a stopped test to
  a winner it did not earn is the peeking guard's concern, not this one's.
- A sequential design with always-valid thresholds replaces the fixed-horizon
  requirement with a threshold that tightens per look; do not stack a fixed gate on
  top of it as if both were needed.
- A bandit chosen deliberately for revenue rather than learning has no verdict to
  gate; it has a regret bound, which is a different instrument with a different
  promise, and it may not be reported as an experiment result.
