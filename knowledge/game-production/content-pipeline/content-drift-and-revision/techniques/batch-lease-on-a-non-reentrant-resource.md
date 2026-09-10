---
layer: technique
type: technique
subject: content-drift-and-revision
technique: batch-lease-on-a-non-reentrant-resource
status: forged
laws: [refuse-rather-than-destroy, a-budget-shapes-the-output]
shared_with: []
use_when: [many production jobs contend for one single-instance tool, a batch must not leave a half-regenerated corpus, deciding between per-job locking and a batch-wide lease]
---

# Batch lease on a non-reentrant resource

Acquire exclusive ownership of the actual non-reentrant resource before admitting a
batch. A single editor, device or licensed session is still one resource when two jobs
write different records. Record scopes and resource ownership are separate constraints.

## Admission is not an output transaction

A batch lease prevents competing access; it does not roll back earlier writes when a
later item fails. Report the exact completed, failed, untouched and uncertain items.
If consumers must never see a partial revision, stage outputs and publish them with an
atomic commit or an explicit version switch. A stopping-point record alone does not
make publication atomic, and parallel completion need not form a contiguous prefix.

Batch ownership is useful when session state must stay consistent across several jobs.
Per-job ownership can be appropriate for independent operations that fully restore state.
Choose the admission unit from the resource contract and recovery requirements.

## Procedure

1. Name the exclusive resource and identify every possible contender, including other
   processes and background work. Prove independence before allowing parallel instances.
2. Compute the batch and acquire resource ownership before admitting any work. Refuse
   or queue according to the resource's ownership policy if acquisition fails.
3. Separately acquire write scopes where rows can conflict. Collection and member locks
   overlap; disjoint row scopes still conflict on one shared non-reentrant instance.
4. Route all resource users through the same ownership mechanism and all write-back
   paths through the relevant write coordination. One in-process registry protects only
   contenders in that process, not every process on the host.
5. If ownership can expire while a worker survives, fence obsolete owners at the resource
   and write boundaries. A heartbeat reduces accidental expiry; it does not stop a paused
   old owner from resuming. Do not reassign a still-active unfenced resource.
6. Expose owner identity, acquisition time and affected scope for diagnosis. A mutex
   whose lifetime is correctly tied to its only owning process need not imitate a
   distributed expiring lease.
7. On stop, admit no new work and drain within a stated bound. If work cannot finish,
   cancel only through an owned, supported mechanism or quarantine the resource. Do not
   release ownership merely because the caller stopped waiting.
8. Release after execution has stopped and writes are settled, then report results and
   the recovery procedure. Reconcile uncertain outcomes before replaying them.
9. Bound batch size to limit resource occupancy and recovery cost. Use smaller batches
   when other legitimate users require predictable access.

## Decision rules

- Continue after an item failure only when the resource remains healthy and later items
  are independent of the failed state. Otherwise stop admission and drain safely.
- An expired owner record is insufficient evidence that the underlying work stopped.
  Refuse unsafe reassignment rather than killing a process identified only by name.
- A person's live workspace requires a refusal and an intentional handoff. Do not queue
  an unattended takeover behind their session.
- To gain parallel throughput, partition the actual resource into independent instances.
  Dividing record keys alone cannot make one instance reentrant.

## Failure signatures and alternatives

Interleaved outputs suggest incomplete ownership coverage. Lost work after lease expiry
suggests missing fencing. A permanently busy resource may require ownership recovery,
while instant cancellation followed by reuse can conceal unfinished execution.

For a reentrant service constrained only by capacity, use a rate or concurrency limit.
For cheap independent jobs, short per-job ownership can be sufficient. Neither option
permits concurrent access to an instance whose contract still requires exclusivity.
