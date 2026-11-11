---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: plan-checks-predict-the-expensive-failure
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [designing the gate between a cheap plan and an expensive render, a plan gate passes plans whose renders get thrown away, choosing what a plan-stage score measures, a proposal to fix a plan gate by raising its threshold or adding judge dimensions]
---

# Plan checks predict the expensive failure

[phase-order-and-graduation](./phase-order-and-graduation.md) says to gate the expensive
boundary with a check that reads the plan, per promise, reporting pass, fail or unmeasured.
It does not say what the check should measure, and the default answer is wrong: teams score
the plan on how good a plan it is - clarity, hook, structure, tone. Those are properties of
the cheap artifact. The gate exists to stop money being spent on an expensive output that
will be thrown away, so its dimensions are chosen by **what makes the expensive output
fail**, read back to the plan.

## The rule

- **Derive each dimension from a failure class of the expensive output.** Take the
  post-mortem of discarded renders, name the cause of each, and ask what in the plan would
  have shown it: a shot that asks the image model for legible text, a narration segment
  longer than its shots can carry, a recurring character with no reference. Each becomes a
  plan-readable check, usually a count or a ratio and often deterministic. A craft dimension
  with no failure class behind it may stay as advice; it does not gate.
- **Validate the gate against history before trusting it.** Run it over past plans whose
  renders are known. A dimension that does not separate the discarded from the kept is not
  predicting anything, however reasonable it sounds. If discarded and kept plans score the
  same on the current gate, raising its threshold only refuses more plans at random, and
  adding more dimensions of the same kind adds more of what did not discriminate.

## When not to use it

- No expensive stage follows the plan, or a render is cheaper than the check.
- There is no failure history yet: start from the known failure classes of the medium and
  back-test once renders exist.

## Evidence

Measured 2026-11-11 (backlog 8-045, blind-ab, one probe, three runs per arm, both arms
holding this subject's golden path and phase-order-and-graduation). An explainer pipeline's
plan gate summed five judge dimensions; discarded and kept plans scored alike; a change
proposed a higher threshold and two more judge dimensions. Failure-derived dimensions with a
back-test on the plan history: A 6, B 3 of 6 (arm B derived the checks from the post-mortem
and never validated them against history). Per-dimension verdict bands composed by the worst
scored A 6, B 5 and did not land: the per-promise pass, fail and unmeasured rule already
carries it.
