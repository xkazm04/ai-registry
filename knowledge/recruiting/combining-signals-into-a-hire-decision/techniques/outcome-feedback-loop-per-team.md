---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: outcome-feedback-loop-per-team
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-predictor-cannot-grade-its-own-labels, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [feeding hire outcomes back into a scoring or combination rule, deciding whose outcomes may inform whose thresholds, standing up calibration for a team with few hires]
---

# The outcome feedback loop is per team

A combination rule that never learns from what happened is a fixed opinion with
a version number. The loop that fixes this — resolved outcomes flow back and
adjust the thresholds and weights — is the right instinct, and the place it goes
wrong is not the statistics. It is the **scope**.

The rule: **calibration is per team.** A promote floor derived from another
team's hires is not a helpful prior. It is contamination.

## Why the scope is a hiring fact, not a tenancy detail

It is tempting to read "per team" as a data-isolation concern — the kind of
partitioning any multi-tenant system does for privacy reasons. It is not, or
rather it is that too, but the reason it is *non-negotiable* is about hiring, not
about storage:

- **The bar differs.** What one team calls a strong senior engineer, another
  calls mid-level. Both are internally consistent; neither transfers.
- **The instruments differ.** Two teams' work samples, scorecards and rubrics
  produce numbers on scales that only look like the same scale because they both
  run 0–100.
- **The role families differ.** A floor learned on backend hiring, applied to
  design hiring, is a threshold on a distribution it has never seen.
- **The market differs.** Location, seniority band, and the applicant pool a
  requisition draws all move the score distribution independently of candidate
  quality.
- **The outcome definitions differ.** One team's "worked out" is passing
  probation; another's is a promotion within eighteen months.

Pool these and you get a floor that is optimal for nobody and defensible to no
one — and, if it drives adverse action, an adverse-action rationale that
references a population the affected candidate was never part of.

The same argument forbids the softer version: seeding a new team's calibration
with the global average "just until they have data". A seeded floor looks
calibrated, carries a calibrated floor's authority, and is wrong in exactly the
way an uncalibrated one is — but invisibly. Use a documented, *labelled*
uncalibrated default instead
([law](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## The loop, scoped

1. **Partition the calibration set by team and role family.** Both, not either.
   A team hiring for three distinct role families has three calibration
   questions, not one.
2. **Match on the stable role vocabulary, not the display name.** Teams rename
   their stages and their job titles; a loop keyed off strings silently merges
   populations when a board is renamed
   ([law](../../_laws.md#meaning-does-not-live-in-a-label)).
3. **Require a minimum resolved-outcome count per partition** before deriving
   anything, and report the count wherever the derived value is used.
4. **Recompute on a schedule, not continuously.** A threshold that moves with
   every resolved outcome is a threshold nobody can reason about, and it makes
   two candidates scored a day apart subject to different rules for no defensible
   reason.
5. **Version the result** and record which version each decision used, so a past
   decision can be re-derived under the rule that actually produced it.
6. **Feed overrides in, not just outcomes.** A human reversing the machine is a
   labelled error and arrives years earlier than an employment outcome does. It
   is the highest-value, most-neglected input to this loop.

## What the loop may adjust, and what it may not

**May adjust:** the promote floor; the relative weights among signals whose
validity the outcomes actually speak to; the confidence caps on light-class
signals; which discrepancy magnitudes are worth raising.

**May not adjust:** the blockers. An authenticity concern, a coverage minimum,
or a legally required credential does not become less blocking because the
outcome data suggests flagged candidates often work out. That inference is
exactly what a contaminated calibration set produces
([law](../../_laws.md#a-predictor-cannot-grade-its-own-labels)) — you only ever
observe the flagged candidates who were advanced anyway, and somebody advanced
them for a reason. Safety predicates are governed, not learned.

**May not adjust, second case:** anything whose adjustment would let the loop
optimize a proxy for a protected characteristic. A loop that discovers a signal
predicts outcomes *because* it tracks a demographic has discovered a fact about
the organization's history, not about candidate quality. Adverse-impact review
sits outside this loop and constrains it.

## The small-team reality

Most teams will not reach a respectable sample. Be honest about the regimes:

- **Below the refusal threshold:** no derived floor. A documented default,
  labelled uncalibrated, plus a human gate. The loop still *collects*; it just
  does not yet *conclude*.
- **Between refusal and comfort:** derive, but carry the caveat with the value
  wherever it travels, and review on a shorter cycle.
- **Above comfort:** derive, still state the sample, still review — a
  calibration is a claim about a population that keeps changing.

Aggregating across teams to escape this regime is the temptation the whole
technique exists to refuse. If a genuinely shared prior is needed — for a role
family hired identically across many teams under one rubric — it must be an
explicit, documented pooling decision with the pooled population named, not a
default that happens because the query lacked a filter.

## Decision rules

- **When the calibration query does not carry a team scope, it is a bug**, not a
  broader sample.
- **When a partition is below minimum, fall back to a labelled default**; never
  borrow another partition's value.
- **When a team's rubric or outcome definition changes, the prior calibration is
  superseded**, not blended forward.
- **When an override contradicts the rule, record it as a labelled case** and
  review the rule, do not re-weight on a single case.
- **When a derived value is displayed or acted on, its sample and its scope
  travel with it.**

## When not to use this

- **Where outcomes cannot be observed at all** — high-turnover seasonal hiring
  with no performance signal, contract placements that end before any horizon.
  A loop with no ground truth will happily calibrate against attendance data or
  something equally beside the point.
- **Where the outcome measure is itself biased** by the same process that
  produced the hire — a manager rating the person they selected. This is not a
  reason to skip the loop, but it is a reason not to let it move weights very
  far, and to prefer coarse verdicts over fine coefficients.
- **Where the team is small enough that individuals are identifiable** in the
  calibration output. A band containing two people is a personnel record wearing
  a statistic's clothes.
