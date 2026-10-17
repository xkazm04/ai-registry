---
layer: application
type: application
subject: concurrent-vcs
technique: sub-file-claim-scope
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# A path lease that grants what is free and refuses the rest (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents that
share one checkout (version 0.3.39, commit
`3821104cce477cefb1eccf5592b76da9c45b1582`). Its toolchain file pins a nightly
that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** A lease names a whole project-relative path or glob. One call
grants every requested path no other agent holds in a conflicting mode and
returns the rest as conflicts, with holders and expiries, in the same reply. It
never waits or queues. The grant is re-checked inside one write transaction; if
that re-check finds a conflict the pre-check missed, the whole batch rolls back.

**forces.** Agents die mid-task, so a waiting acquire ties one agent to another's
lifetime. The pre-check reads a pooled snapshot that can be stale.

**buys.** No two agents hold overlapping leases where one is exclusive, and a
keyed retry never widens its original grant.

**rejects.** Units below the file, blocking or queued acquisition, and
all-or-nothing at the tool boundary.

## What the tree does that the technique asks for

- **It stays at path scope, and its own practice is coarser still.** The unit is
  a path or glob (`crates/mcp-agent-mail-tools/src/reservations.rs:1669 "File paths or glob patterns relative to the project workspace"`),
  and the agent instructions the tree ships reserve a whole source glob,
  exclusively, for an hour (`AGENTS.md:917 "ttl_seconds=3600, exclusive=true"`).
- **Containment is real in both directions.** The grant index looks up exact,
  ancestor and descendant paths (`crates/mcp-agent-mail-tools/src/reservations.rs:1914 "Exact paths now use exact/ancestor/descendant lookups"`).
- **A blocking claim is a lease.** Every lease carries a clamped time to live
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1698 "t.clamp(60, 31_536_000)"`),
  and over-broad patterns are refused, not warned
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1743 "Previously these were warn-only, but overly-broad patterns like"`).
- **Failure is spelled apart from refusal.** When the lease read itself fails,
  the reply names the cause and the paths not to edit
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1855 "reservation-acquire envelope that names the cause and the do-not-edit set"`).

## Where the tree departs

- **Partial on one path, empty on the other.** The pre-check grants the clean
  paths (`crates/mcp-agent-mail-tools/src/reservations.rs:1963 "paths_to_grant.push(path);"`),
  while a conflict caught only by the in-transaction check rolls the batch back
  and returns nothing (`crates/mcp-agent-mail-tools/src/reservations.rs:2190 "no paths: a peer releasing its lease now must not"`).
  One call's outcome depends on which detector saw the conflict.
- **Hold-and-wait moves between calls.** Nothing waits inside a call, but an
  agent that keeps its partial grant and asks again for the rest holds while it
  waits, which the technique forbids. The tree says leases do not prevent
  deadlocks (`README.md:243 "they do not prevent deadlocks in the storage"`)
  and gives the job to its coordinator (`README.md:1242 "detects reservation"`).
- **A shared lease is decorative at commit.** The guard skips any record not
  marked exclusive (`crates/mcp-agent-mail-guard/src/lib.rs:1440 "is not True:"`),
  and until 0.3.39 the command-line front end reserved shared by default
  (`CHANGELOG.md:53 "It took a shared lock, which"`).
- **History.** The Python predecessor at commit 47b8122e granted a conflicting
  exclusive lease and only reported the conflict, so two agents could hold one
  path exclusively. The Rust tool's description still carries that wording
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1669 "Conflicts are reported if an overlapping active exclusive reservation exists"`),
  so a client reading the contract cannot tell the semantics changed.

## What this realization cannot do

It cannot let two agents work on different functions of one file. It cannot tell
whether two edits would conflict, only whether two patterns overlap. It records
no count of refused pairs, so it cannot say whether finer units would pay.

## What the tree's shape says about the technique

A path-scope tree cannot prove any of the five sub-file holes, and it does not
try. It shows two adjacent things. The technique's first question, whether the
force is present, is measured nowhere in the tree, yet its own agent
instructions answer it in practice by claiming a whole source tree at once. And
the multi-unit rule has a second sufficient form: one immediate transaction
already serializes writers
(`crates/mcp-agent-mail-db/src/queries.rs:14374 "already serializes writers"`),
so ordered acquisition is unnecessary within a call and hold-and-wait survives
only across calls.
