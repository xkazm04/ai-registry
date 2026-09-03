---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: first-input-wins-propagation
status: forged
laws: []
shared_with: []
use_when: [deciding what metadata the result of a binary operation on two envelopes carries, an operation between an envelope and a bare primitive, a propagation rule that raises on frame mismatch]
---

# First-input-wins propagation

Once an envelope is the engine's own type, every operation the engine performs
returns something that must be given slots, and the operations with more than
one enveloped operand force a question the unary ones do not: *whose* slots?
The sum of two images, the concatenation of a label with its mask, a where-
select between a datum and a constant — each has two frames, two metadata
maps, two journals on the way in and room for one set on the way out. The rule
is that **the result inherits from the first enveloped operand**, in the
operation's argument order, and it is the rule because the alternatives are
not rules at all.

## Why merge has no semantics

The obvious refinement is to merge: union the metadata maps, and for the frame
and journal pick the operand that has one. It fails on the first conflict.
Two operands that both carry a frame and disagree have no merged frame — the
average of two affines is not a coordinate system, and neither is "whichever
was set most recently". Two journals cannot be interleaved without an ordering
that the operation does not have, and a journal produced by interleaving would
be inverted by popping entries that were never applied to this value in this
order. A merged metadata map that unions keys and takes the second operand's
value on collision has a defined result and an undefinable meaning: the
consumer reading a provenance field cannot know which operand it describes.
Merge produces a value with confident slots and no truthful claim behind them,
which is the exact failure the envelope was built to prevent.

## Why reject has no semantics either

The strict alternative is to raise when operands disagree. It is honest, and
it makes the propagation hook a correctness gate that fires inside engine
arithmetic — in a model's forward pass, in a loss, in a metric — where no
caller expects a metadata exception and where the operands very often
*legitimately* disagree. A model output added to a resampled label carries a
different journal from the label by construction; a mask multiplied into an
image has the image's frame and no frame of its own; a constant tensor has
nothing. Reject turns every one of those into a crash, and the first response
of every consumer is to switch tracking off, which loses everything. A
propagation rule must always have an answer, and "first input wins" always
does.

## The rule, precisely

The hook walks the operation's arguments in order — positional first, then any
keyword arguments, then into nested lists and tuples one level deep — and takes
the slots of the **first argument that is an envelope**. Bare primitives are
skipped, not treated as empty envelopes; an operation between a primitive and
an envelope inherits from the envelope regardless of which side it sits on. If
no argument is an envelope, the result is whatever the engine returned, bare.
If the result is not a primitive — a scalar, a boolean, a shape — it is returned
untouched.

The batch flag is the one exception to first-wins, and it is an exception with
a reason: the result is a batch if **any** enveloped operand was. An operation
between a batch and an instance — a per-sample mask broadcast across a stacked
batch, a batch added to a constant — produces a batch-shaped result regardless
of which side the batch sat on, and a flag inherited from an instance in first
position would mark a batch as an instance, sending it down the deep-copy path
and, worse, letting a later split treat it as a single datum. So the flag is an
OR over the operands, computed before the slots are copied; the copy is then
performed according to the copy policy, which reads that flag — deep for an
instance, shallow for a batch — so that the result does not share a journal
list with its first operand.

Argument order is therefore load-bearing, and the envelope's documentation says
so in one sentence a consumer can act on: *put the operand whose metadata you
want the result to carry first.* A consumer who needs a different inheritance
reorders the operands or, when the operation is not commutative, constructs the
result explicitly and assigns the slots. Neither is hidden behind a flag.

## What the rule refuses to do

It does not validate. Two frames that disagree are not compared; the first is
taken. This is deliberate and the reasoning is above — but it means the
envelope offers no protection against the consumer who adds two images in
different coordinate systems. That protection belongs to the transform that
*should have* resampled one to the other, which has both frames in hand and a
place to raise that is not inside engine arithmetic. A propagation rule is a
bookkeeping rule, and a bookkeeping rule that raises is a gate in disguise.

It does not append to the journal. An engine operation is not a transform; it
records nothing, because nothing about it is invertible in the pipeline's
sense. A consumer who wraps an engine operation as a transform pushes the
journal entry from the transform, where the parameters needed to reason about
it are known.

It does not special-case any operation. A design that inherits from the first
operand for addition but from the second for some other operator has two rules,
and two rules are a lookup table nobody will keep in their head. The single
rule is what makes the propagation predictable enough that consumers stop
thinking about it, which is the point.

## When not to use it

A pipeline in which envelopes never meet in a binary operation — one datum per
stage, no arithmetic between samples — does not need the rule, though the hook
still needs an answer for the unary case and "the only enveloped operand" is
that answer. A pipeline whose operands are *known* to share a frame by
construction — every value resampled to a canonical space at load — could
validate cheaply, and may choose to, but should do so in a transform at the
pipeline's boundary and not in the propagation hook, for the reasons above.
And a pipeline that needs a genuine merge of provenance from several inputs —
a fusion stage that combines modalities and must record all their sources —
has a domain operation, not a propagation question; it writes a transform that
constructs the combined metadata explicitly and pushes its own journal entry.
