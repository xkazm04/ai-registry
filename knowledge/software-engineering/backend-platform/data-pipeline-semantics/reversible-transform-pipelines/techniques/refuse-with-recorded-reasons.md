---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: refuse-with-recorded-reasons
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [an inverse silently restores the wrong frame, deciding whether a forward pass should raise on a non-invertible condition, deferred and eager operations mixed in one chain]
---

# Refuse with recorded reasons

A datum can become non-invertible in the middle of a forward pass, in a
place where refusing would be wrong: the forward pass is producing a
training input, inversion may never be requested, and raising there breaks
every run to protect the rare one that inverts. The technique separates the
two moments. The condition is *recorded* onto the datum at the instant it is
detected, as a status on the journal record it affects; the inverse pass
*refuses* later, before it undoes anything, with every recorded reason in
hand.

## What makes a datum non-invertible

The reasons are few, and each is detectable only at the moment it occurs.

An operation applied over pending operations. In a chain that defers
geometric operations and materializes them in one pass, an eager operation
that reads the array in the middle of the deferred run computes its
parameters against geometry that has not been applied yet. Its record
describes a crop of an array that was never in that state, and the inverse
of that crop restores nothing that existed. The detector is the push itself:
when an operation pushes a record onto a journal whose pending queue is not
empty, the condition has occurred.

A record whose parameters were overwritten. An operation that re-randomizes
and pushes again on the same datum, replacing its earlier record instead of
stacking, has erased the parameters the inverse needed. Replacement is a
legitimate operation for a composite that re-pushes its summary record; it
is a corruption when an ordinary operation does it.

A journal that was truncated or never kept. Tracking switched off globally,
a datum copied without its journal, an operation that mutated the array in
place without pushing — each leaves a journal that is shorter than the
chain, and the inverse pass would pop past the end or pair records with the
wrong operations.

## Record at the moment, on the datum

When a detector fires, it appends a message to a status list on the
affected record — the last pending record for the pending-during-apply case,
the operation's own record otherwise. The message names the operation that
caused the condition and the operations it conflicted with, in words a
reader can act on: which class was applied, over which pending classes. It
does not raise, does not log at error level, does not set a global flag.
The datum continues through the chain carrying the status.

The status travels with the journal, so it survives everything the journal
survives: collation, a cache, a process boundary. This is what makes the
later refusal possible from a process that did not run the forward pass and
has no other way of knowing what happened
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A detector that logged a warning instead would have left the verdict in a
log file the inverse pass cannot read.

## Refuse before undoing anything

The inverse pass begins by walking the whole journal and collecting every
status message. If the list is non-empty it raises once, with the complete
list, before popping a single record. Two properties of this order matter.

It refuses before partial work. An inverse that pops three records and then
finds the fourth is unusable has left the datum in a state that is neither
the model frame nor the original, and the caller cannot retry. Scanning
first means the datum is untouched when the refusal lands.

It refuses with everything. A chain can accumulate more than one reason —
two eager operations each applied over pending ones — and a refusal that
reports the first and stops sends the author back once per reason. The
accumulated list is the whole diagnosis in one exception.

The refusal is an exception, never an empty result. An inverse that returns
the input unchanged when it cannot invert has produced a datum in the
working frame labelled as if it were in the original frame, which is the
exact failure the subject exists to prevent
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The composite's choices are recorded too

A composite that chose one sub-chain at random, or applied its members in a
random order, records the choice in its own journal entry and inverts only
what the entry says ran. A composite that inverted every branch, or inverted
in its configured order rather than the applied one, would be undoing
operations that never fired. The recorded choice is the reason the inverse
does what it does, and a composite whose entry is missing the choice refuses
for that reason rather than guessing.

## Warn and force, or refuse: pick by whether inversion is still possible

Not every problematic condition is fatal. A chain asked to invert while it
is configured to defer operations can simply invert eagerly — the deferral
was an optimization and the inverse does not need it. The right response is
a warning and a forced eager pass, because inversion remains possible and
correct. Contrast the pending-during-apply case, where inversion is not
possible at all and only a refusal is honest.

Rule: when the condition can be corrected by the inverse pass itself, warn
and correct. When the condition was fixed into the data by the forward
pass, record it there and refuse here.

## When not to use it

A pipeline that never inverts has no inverse pass to refuse in, and
recording statuses is dead weight — though it is cheap, and the day the
pipeline gains an inverse the statuses are already there. The technique is
not a substitute for validating the chain's configuration up front where
that is possible: an author who composes an eager crop after a deferred
resample can be told at composition time, and that is a better moment than
either the forward or the inverse pass. Record-then-refuse covers the
conditions that only the data can reveal.
