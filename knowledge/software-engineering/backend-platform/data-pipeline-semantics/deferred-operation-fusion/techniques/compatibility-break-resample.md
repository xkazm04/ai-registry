---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: compatibility-break-resample
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [two pending entries disagree on interpolation or padding or value type, a fused output differs from the eager one at edges or in label images, choosing which entry's parameters a fused resample uses]
---

# Compatibility break resample

Two entries can compose in the algebra and still not be executable as one resample.
Composition tells the accumulator *where* each output position samples from; the
resampling parameters tell it *how* — nearest or linear interpolation, what to put
outside the source extent, what value type the output holds, whether the grid is
aligned by corners or by centres. Those parameters are not composable. A nearest
resample followed by a linear one is not "a linear resample of the composed matrix",
and a zero-padded step followed by an edge-padded step does not have a single padding
rule that reproduces both. When the accumulator meets an entry whose parameters
conflict with what it already holds, it **materializes what it holds, with the
parameters it holds, and starts a new accumulation** with the new entry's parameters.

## Why not pick a winner

The tempting alternative is a policy: last entry wins, or first, or the "safer" of
the two. Each of those produces an output that some entry in the chain did not ask
for, and the damage is not uniform. On an intensity image, applying linear
interpolation where nearest was specified blurs slightly and nobody notices. On a
label image, the same substitution invents label values that do not exist — the
average of label three and label seven is label five — and the segmentation that
trained on it learns a class that was never in the data. Padding disagreements show
up at the borders, where an edge-padded step expected the border to extend and a
zero-padded step expected it to fall to background; the fused output has one or the
other, and whichever it has is wrong for half the chain. Value type disagreements
are quieter still: an integer step fused under a floating output silently converts
and, on the way back, rounds.

None of these produce an error. The fused result has the right shape, the right
frame, and plausible values. The only defence is the oracle, and the oracle will
report that deferred differs from eager beyond tolerance — at which point the fix is
this technique, not a wider tolerance.

## The procedure

The accumulator holds, alongside its composed value, the resampling parameters of the
run it is accumulating. When an entry arrives, its parameters are compared against
the held ones over the closed set of parameter keys. Equal: append, compose, continue.
Different in any key: execute the held run — the composed transformation applied
once, with the held parameters — producing a materialized datum; then reset the
accumulator to the new entry's parameters and begin composing from it. The datum
that leaves the flush has therefore been resampled once per *parameter run*, not
once per entry and not once total; a chain with three parameter changes costs four
resamples, which is the minimum that honours every entry's specification.

The comparison is over a **closed vocabulary of parameter keys with one authority**
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
An entry that carries a parameter under a key the comparison does not know about is
an entry whose incompatibility cannot be detected, and it will be fused with whatever
precedes it. When a new resampling parameter is introduced, it is added to the
vocabulary and to the comparison in the same change; the two are one artifact.

## Overrides are part of the entry, not part of the flush

A pipeline may let the author override resampling parameters for a run — force
nearest interpolation for label keys, say, whatever each operation asked for. The
override is applied at the point each entry is created, so that the entry carries
the effective parameters and the compatibility comparison sees them; it is not
applied at flush as a blanket over everything pending, because a blanket override
erases exactly the disagreements this technique exists to detect. Two rules about
overrides follow. They are validated against the closed vocabulary — an override
naming a key the accumulator does not compare is refused, because the alternative
is an override that silently does nothing. And when the pipeline is running eagerly,
an override has nothing to apply to and is ignored; whether that ignoring should be
silent or loud is a design choice, and the honest choice is loud, because an author
who wrote an override believed it would take effect.

## When not to use it

Do not treat a shape change as an incompatibility. Two entries with different output
shapes compose normally; the shape is a consequence of the composed transformation
and the last entry's extent, and the accumulator's pending-shape query handles it.
Only the resampling parameters break a run.

Do not use a mid-chain resample to work around an operation that should have declared
it reads current values. If the fused output is wrong because an operation computed
its parameters from stale values, the defect is a missing declaration, and inserting
a parameter change to force a flush there hides it behind an unrelated mechanism.
