---
layer: technique
type: technique
subject: embedded-tracing-collector
technique: mark-finalize-remark-sweep
status: forged
laws: [creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [a traced heap must run user-visible cleanup on unreachable objects, a finalizer may store a reference to the object it is finalizing, tracing a deep structure overflows the native stack, deciding what a handle may do while the sweep is running]
---

# Mark, finalize, remark, sweep

The two-pass collector - mark what is reachable, free what is not - cannot
offer finalization, and the reason is timing. A finalizer is user code that
runs on an unreachable cell, and user code touches neighbours. If it runs
during the sweep, its neighbours are being freed in an order nobody promised;
if it runs after the sweep, they are gone. So the cycle has a third pass
between mark and sweep, dedicated to finalization, and the mark runs twice -
once to find what is unreachable, once more to find what the finalizers
brought back.

## The four passes

**Mark.** Starting from the roots (found by counting, in this subject), visit
every reachable cell and set its mark bit. Tracing uses an **explicit work
queue**, never recursion: a cell's handles are pushed onto the queue when the
cell is visited, and the loop pops until the queue is empty. Recursive tracing
is the naive reading and it fails on the first long linked structure - a list
of a hundred thousand nodes, an accumulator chain, a deeply nested tree - by
overflowing the native stack inside the collector, where no guest handler can
catch it and the process simply dies. The queue makes the collector's stack
depth constant regardless of the heap's shape.

**Finalize.** Walk every cell that is unmarked and has not been finalized in a
previous cycle, and run its finalizer. The whole heap is intact: nothing has
been freed, every handle still dereferences, every unmarked cell still holds
its fields. The finalizer may do what a destructor does - release a native
resource, close a descriptor, notify a registry - and it may do one thing a
destructor never can: it may store a handle to its own cell, or to any other
cell, somewhere that is reachable. That is **resurrection**, and it is allowed,
because forbidding it would require the collector to police every store a
finalizer makes.

The finalizer runs **once per cell across all cycles**, so every cell carries a
finalized flag, set when its finalizer runs and never cleared. A resurrected
cell that later becomes unreachable again is swept without a second
finalization. This is the naming of the reaper for a heap cell
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the
finalizer runs in this pass, exactly once, and after it has run the cell's
only remaining reaper is the sweep.

**Remark.** Because finalizers may have resurrected cells, the mark bits from
the first pass are no longer the truth, and the mark runs again from the
roots. The roots do *not* need recounting, and the reason is worth stating
because the naive reading recounts. A finalizer resurrects by storing a
handle, and storing a handle increments the target's total; the internal
count from the pre-pass is untouched. So every store a finalizer makes can
only widen the gap between total and internal - it can only make a cell read
as *more* rooted - and a remark from the stale counts errs exclusively in the
safe direction. The remark is a full mark rather than an incremental one,
because the collector has no record of which stores the finalizers made. Its
cost is a second traversal of the live set, paid only on cycles in which the
first mark found something unreachable; a cycle that found nothing skips
both the finalization and the remark.

**Sweep.** Walk the heap, free every unmarked cell, clear the mark bit on every
marked one, and reset the internal counts for the next cycle. The freeing is
done through each cell's own drop, dispatched through the cell's vtable, so
that a cell of any type can be freed from a list that knows only headers.

## The sweep guard

The sweep frees memory that handles still point to - not live handles, but
handles inside the cells being freed, whose drops run as part of freeing. A
drop that dereferences a handle during the sweep is a use-after-free: its
target may already be gone. The derive has already moved cleanup out of the
destructor and into the finalizer (that is the point of the finalization
pass), so a correct traced type's drop touches no handle. But correctness by
convention is an absent guard, so the collector adds a present one: **for the
duration of the sweep, a thread-local flag is set, and dereferencing any
handle while it is set fails immediately** rather than reading freed memory
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A type
whose drop reaches through a handle fails on the first sweep that exercises
it, at the dereference, with the flag named in the failure - rather than
corrupting memory on the one sweep whose ordering happens to expose it.

The check is a release-mode check, on every handle type. A guard that is
compiled out of the build that ships is a guard on the test suite, and the
sweep whose ordering exposes the bad drop is, by the nature of the bug, the
one the tests did not run. The cost is a thread-local read per dereference,
and a collector that finds that cost too high should measure it before
downgrading the guard to a debug assertion - and should then say, in the
handle's documentation, that the promise of a failure is a debug-build
promise.

The same flag is what the generated destructor and the handle's own drop
consult, in the opposite sense from the naive reading: outside a sweep, a
dropped value runs its finalizer and a dropped handle decrements its target;
inside one, both do nothing, because the finalizer already ran and the target
may be freed. The flag means "the collector is freeing", not "the collector
is in charge".

## The type-erased list

The heap is a list of cells of many types, and every pass above walks it
knowing only the header. So the header carries a vtable with the operations
each pass needs - trace, count internal references, run the finalizer, drop
and deallocate - and each derived type installs its own. The list itself is
the collector's, intrusive through the header, so allocation is a push and
sweep is a filter. A cell's size is recorded at allocation so the byte
accounting the threshold policy reads can be maintained on free without
asking the type.

## Decision rules

- Trace with an explicit work queue; never recurse into a cell's handles.
- Run finalizers in their own pass, after the first mark and before any free,
  with the whole heap intact.
- Allow resurrection; forbid nothing in the finalizer except dereferencing
  during a sweep.
- Finalize each cell once across all cycles; carry a finalized flag that is
  never cleared.
- Remark after any finalizer ran, from the pre-pass counts - resurrection can
  only add roots; skip finalization and remark together when the first mark
  found nothing unreachable.
- Set a thread-local guard for the sweep and fail any handle dereference under
  it, in release builds, on every handle type.
- Under the guard, let a dropped handle leave its target's count alone and a
  dropped value skip its finalizer.
- Dispatch trace, count, finalize and drop through a per-cell vtable so the
  collector walks headers, not types.

## When not to use it

A heap with no finalizers - no native resources, no user-visible cleanup
hooks - needs only mark and sweep, and the finalization pass and remark are a
traversal paid for nothing. Add them when the first type needs cleanup that
touches another cell, and not before; but when they are added, add all three
parts at once, because a finalization pass without a remark is a collector
that frees resurrected cells.
