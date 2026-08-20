---
layer: technique
type: technique
subject: metric-forecasting
technique: fit-confidence-honesty
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [reporting how well a trend fits, deciding whether to show a confidence figure, suppressing a noisy projection downstream]
---

# Fit-confidence honesty

Every least-squares fit yields a goodness-of-fit figure — typically the
coefficient of determination, the share of variance the line explains. Showing
it feels like the honest move. Implemented naively it is the opposite: the
figure is highest exactly where the fit deserves least trust.

## The degenerate perfect fit

A straight line through two points passes through both **by construction**.
Residuals are zero, explained variance is total, and the reported coefficient
is a perfect 1.0. The same holds for any fit with as many parameters as
observations, and it holds for a single point trivially. The number is not
measuring fit quality at all; it is measuring the absence of freedom.

The consequence is an inverted signal. A series with thirty observations and
genuine scatter reports 0.62 and looks uncertain. A series with two
observations — a brand-new metric, one scan and a retry — reports 1.00 and
looks certain. The reader has no other basis for judgement on a brand-new
metric, which is precisely why they are looking at the confidence figure, and
it lies to them at exactly that moment. Every surface that sorts, filters or
badges by confidence will then rank the thinnest evidence first.

There is a second degenerate case, less obvious and reachable with any number
of points: **a series with zero variance**. Explained variance is a ratio
whose denominator is the total variance of the observations, so a perfectly
flat history — the metric has not moved in twenty samples — divides by zero.
The conventional resolution is to call the fit perfect, which is defensible
(the line does pass through every point) and dangerous, because it hands a
motionless metric the highest possible confidence. Report it, but only ever
alongside the flat verdict from the band check: "flat, and confidently so" is
a true and useful statement; "confidence 1.0" printed next to a projected
crossing date is not, and cannot occur if the flat check runs first.

The fix for both cases is not a better formula. It is a **floor of evidence
beneath the figure**: below a minimum number of observations — three at the absolute least,
and more where the metric is noisy — the coefficient is not computed and not
reported. Above the floor it is reported as measured, including when it is
bad.

## Withheld is not zero, and both are not "fine"

Three states must be distinguishable in the output, because they license three
different reader behaviours:

- **Measured and good** — the line explains the movement; the projection may
  be leaned on.
- **Measured and poor** — enough points to judge, and the line does not
  explain them. The series is noisy or non-linear; the projection is
  directional at best. This is a *finding*, and a valuable one.
- **Not measurable** — too few points to characterise anything.

Collapsing the third into the second (reporting zero) understates a new
series; collapsing it into the first (reporting the degenerate 1.0)
catastrophically overstates it. Collapsing either into a missing field leaves
the consumer unable to tell "we looked and it is bad" from "we could not
look" — which is the general shape of
[failure spelled as empty success](../../_laws.md#failure-not-empty-success),
and it is why the wire format needs an explicit not-measurable state rather
than a nullable number.

Whatever figure is emitted also carries its basis — the observation count and
the calendar span behind it — since
[a number that travels carries its predicate](../../_laws.md#count-carries-predicate)
and a confidence value copied into a report without its n is unfalsifiable.

## Suppression must survive the trip downstream

The confidence figure rarely stays where it was computed. It flows into a
summary tile, a periodic digest, an export, an alert threshold, a generated
narrative paragraph. Each of those is a new opportunity to print a number that
was never earned — most commonly by defaulting a missing value to zero during
serialization, or by a template that formats whatever it is handed.

Two structural defences, in order of strength:

1. **Do not emit the field when it is not measurable.** A consumer that cannot
   receive the number cannot print it. This is stronger than any convention,
   because it moves the guarantee from discipline into the type.
2. **Where the field must exist, make the not-measurable state
   unformattable** — a distinct variant rather than a sentinel numeric. A
   sentinel of zero, -1, or null will eventually be rendered as "0%
   confidence", "-100%", or "null".

Downstream narrative surfaces need one more rule: **when the fit is noisy,
omit the confidence figure from the prose rather than qualifying it.** A
generated sentence that says "rising 2 points per week (confidence 0.21)"
gives the number the same authority as the trend it undercuts; readers retain
the trend and discard the parenthesis. Either the projection is presentable
and stated plainly, or the sentence says the trend is too noisy to project and
stops.

## Decision rules

- **When observations are at or below the number of fitted parameters,
  withhold.** Two points, one line — no confidence figure exists.
- **When the coefficient is poor but measured, show it.** Bad fit is
  information; hiding it is how a noisy metric acquires a reputation for
  stability.
- **When serializing, prefer absence to a sentinel.** Absent fields cannot be
  formatted; sentinels can.
- **When a narrative surface would qualify a figure, drop the figure
  instead.** Prose has no room for an asterisk that readers honour.
- **When confidence is used as a sort key, exclude the unmeasurable rather
  than sorting them to either end.** They are not a rank; they are a
  different question.

## When not to use this

- **As a gate on its own.** Confidence answers "does the line describe these
  points", not "are there enough points to draw a line" — that is the
  [presentability gate](projection-presentability-gates.md), and it runs
  first. A high coefficient never rescues a series that failed the gate.
- **As a proxy for forecast accuracy.** Explained variance over the observed
  window says nothing about behaviour outside it; a perfectly linear past can
  end tomorrow.
- **On very small ranges.** When the metric barely moved, the coefficient is
  dominated by measurement noise and will read low no matter how stable the
  series is. Pair it with the flat-band check rather than reporting it alone.
