---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: intersect-then-collate
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [stacking envelopes whose metadata keys differ into one batch, a collate step that fails on the first heterogeneous key, splitting a batch back into per-item envelopes with their histories]
---

# Intersect, then collate

Stacking several envelopes into a batch is the one operation in the pipeline
where heterogeneity is guaranteed. Members came from different readers, took
different random branches, and were loaded in a different order; one carries a
key the reader stamped only for one file format, another carries a per-sample
diagnostic nobody else has, and a third's journal is one entry longer because a
conditional transform fired for it alone. The batch must have one metadata
map, and it cannot be the union of its members' — a union has keys that some
members lack, and a stacked value for such a key would need a placeholder that
looks exactly like data. The rule is to **intersect** first: the batch keeps
only the keys present in every member, marks what was dropped, and stacks the
rest.

## The procedure

Collect the metadata key set of every member. Take their intersection; that
is the batch's key set. For each surviving key, stack the members' values —
by the engine's stack for primitives, by list for everything else — and store
the stacked value under the key on the batch. For each key that was dropped,
record the fact under a **sentinel** on the batch's metadata: a named entry
that lists which keys were not common, so that a downstream stage asking "why
is the orientation missing from this batch?" gets an answer rather than an
absence. Set the batch flag on the result. Stack the journals as a list of
per-member journals, never as a single interleaved list, because a journal
belongs to one datum and the batch is not one datum.

The order matters: intersect *before* stacking, not stack-and-catch. A
stack-and-catch design tries every key, fails on the first heterogeneous one,
and either raises — stranding the whole batch on one member's extra key — or
swallows the failure and drops the key silently, which is the omission the
sentinel exists to prevent.

## Why the sentinel is not optional

A batch without a sentinel has metadata with a simple story — these are the
keys — and that story is a lie by omission. A key missing from the batch is
indistinguishable from a key that no member ever had, and a downstream stage
that falls back to a default when a key is absent will apply the default to a
batch whose every member *had* the value, differently. The sentinel converts
"this key is absent" into "this key was present on some members and dropped
because not on all", and that is a fact the stage can branch on: raise, warn,
or fall back deliberately.
[Unknown is not a value](../../../../_laws.md#unknown-is-not-a-value), and an
absent key rendered as "never existed" is exactly the laundering the law
names — at exactly the boundary it names, where per-member optionality meets
the batch's single map.

## Stacking what survived

Values under a surviving key are not all stackable, and the collate step names
the key when they are not. A per-member value that is an engine primitive of
consistent shape stacks into one primitive; a value that is a primitive of
*inconsistent* shape does not, and the failure message says which key and
which member shapes, because a generic "could not stack" from inside a
collate over forty keys is an afternoon's investigation. Non-primitive values
— strings, maps, the reader's original file name — are gathered into a list
in member order. A value that is itself a nested map is collated recursively
with the same intersect-then-stack rule, so that nested metadata does not
escape the discipline.

A **derived cache** on the envelope — the spatial rank read off the frame, a
spacing computed from the affine — is not a key and does not stack. It is
recomputed for the batch by a stated rule, and the rule is written beside the
collate: the batch's rank is the minimum over its members, clamped by the
batch's own dimensionality, because a batch of mixed-rank members can only be
addressed at the rank they all share. Copying the first member's cache onto the
batch is the wrong answer in exactly the case where it matters, and leaving it
at the constructor default is a second wrong answer that looks like a value.

Where members' *payloads* differ in shape — different crop sizes, different
sequence lengths — the collate step does not pad silently. It fails with the
key and the shapes, and points the caller at an explicit padding collate that
records what it padded, because padding is a transform with an inverse and a
silent pad is a journal entry that was never written.

## The split is the inverse, and it restores history

A batch is consumed by a model and then must become per-item envelopes again,
because inversion, reporting and saving all happen per item. The split walks
the batch's stacked metadata and, for each member index, rebuilds an instance
envelope: the frame from the stacked frames at that index, each surviving key's
value at that index, the journal from the list of journals at that index, the
batch flag off. The sentinel is dropped on split — an instance has no dropped
keys — but the keys it named are gone from the instances, and that loss is
permanent: intersect-then-collate is lossy by design, and a member's private
key does not survive a round trip through a batch. A pipeline that needs it to
survive keeps the pre-collate instances alongside the batch, keyed by member
index, and reattaches after the split.

Ragged fields — a stacked list shorter than the batch because one member
lacked an entry that the intersection *did* keep at a nested level — are
walked with padding, and the padding value is a sentinel, never a default that
could be mistaken for data.

## When not to use it

A pipeline whose members are homogeneous by construction — every sample
through the same deterministic chain from the same reader, no conditional
transforms — has an intersection equal to every member's key set and the
sentinel is always empty; the procedure still runs, it just never drops. Do
not skip it on that basis, because the first conditional transform added later
will make it necessary and nothing will say so. Do skip it when the batch is
never split again and no downstream stage reads batch metadata — a pure
training loop that consumes payloads only — but in that case the kill switch
is the better tool, because it removes the cost at the mint rather than at the
collate.
