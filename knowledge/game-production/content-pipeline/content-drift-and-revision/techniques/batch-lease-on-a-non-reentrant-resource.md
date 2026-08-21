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

When a fleet of production jobs contends for a resource that cannot be entered twice — a
single-instance authoring application, an editor session, a device, a licence-limited
tool — take **one exclusive lease for the whole batch**, all-or-nothing, and drain it
rather than cancelling it. Do not lock per job.

## Why all-or-nothing beats per-job locking

Per-job locking looks strictly better: finer granularity, higher utilisation, jobs
proceed as slots free up. It is worse here, for a specific reason. A non-reentrant
resource is usually also a *fragile* one — a long-lived process, a session, a piece of
hardware — and its characteristic failure is dying part-way through a run. Under per-job
locking, that leaves the corpus half-regenerated: some entities on the new specification,
some on the old, no record of where the line stopped, and every downstream consumer
reading a mixture. Under a batch lease, the same failure leaves the corpus untouched
except for a stated prefix, because the batch is the unit that was admitted and the unit
that is reported on.

The second reason is that the interleaving failure is silent. Two jobs sharing a
non-reentrant tool rarely crash; they produce outputs that are each individually
plausible and collectively wrong — content built against another job's half-applied
state. That is content drift with no cause anybody can find, which is the most expensive
class of defect this subject deals with.

So: partial progress against a resource that dies mid-batch is worse than no progress. A
refusal to start is a result, and a better one than a half-finished sweep —
[refuse rather than destroy](../../../_laws.md#refuse-rather-than-destroy).

## The procedure

1. **Name the resource and prove it is non-reentrant.** If two instances can genuinely
   run side by side, you do not need this and should not pay for it.
2. **Acquire before admitting any work.** The batch computes its full work list, then
   acquires. If the lease is unavailable, the whole batch is refused with a stated
   reason — never partially admitted.
3. **Key the lease by scope, and make conflict mean containment.** A lease is rarely
   global or nothing. Key it by the scope it will write — the collection, the entity — and
   define conflict as *overlap*, not key equality: a collection-wide lease excludes every
   member-entity lease in that collection and vice versa, because both drive the same
   single instance over overlapping rows; a lease covering everything excludes all others
   and can only be acquired against an empty registry; two leases over disjoint scopes run
   concurrently. Equality-only conflict detection is the classic bug — the keys differ, the
   resource does not.
4. **Derive lease keys in exactly one place, and make every contender use it.** A batch
   route, a background worker and any path that merely *writes back* results without
   driving the resource must all contend on one registry through one key-derivation
   function. A write-back path that skips the lease because "it runs nothing" will clobber
   an in-flight batch's rows.
5. **Hold for the batch, with a heartbeat and an expiry.** A lease without expiry becomes
   a permanent outage the first time a holder dies; a lease without a heartbeat expires
   under a slow but healthy run. Both are needed.
6. **Make the lease readable.** Expose held scopes and their acquisition times through a
   status query, so other sessions see "busy" rather than discovering the lease as a
   surprise refusal after they have committed to a run. An invisible lease is correct and
   still user-hostile.
7. **Drain on stop.** When a stop is requested, admit no new work, let in-flight work
   finish, and **count what drained**. Cancelling in flight hides the cost and leaves the
   resource in a state nobody recorded.
8. **Release explicitly, and report** what completed, what was refused, and where the
   batch stopped. A batch that ends without a written stopping point cannot be resumed
   safely.
9. **Size the batch as a budget, not a ceiling.** The concurrency and item count handed
   to a drain shape the run: too generous a batch means a longer window in which the
   resource can die, and it will be spent —
   [a budget shapes the output](../../../_laws.md#a-budget-shapes-the-output). State the
   intended batch size for the class of work rather than the maximum the system can bear.

## Decision rules

- **When the lease cannot be acquired, queue or refuse — never proceed unleased.** An
  "optimistic" unleased run is the interleaving failure by another name.
- **When a job inside the batch fails, the lease is not released.** Record the failure,
  continue the batch, and report at the end. Releasing on first failure converts one bad
  item into a broken run.
- **When a lease is found expired but the resource looks busy, refuse.** Never reclaim by
  killing what you can only identify by name; you did not spawn it and cannot prove what
  it is.
- **When the resource is a person's live workspace rather than shared throughput, refuse
  loudly instead of queueing.** Same mechanism, different failure being defended against:
  queueing behind a human's session means seizing it later, unattended.
- **When batches must interleave for throughput, partition the resource, not the
  lease.** Two leases over two genuinely independent instances is sound; one lease held
  loosely is not.
- **When a refusal happens, name the scope that holds the lease in the refusal.** "Busy"
  sends the operator hunting; "held by this collection since this time" is actionable, and
  it is the same information the status query returns.

## Failure signatures

- Runs that "mostly work" but produce occasional artifacts nobody can explain: unleased
  concurrency.
- A permanently unavailable resource after a crash: a lease with no expiry.
- Leases dropping mid-run on healthy long batches: expiry without heartbeat.
- Stop requests that return instantly and leave the tool in an unknown state: cancel
  instead of drain.
- Resume after a failed batch re-runs everything or nothing: no stopping point recorded.
- A background sweeper and an operator-triggered batch corrupt each other's rows: two
  registries, or one contender that never took the lease.

## When not to use this

- **When the resource is reentrant and the concern is only rate**, use a rate limit or a
  concurrency cap. A lease serialises work that could safely run in parallel and will be
  removed by the first person who profiles the pipeline.
- **When the work items are truly independent and cheap to redo**, per-job locking is
  fine — the half-finished corpus argument evaporates if any subset can be re-driven at
  negligible cost with no ordering effects.
- **When the batch is long-running and interactive users need the resource during it**,
  a batch-wide lease is a denial of service. Split into short leased batches with defined
  release points, and accept the reduced throughput as the price of shared access.
