---
layer: technique
type: technique
subject: engine-binding-surface
technique: pre-resolve-what-the-engine-cannot-await
status: forged
laws: [creation-names-reaper, absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [an engine you cannot change calls back synchronously for a resource the host can only acquire asynchronously, a host layer scans the engine's input to open handles before handing it over, handles opened for one call are closed in a finally, a streamed or pending result is read after the call that started it has returned, a caller's own registration shares a name with one the host opens automatically, deciding between blocking the engine's thread and resolving ahead of it]
---

# Pre-resolve what the engine cannot await

## The case

The engine runs synchronously. When it needs a resource mid-evaluation - a file
handle, a grammar, a string table - it calls the host and expects the answer on the
same stack frame. The host can only produce that answer asynchronously: the handle
comes from an API that returns a promise, the chunk comes over the network. The
engine cannot be changed to await, because it is compiled code the binding layer
does not own, and it cannot suspend without a rewrite of its own control flow.

There are exactly two honest ways across, and the first question is which one is open.

**Block the engine's thread until the answer arrives.** Legal when that thread may
park while the asynchronous work completes somewhere else: a dedicated worker, a
blocking pool, a thread that is not the one the host's event loop runs on. Then the
synchronous callback waits on the future and nothing else is needed. This is the only
option when the engine *computes* which resource it wants at run time, because nothing
outside the engine can know the answer early.

**Resolve ahead of it.** Required when the engine's thread is the one that would have
to run the asynchronous work - a single-threaded runtime, a worker whose only
scheduler is its own event loop - so blocking deadlocks or is simply not expressible.
The host reads the input before handing it over, derives every resource the
evaluation will ask for, acquires each one asynchronously, and only then calls the
engine. This technique is that second branch. It works only when the input *declares*
its resources in a form the host can read without evaluating it; when it does not,
the branch is closed and the design has to go back to the first one or to an engine
that can suspend.

## The procedure

Resolving ahead is three obligations, and a layer that keeps only the first ships a
feature that passes its happy-path test and fails on every other one.

**1. The scan over-approximates, and what it cannot read is refused before entry.**
The scan is a reader of the engine's input language written by someone who is not the
engine. It will be narrower than the language: it recognises one quoting style and
not the other, a literal and not an expression that builds one, the input text and
not a parameter bound later. Each gap is a resource the engine will ask for and not
find, and the engine reports that as its own failure - "not found", from inside the
evaluation, indistinguishable from a resource that really does not exist. So: widen
the scan to every form the language uses to name the resource directly, and where the
input names the resource class at a site the scan cannot resolve to a concrete name,
refuse the call before the engine starts, with a typed error that says the
pre-resolver could not read the reference and how to make it readable
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud),
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). A
partial match is worse than no match: a fragment of a name that the scan reads as a
whole name gets *acquired*, and an acquisition that creates on miss leaves an empty
resource behind under the fragment's name.

**2. Release only what this call acquired.** The scan finds names, not ownership. A
name the caller registered by hand, or one a concurrent call already holds, is found
by the scan exactly like a name nobody holds, and a release that walks the scanned
list closes the caller's handle out from under them. Keep an acquisition record per
call - acquired here, or borrowed - and a count per name across calls; the release
closes a handle only when the count this layer owns reaches zero, and never touches
a borrowed one ([creation-names-reaper](../../../../_laws.md#creation-names-reaper):
the reaper is whoever created it, not whoever happened to see its name).

**3. Release at the end of the engine's use, not at the end of the call.** A
`finally` around the call that *starts* evaluation is correct only when that call
also *finishes* it. An engine that returns a pending result, a cursor or a stream
keeps reading through the handle on every later poll and fetch, so the release
belongs to the event that ends the use: the last batch consumed, the reader closed,
the next query on the same connection, an error on any poll. Tie the acquisition
record to that event. When the engine itself refuses to drop a handle it still has
open, a release fired early does not merely fail - thrown from a `finally`, its error
replaces the evaluation's outcome, and the handle it could not close stays open.

## What it costs

**A second parser of someone else's language.** The scan drifts from the engine
whenever the language grows a new way to name a resource, and nobody is told. The
refusal in obligation 1 is what makes the drift loud rather than a new class of
mysterious "not found"; it does not remove it. A test per naming form - literal in
each quoting style, expression, bound parameter - is the scan's contract.

**Resources held for the whole evaluation.** Everything the input names is open
before the first step and stays open until the last, including resources a branch
never reaches. Where handles are exclusive, that widens the window in which another
reader is locked out.

## When not to use it

**When the engine's thread can park.** Block on the future inside the callback and
keep the engine's input unread. It is simpler, it is exact, and it handles computed
resources the scan never could.

**When the engine can suspend.** A callback surface that accepts a promise, or a
build of the engine that can yield mid-evaluation, removes the problem this technique
works around; prefer it where it exists, even at a cost in binary size.

**When the resource set is a small fixed table.** If every evaluation can need only
resources from a known, small set, acquire the set once at startup and never scan.

## Relation to its neighbours

[Capability-deferred-release](./capability-deferred-release.md) moves a release
*later*, to a place where it is permitted; this moves an acquisition *earlier*, to a
place where it is possible. Both exist because the host's ordinary scope - acquire at
first use, release at scope exit - lands on a point the foreign runtime does not allow.
The [engine-host contract](../../engine-host-contract/engine-host-contract.md) refuses
synchronous loading on principle when the engine is yours to design; this technique is
what the binding layer does when the engine was designed the other way and cannot be
changed.
