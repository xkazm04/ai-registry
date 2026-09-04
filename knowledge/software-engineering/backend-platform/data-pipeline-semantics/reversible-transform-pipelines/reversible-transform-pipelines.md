---
layer: golden-path
type: golden-path
subject: reversible-transform-pipelines
status: forged
use_when: [mapping a model output back into the frame its input came from, designing preprocessing that must be undone on new data, a pipeline inverse silently produces the wrong geometry, batching or worker processes break an inverse pass]
techniques:
  - operation-journal-on-the-payload
  - journal-entry-shape-invariance
  - identity-check-with-graceful-fallback
  - refuse-with-recorded-reasons
  - deliberate-lossy-inverse
  - decollate-before-invert
---

# Reversible transform pipelines

A preprocessing chain takes a datum from the frame it was captured in to the
frame a model consumes: resample to a working resolution, reorient to a
canonical axis order, crop around a region, pad to a working size, flip or
rotate at random for augmentation. The model then produces an output in the
working frame — a segmentation, a heatmap, a set of coordinates — and that
output is worthless until it is carried **back** into the original frame,
where the consumer's coordinates, spacings and file conventions live. This
subject owns the design of a transform chain so that it can be run backwards
on a datum it did not produce: a new output, in the working frame, that must
retrace the exact sequence of geometric decisions the input went through.

The naive reading is that inversion is a second pipeline: write the inverse
of each step, compose them in reverse order, run. It fails on the first
random augmentation, because the inverse of "rotate by a random angle" is
not a function of the pipeline — it is a function of the angle that was
drawn for *this* datum, on *this* pass, and the pipeline object has already
forgotten it. It fails again on the first crop, because the inverse of
"crop to the foreground" needs the original extent that the crop discarded.
And it fails a third time in production, where the pipeline instance that
processed the input may live in a worker process that no longer exists by
the time the output arrives. Inversion cannot be a property of the pipeline.
It has to be a property of the datum.

## The core stance: the datum carries its own journal

Every operation that changes geometry writes a record of what it did onto
the datum itself, as it leaves: which operation, which instance, whether it
actually fired (random transforms sometimes decline), and the parameters
needed to undo it — the drawn angle, the crop origin and original extent, the
axis permutation, the original spacing. The datum arrives at the model with
an ordered journal of everything that happened to it. When the output is
ready, it inherits that journal, and the inverse pass pops entries from the
top, handing each one to the operation that pushed it, which undoes exactly
what it did with exactly the parameters it recorded
([operation-journal-on-the-payload](./techniques/operation-journal-on-the-payload.md)).

This makes inversion a data property with three consequences that the
pipeline-replay design cannot deliver. The inverse is exact per instance,
because the parameters are per instance. The inverse works across a process
boundary, because the journal is plain serializable data and travels with the
datum through pickling, collation and a cache. And the inverse is
mechanical: a test-time augmentation loop, an ensemble that runs the same
input through several augmentations, a writer that needs the original
spacing — each just pops the journal. Nobody writes an inverse pipeline by
hand, and the forward code cannot drift from an inverse it does not have.

The journal is not free, and the cost lands on the author of every
operation. An operation is reversible only if it obeys a contract with four
clauses: it pushes a record on every forward call; the record has the same
keys whether or not the operation fired; the record's values are things a
batch can hold — numbers, small arrays, strings, never callables or object
references; and its inverse pops the record it pushed rather than inspecting
whatever is on top. The second and third clauses are the ones authors skip,
and they are the ones that break silently, one batch later
([journal-entry-shape-invariance](./techniques/journal-entry-shape-invariance.md)).

## Batches are a lie the inverse must not believe

A training or inference loop collates instances into a rectangular batch,
and the batch is where the journal's design is tested. Each instance had its
own journal — its own crop origin, its own drawn angle, its own original
extent. Collation stacks the instance journals into one batched journal in
which every field is a stacked array, and every field must stack, which is
why the shape-invariance clause exists. The model consumes the batch and
produces a batched output.

The inverse never runs on the batch. Forward operations were parameterized
per instance and the original shapes differ per instance, so a batched
inverse has no single answer for "what shape do I restore to". The output is
split back into instances first, each instance re-attached to its own
journal, and the inverse runs per instance
([decollate-before-invert](./techniques/decollate-before-invert.md)). A
library that offers batch inversion is doing exactly this behind a facade —
decollating, inverting, and handing back a list — and the honest facade says
so, because the caller who assumed a batched result gets a list of unequal
shapes.

## Whose journal entry is this

The inverse pass hands an entry to an operation and asks it to undo what it
did. The operation must first establish that the entry is *its own*: that the
top of the journal was pushed by this operation and not by a sibling whose
inverse would be wrong. The strict check is instance identity, and it is the
right default. It is also the check that fails when the operation instance
that pushed the entry lived in a worker process that was spawned rather than
forked, or when the datum came out of a cache written months ago by
instances that no longer exist anywhere. Identity checking therefore
degrades in named steps — instance identity, then class identity, then an
explicit skip sentinel that a cache writer stamps on entries it knows will
never be matched — and each step is a deliberate weakening with a stated
reason, never a silent fallback
([identity-check-with-graceful-fallback](./techniques/identity-check-with-graceful-fallback.md)).

## Non-invertibility is recorded when it happens, refused when it matters

Some things make a datum non-invertible, and they happen in the middle of
the forward pass where nobody is listening. An operation applied on top of
operations that were deferred and not yet materialized has computed its
parameters against geometry that does not exist yet; a random transform
whose parameters were resampled after the record was written; a mutation
that bypassed the journal. The forward pass cannot refuse — it is producing a
training input and inversion may never be asked for. Raising at that moment
would break the ninety-nine runs that never invert to protect the one that
does.

The rule is to record the reason onto the datum at the moment the condition
is detected, as a status entry on the offending journal record, and to let
the forward pass continue. The inverse pass scans the journal before it
starts, collects every recorded reason, and refuses with the whole list. A
refusal that names "the third operation was applied over two pending
operations" is actionable; an inverse that quietly produces a plausible
array in the wrong frame is the failure this subject exists to prevent
([refuse-with-recorded-reasons](./techniques/refuse-with-recorded-reasons.md)).
The same discipline covers branching: a chain that chose one of several
sub-chains at random, or applied its members in random order, journals the
choice and inverts only the branch or order it recorded.

## Exactness is a spectrum, and the position is declared

An inverse resample is not the inverse of a resample. Interpolation destroys
information; the pixel that was averaged from four neighbours cannot recover
them. Exact inversion of geometry is numerically impossible for most useful
operations, and an inverse that pretends otherwise is claiming precision it
does not have. The practitioner's position is that **approximate inversion is
useful and exact inversion is rarely available**, and the interesting design
question is which approximations are chosen on purpose.

The most common deliberate substitution is interpolation mode. A model
output that is categorical — a label map, a class per voxel — must not be
resampled with the smooth interpolation the input used, because averaging
class identifiers produces classes that do not exist. The inverse pass
substitutes nearest-neighbour for that output, records that it did, and says
so at the call site as a named option rather than a hidden default
([deliberate-lossy-inverse](./techniques/deliberate-lossy-inverse.md)). The
same goes for every other inverse that cannot be exact: a crop restored by
zero-padding declares that the discarded region is zero, not recovered; a
resample declares its interpolation. What the inverse cannot do, it states.

## Where this subject ends

Three neighbours look like this subject from a distance, and the
discriminator in each case is what the reversible thing *is*.

The journal has to live somewhere, and where it lives — inside the value
that flows, as one of several provenance and geometry fields the value
carries beside its array, rather than in a side table keyed by name — is the
self-describing-data-envelopes subject. That subject owns the envelope: how
it subclasses or wraps the array primitive, how its fields survive stacking
and copying, how tracking is switched off globally. This subject owns what
one of those fields is *for*: the journal's entry shape, the push and pop
contract, the identity match, the refusal and the lossy inverse. When the
question is "how does metadata stay attached to the array through a device
move", read the envelope subject; when the question is "why did the inverse
restore the wrong shape", read this one.

An undo stack for edits (the undo-history subject in the input-and-editing
category) is also a journal that is popped in reverse, and the resemblance
ends there. Undo reverses the *same* state the user just changed, at the
user's request, in one session, and its unit is the user's gesture; a
reversible pipeline reverses a *different* value — an output the pipeline
never saw — into the frame of an input, unattended, often in another
process, and its unit is the geometric operation. The discriminator is the
thing being reversed: if it is the datum that was transformed, it is undo;
if it is a new datum that must retrace an old datum's transformations, it is
this subject.

A user-authored graph of dependent steps with human gates (the pipeline-dag
subject in the work-execution category) executes a topology forward and owns
node status, branching and durable pauses. Nothing in it runs backwards; a
failed node is retried or skipped, never inverted. The discriminator is
whether the steps describe a *coordinate change on data* that a later
consumer must undo, or *work* whose effects stand once done. A resample is
the first; a deployment is the second. A pipeline-dag may contain a
reversible transform chain as the body of one node, and that node's inverse
is this subject's concern while the node's status is the graph's.

## The techniques

- [operation-journal-on-the-payload](./techniques/operation-journal-on-the-payload.md) —
  the record every geometry-changing operation pushes, what it must contain,
  and why it lives on the datum and not in the pipeline.
- [journal-entry-shape-invariance](./techniques/journal-entry-shape-invariance.md) —
  the same keys whether or not the operation fired, and only values a batch
  can hold, so journals survive collation.
- [identity-check-with-graceful-fallback](./techniques/identity-check-with-graceful-fallback.md) —
  matching the popping operation to the pushing one, and the named
  degradations under process spawn and long-lived caches.
- [refuse-with-recorded-reasons](./techniques/refuse-with-recorded-reasons.md) —
  recording non-invertibility at the moment it happens and raising later
  with the accumulated list.
- [deliberate-lossy-inverse](./techniques/deliberate-lossy-inverse.md) —
  parameter substitution on the reverse pass, chosen and declared.
- [decollate-before-invert](./techniques/decollate-before-invert.md) —
  splitting a batch back into instances before any inverse runs.
