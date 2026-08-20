---
layer: technique
type: technique
subject: data-retention
technique: time-budgeted-batch-purge
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [deleting expired rows at volume, a cleanup job is being killed before it finishes, reporting what a purge actually did]
---

# Time-budgeted batch purge

Executing a retention horizon as a **bounded, interruptible, resumable
process**: batches sized to bound their own cost, a wall-clock budget
derived from the runner's real limit, a clean stop at a batch boundary, and
a summary that says what was done and what was left.

The naive form is one statement per population per tenant. It works
perfectly in development, where every tenant has hundreds of rows, and
fails permanently in production, where one tenant has millions: the
statement takes longer than the platform allows, the process is killed
mid-transaction, the work rolls back, and the next tick starts from the
same place and is killed identically. Nothing is ever deleted, and the job
history shows a job that ran.

## The budget is derived, never guessed

Whatever hosts the purge has a maximum duration — a platform request
timeout, a lease term, a container deadline. The purge's budget is
computed **from that same declared limit**, with a margin for the work that
must happen after the last batch (final commit, summary write, response).
Both live in one place, and a test pins the relationship so that raising
the platform limit without raising the budget, or vice versa, fails the
build rather than surfacing as a nightly kill.

This sounds fussy until the failure mode is stated: the budget and the
deadline drift apart during a routine deployment change, months after
anyone thought about retention, and the symptom is a purge that silently
stops making progress on exactly the tenants that most need it — the large
ones. A hand-tuned constant with a comment saying "must be less than the
route timeout" is that drift waiting to happen.

Reserve margin generously. Being killed at 95% of budget costs an entire
run; finishing at 70% costs one extra tick.

Two caveats worth writing down next to the constant. The declared maximum
is often a *request* rather than a guarantee — a hosting tier may cap it
lower, in which case the derived budget never trips and the run is killed
anyway, so the override that lets an operator set the budget below the real
cap must exist and be documented. And a deployment with no external kill
timer needs a way to say **no budget**, which is the same distinguished-value
convention the retention windows use: one reserved value meaning unlimited,
spelled the same way across the module so nobody has to remember two
conventions for "off".

## Batches bound more than time

Pick a batch size that bounds three things at once: statement duration,
lock footprint, and replication or change-feed volume. The last is the one
teams forget — a correct purge that deletes a million rows in one
transaction can stall replicas, blow out change-feed consumers, and take
the live product down without ever touching a user-facing code path. Delete
by primary key in bounded chunks, selecting the identifiers first where the
store makes that cheaper than a scanning delete.

Between batches, and only between batches, check the budget. The unit of
interruption is a **completed, committed batch**, which is what makes the
process resumable at all: whatever was deleted stays deleted, whatever was
not is still expired and will be selected by the identical predicate on the
next run. This is why horizon-based deletion is a good fit for interruption
— the predicate is a function of time and immutable fields, so no cursor
needs to be persisted. If the population's predicate is *not* stable under
interruption, that is a design smell to fix before adding a cursor.

Three details separate a batch loop that works from one that only looks
like it does:

- **Page the selection, not just the deletion.** Reading every expired
  identifier into memory and then deleting them in tidy chunks defeats the
  entire mechanism: the unbounded read is the statement that times out, on
  exactly the largest population, so the table the job exists to bound
  keeps growing while the job appears to be batched.
- **Check the budget inside the inner loop, not only between tenants.** A
  budget consulted only in the gaps between tenants leaves a single
  oversized tenant free to loop for minutes with no check, which is the one
  case the budget was built for.
- **Stop on non-progress.** A loop that re-selects and deletes must break
  when a delete removes nothing, or a predicate that selects rows the
  delete cannot remove spins forever inside the budget and starves
  everything after it.

Order deletions so that dependent rows go before the rows they reference,
or lean on declared cascades where the store enforces them — but know the
yield either way, because a cascading delete of a batch of a thousand may
remove far more than a thousand rows and blow the batch's real cost budget.

Rank by a **store-authoritative** timestamp — insertion order the store
itself stamped — not by a time field the caller supplied. A backdated or
clock-skewed caller timestamp on a keep-the-newest-N policy will rank a
live, current record into the stale window and delete it, and the deletion
will look entirely correct in the summary.

## Interruption must not starve the same tenant every night

If the budget will regularly stop a run short, the order in which tenants
are visited becomes a fairness mechanism, and the obvious choice is wrong.
Randomising the order gives only *probabilistic* fairness: a large tenant
that cannot drain within one tick has an independent chance of landing in
the unreached tail on every single run, so bad luck compounds and it can be
starved for an unbounded number of ticks — while the job reports success
each time. Use a **deterministic rotation** of a stable order instead:
advance the starting position by one per period and wrap, so every tenant
reaches the front of the queue within a bounded number of runs. Fairness
under interruption should be a guarantee with a stated bound, not a
distribution.

## Partial success is a first-class outcome

A run ends in one of several states and they must be distinguishable:
completed (nothing left above the horizon), **out of budget** (stopped
cleanly, work remains), skipped-with-errors (some tenants refused by the
floor, see [destructive-override-floor](./destructive-override-floor.md)),
and failed (could not run at all). Collapsing these into success/failure
destroys the two signals operators actually need — "we are no longer
keeping up" and "the retention obligation is not being met".

The summary is per tenant and per population, and every number it carries
travels with its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): rows
deleted, the horizon applied, and the cutoff moment. "Deleted 40,102 rows"
is not an operational record; "deleted 40,102 event rows for tenant X older
than the 90-day tenant window, cutoff at T" is one, and it is the record
that answers a compliance question a year later.

Two structural rules keep that summary truthful. First, **degradation has
more than one channel and every channel must trip the non-green status**:
per-tenant errors *and* the budget stop are both degradations, and a status
gated on errors alone will report green for a run whose trailing sweeps
were silently skipped for want of budget. Second, **accumulate the counters
outside the error boundary**. Each committed batch is durable, so a throw
in a later batch does not undo earlier deletions — but a summary that
builds its counts only on the success path discards them, and then
under-reports what was actually destroyed. The partial result is the record
that matters; it must survive the failure that made it partial.

Report **zero-deleted distinctly from did-not-run**
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). A
purge returning zero because everything is inside its window and a purge
returning zero because it was denied access, or because its credential was
missing, look identical on a chart — and the second is an outage of the
retention obligation that will be discovered by an auditor rather than by
monitoring. The entry point's authentication must therefore **fail closed**:
a missing or unset secret refuses the request rather than skipping the
check, because a destructive endpoint that becomes open when its
configuration is absent is the worst available default.

## Alarms worth wiring

- **Consecutive out-of-budget runs on the same tenant** — the purge is no
  longer keeping up with ingest and the horizon is no longer being honoured
  even though every run "succeeded".
- **A run that deletes an anomalous share of a tenant's population** — the
  signature of a misconfigured window that slipped past the floor, or of a
  floor bypass left enabled.
- **No successful run within one horizon-relevant period** — the silent
  death of a scheduled reaper produces no error, only growth.

## When not to use this

- **Small, bounded populations** where a single statement finishes in
  milliseconds and always will; batching machinery there is cost without
  benefit. Revisit when the population becomes per-tenant unbounded.
- **Stores with native expiry** — time-to-live at the storage layer,
  partition-drop by time range. Dropping a whole time partition is
  dramatically cheaper than row-wise deletion and should be preferred where
  the partitioning key matches the horizon; the budget discipline still
  applies to whatever coordination remains.
- **Deletions that must be atomic across the whole population.** Batching
  deliberately gives up atomicity; if a half-purged state is not acceptable,
  this is the wrong shape and the requirement needs revisiting first.
