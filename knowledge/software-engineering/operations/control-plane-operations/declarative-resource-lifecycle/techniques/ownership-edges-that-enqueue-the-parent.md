---
layer: technique
type: technique
subject: declarative-resource-lifecycle
technique: ownership-edges-that-enqueue-the-parent
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [changes arrive on dependents but the desired state lives on a parent record, deciding between a declared edge on the child and a mapping function computed at change time, a dependent was deleted out from under the process responsible for it, a responsible process keeps an in-memory map of what it created]
stage: multi-service
---

# Ownership edges that enqueue the parent

A record that declares desired state usually causes several other records to
exist. Changes then arrive at the wrong altitude: something modifies or
deletes a **dependent**, while the only place that says what the dependent
was supposed to be is the **parent**. The dependent cannot repair itself,
because it does not carry the intent — it is an output, not a statement.

The contract is one sentence: **the dependent carries the identity of the
record responsible for it, as data on the dependent, and a change to the
dependent enqueues the parent's unit of work rather than its own.**

## The edge lives on the child, and that is the whole economy

Putting the edge on the child rather than in a map held by the responsible
process is what makes the index cost nothing. Reading the children yields the
whole relation; the relation survives a restart of every participant; nothing
has to be rebuilt, warmed or reconciled, and no second store can disagree
with it. The alternative — a map from parent to children, maintained in the
responsible process's memory as it creates things — has to be rebuilt after
every restart from exactly the same children, which proves it was a cache of
the edge and never the authority.

The edge is also readable by parties that were never told about it: a second
process, an operator, a cleanup sweep. That is the same property the whole
subject rests on. A relation nobody but its author can read is not a
contract.

## The enqueued unit is the parent, even when the parent is unchanged

This is the rule that reads backwards until the failure is named. A
dependent that drifted — someone edited it, something else overwrote it, it
was deleted outright — produces a change on the *dependent*, and the
instinct is to handle it there. But the handler at the dependent's level
knows only that the dependent is now some shape; it does not know what shape
the parent wants, and reconstructing that means re-deriving the parent's
whole computation from a fragment.

So the change routes upward, and the parent's pass runs *even though the
parent did not change* — precisely because it did not. An unchanged parent
plus a drifted dependent is the definition of drift, and the pass that
re-derives the subtree from the parent is the repair. This also means a
dependent that was deleted is recreated on the very next pass, which is
correct and occasionally surprising: an operator who deletes a dependent by
hand and watches it reappear has just observed the mechanism succeeding.

One change may name several parents, and that is ordinary. The mapper
returns a set; the downstream queue deduplicates by key, so a dependent
shared between two parents enqueues both, once each.

## Identity, not name

The edge stores the parent's **minted identity**, not its name. A name is
reusable: a parent removed and recreated under the same name is a *different
parent*, and the children of the first must not be adopted by the second
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Adoption by name is not a theoretical hazard — recreate-under-the-same-name
is the most common recovery gesture there is, and a system keyed on names
will quietly hand the new parent a subtree it never created and does not
match its current statement, which it will then either adopt or destroy.

Carry the name too, if the lookup needs it; carry the identity as the thing
compared. And compare the *kind* as well as the identity: an edge names a
particular sort of parent, and a dependent may carry several edges to
different sorts. A mapper that ignores the kind enqueues keys that address
nothing, which is harmless and looks exactly like a bug for as long as
someone is investigating it.

## Declared edge or computed mapping

Two shapes exist and the choice is not stylistic.

**Declare the edge** when the dependent can be stamped with the parent's
identity at the moment it is created — which is whenever the responsible
process is the one creating it. This is the default: the relation is exact,
it is stored once, and finding a parent from a child is a field read.

**Compute the mapping** when the relation is not a fact about the child's own
provenance: a parent that selects its dependents by a label expression, a
convention that binds records by a shared name fragment, a dependent created
by somebody else that the parent merely adopts. Here a function evaluates the
relation on every change, and two costs follow. It cannot be indexed, so a
hot dependent stream pays the function per event. And it is a **derivation**,
so it names its recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
when the selecting expression on a parent changes, every dependent's
membership may have changed, and the only honest repair is a sweep that
re-evaluates the mapping over the whole population. A design that computes
mappings and has no such sweep is correct only while the selectors are
immutable.

The blunt instrument — re-run every parent whenever any dependent changes —
is a legitimate escape hatch and a terrible default. Its cost is proportional
to the size of the fleet rather than to the size of the change, which is
exactly inverted; keep it for the rare structural event (a shared
configuration record changed, a version was rolled) and make it opt-in, so
that reading the code tells you which changes are cheap.

## An enforceable edge does not cross a scope

An edge is only as strong as the store's willingness to act on it. Where the
store itself uses the edge — to remove dependents when the parent goes, or to
refuse a parent's removal while dependents exist — that enforcement is
bounded by the scope the store can reason about: dependents inside the
parent's own tenancy or partition. An edge pointing out of that scope cannot
be enforced, and it degrades silently into a dangling pointer the first time
either side is removed.

The rule: a cross-scope relation is a **computed mapping with its own
cleanup story**, never a declared edge that looks enforceable and is not. Say
which one you have, at the point the relation is created, because the two are
indistinguishable in a listing.

## Read only what the edge needs

A dependent stream is the hottest stream in this design — dependents outnumber
parents, and they change more often. The mapper's only job is to produce
parent keys from two or three fields, and copying an entire record (its
labels, its annotations, its ownership ledger) to read them is the one
allocation in this subject large enough to appear in a profile. Take the
fields, or stream only metadata rather than whole objects when the transport
allows it; the mapper needs nothing else, and it is the one place where that
is provably true.

## The rejected alternative: a handler on the dependent

Give every dependent its own handler, so each repairs itself. It is local, it
has the smallest possible unit of work, and it reads as better separation of
concerns.

It fails on the premise. The dependent does not hold desired state, so the
handler must obtain it — which means reading the parent, which means it is
the parent's computation running under the dependent's name, with one
important difference: it sees one dependent instead of the set. Anything that
requires the set (a count, a rolling replacement, an ordering) is now
unimplementable, and anything that requires deleting a dependent that should
no longer exist is unreachable, because the handler that would delete it
fires on a dependent nobody creates any more. Self-repairing dependents
handle drift and cannot handle **excess**, and excess is half the job.

## Boundary

The nearest-looking neighbour is
[store-dependency-topology](../../../../client-architecture/client-state/techniques/store-dependency-topology.md),
which also declares a graph and also insists it be written down as data. It
answers a different question. That graph is over **modules**, is fixed at
build time, and exists to derive one construction order once at startup; its
failure mode is an undefined value in the first frame, and its enforcement is
a cycle check that runs before anything is served. This graph is over
**records**, changes continuously while the system runs, is read to route
work rather than to order construction, and has no initialization order at
all — cycles in it are a data problem, not a build problem.

The rule for a reader: if the graph answers *what must exist before what*,
that technique; if it answers *whose unit of work does this change belong
to*, this one.

A second neighbour worth separating:
[realtime-events](../../../../client-architecture/realtime-events/realtime-events.md)'
invalidation grammar maps a change to **which reads a consumer must drop**.
That is a routing rule too, and it ends at the consumer's cache. This one
maps a change to **whose work re-runs**, and its output is a key on a queue.
A system can and usually does need both; what it must not do is try to serve
one with the other, because an invalidation that enqueues work re-runs
everything that ever read the record, and an enqueue that only invalidates
repairs nothing.
