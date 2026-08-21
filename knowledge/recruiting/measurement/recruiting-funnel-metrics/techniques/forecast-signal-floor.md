---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: forecast-signal-floor
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [projecting hires from a pipeline, deciding whether a forecast may render, reconciling two hire projections]
---

# The forecast signal floor

A hire forecast is the funnel's definitions compounded — three or four
conversion legs multiplied together — so basis errors that would be tolerable
in a single rate become dominant. Two disciplines make a funnel forecast
defensible: build it twice from independent inputs, and refuse to build it at
all below a floor.

## Build it twice, from sources that can disagree

**Estimator A — inflow velocity.** Recent new-candidate inflow per unit time,
projected over the horizon, multiplied by the observed end-to-end conversion
from entry to hire. Sees future candidates. Blind to everyone already in the
pipeline, and lagged by the whole cycle time.

**Estimator B — in-flight credited forward.** Every candidate currently in the
pipeline, credited by the conversion remaining from *their own* stage to hire.
Sees the near horizon precisely. Blind to candidates not yet arrived, and
therefore always low beyond one cycle time.

The two are genuinely independent — different populations, different failure
modes — which is what makes their disagreement informative. Rules:

- The near horizon is dominated by B, the far horizon by A; the crossover is
  roughly one median time to hire out.
- **Their spread is the interval.** Present the range, not the average of the
  two, and never silently pick the friendlier estimator. Convergence is the
  only honest basis for a point figure.
- Crediting in-flight candidates from their **own** stage, not from a single
  pipeline-average conversion, is what stops a pipeline stuffed with fresh
  applications from reading like a pipeline of finalists.

## Replace implied legs with observed facts

Where a leg's rate is directly observed, the observation replaces the
funnel-implied estimate for that leg. Offer acceptance is the standard case:
the acceptance rate is measured from terminal events and is one of the most
reliable numbers in recruiting, whereas the funnel-implied offer-to-hire
conversion is an estimate derived from stage transitions that may be
incompletely recorded. Using the implied one when the observed one exists
throws away a fact in favour of an inference
([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
cuts both ways: do not dress an inference as a measurement, and do not
demote a measurement to an inference).

The same applies to any leg with a directly recorded terminal event.
Structural legs — scheduling, background checks — often have a known fixed
turnaround that beats any rate estimated from thin data.

Two conditions make the substitution safe. First, the observed rate is applied
in **both** estimators consistently: candidates already sitting at the offer
stage are credited the measured acceptance rate directly, not the
funnel-derived one, or the same leg is priced two ways inside one forecast.
Second, when the observed rate is unavailable — below its own floor, or the
leg does not exist for this funnel — the projection must fall back to
*exactly* its prior behaviour, unchanged. A refinement that also moves the
number when it silently fails to apply cannot be reasoned about, and the first
unexplained jump destroys the forecast's credibility permanently.

## The floor

Below a threshold of observed transitions on the legs the model needs, the
forecast is reporting the shape of the model rather than the state of the
pipeline. It must then render as *not enough signal yet*, naming what is
missing — not as zero, not as a confident small number, not as a wide band
that a reader will take as a range
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

What the floor is set on, in order of how often it is forgotten:

1. **Observed hires** for the end-to-end conversion leg. Zero completed hires
   means no measured conversion, and a forecast built on an assumed one is
   fiction with a decimal point.
2. **Observed transitions per leg.** A single leg with two observations
   dominates the product and injects its variance into everything downstream.
3. **In-flight population size.** Estimator B on three candidates is three
   candidates' individual luck, not a projection.
4. **History length.** Inflow velocity from four days of data is a weekday
   pattern, not a velocity.

The exact thresholds are the small-sample discipline's to set; the
requirement that they exist and that the refusal is a distinct state is
[the law](../../../_laws.md#a-claim-carries-its-sample-and-its-basis). The
critical property is that the refusal is *typed*, not a value: a forecast that
returns zero when it means "unknown" will be read as "no hires coming", which
is a specific and expensive false claim.

## Decision rules

- When the two estimators differ by more than roughly a factor of two, publish
  the range and the reason (usually: a large in-flight backlog, or a sudden
  inflow change) — a point estimate through that much disagreement is a
  guess wearing a number.
- When the horizon exceeds two median cycle times, the forecast is an
  extrapolation of inflow with no pipeline evidence behind it; say so or stop
  the horizon there.
- When conversion is estimated from a cohort that has not matured, it is a
  lower bound, and a forecast built on a lower-bound conversion is biased low
  by construction. Use matured cohorts for rates even when that means using
  older ones.
- When simulated, demo or seeded rows exist in the data, they are excluded
  from every forecast input. A seeded pipeline produces confident hire
  projections for candidates who do not exist.
- When the forecast is shown next to a target, the target's provenance travels
  with it — who set it and when. A projection compared against a number nobody
  set is presentation, and the honest-presentation discipline governs it.

## When not to use this

Do not forecast from a funnel for hiring that is not funnel-shaped. Executive
search, single-hire specialist roles and any pipeline where one candidate is
the plan have no rate to compound; the honest answer is the named list of
candidates and their stages, and a projection over three people is a
restatement of the recruiter's opinion with arithmetic on top.

Do not use a funnel forecast to set individual recruiter targets. The model
is most sensitive to the inputs a recruiter most directly controls — number of
candidates entered, stage transitions recorded — which converts the forecast
into an instruction to enter more candidates and advance them, degrading both
the pipeline and the measurement that watches it.
