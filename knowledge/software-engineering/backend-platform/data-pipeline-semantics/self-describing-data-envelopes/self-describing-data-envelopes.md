---
layer: golden-path
type: golden-path
subject: self-describing-data-envelopes
status: forged
use_when: [a transform pipeline whose values are meaningless without a frame of reference, metadata kept in a parallel structure keyed by naming convention, deciding whether to wrap or subclass a third-party array type, a batch that silently loses per-item history]
techniques:
  - subclass-the-primitive-not-wrap-it
  - global-tracking-kill-switch
  - batch-vs-instance-copy-policy
  - first-input-wins-propagation
  - intersect-then-collate
  - sidecar-as-export-format
---

# Self-describing data envelopes

A value flowing through a transform pipeline is rarely just its numbers. A volume
of voxels is a sample of physical space and means nothing without the spacing,
orientation and origin that place it there; a time series means nothing without
its sample rate and its zero; a table of measurements means nothing without
units. And once the value has been through three transforms, it also has a
*history* — the operations that produced it, with the parameters needed to
reason about them — that some later stage will need, whether to undo the
resampling before a result is reported, to fuse a chain of pending operations
into one, or to decide where a cache may split the pipeline.

The **self-describing envelope** is the design in which that frame of reference
and that history ride **inside the value**, as attributes of the datum itself,
rather than beside it in a second structure that a naming convention ties to the
first. The datum carries its geometry, its provenance, its record of applied
operations and its queue of not-yet-applied ones, and every stage that touches
the datum sees all four for free — because they arrived in the same argument.

The naive alternative is so natural that almost every pipeline starts there: the
sample is a dictionary, the value sits under one key, and its metadata sits under
a sibling key derived from the first by a suffix. It works on the day it is
written. It fails on the day a transform updates the value and forgets the
sibling — and it fails *silently*, because nothing checks that the two are in
step. The frame is now a confident description of a datum that no longer exists;
downstream code computes in the wrong coordinates and produces numbers that look
entirely plausible. That failure is the reason the subject exists, and its
signature is the one to keep in mind throughout: **desynchronisation by
omission**, in a place with no arbiter.

## What the envelope carries, and why those four

Four slots, and each earns its place by answering a question a downstream stage
actually asks. The **frame** — the affine, the units, the axis order — answers
"where is this, physically?". The **metadata map** — the reader's provenance, the
source identity, whatever open-ended facts came with the value — answers "what is
this and where did it come from?". The **applied-operation journal** answers
"what has been done to this, in order, with what parameters?", and it is what a
reversible pipeline pops from. The **pending-operation queue** answers "what has
been promised but not yet executed?", and it is what a deferred-fusion stage
drains. Beside the four sits one **flag** — whether this envelope is a single
datum or a batch of them — which is not content but governs how every rule
below treats the content. A fifth content slot is a sign that one of these
four was mis-specified, and a slot that is missing is a sign that the pipeline
has not yet met the failure it will have. The frame may physically live as a
distinguished key inside the metadata map with a typed accessor over it; what
matters is that it has exactly one home and one reader.

The frame carries a stated **default** for the convention it is expressed in —
which axis is which, which direction is positive — stamped at construction when
the reader did not say, so that no stage ever has to guess the convention from
the shape of the numbers. The frame is also the **source of truth** for anything
derivable from it. The number of spatial dimensions, the voxel spacing, the
orientation labels — all are functions of the affine, and a datum that stores
them separately has two authorities and will, at some point, have two answers.
Cache such a derived value if reading it hot is expensive, but resynchronise the
cache in the frame's setter and nowhere else, so that the derivation is
[named and invokable](../../../_laws.md#derivation-names-recomputation) rather
than an accident of construction order.

## The envelope is the primitive, not a box around it

The most consequential decision is the one that looks like a typing detail. If
the pipeline's downstream is a large third-party numeric API — a tensor engine,
an array library — that cannot be intercepted, then a wrapper object that *holds*
a primitive forces every consumer to unwrap at every boundary: the model's
forward pass, the loss, the device move, the serialiser, the collate function.
Each unwrap is a place where the metadata is left behind, and a wrapper design
therefore reproduces exactly the desynchronisation it was meant to cure, one
call site at a time. The envelope must instead **be** the primitive: a subclass
whose instances pass every type check the engine performs and flow through every
engine operation unchanged, carrying their slots along. That is
[subclass-the-primitive-not-wrap-it](./techniques/subclass-the-primitive-not-wrap-it.md),
and the rule for choosing it is short: when the API surface you would have to
intercept is larger than the one you own, subclass; when you own the whole
surface, a wrapper is honest and cheaper.

Subclassing has a cost that must be paid explicitly rather than discovered: every
engine operation now produces an envelope and must decide what its slots
contain. Two rules cover the entire space. For a **binary operation** —
addition, concatenation, a where-select — the result inherits its metadata from
the **first enveloped operand**, and the alternatives of merging or refusing are
rejected because neither has semantics anyone can state:
[first-input-wins-propagation](./techniques/first-input-wins-propagation.md).
For the **copy** that inheritance implies, a single item deep-copies its slots so
that later mutation of one datum cannot reach into another, and a batch shallow-
copies because the deep copy of a batch's metadata is an allocation storm with
no consumer; the rule is a stated table, not the accident of whatever the copy
routine happened to do:
[batch-vs-instance-copy-policy](./techniques/batch-vs-instance-copy-policy.md).

## Batches are envelopes too, but different ones

A pipeline that carries envelopes must at some point stack several of them into
one batched value, and the batch is where naive designs go quiet. Members of a
batch came from different sources, through different random branches, with
different metadata keys — one has a reader's original orientation, another does
not, a third carries an extra provenance field nobody else has. The batched
envelope cannot carry all of them and cannot pretend they agree. The rule is to
**intersect** the metadata keys across all members, batch only what every member
has, and mark what was dropped with an explicit sentinel rather than a silent
omission — because a key that is simply absent from the batch is indistinguishable
from a key that was never there
([unknown is not a value](../../../_laws.md#unknown-is-not-a-value)). The batch
is also flagged as a batch, so that every later stage that would deep-copy,
invert or inspect it knows to treat it as a container rather than a datum. That
is [intersect-then-collate](./techniques/intersect-then-collate.md), and its
inverse — splitting a batch back into per-item envelopes with their own histories
restored — is what makes inversion of a model's output possible at all.

## The whole thing must switch off

Not every caller wants an envelope. A training loop that has already resampled
everything to a common frame and will never invert anything pays the metadata
cost on every operation for nothing, and a consumer debugging a numerical
discrepancy wants the bare primitive with no surprises. So the envelope has a
**process-global kill switch**: one toggle that, when off, makes every
constructor return the bare primitive, every operation produce the bare
primitive, and every journal stay empty. The default is *on*, because a guard
that must be switched on protects the examples and not the installations
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)) — and because
the consumers who need the envelope are the ones who will not know they needed
it until an inversion produces garbage. The switch is one authority, read at the
one place envelopes are minted, never a per-transform flag:
[global-tracking-kill-switch](./techniques/global-tracking-kill-switch.md).

## The old representation does not die; it becomes a format

A pipeline that migrates from beside-the-data metadata to inside-the-data
metadata still has consumers of the old shape: serialisers that wrote the
sibling key, downstream tools that read it, third-party stages written against
the convention. The migration that deletes the old shape strands all of them.
The migration that keeps it as an **explicit export format** — a conversion
stage that unpacks an envelope into the value-plus-sidecar pair, and a matching
stage that packs the pair back into an envelope — strands nobody, and it makes
the boundary between the two representations a visible, named step rather than
a compatibility layer hidden in every transform. That is
[sidecar-as-export-format](./techniques/sidecar-as-export-format.md), and its
discipline is that the conversion is *only* ever performed by those two stages:
the moment a transform starts reading the sidecar as a fallback, the pipeline
has two authorities for the frame again and the original failure is back.

## What this buys, stated as properties of the data

Three capabilities that a pipeline framework would otherwise have to build as
features become, under this design, properties that the datum has by
construction. **Inversion** is possible on a value produced in another process
by transform instances that no longer exist, because the journal travelled with
the value. **Deferred fusion** of a chain of spatial operations into one resample
is possible because the queue travelled with the value and can be drained at
whichever stage first needs real voxels. **Cache splitting** can find its own
boundary because the datum, not the framework, knows what has been applied. The
test of whether a given pipeline has genuinely adopted the design is to ask
whether these three would survive pickling the datum, moving it across a process
boundary, and handing it to a stage that was written without knowledge of the
pipeline. If any of them needs the framework present to work, the metadata is
still beside the data in some disguise.

## Where this subject's walls sit

The sibling subject on **reversible transform pipelines** owns the *use* of the
applied-operation journal: what a transform must push, what an inverse must pop,
when inversion is refused and when it is deliberately lossy, and how a batch is
split before it is inverted. This subject owns the journal's *carriage* — that it
is a slot on the datum, that it survives copying, batching, pickling and the
kill switch, and what the copy and batch rules do to it. The rule for picking is
one sentence: *if the question is what an entry contains or how it is consumed,
it belongs to the reversible-pipelines subject; if the question is how the entry
reaches the stage that consumes it, it belongs here.* A transform that pushes a
correct entry onto a journal that was left behind at a device move has a
carriage bug, not an inversion bug.

The sibling subject on **deferred operation fusion** owns the pending-operation
queue's *execution*: what an algebraic operation record contains, when the queue
is flushed, when two pending operations are compatible enough to compose and
when an intermediate resample must be inserted between them. This subject owns
only that the queue *rides on the datum* — its slot, its copy rule, its
intersection at batch time and its emptiness under the kill switch. The
discriminator is the same shape as above: draining, composing and deciding to
drain belong there; carrying belongs here.

The [hash-pinned translation pipeline](../../../client-architecture/hash-pinned-translation-pipeline/hash-pinned-translation-pipeline.md)
also makes provenance ride with content, and the resemblance is real: both
reject the platform-side record in favour of one that travels with the artifact,
and both are motivated by a silent desynchronisation between a value and a
description of it. The discriminator is the substrate and the question being
asked. There the artifact is a static unit in a shipped tree, the record is a
pin to a *source revision*, and the question is "is this derived value still
current?" — answered by recomputing a hash, offline, against a source that moved.
Here the artifact is a live in-memory value passing through an operation chain,
the record is a *frame plus a running history*, and the question is "what does
this value mean right now and how did it get here?" — answered by reading slots
that every operation kept in step. Use that subject when provenance is a
staleness check against an external source; use this one when provenance is the
running state of a value under transformation.

## The techniques

- [subclass-the-primitive-not-wrap-it](./techniques/subclass-the-primitive-not-wrap-it.md) — the envelope as the engine's own type; when a wrapper is honest instead.
- [global-tracking-kill-switch](./techniques/global-tracking-kill-switch.md) — one toggle, read at the mint, default on, degrading to the bare primitive.
- [batch-vs-instance-copy-policy](./techniques/batch-vs-instance-copy-policy.md) — deep for items, shallow for batches, per slot type, as a written table.
- [first-input-wins-propagation](./techniques/first-input-wins-propagation.md) — inheritance from the first enveloped operand; why merge and reject fail.
- [intersect-then-collate](./techniques/intersect-then-collate.md) — common keys only, sentinel the rest, flag the batch.
- [sidecar-as-export-format](./techniques/sidecar-as-export-format.md) — the superseded shape kept as two explicit conversions, never as a fallback.
