---
layer: application
type: application
subject: concurrency-guards
technique: shared-claims-by-announce-and-verify
stack: rust
status: forged
verified_on: 2026-10-14
---

# Reader and writer locks over an object store, and the backend that disagrees (Rust)

Read in the `rtk-ai/grit` tree (crate version 0.4.0, commit
`0f3c9d04abe9525b1884f3a0ade890e54a6d9ffe`), a coordination layer that lets
coding agents claim source symbols for reading or writing, behind one lock
interface with three backends: an embedded database for one machine, and two
object stores with conditional writes for agents on many machines. The tree pins
no compiler version, so no `verified_against` is written. Citations were opened
in a clone on 2026-10-14 and carry checkable quotes.

**decision.** On the object stores, a write lock is the canonical object for the
symbol, taken with a create-if-absent write; each read lock is its own object
under a reader prefix, one per symbol and agent
(`src/db/s3_store.rs:90-97`). A writer reserves, then lists the readers and
backs off if any other agent holds a live one; a reader checks the writer
object, writes its own, then checks the writer object again and backs off if a
writer slipped in (`src/db/s3_store.rs:214 "The reserve-then-verify ordering guarantees"`).

**forces.** Agents on different machines share nothing but the bucket, the
bucket has no multi-object transactions, and readers must coexist.

**buys.** No writer is ever granted beside a live reader, without a server.

**rejects.** One object per symbol, which the tree used first: a second reader
was granted without anything being written, so its lock was untracked and
invisible to writers (commit `59f349be`).

## How it measures against the technique

- **Two keyspaces, announce then verify.** Present on both object stores; the
  second store mirrors the first (`src/db/azure_store.rs:154`). The commit that
  introduced it reports a burst of eight readers and eight writers against a
  self-hosted object store ending readers-only, never a writer beside a reader;
  the second store was verified by review only.
- **The store property is not stated.** Nothing in the tree names the read-after
  write and list consistency the writer's verification depends on. The fallback
  path for stores without conditional writes sleeps 50 milliseconds before
  re-reading (`src/db/s3_store.rs:416 "to let the write propagate"`), which is
  the property assumed rather than asserted.
- **Upgrade, on the object stores, counts every other reader**: the writer's
  verification excludes only the requester's own reader object. **On the
  embedded database it does not**: a requester that already holds any row on the
  symbol has that row's mode updated in place
  (`src/db/sqlite_store.rs:99 "existing.iter().any(|(a, _, _)| a == agent_id)"`).
  Replayed statement for statement against an embedded database on 2026-10-14,
  after a positive control (A exclusive then B exclusive: B blocked), the
  sequence A shared, B shared, A exclusive granted A and left
  `[(A, write), (B, read)]`. One interface, two meanings, and the tree's tests
  cover only the embedded backend.
- **Reclaim is not conditional.** An expired write lock is deleted by name and the
  create retried (`src/db/s3_store.rs:188-190`); the read path does the same to
  an expired writer. Two agents that judged one expired lock can each delete the
  other's fresh one.
- **Refresh re-reads.** The heartbeat re-fetches each lock and rewrites only one
  that still exists and is still owned (`src/db/s3_store.rs:613 "match self.get_at(&key)?"`),
  a fix for a heartbeat that resurrected released locks.
- **Errors fail closed, on one store.** Only 412 counts as "exists" and only 501
  or a 400 with a not-implemented code counts as "conditions unsupported";
  everything else propagates
  (`src/db/s3_store.rs:389 "refusing to fall back to non-atomic locking"`). The
  first version's catch-all arm had turned throttling into last-writer-wins. The
  other store still classifies by searching the error's text for a status number
  (`src/db/azure_store.rs:114 "BlobNotFound"`), a gap its own fix release defers.

## What this realization cannot do

It cannot detect a store whose listing lags its writes, and it cannot keep two
backends honest about one interface: there is no suite that runs the same
sequences against all three.
