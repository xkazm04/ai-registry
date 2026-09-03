---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: data-dependent-opt-out-flag
status: forged
laws: []
shared_with: []
use_when: [an operation computes its parameters from the values it is given, a crop or mask centred on content lands in the wrong place under lazy execution, deciding whether an operation is eager or merely value-reading]
---

# Data-dependent opt-out flag

Some operations are describable in the chain's algebra and still cannot run on stale
input. A crop that centres on the foreground computes its offsets by looking at the
values; a crop around a labelled region looks at a label map; a mask derived from a
threshold looks at intensities. Each of those, once its parameters are known, is a
translation and a shape change — a matrix — and its *effect* fuses with whatever
follows. But its *parameters* come from the datum as it currently is, and "currently"
under lazy execution means "as it would be if the pending entries had applied", which
is not what the array holds. Such an operation declares that it **requires current
data**, and the flush decision drains the pending list before entering it.

## The two properties are independent

The mistake this technique exists to prevent is collapsing two properties into one.
*Is deferrable* is a statement about the operation's output: can its effect be
written as an entry. *Reads current values* is a statement about the operation's
input: do its parameters depend on the datum's contents. The four combinations are
all real. A rotation is deferrable and does not read values. An intensity
normalization reads values and is not deferrable. A content-centred crop reads
values and *is* deferrable. A plain copy is neither.

A design that offers only "lazy or eager" forces the content-centred crop to be
eager, and eager means its effect is applied immediately — an allocation, a resample
if the pending frame required one, and a fresh eager output that the next deferrable
operation then starts a new accumulation from. The correct behaviour is finer: flush
*before* the crop so it sees current values, let the crop compute its offsets from
them, and then let it append its own entry rather than execute, so that the crop and
the rotation that follows it are still one resample. The flag gives the flush
decision exactly the information it needs to do that, and nothing more.

## The procedure

An operation that reads values sets the flag at construction, as a read-only property
the pipeline author cannot unset, because it is a fact about the operation and not a
choice. It is a fact about the operation *as parameterized*, though, not always about
the class: a crop whose extent is a constant given by the author reads nothing, while
the same crop class told to take its extent from another field of the datum reads
that field, and the honest flag is computed at construction from which of the two the
author chose. A class that hard-codes the flag either way is wrong for one of its
uses — forcing a resample the constant form never needed, or letting the
data-driven form see stale values. The flush decision reads the flag and drains
before the operation is entered.

Where an operation exists in two forms — one that acts on a bare array and one that
acts on a keyed record and delegates to the first — the flag must be true on **both**,
or on whichever form the pipeline actually dispatches. Declaring it only on the outer
form protects chains built from outer forms and leaves the inner form, used directly
in a chain of bare-array operations, reading stale values with no declaration to
save it. The flag travels with the algorithm, and the algorithm is in the inner form. Inside the operation, the body is written
as if the input were always current — it is — and the body computes its parameters,
builds its entry, and appends it exactly as a value-independent operation would.

The flag is consulted only by the flush decision. The operation itself does not check
the pending list, does not apply pending entries, and does not know whether a flush
happened; the pipeline mode might already have forced eager execution, in which case
there was nothing pending and the flag was moot. Keeping the operation ignorant of the
mechanism is what lets the same code run correctly in an eager pipeline, a lazy one,
and a mixed one.

## Deciding whether an operation needs the flag

The test is whether the operation's *parameters* — offsets, extents, a centre, a
mask — are computed from the datum's values, as opposed to from its metadata. A crop
whose offsets are given by the author does not read values; a crop whose offsets are
"wherever the foreground is" does. A resize to a target shape does not; a resize to
"the bounding box of the labelled region" does. An operation that reads only the
datum's shape, spacing or frame does *not* need the flag, because those are peekable
from the accumulator without materializing, and the operation should read them from
there rather than from the array.

That last point is the one that goes wrong in practice. An operation that reads the
array's stored shape to compute a centred crop is reading the shape *before* the
pending entries, and its centre is in the wrong frame — but it did not read values,
so the flag would not have saved it. The remedy is to read the pending shape from
the accumulator, not to set the flag; setting the flag on an operation that does not
need it costs a resample on every use and hides the actual defect.

## When not to use it

Do not set the flag on an operation because its author is unsure whether it reads
values. The flag is a declaration that has a cost — every use forces a resample of
everything pending — and an operation that sets it defensively has made itself a
barrier without meaning to. Resolve the uncertainty by reading the operation's body:
if it indexes into the array's values to choose its parameters, it reads values; if
it only indexes to *apply* its effect, it does not, and that application is what
the entry defers.

Do not use the flag as a positional flush. An author who wants materialization at a
particular point in the chain, for reasons unrelated to any one operation, wants the
explicit barrier ([explicit-barrier-operation](./explicit-barrier-operation.md)).
The flag is a property of an operation's algorithm and travels with it everywhere it
is used; the barrier is a property of one pipeline's shape.
