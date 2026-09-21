---
layer: technique
type: technique
subject: deterministic-run-verification
technique: declared-rule-verification
status: draft
laws: [the-repository-outranks-the-instruction, measure-the-tree-not-the-summary]
shared_with: []
use_when: [checking whether a run respected a repository's own rules, detecting evasions like disabled checks, deciding what counts as leftover work]
---

# Declared rule verification

The concern: repositories declare rules in machine-readable places — exclusion lists,
generated-file markers, size limits, required checks, ownership boundaries — and an
unattended run can satisfy its task while violating them. These violations are invisible in
a diff review unless someone thinks to look, and they are exactly what a script can catch
perfectly. **Check the repository's own declarations, mechanically, on every run.**

## What to verify

- **Exclusions.** Ask the repository's own tooling, not a copied pattern list, whether any
  committed path is excluded. Committing an excluded path requires an explicit override,
  so its presence is unambiguous evidence of a decision — not an accident.
- **Evasions.** Search the run's diff for disabled checks, skipped or ignored tests,
  weakened assertions, silenced warnings, relaxed thresholds. Distinguish a legitimate
  scoped suppression inside a test fixture from one that widens the repository's blind spot,
  and ignore prose and documentation, where such words appear innocently.
- **Generated artefacts.** Where markers delimit generated regions, verify the region still
  exists and was not rewritten by hand — a rule frequently broken in the same change that
  documents it.
- **Structural limits.** Size or layout laws a repository states in its own guidance
  (maximum file length, where logic may live) are checkable, and a violation should block
  landing even when no test enforces it.
- **Leftovers.** Compare what the run wrote against what it committed: tracked edits left
  behind, new files stranded outside the paths the repository ignores, artefacts the task
  was meant to produce but left uncommitted.

## Distinguishing leftovers from legitimate residue

Not everything left in a tree is unfinished work, and treating it that way punishes correct
behaviour:

- Append-only logs and ledgers a task legitimately updates.
- A task's own memory or overlay directory.
- A document a proposal-shaped task deliberately leaves for the owner.
- Toolchain residue: build output, virtual environments, caches, a private scratch
  directory the run created to test in.
- Files whose content is unchanged and differ only in line endings or metadata.

Everything else — code, configuration, partial artefacts — blocks.

## Decision rules

- **Ask the tool, never the pattern.** A hand-written exclusion matcher will disagree with
  the repository's own resolution in exactly the cases that matter.
- **A violation is a fact for the reviewer, not a silent penalty.** Put it in front of the
  judge with its count and the paths; reviewers reliably reject an override once told, and
  reliably miss it otherwise.
- **Separate "wrote it" from "committed it".** For an excluded artefact these have opposite
  meanings: writing it is the task, committing it is the violation.
- **Exclude documentation from evasion scanning**, or every skill that writes about testing
  discipline will be flagged for quoting the words it teaches.
