---
layer: technique
type: technique
subject: analytics-time-windows
technique: baseline-as-window-start
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [adding a "change over this period" figure, choosing between a prior-period window and a point baseline, reconciling two surfaces that disagree about a delta]
---

# Baseline as window start

When a window is asked "compared to what?", the answer already exists inside
the window: **the state as of its own start**. The baseline is a point read at
`start`, not a second window of equal length placed before it.

This is a semantic choice with structural consequences, and it is usually the
right one for the question users actually ask of a period surface: *how much
has this moved since the period began?*

## What the point baseline buys

- **One range interpretation.** There is no prior window to snap, align,
  clamp or zone independently, so there is no second interpretation to drift
  from the first.
- **One read, one snapshot.** Two fetches race: data lands between them and
  the delta is computed across two moments. A point read taken alongside the
  current read is a single consistent view.
- **No partial-period problem.** The classic prior-period defect is comparing
  a complete previous period against a current one that is nine days old. A
  point has no length and therefore no partiality.
- **An honest denominator.** Percentage change from a point baseline divides
  by a value that existed, at a stated instant, rather than by an aggregate
  over a span that may have been clamped.
- **It matches the panel beside it.** A movers list, a leaderboard, a
  "biggest changes" panel all work per entity from a start state. A headline
  computed the same way cannot contradict them.

## Procedure

1. **Resolve the window once** (see
   [range-precedence-resolution](range-precedence-resolution.md)) and take
   `start` from it. The baseline instant is the window's start, not "start
   minus one" and not the previous period's end computed separately — those
   are the same value under
   [half-open intervals](half-open-interval-policy.md), and computing it twice
   is how they stop being the same.
2. **Read the baseline as an as-of state, strictly before `start`.** The
   baseline is each entity's latest recorded value with a timestamp `< start`
   — *not* `<= start`. This is not a style detail: under
   [half-open intervals](half-open-interval-policy.md) an observation stamped
   exactly at `start` belongs to the window, and an inclusive baseline
   predicate makes that same observation both the baseline and the first
   in-window point, so it is compared against itself for a guaranteed zero
   delta. Observations landing on clean boundary instants — seeded snapshots,
   midnight recomputations — are common enough that this fires in practice.
3. **Push the per-entity "latest before" reduction into the storage engine.**
   The baseline is one row per entity, ordered by timestamp descending,
   distinct on entity identity. Pulling the whole pre-window history into
   application memory to deduplicate in a loop makes the cost scale with the
   *age of the dataset* rather than with the period — an account observed
   daily for a year drags tens of thousands of rows across the boundary to
   produce a few hundred baseline values, and the surface gets slower every
   month with no change in what it displays.
4. **Handle "no baseline exists" as a distinct outcome, not as zero.** An
   entity created inside the window has no state at `start`. Zero is a
   measurement; absence is not. Suppress the delta for that entity, count it
   under composition change, and let the headline say so — the difference
   between "no prior value" and "prior value of zero" is exactly the
   difference between an honest gap and a fabricated +100%.
5. **Carry the baseline instant into the output.** The delta travels with the
   instant it was measured from; a change figure without its baseline moment
   is [a count without its predicate](../../_laws.md#count-carries-predicate)
   and will be quoted against a period it does not describe.
6. **Restrict the delta to the matched cohort.** The point baseline removes
   the window-alignment defects; it does not remove the composition defect.
   That is [cohort-matched-comparison](cohort-matched-comparison.md), and the
   two techniques are always applied together.

## Decision rules

- **When the user's question is "how has this changed over the period", use
  the window start.** This is the default for period surfaces, executive
  summaries and progress readouts.
- **When the user's question is "is this period better than the last one",
  use a matched prior window instead.** Volume metrics — requests served,
  revenue booked, items shipped — are period *totals*; they have no
  meaningful point value, so a point baseline is not available. State-shaped
  metrics — a score, a coverage percentage, a count of open items — have a
  value at an instant, and the point baseline is available and preferable.
  The rule follows the metric's shape, not taste.
- **When both figures are shown on one surface, label them differently.**
  "Since the quarter began" and "vs. last quarter" are different claims; two
  panels showing different numbers under the same word "change" is a support
  ticket.
- **When a matched prior window is genuinely required, fetch it as one
  doubled read and split it locally** rather than issuing two requests —
  bucketing and comparison mechanics for that path belong to
  [metrics-rollups](../../metrics-rollups/metrics-rollups.md).
- **When the window has no start, there is no baseline and no delta.** An
  "all time" period is unbounded below; the honest response is to suppress
  every comparison figure on the surface rather than substitute the earliest
  observation, which would silently turn "all time" into "since the first
  record", a different and much noisier claim.
- **When the baseline read is expensive, cache it by window start, not by
  "now".** The baseline for a fixed window is immutable once the window has
  opened, which makes it the cheapest thing in the pipeline to cache and the
  easiest to get wrong by keying it on request time.

## When not to use it

- **Flow metrics with no state.** Counts of events that occurred cannot be
  read "as of" an instant; there is no baseline value, only a prior total.
- **Windows that end in the past.** For a closed historical window the
  "start" baseline still works, but the comparison users usually want is
  against the adjacent period, because the window is being read as a completed
  unit rather than as progress.
- **Very short windows over slow-moving state.** If the metric only changes
  weekly and the window is a day, the delta is structurally zero and the
  figure is noise dressed as information; suppress it rather than render it.

## Smells

- Two separate fetches whose results are subtracted.
- A "since the start of the period" figure whose baseline query has a range
  predicate.
- A percentage change of exactly +100% appearing whenever an entity is new.
- A delta rendered with no baseline instant anywhere in the payload or the UI.
- A baseline cache keyed on the request timestamp.
