---
layer: technique
type: technique
subject: early-career-potential-assessment
technique: readiness-rubric-replacing-years
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [scoring a candidate with an empty employment history, designing the dimension that replaces years-of-experience, reviewing whether a graduate rubric can reach full marks]
---

# Readiness rubric replacing years

The concern: a scoring model has a dimension whose input is tenure, and a population
for whom that input does not exist. The technique replaces the *input*, keeps the
*slot*, and preserves the *range* — so an early-career candidate is scored on something
real, on the same scale, competing on comparable terms.

## The procedure

1. **Identify the slot, not the number.** Ask what the tenure dimension was buying:
   usually depth of capability, evidence of delivery under constraint, and a rate of
   growth. Write those down. They become the readiness dimensions.
2. **Swap, do not zero.** For a candidate routed to this population, the tenure input
   is *not measured* — a distinct state, never a numeric floor. The slot is filled by
   the readiness computation instead. A pipeline that leaves the tenure field at zero
   and adds readiness beside it has built a permanent handicap, because the zero is
   still in the sum.
3. **Compute four sub-scores, each normalized to the full range.**
   - *Depth* — the furthest point reached in any single area: an extended thesis, a
     project carried past a prototype, a specialism pursued over years, a role held
     long enough to have consequences.
   - *Velocity* — accumulation per unit of *available* time. The denominator is time
     since the person could plausibly have started, not their age and not calendar
     years since graduation. This is what keeps late starters, part-time students and
     returners from being punished for the shape of their calendar.
   - *Foundation* — structured grounding: completed programmes, coursework relevant to
     the target, certifications with an assessment behind them.
   - *Initiative* — unassigned work: self-started projects, contributions, competitions,
     communities, teaching, organizing.
4. **Weight and combine, publicly.** Depth carries the largest weight, velocity and
   foundation the middle, initiative the smallest. Numbers on the order of 0.35 / 0.25 /
   0.25 / 0.15 are a defensible starting point; what matters more than the exact figures
   is that they are declared in one place, versioned, and identical for everyone in the
   population.
5. **Return the sub-scores with the total.** A readiness score that arrives as a bare
   number cannot be argued with, corrected, or defended — see the
   [explainable-potential-breakdown](explainable-potential-breakdown.md) technique for
   what that output has to carry.

## Decision rules

- **When a dimension's input is missing, mark it unmeasured and reweight the survivors
  — never impute zero.** Zero is a measurement claim
  ([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)),
  and it is the specific claim "this person has none", which you did not establish.
- **When fewer than two dimensions have inputs, do not emit a readiness score at all.**
  Emit an insufficient-evidence state and route to human review. A single dimension
  standing in for readiness is a rate with a sample size of one
  ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **When the rubric's maximum is below the replaced dimension's maximum, fix the rubric,
  not the candidate pool.** Any ceiling below full range converts fairness intent into
  structural disadvantage.
- **When velocity's denominator would be a proxy for age, replace the denominator.**
  Time since first plausible start is legitimate; age, graduation year and birth cohort
  are not, and each will show up as adverse impact against returners and late starters.
- **When a dimension is easy to verify but weakly predictive (foundation is the usual
  case), reduce its weight — do not promote it to a gate.** A gate on foundation is a
  degree filter wearing a rubric's clothes.

## It is a structured argument, not a measurement

Say this out loud in the design review, because it determines what the score is allowed
to do. The weights are judgment; no training data exists for this population at the
granularity the rubric implies; the sub-scores are counts and bands over a file. That
makes the output a *structured, inspectable argument* about readiness — genuinely more
useful than a recruiter's impression, and genuinely not a measurement.

Two consequences follow and both are load-bearing. First, **the score never gates
anything on its own** — it orders, it informs, it opens a conversation; a threshold on
an unvalidated heuristic is a validated-instrument decision made with an unvalidated
instrument. Second, **instrument now so validation becomes possible later**: persist the
sub-scores, the inputs that produced them, and any process signals your assessments
generate, so that when outcomes accumulate the weights can be tested against something.
A rubric that discards its own inputs has guaranteed it will still be a guess in three
years.

Where the file is thin, the honest expression is a **wider confidence band with named
drivers**, not a lower score. "Early career with no demonstrated skills" and "fewer than
three distinct skills listed" are reasons a recruiter can read and act on; a quietly
depressed number is not.

## Calibration and drift

The weights are a hypothesis about what predicts success in *your* roles, and they must
be treated as one. Review them against outcomes on a schedule, and review them against
*distribution* every time you change them: if a weight change moves the median score of
one demographic group and not another, you have learned something about the weight, not
about the group. Note the coupling honestly — if the score gates who ever gets hired,
outcome data about hires cannot cleanly validate the weights that produced them; the
neighbouring calibration subject owns how to break that loop.

Keep a small set of hand-scored reference profiles — a strong graduate, a marginal one,
a career changer, an unclear file — and re-score them after every weight change. A
rubric edit that silently moves a reference profile across a decision threshold is a
policy change, and it should be reviewed as one.

## When not to use it

- **Not for candidates who have professional tenure to read.** Readiness is a
  replacement for a missing input, not an additional bonus lane. Running both for an
  experienced candidate double-counts their early years and quietly disadvantages the
  population this rubric exists to serve.
- **Not as a tiebreaker inside an experienced pool.** "Who has more initiative" between
  two senior candidates is a circumstance measurement, not a capability one.
- **Not where the role genuinely requires accumulated exposure** — a regulated practice
  with a statutory minimum, a role whose whole value is a decade of pattern recognition.
  There, the honest answer is that the role is not open to this population, stated
  plainly in the advertisement, rather than a rubric that lets people apply into a wall.
- **Not as a substitute for reading the artifact.** The rubric prices the file; it does
  not evaluate the work.
