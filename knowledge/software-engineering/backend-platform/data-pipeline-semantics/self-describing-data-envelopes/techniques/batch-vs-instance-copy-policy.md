---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: batch-vs-instance-copy-policy
status: forged
laws: []
shared_with: []
use_when: [a mutation of one datum's metadata appearing in another, a batch path that deep-copies metadata on every operation, writing the copy rule for an envelope's slots]
---

# Batch-vs-instance copy policy

Every time an envelope's slots are propagated — to the result of an operation,
to a clone, to a slice — something must decide whether the new envelope
*shares* the old one's slot contents or *copies* them, and if it copies, how
deep. The naive designs pick one answer and apply it everywhere. Always-share
produces the bug in which one datum's journal append appears on its sibling,
because the two lists were the same list. Always-deep-copy is correct and then
becomes the pipeline's dominant cost the moment a batch is involved, because a
batch's metadata is the concatenation of every member's and the deep copy is
performed on every operation the batch undergoes. Neither is a policy. A policy
is a **table**: for each kind of value a slot may contain, and for each of the
two shapes an envelope may have, what the copy does.

## The two shapes

An **instance** is a single datum: one frame, one metadata map, one journal, one
queue. It is produced by a reader, transformed one stage at a time, and its
slots will be mutated by the next transform. Two instances that share a journal
list are a bug waiting for the first append.

A **batch** is a container of instances, stacked into one primitive for the
engine's benefit. Its slots are the collated slots of its members — a journal
that is a list of per-member journals, a metadata map whose values are stacked
per key. A batch is not mutated by transforms in the way an instance is: it is
consumed by a model, split back into instances, or discarded. Deep-copying its
slots on every operation is paying for an isolation that nothing will use.

The envelope carries a flag naming which shape it is, and the copy routine
consults the flag. Shallow for a batch, deep for an instance — that is the
first row of the table and the one that carries the most weight.

## The per-type rows

Within "deep for an instance" there is a further table, because a slot's
contents are not all the same kind of thing and a single deep-copy call applied
to all of them is either wasteful or wrong.

**Immutable scalars and strings** are shared by reference. There is nothing to
protect; a copy is an allocation with no observable difference.

**Lists, maps and plain arrays** are shallow-copied: a new container, the same
elements. This is the one that catches designers out, because "shallow" sounds
like "unsafe". It is safe precisely because the mutation the policy defends
against is an *append* or a *key set* on the container, and a shallow copy
isolates those; element-level mutation of metadata values is not a thing a
well-behaved transform does, and a policy that deep-copies to defend against it
has paid for a discipline failure in every honest caller.

**Engine primitives held as metadata** — a stored affine, a cached derived
array — are detached from any computation graph and cloned. They are the
values most likely to alias engine memory, most likely to be mutated in place
by an engine operation, and most likely to drag a graph into a persisted cache
if not detached.

**Everything else** is deep-copied. This is the fallback row, and the point of
the table is that it is the fallback: the common cases are handled by the
cheaper rows above, and only an unrecognised object pays the full price.

## Stating it as a table, not discovering it

The rule is written down as a table in the envelope's own documentation and
implemented as one function that every copy path calls — the constructor, the
dispatch hook, the clone, the batch-split. The failure mode this prevents is
subtle: a copy routine that evolved by accretion has *some* policy, encoded in
which branch of an if-chain a value falls into, and nobody can state it. When a
mutation leaks between two data, the investigation has to reconstruct the
policy from the code before it can decide whether the leak is a bug or an
undocumented rule. A written table makes the leak a one-line comparison.

The table also has a **stated cost**: the deep-copy row is where the time goes,
and the envelope's documentation says so, with the shape flag as the escape.
A caller who finds copying dominating a profile has two questions to ask in
order — is this a batch that is not flagged as one, and is a slot holding an
unrecognised object type that has fallen to the deep-copy row — and the table
tells them where to look.

## The shape flag must be maintained

The policy is only as good as the flag it reads. Three places set it. The
collate step sets it *on* when it builds the batch. The split step sets it
*off* on every instance it produces. The dispatch hook sets it *on* if any
enveloped operand had it on — not the first, any — so that an operation
between a batch and an instance produces a batch whichever side the batch sat
on, and an operation among instances produces an instance. A datum whose flag is wrong
in the on direction will be shallow-copied when it should have been isolated,
and the aliasing bug returns; wrong in the off direction, the batch path pays
the deep-copy cost and the profile shows it. Neither is detected by any
assertion, which is why the three setting sites are enumerated and tested.

## When not to use it

A pipeline whose envelopes are never batched — a streaming transform over one
datum at a time, with no collation — needs only the per-type rows and no shape
flag; adding the flag adds a maintenance obligation with nothing to pay it
back. A pipeline whose metadata is entirely immutable — a frozen frame, no
journal — can share everything by reference and skip the table altogether. The
table earns its place at the moment a slot becomes mutable *and* a batch
exists, and it is written at that moment, not reconstructed after the first
cross-datum leak.
