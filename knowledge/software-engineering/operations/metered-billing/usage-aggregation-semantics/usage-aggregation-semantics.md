---
layer: golden-path
type: golden-path
subject: usage-aggregation-semantics
status: forged
use_when: [adding a usage metric that is not a plain sum, billing a level that persists between events, issuing money before the period closes, a customer disputes a metered line, recomputing a billed period]
techniques:
  - level-valued-time-integral
  - replayed-state-machine-count
  - high-water-mark-advance-billing
  - seeded-recurring-aggregate
---

# Usage aggregation semantics

A metered product takes a stream of usage events and must produce, per
customer per period per metric, **one number**. That fold is this subject.
Not how the events got in the door, not what the number costs — the fold
itself, and the invariants that make the resulting stored number safe to
put on an invoice and safe to compute a second time.

The naive mental model is a sum of a property over the events whose
timestamps fall inside the period. It is a good model. It is also correct
for **exactly two kinds of metric**, and the moment a product ships a third
kind the model does not degrade gracefully — it produces a plausible number
that is wrong in a direction nobody notices until a customer with an unusual
usage shape reads their invoice.

The load-bearing claim of this subject: for every metric kind beyond those
two, **the aggregate is not a function of the events alone.** It is a
function of the events *plus* a persisted seed *plus*, when money is issued
before the period closes, a persisted high-water mark. Those two persisted
values are not caches of something derivable. They are inputs. A team that
believes otherwise will eventually delete one to "recompute cleanly" and
discover it was the only record of a decision the system had already acted
on.

## The two axes that the naive model has no word for

Every metric a metered product ships sits somewhere on two independent axes,
and the naive sum is the origin of that space.

**Flow or level.** A *flow* metric measures a quantity that arrives:
requests served, bytes transferred, tokens generated, messages delivered.
Between two events a flow's value is **zero** — nothing is arriving — so
adding up what arrived inside the window is the complete answer. A *level*
metric measures a quantity that is *held*: bytes stored, seats occupied,
licences assigned, containers running. Between two events a level's value is
**the last value it was set to**, and that between-time is the majority of
the period. A customer who stores a terabyte for thirty days and sends no
event during those thirty days has consumed thirty terabyte-days; a sum over
their events inside the period returns zero. The distinction is the one the
naive model cannot express, because a sum of event properties has no notion
of what was true between the events.

**Window-closed or period-crossing.** A *window-closed* metric's aggregate
is fully determined by events inside the period. A *period-crossing* —
conventionally *recurring* — metric measures something that was already
established before the period began: the terabyte was uploaded in March and
is still there in April, and April contains no event about it. A recurring
metric's aggregate therefore has a value at the instant the period opens,
before a single event is read, and that value must come from somewhere the
period does not contain.

The cross-product gives the whole design space:

| | window-closed | period-crossing |
|---|---|---|
| **flow** | a plain sum, or a count of events — *the two the naive model gets right* | almost always a modelling error; a flow does not persist |
| **level** | a time-integral seeded at zero | a time-integral seeded from prior state |

A third, orthogonal axis decides not *what* is computed but *when it may be
spent*: whether the charge is issued **in arrears**, at period close with
every event in hand, or **in advance**, at the moment an event lands. That
axis is where the high-water mark comes from, and it is the subject's
sharpest edge.

## A level is billed by its integral, not by its changes

Once a metric is a level, the number a customer owes is the **time-integral
of the level across the period**, divided by the period's own duration if
the price is quoted per period. Each event is a *delta to the level*, not a
quantity consumed; what is consumed is level multiplied by the time that
level was held. Ten seats held for half a month and twenty for the other
half is fifteen seat-months, and neither a sum of the deltas (which is ten)
nor the last observed value (twenty) nor the count of events (two) is that
number.

Two consequences that surprise teams:

- **The result is usually fractional, and the fraction is honest.** An
  invoice line reading 14.7 seats is not a rounding bug; it is the mean
  level. A product that refuses fractional quantities has, whether it says
  so or not, chosen a different metric — the peak, or the value at a
  sampling instant — and should say which. Any number that leaves this
  subject travels with its predicate, per
  [a count carrying its predicate](../../../_laws.md#count-carries-predicate):
  "14.7" alone is unbillable; "mean seats held over the period, integrated
  from the period boundaries" is.
- **The period boundaries must themselves carry values.** An integral needs
  a value at the opening instant and a value at the closing instant, and in
  the general case there is no event at either. Handling this by special-
  casing "the first event" and "the last event" is where the arithmetic goes
  wrong, because a period with zero events has neither, a period with one
  event has both being the same row, and a period whose level was set before
  it began has neither in range. The mechanics that close both boundaries
  without a special case are the
  [level-valued-time-integral](./techniques/level-valued-time-integral.md)
  technique.

## Some counts are state machines, not distinct-value counts

The second place the naive model fails silently: a metric that counts *how
many of a thing the customer currently holds* — active seats, assigned
licences, provisioned instances. It looks like a count of distinct
identifiers, and a count of distinct identifiers is what almost every first
implementation computes. That number counts **everything ever seen**, and it
never goes down. A customer who adds a seat and removes it the same day pays
for it every period thereafter, and the defect is invisible in testing
because test data only ever adds.

The correct reading is that each event carries an *operation* — add this
identifier, remove this identifier — and the aggregate is a small state
machine, per identifier, replayed over the period's events in order. The
replay is what buys the properties that matter: a duplicate add is
absorbed, a duplicate remove is absorbed, a remove for something never added
is absorbed, and the same event stream replayed twice produces the same
number. This is the
[replayed-state-machine-count](./techniques/replayed-state-machine-count.md)
technique, and the identifiers it keys on must be minted by whoever owns the
thing being counted rather than derived from a position or a name, per
[identity surviving reuse](../../../_laws.md#identity-survives-reuse).

## Issuing money before the period closes changes what may be billed

A charge billed in arrears has the whole period's events available and can
bill the aggregate. A charge billed **in advance** — money issued the moment
an event lands, so the customer pays for the seat when they add it rather
than a month later — cannot, because at that instant the aggregate is not
final. What it bills instead is the **increment**: how much larger the
aggregate just became.

For a flow metric the increment is simply the event's own contribution, and
this whole section looks like bookkeeping pedantry. For a level metric it is
not, because a level can go *down*, and a decrease must never produce
negative money. So the increment is measured not against the previous
aggregate but against a **high-water mark**: the largest value the aggregate
has ever reached in this period. The charge is current minus that mark, and
the mark advances only upward — a ratchet.

Its two consequences are properties of the pricing model that a product
should state to its customers rather than discover in a support ticket.
**Scaling down and back up within a period is paid for once**: a customer who
holds twenty seats, drops to ten and returns to twenty owes for twenty, not
thirty. And **the ratchet cannot be recomputed from the events**, because a
rescan would compute the current level, find it below the mark, and
"correct" the stored value downward — refunding money that has already been
issued. The ratchet, the self-exclusion rule that keeps a retried job from
charging twice, and the reconciliation path that replaces the rescan are the
[high-water-mark-advance-billing](./techniques/high-water-mark-advance-billing.md)
technique.

## A period-crossing metric is seeded, and the seed has a convention

For a recurring metric the aggregate at the period's opening instant is a
real, nonzero quantity that no event in the period will tell you about. It
has to be **seeded** — from a stored value carried over from the previous
period if one exists, else by re-deriving it from the earlier events, else
from an explicit zero — and *which of those three* was used is itself
information the run should record.

The trap that justifies a whole technique is not the seeding; it is the
**agreement between the seed and the aggregation's own boundary
convention**. Any replay over a window has to decide what an identifier's
state was *before* the window opened, and the query answers that with a
default. The seed answers the same question from the other side. If the
default assumes "absent before the window" while the seed asserts "held
before the window", the two halves contradict, and the failure is not a
crash — it is a recurring metric that re-bills its entire pre-existing
population in every period, forever, growing. One convention, one authority,
both halves deriving from it, per
[one authority per vocabulary](../../../_laws.md#one-authority-per-vocabulary).
A seed that is missing must not be silently read as zero, per
[unknown not being a value](../../../_laws.md#unknown-is-not-a-value): "we have
no carried-over state" and "the customer held nothing" are different facts
and only one of them is safe to bill. This is the
[seeded-recurring-aggregate](./techniques/seeded-recurring-aggregate.md)
technique.

## What makes a stored aggregate safe to trust

Four invariants. Each one is cheap to install at the start and expensive to
retrofit after a period has been invoiced.

- **The fold is deterministic.** Nothing inside the aggregation may read the
  current time, and every ordering must be total. A replay over the same
  events and the same period must produce the same number, or no dispute can
  ever be resolved and no migration can ever be verified. Ties on the event
  timestamp are broken by a stable secondary key, never left to the store's
  scan order.
- **Period boundaries are half-open and stated once.** An event exactly on a
  boundary belongs to exactly one period. Two readers with different
  conventions bill it twice or never, and the number that results is
  plausible in both cases.
- **A stored aggregate names its recomputation** — or names why it has none.
  This is [derivation naming recomputation](../../../_laws.md#derivation-names-recomputation)
  applied to the persisted numbers this subject creates, and the ratchet is
  the interesting case: its recomputation path is *not* "re-scan the events",
  it is "replay the charges already issued". Naming a different path
  satisfies the law; naming none does not.
- **A per-event stored aggregate excludes its own event from the query that
  produces it.** Deliveries retry, jobs re-run, and the second run finds the
  first run's own row already in the store. Without an explicit exclusion
  keyed on the event's identity, the retry charges again — and the charge
  looks legitimate at every layer above.

## Boundaries

**This subject does not own admission.** Whether an event is well-formed,
authenticated, deduplicated, bound to a subscription and accepted at all
belongs to the sibling subject on usage event ingestion. This subject starts
from a table of admitted events and assumes each appears once.

**This subject does not own money.** Turning an aggregated quantity into a
currency amount — tiers, packages, graduated and volume schedules, minimums,
free units — belongs to the sibling subject on usage pricing models. The
seam is exactly one value wide: this subject hands over a quantity and the
predicate that defines it, and never multiplies by a rate.

**On which clock the fold keys, and why it differs from the observability
tree.** Elsewhere in this registry a technique on telemetry clocks argues
that accounting must key on *receipt* time, because a client that can move
the accounting clock can move its own spend out of the window. That argument
is correct in its domain and does not transplant here unchanged, and the
discriminator is worth naming precisely rather than declaring one side
wrong.

Two questions decide it. **Who owns the fact?** When the emitter is an
untrusted caller and the event is evidence about itself, the clock must be
one the caller cannot move. When the emitter is a customer's own system
under a commercial contract, the timestamp is a claim about the customer's
own timeline that the customer is entitled to make and accountable for —
their batch upload at midnight describes work done at noon, and billing it
at midnight is simply wrong. **Is there a correction path?** A real-time
admission decision has none: an admitted request cannot be un-admitted, so
lateness must be impossible rather than handled. A monthly invoice has one:
disputes, credit notes, and a next period. Where a correction path exists,
keying on the emitter's event time is the more truthful choice.

That permission is not free, and a system taking it owes two things it
would not otherwise owe. It must **bound accepted lateness** explicitly, and
it must **state what happens to an event that arrives after its period was
invoiced** — refused, or applied to the open period carrying a reference to
the period it belongs to. An event-time key with neither is a receipt-time
system with the safety removed, and it will re-open a closed period on a
Tuesday because a customer's queue drained.

**On why the high-water mark is deliberately not provable against a full
scan.** The same registry's guidance on rolling-window caches insists an
incremental total be property-tested against a full-scan reference, because
a cache that disagrees with its source is a bug. That rule is right for a
cache, and the ratchet is not a cache. The difference is whether the stored
value is a *pure function of the source*: a rolling window total is, so the
scan is its oracle and any divergence is a defect. The ratchet records an
**irreversible external effect** — money left the system when the peak was
reached — so the events are not its oracle. Re-deriving it from the events
does not repair it; it unbills. The general rule this subject holds: a
derived value is provable against its source only while the derivation is
pure, and a value that records an issued effect is not derived but ledgered.
Reconcile it against the effects — the charges actually issued — and never
against the stream.

## What this subject refuses

- **A sum over a level metric.** It bills the change and ignores the
  holding, and for a customer whose level is stable it bills nothing at all.
- **A count of distinct identifiers where the question was "how many are
  held now".** It is monotonically wrong and only ever in the customer's
  disfavour.
- **A boundary handled by special-casing first and last events.** The empty
  period, the single-event period and the period whose level predates it are
  three separate wrong answers waiting.
- **A seed silently defaulting to zero.** Absent carried-over state is
  unknown, not empty, and the two must be distinguishable in the output.
- **A seed convention that disagrees with the query's own boundary default.**
  Two halves of one decision, maintained separately, is a race with an
  invoice at the end of it.
- **Recomputing an advance-billed period from the events.** It refunds
  charges that were issued, silently, and the customer will not report it.
- **A per-event aggregate that includes its own event.** Every retry is a
  duplicate charge that passes every review.
- **Reading the current time anywhere inside the fold.** A non-deterministic
  aggregate cannot be defended in a dispute.

## The techniques

- [level-valued-time-integral](./techniques/level-valued-time-integral.md) —
  events as deltas to a level, billed by the level's integral over the
  period, with both boundaries closed by construction rather than by
  special case.
- [replayed-state-machine-count](./techniques/replayed-state-machine-count.md)
  — counting what is currently held by replaying per-identifier add and
  remove operations, absorbing duplicates and leading removes.
- [high-water-mark-advance-billing](./techniques/high-water-mark-advance-billing.md)
  — billing the increment to a monotonic peak when money is issued before
  the period closes, and keeping a retry from charging twice.
- [seeded-recurring-aggregate](./techniques/seeded-recurring-aggregate.md) —
  supplying the value a period opens at, from three ordered sources, and
  keeping that seed in agreement with the aggregation's boundary default.
