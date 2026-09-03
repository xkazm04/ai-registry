---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: decollate-before-invert
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [inverting model outputs that arrive as a batch, instances in a batch had different original shapes, a post-processing chain must run per instance after a batched model]
---

# Decollate before invert

An inverse never runs on a batch. The batch is a rectangular convenience for
the model — instances stacked along a leading axis so one call processes
many — and the rectangle exists only because the forward pass made every
instance the same working shape. The instances' original shapes differ, the
forward parameters that got them to the working shape differ, and so the
inverse has a different answer per instance. The output batch is split back
into instances, each re-attached to its own journal, and the inverse runs on
each, one at a time, as the forward pass did.

## What collation did that must be undone

Collation stacked the arrays and stacked the journals. A batch of eight has
one array with a leading axis of eight and one journal in which every
record's every field is an eight-long stack of the instances' values — eight
crop origins, eight original extents, eight drawn angles. The batched
journal is a valid structure, and it is what the shape-invariance contract
was written to make possible, but no single operation's inverse can consume
it: the inverse of a crop takes one origin and one extent.

Decollation is collation's inverse, applied to the output. It slices the
output array along the leading axis and slices every journal field the same
way, producing eight instances each carrying the journal it had before
collation. The fields that were sentinelled during collation because not
every instance had them are dropped or restored per instance. The result is
exactly what went into the collation, up to the array having been replaced
by the model output — and that replacement is the whole point.

## Why the batched inverse is not merely slower

The tempting shortcut is to invert the batch with vectorized operations
and split afterwards. It fails structurally, not just in performance. The
first record's inverse restores each instance to a different shape, and a
different-shape-per-instance result is no longer a batch; there is nothing
for the second record's inverse to operate on as a rectangle. The shortcut
works exactly when every instance had the same original shape and the same
forward parameters, which is the case where inversion was trivial anyway.

Random augmentation makes it worse: per-instance angles mean the batched
rotation inverse is eight different rotations, and a vectorized rotation
with a per-instance angle is a per-instance loop wearing a batch costume.
The honest design is the loop.

## The instance keeps its identity through the round trip

An instance that went into position three of the batch and came out of
position three carries the same journal, the same identifiers, the same
name. Position in the batch is not the instance's identity — it is an
artifact of the collation order, and it changes when a loader shuffles or a
batch is padded to a fixed size. The journal's identity fields and any
per-instance name travel as journal content, not as positions, so an
instance recovered from a batch can be matched to its source and to its
original file without reference to where it sat
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

A padded batch — a final batch padded to the fixed size with copies or
zeros — decollates to more instances than there were inputs, and the
padding instances carry no journal or a marked one; the inverse skips them
by that mark, never by assuming the last N are padding.

## The post-model chain is per instance

Everything after the model that reads the journal runs per instance:
activation, thresholding, the inverse, a writer that needs the original
spacing. So decollation is the first step after the model, and the
post-processing chain is written to take one instance at a time. A
convenience wrapper can offer "invert this batch" and internally decollate,
invert each, and return a list — and its return type is a list, because
the shapes differ. A wrapper that promised a stacked result would have to
re-pad, and a re-padded result has silently changed the geometry the
inverse just restored.

A library that implements batch inversion as a full round trip — decollate,
wrap the instances in a temporary dataset, run them through a loader with
no collation, invert each — has made the right choice and should not be
optimized into a batched inverse by a well-meaning contributor.

## Decision rules

When a model output arrives with a leading batch axis and the journal is
batched, decollate first, always. When a post-processing step is
vectorizable and journal-free — an activation, an argmax — it may run on the
batch before decollation, and the saving is real; the rule is that the
first step that reads the journal is the last step that may see a batch.

When a batch was assembled from instances with identical geometry and no
random augmentation — a test-time sliding window over one input — a batched
inverse is safe and the loop is a waste; write the proof beside the
shortcut, because the proof is what stops the next augmentation from being
added to that chain without noticing.

## When not to use it

A pipeline that processes one instance at a time and never collates has
nothing to decollate; the inverse runs directly. And a pipeline whose
outputs are not carried back — a training loop that computes its loss in
the working frame — collates for the model and never needs the reverse
trip. The technique applies exactly when a batched output must return to
per-instance original frames, which is every inference path and every
test-time augmentation.
