---
layer: technique
type: technique
subject: durable-agent-operations
technique: settlement-order-is-not-placement-order
status: forged
laws: [record-precedes-effect, identity-survives-reuse]
shared_with: []
use_when: [parallel tool calls must appear in the order the model asked for them, a crash re-ran effects that had already completed, a finished call disappears from the display until its result is placed, deciding when a batch of results enters the transcript]
---

# Settlement order is not placement order

A model asks for three tools in one message. They run in parallel, because
running them one at a time wastes the latency of the two that are ready. They
finish in whatever order the world decides. And their results must appear in
the transcript in the order the model asked for them, because that ordering is
what the next request will read.

Two orders, then, and the defect this technique removes is treating them as
one. Give the result a durable state **between** "the effect settled" and "the
result is placed": outcome durability follows completion order, materialization
follows required order, and neither waits for the other.

## The failure, as a trace

Calls A, B and C are dispatched together. B finishes. C finishes. A is still
running, so neither B's nor C's result can enter the transcript yet — placement
is ordered and A holds position one. The process dies.

Without an intermediate durable state, B's and C's finished results existed
only in memory. Recovery reads the durable record, sees three calls that never
settled, and applies the unknown-outcome policy to all three. The best case is
that B and C are re-run. **The cost is not a lost result; it is a repeated side
effect** — two files written twice, two messages sent twice — and it is the
kind of repetition that a re-run-safety declaration was never asked about,
because from the tool author's point of view the call had finished.

The fix is a state that says *this effect is over and its result is durable; it
is only waiting for its turn*. It is
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) read
forwards: the effect's outcome becomes durable at the first moment it can be,
rather than at the first moment it is convenient to place.

## The two orders, named separately

Conflating them is the whole defect, so name them:

- **Outcome durability** follows *actual completion order*. The moment a call's
  final result is complete, it is staged durably and the call's state advances.
  Nothing about a sibling can delay this.
- **Entry materialization** follows *required source order*. A result enters
  the transcript only when every earlier position is complete or ready.

The staged result is the canonical final result — complete, bounded, and
independent of any progress snapshot the tool may have been emitting. A design
that stages the latest progress snapshot and calls it the outcome has inferred
completion from partial output, which is the same absent-value inference in
another costume.

The identity discipline carries across the boundary
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): the
result's identity is the one reserved before the effect started, it is unchanged
by staging, and placement fills that exact slot. So a call is addressable by one
identity through its whole life — dispatched, settled, placed — and no consumer
has to re-key when it moves.

## Placement is a prefix flush, not a barrier

When any outcome stages, materialize the **contiguous run of ready results
starting at the first position that is not yet placed**. Several may enter in
one transaction. Then stop; a later sibling that is ready but has a gap before
it waits.

The wrong design here is a barrier at the end of the turn: hold everything until
all calls are complete, then place them all at once. It is tempting because it
sounds atomic, and it is wrong for a concrete reason. With a prefix flush, an
early result *can* be placed while later siblings are still running — so a
turn-end barrier that also drives the display would leave that result present
in the placed transcript and simultaneously in the in-flight collection, and
every consumer sees it twice. The flush and the projection have to agree on the
same event, and the event is placement of that call, not the end of the turn.

## What a projection owes the intermediate state

The moment a third state exists, anything that renders the operation has three
states to render and not two. This is the half that looks like presentation
detail and is not — it is an obligation created by the durable model, and it
belongs here rather than in a display subject because a display subject cannot
state it without importing this state machine.

The mapping is total:

| durable state | what a projection shows |
| --- | --- |
| dispatched, effect pending | in flight |
| settled, staged, not placed | in flight, marked settled |
| placed | a transcript record |

The middle row is the one that gets dropped, and it was found as a shipped bug
rather than reasoned about: a call **vanished** from the display between its
effect completing and its placement, and reappeared only when placement
happened. A viewer that reconnected inside that window saw nothing at all,
although the finished result was already durable. The fix is not to hide the
state but to project it — and to remove a call from the in-flight collection on
**its own placement event**, never on the end of the turn.

For each call after it becomes visible, the in-flight projection and the placed
transcript have **no gap and no overlap**. That sentence is the acceptance test
for the whole projection, and it fails in both directions if placement is
batched at turn end.

## Invariants a reader can check

- Every settled-but-unplaced result has exactly one finalized staged payload,
  no placed record, and no leftover progress snapshot.
- A settled or placed call never executes again — this is the property the
  intermediate state was invented to buy, and it is worth asserting directly.
- Staging in completion order never extends the placed prefix; only ordered
  materialization does.
- The sequence of placed results, read back, is the source order the model
  asked in, regardless of the order the effects finished.
- Progress snapshots are deleted by the staging commit; the staged result never
  depends on one.

## Decision rules

- Introduce the intermediate durable state as soon as effects can settle in an
  order different from the order their results must appear.
- Stage the complete canonical result at settlement, in completion order,
  bounded independently of any progress output.
- Materialize the contiguous ready prefix from the first unplaced position;
  place several in one transaction when several are ready.
- Never gate placement on the end of the turn or on all siblings being
  complete.
- Delete the call's progress snapshot and any invocation-scoped scratch state in
  the staging commit, and refuse late writes against a call that has staged.
- Project all three states; drop a call from the in-flight collection on its own
  placement, not on turn end.
- Under sequential execution keep the same states — the machine is identical,
  only the ready set is smaller — so recovery has one code path rather than two.

## Boundary: this is not a delivery guarantee

A different bundle owns ordered delivery to consumers — how a stream of events
reaches subscribers at least once and in order. That is not this. This technique
orders **materializations into one record**, where the ordering constraint comes
from the record's own semantics (the next model request reads the transcript and
the transcript must read as the model wrote it), not from a consumer's
expectations, and where the failure mode is a repeated effect rather than a
missed or duplicated delivery. The two disciplines do not share a mechanism and
neither is a special case of the other.

## When not to use it

If effects never run concurrently, there is no second order and the intermediate
state is a leaf nobody enters — place at settlement. If results genuinely may
appear in completion order, the ordering constraint is absent and the same
applies. The technique starts paying at the first parallel batch whose results
feed a record with a required order, which in an agent runtime is the first turn
that issues two tool calls at once.
