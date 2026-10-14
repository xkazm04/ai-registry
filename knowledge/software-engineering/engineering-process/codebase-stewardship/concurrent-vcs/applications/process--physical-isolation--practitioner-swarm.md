---
layer: application
type: application
subject: concurrent-vcs
technique: physical-isolation
stack: process
verified_on: 2026-10-14
---

# A sixteen-session fleet that shared one checkout on purpose, and what its own audit priced

The source is one practitioner's published operating method for agent swarms
(`github.com/Dicklesworthstone/agentic_coding_flywheel_setup` at `5b02310cb13f`) and
the agent instructions and audit of one project it was run on
(`github.com/Dicklesworthstone/frankengit` at `142adb9098d5`), read as clones on
2026-10-14. Anchors are relative to a directory holding both clones under those names.
Everything below is restated; the trees are licensed MIT with a rider and none of their
text is reproduced beyond the anchors.

## The choice as written

The method commits every implementer straight to the main line and rejects
branch-per-agent outright (`acfs/acfs/onboard/lessons/21_git_strategy.md:21 "Branch-per-agent creates merge hell."`).
Its two forces are the ones the technique's cost section names: a branch's context goes
stale against the head, and (`acfs/acfs/onboard/lessons/21_git_strategy.md:33 "Logical conflicts survive textual merges."`)
a semantic conflict that merges cleanly surfaces late. In place of isolation it uses
expiring advisory leases, a commit-time lease guard and a destructive-command guard, and
argues against hard locks because a crashed holder would deadlock the fleet. The author
scopes the preference to the opening stretch of a project, not to every phase.

## What the project's own audit recorded

The audited project shares one checkout on the main line among its implementer
sessions (`frankengit/AGENTS.md:309 "Swarm agents share ONE checkout on"`). Its
reality-check document, bound to a revision, records the shared tree's price: most of
one stream's commits declared they were never compiled
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:16 "73 of its 77 commits declare they were not compiled"`),
commits landed against tasks nobody claimed
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:437 "Commits landed against open, unassigned beads without claiming them"`),
and the same instruction file both forbids and mandates direct commits to the main line
(`frankengit/AGENTS.md:238 "Never modify the default branch directly"`).

## The structural fact

Every seat whose output had to be trusted isolated anyway: the verification lane runs in
its own worktree with its own build target
(`frankengit/AGENTS.md:358 "the orchestrator's lane uses its own worktree and target"`), and
the audit produced its evidence at a pinned revision
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:22 "in an isolated detached worktree"`).
Nobody designed that split as a rule; the published method says the opposite. It fell
out of the work, and it is the technique's discriminator realized by a fleet that
started from the other position: the shared tree survived only at the implementer seat,
and only with guards.

## What this realization cannot show

It has no worktree arm. Nothing here measures what the same fleet would have paid in
integration conflicts had it isolated, so it prices the shared tree's cost and leaves
isolation's cost to the argument. The clones were depth-1; commit history was not read.
