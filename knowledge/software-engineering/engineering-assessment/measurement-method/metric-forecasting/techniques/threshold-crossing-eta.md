---
layer: technique
type: technique
subject: metric-forecasting
technique: threshold-crossing-eta
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [estimating when a metric will reach a target level, answering "when do we hit the threshold"]
---

# Threshold-crossing estimates

Given an anchored projection and a target level, the crossing estimate answers
"when". It is one division and a date addition, and almost every defect in it
lives in the date addition.

## The solve

Distance to cover is target minus the **last actual value** — the anchor, not
the fitted value at that date. Days required is that distance divided by the
slope. That quotient is a duration in the fit's coordinate space, and it is
correct.

The translation to a calendar date is where implementations go wrong:
**add the duration to now, not to the last observation.** The two coincide
only when the series was sampled today. When the last sample is six weeks old
— which is exactly the state a series is in when someone opens the forecast
after a quiet period — anchoring on it produces an estimate six weeks early,
and the error grows for as long as the silence lasts. Worse, the estimate
*improves* on paper the longer nothing happens, because the gap between the
stale anchor and the present is invisible in the output.

An estimated date is a claim about the future relative to the present moment.
Compute it that way. The estimate then carries its predicate — target level,
slope, anchor value, and the observation count and span behind the fit — or a
reader cannot tell a date built on thirty points across a year from one built
on four points across a week, and [a number that travels carries what produced
it](../../../../_laws.md#count-carries-predicate).

## The branches that must exist before the division

A crossing computation that goes straight to the division is wrong in at least
four states. Each needs its own output, and each output is a *different kind
of statement*, not a different number:

- **Already at or past the target.** The answer is "met", with the date it was
  met if the history shows the crossing. It is never a date in the future, and
  it is never a negative duration formatted as a date.
- **Slope moving away from the target.** Rising when the target is below,
  falling when it is above. The correct output is "moving away — not on track
  to reach this", not a date, and not a suppressed empty. This is the state
  most worth surfacing loudly, because it is the one a bare "no estimate
  available" hides.
- **Slope inside the flat band.** Movement below the noise floor yields a
  crossing decades out. Report flat; the band is defined in
  [horizon-caps-and-flat-bands](./horizon-caps-and-flat-bands.md).
- **Crossing already behind us.** The solve produces a past date: the fit says
  the metric should have crossed, and the series says it has not. That is a
  contradiction between fit and reality, and it is reported as such — the fit
  is not describing this series any more. Never format a past date as an
  estimate.

Only after those branches does the division run, and its result then passes
through the horizon cap before it becomes a date.

## The present is an input, not a clock read

"Measured from now" is a correctness rule and also a testability one. If the
crossing code reads the clock itself, the only clock-dependent output in the
whole forecast is buried inside a pure computation, and the function becomes
untestable at exactly the branches that matter — stale series, crossings
already behind us, deadline edges.

Make the present a **parameter with a sensible default**. The fit reads no
clock at all; only the date translation does, and it receives the moment
rather than fetching it. The whole forecast is then deterministic given its
inputs, a test can place "now" six weeks after the last observation in one
line, and the same function is safe to call inside a request handler where a
mid-computation clock change would otherwise produce two different presents.

## Bucket the anchor exactly as the rest of the system does

When the target is a boundary in a banded scheme — a tier, a grade, a
maturity level — the crossing computation must classify the anchor with **the
same rounding and clamping the display uses.** The failure is quiet: a
fractional current value of 64.7 sits between two integer bands, matches
neither, falls through to a defaulted index, and produces an estimate whose
"from" state contradicts the state shown beside it on the same screen. A
reader sees "currently tier 3" and "tier 1 to tier 2 in about five weeks".

Round once, at the entry to the computation, using the shared classifier —
not a second implementation of the same bands. Boundaries are a closed
vocabulary; two roundings of it are two vocabularies.

## Precision is a claim, and the estimate should not overclaim

An estimate derived from eight sparse points does not support a day-precise
date, and printing one invites planning against it. Round the output to the
resolution the evidence supports — a week for short histories, a month for
long horizons — and phrase it as approximate ("around mid-March"). The
underlying value stays exact for sorting and comparison; the *rendering*
coarsens. Two surfaces showing "March 14" and "mid-March" for the same
estimate is fine; two surfaces showing "March 14" and "March 21" is a
duplicated computation and a defect.

Where the fit's confidence is high enough to warrant it, a range beats a
point: earliest and latest crossing under the slope's uncertainty. Where it is
not, a range fabricated from a two-point fit is worse than a single date,
because a range reads as a considered interval.

## Decision rules

- **When the last sample is stale, still measure from now.** Staleness pushes
  the estimate outward; that is correct behaviour, not a bug to compensate
  for.
- **When the target is already met, say met.** A goal already met at creation
  should not have been created; see the baseline discussion in
  [pace-against-a-deadline](./pace-against-a-deadline.md).
- **When the slope points away from the target, say so explicitly.** Silence
  reads as "no data"; the truth is "wrong direction".
- **When the estimate exceeds the horizon cap, withhold the date.** A
  three-year date reads as a plan.
- **When two surfaces show the same estimate, they call the same
  computation.** Round differently if you must; never re-derive.

## When not to use this

- **Non-monotone targets.** A metric that oscillates around the threshold will
  produce a crossing date that flips wildly between refreshes; report the
  band it oscillates in instead.
- **Thresholds that are not the interesting question.** Many metrics have no
  meaningful level to cross — latency, cost per unit — and forcing a threshold
  onto them produces an arbitrary date. Pace against a deadline or report the
  trend alone.
- **When the presentability gate refused.** No fit, no estimate; the gate runs
  before this technique, not after it.
- **Targets that move.** If the threshold itself is recomputed from the data
  (a percentile of peers, a rolling baseline), the crossing solve must account
  for both lines moving, or it will chase a target that recedes.
