---
layer: technique
type: technique
subject: quality-gates
technique: gate-the-line-move
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a check must hold however the protected branch moves, a rebase or fast-forward or plumbing update lands without running commit hooks, an orchestrator moves the branch with a low-level reference update, deciding whether a commit hook or a reference-transaction hook owns a rule, considering a whole-tree gate at the point where a ref moves]
---

# Gate the line's move

A commit-stage hook sees commits. A shared line moves by other routes: fast-forward,
rebase replay, cherry-pick, reset, forced branch update, fetch into the branch, a
plumbing reference update, and a commit that took the skip flag. None of those is a
commit-stage event for that hook, so a rule placed there holds only over the route the
author happened to take
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The one event every route shares is the reference update. Where the version-control tool
offers a hook on reference transactions (git calls it `reference-transaction`), a check
that must not be missed belongs in its prepared state: the references are locked, the
value has not changed, and a non-zero exit aborts the move.

The difference is measured. On a scratch repository, one hook each, a commit-stage hook
refused 1 of 12 routes that move the line. A prepared-state hook refused 11. The twelfth
was the configuration that skips hooks for one command, which moved the line under both.
Moves of another branch passed in every arm.

## What may go there

The hook runs with the reference locked, and it can run many times for one human action.
A cycle of one commit and one other update spawned it about ten times, across its states,
and a shell hook that did nothing added 1.7 seconds per cycle on a platform with slow
process start. So:

- **Filter first and exit.** Most invocations are other references or other states. Read
  all of standard input, act only in the prepared state on the protected reference, and
  spawn nothing else unless the move's diff touches what the rule protects.
- **Cheap checks only.** A property of the two object names and the diff between them
  fits. A test suite does not. Verification stays with whatever prepares the move.
- **Refuse when the check cannot run.** A hook that could not compute its answer aborts
  the move and says why. Passing on an internal error makes it a gate that reports its
  own absence as success
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## What the refusal costs the mover

A refusal does not read like a gate failure from outside. Three consequences:

- **A mover that retries on contention reads it as contention.** A compare-and-swap loop
  sees a failed update and retries, then reports exhausted retries with the real cause
  only in a log. Classify the refusal in the mover, or it reports the wrong cause.
- **A refused rebase is left half done.** Replay completes, the final update is refused,
  and the checkout sits on a detached head with the rebase still in progress. An
  unattended mover has to know this state and abort it.
- **It also refuses rewinds.** A filter on the protected reference refuses a reset as
  readily as a push forward, so a person repairing the line needs the documented skip,
  which is why the hook stays a guard against mistakes and not against adversaries. The
  backstop for those stays at the server, as
  [hook-hygiene](./hook-hygiene.md) already requires of every local hook.

## Where it does not fit

**Do not put a whole-tree gate here in a checkout shared by concurrent writers.** Such a
gate judges the working tree, not the tree being landed. In a probe, a sibling's unfinished
file made the hook refuse an unrelated single-file commit: the commit failed, the line did
not move, and the staged change stayed staged. The rule fits a shared checkout only when
it reads the two object names and nothing on disk. A whole-tree verdict can move here once
the tree being landed can be gated alone, in its own detached tree.

For the same reason the discriminator is not the size of the team. Ask what the check
reads: **if it reads the move, it can live on the move; if it reads the disk, it certifies
whatever is on the disk.**
