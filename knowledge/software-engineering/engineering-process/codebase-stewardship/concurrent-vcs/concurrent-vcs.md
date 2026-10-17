---
layer: golden-path
type: golden-path
subject: concurrent-vcs
status: forged
techniques:
  - intent-ledgers
  - physical-isolation
  - isolated-index-commits
  - commit-verification
  - never-lose-work-rules
  - shared-resource-arbitration
  - sub-file-claim-scope
  - integration-door
  - commit-time-claim-guard
---

# Concurrent-workspace version control

One repository checkout. Several sessions working in it at once — autonomous
agents, human editors, scheduled jobs — most of them on the same branch, none
of them aware of each other unless something makes them aware. This subject
owns what happens at the version-control layer under that arrangement: how
sessions declare where they intend to work, how they physically avoid each
other, how a commit is built so that a neighbor's simultaneous activity cannot
corrupt it, how corruption is *detected* when it happens anyway, how isolated
work comes back into the shared line, and how the whole arrangement is cleaned
up so it does not silt over time.

The boundary with the sibling subject
[fleet-orchestration](../../../llm-agent/orchestration/fleet-orchestration/fleet-orchestration.md) is
precise and worth holding: the orchestrator's
[parallel-dispatch](../../../llm-agent/orchestration/fleet-orchestration/techniques/parallel-dispatch.md)
technique owns *assignment* — carving work so that sessions' write sets are
disjoint before any session exists. This subject owns the *mechanics that
survive when assignment fails or was never made*: the ledger a session
consults when no orchestrator assigned anything, the isolation that holds even
when two sessions were accidentally pointed at the same files, and the commit
ritual that stays correct when a neighbor is staging and committing at the
same moment. Dispatch-side disjointness is a plan; this subject is the
seatbelt for when the plan meets autonomous drivers.

## Two layers: intent coordination and physical isolation

The first structural fact: **coordination and isolation are different layers,
and neither substitutes for the other.**

**Intent coordination** is a ledger — a shared, versioned registry where every
session that will materially edit the tree records who it is, what it is
doing, and which paths it expects to touch, then records its outcome when it
finishes. The ledger makes collisions *visible before they happen*: a session
that reads the ledger at startup and finds a live entry overlapping its
planned scope can surface the conflict instead of blundering in. But a ledger
is advisory by construction. Sessions crash without deregistering; sessions
underestimate their scope; sessions simply fail to read it. A ledger says who
*intended* to be where. It stops nothing.

**Physical isolation** is a separate working copy — a linked worktree on its
own branch — for any effort that touches more than a trivial surface. Inside
a worktree, a collision with a sibling is not discouraged; it is
*impossible*, because the sibling's files are different files. Isolation is
the only mechanism in this subject that removes a failure mode rather than
detecting or discouraging it.

You need both, because they fail differently. A ledger without isolation is
etiquette: it works until the first session that skips the ritual. Isolation
without a ledger is silent duplication: two sessions in two pristine
worktrees doing the same task, colliding only at merge, having wasted both
efforts. The ledger coordinates *what work exists*; the worktree guarantees
*edits cannot interleave*. The techniques:
[intent-ledgers](./techniques/intent-ledgers.md) and
[physical-isolation](./techniques/physical-isolation.md).

The ledger's unit is a path, declared as coarsely as is honest, and that stays
right while sessions rarely share a file and a person reads the conflicts. A
system that hands many autonomous sessions different functions of one file meets
the opposite force: path claims serialize work the line-level merge would have
combined. Claims below the file buy that back and open five holes the path
scheme never had - name-based identity, containment, the import block no unit
owns, units that do not exist yet, and an index that goes stale with every
merge - and they only pay where refusals for overlap are actually common. When
the reader of a refusal is an autonomous session rather than a person, the claim
also stops being advisory: it blocks, it expires as a lease, and its refusal
names the free alternatives. Both the measurement that decides whether to go
below the file and the price list are
[sub-file-claim-scope](./techniques/sub-file-claim-scope.md).

## The staging index is shared mutable state

The second structural fact, and the one that produces the subtlest failures:
**in a shared checkout, the staging index is a single mutable resource with
no arbitration.** Every session that stages and then commits is performing a
two-step read-modify-write on the same file, and between any session's stage
and its commit, a sibling can stage its own files into the same index, commit
(sweeping both sessions' staged content under one message), or otherwise
rearrange the shared state.

The intuitive defenses do not hold, and the reasons are mechanical, not
disciplinary:

- **Scoping the commit by pathspec does not commit what you staged.** A
  pathspec-limited commit takes the named paths from the *working tree*, not
  from the index. It scopes the file set correctly — and still carries a
  sibling's unstaged edit to a file inside your pathspec, under your message,
  with your name on it. The gate you thought you had (staging) is not the
  thing the act reads
  ([the gate must see its target](../../../_laws.md#gate-sees-target)).
- **Racing faster does not help.** The stage-to-commit window can be made
  small; it cannot be made zero, and autonomous sessions commit often enough
  to find any window.

The defense that holds is structural: **build the commit in a private index.**
A temporary index file, seeded *from the commit you are building on* — never
by copying the shared index, and never assumed fresh across your own
successive commits — receives your scoped adds and produces your commit,
untouched by anything a sibling does to the shared index in the meantime. The
seeding rule matters as much as the isolation: a private index seeded by
*copying* the shared one inherits every staleness the copy contained, and a
stale private index quietly encodes old file states that your commit then
*reverts*. The ritual has a cost on the reading side as well: the shared
index never sees the private commits, so the shared status view reports
committed work as pending in a recognisable shape, and a session that reads
it at face value waits on work that has already landed. The full ritual, its
seeding discipline, committing a composite of a shared file together with the
derived files built from it, and reading a status view the ritual has made
stale are [isolated-index-commits](./techniques/isolated-index-commits.md).

## Verification is the only detection

Third structural fact: **under concurrency, a commit that did not happen
looks exactly like one that did.** The command prints its usual output; hooks
run; the session moves on. Meanwhile the commit no-oped because a sibling's
activity emptied the index, or it happened but swept in twelve of a sibling's
staged files, or it landed on a different head than the one you inspected.
Nothing in the happy-path output distinguishes these from success
([failure must be spelled differently from empty
success](../../../_laws.md#failure-not-empty-success)).

So the standard imposes a readback: **after every commit, read the log and
confirm the newest commit is yours** — your message, your changeset, the file
count you intended. Before the commit, compare the staged count against the
count you meant to stage. And be honest about what pre-commit checks are: any
inspect-then-commit sequence is a time-of-check race; the readback *after* is
the only check that observes the actual outcome. The same discipline extends
to publishing a shared branch: a *rejected* push can mean your work is
already published — carried up by a sibling's push — and the check is an
ancestry test against a freshly fetched remote, never a comparison with a
stale local cache of it. This is
[commit-verification](./techniques/commit-verification.md), and it is not
optional garnish — in a shared checkout it is the *only* mechanism that
detects the failure class at all.

## Integration is a stage, not a clause

Isolation ends with "merged back when done", and that clause hides the one stage
every isolated session passes through: many branches converging on one shared
line, through a target checkout siblings are editing, followed by a teardown
that destroys the only copy of the work if it runs one step early. The stage
deserves its own design because it is the only point in the protocol nothing can
skip - a ledger read can be forgotten, a claim drawn too narrowly, but no change
reaches the shared line except through the integration - so it is where scope is
checked against change, where the rebase runs (inside the branch's own worktree,
never from the main checkout), where the target's dirt is judged by its overlap
with the branch rather than refused wholesale, and where worktree, branch and
claim are released only after the target is verified to contain the work. How
long a claim survives a failed integration depends on the claim's grain: a held
branch's directory-wide claims cost little to release, measured, while a
function-level claim released on failure invites the collision the held branch
will meet on retry. This is
[integration-door](./techniques/integration-door.md).

## Never-lose-work rules are structural, not disciplinary

Rules that depend on every session remembering them protect nothing, because
the population includes sessions that have never read the rules. The
never-lose-work core is therefore phrased as structure — operations that are
simply banned, and habits enforced at ritual boundaries:

- **Never stash work that is not yours.** Stashing sweeps the entire working
  tree — including other sessions' in-flight edits and, with the wrong flag,
  their untracked files — into a hidden state that no other session will
  think to look in. A session that needs a clean stage adds its own paths,
  one by one, and leaves everything else exactly where it sits.
- **Never bulk-stage.** Add-everything staging commits whatever the
  neighbors were doing. Staging is per-path, always, and preceded by
  classifying every dirty entry: mine, pre-existing drift, or a sibling's
  live work.
- **Commit atomically and often.** Uncommitted work is the blast radius of
  every incident in this subject; both canonical loss incidents reduce to
  "too much uncommitted work in flight at once." One task, one commit, never
  more than a modest interval's worth of work unlanded.
- **Recover by amending, not rewinding.** When verification catches a
  mis-attributed or swept commit, the content is almost always *present* and
  merely mislabeled. Amending repairs the label; resetting a shared timeline
  destroys neighbors' landed work to fix yours — a worse collision than the
  original.

The full rule set, with what is recoverable by amend versus what needs the
reference log, is [never-lose-work-rules](./techniques/never-lose-work-rules.md).

One corollary about the rules themselves, paid for in this subject's history:
**a correction to the doctrine must land in the documents sessions actually
read, or it does not exist.** The strongest measured instance: the one commit
technique that survives concurrent sessions was discovered, written down, and
validated across multiple runs — in a per-run calibration log — while the
project-wide instructions went on prescribing the defeated technique in nine
places for months. Documents coordinate the same way sessions do: a fix
recorded off to the side is a fix the fleet never receives.

## Cleanup is part of the protocol

Everything this subject creates must name its reaper
([creation names its reaper](../../../_laws.md#creation-names-reaper)). Worktrees
hold full working copies and go stale the moment their branch merges; the
finish ritual removes the worktree and deletes the merged branch, and a
periodic sweep catches the ones abandoned by crashed sessions — with age,
dirtiness, and merged-status checks so the sweep never destroys live work.
Ledger entries move from active to completed with their outcome recorded.
Temporary indexes are deleted by the ritual that created them. Scratch files
carry session-unique names precisely so their cleanup cannot delete a
sibling's scratch. A shared checkout with no reaping does not fail loudly; it
accretes stale worktrees, phantom ledger entries, and orphaned branches until
no session can tell what is alive.

## Shared resources beyond the tree

The checkout is not the only shared thing. Build directories, dependency
caches, network ports, scratch directories — all are contended by the same
session population, and they follow the same doctrine in miniature: unique
names per session where namespacing is possible
([identity survives reuse](../../../_laws.md#identity-survives-reuse)), arbitration
where it is not, and *evidence of real activity* over lock files when
deciding whether a contended resource is actually in use — a lock outlives
its crashed owner, but activity does not. This is
[shared-resource-arbitration](./techniques/shared-resource-arbitration.md).

## Invariants

- **Every materially-editing session appears in the ledger** — registered at
  start with declared scope, deregistered at end with outcome. An unledgered
  session is invisible to every other session's conflict check.
- **Multi-file work gets a worktree.** The main checkout is for single-file
  touches and coordination artifacts; anything larger works in physical
  isolation. The one exception is the implementer seat of a tree shared on
  purpose, where many writers land small additive changes behind blocking
  leases and a commit-time guard that checks the session's own inventory
  before anyone's claims ([commit-time claim
  guard](./techniques/commit-time-claim-guard.md)), and even there every seat whose output is
  evidence works isolated
  ([physical-isolation](./techniques/physical-isolation.md)).
- **No commit is built through the shared index while siblings are live.**
  Either the session is alone in its worktree, or the commit is built in a
  private index seeded from the head it extends.
- **Every commit is verified by readback.** The newest log entry is yours, or
  recovery starts immediately — while the failure is one commit old and
  amendable.
- **Every branch reaches the shared line through one serialized door**, which
  reads the change from the record, judges the target's dirt by overlap, and
  tears down worktree, branch and claim only after verifying the target contains
  the work.
- **No operation ever moves another session's work** — not into a stash, not
  into a commit, not into the void. Operations that cannot be scoped to your
  own work are banned in shared checkouts.
- **Everything created is reaped** — worktrees, branches, ledger entries,
  temporary indexes, scratch files — by the ritual that created it or by a
  sweep that proves staleness before destroying.

## The techniques

- [intent-ledgers](./techniques/intent-ledgers.md) — the shared registry of
  active sessions: declared scopes, staleness rules, the register/deregister
  ritual, and why it is advisory by design.
- [physical-isolation](./techniques/physical-isolation.md) — worktrees per
  effort: when isolation is mandatory, when a single-file fix may skip it,
  link-artifact hazards at removal, and worktree garbage collection.
- [isolated-index-commits](./techniques/isolated-index-commits.md) — the
  private-index commit ritual: seeding from the head commit, scoped adds,
  committing staged content rather than the working tree, the staleness
  trap in seeding by copy, composite blobs for shared aggregates and the
  derived files built from them, and verifying a stale status view against
  the head.
- [commit-verification](./techniques/commit-verification.md) — staged-count
  checks before, log readback after, the time-of-check honesty rule, and
  amend-first recovery.
- [never-lose-work-rules](./techniques/never-lose-work-rules.md) — the stash
  ban, per-path staging, atomic cadence, and the recovery ladder from amend
  to the reference log.
- [shared-resource-arbitration](./techniques/shared-resource-arbitration.md) —
  session-unique naming for scratch and artifacts, activity-evidence over
  lock files, and arbitration for unshareable resources.
- [sub-file-claim-scope](./techniques/sub-file-claim-scope.md) — claims that
  name functions rather than paths: when the parallelism is worth it, and the
  identity, containment, remainder, creation, staleness, dependency and
  all-or-nothing rules that keep a finer claim from reading as a false all-clear.
- [integration-door](./techniques/integration-door.md) — the serialized
  merge-back of isolated branches: claim read from the record, rebase in the
  branch's worktree, dirt judged by overlap, verify-then-teardown, the claim's
  lifetime across a failed integration, and scope checked against change.
- [commit-time-claim-guard](./techniques/commit-time-claim-guard.md) — the hook
  a shared tree relies on at the commit: why the session's own write inventory
  gates first and a claim only complements it, what a claim protects in a file
  two sessions both write (arrival order, not content), the record the hook
  reads, its fail directions, and the replay that prices it before install.
