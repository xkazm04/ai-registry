---
layer: technique
type: technique
subject: scale-investment-timing
technique: next-order-of-magnitude-only
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [sizing a system for growth it has not yet seen, choosing which load axis to design against, deciding whether to build past the next increment]
---

# One order of magnitude, on a named axis

**Build for ten times the current load on the axis that binds first, and stop.** The
rule is easy to state and it fails in practice for two reasons that have nothing to do
with the multiplier: teams pick the wrong axis, and they do not know which of their
design decisions are reversible later.

## Ten times *what*

"Ten times the scale" is not a specification. A system has many load axes and they
grow at different rates, cost different amounts per unit, and saturate different
components:

- request rate
- concurrent sessions
- tenants or accounts
- total stored bytes
- **the largest single instance** — the biggest tenant, the longest collection, the
  widest document
- fan-out per write — how many downstream records, indexes, notifications or
  invalidations one incoming change causes
- retention depth — how much history a query may legitimately touch
- **a shared downstream's budget** — a provider quota, a store's connection count, a
  paid upstream's rate — that every instance of the system draws on. It is the only axis
  on this list that does not move when the system is given more machines, which is why
  it binds first for systems whose work is mostly delegated to something they call.
  Pacing calls against it is
  [rate-limiting](../../rate-limiting/rate-limiting.md); this technique's part is to
  notice that it is the axis at all

The binding axis is **the one with the worst constant, not the one with the biggest
number.** A system taking a thousand requests a second where each request costs a
tenth of a millisecond is nowhere near trouble; a system taking ten a second where one
of them fans out to forty thousand index updates is already in it. Enumerate the
axes, compute the work one unit causes on each, and the binding axis is usually
obvious once the fan-out column exists — and it is usually not the axis anyone quotes
in a status update, because the quoted axis is the one that sounds impressive.

**Skew is the axis teams miss most reliably.** Aggregate growth from many small users
is kind: it arrives gradually and it distributes. Two ordinary kinds of growth are not.
The first is the **step** — a launch, a campaign, a crawler, one customer whose
onboarding is a contract rather than a trend — where the axis is flat until a known
date and then is not, so a projection-based increment has nothing to fit and the
increment is sized against the event instead. The second is the largest single
instance, which grows without any aggregate signal and breaks whatever assumed a
bounded working set — the query that was fine against a thousand rows, the payload that fit in
one response, the lock held for the duration of one account's update. A system can be
comfortable on every aggregate axis and be one large customer away from an incident.
Design against the largest instance you can plausibly acquire, not the mean one.

Whatever figure comes out carries its predicate per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): the axis, the
period, and what was counted. "Ten times" written without its axis is the same failure
as a ceiling without one, one level earlier.

## Why one increment and not three

Because the projection cannot support three. Confidence in a growth curve decays
sharply with horizon — a curve that is credible for four quarters is a rough shape at
eight and a mood at twenty — and the increment is sized to what the projection can
actually bear. Building three increments ahead is not caution; it is spending real
money against a number whose error bars exceed the number.

The projection itself belongs to
[metric-forecasting](../../../../engineering-assessment/measurement-method/metric-forecasting/metric-forecasting.md),
including whether it may be shown at all. This technique consumes it. Where that
subject publishes a confidence band, size against the band's optimistic edge rather
than its centre, for the same reason a runway calculation does: being early is a cost
and being late is an outage.

The sizing target is itself a derived value and names its recomputation, per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).
Re-derive it when the binding axis changes — and it does change, because relieving the
current binding axis promotes the next one, which is the normal and expected result of
a successful increment rather than a sign the analysis was wrong.

## Say out loud that you are buying a future migration

An increment is chosen in the knowledge that a later one will be needed. Teams that
leave this implicit reliably misread the second increment as evidence the first
design was wrong, and over-correct into building for a destination — which is the
failure this technique exists to prevent, arriving by way of its own success.

State it in the design note, in one line, with the increment: *this design is expected
to be replaced on the storage axis at roughly this figure; that is the plan, not a
defect.* It costs a sentence and it prevents an architecture review from becoming a
retrospective.

## The irreversibility test — where the rule stops

The increment strategy rests on an assumption that is usually true and occasionally
catastrophic: **that the next increment will be available when it is needed.** For
most of a system, it is — capacity gets added, components get replaced, the strangling
path exists. For a specific and identifiable minority, it does not.

Before accepting one increment, ask of each decision: *if this is wrong at ten times
the scale, can it be changed then?* The decisions that answer no are consistent across
systems:

- **The identifier scheme.** Key width, sequence-versus-random, whether an identifier
  encodes a location or a tenant. Every stored reference and every external system
  that has seen one is a migration cost.
- **The persisted data model**, wherever data is durable and customer-owned. Changing
  it later is a data migration under load, which is possible and expensive; some
  changes are effectively one-way once volume is large enough that the migration
  cannot finish in any acceptable window.
- **Anything a caller can observe and depend on** — a public interface, a consistency
  or ordering guarantee, an at-least-once versus exactly-once contract. Guarantees can
  be strengthened later; they cannot be weakened, because callers have already been
  written against them.
- **Anything that leaves the system permanently** — an exported format, an event
  schema on a durable log, an integration another organisation has built against.

For these, build for the horizon you can genuinely defend rather than one increment,
and accept the extra cost knowingly. The extra cost is small in most cases: a wider
key, a version field on a persisted record, a reserved dimension in an event schema —
cheap now and unbuyable later. **The asymmetry is the whole argument.** Over-building a
reversible decision wastes money; under-building an irreversible one buys a migration
that may not have a viable window.

Note what does *not* go on this list: the compute topology, the caching strategy, the
queueing arrangement, the choice of one node or several. Those look foundational and
are among the most replaceable parts of a system.

## When not to apply it

**When there is no observed load at all.** A system with no users has no binding axis,
and the analysis produces an argument rather than a measurement. Build for what would
merely be embarrassing to fail at, keep the irreversible decisions conservative, and
come back when there is a curve.

**When the increment is smaller than the noise.** If a workload's peaks already vary
by an order of magnitude, "ten times the current load" is not a meaningful target;
size against the peak's distribution instead.

**When the axis is externally imposed.** A contractual throughput commitment or a
regulatory retention period is a requirement, not a projection, and it is designed for
directly at its stated figure. The rest of this technique still applies to every axis
that is not so fixed.
