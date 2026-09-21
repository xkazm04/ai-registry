---
layer: technique
type: technique
subject: deterministic-run-verification
technique: baseline-relative-gate-evaluation
status: draft
laws: [measure-the-tree-not-the-summary, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [running a repository's own checks over an agent run, verifying against a repository that is not green at the starting revision, deciding whether a red check is the run's fault]
---

# Baseline-relative gate evaluation

The concern: a harness that demands green checks cannot verify runs against real
repositories, because real repositories carry failures. A harness that ignores checks
verifies nothing. The workable rule is comparative: **capture the repository's own checks
at the starting revision, and require the run's result to be no worse — as a set, not as a
count.**

## The procedure

1. **Run the repository's declared checks, not a substitute.** Whatever the repository
   itself names as its gates is the list; an abbreviated list invented by the harness
   measures the harness.
2. **Capture a baseline at the starting revision**, once per repository and revision, and
   store it. This is the definition of "no worse".
3. **Classify each check.** A binary check passes or fails. A counting check (lint
   violations) compares numbers. A *set* check (test failures) compares identities.
4. **Compare as sets where identities exist.** The run's failing set must be a subset of
   the baseline's. A count comparison hides the swap — one old failure fixed, one new
   failure introduced — which is precisely the regression a gate exists to catch.
5. **Isolate the build.** Each run's checks build into their own output directory. Shared
   build state lets one run's artefacts be executed while verifying another, which produces
   red checks that belong to no model.
6. **Retry once, deliberately.** Flaky suites exist; a single retry with the outcome
   recorded distinguishes a flake from a failure. Never retry a set-comparison check whose
   baseline was itself captured without retries, and never retry more than once — at that
   point the suite's flakiness is the finding.
7. **Store the evidence with the verdict**: the failing identities, an excerpt of the
   output, and whether a retry was used.

## Decision rules

- **A red check is the harness's suspect before it is the model's.** Clear shared state,
  stale artefacts, missing environment setup and concurrent runs first; attributing an
  environment fault to a model is expensive to retract because it looks like data.
- **A check that cannot run locally is reported as unverified**, never as passed. A verdict
  of "not yet — this stage could not run" is honest; "green" is not.
- **The environment step comes first.** Where a repository declares a dependency or sync
  step, it runs before the checks that need it — running it last makes every fresh checkout
  fail type-checking and produces confident false verdicts.
- **Gate results are stored so they can be reused**, and re-run only when the reason to
  doubt them is specific: a harness fix that touched the gate path, or a suspicion of
  shared state. Re-running everything on every report wastes hours and changes nothing.
