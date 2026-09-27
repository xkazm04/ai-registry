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

The rule: **the answer is per team; the evidence may be pooled, openly.** A
floor or a weight that is *applied* to a team must be that team's, derived for
it and read from its own partition. But at the sample sizes teams actually have,
a partition calibrated alone is fitting noise. The settled statistical answer
is partial pooling: start from a pooled estimate whose population is named, and
let the team's own resolved outcomes pull the value toward the local one as they
accrue. Another team's data is contamination only when it arrives unlabelled,
wearing local authority.

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

Pool these *silently* and you get a floor that is optimal for nobody and
defensible to no one — and, if it drives adverse action, an adverse-action
rationale that references a population the affected candidate was never part
of.

**Weights travel better than floors.** Decades of validity-generalization work
found that most of the site-to-site variation in how well an instrument
predicts is sampling error. How well a structured interview predicts on one
team is good evidence for how well it predicts on the next, when the instrument
is the same. What genuinely differs between teams is the base rate, the
selection ratio and the bar, and those are exactly what a floor encodes. So a
pooled prior is a sound starting point for *weights* over a shared instrument,
and a weak one for a *floor*. Selection guidelines themselves allow grouping
jobs with substantially the same work to reach an adequate sample, and forbid
leaning on other studies where something likely to affect validity differs.

The softer version — seeding a new team's calibration from the pooled estimate
"just until they have data" — is the right version **when it is labelled**:
name the pooled population on the value, show the local count beside it, and
let the local share grow with that count. What is forbidden is the seed that
looks calibrated: a pooled number carrying a local number's authority, wrong in
exactly the way an uncalibrated one is, but invisibly. Where no pooled
population shares the instrument, use a documented, *labelled* uncalibrated
default ([law](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

**The scope of the action must not exceed the scope of the evidence.** A floor
recommended from one team's outcomes, applied through a control that sets the
floor for every team, is the pooling failure run backwards: every other team
now acts on a number derived from someone else's hires, with nothing on the
value saying so.

## The loop, scoped

1. **Partition the calibration set by team and role family.** Both, not either.
   A team hiring for three distinct role families has three calibration
   questions, not one.
2. **Match on the stable role vocabulary, not the display name.** Teams rename
   their stages and their job titles; a loop keyed off strings silently merges
   populations when a board is renamed
   ([law](../../../../_laws.md#meaning-does-not-live-in-a-label)).
3. **Require a minimum resolved-outcome count per partition** before deriving
   anything, and report the count wherever the derived value is used.
4. **Recompute on a schedule, not continuously.** A threshold that moves with
   every resolved outcome is a threshold nobody can reason about, and it makes
   two candidates scored a day apart subject to different rules for no defensible
   reason.
5. **Version the result** and record which version each decision used, so a past
   decision can be re-derived under the rule that actually produced it.
6. **Feed overrides in as disagreements, and score them.** A human reversing
   the machine is a labelled *disagreement*, not a labelled error. It arrives
   early, but which side was right is known only when the outcome resolves.
   The field evidence runs against the human more often than for: across
   fifteen firms using a hiring test, managers who overrode its recommendation
   more often hired workers who stayed for shorter periods. Record what the human
   knew that the rule did not. Then score each override when its outcome lands:
   one that wins is evidence the rule is mis-specified, and one that loses is
   evidence about the reviewer. Only overrides that *advance* someone ever
   resolve, so the record is one-sided by construction. Never train on overrides
   as ground truth.

## What the loop may adjust, and what it may not

**May adjust:** the promote floor; the relative weights among signals whose
validity the outcomes actually speak to; the confidence caps on light-class
signals; which discrepancy magnitudes are worth raising. Three conditions come
with every adjustment:
- **Weights move last and least.** Weights fitted on resolved outcomes beat
  equal weights on new cases only at roughly fifteen to twenty outcomes per
  signal, and hiring outcomes exist only for the people who were hired. Shrink
  toward the current weights rather than refit.
- **Every change gets a fresh adverse-impact check** before it is deployed.
  Moving mass between signals moves the selection rate by group, because the
  signals differ in their group differences.
- **The feedback is performative.** The rule shapes whom you observe next.

**May not adjust:** the blockers. An authenticity concern, a coverage minimum,
or a legally required credential does not become less blocking because the
outcome data suggests flagged candidates often work out. That inference is
exactly what a contaminated calibration set produces
([law](../../../../_laws.md#a-predictor-cannot-grade-its-own-labels)) — you only ever
observe the flagged candidates who were advanced anyway, and somebody advanced
them for a reason. Safety predicates are governed, not learned.

**May not adjust, second case:** anything whose adjustment would let the loop
optimize a proxy for a protected characteristic. A loop that discovers a signal
predicts outcomes *because* it tracks a demographic has discovered a fact about
the organization's history, not about candidate quality. Adverse-impact review
sits outside this loop and constrains it. Proxies cannot all be listed in
advance, so the constraint is a test, not a list: the protected-attribute data
that the test uses is held outside the loop, and the loop never sees it. The
loop may never partition by a protected group. Calibrating or adjusting scores
separately for a group is itself prohibited in some jurisdictions (US law bars
it for employment tests), so "per team" never extends to "per group".

## The small-team reality

Most teams will not reach a respectable sample. Be honest about the regimes:

- **Below the refusal threshold:** no locally derived floor. A named pooled
  prior where one shares the instrument, otherwise a documented default labelled
  uncalibrated, plus a human gate. The loop still *collects*; it just does not
  yet *conclude*.
- **Between refusal and comfort:** derive, but carry the caveat with the value
  wherever it travels, and review on a shorter cycle.
- **Above comfort:** derive, still state the sample, still review — a
  calibration is a claim about a population that keeps changing.

Aggregating across teams *silently* to escape this regime is the temptation
the technique exists to refuse. Borrowing strength across teams openly is the
statistically sound way out of it. A shared prior must be an explicit,
documented pooling decision, with the pooled population named and its weight
shrinking as local outcomes accrue, never a default that happens because the
query lacked a filter.

## Decision rules

- **When the calibration query does not carry a team scope, it is a bug**, not a
  broader sample, unless it is the declared pooled prior.
- **When a partition is below minimum, shrink toward a named pooled prior** or
  fall back to a labelled default. Never present a borrowed value as local.
- **When a value derived from one team would be applied beyond that team,
  refuse or re-scope**: the action's scope may not exceed the evidence's.
- **When a team's rubric or outcome definition changes, the prior calibration is
  superseded**, not blended forward.
- **When an override contradicts the rule, record it as a labelled
  disagreement** and score it when its outcome resolves; review the rule on the
  scored record, never re-weight on a single case.
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
