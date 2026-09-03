---
layer: application
type: application
subject: test-harness
technique: platform-quirk-absorption
stack: rust
verified_on: 2026-09-02
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Three tolerance sites on a substrate that has no mode to probe

Two connected services carry their numerics in native code with
double-precision arithmetic: a trend-fitting module with unit tests that
assert slopes and levels within a billionth, one looser assertion within
two tenths on a fitted decay, and a rule-induction module that compares
support ratios against a threshold padded by machine epsilon. Both trees
were read on 2026-09-02 for the amendment that says a runner should probe
the effective numerics mode and publish a tolerance.

## The three cases

1. **The billionth assertions on a flat and a rising series.** Under A
   (constant tolerance in the test) they pass on every machine the lane
   has run on. Under B (a runner probe publishing the tolerance) the probe
   would compute a double-precision reference against a reduced type — and
   there is no reduced type in play: the lane runs on general-purpose
   processors, no accelerator, no contraction flag, no environment variable
   that alters the arithmetic. The probe measures zero deviation and
   publishes the same tolerance the test already carries.
2. **The two-tenths assertion on a decay estimate.** Its width is about
   the estimator, not the platform; both arms leave it alone.
3. **The epsilon-padded threshold comparison in rule induction.** Not a
   test tolerance at all but a product rule guarding a ratio against
   representational error; the probe has nothing to say to it.

## Verdict

Not better, and the condition is the amendment's own closing paragraph: on
a substrate with no mode that can change the arithmetic without changing
the code, the probe is a round trip that publishes a constant. Neither
service pins a precision flag anywhere, because none exists to pin. What
would falsify the prediction: a lane moved onto an accelerator, or a build
profile that enables contraction or a fast-math flag, after which the
billionth assertions are the first to scatter and the probe is the only
thing that would explain why.

## What the structure says

The tree confirms the boundary rather than the technique. Every tolerance
in these crates is either an estimator's width or a representational
guard, and none is a platform accommodation — the class the amendment
absorbs is simply absent, by substrate. That is a fact about where the
probe belongs, not a mark against it.
