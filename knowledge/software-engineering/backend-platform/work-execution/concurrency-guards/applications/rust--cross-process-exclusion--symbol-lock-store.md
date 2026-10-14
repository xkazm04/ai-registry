---
layer: application
type: application
subject: concurrency-guards
technique: cross-process-exclusion
stack: rust
status: forged
verified_on: 2026-10-14
---

# A lock store for agent processes, read for its dead-holder and fail-direction answers (Rust)

Read in the `rtk-ai/grit` tree (crate version 0.4.0, commit
`0f3c9d04abe9525b1884f3a0ade890e54a6d9ffe`), a command-line tool whose every
invocation is a separate process: agents call `claim`, `heartbeat` and `done`,
and each call opens the lock store, acts and exits. The tree pins no compiler
version, so no `verified_against` is written. Citations were opened in a clone on
2026-10-14 and carry checkable quotes. Its sibling applications in this bundle
cover the claim unit, the merge door and the shared lock mode; this one reads the
store against the technique's decision rules.

## An in-process guard was scenery, and the test shared it

The embedded-database store wraps its connection in a mutex, which makes the
store safe to share between threads and says nothing about processes. Its claim
used to read the symbol's locks and then insert, with no enclosing transaction,
so two agent processes could both read "free" and both insert. The fix takes the
database's write lock before the read
(`src/db/sqlite_store.rs:68 "TransactionBehavior::Immediate"`).

The instructive part is the test history. The original concurrency test spawned
ten threads that share one store (`src/db/sqlite_store.rs:416 "let store = Arc::new(store);"`):
the mutex serializes them, so it passes with or without the transaction and could
never have caught the defect. The regression test opens a store per thread, a
separate connection exactly like a separate process
(`src/db/sqlite_store.rs:452 "fn test_concurrent_access_separate_connections"`),
and the fix's commit reports that it granted the lock to 16 of 16 agents before
the fix and to exactly one after. That is the technique's first rule, "name the
duplicate's origin", applied to the test as well as to the code: a test whose
contenders share the guard under test is scenery too.

## Dead holders and takeover

- **Leases with a heartbeat** on all three backends; expired rows are deleted
  inside the claim's transaction on the embedded store.
- **The merge lock reclaims on the holder, not the clock.** A live holder is never
  treated as stale; age is the fallback only when liveness cannot be determined
  (`src/git/mod.rs:300 "A live holder is NEVER treated as stale"`). Liveness is
  probed by spawning a `kill` program (`src/git/mod.rs:312 "kill"`), so on a host
  without one every holder's liveness is unknown and the 30-second age rule the
  fix retired applies again.
- **Takeover is not replace-if-unchanged on the object stores.** An expired
  holder's object is deleted by name and the conditional create retried
  (`src/db/s3_store.rs:188-190`); a second contender that judged the same
  expired holder can delete the first one's fresh lock. The registry's own
  coordination board had the same gap, found by reading this tree, and its
  Node application in this path records the measured fix.

## Fail direction, chosen in one place and not in another

- **Chosen, written, closed** for the conditional write on one object store:
  only an explicit "exists" or "unsupported" code is read as such, everything
  else propagates
  (`src/db/s3_store.rs:389 "refusing to fall back to non-atomic locking"`).
- **Open and silent for the authority itself.** A malformed configuration file is
  logged as a warning and replaced by the default
  (`src/config.rs:39 "is malformed"`), and the default backend is the local
  embedded store. An agent whose configuration names a shared bucket, and whose
  file has one stray comma, coordinates against a private database nobody else
  reads: every claim succeeds and excludes no one. The absent case (no file, use
  the local store) and the malformed case (a file that says something else) are
  the two conditions this repository's resilience path tells apart.
- **Shared state on a substrate only one participant sees.** Whatever backend
  holds the locks, the queue, the symbol index and the availability query stay
  in the local embedded store. Queued claims are written there
  (`src/cli/mod.rs:581 "db.enqueue(s, agent, intent, mode)?;"`), so agents on
  other machines never see them, and `assign` picks a "free" symbol from local
  availability (`src/cli/mod.rs:1232 "let available = db.available_symbols_in_files(&files)?;"`),
  which under a cloud backend contains no locks at all: it always offers the
  first symbol of the file, and while that one is held, every retry offers it
  again.

## What this realization cannot do

It cannot tell a stalled holder from a dead one on a host without its liveness
probe, and it cannot refuse to run when it does not know which store is the
authority.
