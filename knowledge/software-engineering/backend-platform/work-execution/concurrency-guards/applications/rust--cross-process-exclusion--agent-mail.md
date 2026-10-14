---
layer: application
type: application
subject: concurrency-guards
technique: cross-process-exclusion
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# A per-repository git lock on a private sentinel file (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents, which
runs git against its mail archive and the agents' repositories (version 0.3.39,
commit `3821104cce477cefb1eccf5592b76da9c45b1582`). Its toolchain file pins a
nightly that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** Every git command the server shells out to takes an in-process
mutex keyed by canonical repository path, then an OS file lock on a sentinel of
its own in that repository's admin directory (a linked worktree's own), in that
order, released in reverse. Waits and the child share one bounded budget;
same-thread re-entry panics; a read-only admin directory or a network
filesystem degrades with one warning.

**forces.** A git release corrupted repositories when processes read the index
while one rewrote it, under ordinary multi-agent load
(`docs/GIT_251_FINDINGS.md:20 "The bug corrupts user repos in the process"`).
Different projects' archives must still commit in parallel.

**buys.** No two cooperating threads or processes run git on one repository at
once, and a stuck peer yields a timeout, not a hang.

**rejects.** One global mutex
(`docs/DESIGN_git_lock.md:242 "Rejected: destroys cross-repo parallelism, which the mailbox"`),
and git's own lock file as the sentinel
(`docs/DESIGN_git_lock.md:110 "A dedicated mcp-agent-mail-only sentinel is correct."`).

## What the tree does that the technique asks for

- **It names the duplicate's origin**, a second server or a wrapped git in
  another shell (`docs/DESIGN_git_lock.md:26 "a wrapper-script git in another shell"`),
  and scopes each layer by who it sees
  (`docs/DESIGN_git_lock.md:117 "All processes that take the SAME sentinel"`).
- **The dead holder is answered by the kernel**
  (`docs/DESIGN_git_lock.md:221 "Process crash: kernel auto-releases fcntl locks at close time."`),
  so no staleness bound or takeover is needed.
- **Fixed order**
  (`crates/mcp-agent-mail-core/src/git_lock.rs:13 "Acquisition order: mutex first, flock second. Release reverses."`).
- **Fail direction per case.** A read-only admin directory fails open, loudly
  (`docs/DESIGN_git_lock.md:200 "Decision: WARN once per repo per process"`); a
  network filesystem keeps the lock
  (`docs/DESIGN_git_lock.md:212 "Does NOT disable flock on NFS"`).
- **The advisory gap is written down**
  (`docs/DESIGN_git_lock.md:36 "is NOT protected by this lock"`;
  `docs/DESIGN_git_lock.md:40 "Documenting this gap explicitly prevents false confidence."`).

## Where the tree departs

- **The archive's own commits use a different guard.** The commit worker writes
  through an in-process git library under a per-repository compare-and-swap
  flag (`crates/mcp-agent-mail-storage/src/lib.rs:4744 "only one worker thread may process this repo"`),
  which the lock module excludes
  (`crates/mcp-agent-mail-core/src/git_lock.rs:31 "they don't overlap because the coalescer does libgit2 writes"`).
  Two server processes committing one archive meet only at git's index lock and
  a jittered retry
  (`crates/mcp-agent-mail-storage/src/lib.rs:6655 "Commit with retry and jittered backoff for index.lock contention."`).
  The exclusion is scoped to the faulty binary, not to the repository.
- **A live, wedged holder is never displaced.** Contenders fail at the budget
  and the holder's child is killed at its own: fail-closed, which suits the
  corruption the lock exists to prevent.
- **Design and code disagree on budgets.** The design leaves the mutex untimed
  and adds the flock and child ceilings
  (`docs/DESIGN_git_lock.md:164 "Total worst-case before a caller sees an error"`);
  the code charges everything to one budget
  (`crates/mcp-agent-mail-core/src/git_cmd.rs:31 "The configured timeout is one invocation budget."`).
  The design's reviewer field is empty
  (`docs/DESIGN_git_lock.md:361 "Design note reviewed by: (to be populated via agent-mail thread)"`)
  while the lock ships (`crates/mcp-agent-mail-core/src/git_cmd.rs:6 "(B2, per-repo mutex)"`).
- **History.** The Python predecessor at commit 47b8122e held a per-project
  archive lock across a synchronous git commit on every send and grant, and
  turned index-lock contention into a failed call after bounded backoff and one
  stale-lock cleanup. The rewrite names that contention as a reason for itself
  (`README.md:255 "Git lock file contention from concurrent writes"`).

## What this realization cannot do

It cannot coordinate with any git that skips its sentinel: an editor, a shell,
another host. There its defence is a pinned working binary and crash retries.

## What the tree's shape says about the technique

The lock exists because a host tool had a bug that cannot be summoned on demand,
so the tree could not have been built to prove the lock prevents the
corruption. What its shape proves is the technique's advisory clause written out
as a table: the design names, layer by layer, which participants each lock sees
and which it does not, and the lock module's header repeats the exclusions.
Cross-process exclusion is exactly as wide as its participant list, and the
list can be kept beside the code.
