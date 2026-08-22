---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: bounded-fanout-commit
status: forged
laws: [identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [writing a batch of rows through a per-row endpoint, a bulk action flooding the backend, results that no longer line up with the items that produced them]
---

# Bounded fan-out over a shared cursor

When the window closes, some number of identities must be written. Two obvious
implementations are both wrong at scale. Serial writing costs the batch size
multiplied by the round trip, which turns a two-hundred-row verdict into a
minute of work happening after the operator has left. Issuing every write at
once turns the same verdict into a two-hundred-request burst that trips rate
limits, saturates connection pools, and produces a failure pattern
indistinguishable from an outage.

The shape that holds is a **small fixed pool of workers drawing from one
shared cursor over the input**. Each worker takes the next index, performs the
write for that identity, records the outcome in the slot with the same index,
and loops until the cursor is past the end. Concurrency is capped by the
number of workers, every identity is claimed exactly once because the cursor
advances as it is read, and the results end up aligned with the inputs by
construction.

## Alignment is a transport, identity is still the identity

Storing each result at its input's index makes the failure path trivial: the
outcome for input *i* is result *i*, so reverting the failures is a filter
over paired positions and never a lookup. This is legitimate precisely because
the input list is **frozen for the duration of the commit** — it was captured
when the window armed, nothing appends to it, and no worker reorders it.

That caveat is the whole of the law here
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Index alignment is a within-call convenience over an immutable snapshot, not a
way of naming things. The moment a position escapes the call — into stored
state, into a message, into a retry that re-derives the batch from the live
collection — it is meaningless, because the collection has moved. Everything
that leaves the routine carries the identity itself, and the pairing is
resolved before the boundary is crossed.

## Rules the pool must obey

- **No rejection escapes a worker.** A write that throws must be caught inside
  the worker and recorded as a failed result in its slot. A rejection that
  propagates out kills that worker, leaving its share of the cursor unclaimed
  and those identities with no result at all — neither applied nor reported,
  which is the worst of the available outcomes
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  The recorded failure keeps the *reason*, not just the fact: a slot holding a
  bare "rejected" produces a surface that can name which identities failed and
  never why, which is precisely the question the operator asks next.
- **Every slot is filled.** The routine returns a result for every input, in
  every case, including the ones it never attempted because something aborted
  the pool. An absent result must be spelled as an explicit "not attempted",
  never as an empty slot the caller reads as success.
- **Pool size is set by the slowest dependency, not the fastest client.** The
  right number is measured against what the receiving store tolerates
  concurrently: a small handful for a per-row endpoint behind a shared
  database, one for a store that serialises anyway, more only where the
  backend has demonstrated it. A configurable ceiling with a conservative
  default outlives a number tuned once against a laptop.
- **Order of execution is not preserved, and must not matter.** A pool
  interleaves. If the writes are order-dependent — one row's outcome changes
  another's — a pool is the wrong instrument and the dependency belongs in a
  single request the store can order for itself.
- **The pool is bounded in time as well as width.** A worker whose write never
  resolves holds a slot forever and the commit never completes; each write
  carries the surrounding timeout policy, and a timed-out write is a recorded
  failure like any other.
- **Progress advances on completion, not on success.** Where the commit is
  long enough to show progress, the counter is incremented in the worker's
  unconditional completion path and the failure count is tracked beside it —
  two numbers, done and failed, out of the total. A progress counter advanced
  only by successes stalls short of its total on any batch with a failure, and
  a stalled bar is read as a hung system by the one person who could still act
  on it.

## Prefer the batch endpoint when one exists

This technique exists because the owning store offers per-row writes. Where it
offers a batch write, use it: one request, one round trip, no pool. The two
shapes differ in their failure model, and the difference is worth naming
before choosing.

A batch endpoint that returns **per-row outcomes** is strictly better than a
pool — same reporting, a fraction of the traffic. A batch endpoint that is
**all-or-nothing** is not better or worse but *different*: partial failure
stops existing, the whole verdict either landed or did not, and the reversion
path collapses to reverting everything. That is a simpler world, and if the
store offers it, take it deliberately rather than discovering after an
incident that the endpoint was atomic all along.

Where writes fan out to more than one owning store — some identities live in
one place, some in another — the pool draws from one cursor and dispatches per
identity, so the concurrency cap stays global. A per-store pool multiplies the
cap by the number of stores, which is how a "bounded" fan-out quietly stops
being bounded.

## Prohibitions

1. No unbounded parallel dispatch of a batch.
2. No worker that lets a rejection escape.
3. No result array shorter than its input.
4. No index used as identity beyond the call that produced it.
5. No pool over order-dependent writes.
6. No per-store pools that lift the global concurrency cap.
