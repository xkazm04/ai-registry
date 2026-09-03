---
layer: application
type: application
subject: job-coordination
technique: lease-renewal
stack: python
verified_on: 2026-09-02
verified_against: python@3.12
---

# Every thread mutation is an operation kind under one lease, and a lost lease fences the writer (deer-flow gateway runtime)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02); every line cited below was opened in that clone.

The record is the run. The gateway's run manager and run store admit a run -
and, through the same `create_thread_operation_atomic()`, a checkpoint
write, an artifact write, an archive, a branch or a delete - under one
durable active-thread uniqueness constraint (`backend/app/gateway/AGENTS.md:126`,
`runs.operation_kind`). The guide forbids the alternative in so many words:
no "another lock or metadata marker" per new operation kind.

## The lease, as the technique describes it

`RunRecord.lease_expires_at` is "the last durably confirmed ownership
deadline" (`backend/app/gateway/AGENTS.md:124`). Renewal is bounded by it, and
an attempt that reaches expiry sets a process-local `ownership_lost` fence,
raises the abort event and cancels the run task. A fenced worker performs
none of the terminal writes - journal, receipt, status, checkpoint, thread
metadata - and the peer recovery path owns the terminal receipt. Grace
"delays peer reclamation for clock skew but is not extra execution time for
an owner that can no longer confirm its lease": the technique's stance that
an expired lease is evidence, stated as policy rather than as a comment.

Takeover uses an atomic `claim_for_takeover()` that re-checks status and
expiry (`:125`), so a renewal that lands between the scan and the write keeps
the run active and only one reconciler reports recovery. Cancel and owner
finalization are competing compare-and-swap operations on the active row
(`:123`), and `update_run_completion()` refuses to replace a different
terminal status - which closes the late-finalization race the technique
warns about, from the store side.

## Where the corpus's amendment is honoured

The "absent is not lost" amendment applies on the scheduler side: an expired
launch claim returns to the durable queue rather than failing the occurrence
(`backend/AGENTS.md:22`), and a multi-instance scheduler is supported only
with a shared relational store, heartbeats and database events (`:19`) - the
condition under which the two facts can differ at all.

## What the tree adds

Two things the technique does not say. First, the closed `CancelOutcome`
vocabulary (`backend/app/gateway/AGENTS.md:121`) - seven values naming *why*
a cancel did or did not land locally (cancelled, requested, taken over, lease
valid elsewhere, not active locally, not cancellable, unknown) - is the
cancel-side counterpart of the technique's terminal verdicts. Second, a
lease-less active row is treated as fail-closed, because "the store cannot
distinguish a stale row from a live writer in another heartbeat-disabled
worker" (`:126`): heartbeat-disabled multi-worker deployment is declared
unsupported rather than silently tolerated.

## What this realization cannot do

The fence is process-local. A worker that loses its lease and is then paused
past the point where the fence was set still has the fence when it resumes;
a worker whose fence was never set - because the renewal loop itself died -
relies on the store's compare-and-swap at every terminal write, which is the
technique's fencing token in its store-side form and the only wall left.
