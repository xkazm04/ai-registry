---
layer: application
type: application
subject: data-access
technique: existence-authority-written-last
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# A lease written to two stores read by two different enforcers (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents that
share one checkout (version 0.3.39, commit
`3821104cce477cefb1eccf5592b76da9c45b1582`). Its toolchain file pins a nightly
that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** A lease mutation commits to the embedded database first. The tool
then writes that lease's JSON file before replying, synced under a temporary
name and renamed into place; the git commit is batched later. If that write
fails, a release file is queued for retry, but an active file is dropped and
left to repair, because a queued active write drained after a newer release
would resurrect a released holder.

**forces.** Competing grants read the database; the commit hook reads the files.
A crash can land between the writes.

**buys.** When a grant returns, the hook can see it, and a retry cannot bring
back a released lease.

**rejects.** Archive-first writes, and queued active files.

## What the tree does that the technique asks for

- **It names the reader that acts on the file alone**
  (`crates/mcp-agent-mail-tools/src/reservations.rs:283 "The pre-commit guard reads the"`),
  and writes that reader's authority last on create, before the reply
  (`crates/mcp-agent-mail-tools/src/reservations.rs:285 "artifact is written synchronously on this thread (GH#178)"`).
- **Stage outside the authority**
  (`crates/mcp-agent-mail-storage/src/lib.rs:8601 "Every artifact is written and synced under a temp name"`).
- **Replace without two live authorities.** Files carry a database-generation
  token (`crates/mcp-agent-mail-tools/src/reservations.rs:443 "Stamp the DB generation token (br-n8qh6)"`).
- **Idempotency first.** Release files are safe to re-emit because ids are never
  reused (`crates/mcp-agent-mail-tools/src/reservations.rs:337 "Terminal release artifacts can never go stale"`);
  active ones are never queued
  (`crates/mcp-agent-mail-tools/src/reservations.rs:352 "leaving the artifact to reconcile-on-read"`).
- **The half-state gets a sweep.** Each grant first heals missing or stale files
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1864 "F1 reconcile-on-read: before granting, heal any"`),
  and a background worker, on unless switched off
  (`crates/mcp-agent-mail-storage/src/recovery/reservation_reconcile.rs:39 "AM_RESERVATION_ARCHIVE_RECONCILE_ENABLED"`),
  recreates missing active files
  (`crates/mcp-agent-mail-storage/src/recovery/active_reservations.rs:1 "without client traffic"`).

## Where the tree departs

- **Two readers, opposite authorities.** The database row is the grant reader's
  authority and goes first; the file is the hook's and goes second. No single
  order hides the half-state from both.
- **For an exclusion record the benign half-state flips.** The technique calls
  "detail present, authority absent" benign because readers skip it. For a
  lease, absence means permission, so the create half-state (row, no file) is a
  false allow at the hook, bounded by the synchronous write and the worker.
- **Delete runs the other way, deliberately.** Release updates the database
  first (`crates/mcp-agent-mail-tools/src/reservations.rs:1081 "fn dispatch_release_archive_write("`),
  so its half-state is a false block. Removing the hook's authority first, as
  the technique says, would have made it a false allow.
- **The safe half waits on traffic.** A released row's stale file is rewritten
  only by the next lease call
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1871 "The released-row half (br-74sxo) rewrites stale-ACTIVE artifacts"`),
  and the release notes record non-convergence without reads
  (`CHANGELOG.md:210 "after a 60-agent swarm run the archive still does not"`).
- **The contract is stale.** It still lists release as database-only
  (`docs/planning/SYNC_STRATEGY.md:40 "release_file_reservations"`).
- **History.** The Python predecessor at commit 47b8122e also wrote the row
  first, but committed the files synchronously under an archive lock and, when
  that failed, deleted the rows it had just committed. That is the technique's
  retraction, held in memory: a crash between the writes left a row with no file
  and nothing to rebuild it, invisible to its hook.

## What this realization cannot do

It cannot close the create window, only bound it, and it cannot repair a
released row's stale file without a client call.

## What the tree's shape says about the technique

The technique assumes one existence authority per record; two enforcers over two
stores break that, and an order can then be safe for at most one reader per
half-state. The tree does not prove the half-states unreachable; its fixtures
seed them directly
(`tests/fixtures/reservation_regression/manifest.json:72 "db_released_archive_active"`).
Its shape shows where the rule for a restricting record holds and where it gives
way. Release can be ordered to over-restrict. Create cannot, because the
database must decide the grant before a file can name a holder, so that
half-state is bounded and swept instead.
