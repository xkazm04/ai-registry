---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: journal-entry-shape-invariance
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [a journal breaks when instances are collated into a batch, a random transform that declined to fire corrupts the inverse, choosing what a journal record may contain]
---

# Journal entry shape invariance

A journal record has the same keys on every push, whether or not the
operation fired, and every value under those keys is something a batch
collation can stack. The rule looks like a formatting nicety and is in fact
the load-bearing constraint that lets a journal survive the trip through a
rectangular batch and back. It is stated as a contract because the
operations that violate it work perfectly on a single instance and fail on
the first batch of two.

## Why the keys must not vary

Collation takes a list of instance journals and produces one batched
journal by stacking the corresponding records field by field. Stacking
requires that every instance's record for the same position in the chain
has the same fields. A random flip that records `axes` only when it fired
produces, across a batch of eight, some records with `axes` and some
without; the collation either fails loudly at that key or, worse, drops
the key from the batch for everyone and the inverse then flips nobody.

The declined operation therefore pushes the full record with a flag saying
it did not fire and with its parameter fields present and inert — a
zero-length axis list, an identity angle, the unchanged extent. "Did not
fire" is a distinct, spelled-out state, not the absence of a record and not
a record with fields missing
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
the inverse pass reads the flag and skips the undo, and the pop count stays
aligned with the chain.

## Why the values are restricted

Collation stacks numbers, arrays of equal rank, strings and booleans. It
cannot stack callables, object references, or a null standing in for "no
value" — the null collides with the numbers in the other instances' records
and the stacker has no rule for the mix. So a record may contain only
collate-compatible values, and the absent-parameter case is represented by
a typed inert value of the same shape the fired case would carry, never by
a null.

The same restriction is what makes the journal serializable. A record that
holds a closure or a reference to the operation instance pins the datum to
one process; a record of plain values crosses a pickling boundary, lands in
a cache, and is read back by a process that has never heard of the
operation that wrote it. Serializability and collatability are the same
property seen from two sides, and enforcing one gets the other free.

## The key vocabulary has one owner

The record's keys — class name, identity, fired flag, original shape,
parameters, status — are a closed vocabulary, defined once in a single
enumeration that every writer and every reader imports
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
An operation that spells `orig_shape` where the inverse reads
`original_shape` has produced a record that collates fine and inverts to
nothing, and the discrepancy is found only when an output comes back the
wrong size. The enumeration removes the spelling as a place to be wrong;
it also gives the collation and the diagnostic dump one list of fields to
iterate.

Parameters that only one operation understands live under a single
`extra` key whose value is itself a mapping. The mapping's own keys are
that operation's private vocabulary and are held to the same invariance:
same keys fired or not, collate-compatible values only. The outer
vocabulary stays closed; the inner one is the operation's to define and
the operation's to keep stable.

## Decision rules

When an operation has a parameter that exists only in the fired case,
choose an inert value of the same type and shape for the declined case and
record it. When no inert value of the right shape exists — the fired case
records a variable-length list — record a fixed-shape encoding instead (a
mask over all axes rather than a list of chosen axes), because the
variable length is itself a collation failure waiting for a batch in which
two instances chose different counts.

When a value is genuinely per-instance and rectangular — an original shape
that differs per instance — it collates to a stacked array and decollates
back correctly; that is the case the design is built for. When a value
cannot be made rectangular at all, it does not belong in the record; find
a fixed-shape parameterization or accept that the operation is not
invertible under batching and say so.

When a chain is run under a mode that changes what the record means —
deferred execution that records intent rather than effect — the record
keeps the same keys and gains a status field, so a reader can tell the
two modes apart without a schema change.

## The test that enforces it

Every reversible operation is exercised by one test in two configurations:
fired and declined, forced by seeding or by a probability of one and zero.
The test asserts the two records have identical key sets, that every value
collates when the two records are stacked, and that a round trip through
collate and decollate returns records equal to the originals. An operation
with a `sometimes` in its journal that has not passed this test is one
batch away from a silent inverse failure.

## When not to use it

A pipeline that never batches and never serializes — a single-instance
interactive tool — can tolerate ragged records and nulls, and the cost of
inert placeholders is real work for the author. The rule is that
invariance is mandatory the moment a journal will meet a collation or a
cache, and the practical reading is that it is mandatory always, because
the single-instance tool becomes a batched service without anyone
revisiting the records.
