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
   measures the harness. It is the list *as declared at the starting revision*: a run that
   edited its own gates is graded by the originals
   ([grade-with-checks-the-run-could-not-touch](./grade-with-checks-the-run-could-not-touch.md)).
2. **Capture a baseline at the starting revision**, once per repository and revision, and
   store it. This is the definition of "no worse".
3. **Classify each check.** A binary check passes or fails. A counting check (lint
   violations) compares numbers. A *set* check (test failures) compares identities.
4. **Compare as sets where identities exist, and compare both sets.** The run's failing set
   must be a subset of the baseline's. A count comparison hides the swap — one old failure
   fixed, one new failure introduced — which is precisely the regression a gate exists to
   catch. But the failing set alone has a blind spot: a test that no longer exists is in
   neither failing set. So the baseline's **passing** set is the other half of the
   contract: every test that passed at the start must still be present and passing, and a
   test that is absent, no longer collected, or newly skipped counts as a failure.
   Normalise identities first — parameterised and renamed tests otherwise read as one test
   vanishing and another appearing.
5. **Require evidence that the suite ran.** An empty result is not a pass. A collection
   error that stops a whole suite, a runner configured to pass with no tests, or a log
   that never reached its summary all shrink the failing set to nothing. Record how many
   tests were collected against the baseline's count, and read the exit status beside the
   parsed log.
6. **Grade the committed tree, in a clean checkout of it.** A run's working directory
   holds untracked files, warm caches and whatever it installed; a pass there may not
   survive a checkout of what it actually committed. Where a repository declares a
   dependency step, run it in its frozen form: a step that rewrites the lockfile grades a
   dependency graph nobody committed.
7. **Isolate the build.** Each run's checks build into their own output directory. Shared
   build state lets one run's artefacts be executed while verifying another, which produces
   red checks that belong to no model.
8. **Retry to classify a failure, not to erase it.** Flaky suites exist. One retry of the
   failing tests settles most flakes that do not depend on order; a suite whose flakiness
   does depend on test order needs up to three, in the same order, because rerunning a
   test alone hides the pollution that failed it. A test that passes on retry is recorded
   as **flaky**, never as green. When a whole batch fails at once, suspect the environment
   before retrying anything. Compare retried results only against a baseline captured
   under the same retry policy — and capture that baseline more than once, keeping a list
   of tests already flaky at the start, because a single baseline run turns every
   intermittent test into a charge against whichever run happens to hit it.
9. **Store the evidence with the verdict**: the failing and missing identities, the
   collected count, an excerpt of the output, the exit status, and whether a retry was used.

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
