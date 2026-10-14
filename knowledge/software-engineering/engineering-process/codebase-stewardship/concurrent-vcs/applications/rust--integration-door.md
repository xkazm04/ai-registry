---
layer: application
type: application
subject: concurrent-vcs
technique: integration-door
stack: rust
status: forged
verified_on: 2026-10-14
---

# An agent-merge door rebuilt after it lost commits (Rust)

Read in the `rtk-ai/grit` tree (crate version 0.4.0, commit
`0f3c9d04abe9525b1884f3a0ade890e54a6d9ffe`), the same coordination layer as the
`sub-file-claim-scope` application beside this one. The tree pins no compiler
version, so no `verified_against` is written. Citations were opened in a clone on
2026-10-14 and carry checkable quotes.

**decision.** Each agent works in its own linked worktree on its own branch.
`grit done` commits whatever the worktree holds, takes a file lock on the merge,
rebases the branch inside its worktree, merges it into the current branch with a
merge commit, and only after a successful merge removes the worktree and deletes
the branch. Claims are released at the end of `done` whatever happened.

**forces.** The version-control tool cannot merge twice at once in one checkout;
the agents finish in any order; the main checkout is also where a person works.

**buys.** Integrations that cannot interleave, and an agent's commit that
survives a failed merge.

**rejects.** Concurrent merges, and teardown before the merge is confirmed.

## The door's history is the technique's evidence

The door reached its current shape through one fix release, and each fix is a
rule of the technique paid for once:

- **Rebase where the branch lives.** The rebase used to run from the main
  checkout against a branch checked out in the worktree, so it always failed,
  and against a dirty main tree the sequence was reported to flip the main
  repository to bare. It now runs in the worktree
  (`src/git/mod.rs:222 "rebase"`), and a regression test asserts the main
  repository is never left bare (`src/git/mod.rs:611-612`).
- **Verify before teardown.** Teardown used to delete the agent branch
  unconditionally, orphaning the commit whenever a merge was skipped. Branch
  deletion is now a separate call made only after a confirmed merge
  (`src/cli/mod.rs:931-943`).
- **Reclaim the door's lock on the owner, not the clock.** The merge lock used to
  be treated as stale after 30 seconds even when its holder was alive, which let
  a waiter run a second merge beside a long one. It now checks the holder's
  process first and falls back to age only when liveness cannot be determined
  (`src/git/mod.rs:300 "A live holder is NEVER treated as stale"`).

## Where it parts from the technique

- **Dirt is refused wholesale.** Any tracked change in the main checkout refuses
  the integration (`src/git/mod.rs:198 "--untracked-files=no"`). A person editing
  an unrelated file blocks every agent's `done`; the technique refuses only on
  the overlap between the target's dirty paths and the branch's changes.
- **The claim does not outlive a failed integration.** Locks are released after
  every `done`, merged or not (`src/cli/mod.rs:951 "Release locks regardless of merge outcome"`),
  and queued agents are promoted onto the released symbols. Because the claims
  name single functions, the next agent is handed the very function the
  stranded branch changed, and the stranded branch's retry will conflict there.
  The stated reason, avoiding orphaned locks after a crash, is already covered
  by the locks' time to live.
- **Scope is never checked at the door.** The branch's changes are not compared
  with the agent's claims, although a content hash for every symbol is stored at
  index time (`src/db/mod.rs:89 "hash        TEXT"`).
- **The liveness check is platform-bound.** Holder liveness is probed by spawning
  `kill -0` (`src/git/mod.rs:312 "kill"`). Where no such program exists the
  probe cannot run, liveness is unknown, and the 30-second age rule the fix
  retired comes back. The notification module also imports Unix sockets
  unconditionally (`src/room/mod.rs:3 "use std::os::unix::net"`), so the crate
  does not build on the platform where that fallback would bite.

## What this realization cannot do

It cannot integrate past a busy human checkout, and after a failed merge it
leaves the recovery to the operator: the branch and worktree survive, but the
symbols they changed are already someone else's.
