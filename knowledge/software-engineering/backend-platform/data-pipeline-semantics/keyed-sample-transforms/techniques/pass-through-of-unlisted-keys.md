---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: pass-through-of-unlisted-keys
status: forged
laws: []
shared_with: []
use_when: [a field present at the head of a chain is missing at its tail, writing a keyed transform's output construction, a transform that emits a new dictionary rather than editing the one it received]
---

# Pass-through of unlisted keys

A keyed transform is told which keys it acts on. Every other key in the
sample it receives is returned in its output, unchanged and under the same
name. **A transform that drops a key it did not own breaks every transform
after it**, and the break surfaces at the stage that needed the key, which
is never the stage that lost it.

## The obligation, stated as copy semantics

The simplest correct implementation is to take the input dictionary, make a
shallow copy, overwrite the named keys with their transformed values, and
return the copy. The shallow copy is deliberate: the unlisted values are
the same objects in and out, which costs nothing and preserves identity for
anything downstream that compares by reference. The copy — rather than
editing in place — is also deliberate: the caller may still hold the input
dictionary and must not find it mutated behind its back.

The wrong implementation constructs a fresh dictionary containing only the
keys it produced. It is wrong in exactly the way that a function returning
only the fields it computed would be wrong for a record type, and it is
written for the same reason: the author was thinking about the keys they
were transforming and not about the keys they were carrying.

Where the transform *must* build a new dictionary — because it produces
several outputs from one input — the obligation transfers to every output:
each one carries every unlisted key from the input. Whether those carried
values are shared or copied among the outputs is decided by whether a later
transform may mutate them in place; the fan-out technique states the
answer, and the answer is that non-key entries are copied deeply so that the
outputs do not alias one another's metadata.

## Why the break is expensive

A chain of twelve transforms is assembled by a reader who checks the keys
each one names. Nobody checks the keys each one *returns*, because the
obligation is assumed. When one transform silently drops the identifier, the
chain runs — every later transform names only the keys it needs, none of
them the identifier — and the dataset returns samples with no identifier.
The failure appears in a collation step, or a logging step, or a writer that
needs to name its output file, all of which are far from the transform and
none of which can say which transform was at fault. The debugging procedure
is to bisect the chain by hand, one transform at a time, which for a library
with hundreds of transforms is the cost this technique exists to avoid.

The subtler break is a *default substituted for a dropped key*: a later
transform that treats an absent metadata field as "use the identity affine"
or "assume unit spacing" now runs on wrong values without raising. That is a
transform doing the wrong thing and reporting success, and no test on the
later transform can catch it, because from its point of view the field was
legitimately absent.

## The test that enforces it

For every keyed transform, construct a sample with the keys it names plus an
arbitrary extra key holding a sentinel object, apply the transform, and
assert the extra key is present in the output with the same object. Run it
once over the whole library as a parametrised test rather than once per
transform by hand, so that a new transform is covered the day it is added.
The same harness can assert the input dictionary was not mutated, which
catches the in-place editing variant of the failure.

## Decision rules

When writing the output of a keyed transform, start from a copy of the input
and overwrite, never from an empty dictionary. When a transform produces new
keys — a derived mask, a computed statistic — they are *added* to the copy,
and the input keys remain. When a transform is *meant* to remove a key, it
is a keyed deletion transform named for that purpose, and the key it removes
is one it was explicitly given; a removal that is a side effect of another
operation is a defect.

When a transform needs to read unlisted keys — metadata that parameterises
the operation, such as a spacing or an orientation — it reads them by name
from the input and still returns them unchanged; reading is not owning.

## When not to use it

A pipeline whose stages are typed records with fixed fields, where the
compiler already enforces that every field is carried, does not need a
runtime pass-through rule — the type is the rule. The technique is for
dictionaries, where the set of keys is open and nothing but discipline
carries the ones a stage did not name.
