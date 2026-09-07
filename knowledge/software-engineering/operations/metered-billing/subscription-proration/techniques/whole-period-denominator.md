---
layer: technique
type: technique
subject: subscription-proration
technique: whole-period-denominator
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [computing a partial-period charge, a customer disputes a prorated line, choosing day versus second granularity]
---

# Divide by the whole period, always

The coefficient that prices part of a billing period is one fraction:

```
served span
———————————
whole period
```

The numerator is how much of the period the customer actually held the thing.
The denominator is **the length of the entire period** — not the span being
billed, not a nominal month, not the days remaining after the change.

## The defect this prevents

Take the customer who signs up on the 20th of a 30-day period. The span being
billed is the 20th to the 30th: eleven days. A developer holding only that
span computes `11 / 11` and gets a coefficient of 1, and the customer pays a
full period's price for eleven days of service.

Nothing errors. The invoice renders. The number is plausible, it is in the
seller's favour, and it is discovered by a customer rather than by a test. The
same shape appears in three other disguises:

- **A nominal denominator.** Dividing by 30 in a 31-day period. Every segment
  is 3% cheap, and a full period cut into segments sums to 31/30 — more than
  the period's own price.
- **The wrong period's length.** Pricing a segment of the outgoing period
  using the incoming plan's period length, after an interval change. The two
  denominators differ by a factor of twelve in the annual case.
- **A denominator computed from the change,** such as "days since the last
  change." Segments then divide by different numbers and cannot sum to
  anything in particular.

## The period is resolved, not read

A trap that only appears once plan changes exist, and that costs an
afternoon of confusion when it does: **the segment's own start is not the
period's start, and the record being billed may not know the period's start
at all.**

When an upgrade is implemented by ending one subscription and beginning
another, the new record's start is the moment of the change, mid-period — but
the period it lives in was opened by its predecessor, and its anchor is
*inherited*. Compute the denominator from the new record's own start and you
have rediscovered the truncated-span defect by a longer route: the new
record's "period" begins on the day of the change, and its first segment fills
it exactly.

The rule: **resolve the period by walking back from the segment's start to the
period boundary that contains it**, using the inherited anchor, and take the
denominator from that resolved period. Write this as one function — "the
period containing this instant" — and let both the numerator's bounds and the
denominator go through it. Every place that recomputes a period boundary
inline is a place the inheritance can be forgotten.

## The two invariants

Everything else in this technique is a way of holding these true.

**Reproducibility.** The line's amount is a function of exactly five values:
period start, period end, segment start, segment end, whole-period amount. All
five appear on the invoice. Nothing else may enter — not today's date, not the
process's clock zone, not a plan record that may have been edited since. This
is [a derived value naming its own recomputation](../../../../_laws.md#derivation-names-recomputation)
in the one place where an outsider will actually perform the recomputation.

**Partition.** For any cut of a period into consecutive segments, the
coefficients sum to **exactly 1**. This is the property that guarantees a
customer who changes plan three times in a month pays one month of base fee,
and it is testable directly: generate random period lengths, random cut
counts, random cut points, sum, assert equality. A test that asserts
`abs(sum - 1) < epsilon` has already conceded the property; assert exactly,
with exact arithmetic.

## Granularity: choose the day, and mean it

**Day granularity is the default and the right one.** The reason is not
precision — second granularity is strictly more precise — it is
verifiability. A day is the unit the customer can count on a calendar, and the
subject's acceptance test is a stranger reproducing the number. A
second-granularity coefficient can be correct and still be undefendable in a
support conversation.

Second granularity is defensible in two situations and no others: charges
whose underlying resource is genuinely metered by the second, and periods so
short that a day is a large fraction of them. If you choose it, the segment
timestamps go on the invoice; a document showing only dates cannot justify a
number computed from times.

Whichever is chosen, apply it to **both** the numerator and the denominator.
A numerator in seconds over a denominator in days is not a coefficient, it is
a unit error that happens to have the right sign.

## The four rules that make the count honest

A day count is a number that travels, so it
[carries its predicate](../../../../_laws.md#count-carries-predicate) — which
interval, which endpoints, which zone. Fix all three once:

1. **Half-open intervals, `[start, end)`, everywhere.** Every instant belongs
   to exactly one segment. The classic proration bug is the change day being
   billed twice (both segments closed at the boundary) or not at all (both
   open). Write one function that maps a pair of boundaries to a count, define
   it as half-open, and let both the numerator and the denominator go through
   it. Two call sites computing a duration two ways is how the two ends stop
   agreeing.
2. **The day boundary belongs to the subscription.** It is fixed when the
   subscription is created and is stored on it. It is never the server's zone,
   never the request's zone, never the viewer's. A change at 23:30 must land
   on the same day for every observer of that contract, and the period
   boundary and the segment boundary must use the same zone or the segments do
   not partition the period.
3. **Count calendar days, not elapsed hours.** In a zone that observes a
   daylight shift, two of the year's days are 23 and 25 hours long. A
   duration-based count silently produces a fractional day for those periods.
   Counting calendar-day boundaries crossed is both correct and the thing the
   customer's calendar agrees with.

   The cost of the alternative is easy to underestimate, so measure it by the
   corrections it accumulates. A day count built as *elapsed seconds divided
   by a day's seconds, rounded up* needs, in practice: an offset subtraction
   so the daylight shift does not add or drop a day; a one-second nudge so an
   end boundary landing exactly at midnight is not rounded down; and a
   subtract-one at the change seam so the boundary day is not billed by both
   segments. Three hand-applied corrections, at three different call sites,
   each correct in isolation, none of which is the convention — and the fourth
   seam is the one nobody has hit yet. A calendar-day count with half-open
   bounds needs none of them.
4. **Name the day-count convention and hold it.** Counting the actual days in
   the actual period ("actual over actual") is the convention that satisfies
   the partition invariant, handles a leap day for free, and makes February's
   days slightly dearer than January's. A fixed-denominator convention — every
   month treated as 30 days — makes a day cost the same all year, which some
   contracts genuinely require, but its segments **do not sum to 1** in a
   31-day month and it cannot be adopted casually. Pick actual-over-actual
   unless a contract dictates otherwise, and state the choice next to the
   coefficient's definition.

## Exact arithmetic and one rounding point

**The coefficient is never rounded.** Carry it as an exact rational — a
numerator and a denominator, both integers — or as a decimal with precision
far beyond the currency's. Rounding it to a handful of decimals before
multiplying scatters residue across every segment, and the residues do not
cancel: a period cut into four will miss its own total by cents, in an
unpredictable direction, on invoices that are individually defensible and
collectively wrong.

The coefficient hides in a second, more convincing disguise: **a per-day
price.** Dividing the period's amount by its duration to get "the price of one
day", then multiplying by the days served, is the same fraction with the
division moved to the front — and it is now an inexact division performed
first, whose error is then multiplied. It reads as a clean decomposition and
it is the same defect. Multiply first: amount times served days, divided by
the period's days, in exact arithmetic.

The tell that a codebase has this is in its tests. A proration test whose
period price is a tidy multiple of its period length — so that one day costs a
round number — has been written to make the division exact, which means the
inexact case is the untested one.

Round **once**, at the point money becomes money, in the currency's minor
unit. Then handle the residue explicitly:

- Compute each segment's amount from the exact coefficient.
- Sum them. If the sum differs from the whole-period amount by a residue —
  and with three segments of a 31-day period it will — **assign the residue to
  one named segment by a stated rule**, conventionally the last, or the
  largest. A stated rule is reproducible; letting each segment round
  independently is not.
- The rule is part of the derivation and belongs in the record with the rest
  of it.

Where a segment's price differs from the period's — an upgrade, where the two
halves are priced from different plans — the residue rule still applies within
each plan's own contribution. It is the *partition of time* that must be
exact; the money follows from it.

## Store the derivation, not just the total

A prorated line is re-read long after the code that produced it has changed.
Persist the inputs beside the output: both dates, the denominator, the
whole-period amount, the exact coefficient, and the convention's name. An
amount stored alone will be re-derived at render time under whatever rules
exist then, and a later fix to a boundary convention will restate history
with nothing available to explain the change.

## Decision rules

- **When a period's end is not yet known** — an open-ended or
  usage-terminated period — you cannot compute a whole-period denominator, and
  therefore you cannot prorate. Close the period first; a coefficient over an
  unknown denominator is guesswork wearing a fraction's clothes.
- **When a change also changes the period's length** (a switch between
  intervals), this technique does not apply. That is not a split period, it is
  a period closed early and a new one opened, and the boundary rules belong to
  the periods subject.
- **When the segment is the whole period,** the coefficient is exactly 1 and
  the path must produce exactly the unprorated amount. This is not a special
  case to shortcut past — it is the cheapest available equivalence test, and
  it belongs in the suite.
- **When a segment is zero-length** — a change made at the instant a period
  starts — the coefficient is 0 and the line is suppressed, not rendered as a
  zero-amount charge. A zero line raises a question the invoice cannot
  answer.
- **When the customer disputes a line,** re-derive it from the five printed
  values in front of them. If that cannot be done, the defect is in the
  invoice's design and not in the dispute.

## When not to use this

- **One-time charges** have no period and take no coefficient.
- **Charges over events already in the window** are not scaled by time at all
  — see the recurrence technique; applying this one to them is the error that
  technique exists to prevent.
- **Fixed-denominator contracts** — where a counterparty has contractually
  specified a nominal month — keep the denominator they specified, and give up
  the partition invariant knowingly, with a test that documents the gap rather
  than one that asserts a property the convention forbids.
