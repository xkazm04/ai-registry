---
layer: golden-path
type: golden-path
subject: embedded-tracing-collector
status: forged
use_when: [designing or reviewing the heap of a scripting engine embedded in a host that owns the threads, deciding how a collector finds its roots when host code holds handles it will never register, adding weak references or weak maps to a language runtime, choosing when an embedded engine collects and what its threshold is derived from]
techniques:
  - derived-trace-with-escape-hatches
  - root-discovery-by-counting
  - mark-finalize-remark-sweep
  - ephemeron-fixpoint-marking
  - allocation-threshold-growth-policy
---

# Embedded tracing collector

A language runtime that lives inside another program does not own the program.
The host owns the threads, the event loop, the stack, and every native
structure in which it chooses to keep a handle to a guest object. The heap
belongs to the engine, and the engine must reclaim it without a single
cooperation the host was never asked to give: no registered root set, no
safepoint the host polls, no write barrier in the host's code, no pause the
host must schedule. This subject is the collector that meets those terms - a
single-threaded, non-moving mark-sweep collector whose roots are discovered
rather than declared, whose tracing is derived from type definitions rather
than hand-written, whose weak semantics are ephemerons, and whose collection
is triggered by an allocation threshold that grows with the live set.

The subject begins at allocation and ends when the reclaimed memory is returned.
It owns the header every heap cell carries, the trace protocol every heap type
implements, the three-pass cycle, the weak structures, and the trigger policy.
It does not own what the host is allowed to keep alive across the boundary:
the rule that a queued host job is deliberately untraceable, so that anything
the job captured stays rooted for the job's life and the job itself can never
be stored inside the heap, is the sibling [engine-host-contract](../engine-host-contract/engine-host-contract.md)'s rule. This
subject states its consequence for the collector - a job's captures are
ordinary roots, found by the same counting as every other host-held handle -
and does not restate the contract.

## What this design refuses, and why the refusals are the design

Three textbook alternatives are refused, and each refusal follows from the
host owning the threads.

**Reference counting for the heap is refused** because the object graph of a
dynamic language is cyclic by construction - a function closes over the scope
that holds it, a prototype's constructor property points back at the function
that points at the prototype - and a counted heap leaks every cycle. Counting
is kept for exactly one job, root discovery, where it answers a question
tracing cannot: *how many references to this cell live outside the heap?*

**A moving collector is refused** because moving requires finding and rewriting
every reference, and the host holds references the collector cannot see: in
its own structs, on its own stack, in frames of code the engine never compiled.
A handle table would let the collector move objects behind stable indices, but
it costs an indirection on every guest access and a discipline on every host
author, and it is exactly the registration this subject exists to avoid. So
the heap is non-moving, a cell's address is its identity for its whole life,
and fragmentation is the price - paid deliberately, and mitigated by the
allocator beneath, not by the collector.

**A concurrent or generational collector is refused** because both need a
barrier: a write barrier to record old-to-young edges, a read or write barrier
to keep a concurrent marker honest. A barrier is a line of code at every
pointer store, including the host's, and the host's stores are not the
engine's to instrument. The collector runs on the engine's thread, stops the
engine while it runs, and needs no coordination because there is nothing else
on that thread to coordinate with. A host that wants pauses bounded gets
a smaller threshold, not a concurrent marker.

The naive reading takes these as limitations to be fixed later. They are
not. Each is the shape the host boundary forces, and a collector that "adds a
generational young space later" discovers that the young space needs a barrier
the host will never emit, and rewrites the whole embedding to add one.

## Roots are found by counting, not registered

The load-bearing decision is how the collector finds its roots. A collector
inside a program it owns scans the stack, conservatively or precisely, and
walks a registry of global roots. Neither is available here: the host's stack
is not the engine's to scan, and a registry is a discipline that fails silently
- an unregistered handle is a dangling pointer, and the failure appears at the
first collection after the omission, far from the site of it.

The alternative that works keeps two counts in every cell's header: the number
of references to this cell held anywhere, and the number of those held from
inside the heap. The first is maintained by the handle type, incremented on
clone and decremented on drop, the way a reference count is. The second is
computed by the collector, in a pass before marking, by asking every cell to
report the handles it contains. A cell is a root exactly when the two differ -
some handle to it lives somewhere the heap traversal did not reach, and that
somewhere is the host. [Root-discovery-by-counting](./techniques/root-discovery-by-counting.md)
owns the pass, its cost, and the two arithmetic rules that keep the answer
safe: the internal count saturates, and the total count refuses to overflow,
so no arithmetic can ever make a live cell read as unrooted.

That a handle held by the host is a root *by virtue of being held* is what
makes the sibling's untraceable-jobs rule work: a queued job that captured a
handle holds a reference the heap traversal will not find, so the capture is
rooted until the job drops it, with no registration and no special case.

## Tracing is derived, and the escape hatches are named

Every heap type must tell the collector which handles it contains, and it
must tell the truth on three occasions - the counting pass, the mark, and the
finalizer sweep. A hand-written trace method that omits a field is correct in
every test and dangling in production, so the trace is *derived* from the type
definition: every field is traced unless the type says otherwise, and "says
otherwise" is a closed set of named escape hatches. A field that holds no
handles is marked plain data; a field that holds handles the type keeps alive
by other means is marked untraced, with the burden of proof on the author; a
type whose layout is cast from another type implements the protocol by hand
and is spelled unsafe for doing so.
[Derived-trace-with-escape-hatches](./techniques/derived-trace-with-escape-hatches.md)
owns the protocol and its second, less obvious job: the derive replaces the
type's destructor with a finalizer, because a destructor runs when the last
handle drops and a finalizer runs when the collector says it is safe, and a
heap type that could run arbitrary code at handle drop would run it during a
sweep, with the heap half-reclaimed under it. The generated destructor still
exists, and it runs the finalizer only when the collector is *not* sweeping -
for the value that lived on a native stack and never entered the heap - and
does nothing when it is.

## Finalization is a phase, and it can resurrect

A collector that drops unreachable cells in a single pass cannot offer
finalization, because a finalizer that runs while the sweep is in progress sees
a heap in which its neighbours may already be gone. So the cycle has three
passes rather than two: mark from the roots; run the finalizer of every
unmarked cell, once, in a state where the whole heap is still intact; then
mark again, because a finalizer may have stored a reference to its own cell,
or to another unmarked cell, somewhere reachable - it *resurrected* it - and a
resurrected cell must survive. Only then does the sweep run, and it runs under
a guard that forbids dereferencing any handle, because a handle dereferenced
mid-sweep is a use-after-free with a friendly name.
[Mark-finalize-remark-sweep](./techniques/mark-finalize-remark-sweep.md) owns the
cycle, the rule that tracing uses an explicit work queue rather than recursion
(a long linked structure overflows the native stack otherwise, and it does so
in the collector, where no guest handler can catch it), and the accounting
that lets a cell be finalized exactly once across cycles.

## Weak semantics are ephemerons

The object model needs weak references - a cache keyed by object identity, a
transition table that must not keep every historical shape alive - and the
language exposes them. A weak pointer is the naive primitive and the wrong
one, because a weak-keyed map whose *value* refers back to the key is a cycle
the weak pointer cannot break: the map keeps the value alive, the value keeps
the key alive, the key is never collected, and the "weak" map is a leak.

The primitive that works is the ephemeron: a pair whose value is traced only
if both the ephemeron and its key are otherwise reachable. Marking cannot
decide that in one pass, because the key may be reached late through another
ephemeron's value, so ephemerons met during the mark are queued rather than
traced, and after the main mark the queue is iterated to a fixpoint - any
ephemeron whose key is now marked traces its value, which may mark another
ephemeron's key, until a whole pass changes nothing. Every ephemeron still
pending has a dead key and is cleared in the finalization pass, while the
heap is intact. A weak reference is an ephemeron with a unit value; a weak
map is a table of ephemerons whose dead entries are dropped as a batch after
the sweep. [Ephemeron-fixpoint-marking](./techniques/ephemeron-fixpoint-marking.md)
owns the algorithm, its cost, and the rule for the ephemeron's own lifetime.

## Collection is triggered by a derived threshold

The collector runs when the bytes allocated since the last collection exceed a
threshold, and the threshold is not a constant. A fixed threshold under a
growing live set collects more and more often for less and less, because each
cycle finds the same live megabytes and reclaims only the margin above them.
So after a collection, if the surviving bytes still occupy more than a fixed
fraction of the threshold, the threshold is raised so that the survivors sit at
that fraction - the derivation is written next to the ratio, and the ratio is
the only tunable. [Allocation-threshold-growth-policy](./techniques/allocation-threshold-growth-policy.md)
owns the policy, the choice of what is counted, the bookkeeping the collector
shrinks after each cycle so a burst does not pin memory forever, and the
question the naive policy never asks: whether the threshold should ever fall.

## What the naive reading gets wrong

The naive reading treats the collector as an allocator with a sweep attached,
and puts the design effort into the sweep. The sweep is the easy pass. The
design lives in the answers to three questions the sweep never asks: what is a
root, when is it safe to run user code, and what does "weak" mean when the weak
thing is a key.

The second naive reading treats the host as a client of the collector. The
host is a *part* of the object graph - an unmapped part, holding edges the
collector cannot enumerate - and every mechanism here is a way of reasoning
about edges it cannot see. Counting infers them; the finalization phase
protects against code that would create them at the worst moment; the
untraceable-job rule, owned next door, keeps a whole class of them rooted by
construction.

The third naive reading, and the most expensive, is that the trace protocol is
an implementation detail that a careful author can hand-write. It is a
correctness contract with three consumers - the count, the mark and the
finalizer - and one omitted field satisfies every test and corrupts memory
on the first collection that matters. Derive it, close the escape hatches, and
spell the manual implementation unsafe so the reviewer sees it.
