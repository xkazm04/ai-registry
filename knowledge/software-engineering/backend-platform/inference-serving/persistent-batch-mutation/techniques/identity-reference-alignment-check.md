---
layer: technique
type: technique
subject: persistent-batch-mutation
technique: identity-reference-alignment-check
status: forged
laws: [gate-sees-target, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [testing a component that holds parallel per-slot state beside a mutated batch, adding a new consumer of a mutation record, a hand-written consumer reimplements the index arithmetic, deciding whether worked examples are enough coverage]
---

# The identity-reference alignment check

Every other rule in this subject exists because misalignment is quiet. A
consumer whose entry for seat *i* belongs to the wrong member does not crash
and does not return empty; it applies one member's constraint to another
member's output, and the output is merely a little wrong, forever. A defect
that announces nothing is not caught by care, by review, or by a test that
checks what a correct consumer produces on the inputs its author thought of.
It is caught by a reference that knows who is sitting where, compared against
every consumer on every step.

## The harness

Three parts, each simple, and the value is in running them together:

1. **A randomized producer that uses the real construction rules.** Arrivals
   take departed members' seats first, surplus arrivals extend the end,
   leftover departures are removed and closed up by one-way moves, and the
   lower layer's reordering swaps are appended, with the counts per step
   drawn at random and many steps chained. It emits exactly the record the
   real producer would emit. A producer that emits shapes the real one never
   does tests a protocol nobody ships; a producer that emits only the shapes
   somebody wrote down tests their imagination.
2. **A shadow seating chart keyed by identity.** The generator applies each
   step to a plain list of member identities, the obvious way, in the same
   breath as it writes the record. This list is the ground truth. It carries
   no index arithmetic of its own worth trusting, because it never interprets
   a record — it performs the mutation and writes down what it did.
3. **An exact comparison after every step.** For every consumer, the entry map
   it holds must equal the map computed from the shadow: *for each seat, the
   entry for the identity now sitting there, and nothing at any seat whose
   occupant has not enabled this consumer.* Equality, not inspection of the
   seats you expect to be populated.

Give every identity a value that is distinct from every other identity's, so
a swapped or stale entry cannot pass by coincidence. A population where every
member carries the same default configuration hides every alignment bug there
is ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Why worked examples are not the same thing

A specification should still ship worked before/after arrangements; they are
how an implementer learns the rules. As a test, they have two blind spots
that are structural rather than a matter of how many you write.

**One step cannot see a multi-step defect.** A consumer that skips a remove
because the same record also carries an add, or that leaves residue at a
seat the batch has shrunk past, is correct at the end of the step that
caused it. The defect surfaces steps later, when the batch grows back over
that seat or a later record reaches it. Only a chain of steps exposes it.

**A hand-picked record can make the rule under test invisible.** The natural
example of "adds before moves, moves in order" mixes a close-up move with a
reordering swap, and the two touch disjoint seats — so they commute, and the
example passes a consumer that applies the move list backwards. The example
looks like it exercises the ordering rule and cannot detect a violation of
it.

Measured against six seeded consumer defects on a real shared applier, the
two published worked examples, run over every subset of members enabling the
consumer, caught three. The randomized identity check caught all five of the
defects that were observable under the real producer.

## What the comparison must assert, or it checks nothing

The load-bearing half of the check is **absence**. A validator that walks the
seats whose occupant enabled the consumer and asserts each entry is present
and correct passes every consumer that leaks. The leak classes this subject
names — the replacing add that does not evict, the one-way move that keeps
its source entry, the remove skipped because the same record also carried
an add — leave an extra entry
at a seat whose current occupant never asked for one. A presence-only check
is a gate over a proxy for alignment
([gate-sees-target](../../../../_laws.md#gate-sees-target)); in the
measurement above it caught two of the five defects that full equality
caught.

The population must be mixed for the same reason. Absence can only be
asserted at a seat whose occupant does not enable the consumer. Test a
consumer in a batch where every member enables it and the whole leak family
becomes unobservable by construction — every swap is symmetric, every
replacing add overwrites. This is the realistic trap: a consumer gets
isolated in its own test case "to avoid cross-talk", every member in that
case configures it, and the defect that needs one member that does not
configure it ships as a production bug.

## Prove the harness can fail

A harness that has only ever passed has not shown it can see anything
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Before trusting it, seed a defect per rule it is meant to guard — drop one
eviction path, reverse the move list, collapse a one-way move into
write-the-destination — and confirm each fails within a bounded number of
steps and seeds. Keep one **equivalent** mutation as a control: a change the
protocol permits, such as processing removes and adds in the other relative
order when the producer keeps their seats disjoint. It must pass. A harness
that fails the control is testing an implementation rather than the
protocol, and one that misses a seeded defect has a generator that never
produces the shape that defect needs.

A seeded defect that nothing catches is also information about the protocol.
If a mutation survives every seed, ask whether the producer can ever emit the
shape that would expose it. If it cannot, the rule the mutation breaks is
redundant under this producer — worth knowing before a consumer is told to
pay for it.

## Decision rules

- Run the check against every consumer of the record, including the ones
  that are not formally extensions — a helper that syncs its own per-slot
  dictionary from the same record is a consumer, and a hand-rolled one is the
  likeliest to be wrong.
- Drive it from the producer's real construction rules, over many chained
  steps and several seeds, with a mixed population in which each consumer is
  enabled by some members and not others.
- Compare whole entry maps against the identity shadow after every step.
  Never validate only the seats you expect to hold something.
- Mutation-check the harness once per rule it guards, with one equivalent
  mutation as the control.
- Treat a production alignment fix that arrives with a single hand-built
  record as a test as unfinished: the next consumer will repeat the defect in
  a shape that record does not cover. Add the consumer to the randomized check.

## The runtime half, when a test is not enough

Where seats are reused across a long-lived process and a stale reference is
possible, stamp each seat with a generation that increments on every reuse,
and have anything that holds a seat reference beyond the current step carry
the generation with it. A stale holder then compares unequal and fails
loudly instead of reading the new occupant. It is the same idea as the
shadow, moved into production at the cost of one integer per seat. It
detects stale references; it does not detect a consumer that moved its own
entries wrongly within a step, which is what the test exists for.

## When not to use it

If consumers re-derive their per-slot state from the member itself every
step, there is no cross-step state to drift and the check reduces to an
ordinary unit test of the derivation. If the collection is rebuilt from
scratch every step, there is nothing persistent to align. And the check is
only as good as the producer model it runs: when the real producer's
construction rules change — a new reordering source, a new way to vacate a
seat — the generator must change with them, or the harness certifies the old
protocol.
