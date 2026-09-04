---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: identity-check-with-graceful-fallback
status: forged
laws: [identity-survives-reuse, absent-guard-is-loud]
shared_with: []
use_when: [an inverse fails only under spawned worker processes, cached data must be inverted by transforms that did not produce it, an inverse pops a record that belongs to another operation]
---

# Identity check with graceful fallback

Before an operation undoes the record on top of the journal, it establishes
that the record is its own. The check protects against the failure that is
hardest to diagnose after the fact: an inverse that runs the right code on
the wrong record, restores a plausible shape, and returns without error. The
strict check is by instance identity; it has two named weaker forms, and the
choice between them is made by what the runtime can actually promise, not
by what would be convenient.

## The strict check and why it is the default

The forward pass records the identity of the operation instance that
pushed each record. The inverse compares the top record's identity with its
own and refuses on mismatch, naming both. In a single process with
long-lived operation objects this is exact: two instances of the same
class configured differently are told apart, so a chain with two crops
cannot invert the wrong one, and a record that leaked from a different
pipeline is caught before it is acted on.

The identity value is minted once, at construction, and carried with the
instance for its lifetime
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
A memory address is the cheap implementation and it satisfies the strict
check within one process; a generated identifier stored on the instance is
the stronger one, because it survives the instance being copied into a
worker and it can be written to a cache and matched later. Prefer the
minted identifier when the pipeline will ever run under multiprocessing;
accept the address only when it will not.

## First degradation: class identity under process spawn

A data loader that spawns worker processes — as opposed to forking them —
reconstructs every operation instance from its pickled form in each worker.
The forward pass runs in the worker against the worker's copy; the inverse
runs in the main process against the original. Their addresses differ, and
if the identity field is an address, the strict check refuses every inverse
under spawn while passing every inverse under fork. The failure is
platform-shaped: it appears on the operating system whose default start
method is spawn and nowhere else.

The degradation is to compare class names when instance identities do not
match, with a warning that names both identities and says the check has
been weakened. Class matching cannot tell two instances of the same class
apart, so a chain with two crops relies on pop order alone to pair records
with operations; that is usually right, because the chain is inverted in
strict reverse, and it is the price of running at all under spawn. The
warning is the honest part: a silent fallback would hide the fact that the
chain is one reorder away from inverting the wrong crop.

Rule: when instance identity fails and the runtime is known to have
spawned, degrade to class identity and warn once per process. When
instance identity fails and the runtime did *not* spawn, refuse — the
mismatch is real and the record is not this operation's.

## Second degradation: the explicit skip sentinel

A cache that persists transformed data to disk outlives every operation
instance that produced it. When the cached datum is read back a week later
and its output must be inverted, no instance in the reading process pushed
those records, and neither address nor minted identifier will match. Class
matching would work but would be lying about what it checked.

The right move belongs to the cache writer, which knows at write time that
the records it is persisting will never be matched by identity. It stamps
each record's identity field with a reserved sentinel meaning "identity
deliberately not tracked", and the inverse treats the sentinel as an
instruction to skip the identity check and proceed on class name and pop
order. The sentinel is explicit so that a reader can distinguish "this
record was written by a cache and identity is knowingly absent" from "this
record's identity does not match and something is wrong" — the two cases
look the same to an address comparison and must not be handled the same
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

Rule: the writer that knows identity will not survive is the one that
blanks it, at write time, with the reserved value. The reader never infers
"probably a cache" from a mismatch.

## Decision procedure on inverse

The inverse pass, on popping a record, runs the checks in order and stops
at the first that decides.

1. If the record's identity is the skip sentinel, proceed on class name and
   pop order; do not warn, because the writer already decided.
2. If the record's identity equals this instance's identity, proceed.
3. If the runtime start method is spawn, compare class names; on match,
   warn once and proceed; on mismatch, refuse naming both classes.
4. Otherwise refuse, naming the record's identity and class and this
   instance's identity and class.

Refusal is an exception with the journal position included, because "the
fourth record from the top was pushed by a crop and popped by a flip" is a
one-line diagnosis and "identity mismatch" is an afternoon.

## When not to use it

A chain whose every operation is idempotent to invert — pure flips on
fixed axes, transposes — can tolerate class matching everywhere, because
inverting the wrong instance of the same class produces the same result.
That is a property to be proven per chain, not assumed, and the strict
check costs one comparison; keep it on by default and switch it off only
where the proof has been written down.
