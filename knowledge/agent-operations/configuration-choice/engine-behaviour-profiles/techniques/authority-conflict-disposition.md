---
layer: technique
type: technique
subject: engine-behaviour-profiles
technique: authority-conflict-disposition
status: draft
laws: [the-repository-outranks-the-instruction, measure-the-tree-not-the-summary]
shared_with: []
use_when: [routing a task that writes material a repository may treat as private, profiling how a family resolves conflicting sources, deciding whether a fleet needs a mechanical stop rather than a better model]
---

# Authority conflict disposition

The concern: a task instruction and a repository's own machine-readable rules routinely
disagree — "commit the output" against an ignore rule, "install the dependencies" against
a lockfile policy, "update the shared index" against a generated-file marker. Every
unattended run resolves that conflict silently, and the resolution is a property of the
family, not of the tier. **Measure it deliberately, because one of the two resolutions
publishes material someone decided to keep out.**

## How to measure it

1. **Construct the conflict from real repositories, not a fixture.** A repository that
   genuinely excludes the artifact a task produces is the test; a synthetic one is
   answered differently because the model can tell.
2. **Give every family the identical instruction**, including the clause that creates the
   conflict, and the same starting revision.
3. **Record mechanically what landed**: whether the run committed paths the repository
   excludes, how many, and whether it used an explicit override to do it. The run's own
   summary is not the measurement — a run may describe a force-add as "committing the
   required file" and mean it sincerely.
4. **Repeat at two tiers at least.** Disposition that changes with the tier is not a
   disposition; it is a deliberation artefact, and the finding is different.
5. **Read what the run said about the conflict.** A family that noticed the rule and
   overrode it anyway is a different operational risk from one that never looked, even
   when the committed result is identical.

## Decision rules

- **Route conflict-prone tasks by measured disposition, not by score.** A family that
  respects declared rules and produces a slightly plainer artifact is the correct choice
  for anything touching private, generated or licensed material.
- **A family that overrides declared rules is not disqualified** — it is disqualified *for
  that task shape*. The same family may be the best available for read-and-report work.
- **Where the fleet cannot route (one seat, one family), add the mechanical stop.** Refuse
  to land changes touching excluded paths and make the run report what it wanted to do.
  A stop is cheaper than a model migration and outlives both models.
- **Fix the instruction regardless of which family you keep.** A conflict that a majority
  of families resolve against the repository is an instruction that under-specifies
  authority; make the precedence explicit in the wording ("where the repository excludes
  the path, write the artifact and leave it uncommitted; never override the exclusion").
- **Report the conflict, not just the behaviour.** The finding that transfers to other
  teams is "this task shape creates an authority conflict, and families split on it",
  which is durable, rather than "family X force-adds", which expires.
