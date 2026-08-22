---
layer: technique
type: technique
subject: pipeline-authoring
technique: change-scoped-work-selection
status: forged
stage: multi-service
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [builds are too slow to run everything, adding path filters to a pipeline, a check has not run in months and nobody noticed]
---

# Change-scoped work selection

Only run the work a change can affect. The saving is real and grows with the repository; the
technique is also the most reliable way to acquire a check that has not executed in six months
while reporting green every time. Both halves are this technique's subject, and the second
half is the one that gets written down last.

## Selection is a dependency question

The naive rule matches changed file paths against directory patterns: a change under one
directory selects the lane for that directory. It is wrong in the one direction that matters.
A change to a shared module implicates every deliverable that consumes it, and a
directory-pattern rule selects none of them.

The correct rule computes a **closure**:

1. Take the set of changed files, against the correct base — the merge base with the target
   branch, not the previous commit. A rule using "since the last commit" selects nothing on a
   merge and selects the wrong thing on a force-push.
2. Map each changed file to the unit that owns it.
3. Walk the *reverse* dependency graph: everything that depends on an implicated unit is
   implicated. Repeat to a fixed point.
4. Apply the always-run set: files that implicate everything by construction — the dependency
   lockfile, the toolchain pin, the pipeline generator itself, the selection rule's own
   configuration.

The always-run set is not a nicety. A change to the selection rule that the selection rule
itself decides not to test is a hole with a direct path to production.

## Three outcomes, three colours

This is the failure the technique exists to prevent, and it is a reporting failure rather than
a logic failure.

At the point a human or a merge rule reads a result, these must be distinguishable:

| outcome | means | must never render as |
|---|---|---|
| **not selected** | the change cannot affect this lane | passed |
| **selected, passed** | the lane ran and was satisfied | — |
| **selection failed** | the rule could not decide | not selected, or passed |

Collapse the first into the second and the repository quietly acquires a class of change that
is exempt from a check nobody knows it is exempt from. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), a gate that did not observe its
target did not pass — it abstained, and an abstention rendered as a pass is the most expensive
lie a delivery system tells, because the diagnosis requires somebody to suspect a green result.

The third row is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applied directly. A selection rule that throws — a malformed manifest, an unreachable
dependency graph, a base commit it cannot resolve — must select *everything* and say why, never
select nothing. Fail open on scope, closed on verdict.

## The unscoped backstop

Scoping is a loan against a full run, and the loan needs a repayment schedule. Run the
unscoped plan on a fixed cadence — on the protected branch after merge, on a schedule, or
both. Two distinct defects surface only there and never in a scoped run:

- **Dependency edges the graph does not know about.** Implicit coupling through a shared
  fixture, a generated artifact, a runtime configuration key. The scoped run cannot see them
  by construction, because the graph is what it consults.
- **A lane that has silently stopped working.** A lane rarely selected can be broken for
  months. The scheduled unscoped run is what makes its liveness observable — the same argument
  gate liveness makes about gates in general.

Report the backstop's failures somewhere a person actually reads. A scheduled run whose
failures land in a notification channel nobody watches has moved the problem, not solved it.

## Reporting the scope

Every scoped run states its own predicate: what changed, what closure that produced, what was
therefore skipped. Print it in the run's own output — not only in a dashboard — because that
is where somebody debugging "why did this not run" will look first. A build that quietly did
a third of the work is indistinguishable from a build that did all of it, unless the build
says so.

## When NOT to scope

- **The full plan already fits the feedback budget.** Scoping is machinery with its own defect
  modes; adopt it when the full run is genuinely too slow, not in anticipation.
- **The dependency graph is not real.** A closure computed from a graph nobody maintains is
  worse than no scoping, because it looks principled. Fix the manifest first.
- **On a release plan.** A release runs everything. A release that runs a subset selected by a
  diff is a release nobody can characterize afterwards.

## Decision rules

- Compute a reverse-dependency closure, not a path match; diff against the merge base.
- Maintain an always-run set that includes the lockfile, the toolchain pin, and the selection
  rule itself.
- Not-selected, passed, and selection-failed are three renderable outcomes; never two.
- A selection rule that cannot decide selects everything and says why.
- Run the unscoped plan on a cadence, and route its failures to somebody.
- Every scoped run prints its own predicate.
