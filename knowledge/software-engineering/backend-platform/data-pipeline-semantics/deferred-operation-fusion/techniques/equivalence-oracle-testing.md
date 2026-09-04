---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: equivalence-oracle-testing
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [an operation is being declared deferrable, a lazy pipeline's output is suspected to differ from the eager one, deciding what tolerance a deferred-equals-eager assertion should use]
---

# Equivalence oracle testing

A deferrable operation is one that has passed the oracle, and the oracle is the
eager path. For every operation that emits a pending entry, the test runs the same
operation twice on the same input — once eagerly, once deferred and then flushed —
and asserts that the two agree. Nothing about an operation's algebra, its author's
reasoning, or its resemblance to an operation that already passed substitutes for
the run.

## The three assertions

The oracle asserts three things, in order, and each catches a different class of
defect.

**Before flushing, the pending geometry matches the eager result.** The accumulator's
pending shape and composed transformation are read — without materializing anything
— and compared against the shape and frame of the eager output. This is the cheapest
assertion and the one that fails first when an operation has computed its entry
against the wrong frame: a crop that read the stored shape rather than the pending
shape, a matrix built in the wrong convention. It fails before any values are
computed, so the failure names the entry, not the arithmetic.

**After flushing, the deferred output equals the eager output within tolerance.** The
pending list is drained, and the resulting array is compared value by value against
the eager one. The tolerance is stated, not defaulted: fusion changes the
interpolation arithmetic — one resample through a composed matrix samples different
source positions than two resamples in sequence — so bit equality is the wrong bar,
and an operation that is held to it will be declared broken when it is in fact more
accurate than the standard. The tolerance is chosen per interpolation mode; nearest
should be exact, because there is nothing to accumulate, and a nearest-mode
operation that fails an exact comparison has a real defect. It is also chosen per
assertion: the forward comparison is held tight, and the inverse comparison below is
allowed looser, because the inverse passes both outputs through a second resample
and the two paths' errors compound differently. A single tolerance for both stages
is either too loose for the forward check or fails the inverse check on arithmetic.

**Both outputs invert to the same thing and leave nothing behind.** The eager output
and the flushed deferred output are each passed through the pipeline's inverse, the
two results are compared, and both are checked for an empty pending list and an
empty trace stack. This is the assertion that catches an entry which fused correctly
but recorded itself wrongly — a trace record whose inverse does not undo what the
fused resample did — and it catches a flush that materialized the array but forgot
to clear the list.

## What the oracle must observe

The oracle runs the actual flush, over the actual accumulator, with the actual
resampling parameters the operation emitted
([gate-sees-target](../../../../_laws.md#gate-sees-target)). An oracle that checks
the entry's matrix against a hand-computed expected matrix has verified the author's
arithmetic against the author's arithmetic; it has not verified that the flush
produces the eager result. An oracle that runs the deferred path with a fixed set of
parameters rather than the operation's own has verified something the pipeline will
never execute. The eager path is the definition; the oracle's job is to execute the
deferred path exactly as the pipeline would and hold it to that definition.

The oracle also runs under every pipeline mode the operation will meet. An operation
that passes under honour-each with its flag set lazy can still fail under force-lazy
if it relied on a neighbour being eager, and an operation that passes alone can fail
in a chain if its entry is incompatible with the one before it and the mid-chain
resample was not taken. The minimum is: alone, under each mode; and in a short chain
with a value-independent operation on either side.

## Failure is a verdict, not a tolerance adjustment

When the deferred output differs from the eager one beyond tolerance, the deferred
path is the defect, and the fix is in the operation or the accumulator — never in the
tolerance. The one legitimate exception is the case where the eager path's own
accumulated interpolation error is the difference: two sequential linear resamples
blur more than one composed resample, and the deferred output is *closer to the
ground truth* than the standard it is measured against. That case is real, and it is
argued in writing, with the ground truth shown, and recorded as a per-mode tolerance
with its reason beside it. It is never absorbed into a global tolerance wide enough
to make the test pass, because a tolerance that wide also passes the label image
whose fused values were interpolated between classes.

A test that cannot run — the eager path raised, the deferred path raised, the inverse
was not available — reports that, distinctly from a test that ran and agreed
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). An
oracle that catches the exception and reports "no difference found" has converted an
untested operation into a certified one.

## When not to use it

Do not run the oracle only on the operations whose authors suspect a problem. It runs
on every operation that emits an entry, and it runs again when the accumulator, the
flush decision or the parameter vocabulary changes, because those are the components
whose defects show up in every operation at once. An operation with no oracle run is
not deferrable, and the pipeline should refuse to treat it as such — at minimum by
convention, at best by a registry the test suite enumerates.
