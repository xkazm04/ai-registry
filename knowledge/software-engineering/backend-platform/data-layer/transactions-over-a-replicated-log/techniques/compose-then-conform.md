---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: compose-then-conform
status: forged
laws: [gate-sees-target, creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [a cache or encoding or view wrapper is added above a transactional store, proving a transaction behaves the same through every layer as through the bare engine, several storage backends must agree on a sequence of operations, a transaction is opened and never closed]
---

# Compose, then conform

A storage interface with transactions is realized many times: by each
engine beneath it, and by each wrapper above - a cache, an encoding layer
that transforms keys or values, a view that confines a caller to a prefix,
a fault injector for tests. Every one of them is a full implementation of
the same contract, and the contract now includes begin, read-inside,
write-inside, commit and rollback, with all the ordering that implies. A
compiler checks that each has the methods. Nothing checks that a
transaction through a cache above a replicated engine behaves like one
through the bare engine, and that is the property the callers depend on.

## The rule

**Every implementation of the storage interface - engines and wrappers
alike - re-enters one differential conformance matrix: a fixed set of
operation sequences plus randomly generated ones, each run on every
implementation both inside and outside a transaction, with the resulting
observable state diffed across implementations at the first divergence.**
A new wrapper is not done when it compiles or when its own unit tests pass;
it is done when it produces the same trace as every other implementation on
every sequence in the matrix.

The naive reading tests each layer against its own contract: the cache's
tests check that the cache caches, the view's tests check that the view
confines, the engine's tests check that the engine stores. Each passes, and
the composition is wrong in a way none of them can see - the cache serves
a read inside a transaction from an entry that another committed
transaction has since invalidated, or does not invalidate on a
transactional commit at all because the invalidation hook was wired to the
non-transactional put; the view's prefix is applied to the transaction's
reads but not to its list verification; the encoding layer hashes the
transformed key where the engine hashed the raw one. Each layer's own test
is a gate on a proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target));
the target is the behaviour a caller sees through the whole stack, and only
a test that runs the whole stack observes it.

## Differential, not assertion-based

The suite does not enumerate expected outcomes. It runs the same sequence
on N implementations and demands the N results agree - on the return value
of every operation, on the error class of every failure, and on the final
state read back through a list of the whole keyspace. An assertion-based
suite encodes one author's belief about the correct answer and is only as
complete as that belief; a differential suite encodes the requirement that
actually matters, which is that a caller cannot tell the implementations
apart, and it is complete for free over any sequence it runs. The reference
against which the others are measured is the simplest implementation - the
in-memory one - because a divergence between a wrapper and the in-memory
store is almost always the wrapper's, and when it is the reference's the
disagreement is between many implementations and one.

The scripted sequences cover the shapes a caller writes: read-then-write
one key; write-then-read the same key inside a transaction; list-then-write
under the listed prefix; two transactions on one key where exactly one may
commit; a delete inside a transaction followed by a list; commit with an
empty buffer; every operation after commit and after rollback. The random
sequences cover what the author did not think of: a generator draws
operations from the interface's vocabulary with keys drawn from a small
alphabet so that collisions are frequent, interleaves transactional and
non-transactional operations, and runs the same sequence on every
implementation. The reproduction artifact is the sequence itself, not the
seed that produced it: the generated operations are serialized to a file
before the first one executes and the file is deleted only when the run
passes, so a failure - or a crash, which a seed-based report never
survives - leaves the exact trace on disk, and a replay entry point reads
that file in place of the generator. On divergence the suite reports the
step and the two observed values, so the failure reproduces
deterministically on one implementation without the rest.

## The wrapper enters in every position

A wrapper is conformed both as the top of the stack and in the middle: the
cache over the engine, the view over the cache over the engine, the
encoding layer over the view. The property being checked is associativity
of a kind - that adding the wrapper anywhere changes nothing a caller
observes - and a wrapper that only works as the outermost layer has a
hidden dependency on being outermost that the next composition will break.
The fault injector belongs in the matrix as well, configured to inject
nothing, because a test double that changes behaviour when idle is a proxy
for the store rather than a transparent layer on it.

## The one tolerated divergence is declared

Implementations disagree on the representation of nothing: an absent value
and an empty value, a nil slice and a zero-length one, an empty list and a
null list. Forcing agreement on this costs allocations in every engine for
no caller benefit, and a suite that fails on it is a suite that gets its
comparison loosened by hand until it fails on nothing. So the suite names
the one equivalence it permits - absent and empty compare equal - in one
place, applies it in the comparison function and nowhere else, and treats
every other divergence as a failure. The equivalence is a closed vocabulary
with one authoritative definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a second tolerated divergence added later is added there, with its reason,
or it is a bug.

## The leaked transaction is caught where it was born

A transaction that is begun and neither committed nor rolled back holds a
read snapshot for as long as its handle is reachable, and on a
copy-on-write engine that pins every page the snapshot covers. The leak is
invisible: nothing fails, the store slowly stops reclaiming space, and the
handle's owner is a stack frame that returned long ago. So the transaction
records where it came from, and registers a finalizer that fires when the
handle is collected; a finalizer that finds the transaction unfinished
logs that record and releases what the transaction held. The record is
either the stack at begin or the sets of keys the transaction read, wrote
and listed - the first says where the leak is, the second says what it was
doing, and either is enough to find it; what is not enough is a bare
counter. That is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) turned
into an instrument: the creation site named its reaper - the caller's
commit or rollback - and the finalizer reports every case where the reaper
never came. The detector runs in every environment, not only tests, because
the leak that matters is the one under a production code path a test never
exercised; its cost is one capture per begin, which is small next to the
snapshot the transaction already holds. The finalizer must not close over
the handle it is finalizing, or the handle is never collected and the
detector never fires. And the log level is rated by count: the first leak
in a process is an error, later ones are debug against a running counter,
so one leaking path found in production reports itself once instead of
flooding the log until someone silences the detector.

## Decision rules

When adding any implementation of the storage interface, add it to the
conformance matrix before adding any behaviour of its own. When a random
sequence diverges, fix the implementation or the reference, never the
comparison. When two implementations must legitimately differ, declare the
difference in the single comparison function with its reason, and nowhere
else. When a transaction handle can outlive its caller, capture its birth
and finalize it loud. And when the matrix becomes slow, shrink the key
alphabet or the sequence length, not the set of implementations - the
implementation left out is the one that diverges.

## When not to reach for this

Where there is exactly one implementation and no wrapper, the differential
suite has nothing to differ against and the ordinary scripted tests are the
whole gate. Where two backends legitimately offer different transactional
guarantees - one has transactions and one refuses them - the matrix
includes both and the refusing one's sentinel is the expected value, which
is a conformance result rather than an exemption; what the matrix must not
do is drop the refusing backend to keep the runs green.
