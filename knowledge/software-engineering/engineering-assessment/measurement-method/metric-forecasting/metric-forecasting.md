---
layer: golden-path
type: golden-path
subject: metric-forecasting
status: forged
use_when: [projecting a tracked metric forward, estimating when a threshold will be crossed, deciding whether a trend line may be shown at all, pacing a goal against a deadline]
techniques:
  - trend-fitting-and-anchoring
  - threshold-crossing-eta
  - fit-confidence-honesty
  - projection-presentability-gates
  - pace-against-a-deadline
  - horizon-caps-and-flat-bands
---

# Metric forecasting

A tracked metric accumulates a history — a maturity score sampled weekly, a
coverage percentage recomputed per run, a defect count snapshotted nightly.
Forecasting takes that history and draws a claim about the future from it: the
metric is rising about two points a month, so the threshold that unlocks the
next tier arrives around the end of the quarter. This subject owns that claim
— the fit, the ray, the estimated date, the confidence attached to it, and,
load-bearingly, **the decision whether the claim may be displayed at all.**

The distinction from the neighbours is sharp and worth stating up front.
[metrics-rollups](../../../backend-platform/platform-observability/metrics-rollups/metrics-rollups.md) folds events into
buckets: it is backward-looking arithmetic over data that exists. This subject
consumes that output and manufactures data that does not exist.
[data-viz](../../../ui-surfaces/data-display/data-viz/data-viz.md) renders a series that was handed to it;
this subject decides what the series is *extended with*. Window boundaries,
grain, calendar alignment and "what does last 90 days mean" belong to the
[`analytics-time-windows`](../analytics-time-windows/analytics-time-windows.md) subject — assume them here, do not re-derive them.

## The asymmetry that defines the subject

A rendered forecast carries the same visual authority as a rendered
measurement. The dashed segment sits on the same axis, in the same colour
family, at the same pixel scale as the solid one; the estimated date is
formatted like every other date in the product. Nothing in the presentation
signals that the left half was observed and the right half was invented from
three points and a straight line.

That asymmetry — cheap to produce, expensive to be wrong about — is why the
governing discipline of this subject is **refusal, not accuracy**. Improving
the fit is a small win. Declining to draw a fit that should never have been
drawn is the large one, because a projection shown with insufficient evidence
does not degrade gracefully: it is read, quoted in a planning meeting,
screenshotted into a status update, and defended long after the underlying
series has moved. A slope read off a one-day span and extrapolated to a
promotion date is noise wearing a lab coat.

So the pipeline is ordered defensively: **gate first, fit second, disclose
third, cap last.** Every stage can veto; only the last stage renders.

## The fit is the easy part, and it is not the interesting part

Ordinary least squares over (day-offset, value) pairs is almost always the
right regression for this job, and the reasons are practical rather than
statistical. It is deterministic — the same history yields the same line on
every surface and in every rerun. It has one parameter a human can reason
about (points per day). It degrades predictably. And it is cheap enough to
compute on every read, which removes the entire class of bugs that comes from
storing a fit and letting it go stale against its inputs.

Reaching for something richer — exponential smoothing, seasonal
decomposition, a bootstrapped interval — is usually misdirected effort in this
domain, because the histories being fitted are *short* (five to fifty points)
and *irregular* (a scan runs when someone triggers it). Sophistication applied
to eight sparse points does not buy accuracy; it buys the appearance of rigour,
which is the specific failure this subject exists to prevent. Spend the effort
on the gates instead.

Two rules about the fitted line are not negotiable, and both are covered by
[trend-fitting-and-anchoring](./techniques/trend-fitting-and-anchoring.md):
the ray is anchored at **the last actual observation, not at the fitted value
for that date**, so the projection visibly continues the series a reader can
see rather than starting from a phantom point beside it; and the x-axis is
**elapsed time, not sample index**, because samples arrive irregularly and an
index-based slope silently reports "per sample" while the label says "per
week".

## An estimate is measured from now, not from the last sample

The most common arithmetic defect in a threshold estimate is subtle and
survives review easily. The fit is built over day-offsets relative to the
first observation; the crossing point is solved in that same offset space; and
the resulting offset is then converted to a date by adding it to the *last
observation's* timestamp. That is correct only if the last observation is
today. When the series went quiet for six weeks — which is exactly when
someone opens the forecast — the estimate lands six weeks early and keeps
sliding further wrong the longer the silence lasts.

The rule: **solve in the fit's coordinate space, then translate the answer
into calendar time anchored on the present moment.** An estimated date is a
statement about the future relative to *now*; a stale series should push the
estimate outward, and if the crossing offset is already behind us the honest
output is not a date in the past but "should already have crossed — the series
disagrees with the fit", which is a data problem, not a forecast.
[threshold-crossing-eta](./techniques/threshold-crossing-eta.md) owns the
crossing solve, the wrong-direction case, and what to do when the target is
already met.

## Confidence must be able to say "I don't know"

Every fit yields a goodness-of-fit figure, and every product wants to show it,
and the naive implementation makes it actively harmful. A least-squares line
through two points passes through both exactly and reports a perfect
coefficient of determination **by construction** — the fit has zero residual
because it has zero freedom. The consequence inverts the signal the number
exists to carry: the least trustworthy fit in the system advertises the
highest confidence, and it does so on precisely the new, thin, just-started
series where a reader has no other basis for judgement.

A confidence figure therefore has a floor of evidence beneath it, and below
that floor it is **withheld rather than computed**. Withheld is not zero: zero
means "measured, and the fit is bad", which is a different and more useful
statement than "not enough data to characterise the fit". Suppression must
also survive the trip downstream — the summary, the digest, the export and the
alert each need to be structurally unable to print a number that was never
earned. [fit-confidence-honesty](./techniques/fit-confidence-honesty.md) owns
the floor, the degenerate cases, and the suppression contract.

## The gate is point count *and* calendar span

The gate that decides presentability is the single highest-value component in
the subject, and the naive version — "at least N points" — is insufficient in
a way that fires constantly. Five samples taken in one afternoon while someone
tuned a configuration satisfy any point-count threshold and describe nothing:
the slope is per-day arithmetic over a span of hours, so an hour of fiddling
extrapolates to a wildly confident annual trajectory.

The gate therefore has two independent dimensions — **enough points, spread
over enough calendar days** — and both must pass. A third is worth adding
wherever the metric's definition can change underneath the series: points
gathered under a different definition are not on the same axis as points after
it, and a fit across that seam measures the redefinition, not the work. When a
rubric is reweighted or a metric's inputs change, the honest move is to treat
the change as a series boundary and fit only forward of it.

The refusal is as much a designed output as the projection. A gate that
returns a bare boolean forces every consuming surface to invent its own
explanation of *why* there is no line, and those explanations diverge — the
chart says "not enough data", the digest says nothing at all, the export
prints an empty column. **The refusal carries copy-ready prose naming the
missing evidence**, so every surface refuses identically and a reader learns
what would make the projection appear.
[projection-presentability-gates](./techniques/projection-presentability-gates.md)
owns the thresholds, the two-dimensional test, and the shape of the refusal.

## Pacing is a second projection, against a line rather than a level

A deadline turns forecasting from "when will this happen" into "will this
happen in time", and the two are not the same computation. A threshold
estimate compares a projection to a fixed level; pacing compares a projection
to **a moving target line** — the trajectory that would land exactly on the
goal at the deadline — and reports the signed gap between them plus the
remedy: the gain still required per remaining period.

That remedy figure is what makes pacing actionable where a bare verdict is
not. "Behind" prompts an argument; "behind — needs 3.1 points per week for the
remaining five weeks, against a current pace of 1.4" prompts a decision. The
verdict vocabulary itself must be defined once and derived everywhere, because
a surface that computes "at risk" with a different tolerance than the digest
that emails it produces two truths about one goal.
[pace-against-a-deadline](./techniques/pace-against-a-deadline.md) owns the
target line, the verdict bands, and the required-rate arithmetic.

One trap belongs here rather than in the technique, because it is a data-model
error that no amount of forecast arithmetic can repair: **progress computed as
current-over-target is not distance travelled.** A goal that starts at 60 and
targets 80 is 75% "complete" the moment it is created, and a pacing verdict
built on that ratio congratulates a team for standing still. Distance
travelled requires a **baseline captured at goal creation**; without one, the
only honest progress statement is the raw current value against the target.
The same missing baseline is why a goal whose target is already met at
creation must be rejected at creation — a goal with no distance to travel has
no pace, and every downstream verdict on it is a division by nothing.

Where such a degraded measure must ship anyway, the degradation is documented
**at the field that carries it**, naming what the number is not and which
field a consumer should trust instead. A ratio labelled "progress" with a
comment three modules away explaining that it is not progress will be read as
progress by everyone who never finds the comment.

## Every projection ends

A straight line has no natural end; a trustworthy forecast does. Two limits
bound it, both in
[horizon-caps-and-flat-bands](./techniques/horizon-caps-and-flat-bands.md).

A **flat band** sets the slope magnitude below which movement is
indistinguishable from noise. Inside the band the correct output is "flat",
not a crossing date twelve years out computed from a slope of 0.003 per day.
The band is a named constant with one definition, because "flat" appearing at
two different tolerances on two surfaces is the same metric disagreeing with
itself.

A **horizon cap** sets the distance past which any estimate is withheld
regardless of fit quality. Past roughly a year, a linear extrapolation of an
engineering metric is fantasy rather than planning: the team, the codebase,
the definition and the priorities will all have changed more than the slope
has. Report "beyond the forecast horizon" and stop. This is not a rendering
nicety — a far-future date is *more* dangerous than no date, because it reads
as a plan.

## What this subject refuses

- **A projection without a gate.** Point count and calendar span, both, before
  any line is drawn.
- **A confidence figure that cannot abstain.** Perfect fit through two points
  is the tell.
- **An estimate anchored on the last sample.** Estimates are measured from
  now.
- **A ray that starts beside the last dot.** Anchor on the observation, not on
  the fitted value.
- **An unbounded horizon.** Every projection has a date past which it stops
  claiming.
- **A pace verdict over a ratio with no baseline.** Without a creation-time
  baseline there is no distance travelled to pace.
- **A refusal that is only a false.** Refusals carry their reason, in words, to
  every surface.

## The techniques

- [trend-fitting-and-anchoring](./techniques/trend-fitting-and-anchoring.md) —
  least squares over elapsed time, the ray anchored at the last real
  observation, and why the fit is recomputed rather than stored.
- [threshold-crossing-eta](./techniques/threshold-crossing-eta.md) — solving for
  the crossing, translating the offset into a date measured from now, and the
  wrong-direction and already-met branches.
- [fit-confidence-honesty](./techniques/fit-confidence-honesty.md) — the
  degenerate perfect fit, the evidence floor beneath any confidence figure, and
  suppression that survives downstream.
- [projection-presentability-gates](./techniques/projection-presentability-gates.md)
  — the two-dimensional gate, the definition-change seam, and the copy-ready
  refusal every surface shares.
- [pace-against-a-deadline](./techniques/pace-against-a-deadline.md) — the target
  line, the verdict vocabulary, the required gain per remaining period, and the
  baseline the whole computation rests on.
- [horizon-caps-and-flat-bands](./techniques/horizon-caps-and-flat-bands.md) —
  the noise floor below which a slope is flat and the distance past which a
  date is withheld.
