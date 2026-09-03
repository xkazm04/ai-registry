---
layer: technique
type: technique
subject: persistent-batch-mutation
technique: typed-ordered-mutation-protocol
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [designing the contract between a batch owner and components holding parallel per-slot state, an extension's arrays drift out of alignment with the batch, deciding what a per-step diff must carry]
---

# The typed, ordered mutation protocol

The producer of a batch mutation knows exactly what it did. Every consumer
that must stay aligned with the result is one reimplementation of a diff away
from disagreeing with it. This technique closes that gap by making the
producer **state** the mutation as data, with an operation vocabulary, a
processing order, and index semantics all fixed by the specification rather
than by each consumer's reading — a single authority for the vocabulary that
every consumer derives from
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The record

One record per step, delivered to every stateful consumer before any of them
transforms anything. It carries three lists and one scalar:

| field | entry | meaning |
| --- | --- | --- |
| **removed** | an index | the occupant of that seat departed with nobody taking it; drop your entry |
| **added** | an index, the new member's configuration, and references to its input and its growing output | a member now occupies that seat; build your entry — and if the seat was occupied, drop the old entry first |
| **moved** | source index, destination index, and a directionality flag | an occupant relocates; carry your entry with it |
| **size** | a count | how many seats are occupied |

Nothing else. No "this member's output grew" (see the reference rule below),
no compaction instruction (see the sibling technique).

The scalar deserves one rule of its own: **a size carried alongside a set of
operations must name the moment it is evaluated** — before the operations, or
after them. It cannot be left to the reader, because both readings are
plausible and they differ by exactly the number of departures. A record that
describes its size field as "the current count" in one place and "the count at
the start of the step" in another has, in practice, no specification for it at
all, and every consumer picks a reading by experiment.

## The processing order is semantics

**Removes, then adds, then moves.** Each within its own list in the order
given. A consumer that reorders these gets a different final arrangement from
the same record, which is why this is a specified rule and not advice.

Two of the three positions carry real weight:

- **Removes and adds** are both stated against the arrangement at the start of
  the step, and a well-built producer keeps their index sets disjoint — it
  never removes a seat that an add in the same record targets. Their relative
  order is therefore a choice, made once and written down; put removes first
  so the record reads as departures then arrivals.
- **Moves last** relocate survivors, including everything compaction needs.
  The move list is ordered and applied sequentially: a one-way move vacates
  its source, and a later entry in the same list may legitimately target that
  freshly vacated seat. Reading the list as a set of simultaneous
  reassignments produces a permutation the producer never described.

**Do not rely on the declaration order of the fields to convey this.** The
processing order lives in prose; the structure's field order is whatever the
author typed. When the two disagree — and they do, quietly, because nothing
checks it — every implementer who reads the type instead of the prose gets a
subtly different arrangement. Either make the field order match the processing
order or say in the structure's own comment that it does not.

## An add may replace, and that is the common path

An add whose index is already occupied **replaces** that occupant: the
newcomer takes the seat and the previous member's state is discarded. An add
whose index is past the end **extends** the arrangement.

Replacement is not an edge case to be tolerated; it is what keeps the record
small. A departing member and an arriving one are matched up by the producer
and expressed as one add, instead of a remove plus an add plus the compaction
move that the resulting hole would have required. On a system in steady state
— roughly as many arrivals as departures each step — this collapses almost the
entire record to a short add list.

The cost is that the operation set now has **two ways a member can end**: an
explicit remove, and an add that takes its seat. An implementer who reads the
operation names and handles "remove" will drop nothing on the common path.
Specify the obligation as a single sentence that covers both — *discard the
entry for any member that was removed or whose seat was taken* — and put it in
the implementer's checklist, not only in the add's definition.

## The index-semantics rule, stated because it is the one people get wrong

**An add's index is the index at the time of the add — before any move in the
same record is applied.** Say it in the specification, in those words.

The failure it prevents is subtle and does not announce itself. A reader who
scans the whole record before acting naturally interprets every index as
"where things end up", because that is how a declarative patch usually reads.
Under that reading a record containing both an add and a move that touches the
same region places the newcomer in the wrong seat, and the consumer's array is
now permanently one member out of step with the batch — not crashed, not
empty, just wrong. Every downstream per-slot value is attributed to the wrong
member from that point on.

The same rule applied to removes: a removed index refers to the arrangement
*before* this record was applied at all. Both are consequences of one
principle worth stating for any patch format — **an index is interpreted in
the state that exists when its own operation executes**, which is why the
processing order has to be specified before the indices mean anything.

## One-way move versus swap

Two distinct instructions, and collapsing them is a real bug:

- **One-way**: the occupant moves from source to destination; the source seat
  becomes a hole, and anything that was at the destination is displaced and
  discarded — a third way a member can end, and the reason a one-way move must
  never be emitted onto a seat whose occupant is still live. This is the
  compaction primitive.
- **Swap**: the occupants of the two seats exchange. Nothing becomes vacant
  and nothing is discarded.

A consumer that implements both as an exchange leaves the source seat holding
a member that has departed; a consumer that implements both as "write at the
destination" silently keeps the displaced entry alive. The flag is one bit and
it must be in the record — the destination being empty is *not* a reliable
discriminator, because a consumer applying operations sequentially cannot ask
the batch about occupancy without reintroducing the diffing it was built to
avoid.

## Membership-unchanged is a value, not an absence

There must be a distinguished record meaning **the seating chart did not
change**, and its contract must say explicitly that this is not the same as
"you have no work to do".

The distinction exists because the highest-frequency change in this kind of
system — each member's output growing by one element — is deliberately *not*
in the record. A consumer that watches that growth is fully occupied on a step
whose membership record is the unchanged value. Consumers that key off "the
record is empty, skip me" therefore skip on the steady state, which is the
majority of steps, and the defect appears only under sustained load with no
churn.

Conversely, a consumer whose entire state is membership-derived is entitled to
return immediately on the unchanged value, and should — see the early-exit
rule in
[declared-skippability-at-batch-granularity](./declared-skippability-at-batch-granularity.md).
The point is that the record does not decide this for the consumer; it reports
a fact and each consumer maps it to its own meaning.

## The reference-passing rule and its cost

An add carries a **live reference** to the new member's growing output rather
than a copy. Consumers observe growth without notification, which is what
allows the highest-frequency event in the system to generate no protocol
traffic at all.

The price is ownership, and it must be taught alongside the benefit. Holding
the reference keeps the whole structure reachable. A consumer that fails to
drop its entry when a member departs holds that member's complete output for
the life of the process, and the leak scales with throughput while remaining
invisible in that consumer's own footprint accounting — it is holding somebody
else's allocation. **Departure is not bookkeeping; it is the reaper the add
named** ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)),
and it is spelled three ways — an explicit remove, a replacing add, and a
one-way move onto the seat. A consumer that implements add without
implementing all three is not partially correct; it is a leak with a feature.

A consumer that keeps only a sparse subset of members — a map holding entries
for the few that enabled it — is not exempt. It is exempt from the *cost* of
the discard, not from the discard: an entry it holds for a departed member
pins that member's output exactly as a dense array would.

Keep the reference to the *output*, never to the seat. Indices are reused as
soon as they are vacated, so a consumer holding an index across steps is
holding whoever sits there next
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); the
protocol's job is precisely to keep index-keyed structures aligned within one
step, not to make indices durable.

## Decision rules

- Emit the record from the component that performed the mutation, never from a
  component that observed the result. An observer must diff; that is the
  failure being designed out.
- Specify the processing order, the index-time semantics, and the
  unchanged-value meaning in the same document as the operation list. A
  vocabulary without its evaluation rules is not a specification.
- Ship worked before/after arrangements with the specification, including at
  least one record that mixes adds and moves. That example is what an
  implementer actually tests against, and it is the only cheap way to catch a
  wrong reading of the index rule.
- Validate a member's configuration at admission, not in the state-update
  phase. The record's job is to describe seating; a consumer that discovers a
  malformed configuration while reconciling has no good move — refusing leaves
  its peers reconciled and itself not. Give the consumer a separate
  validation entry point that runs when the member is first accepted, so that
  everything reaching the protocol is already well-formed.
- Let consumers choose a sparse representation. A consumer that expects to be
  configured by a small minority of members should hold a map keyed by seat
  rather than an array sized to the batch — the protocol's operations apply
  identically, and the reconciliation cost then scales with the members that
  enabled it rather than with the batch.
- Where several consumers implement the same protocol, give them one shared
  applier for the index arithmetic and let them supply only "how do I move,
  create, and drop my own entry". The arithmetic is where the divergence
  lives.

## When not to use it

Do not reach for this when the collection is rebuilt each step rather than
edited: if nothing survives across steps, there is no parallel state to keep
aligned and a protocol is pure overhead. Do not use it when consumers key
their state by member identity rather than by position — a map from identity
to state needs only "these left, these joined", and moves are meaningless to
it; adopt the full protocol only when position is load-bearing because
something below demands a dense, ordered array. And do not use it as a
general-purpose change feed: it describes seating, not content, and every
attempt to smuggle content changes into it re-creates the notification traffic
the reference rule exists to avoid.
