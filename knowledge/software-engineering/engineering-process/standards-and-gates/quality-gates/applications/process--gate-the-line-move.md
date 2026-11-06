---
layer: application
type: application
subject: quality-gates
technique: gate-the-line-move
stack: process
status: forged
verified_on: 2026-11-06
counterpart: external
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: which routes move a branch past each kind of hook

An unattended software factory lands by having one worker verify a request and then move
the branch with a plumbing update, which runs no commit hooks. Its authors put a final
audit on the reference transaction, because every route to the main branch ends in that
move. Their hook is a filter for a few ratchet files, runs no tests, and refuses when it
cannot compare. A refusal surfaces in their worker as exhausted compare-and-swap retries,
which their own comments flag as a misclassification still to fix. That design is recorded
here in our words. The source's licence is AGPL, and no part of its code is reproduced;
the hook below was written for this probe.

The source's own claim was tested, because a miner's throwaway probe was the only evidence
and it had not tried rebase or measured cost.

## The run

git 2.56.0, Windows, Git Bash, a scratch repository rebuilt for each route. Arm A: a
`pre-commit` that refuses on the main branch. Arm B: a `reference-transaction` that drains
standard input and refuses in `prepared` when the main reference is in the transaction.
Declared before running. Target: routes that move main past the check. Floor: a commit on
another branch moves in every arm.

| Route | No hook | A: commit stage | B: ref move |
|---|---|---|---|
| plain commit | moved | **refused** | **refused** (128) |
| commit with skip flag | moved | moved | **refused** |
| amend with skip flag | moved | moved | **refused** |
| fast-forward merge | moved | moved | **refused** |
| merge commit with skip flag | moved | moved | **refused** |
| rebase | moved | moved | **refused**, left detached, rebase in progress |
| cherry-pick | moved | moved | **refused** |
| hard reset | moved | moved | **refused** |
| plumbing update | moved | moved | **refused** |
| forced branch update | moved | moved | **refused** |
| fetch into the branch | moved | moved | **refused** |
| plumbing update with hooks path overridden | moved | moved | moved |
| floor: commit on another branch | passed | passed | passed |

A moved main on 11 of 12, B on 1 of 12. The floor held. The tool's own documentation states
that the hook runs for any command performing reference updates, and that only the
`preparing` and `prepared` states can abort. It names no specific commands, so the table is
what covers them.

Cost: 20 cycles of one no-op plumbing update plus one commit, 381 ms a cycle with no hook,
2,088 ms with a hook that only logged and drained. The log held 60 each of `preparing`,
`prepared` and `committed`, and 20 of `aborted`, so about ten spawns a cycle. That figure is
shell process start on this platform and will differ elsewhere.

Whole-tree form: a hook that refuses while a named sibling file exists, then a one-file
commit of something else. The commit returned 128, the branch did not move, and the file
stayed staged.

## Reading

The target moved and the floor held on a toy repository. That shows the mechanism and says
nothing about a project being better off, so the verdict is `unmeasurable`. The instrument
that would measure it: a project's own filtered hook with a seeded bad move on each route,
read through its real mover.

Seams read and not changed. One managed project has commit and push hooks with a skip
variable, and no reference hook. Another has no active hooks and relies on its check
command by rule, and it is near a deadline, so it is a poor place to experiment. This
registry has only post-stage hooks. Its full gate reads the whole shared tree unless a lander goes
through the commit door, which gates a pinned tree before moving the line and fires no hook.
