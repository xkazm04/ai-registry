---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: non-overlapping-event-to-series-mapping
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [building a multi-series pipeline chart, series totals exceed the event count, choosing weekly buckets]
---

# Non-overlapping event-to-series mapping

A pipeline activity chart is a partition of one event stream into named
series. If the mapping is not a partition, one transition lands in two series
and every derived total is wrong in a way that looks like a busy month.

## The partition rule

Write the mapping as a **total function from one transition to exactly one
series**, evaluated in a fixed order, with a default arm. Three properties,
all of which must be asserted rather than assumed:

- **Exhaustive** — every transition maps somewhere, including transitions
  introduced after the chart was written. A new stage role appearing in the
  data must land in a named residual series, not vanish. A series total that
  is quietly less than the event count is the same failure as a double count,
  pointed the other way.
- **Mutually exclusive** — no transition satisfies two arms. The classic leak:
  an "advanced" series defined as any forward move and an "interviews" series
  defined as arrival at interview. Every interview arrival is also a forward
  move, so the chart shows more activity than occurred, and the excess is
  largest exactly where the pipeline is healthiest.
- **Ordered and first-match** — where categories genuinely overlap in
  ordinary language, resolve by precedence written down once, not by whichever
  condition the code happens to test first.

The cheap and complete test: the sum of all series over a window equals the
count of transitions in that window. If it does not, the mapping is not a
partition. Assert it in the aggregation, not in a reviewer's head.

## Map from the role, not the label

Series arms key off the stable stage role and the transition's direction —
entry, screening, interview, offer, terminal, and forward versus backward —
never off a display string
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
A chart whose arms match on stage names silently re-partitions itself the day
a team renames a column, and its history changes retroactively with no edit to
the chart.

Direction is part of the arm. A candidate moved backwards is not "activity" in
the same sense as forward movement, and folding the two together makes a
churning pipeline look productive.

## Rolling windows, not calendar buckets

Bucketing a series by calendar week produces two artifacts that dominate the
signal:

- The **current partial week** always reads as a collapse, every week, until
  it closes. Everyone learns to discount the right edge of the chart, which
  means they discount the most recent data — the only data that could still be
  acted on.
- **Holiday and short weeks** read as process changes. A shutdown week and a
  hiring freeze are indistinguishable on a calendar-week series.

Rolling fixed-length windows anchored on the observation moment — the last 7
days, the 7 days before that — say what people believe a weekly chart says:
every bucket is the same length, every bucket is complete, and the comparison
between adjacent buckets is a comparison of like with like. The cost is that
buckets are not shareable across observers looking at different moments, which
is why the anchor date is part of the chart's label.

Two mechanics decide whether a rolling series is trusted after its first bad
week:

- **The bucket boundary and the bucket label are computed in one timezone,
  pinned.** A boundary computed centrally and a label formatted in the
  reader's local time disagree by a day for every reader on one side of the
  reference meridian — the bar is right, the caption under it is wrong, and
  the reader believes the caption.
- **A malformed or out-of-span row is skipped, not thrown.** One unparseable
  legacy timestamp must not blank the whole panel; the series degrades by one
  observation rather than disappearing. Count the skips somewhere, because a
  silent skip that grows is a data problem hiding behind a working chart.

## Procedure

1. Enumerate the transition types the model can produce, from the role
   vocabulary — not from what the data currently contains.
2. Assign each to exactly one series; write the residual arm.
3. Choose the window length from the metric's own cadence: short enough to
   move, long enough that a single quiet day does not dominate. Seven days is
   the usual answer for recruiter-facing activity because it absorbs the
   weekend.
4. Compute both the current window and the immediately preceding one of the
   same length; a delta between windows of different lengths is not a delta.
5. Assert the partition on every aggregation: series sum equals event count.
6. Label the anchor moment on the chart.

## Decision rules

- When a stakeholder asks to add a series, ask which existing series loses the
  events — if the answer is "none", the new series overlaps and the chart is
  about to start double counting.
- When one candidate can generate many transitions in a window, decide whether
  the series counts *transitions* or *distinct candidates* and put the choice
  in the axis label. Both are legitimate; the sum of the two interpretations
  across a chart is not.
- When a window is shorter than the pipeline's own cadence, the series
  measures noise. Interview activity on a 7-day window is real; hire counts on
  a 7-day window usually are not, and the small-sample discipline governs
  whether the series may render at all
  ([the law](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- When a transition is deleted or corrected after the fact, decide once
  whether the series is as-of-now or as-of-then; a chart that silently
  rewrites last month's bars is not a record.

## When not to use this

Do not apply the partition rule to charts that are deliberately overlapping
views of the same events — a "candidates touched" line drawn over a stacked
breakdown is intentionally the sum, and forcing it into an arm removes the
comparison the chart exists for. The rule is about series that a reader will
add up, and the test for that is whether a total is displayed or implied.

Do not use rolling windows where a calendar boundary is the actual subject:
month-end reporting, quarterly requisition planning and headcount as-of dates
are calendar facts, and rolling them turns a real boundary into a moving one.
