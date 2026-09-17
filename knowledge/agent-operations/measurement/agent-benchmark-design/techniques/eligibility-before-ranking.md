---
layer: technique
type: technique
subject: agent-benchmark-design
technique: eligibility-before-ranking
status: draft
laws: [measure-the-tree-not-the-summary, the-repository-outranks-the-instruction]
shared_with: []
use_when: [deciding which runs may compete for a recommendation, defining what done means for a task shape, stopping a well-written failure from winning]
---

# Eligibility before ranking

The concern: judged quality and task completion are different questions, and a benchmark
that collapses them lets an articulate failure outrank a plain success. **Eligibility is a
mechanical predicate evaluated first; ranking applies only to what survives it.**

## Composing the predicate

A run is eligible when all of these hold, each derived from the tree rather than from the
run's own account:

- **It finished.** Not refused, not truncated by a ceiling, not killed by the host.
- **The repository's checks are as green as they were before it started.** Measured
  against the repository's baseline, not against an absolute — a repository with a failing
  test at the starting revision must not make every run look broken, and must not let a run
  add a second failure unnoticed.
- **It did what the task requires**, in the shape the task prescribes: the artefacts exist,
  the required log line was appended, the verdict line is present and readable.
- **It left nothing half-done** — no uncommitted work that the task said to commit, no
  scratch left in the tree that the repository would not ignore anyway.
- **It suppressed nothing.** No check disabled, no test skipped, no assertion loosened to
  make the tree pass.
- **It overrode no declared rule.** Nothing committed that the repository excludes.

## Shape-specific completion

"Done" differs by task shape and must be stated per shape, or the predicate punishes
correct behaviour:

- A task whose output is a **report** is complete with zero commits; requiring commits
  would fail the runs that correctly changed nothing.
- A task that **proposes** rather than lands may leave its document uncommitted where its
  instruction allows the owner to decide.
- A task that **writes an artefact a repository excludes** is complete when the artefact
  exists and was left uncommitted — the exclusion is the repository's decision.

## Decision rules

- **Ranking never rescues eligibility.** A high score on an ineligible run is reported as
  what it is — a good-looking run that did not do the job — and cannot win.
- **The predicate is recomputed at report time**, not frozen at run time, so a later
  correction to what "done" means applies to every stored run rather than only to the ones
  that ran afterwards.
- **When no configuration is eligible everywhere, publish no recommendation** and publish
  what each candidate broke. That output is more useful than a least-bad default, and it is
  usually pointing at a defect in the task rather than in the models.
- **Keep the ineligible runs visible in the table.** Removing them hides the pattern that
  explains the recommendation — and the pattern is often the real finding.
