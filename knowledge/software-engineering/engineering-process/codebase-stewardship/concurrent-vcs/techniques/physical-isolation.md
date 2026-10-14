---
layer: technique
type: technique
subject: concurrent-vcs
technique: physical-isolation
status: forged
laws: [creation-names-reaper, gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether a task needs its own worktree, a cleanup deleted the main checkout's dependencies, registry and disk disagree about worktrees, deciding whether implementer sessions may share one checkout instead of taking worktrees, many writers land small changes and every worktree branch is dozens of commits stale by the time it integrates, two branches merged cleanly and the result broke, one session's half-created directory broke every session's build, a verification or audit run must produce evidence while siblings edit the tree]
---

# Physical isolation

Every other mechanism in this subject detects, discourages, or repairs
collisions. A linked worktree is the one mechanism that *removes* them: a
separate working copy on its own branch, sharing the repository's object
database but nothing of the checkout's mutable state — its own files, its
own index, its own head. Two sessions in two worktrees cannot interleave
edits, cannot race each other's staging, and cannot sweep each other's files
into a commit, because there is no shared mutable surface left to race on.

## The threshold: multi-file work isolates

The standard is a bright line, not a judgment call:

- **More than one file in the planned scope → create a worktree.** A
  research effort touching a module and its tests; a refactor with a
  multi-file rollout; a generator run that rewrites several manifests — all
  get their own working copy and branch, worked and committed there, merged
  back when done.
- **A single-file, single-sitting fix may stay on the main checkout** — the
  exposure window is one edit and one commit, and the commit still goes
  through the shared-checkout commit discipline (private index if siblings
  are live, verification always).

The line is drawn on file count rather than perceived risk because sessions
systematically underestimate risk and cannot underestimate a file count.
When in doubt, isolate: a worktree's setup costs seconds; a collision's
cost is an incident. Setup is not the whole of isolation's price, though,
and there is one regime where the rest of the price dominates; the next
section names it and the discriminator that recognises it.

## What isolation costs, and the regime where a shared tree wins

The threshold above prices isolation's benefit and charges it only its
setup. Isolation removes interleaving by postponing contact, and the
postponed contact is paid for at integration:

- **Context goes stale.** A worktree holds the head as it stood at branch
  time. Every sibling landing moves the line away from it, and the session
  goes on reasoning about neighbours that no longer look the way it
  remembers.
- **Semantic conflicts merge cleanly and surface late.** Two changes to
  disjoint text can still disagree: a contract changed on one branch, a new
  caller of the old contract written on another. The textual merge
  combines them without complaint, so the break appears at integration or
  after it, where in a shared tree the second writer would have met the
  first change while still writing. A clean merge is a check of text
  overlap standing in for a check of consistency ([the gate must see its
  target](../../../../_laws.md#gate-sees-target)); one fleet session found
  a whole-file invariant broken by code its neighbour added after the
  branch point, in a merge that applied cleanly and compiled.
- **Merge cost grows with writers times cadence.** Every landing moves the
  tip and every open branch must rebase over it, so with many writers the
  serialized [integration door](./integration-door.md) becomes a queue, and
  each integration rebases over everything that went through ahead of it.

The quantity that decides is how many sibling landings one package will see
between its branch point and its integration: the other writers, times
their landings per hour, times the package's duration. Where it is small, a
worktree stays near the head and the bright line costs almost nothing. The
builder loop measured in this subject sits there - at most two writers per
repository on disjoint directories, 1,167 runs across eleven repositories
in eight days - and it refused no dispatch for overlap, and its held runs
met no conflict from an overlapping one. Where the count runs into dozens and every package is
small, the integration queue, not the collision, is the bottleneck.

### The shared tree's price, as recorded

A practitioner fleet of about sixteen implementer sessions on one checkout
of the main line chose the shared tree for implementers on exactly that
argument. Its author held the preference strongest in the opening stretch
of a burst, when every session most needs to see one shared state, and kept
isolation available for large established codebases. Its own audit records
the price:

- **One bad state on disk breaks every session at once.** The build
  workspace admitted every directory under one root, so a directory that
  existed for a moment before its manifest broke every build command for
  every session, immediately, before any commit. One wave suffered six
  fleet-wide outages from that window, each from a documented procedure
  followed correctly. In worktrees, each would have broken one session.
- **Commits land unbuilt.** A build in a shared tree reads every sibling's
  half-finished edit, so it is contended and a weak witness at once, and
  the fleet stopped building at the implementer seat: by policy
  implementers ran at most a syntax check, and one stream - 77 of the 175
  commits in four audited days - declared in 73 of them that nothing had
  been compiled or tested. Five of its commits broke the build or the tests
  until another session repaired them, and the head compiled at the
  audited revision only because of the last repair.
- **Claims bind only the sessions that take them.** Some 65 commits landed
  against tasks nobody had claimed, and one task was built twice.
- **The commit, not the edit, is where a shared tree bites.** That fleet
  recorded one session's in-progress file landing in a sibling's commit
  before it had ever run. This registry's own fleet, about a dozen sessions
  on one checkout behind a commit lock, recorded the rest of the class: a
  commit list read from the tree's status that carried three sibling
  files, a path-scoped commit that took a sibling's uncommitted rows from
  the working tree, a sibling's commit that completed an open merge with
  none of its content, a commit that landed on a branch a sibling had
  switched the checkout to, and a commit lock handed to a waiter one second
  after its holder took it. In none of them did the interleaved edits
  themselves corrupt anything; every cost was paid at the commit or at the
  shared head.
- **The seats that had to be trusted isolated anyway.** The verifier's lane
  ran in its own worktree with its own build target, the audit produced
  its executable evidence at a pinned revision in a detached worktree, and
  the procedure for importing results collected from the fleet runs their
  checks in an isolated worktree before any merge.

### The discriminator

The shared tree is the better trade for a seat only when all of these hold:

- **Many writers, landing often enough** that a package taken into a
  worktree would see dozens of landings before it integrated.
- **Small, mostly additive changes**: new files, appended rows, edits to
  files nobody else reads in flight. The interleaving a shared tree permits
  then rarely touches anyone, and each change is exposed only until its
  commit.
- **Guards that engage on their own, at the edit and at the commit**: a
  blocking lease with an expiry on every file a session will change
  ([sub-file claim scope](./sub-file-claim-scope.md) prices the lease); a
  commit-time guard that refuses a commit touching a path another session
  holds and, checked first, one carrying a path the committing session never
  wrote, since a claim alone misses most sweeps that land
  ([commit-time claim guard](./commit-time-claim-guard.md)); a guard that refuses every whole-tree operation
  ([never-lose-work rules](./never-lose-work-rules.md)); commits built from
  the session's own inventory in a private index, never from the tree's
  status ([isolated-index commits](./isolated-index-commits.md)); and a
  shared head that no session moves - no branch switch, no merge run in the
  shared checkout. A guard each session must remember to install is
  an absent guard ([absent guard is
  loud](../../../../_laws.md#absent-guard-is-loud)), and a shared tree
  without these is the ledger without isolation that the golden path calls
  etiquette.
- **Every state the fleet's shared tooling reads is valid at every
  instant.** Anything a shared build or tracker parses - a workspace
  manifest, a registration table, a new package directory - is created
  whole in one step, or assembled outside the place the tooling scans and
  moved in.

The bright line holds, whatever the writer count, when any of these is
true:

- **The package is feature work whose files must change together** - a
  contract and its callers, a schema and its readers. Shared, its
  intermediate states break everyone; isolated, they stay private until
  they are consistent.
- **A long package is a reason only when it is feature work.** Duration
  multiplies the landings a package sees in either regime, and what it
  writes decides which regime pays for them. Long feature work, shared,
  exposes a half-done state for hours: isolate it and rebase inside its
  worktree often, so the staleness stays bounded. A long package of rows
  appended to ledgers every writer appends to is the opposite case:
  isolated, each sibling's append becomes a textual conflict at the same
  insertion point, and the count grows with every hour the package stays
  out. Give such a ledger one file per writer or a set-merge at integration
  before isolating it, the shapes the [intent ledger](./intent-ledgers.md)
  and the [file remainder](./sub-file-claim-scope.md) already take. A
  set-merge is for hand-written append-only rows only; a generated file is
  regenerated after integration, never merged, because the union of two
  generated documents is not a valid one.
- **The seat's output is evidence**: a verifier, an auditor, a benchmark
  or an A/B arm, a review of collected work. Its claim is about a revision,
  and a tree that siblings change during the run is no revision at all; it
  also inherits whatever half-created state an implementer left on disk.
  **The verification seat isolates in both regimes**, pinned to a named
  revision with its own build target, and its verdict names that revision.

A fleet can run both regimes at once, and one with a verification seat
must: implementers on the shared tree, every trusted seat in its own
worktree. What it cannot do is share the tree without the guards, or for
long feature packages, and call that the cheaper trade; that
arrangement pays the shared tree's commit-time costs without the conditions
that made them worth paying.

### Failure modes, side by side

| | Worktrees | Shared tree |
|---|---|---|
| Where one fault lands | one session | every session reading the tree |
| When a semantic conflict shows | at integration, after a clean merge | while the second writer is still writing |
| What grows with the writer count | the integration queue and its rebases | the blast radius of one bad state on disk |
| What a build proves | the branch at a revision | a tree no session owns |
| Where incidents concentrate | stale context, late breaks, a teardown that runs early | the commit and the shared head |

Measure the trade rather than argue it. For recent packages, count the
sibling landings between branch point and integration and the integrations
that conflicted or broke after a clean merge; on the shared side, count the
fleet-wide breaks from on-disk state and the commits that landed broken or
carried a sibling's work. Choose the regime whose recorded faults cost less
per landing at your writer count, and measure again when the writer count
or the package size changes.

One fleet of about a dozen sessions writing mostly additive rows on one
checkout replayed six weeks of its own history this way
([application](../applications/process--physical-isolation--ai-registry.md)).
Isolated at branch leads from half an hour to two hours, its packages would
have met more conflicts per landing than the shared tree recorded
incidents, at every lead and under every filter tried, even with each
append-only ledger set-merged. Nearly every same-day append pair
conflicted. The two counts are not one currency, though: every conflict
would have been caught at integration, while the shared tree's incidents
landed silently, and two of its sweeps went unrecorded for two weeks. The
count kept that fleet on the shared tree and moved the guards to the top of
its list; it did not show that a sweep costs less than a conflict.

## Creation

Create the worktree under a dedicated, well-known directory with a short
task slug, on a branch named for the same slug — a naming convention that
makes a directory listing of worktrees double as a task roster. Then work
entirely inside it: edits, staged changes, commits, validations, all in the
isolated copy. Commit atomically per task exactly as on the main checkout;
isolation removes cross-session interleaving, not the value of small
commits.

Two cautions at creation time:

- **Dependency state does not follow.** A fresh worktree has fresh, empty
  dependency and build directories; tooling that assumes an installed state
  must reinstall or link it. Native or compiled dependencies in particular
  often need a rebuild inside the new copy.
- **The worktree is not a sandbox for the repository's shared surfaces.**
  Its branch, the object database, and any remote are still shared. The
  isolation covers the working files and the index — which is exactly the
  contended surface — nothing more.

## Removal: the hazards live here

A worktree is removed when its branch has merged and the work is confirmed
in the target branch's history. The finish ritual is: verify the merge in
the log, remove the worktree through the version-control tool (never a bare
directory delete — the tool must unregister it), then delete the merged
branch. The worktree names its reaper at creation: the session that made it
removes it, as part of the same finish ritual that closes the ledger entry
([creation names its reaper](../../../../_laws.md#creation-names-reaper)).

The one genuinely dangerous step is **link artifacts inside the worktree**.
Dependency managers and build tools sometimes materialize directories as
junctions or symbolic links into shared caches or into the main checkout.
A recursive delete that follows such a link destroys the *target* — a
shared cache, or the main checkout's real dependency tree — while appearing
to clean the worktree. Before removing any worktree, remove or unlink its
link-typed directories explicitly, then remove the worktree. This failure
has been paid for; treat the ordering as mandatory.

## Garbage collection: the sweep for abandoned worktrees

Sessions crash without finishing their ritual, so the subject keeps a
periodic sweep that lists every registered worktree with three facts: its
**age**, whether it is **dirty** (uncommitted work in its tree), and whether
its branch is **merged**. The destruction rule is conjunctive — remove only
what is *clean and merged and stale*; anything dirty is a session's
possibly-live work and is surfaced, never deleted.

The sweep must reconcile **both directions** between the tool's worktree
registry and the directory convention on disk, because half-finished
cleanups leave debris on each side — and the debris on the unregistered
side is invisible to a sweep that only enumerates the registry. Measured:
three abandoned full working copies sat under the worktree directory with
*no registry record at all* (the metadata had been cleaned, the directories
had not), unreachable by any registry-driven collection. So the sweep also:

- **prunes stale registry records** whose directory is gone — cheap and
  always safe;
- **surfaces orphaned directories** present on disk but absent from the
  registry, as a *lower-trust class* removed only on explicit opt-in,
  because with no registry record the tool cannot vouch for what they
  contain.

The sweep's report is useful even when it destroys nothing: a roster of
stale worktrees is a roster of crashed or negligent sessions, which feeds
back into the ledger's completed-with-no-outcome accounting. Stale worktrees
are not free while they wait — each holds a full working copy (often with a
multi-gigabyte build cache), confuses the roster, and invites a future
session to wander into it by accident.
