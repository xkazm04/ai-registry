---
layer: technique
type: technique
subject: embedded-tracing-collector
technique: ephemeron-fixpoint-marking
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [adding weak references or weak maps to a traced heap, a weak-keyed cache leaks because its values refer back to their keys, deciding how the mark pass treats a weak edge]
---

# Ephemeron fixpoint marking

A weak reference is the primitive everyone reaches for and the wrong one for
the case that matters. The case is the weak-keyed map: a table whose entries
must not keep their keys alive, so that an object can be annotated without
being retained. With weak keys and strong values, a value that refers to its
own key - which is the common shape, since the annotation usually mentions the
thing it annotates - is a cycle the weak pointer cannot break: the map holds
the value strongly, the value holds the key strongly, the key is reachable,
the entry never clears, and the "weak" map is a leak with a reassuring name.

The primitive that works is the **ephemeron**: a key-value pair whose value is
reachable if and only if the ephemeron itself and its key are both reachable
by some path that does not go through this ephemeron's value. The
key-reachability condition is what breaks the cycle - a value cannot keep its
own key alive through the ephemeron, because the value is not traced until the
key is already known to be alive by other means.

## Why one mark pass is not enough

The condition is circular in a way a single traversal cannot resolve. Whether
to trace an ephemeron's value depends on whether its key is marked; the key
may be reached only late in the traversal, or only through another ephemeron's
value, which is traced only if *that* ephemeron's key is marked. So the mark
pass does not trace ephemerons at all. When the traversal reaches one, it
marks the ephemeron cell itself, records it in a **pending list**, and moves
on.

After the main mark has drained its queue, the pending list is iterated.
Each ephemeron whose key is now marked traces its value - through the same
work queue, so the value's whole subgraph is marked - and is removed from the
list. Tracing a value may mark a cell that is another pending ephemeron's key,
so **the list is iterated again**, and again, until a full pass removes
nothing. That pass is the fixpoint: every ephemeron still pending has a key
that no path in the heap reaches, and its value is deliberately left unmarked.

The remark after finalization repeats the whole procedure, because
resurrection may have made a dead key live.

The naive cost is quadratic in the number of pending ephemerons, since each
pass rescans the list; in practice the list shrinks fast and most ephemerons
resolve on the first pass, because most keys are marked by the main traversal
before the list is touched. Keep the naive loop until a measurement says
otherwise; the refinement (indexing pending ephemerons by key so that marking
a key wakes exactly the ephemerons waiting on it) is a real improvement and a
real complexity, and the wrong first move.

## Clearing, and the ephemeron's own lifetime

An ephemeron whose key died must be cleared - its key and value slots emptied
- so that a later read through it sees "gone" rather than a dangling handle,
and so that the sweep can free the key. The ephemerons still pending after
the fixpoint are exactly the collector's list of unreachable weak cells, and
they are handled in the **finalization pass**, beside the unreachable strong
cells: the value's finalizer runs if the key is still live, and then the
slots are emptied. That is the one place in the cycle where an ephemeron's
slots are written by the collector rather than by the program, and it is
before the sweep because emptying the slots dereferences the value, which the
sweep guard forbids. An ephemeron marked during the traversal but already
empty counts as successfully traced - there is nothing behind it to reach.

The ephemeron is itself a heap cell, with its own header, its own counts and
its own root status, and this is the detail the naive implementation gets
wrong by making it a special structure outside the heap. If it is a cell, it
is found by the same counting as everything else, and its header is marked
either because it is rooted or because the traversal reached it through a
strong cell - both must mark it, and a collector that marks only the rooted
ones drops every ephemeron held by a live object. It is freed when nothing
holds it, and the collector does not need to *remember* ephemerons - it needs
only the pending list, rebuilt from scratch on every mark from the ephemerons
the traversal actually reached. An ephemeron nobody holds is never marked,
never pended, and swept like any cell. Its reaper is the ordinary sweep, and
nothing else has to remember it exists
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

Keeping ephemerons on their own allocation list, separate from the strong
cells, is a legitimate refinement rather than a violation of the rule above:
the list is the heap, not a registry, and it exists so the mark can run its
strong traversal to completion before it touches a single weak cell.

## Weak references and weak maps are the same primitive

Two derived structures, and the derivation is the point.

A **weak reference** is an ephemeron whose value is the unit value. The
condition degenerates to "the key is reachable by some other path", and the
reference is cleared when it is not. There is no second primitive to
implement, no second pending list, no second clearing pass.

A **weak map** is a table of ephemerons, one per entry, with the table itself a
strong cell that holds them. The table is traced like any cell; its ephemerons
are pended like any ephemeron; **after the sweep**, the table is asked to drop
the entries whose ephemerons were cleared - after, because deciding which
entries are dead dereferences the entries, and during the sweep that is
forbidden. The collector reaches the tables through a list it does keep
across cycles, and the rule that keeps that list from becoming a registry
that leaks is that **the list holds each map through a weak handle**: a map
nobody else holds is not kept alive by the collector's own bookkeeping, its
entry in the list reads as dead at the next cycle and is dropped then, and
the list is therefore self-cleaning without anyone remembering to remove
from it. A collector that lists its weak maps through strong handles has
built a table that can never be collected.

The one thing the map adds is *iteration order*, and the decision is to
refuse it: a weak map is not enumerable, because enumeration would expose
which keys the collector has and has not yet found dead, which is a fact
about the collector's timing that no program can rely on. A map that needs to
be enumerated keeps strong keys.

## Decision rules

- Implement weak semantics with ephemerons; never with a bare weak pointer
  where the weak thing is a key.
- Do not trace an ephemeron's value during the main mark; pend the ephemeron
  and resolve the list after the queue drains.
- Iterate the pending list to a fixpoint; treat every ephemeron still pending
  as key-dead.
- Repeat the resolution on the remark after finalization.
- Clear dead ephemerons in the finalization pass, before the sweep; clear
  weak-map entries after the sweep; never either during marking.
- Make the ephemeron an ordinary heap cell, marked when rooted *and* when
  reached; rebuild the pending list per cycle from the traversal.
- List weak maps through weak handles so the list cannot keep a map alive.
- Derive weak references (unit value) and weak maps (a table of ephemerons)
  from the one primitive.
- Refuse enumeration of a weak map.

## When not to use it

A runtime with no weak semantics - no weak-keyed structures in its object
model and none exposed to programs - has nothing to pend and should not carry
the pass. A runtime that needs only weak references, never weak keys, could
use a plain weak pointer cleared at sweep; but the ephemeron with a unit value
costs the same and leaves the door open, so the plain pointer is a
simplification that will be undone.
