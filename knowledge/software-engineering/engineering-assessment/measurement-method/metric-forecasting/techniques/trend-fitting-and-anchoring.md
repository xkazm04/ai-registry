---
layer: technique
type: technique
subject: metric-forecasting
technique: trend-fitting-and-anchoring
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [fitting a trend to a short metric history, drawing a projected ray on a chart]
---

# Trend fitting and anchoring

The projection begins with two decisions that look like implementation detail
and are not: **what the x-axis actually measures**, and **where the projected
ray starts**. Get either wrong and the arithmetic downstream is precise and
meaningless.

## Fit over elapsed time, never over sample index

Regress value against **day-offset from the first observation**, not against
the position of the sample in the array. The two agree only when sampling is
perfectly regular, and metric histories are not: a scan runs when someone
triggers it, a nightly job misses a week, a burst of five samples lands in one
afternoon during a configuration change.

Under index-based fitting the slope's unit is "per sample", but every label,
every estimate and every pace calculation downstream will read it as "per
day". The error is not a constant factor — it varies with how irregularly the
series was sampled, so it is largest on exactly the neglected series where
nobody is checking. Offsets are computed in whole days from the first
observation, and the first offset is zero.

The slope that results carries its predicate or it is not a slope: **points
per day, over N observations spanning D days**, and it
[travels with those facts attached](../../../../_laws.md#count-carries-predicate).
A bare number labelled "trend" will be reused for a claim it does not support.

## Collapse to one observation per day before fitting

Raw histories are lumpy: someone triggers three runs in an hour while
debugging, and a retry lands two identical measurements a minute apart. Fed
straight into the regression, that afternoon contributes three points at
effectively one x-value, weighting the fit toward whatever was happening
during the burst — and inflating any point count the gate downstream will
check.

Collapse first: **one value per calendar day, taken as the mean of that day's
observations, at full precision**, and then fit over the distinct day keys.
Two consequences follow and both matter. The x-values become genuinely
distinct, so the slope is a per-day rate rather than a per-burst artefact. And
"how many points does this fit rest on" becomes **how many distinct days**,
which is the number the presentability gate must see — a series of forty rows
gathered on two days is a two-point fit, and only the collapsed count says so.

## Filters applied for display must not reach the fit

Surfaces routinely narrow what a viewer sees: a retention limit, a permission
scope, a zoom range, "last 90 days". Those clamps belong to the **rendered
series**, never to the series the fit consumes. A projection computed over a
clipped history is a different projection — a shorter window changes the
slope, the confidence and the estimated date — so two viewers with different
retention would receive two different futures for one metric, with nothing on
screen explaining the disagreement.

The rule: **fit the full retained history; clamp only what is drawn.** If a
viewer genuinely may not see the data behind the projection, the honest
options are showing the projection without its full history or withholding it
— not silently refitting on the subset.

## Ordinary least squares, and why nothing fancier

Least squares over the (offset, value) pairs is the correct default here, for
reasons that are about the operating conditions rather than about statistics:

- **Deterministic.** Same history in, same line out, on every surface and
  every rerun — a precondition for two surfaces agreeing about one metric.
- **One interpretable parameter.** A human can sanity-check "1.4 points per
  week" against their own sense of the work. Nobody sanity-checks a smoothing
  coefficient.
- **Cheap enough to recompute on read.** Which is the point of the
  [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
  obligation: a fit stored alongside its series is a second copy of the truth
  that goes stale the moment a new observation lands. Recompute from the
  series on every read, and there is nothing to invalidate. If a fit ever
  *must* be stored — for a nightly digest, say — the record names the series
  version it was computed from and the code that rebuilds it.

Seasonal decomposition, exponential smoothing and bootstrapped prediction
intervals are not upgrades in this domain. They need history these series do
not have (five to fifty irregular points), and their output *looks* more
authoritative while resting on the same thin evidence. Sophistication over
sparse data manufactures confidence, which is the failure mode the whole
subject is defending against.

## The ray is anchored at the last real observation

The fitted line has a value at the last observation's date. The last
observation has a value. **These differ, and the projection starts from the
observed one.**

Starting from the fitted value produces a visible defect and an invisible one.
Visibly, the dashed segment begins at a point floating beside the final solid
dot — a reader sees the forecast disagreeing with the data it was built from
and is right to distrust everything after it. Invisibly, every downstream
number inherits the offset: the estimated crossing date shifts by the residual
divided by the slope, which on a noisy series with a shallow slope can be
weeks.

The construction, then, is: **take the slope from the fit, take the origin
from reality.** Projected value at a future offset is the last actual value
plus slope times days elapsed since that observation. The fit contributes
direction; the series contributes position.

The same rule applies at the other end when the series is drawn: the
projection is a continuation of the observed series, sharing its axis, its
scale and its final point — not a second series overlaid on it.

## Clamping, and where it belongs

Bounded metrics (a percentage, a 0–100 score) will be projected past their
bound by any linear fit given enough horizon. Clamp the *rendered* value to
the bound, but do the crossing arithmetic on the unclamped line — a clamped
series has slope zero at the ceiling and yields no crossing date at all.
Hitting the ceiling is itself a reportable event: "projected to reach the
maximum around <date>" is more useful than a flat line pinned at 100.

## Decision rules

- **When samples are irregular, fit over elapsed days.** Always; there is no
  case where index-fitting is correct and day-fitting is not.
- **When the fit and the last observation disagree, believe the observation.**
  Anchor there.
- **When the series has a definition change in it, fit only forward of the
  change.** Points on two different definitions are not on one axis.
- **When the slope is needed on two surfaces, compute it in one place.** Two
  fitting implementations over one metric is one metric with two futures.
- **When a fit must be persisted, record the inputs that produced it.** Point
  count, span, and the observation it was anchored on.

## When not to use this

- **Step-function metrics.** A value that changes by discrete jumps on release
  days (a version number, a tier, a count of shipped milestones) has no
  meaningful continuous slope; the useful projection is over the *rate of
  jumps*, not the value.
- **Metrics with a known driver.** If the metric moves because a scheduled
  campaign, migration or hiring plan moves it, the plan is a better predictor
  than the history, and the fit will lag it by construction.
- **Series shorter than the presentability gate allows.** No fit is computed
  at all in that case — the gate runs first.
- **Strongly seasonal series** where a within-cycle fit reads the season as a
  trend. Compare like phases, or aggregate to whole cycles before fitting.
