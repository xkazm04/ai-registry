---
layer: application
type: application
subject: audit-logging
technique: best-effort-with-accounting
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# A git mirror of agent mail that never fails a send and counts its drops (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents
(version 0.3.39, commit `3821104cce477cefb1eccf5592b76da9c45b1582`). Its
toolchain file pins a nightly that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** A send commits the message and its recipient rows in one database
transaction, and that is the delivery. The human-readable git archive is written
afterwards, off the request path: through a write-behind queue or, when the
queue refuses, a journaled retry backlog with an attempt cap and a dead-letter
ledger. On overflow or a failed journal write the op is dropped and counted.

**forces.** A git commit cannot roll back, an inline archive write coupled
replies to a 17-24 s tail, and archive failure must not stop agents talking.

**buys.** A send never waits on archive I/O.

**rejects.** Synchronous archive writes
(`docs/planning/SYNC_STRATEGY.md:24 "Blocking on archive would make every tool call 100x slower."`).

## What the tree does that the technique asks for

- **The trail never fails the action**
  (`crates/mcp-agent-mail-tools/src/messaging.rs:116 "Failures are logged but never fail the tool call."`).
- **A bounded buffer counts every drop**
  (`crates/mcp-agent-mail-storage/src/lib.rs:1943 "archive retry backlog full; dropping archive op"`),
  and a failing head op is retried with a cap, then dead-lettered
  (`crates/mcp-agent-mail-storage/src/lib.rs:1640 "that fails this many consecutive materializations is considered permanently"`).
- **Crash loss is bounded by a journal**
  (`crates/mcp-agent-mail-storage/src/lib.rs:1623 "reconcile-on-read, unlike reservations, so the journal is the"`),
  and an op queued without one is counted apart
  (`crates/mcp-agent-mail-storage/src/lib.rs:1878 "so a disk that cannot journal is never green"`).
- **Surfaced on the health check**
  (`crates/mcp-agent-mail-storage/src/lib.rs:2483 "Surfaced via"`), with a
  repaired predicate: the lag figure once left out the batch being drained and
  read zero with thousands queued
  (`crates/mcp-agent-mail-storage/src/lib.rs:2617 "reported 0 ms of lag (observed 2026-09-23)."`).

## Where the tree departs

- **The counters share the process's fate.** They are in-memory atomics
  (`crates/mcp-agent-mail-storage/src/lib.rs:1870 "dropped_total: AtomicU64,"`),
  so a restart zeroes them; only the dead-letter ledger is durable.
- **One loss class is uncounted.** Under critical disk pressure the queue
  returns a skip (`crates/mcp-agent-mail-storage/src/lib.rs:1462 "return WbqEnqueueResult::SkippedDiskCritical;"`)
  that the send path only comments on
  (`crates/mcp-agent-mail-tools/src/messaging.rs:49 "Disk pressure guard: archive writes may be disabled"`),
  while the direct-write path counts the same skip
  (`crates/mcp-agent-mail-storage/src/lib.rs:1545 "count the skip but do"`). No
  counter was found on the queue path.
- **The observer is also the recovery source.** The database can be rebuilt from
  the archive (`crates/mcp-agent-mail-db/src/reconstruct.rs:1 "database from the Git archive."`),
  and the contract says that always works
  (`docs/planning/SYNC_STRATEGY.md:12 "DB is always rebuildable from archive if corruption occurs"`).
  A rebuild after a drop loses exactly the dropped messages. The technique's
  contract is written for a trail nobody restores from.
- **Descriptions overstate the mirror**
  (`crates/mcp-agent-mail-tools/src/messaging.rs:2939 "persist canonical and mailbox copies to Git"`;
  `README.md:198 "Every instruction, lease, message, and attachment is in Git"`).
- **History.** The Python predecessor at commit 47b8122e made the archive commit
  a precondition of success: it committed under the archive lock, deleted the
  just-committed rows when the commit failed, and failed the send. That is the
  technique's "record is a participant" exception applied to an observer trail;
  the rewrite names git lock contention as a reason for itself
  (`README.md:255 "Git lock file contention from concurrent writes"`).

## What this realization cannot do

The health figures say how many ops were lost, not which; only dead letters are
named. No gap marker is written into the archive that this read found, so a reader of the git
history alone cannot see its blind windows. A separate module repairs missing
message files
(`crates/mcp-agent-mail-storage/src/recovery/message_reconcile.rs:1 "Repair missing message artifacts from an authoritative message bundle."`);
what feeds it was not traced.

## What the tree's shape says about the technique

The technique ranks harms for a trail that is only read. This tree reads its
trail back as data, so counting every gap stops being enough: a counted gap in
a recovery source is a known loss, not a disclosed blind spot. The tree could
not have been built to prove a complete archive and does not claim one. It
proves the first half of the contract under load, and its own counters show
the second half holds per process lifetime, not per trail.
