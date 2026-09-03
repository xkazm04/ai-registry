---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: operation-journal-on-the-payload
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [designing a transform that must be undoable on a different datum, an inverse pass needs parameters the pipeline has forgotten, inverting in a process that did not run the forward pass]
---

# Operation journal on the payload

Every operation that changes geometry pushes a serializable record of what
it did onto the datum it is returning. The record is the only place the
information needed to undo the operation exists, because the operation
itself will not remember: its random parameters are redrawn on the next
call, its instance may be garbage-collected before the output arrives, and
the process it ran in may be gone. The journal converts a transformed
datum from an opaque result into a derived value that names its own
recomputation path back to the source
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## What a record contains

A record is a small mapping with a closed set of keys, and the key
vocabulary is defined once and imported everywhere a record is read or
written. Four fields are load-bearing.

**The operation's class name**, as a string. This is the coarse identity
used when the fine identity cannot be checked (see the
identity-check-with-graceful-fallback technique), and it is what a human
reads when a journal is dumped for diagnosis.

**The operation's instance identity**, as a value that can be compared
later. The naive choice is the object's memory address, which is cheap and
is wrong across process spawn and across a cache; a minted identifier
assigned at construction is stronger. Either way, the field exists so the
inverse can ask "is the record on top mine".

**Whether the operation fired.** Random augmentations decline to apply
themselves with some probability, and an operation that declined still
pushes a record saying so. This is not bookkeeping for its own sake: the
inverse pass pops one record per operation in the chain, so a declined
operation that pushed nothing leaves the pop misaligned and the next
operation inverting somebody else's record. The rule is *one push per
forward call, unconditionally*.

**The parameters needed to undo**, and only those. A crop records the
original extent and the offset it cut from; a flip records the axes; a
resample records the original spacing and shape and the interpolation it
used; a rotation records the drawn angle and the centre; a reorientation
records the source axis codes. The forward parameters are recorded when the
inverse needs them to derive the backward ones; the forward *data* — a copy
of the discarded region, the pre-resample array — is never recorded, because
a journal that stores data is a snapshot stack and scales with the datum
rather than with the operation.

## Where the record lives

The journal is a field on the datum, ordered, pushed at the top and popped
from the top. It is not a field on the pipeline, not a side dictionary keyed
by the datum's name, and not a global. Each of the alternatives is a design
that some team has shipped and regretted.

A journal on the pipeline binds the inverse to the object that ran the
forward pass, which fails the moment a data-loader worker runs the forward
pass and the main process runs the inverse. A journal keyed by name beside
the datum survives a process boundary but not a rename, a copy or a
stacking operation, and every operation that touches the datum has to know
to move the side entry too — a discipline that holds until the first
operation written by somebody who did not know. A global journal is not
thread-safe under concurrent workers and cannot say which datum an entry
belongs to.

The datum itself is the only carrier that every downstream operation
already handles, copies, stacks and serializes. What the envelope is that
lets an array carry fields is the self-describing-data-envelopes concern;
this technique only requires that such a field exists and is ordered.

## The push and pop contract

The forward call pushes exactly once, as its last act before returning, with
a record describing the geometry the returned datum now has relative to the
one it received. The inverse call pops exactly once, as its first act, and
then undoes using the popped parameters and nothing else. Two corollaries
are worth stating because both are violated by reasonable-looking code.

The inverse does not consult the operation's current configuration for
parameters that were recorded. An operation whose crop size was changed
between forward and inverse must still restore the size it recorded; the
record wins over the instance. Reading the instance is how an inverse
becomes wrong when the same operation object is reused with new settings —
which is the normal case for a long-lived pipeline.

The inverse pops *its own most recent* record, not whatever is on top. A
journal can legitimately hold records from operations that trace but have
no inverse — a traced intensity operation, a diagnostic pass-through — and
a composed chain inverting only its invertible members will find those
records sitting above the one it wants. So the pop searches downward from
the top for the most recent record that matches this operation (by the
identity rules of the identity-check-with-graceful-fallback technique),
removes that one, and refuses naming the top record when nothing matches.
What the inverse does not do is read another operation's record for
parameters: an operation that needs to know about pending or prior state
reads its own record's status field, which is what the
refuse-with-recorded-reasons technique writes there.

## Composed operations journal as one

A composition — a sequence, a random choice among sub-chains, a random
ordering — is itself an operation and pushes its own record around its
members' records. The composite's record says which members ran, in what
order, so the inverse can walk them backwards. The naive composition that
merely forwards to its members and pushes nothing works until the first
random choice, whose inverse then has no way to know which branch fired.

A record's parameters must include everything the composite needs to
reconstruct the member sequence: the chosen branch index, the applied
permutation, or the range of member records this composite owns. The
composite's inverse pops its own record, uses it to select which members to
invert, and hands each member the top of the journal in turn.

## When not to use it

An operation that changes values but not geometry — intensity scaling,
normalization, a nonlinearity — need not journal unless its inverse is
wanted for the same output. Most are not: a model output has no intensity
frame to restore. Journaling them anyway costs a record per datum per
operation and adds pops the inverse must match. The rule is that an
operation journals when a consumer of the *output* will need to undo it,
and geometry is the case where that is always true.

A pipeline whose outputs are never carried back — a training loop with no
inference in the original frame — can switch tracking off globally and
save the records, provided the switch is loud and the inverse refuses when
it finds an empty journal rather than treating "nothing to undo" as
success.
