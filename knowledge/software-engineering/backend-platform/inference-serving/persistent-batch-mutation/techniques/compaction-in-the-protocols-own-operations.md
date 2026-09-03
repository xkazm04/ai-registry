---
layer: technique
type: technique
subject: persistent-batch-mutation
technique: compaction-in-the-protocols-own-operations
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [removals leave holes in an array that must stay dense, tempted to add a housekeeping callback to a protocol, deciding whether an operation set is complete]
---

# Compaction expressed in the protocol's own operations

Removals leave holes. The layer underneath usually needs the occupied seats
contiguous — dense arrays are what make the work below a single bulk operation
instead of a loop with gaps. So something has to close the holes, every step,
and every consumer holding parallel state has to close them the same way.

The reflex is a fourth entry point: a `compact` callback that consumers
implement alongside remove, add and move. **Do not add it.** Compaction is
already expressible in the three operations, and expressing it there is not a
trick — it is the test that the operation set was complete.

## The construction

Compaction is a defined, deterministic sequence of **one-way moves**:

> While a hole exists below the highest occupied seat: move the occupant of
> the highest occupied seat into the lowest hole. Then the batch's size is the
> number of occupants.

Highest-into-lowest is the choice that minimises moves — each move fills one
hole and creates one at a position that will never need filling, so the
sequence length is exactly the number of holes below the final boundary. Any
other pairing does at least as much work and most orderings do strictly more.

Three properties make it safe to emit as ordinary moves:

- **It is deterministic.** Given the same set of holes and occupants, every
  producer and every consumer derives the same sequence, so the moves can be
  emitted once by the producer and applied blindly.
- **It is order-dependent, and the protocol already says so.** The moves must
  be applied in the order given: a later move may target a seat vacated by an
  earlier one. A consumer that already applies the move list sequentially
  needs no new rule.
- **The size change is a stated side effect, not an operation.** The holes
  left by removals end up as one contiguous block at the top, so after the
  moves the arrangement shrinks to the occupant count. The protocol declares
  this in its text rather than emitting a "resize" instruction, and consumers
  whose state includes a length recompute it at the defined moment
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
  the derived length names how it is recomputed, and the recomputation is
  "count the occupants after the moves"). Carrying the size as a scalar in the
  record is fine and usually convenient; what is not fine is leaving unsaid
  whether it is the size before the operations or after them, because those
  differ by exactly the number of departures and both readings look right.

Two things follow that are worth stating because they surprise people. The
sequence is often **empty**: when arrivals absorbed every departure by taking
their seats directly, no holes were created and there is nothing to close, so
the steady state pays nothing for a mechanism that exists for the ragged
steps. And the moves it does emit share one list with every other move the
step produced — including the reordering swaps a lower layer asks for to suit
its own execution. A consumer cannot tell them apart, which is the intent: the
moment housekeeping moves are labelled, somebody branches on the label.

The result is the property worth designing for: **a consumer that correctly
implements remove, add and move gets compaction for free and never learns the
word.** It cannot fail to compact, cannot compact differently from its peers,
and cannot be added to the system in a state where it handles the three
operations but not the housekeeping — because there is no housekeeping to
handle.

## The general rule

This generalises well beyond seating charts, and it is the reason the
technique is worth a document of its own:

> When a protocol's operation set is complete, its housekeeping is expressible
> in that operation set. A housekeeping callback is evidence that the
> operation set is incomplete.

Read the presence of a `compact`, `rebalance`, `resync`, `refresh` or `vacuum`
callback as a **finding**, not a feature. Ask what primitive is missing such
that the housekeeping cannot be said in the existing vocabulary. Usually one
of two things is true:

- The vocabulary genuinely lacks a primitive — most often the ability to say
  "relocate" as distinct from "delete then insert". Adding the primitive is
  the fix; it shortens the protocol rather than lengthening it.
- The vocabulary is fine and the callback exists because the producer did not
  want to compute the sequence. That trade moves one deterministic computation
  from the producer into every consumer, which is the same trade that made
  diffing unacceptable in the first place.

The cost of the callback is not the extra method. It is that the arrangement
rules now live in **two** vocabularies
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and they drift at the worst possible moment — when someone extends the
operation set and updates only the one they were looking at. A consumer that
implements move correctly and `compact` slightly differently is aligned on
some steps and not others, which reads as an intermittent bug in whatever
consumes its output.

## Decision rules

- Before adding any callback to a mutation protocol, write the housekeeping as
  a sequence of existing operations. If you can, ship that instead. If you
  cannot, name the missing primitive and add **that**.
- Emit the housekeeping sequence from the producer, in the ordinary operation
  lists, indistinguishable from any other move. Consumers must not be able to
  tell which moves were "housekeeping" — the moment they can, someone will
  branch on it.
- Declare derived quantities (length, occupancy, the boundary) and the exact
  point in the sequence at which they change. Silence here is where consumers
  invent their own moment.
- State the ordering property of the sequence explicitly even though it
  follows from the general move rule. Compaction is the case where a consumer
  is most tempted to "optimise" the list into a single permutation, and that
  optimisation is wrong precisely because of the vacate-then-fill dependency.

## When not to use it

If the underlying layer does not require density, do not compact at all —
tolerate the holes and carry an occupancy mask. Compaction is bought for the
benefit of the consumer below, and paying for it without that consumer is
churn that relocates members for no reason, which in turn forces every
parallel-state holder to do index work it did not need.

If the arrangement's order is itself meaningful — a priority order, a
dependency order — compaction by "highest into lowest hole" destroys it. Then
the housekeeping is a *sort*, not a compaction, and a sort genuinely is not
expressible as a short move sequence the producer wants to emit; that is a
case where the vocabulary needs a different primitive rather than a clever
encoding. Recognising it early is the difference between a protocol with one
extra operation and a protocol with a callback that means something different
in every consumer.
