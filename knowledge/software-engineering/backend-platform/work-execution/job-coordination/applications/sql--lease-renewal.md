---
layer: application
type: application
subject: job-coordination
technique: lease-renewal
stack: sql
verified_on: 2026-09-02
verified_against: sql@3.45
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A job lease renewed through the store's own writer, in Tracklight

The runner renews its job lease on a timer thread (`crates/runner/src/serve.rs:30-56`)
at TTL/3 — 40 s against a 120 s TTL (`crates/api/src/jobs.rs:132`) — through
the API's `/v1/jobs/:id/renew`, which runs `renew_job_lease` on the store.
The renewal is a conditioned `UPDATE` (`crates/store-pg/src/jobs.rs:116-125`;
`crates/store/src/sqlite/jobs.rs`), and the store the runner is deployed
against decides which half of the amendment applies.

## The seam, on both store backends

- **The embedded store** has one serialized write connection behind a
  mutex plus a read pool (`crates/store/src/sqlite/mod.rs:99-107`). Every
  write, including the renewal, goes through `with_op(DbOp::JobsWrite, …)`
  (`mod.rs:195-205`), which takes that mutex — so a renewal queues behind
  whatever write is in progress on it. The connection carries a 5 s busy
  timeout (`sqlite/pool.rs:34`).
- **The server store** opens a pool of 5 connections with no acquire
  timeout override (`crates/store-pg/src/lib.rs:63-64`) and the renewal
  takes a connection from that pool like any request.

## A/B, paired, on the embedded store's own parameters

A scratch harness with the tree's numbers — busy timeout 5 s, a held write
transaction of 6 s (longer than the timeout) and of 3 s (shorter) — issued
the renewal `UPDATE` while the long write was open. Arm A: the renewal on
the shared writer connection (the tree). Arm B: the renewal on a dedicated
connection, the "reserve a slot" remedy the source technique proposes.

| Held write | Arm A, shared writer | Arm B, dedicated connection |
| --- | --- | --- |
| 6 s (> busy timeout) | succeeded after 6.01 s | **failed at 5.55 s**, engine lock error |
| 3 s (< busy timeout) | succeeded after 3.01 s | succeeded after 2.87 s |

Verdict: **not-better.** On a single-writer engine the reserved connection
cannot bypass the writer lock, and its busy timeout converts a wait the
shared writer would have survived into a failed renewal. The condition
under which the remedy does not hold — one writer, on every connection —
is now written into the technique, with the bound that does apply here:
the longest write must stay under TTL minus the renewal cadence (80 s for
this tree), which the tree's writes are nowhere near.

## What the tree said about the technique

Two structural facts, one on each side of the amendment. The runner's
renewal thread already treats a failed renewal as "retry, not lost"
(`serve.rs:50-53`) and would need the pool to stay saturated for three
consecutive 40 s ticks before the lease lapsed — the TTL/3 headroom the
technique prescribes is what makes the embedded-store result survivable at
all. And the server store's pool of 5 with no reserved slot is the
multi-writer half of the amendment, unmeasured here: five concurrent
result-ingest transactions would hold the renewal for the length of the
longest one, and the fix is the source's one line — cap work transactions
at four.

## What this realization cannot do

The measurement is of the engine's writer semantics under the tree's
parameters, not of the tree's binary under load; a renewal timing from a
live run would need the store's own `WriteLockWait` meter
(`mod.rs:198-199`), which exists and is the instrument for the next pass.
The server-store half is a prediction, not a measurement.
