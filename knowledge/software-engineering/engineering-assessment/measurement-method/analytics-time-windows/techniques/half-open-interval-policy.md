---
layer: technique
type: technique
subject: analytics-time-windows
technique: half-open-interval-policy
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [constructing any time range, computing a period-over-period delta, debugging an off-by-one observation count]
---

# Half-open interval policy

Every window is `[start, end)`: an observation belongs to the window when
`start <= t` and `t < end`. One convention, applied without exception, in
construction, in query predicates, in bucket assignment, and in the arithmetic
that splits a doubled read.

## Why this is load-bearing rather than cosmetic

The argument against "it barely matters, boundary hits are rare" is empirical:
in an analytics system, boundary hits are *manufactured*. Scheduled jobs fire
on round times. Nightly recomputations stamp midnight. Batch imports share one
timestamp across a whole payload. Snapshots are taken at period rollover
precisely because that is the meaningful moment. The timestamps most likely to
sit exactly on a window edge are the ones the system itself created, and they
are frequently the highest-value observations in the window.

Under a closed-closed convention (`start <= t <= end`) such an observation is
counted in the window that ends at that instant *and* in the window that
begins at it. In a period comparison that means one entity's value appears on
both sides of the delta and therefore **is compared against itself**,
contributing a structural zero. The visible symptom is not an error: it is a
movement figure that is quietly smaller than the truth, in proportion to how
many boundary observations there were. That is a defect with no stack trace
and no failing test — it is only findable by cross-checking the aggregate
against a per-entity list.

Open-open (`start < t < end`) has the mirror defect: the boundary observation
falls in neither window and disappears from both. Half-open is the only
convention where consecutive windows *tile* — no overlap, no gap — which is
the property everything downstream assumes.

## Procedure

1. **Construct ranges through one function**, never by assembling two
   timestamps at a call site. The constructor returns start and end already
   snapped, already zoned, and documents the half-open contract in its own
   name or signature (`endExclusive` beats `end`).
2. **Write predicates that mirror the convention exactly.** Storage-layer
   filters use `>= start` and `< end`. A `BETWEEN`-style inclusive predicate
   is a closed-closed interval wearing a range's clothes; if the query
   language only offers inclusive bounds, subtract the smallest representable
   unit *and say so in a comment*, because that subtraction is fragile under a
   precision change.
3. **Split doubled reads on the same convention.** When a comparison fetches a
   double-length window in one read and cuts it locally, the cut is a
   half-open boundary too: the first half is `[start, mid)`, the second is
   `[mid, end)`. A positional cut over an array is not a cut in time at all —
   see the dense-series caveat below.
4. **Make consecutive windows derive from each other.** The previous period's
   `end` *is* the current period's `start`, the same value, not two
   independently computed timestamps. Two computations of "the same" boundary
   is how a one-unit gap or overlap is born.
5. **Assert tiling in a test.** Given consecutive windows and an observation
   at each boundary instant, each observation must be counted exactly once
   across the set. This is the only cheap way to catch a convention that has
   been applied in four places out of five.

## Decision rules

- **When a boundary instant must belong somewhere, it belongs to the later
  window.** This follows from half-open and should never be re-litigated per
  surface; a surface that inverts it locally has created a second convention.
- **When the storage engine's date functions truncate rather than compare, use
  them for the bucket key only, not for the window edge.** Truncation is a
  floor operation; the window edge is a comparison. Mixing them produces
  edges that are correct to the day and wrong to the hour.
- **When a range is displayed to a user, display it closed.** "1 Jan - 31
  Mar" is what a human reads; `[1 Jan, 1 Apr)` is what the code holds. The
  translation happens once, at the label, and the label is derived from the
  interval rather than typed alongside it — otherwise the display and the
  arithmetic become an
  [independently-maintained pair](../../../../_laws.md#one-authority-per-vocabulary)
  and drift on the next change.
- **When the window is unbounded on one side** (a recency horizon: "since
  ninety days ago"), it is still half-open — `[now - 90d, now)` — and `now` is
  captured *once* per request. A predicate that re-evaluates the current
  instant at each of several call sites gives a window whose end moves during
  the computation, so a summary and its breakdown cover different spans.

## The dense-series caveat

Splitting a doubled read by array position — "the last N points are the
current period" — only reproduces the half-open cut when the series is dense.
Aggregations return only non-empty buckets; a quiet interval yields fewer
points than days, and the positional cut lands in the wrong place, silently
labelling part of the current period as the baseline. Either densify over the
effective window before splitting, or split on the bucket's own timestamp
against the boundary value. The second is cheaper and cannot drift.

## When not to use it

- **Never "don't use it" for windows.** The exception surface is elsewhere:
  human-facing *labels* are closed, and some external interfaces (an upstream
  report API, a partner's export format) specify inclusive ranges. Convert at
  the boundary of the system, in one adapter, and hold half-open internally.
  A system that adopts an external inclusive convention internally has
  imported a foreign vocabulary into every downstream computation.
- **Instant-valued reads are not intervals.** A baseline read "as of the
  window start" is a point query, not a range, and does not take the
  convention — a common confusion that leads to an unnecessary and
  wrong `<= start` filter.

## Smells

- `BETWEEN` in any query whose result is compared against another period.
- Two independent computations of the same boundary timestamp.
- A comparison whose delta is reliably a little smaller than the per-entity
  list implies.
- A range constructor whose parameter is called `end` with no statement of
  inclusivity anywhere in the module.
- Subtracting one second, one millisecond, or one day from an end bound
  anywhere outside a single documented adapter.
