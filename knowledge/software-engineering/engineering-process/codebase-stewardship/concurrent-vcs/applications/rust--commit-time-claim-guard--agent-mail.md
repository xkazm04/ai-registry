---
layer: application
type: application
subject: concurrent-vcs
technique: commit-time-claim-guard
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# A commit hook that enforces another agent's exclusive lease (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents that
share one checkout (version 0.3.39, commit
`3821104cce477cefb1eccf5592b76da9c45b1582`). Its toolchain file pins a nightly
that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** A hook in the code repository checks staged paths at commit, and a
bounded scan of pushed paths at push, against the lease files in the mail
archive, never the database. It refuses a path under another agent's live
exclusive lease. Shared leases, the committer's own and the task tracker's
directory never refuse.

**forces.** Agents edit files directly, so only the commit is a step every
change passes.

**buys.** A commit into another agent's exclusive path is refused, with a warn
mode and a bypass.

**rejects.** A worktree per agent, and hard locks.

## What the tree does that the technique asks for

- **The copy it reads is written durably and narrowly before the grant returns**
  (`crates/mcp-agent-mail-tools/src/reservations.rs:285 "artifact is written synchronously on this thread (GH#178)"`),
  healed on access
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1864 "F1 reconcile-on-read: before granting, heal any"`)
  and generation-stamped
  (`crates/mcp-agent-mail-guard/src/lib.rs:2504 "after a mailbox rebuild the archive can hold two"`).
- **On by default; only an explicit false switches it off**
  (`crates/mcp-agent-mail-guard/src/lib.rs:2104 "Only an explicit false value disables the guard"`).
- **Absent warns, unreadable refuses, truncated refuses.**
  (`crates/mcp-agent-mail-guard/src/lib.rs:1378 "nothing to guard, allowing"`;
  `crates/mcp-agent-mail-guard/src/lib.rs:1392 "Real reservation data exists but cannot be read: stay fail-closed,"`;
  `crates/mcp-agent-mail-guard/src/lib.rs:1786 "was NOT checked against active file reservations"`.)
  An uncompilable pattern counts as a conflict
  (`crates/mcp-agent-mail-guard/src/lib.rs:1648 "CPython 3.14 fnmatch change caused"`).
- **The bypass is evaluated first**
  (`crates/mcp-agent-mail-guard/src/lib.rs:1732 "GH#224: the bypass/enforcement toggles must be honored before any"`);
  **an inferred identity is checked live**
  (`crates/mcp-agent-mail-guard/src/lib.rs:2146 "the pane lookup runs the identity liveness predicate."`);
  **machine-wide installs are refused**
  (`crates/mcp-agent-mail-guard/src/lib.rs:213 "machine-wide levels (global/system/XDG) are refused unless explicitly"`).
- **The co-written file is not path-guarded.** The task tracker's directory is
  exempt (`crates/mcp-agent-mail-guard/src/lib.rs:15 "const DEFAULT_EXEMPT_PATH_PREFIXES"`).

## Where the tree departs

- **The lease rule is the only rule.** Nothing compares a commit with what the
  committing agent wrote, so the guard sees only collisions someone declared,
  and the exempt tracker directory gets no content-level check in its place.
- **Two matchers.** The grant uses an overlap index
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1914 "Exact paths now use exact/ancestor/descendant lookups"`),
  the hook a glob set with a literal fallback added after they disagreed
  (`crates/mcp-agent-mail-guard/src/lib.rs:2408 "the pattern, read literally, is the path or"`;
  `CHANGELOG.md:312 "Bracketed file names block commits."`).
- **A record it cannot read is skipped silently**
  (`crates/mcp-agent-mail-guard/src/lib.rs:1407-1412 "except Exception:"`),
  a record with no expiry reads as expired
  (`crates/mcp-agent-mail-guard/src/lib.rs:1297-1299 "if value is None:"`), and
  one not marked exactly exclusive is ignored
  (`crates/mcp-agent-mail-guard/src/lib.rs:1440 "is not True:"`). The directory
  fails closed; a record fails open without a word.
- **Identity, twice.** The native check refuses a missing identity only when a
  path is covered; the installed hook is stricter
  (`crates/mcp-agent-mail-guard/src/lib.rs:2217 "The installed hook stays stricter and fails closed whenever any"`).
- **A proven slug collision allows**, although the resolver's note says it must not
  (`crates/mcp-agent-mail-guard/src/lib.rs:1150 "the guard must stay fail-closed, GH#224 note"`).
- **History.** The Python predecessor at commit 47b8122e ran its guard only when
  worktree or identity flags were set, failed open when the lease directory or
  the staged-path listing could not be read, and read a missing exclusive flag
  as exclusive and a missing expiry as active. The rewrite closed the whole-store
  failures and opened the per-record ones.

## What this realization cannot do

It cannot stop an edit, only its commit; a holder whose lease lapsed mid-edit
learns of it when a new holder's lease refuses its commit. Any agent can skip
the hook (`README.md:1905 "Agents can bypass the pre-commit guard with"`).

## What the tree's shape says about the technique

The guard ships on by default, and nothing found in the tree replays it
over recorded history, so the tree cannot report a clean-commit refusal rate.
Its record shows the asymmetry the replay rule exists for. The over-refusals (a
bypass ignored behind a missing identity, a hook installed for every repository
on the machine) announced themselves by blocking someone. The under-refusals (bracketed names, an unreadable storage root, a storage root set
in a config file (`CHANGELOG.md:315 "The hook read it from the commit shell only"`),
a pattern that stopped compiling) were found afterwards, because a guard that
wrongly allows emits nothing.
