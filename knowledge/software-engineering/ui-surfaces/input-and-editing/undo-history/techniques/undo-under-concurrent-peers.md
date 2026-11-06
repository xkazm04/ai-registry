---
layer: technique
type: technique
subject: undo-history
technique: undo-under-concurrent-peers
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [another writer changes the document while a local undo stack is live, an undo reverts a collaborator's edit, an undone change loses at merge to the older state, redo puts back my old value over a value someone wrote since, undo walks through entries that change nothing]
---

# Undo under concurrent peers

An inverse assumes the exact state its forward operation produced, and a whole-state
snapshot overwrites whatever arrived since. A peer breaks both, and rolling back to a
previous state is not available either, because that state never held the peer's work. What
survives is a history of **small facts about what I changed, re-read against the document
when they run.**

**Diff from a baseline, and tag the write.** Keep a durable baseline, and at each commit diff
the document against it into an entry holding only what moved. No action writes an inverse,
so nothing can drift from its forward path. Every write then says what it does to the
baseline. A local step moves it and mints an entry. A peer's write moves it and mints
nothing, so it can neither enter my next step nor truncate my redo: a peer did not fork my
history. An unfinished local step leaves it alone and joins the next capture. The baseline
keeps a record a peer removed, or a later undo has nothing to restore it from.

**Touch only what the entry names.** A peer's recolour survives my undo of a move. Where we
both wrote the same property, my undo wins, because that is what I asked for.

**Rewrite the entry as it runs.** When an entry is applied, its opposite is rebuilt from the
values in the document at that moment and not from those captured. Undo, take a peer's write,
then redo, and the document returns to what undo overwrote, the peer's value included. The
principle to test is that going back and forward again leaves the present unchanged. It holds
across the pair and not at each step, since a redo also overwrites anything written after the
undo, and the next undo gives that back.

**Rewrite on running, or map on arrival.** The rule above suits a document of keyed
properties, where an entry is still meaningful after any write. A document addressed by
position cannot wait: an inverted step means nothing once earlier text has moved, so it has
to be mapped forward over the changes that arrive. That costs maps that accumulate, so the
history has to compact itself. Keys or positions decide which you need. Neither is the
default.

**To the merge, an undo is a new write.** Never restore version or ordering metadata from the
entry. A rolled-back version loses at merge to everyone who saw the state being undone, so
the undo appears to work locally and never reaches anyone. This says nothing about
truncation: an undo still does not truncate its own redo side
([redo-semantics](./redo-semantics.md)).

**Skip what no longer shows.** A peer can delete everything an entry touched, leaving a step
that does nothing. Keep popping until something visible changes, and judge "visible" from the
applied result. When unsure, report a change: the cost is one empty step, and the opposite
error can walk the whole stack with no way back.

**An entry that throws must not wedge the stack.** Pop before applying and push to the other
stack in a `finally`, so a bad entry cannot block everything beneath it. That suits a pure
apply that fails the same way every time. Where the apply can fail transiently, retry first
and then move it on.

**What this does not buy.** A list-valued property is one atomic value unless you
post-process it, so undo can drop items a peer added and only redo restores them. A record
purged before sharing can come back from the baseline on an explicit undo, and it then syncs,
so a purge at a trust boundary guards nothing against the local user's own history. The
entry is a stored derivation of the document
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)), and
it names its recomputation by rewriting on each run. And one client simulating a peer through
the tag proves the history logic, never the merge; that needs two real clients.
