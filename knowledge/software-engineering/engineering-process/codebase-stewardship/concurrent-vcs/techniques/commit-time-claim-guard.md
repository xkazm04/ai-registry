---
layer: technique
type: technique
subject: concurrent-vcs
technique: commit-time-claim-guard
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [many sessions share one checkout and a commit can carry another session's work, choosing what a pre-commit hook refuses in a shared tree, deciding whether claims or each session's own write record should gate a commit, a shared ledger every session appends to keeps carrying a sibling's rows, a commit hook reads a claim record that another store owns, deciding how a commit guard fails when it cannot read its own state, pricing a commit guard before installing it]
---

# Commit-time claim guard

[Physical isolation](./physical-isolation.md) names the conditions under which
many writers may share one tree, and one of them is a guard that engages at the
commit: a hook that refuses a commit touching a path another session holds. The
commit is the right place for it. A claim declared before editing can be skipped
and an edit can be made by any tool, but every change that reaches the shared
line passes through a commit, so the commit is the one point a guard cannot be
walked around. What the condition does not say is what the guard reads, what it
refuses, how it behaves when it cannot read, and which failures it cannot see at
all. This technique is that design, and its central finding is that the rule the
condition names is the weaker of two.

## Two rules see two different failures

A commit guard can ask one of two questions of every staged path.

- **The lease rule:** is this path covered by a live, exclusive claim held by
  another session? It catches *someone else's work, still in flight*.
- **The inventory rule:** did the committing session write this path at all? It
  catches *work that is not mine*, whoever it belongs to and whether or not
  anyone still holds it.

They are not two strengths of one check. Replayed over a month of one fleet's
history (about 1,400 commits mapped to the sessions that made them, four known
sweeps, three still replayable and one planted as a replica; an application on
this subject records the instrument), the inventory rule refused two of the three
real sweeps and the replica, and flagged 0.3% of clean commits. The lease rule, run
over the claims those sessions had actually declared, refused one of the three real
sweeps: sessions claim coarse units and claim them sparsely, so four hundred commits
were made while another run held a live claim and only three carried a path under
it. Run instead as if every session had reserved every file before its first write,
the lease rule caught the one sweep the inventory rule missed, and refused about 15%
of clean commits on the way. Neither rule saw
everything, and the one each missed is instructive: the lease rule cannot see
abandoned work committed "as found", because an expired claim refuses nothing;
the inventory rule cannot see a sibling's lines inside a file the committing
session also wrote.

So the inventory is the guard, and a claim is a complement to it, never a
substitute. A lease rule installed alone protects only against the collisions
the claim scheme was already declaring, which in a fleet that claims coarsely is
almost none of the ones that land.

## A file two sessions both write

A claim names a whole path or pattern, never lines. With two modes, an exclusive
request conflicts with any other holder and a shared request only with an
exclusive one, so a file has either one exclusive holder or any number of shared
ones. Two consequences follow, and both bite on the files every session writes.

**Shared claims never block a commit.** A file two sessions both hold shared is
unguarded at the commit by construction. A claim front end whose default mode is
shared hands every user of that front end a decorative claim; one implementation
ran a command-line front end that defaulted to shared beside a tool interface that
defaulted to exclusive, so claims taken through the first never refused a commit.

**An exclusive claim decides who wrote first, and trusts that writer's commit
whole.** The second writer is refused at grant and waits; if it writes anyway, its
commit is refused. The first writer's commit passes, even when it carries the
second writer's lines. In the replay above the lease rule caught the hunk-level
sweep only because the session whose rows were swept had written the ledger first.
Reverse the order and the sweeping session holds the lease and commits clean. The
catch is a property of arrival order, not of the guard seeing content.

That is why the files every writer appends to - a task tracker, a source ledger, a
scorecard - defeat a path guard in both directions. Exempt them, as one claim
system exempts its task tracker because blocking it made coordination impossible,
and the one hunk-level catch disappears, exactly. Guard them exclusively and the
whole fleet serializes on them: in the replay, about 230 refused grants a month,
half of them ledger appends and most of the rest regenerations. Neither is a guard
for that class. The guard for a shared append-only file is content-level, the staged
blob equal to the head plus only this session's rows, which is the composite
[isolated-index commits](./isolated-index-commits.md) already builds, or one file
per writer.

**Scope the lease to the tree whose bytes the commit can carry.** A session that
commits from its own worktree cannot carry a sibling's working-tree edits, yet a
claim keyed by project path refuses it all the same. In the replay, 154 of 218 lease
refusals were commits from private worktrees. A claim system that spans a shared
tree and private worktrees checks the lease only for commits built from the shared
tree.

## What the guard reads

The hook runs in the committer's shell, without the claim system's process, so it
reads a record from disk. Where the claim system keeps an authoritative store and a
derived copy, and the hook reads the copy, **the copy the enforcer reads is on the
grant's critical path**, whatever the system's policy for derived data is
([the gate must see its target](../../../../_laws.md#gate-sees-target)). One system
made the history plain. Its first version made the derived archive a precondition of
every operation, which held the two stores consistent and failed calls under write
contention. Its rewrite made the archive a best-effort mirror of the store, and then
had to re-couple exactly one artifact - the claim record the hook reads - after the
hook enforced a holder who had already released. The re-coupling carries four rules:

- write the enforcer's copy durably before the grant returns, and write it
  narrowly: only this claim's record, never by flushing a shared queue, which made
  every grant wait behind unrelated writes and stalled grants for tens of seconds
  under load;
- heal any missing or stale copy from the authority on the next access, and know
  that a read-triggered heal converges only while reads arrive;
- stamp every copy with the authority's generation, so a record left over from
  before a rebuild cannot read as a live claim;
- order the two writes as [existence authority written
  last](../../../../backend-platform/data-layer/data-access/techniques/existence-authority-written-last.md)
  says, judged for the hook as a reader: a create that lands in the authority first
  is a brief false allow at the hook, a release that lands first is a false block,
  and only the second is the safe direction.

**Grant and guard use one matcher.** A claim system that matches at grant time with
one routine and at commit time with another will eventually disagree with itself.
One guard read bracketed path segments as a character class, so commits of exactly
the framework route files agents edit most passed under an active claim.

## How the guard fails

A guard's important decisions are the ones it makes when it cannot decide, and they
are derived from what a wrong answer costs
([advisory guard fail
mode](../../../../llm-agent/orchestration/session-continuation/techniques/advisory-guard-fail-mode.md)
derives a fail direction from a declared risk class). For a commit guard in a shared
tree:

- **On by default, off only by an explicit false.** A typo, an empty value or an
  unrelated feature flag must not switch it off; one predecessor ran its guard only
  when a worktree feature was enabled, so an installation that never enabled it ran
  unguarded
  ([an absent guard is loud](../../../../_laws.md#absent-guard-is-loud)).
- **Absent and unreadable are different answers.** No claim store for this tree:
  allow, with a warning. A store that exists and cannot be read: refuse. One guard
  turned a permission error on its storage root into "no matching project" and let
  every commit through, and earlier, a storage location set in a configuration file
  rather than in the commit shell left the same hook finding nothing to check. A scan truncated by a size bound,
  with a foreign claim present, is a refusal, not a pass
  ([failure is not empty success](../../../../_laws.md#failure-not-empty-success);
  [unknown is not a value](../../../../_laws.md#unknown-is-not-a-value)).
- **Identity is the guard's first input, and it is often unknown.** The committer
  is named explicitly, or inferred and then checked live, never borrowed from a
  binding a live peer still holds. An unresolved identity refuses only when some
  staged path is covered by a claim, since with nothing covered there is no conflict
  whoever commits. Where the agent's shell keeps no environment between calls, an
  identity variable does not survive to the hook, and the hook has to find the
  committer itself, for instance as the session that holds the commit lock.
- **The escape hatch is checked first, and every refusal names it.** A bypass that
  is evaluated after a fail-closed requirement is no bypass; a refusal carries the
  path, the holder, the expiry and the override.
- **Install where it enforces.** A hook installed into a machine-wide hooks
  directory gates every repository on the host with one project's claims; refuse
  that install unless it is asked for by name.

## Replay before enabling

A commit guard is priced on recorded history before it is installed, as every
number above was. Map each commit to the session that made it, rebuild what that
session wrote and what it and its siblings had claimed at that instant, and compute
what each rule would have refused. Declare the target (known sweeps refused) and
the floor (clean commits refused) before the run, and **read the refused rows**:
classify each as a sweep, a clean commit made beside a live sibling, or a mapping
error. A guard enabled without that replay ships whichever error rate the history
would have shown, and in a fleet that commits often, a 15% false refusal rate is a
guard that the fleet learns to bypass in a day.

**The inventory is per tree.** What counts as "this session wrote it" includes the
outputs of every generator, code transformation and scripted rewrite the tree runs,
and those differ from tree to tree. The same inventory rule replayed on a second,
larger application tree over the same month flagged about 6% of its commits, far
above the floor, and nearly all of them were regenerated maps, scripted deletions
and locale files a script wrote; only two carried another session's lines, and both
were deliberate landings of a sibling's leftover work that a live guard would have
needed an override for. No undeclared sweep turned up there in the window. The
next day one did, below the path: a session's commit of that tree's shared apply
ledger carried another session's row, appended minutes earlier and not yet
committed, because both had written the file. It is the class every path rule
passes, on a second tree. Declare the
tree's generators to the inventory before the replay, and read a high flag rate on
a new tree as an unmodelled generator until the rows say otherwise.

## Decision rules

- Gate the commit on the committing session's own write inventory first; add a
  claim check as a complement, never in its place.
- Treat a claim's protection of a co-written file as arrival order, not detection:
  the first writer's commit is trusted whole.
- Do not path-guard files every writer appends to; give them a content-level check
  (head plus own rows) or one file per writer.
- Check the lease only for commits built from the shared tree.
- When the hook reads a derived copy of the claim store, write that copy durably
  and narrowly before the grant returns, heal it on access, and stamp it with the
  store's generation.
- Use one matcher for grant and guard, and match path characters literally.
- On by default; unreadable state refuses; absent state warns; a truncated scan
  refuses; identity is checked live; the bypass is evaluated first and named in
  every refusal.
- Replay the guard over recorded history, with target and floor declared, before
  installing it, with the tree's own generators declared to the inventory.
