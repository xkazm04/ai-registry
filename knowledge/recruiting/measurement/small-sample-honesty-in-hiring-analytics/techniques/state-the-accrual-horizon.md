---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: state-the-accrual-horizon
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
use_when: [a rate is computed on a cohort still in flight, answering "when will this be reliable", labelling a preliminary figure]
shared_with: []
---

# State the accrual horizon

A minimum answers *how many*. The accrual horizon answers *how long* — and in
hiring, where outcomes take weeks to months to resolve, the second question is
as load-bearing as the first and is asked far less often.

A cohort that has not finished happening yet produces an outcome rate that is a
lower bound. It will keep rising after publication with no change in anyone's
behaviour, purely because more of the cohort finishes. A figure can clear every
sample floor and still be wrong in a known direction for a known duration. That
is not thin data; it is **immature** data, and it needs its own statement.

The mechanics of cohorts and censoring belong to the funnel-metrics discipline.
What belongs here is the rule that **maturity is part of the minimum**, stated
per claim, and that stating it converts a refusal from a dead end into a plan.

## Procedure

1. **Derive the horizon from the process, not from a calendar convention.** How
   long does it actually take, at this organization, for a member of this cohort
   to reach the outcome being counted? The median duration of that leg is the
   floor of the horizon; the tail is why the horizon is longer than the median.
2. **State it next to the claim** in the same place as the sample minimum:
   this rate requires a cohort at least this old.
3. **Label anything younger as preliminary**, with its maturity — what fraction
   of the cohort has resolved. A rate with 40% of its cohort still open is a
   different claim from the same rate on a closed cohort, and the difference is
   the number that has to be shown.
4. **Prefer an older matured cohort to a newer immature one** whenever a rate
   is needed for a decision or a projection. Staleness is a smaller error than
   systematic downward bias, and it is an error in a direction people can
   reason about.
5. **Answer the question the refusal provokes.** "Not enough data yet" invites
   *when?*. Compute it: the count needed, the current rate of accrual, and the
   resulting date. A refusal with a date attached is a plan; without one it is
   an excuse, and teams route around excuses.

## Horizons differ by an order of magnitude

Stating a single horizon for a whole dashboard is the same error as a single
sample minimum:

- **Offer acceptance** matures in days to a couple of weeks — offers carry
  deadlines, so the cohort closes fast and the rate is one of the most
  trustworthy numbers available.
- **Application-to-hire conversion** matures over roughly one median cycle time,
  plus the tail of revived candidates.
- **Time to hire** matures only when the slow half of the cohort has finished,
  which is why a terminal-transition basis makes a process that just got slower
  look unchanged for weeks.
- **Quality of hire and early attrition** mature in months, and a figure quoted
  before then is measuring who happened to leave quickly.
- **A score's predictive validity** matures only after enough hires have accrued
  enough tenure to have an outcome worth predicting — which for a
  twenty-hires-a-year organization is a multi-year horizon and should be said
  out loud rather than implied by a permanently refusing curve.

## Decision rules

- When a cohort is immature, the figure is labelled preliminary and its
  censoring is stated; it does not enter a headline, a target comparison or an
  external quote.
- When a figure is compared across periods, the periods must be equally mature.
  Comparing a closed quarter against a current one is a guaranteed apparent
  decline, and it is the most common false alarm in hiring reporting.
- When a horizon has not elapsed and a decision must be made anyway, use the
  observations directly rather than the rate — the thin-state substitution
  applies to immaturity as well as to smallness.
- When a rate is used as an input to a projection, only a matured rate may be
  used. A projection built on a lower-bound conversion is biased low by
  construction and the bias compounds through every leg.
- When the horizon is long enough that the metric will refuse for months, say
  that at the point of refusal. A curve that will not exist for two years should
  not present as though next week might fix it —
  [inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
  extends to implying an evidence trajectory the process cannot deliver.
- When a composite blends inputs of different maturities, its horizon is the
  longest of them, and its date is the oldest contributing input, not the moment
  of computation.

## When not to use this

Do not apply a horizon to a claim about the *current* state. In-flight
population, candidates aging in a stage, open requisitions and today's queue
are snapshot facts and are true now; demanding maturity of them withholds
exactly the operational picture the horizon concept was never about.

Do not use the horizon to defer indefinitely. If a claim's honest horizon
exceeds the time any decision-maker will wait, the correct answer is that the
claim is not available to this organization at this scale — say so once, and
offer the observation-level substitute
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)),
rather than leaving a permanently pending metric on the page teaching everyone
to ignore it.
