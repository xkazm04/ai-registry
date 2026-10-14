---
layer: application
type: application
subject: concurrent-vcs
technique: never-lose-work-rules
stack: process
verified_on: 2026-10-14
applied: experiment
ab_verdict: unmeasurable
---

# A game-tooling repo whose only git-safety line covered one file

The project runs several sessions at once on one checkout (an orchestrator,
the owner's own terminals, headless builders). Its always-loaded instruction
file carried one git-safety rule, about committing a single shared memory file
with an explicit path. Nothing there banned stashing, bulk staging or
rewinding the branch; a research skill elsewhere held a pathspec rule that
sessions not running that skill never read.

## What A and B were

A was the file as found. B added the four rules of the technique as bans in
the same always-loaded file, plus the readback line: stash ban, per-path
staging, no hard reset of a shared branch, check that the head commit is yours.

## What the replay read

Falsifying seam: replay the banned forms over 156 session transcripts from the
checkout and its headless worktrees (7,096 shell calls). If sessions never do
these things, the rules are dead weight.

- Unscoped stash: 0. Bulk staging: 0 (one regex hit was a test-runner argument
  and was discarded after reading the row).
- Pathspec-scoped stash: 3, each an A/B of the session's own change, two inside
  private worktrees. Not the sweeping form, but it is the form that teaches the
  habit; the written rule sends an own-change A/B to a throwaway worktree.
- Hard reset of two commits on the shared checkout: 1.
- The project's shared-memory file records a stash pop that left conflict
  markers across 71 files and blocked typecheck for every session. That
  incident is not in the sampled transcripts, so the sample under-counts.

The finding held in a narrower shape: the sampled sessions mostly obey, and the
rules earn their place from one rewind and one recorded sweep, not from a
visible rate. Prevention cannot be read from a documentation change; the row
stays unmeasurable until a guard hook is replayed over the same transcripts.
