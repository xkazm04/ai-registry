---
layer: golden-path
type: golden-path
subject: deterministic-run-verification
status: draft
use_when: [deciding what a harness must measure about an agent run, separating verifiable facts from judgement, verifying a run against a repository that is not green to begin with, auditing what an unattended run left behind]
techniques:
  - baseline-relative-gate-evaluation
  - declared-rule-verification
  - recompute-facts-at-report-time
---

# Deterministic run verification

Everything worth knowing about an agent run divides in two. Some things are **facts**: the
repository's checks pass or they do not, a file exists or it does not, a committed path is
excluded by the repository's own rules or it is not. The rest is **judgement**: whether the
change was worth making, whether the reasoning was sound, whether a maintainer would keep
it. A fleet that blurs the line ends up asking reviewers to adjudicate things a script
could have settled, and — far worse — accepting the run's own account of the facts.

The run's final message is never evidence about the repository. It is evidence about the
run's honesty, which is itself worth scoring: comparing what a run claimed against what the
tree shows is one of the most informative signals available, and it only exists if the
facts were measured independently.

## What must be measured from the tree

- **Completion** — did the process finish, or was it refused, truncated or killed.
- **Checks** — the repository's own gates, run by the harness, compared against the same
  gates at the starting revision.
- **The task's contract** — the artefacts the task prescribes, in the shape it prescribes:
  files present, log rows appended, a verdict line that parses, a map that still validates.
- **What was left behind** — uncommitted changes, scratch directories, half-written
  artefacts; separated from the things a repository legitimately ignores.
- **Rule overrides** — anything committed that the repository's own exclusion rules cover.
- **Evasions** — checks disabled, tests skipped, assertions weakened, thresholds relaxed.
- **Citations** — whether the file and line references in the run's own report resolve in
  the tree at the revision it produced.

Each is cheap, reproducible and independent of taste, which is what makes them the bar a
run must clear before anyone argues about quality.

## The baseline problem

Real repositories are not green. A test has been failing for a month; a lint rule has a
backlog of violations. Absolute gate checks are useless there: every run fails, so the gate
stops discriminating. Relative checks are the answer — the run's failures must be a subset
of the starting revision's failures — and they must be *set*-based rather than counted,
because a run that fixes one failing test and breaks another leaves the count unchanged
while making the repository worse.

## Facts are recomputed, not remembered

A harness's definition of "left something behind" or "overrode a rule" will be refined
while the fleet runs — usually because a run did something nobody anticipated. Facts
therefore live as *derivations from stored artefacts*, not as verdicts frozen at run time:
the clone, the diffs, the captured files and the gate output are kept, and every fact is
recomputed under the current definition when a report is produced. Otherwise the corpus
becomes a mix of old and new definitions with no way to tell which is which, and the only
honest response to a fix is to re-run everything.

## Where verification ends

Determinism has a hard edge, and pretending otherwise is its own failure. Whether a change
ratifies a regression, whether a test asserts the right thing, whether a refactor preserved
behaviour — these need a reader. The harness's job is to hand that reader a short,
verified, unflattering list of facts, and then get out of the way.
