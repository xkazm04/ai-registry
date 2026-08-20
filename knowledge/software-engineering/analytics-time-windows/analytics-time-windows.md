---
layer: golden-path
type: golden-path
subject: analytics-time-windows
status: forged
use_when: [defining what "last 30 days" or "this quarter" means for a product, reconciling two surfaces that disagree about a period, adding a period-over-period delta or trend, implementing a billing or allowance period boundary]
techniques:
  - half-open-interval-policy
  - canonical-zone-single-source
  - calendar-arithmetic
  - baseline-as-window-start
  - range-precedence-resolution
  - cohort-matched-comparison
---

# Analytics time windows

Every analytical surface in a product asks the same question in a different
voice. The dashboard asks "how are we doing this quarter". The alert evaluator
asks "did anything cross a line in the last hour". The billing meter asks "how
much has this account used this month". The scheduler asks "is this due yet".
The forecast asks "what does the last ninety days imply about the next thirty".
Five surfaces, one underlying object: a **window** — a bounded stretch of time,
plus the conventions that decide exactly which observations fall inside it.

The failure this subject exists to prevent is not any single wrong number. It
is *convergent re-derivation*: five teams, or five modules, each inventing the
window they need, each getting it 80% right, each getting a different 20%
wrong. Nothing breaks loudly. Instead the quarterly summary and the alert
disagree by one observation, the billing period and the usage chart disagree by
five hours, and the trend line has a day that is two days wide. Every one of
those is individually defensible and collectively indefensible, because a user
who reads two of them at once has caught the product contradicting itself.

So the subject's whole claim is: **time semantics are fixed once, named, and
shared.** Not a utility everyone *may* use — a vocabulary everyone *does* use,
because there is no second place to get a window from. The six decisions below
are the content of that vocabulary. They are small individually. They are
load-bearing because they are shared.

## The boundaries with the neighbours

This subject owns the *vocabulary*; several neighbours own what is said in it.

[metrics-rollups](../metrics-rollups/metrics-rollups.md) owns bucketing
strategy, grain choice and stored rollups — it is this subject's largest
consumer, not its parent. When it decides that a quarter is served at daily
grain from a materialized fold, it is choosing a strategy; when it asks what a
day *is*, it is reading this vocabulary. The seam is clean: a bucket is
`[start, end)` in the canonical zone because this subject says so; whether
there are ninety of them or thirteen is the rollup's business.

[metric-forecasting](../metric-forecasting/metric-forecasting.md) consumes
windows and projects past their end. Its anchoring, confidence and
presentability gates are its own; the history it fits is a series this
vocabulary defined the edges of, and a fit anchored on windows drawn two
different ways is a fit over a fabricated shape.

[scheduling](../scheduling/scheduling.md) owns cadence, due-time computation
and lease mechanics — but it *inherits* the calendar arithmetic here. A job
that runs "monthly" and a report that covers "this month" must mean the same
month, or the report covers a period the job never regenerated.

[diff-comparison](../diff-comparison/diff-comparison.md) compares two
artifacts; this subject compares two windows. The distinction is not
pedantic — artifact diffing may assume both sides are complete and
identifiable, whereas window comparison must handle a population that changed
between the sides, which is the hardest problem in this subject.

## Six decisions, fixed once

### 1. Intervals are half-open, everywhere

`[start, end)` — inclusive start, exclusive end. This looks cosmetic and is
not. An observation whose timestamp lands exactly on a boundary is, under a
closed-closed convention, counted in both the current window and the previous
one; a period-over-period delta then measures that observation **against
itself**, which contributes a guaranteed zero to a movement figure and dilutes
every real change beside it. Boundary hits are not rare in practice: systems
generate observations on round timestamps — job ticks, batch writes, midnight
recomputations — precisely at the moments windows are cut. The rule and its
consequences are [half-open-interval-policy](techniques/half-open-interval-policy.md).

### 2. One canonical zone, resolved in one place

A window is not a pair of instants until somebody says *whose* midnight. The
decision is not which zone — it is that there is exactly **one** answer,
reachable from exactly one place, and that every surface that snaps, buckets,
labels or compares reads it from there. Two zones in one pipeline is the
characteristic silent defect of this subject: boundaries snapped in one zone,
buckets keyed in another, so one local day splits across two points and one
point is empty. Nothing errors. A downstream projection is quietly fed a
sawtooth. See
[canonical-zone-single-source](techniques/canonical-zone-single-source.md).

### 3. Calendar arithmetic, not fixed-length arithmetic

A month is not thirty days. A week is not "the timestamp divided by seven
days". A day is not 86,400 seconds in any zone that observes a seasonal shift.
Fixed-length arithmetic is seductive because it is one line and it is right
most of the time; it is wrong in ways that accumulate and that nobody
attributes to the arithmetic. A "monthly" allowance implemented as a rolling
thirty days grants **more than twelve renewals a year** — a real cost, paid
silently. A week binned by dividing an epoch timestamp by a week's length
anchors on whatever weekday the epoch happened to be, so two entities whose
data starts a few days apart get bins that are out of phase and cannot be
compared. Add months to months and days to days; let the calendar handle the
irregularity. See [calendar-arithmetic](techniques/calendar-arithmetic.md).

### 4. The window's start is the comparison baseline

Almost every window is eventually asked "compared to what?" The naive answer
builds a second window — the prior period — and reads it separately. The
better answer is already in hand: **the state as of the window's own start**
is the baseline, and it is one read, not a second window. This collapses a
whole family of defects. There is no drift between two range interpretations
because there is one range. There is no race between two reads. There is no
question of whether the prior period was aligned or partial, because the
baseline is a point, not a span. And the semantic it produces is the one users
actually mean by "change over this quarter": where things stood when the
quarter opened versus where they stand now. See
[baseline-as-window-start](techniques/baseline-as-window-start.md).

### 5. Several sources want to name the range; state the precedence

An explicit request parameter, a stored per-user or per-tenant preference, an
organizational default, a system fallback — in a mature product all four
eventually exist, and any two of them can be present at once. Whether the
precedence is "explicit beats stored beats default" or something else matters
much less than the fact that it is **written down once, applied in one
resolver, and returns what it resolved**. Without that, the precedence is
whatever the call order happens to be at each call site, and the same account
gets a different quarter depending on which page they opened. The resolver's
output is not just a range; it is a range *plus its provenance*, because a
surface that cannot say why it is showing ninety days cannot be debugged. See
[range-precedence-resolution](techniques/range-precedence-resolution.md).

### 6. Movement is measured over the entities present on both sides

This is the deepest rule in the subject and the one most often missed. When a
window's delta is computed as *average of the current population* minus
*average of the baseline population*, the result silently folds two different
things together: how existing entities moved, and how the composition of the
population changed. Onboard five low-scoring items mid-quarter and the average
falls — and the surface reports that the population "slipped" by an amount **no
individual item experienced**. The internal contradiction is visible on the
same screen: a movers panel, which necessarily works per entity, correctly
shows zero regressions while the headline reports a decline.

The fix is not a footnote. It is a different computation: restrict the delta to
the **cohort present on both sides of the window**, report composition change
as its own separately named figure, and never let one number carry both. See
[cohort-matched-comparison](techniques/cohort-matched-comparison.md).

## What a principal practitioner holds true

- **The window is a value, not a pair of arguments.** Start, end, zone, grain
  and provenance travel together, constructed once at the edge and passed down.
  The moment a function takes `days: number` and re-derives the range, there
  are two interpretations of the same request in one call stack.
- **Every result echoes the window it actually covered.** A number without its
  interval is a number that will be reused for a claim it does not support —
  this is [a count carrying its predicate](../_laws.md#count-carries-predicate)
  applied to time. The echo is what lets a chart label, an export header and a
  comparison denominator agree.
- **Trade-offs are named in the code that makes them, along with what else
  must change.** A calendar-month allowance is a *choice*: it gives a
  predictable renewal date and a variable period length, and it means a
  late-month signup gets a short first period. That is defensible. What makes
  it durable is the note stating the alternative, and stating that the
  user-facing copy about renewal must change with it — otherwise the next
  engineer "fixes" the boundary and leaves the copy lying.
- **Labels are interpolated from the constants that do the arithmetic.** A
  bucket labelled "0-30 days" beside a comparison that actually cuts at 28 is
  a defect that no test catches, because the label is a string and the cut is
  a number. Derive one from the other and disagreement becomes impossible —
  the [one-authority-per-vocabulary](../_laws.md#one-authority-per-vocabulary)
  law, applied to the smallest possible vocabulary.
- **Recency horizons are windows too.** "Active in the last N days", "stale
  after N days", "recent enough to alert on" — these are half-open windows
  against now, and they inherit every rule above. They are also the windows
  most likely to be written inline, because each one looks like a single
  comparison rather than a range. One extra rule is theirs alone: a trailing
  recency grid is anchored at the newest observation, not at the present
  instant, so a single long-dormant entity cannot stretch the grid back and
  dilute the trend to mostly zeros.

## Failure modes of the naive reading

- **"We'll just use universal time everywhere."** Legitimate — if declared,
  and if the product genuinely has no per-tenant reporting boundary. It stops
  being legitimate the moment one surface snaps to a local business day
  (because a user asked for it) and the rest do not. The defect is mixture,
  not choice.
- **"The delta is just current minus previous."** True only when the
  population is fixed. It never is.
- **"Half-open is a style preference."** It is a double-count prevention
  mechanism whose failure signature — a slightly diluted movement figure — is
  invisible without a per-entity cross-check.
- **"Rolling thirty days is close enough to a month."** It is 12.17 periods
  per year instead of 12. On an allowance, that is a 1.4% overspend that
  compounds and that no dashboard shows.
- **"The zone only matters at the boundaries."** It matters at every bucket
  key, every label, every alignment, and every comparison; boundaries are just
  where it is easiest to see.
- **"The comparison window should be the same length as the current one."**
  Often — but if what the user means is "since the quarter began", a matched
  prior span answers a different question and will disagree with the panel
  next to it that answered the intended one.

## What this subject refuses

- A second definition of any period name. If "this month" is computed in two
  places, one of them is wrong and nobody knows which.
- A range parsed at a call site. Ranges are resolved by the resolver and
  passed as values.
- A delta over a population that changed, presented as movement.
- A boundary constant that a label restates in prose rather than deriving.
- An enforcement boundary (allowance, quota, gate) whose displayed period
  differs from the enforced one. The enforcer wins; the display follows it,
  even when the enforced boundary is the less intuitive of the two.

## The techniques

- [half-open-interval-policy](techniques/half-open-interval-policy.md) — the
  `[start, end)` convention, why boundary observations are common, and what
  breaks when the convention is only mostly applied.
- [canonical-zone-single-source](techniques/canonical-zone-single-source.md) —
  one zone, one accessor, applied identically to snapping, bucketing and
  labelling; the split-brain signature and how to detect it.
- [calendar-arithmetic](techniques/calendar-arithmetic.md) — adding months as
  months, aligning weeks to a named weekday, and the costs of fixed-length
  substitutes.
- [baseline-as-window-start](techniques/baseline-as-window-start.md) — the
  window's own start as the comparison read; one range, one snapshot, and the
  semantic it produces.
- [range-precedence-resolution](techniques/range-precedence-resolution.md) —
  explicit request, stored preference, default: one written order, one
  resolver, provenance returned.
- [cohort-matched-comparison](techniques/cohort-matched-comparison.md) —
  movement measured over entities present on both sides; composition change
  reported separately and never merged into the headline.
