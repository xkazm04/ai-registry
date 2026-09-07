---
layer: technique
type: technique
subject: usage-aggregation-semantics
technique: high-water-mark-advance-billing
status: forged
laws: [record-precedes-effect, derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [issuing a charge at event time rather than at period close, a level metric that can decrease within a period, a retried billing job charged twice, deciding whether a stored aggregate may be recomputed]
---

# Billing the increment to a high-water mark

A charge issued **in advance** — money committed the moment an event lands,
so a customer pays for the seat when they add it rather than a month later
— has a problem the in-arrears charge does not: at the instant it must
decide an amount, the period's aggregate does not exist yet. It cannot bill
the aggregate. It bills the **increment**.

For a metric that only ever grows, the increment is the event's own
contribution and none of this machinery is visible. The machinery appears
the first time an aggregate can *decrease* — a level metric, a state-machine
count, or a flow metric whose events may carry negative properties. A
decrease must not produce negative money, and the naive guard (clamp at
zero) is not enough, because the next increase would then be billed a second
time.

## The ratchet

Persist, per (customer, subscription, metric, period, group), a **high-water
mark**: the largest value the aggregate has reached so far in this period.
On every event:

1. Recompute the aggregate over the period's events **up to and including
   this one**.
2. Charge `aggregate − mark`, floored at zero.
3. If `aggregate > mark`, advance the mark to the aggregate. Never lower it.

The customer-visible behaviour that follows is a pricing decision and must
be documented as one, not left to be discovered: **within a period, scaling
down and back up is paid for once.** Twenty seats, down to ten, back to
twenty is billed as twenty, not thirty. Customers with bursty usage will
notice this and like it; the finance team will notice it and want to know
whether it was deliberate. The answer is that anything else double-charges
for capacity the customer already bought this period.

The mark **resets when the period rolls**, and only then. A mark that
survives a period boundary makes the second period free until the customer
exceeds their first period's peak; a mark that resets on any other trigger —
a plan change, a job restart, a cache flush — re-bills from zero.

## The record is written before the money moves

The mark's row and the charge are two effects, and their order is not
arbitrary. Per
[the record preceding the effect](../../../../_laws.md#record-precedes-effect),
the aggregate and the advanced mark are persisted first, and the charge is
issued from that persisted state. If the store rejects the write, no charge
is issued.

The naive order — issue the fee, then record the mark — leaves a window in
which money exists and nothing accounts for it. A crash inside that window
produces a charge the next run cannot see, so the next run recomputes an
increment that includes the amount already billed, and charges it again. The
window is small and the failure is rare, which is precisely why it survives
review and is diagnosed six months later from a customer's spreadsheet.

## The self-exclusion rule

This is the defect that every implementation of advance billing has had at
least once, and it is one clause long.

The per-event aggregate is computed by querying the period's events. But
this event's own aggregation row — the one about to be written, or written
by a previous attempt of the same job — lives in the same store the query
reads. A retry therefore finds its own prior work and folds it in. The
charge is computed against an inflated aggregate, the mark advances again,
and the customer is billed twice for one event. Nothing above the query
layer can detect it: the amounts are individually plausible, the mark is
monotonic as designed, and the invoice adds up.

The exclusion is **more** load-bearing, not less, when the per-event
aggregate is computed **incrementally** — the usual optimization, in which
each event's row is derived from the previous event's row rather than from a
scan of the period. That chain is what makes advance billing affordable at
volume, and it is also what turns a self-read into a compounding error: the
retry takes its own previous attempt as the predecessor, adds the same
contribution a second time, and the chain carries the inflation forward to
every subsequent event in the period. In a chained implementation the
exclusion is not a safety net around a scan; it is the only thing selecting
the correct predecessor.

Resolving that predecessor needs a **total order** of its own. "The most
recent row before this one" is ambiguous when two rows share a timestamp,
and an ambiguous predecessor is an ambiguous mark. Order the lookup on the
event timestamp *and* a stable secondary key.

**The query that produces a per-event aggregate excludes the row belonging
to the event being processed**, matched on that event's own identity. Two
properties make the exclusion work, and both must be checked:

- The event's identity is **minted once by the emitter and carried
  unchanged** through every retry, per
  [identity surviving reuse](../../../../_laws.md#identity-survives-reuse). An
  identity assigned at processing time is a new identity on the retry and
  excludes nothing.
- The exclusion is in the **query**, not in a post-filter or a conditional
  around the write. A post-filter still lets the aggregate be computed with
  the row present in any code path that forgot it.

Test it directly. Process one event, then process the identical event again,
and assert the second attempt charges zero and leaves the mark unchanged. A
test that only ever processes distinct events cannot see this defect, and
almost every test suite only ever processes distinct events.

## Its recomputation path is not a rescan

The stored mark is a derived-looking number, and
[derivation naming recomputation](../../../../_laws.md#derivation-names-recomputation)
requires it to name how it is recomputed. It does — but the path is not the
obvious one, and getting this wrong is the most expensive mistake available
in this subject.

**Re-deriving the mark from the events is not a repair. It is an unbilling.**
The events describe the current level; the mark describes the peak, which
money was already issued against. A rescan finds a smaller number, "corrects"
the stored value downward, and the next increase re-bills a range the
customer already paid for — or, if the correction propagates to the charges,
issues a refund nobody approved. This is the specific reason a high-water
mark is **not** required to agree with a full scan of its source, and the
reason it must not be property-tested against one.

The mark's actual recomputation path is **replay the effects, not the
stream**: reconstruct it as the running maximum implied by the charges
already issued for this period. That path exists, it is invokable, and it
satisfies the law. Write it down beside the stored value, because the next
engineer to encounter a suspicious mark will reach for the events.

The general distinction, worth carrying beyond this subject: a stored value
is provable against its source only while the derivation is a **pure
function** of that source. A value that records an irreversible external
effect is not derived, it is **ledgered**, and it reconciles against the
effects it recorded.

## When the metric is also time-weighted, keep two marks

A charge can be both advance-billed and prorated: the customer pays when
they add the seat, and what they pay is weighted by the fraction of the
period remaining. Now there are two candidate spaces to ratchet in — raw
units and time-weighted units — and **only one of them is monotonic**.

A time-weighted quantity *shrinks as the period runs down*: the same
increase of ten units is worth less in the final week than it was in the
first. A ratchet that compares time-weighted values therefore stops
advancing partway through the period — the comparison against the earlier,
larger weighted peak simply fails — and everything after that point is free.
The failure is not visible in any single invoice; it looks like a customer
who stopped growing.

The rule: **make the advance decision in the space where the quantity is
monotonic, and carry the weighted peak alongside as an accumulator.** Two
stored values, one decision. When the raw comparison says "advance", add the
event's weighted contribution to the weighted mark; when it says "hold",
carry the weighted mark unchanged. The weighted mark is never itself
compared against anything.

## Decision rules

- **If the aggregate is monotonic by construction, skip the mark.** A pure
  count of events, or a sum of properties guaranteed non-negative, never
  decreases, so the increment is the event's own contribution and a ratchet
  adds a row and a failure mode for nothing. Re-examine the guarantee before
  relying on it: a single credit or correction event with a negative
  property retires it.
- **If the period can be re-opened, advance billing is the wrong model.**
  The mark makes decreases free for the rest of the period; a period that
  can be reprocessed from scratch has no defensible mark. Choose in-arrears
  issuance, or make period closure final.
- **If a customer disputes an advance charge, the answer comes from the
  charge history, not from a recomputation.** State this in the runbook, or
  a support engineer will run the aggregation, get a smaller number, and
  agree with the customer.
- **Do not share one mark across dimensions.** A metric grouped by region or
  by product needs one mark per group. A single shared mark makes the second
  group's growth free until it exceeds the first's peak, and the shape of
  the error is invisible in totals.

## When not to use this

- **In-arrears billing.** With every event in hand at period close, bill the
  aggregate; a ratchet would overcharge a customer who scaled down, relative
  to the metric the invoice claims to describe.
- **Metrics where the customer expects to be refunded on scale-down.** The
  ratchet is a commitment that they will not be. If the product promises
  otherwise, either issue credits explicitly through the pricing layer or
  bill in arrears — do not attempt it by lowering the mark.
- **Where the charge can be issued as an authorization and settled at period
  close.** If the payment path supports holding an amount and adjusting it
  before capture, that model bills the true aggregate with the cash-flow
  benefit of advance billing, and needs no ratchet at all.
