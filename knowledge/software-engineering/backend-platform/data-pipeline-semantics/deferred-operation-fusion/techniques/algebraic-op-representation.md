---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: algebraic-op-representation
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [deciding whether a new operation may be deferred, two pending entries need to be combined into one, an operation's effect cannot be written as a matrix or a field]
---

# Algebraic operation representation

An operation earns the right to be deferred by expressing its effect in an algebra
the accumulator can compose. For spatial geometry the algebra is the homogeneous
matrix and composition is the matrix product; for dense deformations it is the
displacement field and composition is field addition. Nothing else composes, and
an operation that can only say what it does by doing it is eager, permanently,
whatever its author's intuition about how "simple" it is.

## The procedure

When an operation is proposed for the lazy path, write down its effect as a value in
one of the chain's algebras before writing any code. If it is a rigid, affine or
projective change of frame — rotation, scaling, translation, flip, axis permutation,
resampling to a target spacing, a crop or pad (which are translations plus a shape
change) — it is a matrix, and it composes with any other matrix by product. If it is
a per-position displacement — an elastic warp, a random deformation grid — it is a
field over the output grid, and it composes with another field by addition. If it is
neither — an intensity change, a threshold, a lookup, a value-dependent mask, a
contrast normalization — it is not describable in either algebra and does not get a
pending entry. Declare it eager and move on.

The entry records the value in its algebra, the shape the output would have, and the
resampling parameters. Composition happens when the accumulator is asked for its
current transformation: it folds every pending entry, in order, using the algebra's
composition, and returns one value. The fold must respect the order the operations
were appended in, because matrix product is not commutative and the order is the
pipeline's meaning.

## The rule about mixing

A chain may contain matrix entries and field entries, but the accumulator **refuses
to compose across the two**. A matrix followed by a field is not a matrix, and it is
not a field; it is a field whose sample positions have been remapped by the matrix,
and computing that correctly requires resampling the field itself through the matrix
— which is an execution, not a composition. The honest response when the fold reaches
a boundary between algebras is to refuse — raise, with the two kinds named — and let
the executor treat the boundary the way it treats any other incompatibility: flush
what has accumulated, then begin a new accumulation with the other kind. A fold that
silently converts one to the other, or that applies one and ignores the other, has
produced an output that no operation in the chain described.

Do not extend the algebra to make the refusal go away. The temptation is to say that
a matrix can always be expressed as a field (sample the matrix at every grid position)
and therefore everything is a field. It can; but a field entry is the size of the
datum, a matrix entry is sixteen numbers, and a chain of eight matrix entries that
were promoted to fields costs eight full-size allocations to *avoid* one — the exact
cost laziness existed to remove. Keep the algebras separate and let the flush handle
the seam.

## What the value must be expressed against

Every matrix in the chain is expressed against the same convention — the same axis
order, the same origin, the same handedness — and that convention has one authority.
An operation that builds its matrix in a different convention composes without error
and produces a wrong result, and nothing in the fold can detect it, because a matrix
is just numbers. The convention lives in one place the whole chain reads
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and an operation that needs to reason in another convention converts on the way in
and on the way out of its own code, never in the entry it emits.

The same holds for the shape. An entry's "output shape" is the shape the datum would
have *after* this entry, given the shape it would have after the previous one. An
operation that computes its shape from the datum's stored shape rather than from the
accumulator's pending shape has computed against a frame that no longer exists, and
the crop it describes is in the wrong place.

## When not to use it

Do not attempt to make a value-dependent operation deferrable by encoding the value
dependence into the entry. A crop whose offsets depend on where the foreground is can
emit a matrix — once the offsets are known — but the offsets are known only from
current values, which is a different concern with its own technique. The matrix is
still the right representation for its *effect*; the value dependence is a property
of its *input*, and conflating the two produces an operation that is either wrongly
eager or wrongly lazy.

Do not defer an operation that changes the number of channels, reorders channels, or
otherwise touches the non-spatial axes, unless the chain's matrix convention includes
those axes explicitly. Most conventions do not, and an entry that pretends a channel
permutation is a spatial matrix will fuse cleanly with its neighbours and permute the
wrong thing.
