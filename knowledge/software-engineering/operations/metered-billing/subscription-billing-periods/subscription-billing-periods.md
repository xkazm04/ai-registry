---
layer: golden-path
type: golden-path
subject: subscription-billing-periods
status: forged
use_when: [adding a recurring charge to a product, deciding when a subscription rolls over, a customer disputes the window an invoice covered, a subscriber's timezone or country changes, designing the recurring pass that advances billing]
techniques:
  - timezone-anchored-period-dates
  - anchor-re-derived-not-chained
  - boundary-stitch-on-timezone-change
  - hourly-pass-with-derived-idempotency
---

# Subscription billing periods

A billing period is the window that every other number in recurring revenue is
scoped by. The usage rolled up for an invoice is the usage inside it. The
allowance a plan grants is granted per one of them. A price change, a plan
change, a cancellation all take effect *relative to* one. The subject is small
in surface and enormous in blast radius: get the boundary wrong by five hours
and every downstream figure is wrong by whatever happened in those five hours,
in a direction nobody can see, for one customer at a time.

The whole subject rests on a single claim, and the claim is counter-intuitive
enough that most first implementations get it backwards:

> **A period boundary is not an instant. It is a date in somebody's timezone —
> and whose timezone is a per-subscriber attribute that can change.**

Everything else here is a consequence.

## The two naive moves, and why they are the same mistake

Almost every first implementation makes both of these, and they look
unrelated:

1. **Store the moment the subscription started, and add intervals to it.**
   `next_boundary = last_boundary + one month`. The period is a chain of
   instants, each computed from the previous one.
2. **Run the biller once a day, at midnight.** One scheduled sweep, one global
   moment, "everybody whose period ended today".

They are the same mistake wearing two costumes: both assume the boundary is an
*instant on a universal clock*, universal enough that one moment can serve
every subscriber and that adding a duration to it produces the next one.

The first fails on the calendar. Add a month to the 31st and you land on the
28th, and if the 28th is now the input to the next addition, the subscription
has permanently migrated to the 28th. Nothing errored. A customer who signed
up on the 31st bills on the 31st for two months, then on the 28th forever, and
by the time anyone notices the original date exists nowhere in the system — it
was overwritten by its own successor.

The second fails on geography. There is no single midnight; the spread across
inhabited civil offsets is more than a day wide. A nightly sweep in one zone
bills some subscribers before their period has ended and others many hours
after — and the ones billed early are billed for a window that has not finished
producing usage yet.

## A boundary is a date, and the date belongs to somebody

The correct primitive is a **date** — a year, a month, a day — plus the rule
for whose midnight turns it into an instant. Those two things are stored and
reasoned about separately, and combined at the last possible moment: at the
edge where the storage layer needs a comparable value to select events.

Whose midnight is a resolution *chain*, not a field: the subscriber's own
declared zone if they have one, otherwise the zone of the business entity that
owns the relationship, otherwise a declared universal default. The chain is
ordered, total, and lives in exactly one resolver. It is never the runtime's
ambient zone, because that is a property of where the process happens to run,
and a deployment move would silently redraw every boundary in the system.

The discipline that keeps this honest is negative: **a stored instant is never
the period's identity.** Instants may be cached, indexed, and compared; the
moment one becomes the thing the next period is computed from, the zone has
been baked in at a time nobody recorded, and the boundary can no longer be
recomputed. Mechanics, the chain, and the late conversion are
[timezone-anchored-period-dates](./techniques/timezone-anchored-period-dates.md).

## The anchor is data; the boundary is derived

The second consequence: the subscription carries an **anchor** — the original
date the recurrence is pinned to — and every period boundary is a pure function
of `(anchor, period index)`. Not of the previous boundary. Ever.

This is the general defect behind the 31st-to-28th migration, and it is not
about months. **Any recurrence computed by accumulating deltas drifts
irreversibly at the first clamped step.** Clamping is lossy: the target month
cannot represent the 31st, so the arithmetic produces the nearest thing it can
— and if that output is the next input, the loss is now permanent state. A
recurrence derived from `(anchor, index)` clamps for display in February and
returns to the 31st in March, because February never got a vote on what the
anchor is.

The rule generalizes past dates. Persisted period rows are **records of what
was billed**, not cursors telling the system where it is. A record can be
audited, replayed, and recomputed; a cursor can only be trusted or repaired by
hand. The stored boundary has exactly one legitimate read — asserting
continuity, below — and it is never the arithmetic input. See
[anchor-re-derived-not-chained](./techniques/anchor-re-derived-not-chained.md).

## The frame of reference is mutable, and continuity must be asserted

Here is where this subject stops being a special case of general time handling.
The zone a boundary is resolved through is **customer data**. A subscriber
moves country. An operator corrects a record entered wrong. A business entity
is re-registered. The change lands *in the middle of an open period*, and the
period's two ends are now resolved through two different frames.

The consequence is arithmetically forced: if the frame shifted forward, the new
period's computed start is later than the previous period's recorded end, and
the usage in the gap is billed to nobody. If it shifted backward, the new start
is earlier than the previous end, and the usage in the overlap is billed twice.
A hole is a silent revenue loss; an overlap is a customer complaint with an
invoice attached. Both come from the same edit, and neither is detectable by
looking at either period alone.

The remedy is to stop trusting the recomputation and **stitch**: a new period's
start is not the boundary you just computed, it is the previous period's
*recorded* end plus the smallest representable unit. The recomputation becomes
a candidate, and the record is the authority.

The stitch needs a bound, or it will fabricate windows. If the two candidates
disagree by more than the physical spread of civil offsets on this planet — a
little over a day — the disagreement is not a zone change at all. It is a
corrupted anchor, a mis-joined subscription, a hand-edited row. Stitching there
would invent a window nobody transacted in. The bound is therefore **derived
from a property of the world**, not tuned: it is what "two places on earth"
can differ by, and it never needs a knob.
See [boundary-stitch-on-timezone-change](./techniques/boundary-stitch-on-timezone-change.md).

## No global midnight means no nightly job

The scheduling posture is not a separate design decision — it falls out of the
boundary shape. If boundaries land at every hour of the day across the
subscriber base, then the pass that advances them must run at least hourly, and
it must ask a **question about state**, never about time elapsed since the last
run: *which subscriptions have a boundary in the past and no period opened for
it?* A pass phrased that way is correct when it runs twice in a minute, when it
runs late, and when it has not run since yesterday. A pass phrased as "what
fired since I last woke" has a cursor, and a cursor lost in an outage loses
money.

Running frequently means running concurrently, and there is no upstream intent
to carry a key with. **The clock has no memory.** So the idempotency key must
be *derived* — a pure function of `(subscription, period boundary)` — and the
uniqueness boundary in the store is the real dedup point. The pre-checks in
front of it are optimizations, and they are all racy.

The part worth learning by heart: **losing that race is a success, not an
error.** Two passes computed the same key; one of them created the period, the
other collided; the system's state is exactly right. A collision handled as an
exception trains a team to ignore an alert that fires every hour; a collision
handled as an outcome gives them a rate to watch. See
[hourly-pass-with-derived-idempotency](./techniques/hourly-pass-with-derived-idempotency.md).

## The boundaries with the neighbours

**What this subject does not own.** *Proration* — what a mid-period plan change
costs — is a sibling; it consumes boundaries and produces amounts, and nothing
here computes money. *Invoice drafting and finalization* is another; this
subject says which window an invoice covers, never what is on it. *What a plan
grants* is
[plan-entitlements](../../service-operations/plan-entitlements/plan-entitlements.md):
an allowance resets per period, and this subject defines the period, but not the
allowance. *Usage aggregation semantics* — how events inside the window are
summed and priced — is a sibling too. The seam is clean everywhere: this subject
hands out a window and a guarantee that consecutive windows tile.

**Idempotency where the key is derived, not given.**
[idempotency-by-design](../../../backend-platform/work-execution/concurrency-guards/techniques/idempotency-by-design.md)
already models this territory well, and its central instruction is that the key
is *minted with the intent, upstream, before the first attempt*. That
instruction assumes an intent exists. Here it does not: nothing decided "bill
this subscription now" — a recurring pass observed that a date had passed. The
discriminator is exactly that, and it is worth stating because it inverts the
prior art's advice about per-attempt keys: when there is no caller, the key
cannot be handed down and must be **computed from domain state that any pass
would compute identically**. Everything else in that technique — natural keys,
conditional writes, the store's uniqueness boundary as the dedup point,
already-done as a success variant — applies unchanged and is not restated here.

**One canonical zone versus a per-subscriber mutable one.**
[analytics-time-windows](../../../engineering-assessment/measurement-method/analytics-time-windows/analytics-time-windows.md)
owns the window vocabulary, and its
[canonical-zone-single-source](../../../engineering-assessment/measurement-method/analytics-time-windows/techniques/canonical-zone-single-source.md)
technique is right for reporting: one declared zone, one accessor, because a
report read by two colleagues must mean one business day. Billing cannot take
that rule — the subscriber's zone is a contractual property of *their* account,
mutable data rather than a constant. What transfers is the *singleness* — one
resolver, one chain, echoed with the result — not the fixity. Similarly,
[calendar-arithmetic](../../../engineering-assessment/measurement-method/analytics-time-windows/techniques/calendar-arithmetic.md)
already owns clamping day-of-month overflow and re-anchoring on the original
day; this subject does not restate that arithmetic. What is ours is the anchor
as durable per-subscriber data and the prohibition on state-carried recurrence.

**The half-open convention has a boundary case here, and it is honest to say
so.** The corpus rule is
[half-open-interval-policy](../../../engineering-assessment/measurement-method/analytics-time-windows/techniques/half-open-interval-policy.md):
every window is `[start, end)`, because under a closed-closed convention an
observation on the boundary is counted in both neighbours. That reasoning is
sound and this subject does not dispute it. But a mature billing tree can be
built the other way — boundaries expressed as *dates*, the end materialized as
the last representable instant of the closing day, and event selection written
inclusively at both ends — and it does not double-count. The reason is
structural: when the boundary's identity is a **date** rather than an instant,
consecutive periods cannot share an edge, because "the last instant of the 31st"
and "the first instant of the 1st" are different dates by construction. The
tiling property that half-open exists to guarantee is supplied by the date
domain instead of by the interval convention.

It is not free. The price is a hand-written "plus one unit" everywhere a period
start is derived from a previous period's end — precisely the subtraction the
half-open technique names as a smell, and it is a smell for the reason it says:
it is fragile under a precision change, and it must be confined to one place
that owns period construction. So the honest statement is not "the law is
wrong". It is: **half-open is the correct remedy whenever the boundary's
identity is an instant; when the identity is a date and the conversion to
instants happens once, at the storage edge, a closed-closed materialization is
also sound — and it buys its soundness with a unit adjustment that must live in
exactly one function.** A tree that adopts closed-closed *and* scatters the
adjustment has taken the cost without the benefit.

## What a principal practitioner holds true

- **The period is a value, and it carries its zone.** Start date, end date,
  resolved zone, and the anchor it was derived from travel together. A window
  that arrives somewhere without its zone will be re-resolved by whatever is
  ambient there.
- **Anything derived must be re-derivable.** Every stored boundary names the
  function and inputs that would reproduce it. This is what makes a billing bug
  fixable: recompute, compare, and the difference is the damage.
- **A subscription's anchor is contract data.** Not a technical timestamp; it is
  never "cleaned up", normalized to the runtime zone, or recomputed by a
  migration, and it is a different field from the date its record began.
- **Prefer refusing to bill over billing a window you cannot justify.** An
  unbilled period is recoverable next pass; a wrong invoice sent to a customer
  is not. Every guard in this subject fails toward *not charging*.
- **Every guarantee about periods is a tiling guarantee.** Consecutive periods
  of one subscription have no gap and no overlap, and that property is worth
  asserting over a year of synthetic boundaries — a subscription anchored on the
  31st, one on a leap day, and one whose zone changes mid-period.
- **The customer-facing statement of the period is derived from the boundary
  the biller enforced**, never typed alongside it. When the invoice and the
  meter disagree, the lying one is always the one a human wrote.

## Failure modes of the naive reading

- **"Just store a start timestamp."** It has already lost the zone, and the
  zone is the half of the boundary that can change.
- **"Adding a month is a one-liner."** It is, and the one-liner is only wrong
  in February, which is why it ships.
- **"Hourly is wasteful, nightly is enough."** The pass is cheap precisely
  because it is a state query with an index behind it. Nightly is not a cost
  saving, it is a correctness choice made by accident.
- **"We bill in universal time, so the customer's zone doesn't matter."**
  Defensible if declared in the contract and the field is then immutable.
  Indefensible when the field exists, is editable, and is read by the biller.
- **"A lock stops it running twice."** A lock covers concurrent starts, not the
  pass that ran after a restart killed a worker mid-period-open. Only a derived
  key covers that.
- **"The duplicate-invoice alert is noisy, downgrade it."** It is noisy because
  a normal outcome was spelled as an error. Fix the spelling, not the threshold.

## What this subject refuses

- A period whose next boundary is computed from its own previous boundary.
- A zone read from the ambient runtime anywhere in the boundary path.
- A stored instant treated as the authoritative identity of a period.
- A recurring pass that asks "what has fired since I last ran".
- An idempotency key built from the pass's tick time rather than from the
  period it computed.
- A race-loss reported as a failure.
- A boundary stitched across an implausible gap without a derived bound and a
  refusal beyond it.
- An invoice label written by hand beside the window the meter actually used.

## The techniques

- [timezone-anchored-period-dates](./techniques/timezone-anchored-period-dates.md)
  — the boundary as a date plus an ordered zone-resolution chain, converted to
  an instant only at the storage edge.
- [anchor-re-derived-not-chained](./techniques/anchor-re-derived-not-chained.md)
  — recurrence as a pure function of anchor and index; why accumulated deltas
  drift irreversibly at the first clamped step.
- [boundary-stitch-on-timezone-change](./techniques/boundary-stitch-on-timezone-change.md)
  — asserting continuity against the previous period's recorded end, and
  bounding the stitch by a physical constant of the domain.
- [hourly-pass-with-derived-idempotency](./techniques/hourly-pass-with-derived-idempotency.md)
  — a state-query pass at boundary granularity, a key re-derived rather than
  handed down, and layered guards whose collisions are successes.
