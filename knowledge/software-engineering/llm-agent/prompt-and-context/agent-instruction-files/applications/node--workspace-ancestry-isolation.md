---
layer: application
type: application
subject: agent-instruction-files
technique: workspace-ancestry-isolation
stack: node
verified_on: 2026-09-02
verified_against: node@24.14
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# The author's chair, checked against a registry that reads other people's trees (Node)

This registry is a public repository whose research skills clone
third-party trees into a per-run scratch directory and read them. It is
therefore on both ends of the technique at once: a *reader* of other
authors' instruction files every time a source is a repository, and an
*author* whose own tree is cloned by agents it did not invite. The
amendment's precondition — a repository that accepts outside
contributions — is the fact to check first, and the check decided the
verdict.

## The seam

Two facts of the tree's shape:

- The registry has **no root instruction file** (`CLAUDE.md`, `AGENTS.md`)
  at all; its guidance lives under `.claude/skills/`, which a visiting
  harness does not load by the ancestry walk. There is no channel to an
  uninvited agent to write terms on.
- The research skills clone into `<scratchpad>/<run-id>/repo`, a flat
  sibling layout under a parent with no instruction file — the reader-side
  layout the technique prescribes — and the intake method reads a cloned
  tree's instruction file as *source material* (this run read one that
  forbids generated contributions and embeds a disclosure canary) without
  acting on it.

## Three cases, under both policies

Policy A is the tree as it is. Policy B adds a root terms file with a
disclosure canary, as the amendment describes for a public repository.

1. **This run.** The source repository's file instructs any agent to add a
   fixed token to every piece of generated output sent to the project and
   forbids generated contributions. Under A and B alike the registry's
   session treated the file as data: nothing was sent to that project, no
   token was emitted, the policy was recorded as a finding. The canary did
   what it is for — it made the disclosure question answerable — and the
   reader-side rule did what *it* is for. Falsifier: a registry session
   opening a pull request against a mined repository.
2. **A visiting agent clones the registry.** Under A it finds no root
   file and reads whatever it wants; under B it finds terms it will
   correctly ignore as steering and may correctly honor as policy if its
   operator submits something. The registry accepts no outside
   contributions and has one owner, so the second half never occurs.
   Falsifier: a contribution policy, or a second contributor.
3. **The owner's own sessions.** Under B, every session of every skill in
   this checkout loads the terms file and the canary with it — the
   "inert for the invited" constraint has to be met by phrasing alone,
   and every line is dilution tax on a floor the skills already pay for.
   Under A nothing changes.

Verdict: **not-better.** The amendment's own precondition is absent, and
case 3 is a cost with no offsetting signal. The condition is the one the
amendment now states in its last paragraph: a private tree with one owner
has no uninvited agents, and a canary there taxes the owner.

## What the tree said about the technique

The structural fact is on the reader side, and it is confirming: the
registry's clone layout is the flat-sibling form, and its method treats a
cloned instruction file as source rather than brief without any
path-exclusion configuration — which is the technique's preferred
mechanism (layout over setting) working as described, in a tree that reads
more third-party instruction files than most.

## What this realization cannot do

It cannot test the canary's detection value, which requires an uninvited
agent submitting to a maintainer who reads titles. The instrument that
would make it measurable is a public repository in the fleet that accepts
pull requests; none does.
