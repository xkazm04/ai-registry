---
layer: technique
type: technique
subject: concurrent-vcs
technique: integration-door
status: forged
laws: [one-validation-door, creation-names-reaper, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [several isolated branches merge back into one shared line, deciding when a session's worktree branch and claim may be released, a merge-back failed and the work must stay recoverable, siblings have uncommitted work in the checkout a branch is being integrated into, deciding where a pre-integration rebase must run, checking a session's changes against the scope it declared, a held branch's paths are free for a new session to claim]
---

# The integration door

[Physical isolation](./physical-isolation.md) removes collisions while sessions
work, and it says two things about the end of the work: the branch is merged
back when done, and the worktree is removed once the merge is confirmed in the
target's history. Between those two sentences sits the one stage every isolated
session passes through, and it is where the failures this subject exists to
prevent come back: many branches converging on one line, a target checkout that
siblings are editing while it is being merged into, and a teardown that destroys
the only copy of the work if it runs one step early. This technique owns that
stage.

The door is worth designing on purpose because it is the only point in the
whole protocol that every change is guaranteed to cross. A ledger read at
startup can be skipped; a claim can be made too narrowly; isolation can be
bypassed by a session that edits the shared checkout directly. Nothing reaches
the shared line except through the door, so the door is where a check that must
not be skippable belongs ([one validation
door](../../../../_laws.md#one-validation-door)).

## One door per line, serialized

Integrations into one line run one at a time. The version-control tool will not
run two merges in one checkout, and two integrators that each rebase onto the
same tip produce two results of which one is stale the moment the other lands.
Serialize them with an exclusive lock on the door, and decide that lock's
reclaim by a judgement about its holder, never by elapsed time while the holder
is demonstrably alive: a large merge legitimately runs for minutes, and a lock
reclaimed on age alone hands it to a waiter while the first merge is still
writing. Two independent systems paid for that rule, one with a merge lock and
one with a commit lock (see the concurrency-guards path's
[cross-process exclusion](../../../../backend-platform/work-execution/concurrency-guards/techniques/cross-process-exclusion.md)
for the reclaim and takeover rules, which apply to this lock unchanged).

## Read the claim from the record, not from the report

What a session says it changed is a claim. The door reads the branch's commits
and changed paths from the version-control record, and runs the project's own
gates in the branch's worktree; the session's summary is evidence of nothing. A
mature door in this registry's fleet states it in its first line: the builder's
result file is a claim and is never trusted; commits come from the record and the
verdict from the gates.

## Rebase where the branch lives

A branch checked out in a linked worktree cannot be rebased from the main
checkout: the attempt fails because the branch is in use elsewhere. In the
repository this technique was drawn from, the integrator ran the rebase from the
main checkout, so it always failed; it then fell through to a direct merge, and
against a dirty main tree that sequence was reported to flip the main
repository's configuration to "bare" - the parent checkout stopped being a
working tree.
Run the pre-integration rebase inside the branch's own worktree. When it
conflicts, abort it there, confirm the abort restored the worktree, and report
the conflict as the outcome; never fall through to a different integration
method without saying so.

## The target's dirt is judged by overlap

A shared target checkout is never clean, because siblings are always mid-edit.
The source refused to integrate whenever the target had any tracked change,
which in a shared checkout means it refuses most of the time and teaches its
operators to clear other sessions' work to get a merge through, the one move
[never-lose-work rules](./never-lose-work-rules.md) ban outright. The dirt that
matters is the dirt the integration can corrupt or sweep: the target's dirty
paths that intersect the branch's changed paths. Refuse on that intersection,
name the paths, and integrate past everything else. A fleet door that works this
way refuses only on intersection and then fast-forwards, so the shared checkout
is touched by exactly one operation.

## Verify, then tear down, in that order

Integrate, then verify that the target's head contains the branch tip (an
ancestry test, or head equal to tip after a fast-forward), and only then remove
the worktree, delete the branch and release the claim. Each of those three is a
reaper ([creation names its reaper](../../../../_laws.md#creation-names-reaper)),
and a reaper that runs before the verification destroys the work it was meant to
clean up after. In the source, the teardown deleted the agent's branch
unconditionally, so a merge that was skipped or failed orphaned the agent's
commit, recoverable afterwards only by its hash.

## How long the claim lives: past a failed integration, when overlap means conflict

A branch that failed to integrate still owns the regions it changed. Release its
claim and a new session may be handed exactly the text the held branch will
later have to rebase over. The source released every claim at the end of the
finish step "regardless of merge outcome", so that a crashed finish could not
leave claims behind. A lease already covers that case, since a crashed holder's
claim expires; releasing on failure trades a visible, expiring claim for a
collision nobody sees until the held branch is retried.

How much that trade costs depends on the claim unit, and it was measured. A
fleet loop whose held runs keep their branch and worktree, but whose dispatcher
stops counting a held run's declared paths as occupied, recorded 1,167 runs in
eight days; 67 non-review runs were held at some point, and across all of them
exactly two new dispatches overlapped a held run's declared paths, both on one
held run. One of the two merged first; the held run was later rebased over it
inside its worktree and merged cleanly. The other was released. Zero conflicts.
Its claims name directories, so overlapping claims rarely mean the same lines,
and the in-worktree rebase absorbed the one real overlap.

So the rule is conditional on granularity. Where the claim unit is fine enough
that overlap predicts conflict - the [sub-file
claims](./sub-file-claim-scope.md) case, where overlap means the same function -
keep the claim through a failed integration until the branch is integrated or
explicitly abandoned. Where claims are coarse paths, releasing them on hold costs
little; keep the held branch's paths visible in the dispatcher's view so an
overlap is at least a choice.

## Check the change against its declared scope here

The door is where declared scope can be compared with actual change, because it
holds both: the claim, and the changed paths or units read from the record.
Protected boundaries hold the integration; edits outside the declared scope are
recorded for whoever dispatches next rather than blocking, since a refactor
legitimately touches a neighbour. The source computed a content hash for every
claimable unit at index time and stored it beside the unit, and nothing ever
compared it at integration: the evidence that would have caught a session
editing outside its claim existed and was never consulted.

## Outcomes are spelled apart

Merged, held, failed and released are four outcomes, each with its own record:
a held integration names its reason and keeps its branch and worktree, and a
failure names whether the target was left mid-merge. A finish step that reports
success after a skipped merge is this subject's canonical failure moved one stage
later ([failure is not empty
success](../../../../_laws.md#failure-not-empty-success)); the readback in
[commit verification](./commit-verification.md) applies to the door's own
integration commit as to any other.

## Decision rules

- Integrations into one line go through one serialized door; its lock is
  reclaimed on a judgement about the holder, never on age while the holder is
  alive.
- Read commits and changed paths from the record, and run the gates in the
  branch's worktree; the session's report is a claim.
- Rebase inside the branch's own worktree; on conflict abort there, confirm the
  abort, and report.
- Refuse on the intersection of the target's dirty paths with the branch's
  changed paths, never on any dirt.
- Verify the target contains the branch tip before removing the worktree,
  deleting the branch, or releasing the claim.
- Keep a failed integration's claim while overlap at your claim unit predicts
  conflict; at coarse path scope, release it but keep the held paths visible.
- Compare the change with the declared scope at the door: boundaries hold,
  out-of-scope edits are recorded.
- Spell merged, held, failed and released differently, each with its reason.
