---
domain: agent-operations
subject: harness-fault-attribution
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# harness-fault-attribution

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78. The
primary checkout's main was behind origin, so the run worked from origin/main in a
detached worktree. A sibling run on agent-run-budgeting landed in the same bundle
mid-run; the content commit was rebased over it and the generated files rebuilt.

The obvious fourth technique, null and reference control runs, had landed the same day
in agent-benchmark-design. This run looked for what attribution itself lacks.

## 2026-09-27 - a rerun is two changes, a pass on rerun is intermittent, a cluster is read by its axis

**Depth rung:** L2 primary for the flips. L3 empirical for the new technique, which ran on
a fleet benchmark's stored runs.

Sources:
- A flaky-test detector paper (ICSE 2018) on what a rerun proves. "if some rerun passes,
  the test is definitely flaky; but if all reruns fail, the status is unknown."
- A 2025 lab post on nondeterminism in served LLM inference: not deterministic at
  temperature 0, because batch size varies with load.
- An agent benchmark paper introducing pass^k: agents that are inconsistent across
  trials.
- A 2025 paper on correlated errors across LLMs: models agree 60% of the time when both
  err, and larger models more so, across providers.
- A provider's September 2025 postmortem of three infrastructure bugs that degraded
  responses intermittently, which its own evaluations missed.
- A 2023 study of the same model name drifting between snapshots.
- An open-model vendor's verifier showing tool-call accuracy differing by serving vendor.
- A benchmark maintainer's 2024 report on moving evaluation into containers, and its
  harness docs: stored predictions are evaluated separately, and the evaluation cache
  ignores the prediction diff.
- A community re-run of stored agent predictions through a rebuilt harness: one agent's
  score moved, another's did not.
- A 2025 study of a coding benchmark's erroneous passes.
- A vendor post (February 2026) on infrastructure noise in agentic evals: pod errors on
  up to 6% of tasks, with only the resource envelope varied.
- Two evaluation-org reports.
  - One excludes infrastructure-error runs and says doing so can inflate scores.
  - One estimates that up to a third of a model's failures could be spurious.
- An evaluation org's note: API errors are scored as failures after three retries.
- Flaky-test studies: product-code involvement in fixes, and co-occurring clusters.

**Lanes:** three.
- A blind training-data lane.
- A web counter-evidence lane.
- A primary-source practice lane.

**Convergence:** all three reached the new technique independently. The blind lane
proposed it as "crossed replay", the counter-evidence lane as "re-scoring isolates only the
scoring side, a rerun is still needed for generation faults", and the practice lane
through stored-prediction evaluation and the flaky-test detector's rerun asymmetry.

**Landed (8e0630ef):**
- **New technique, re-gate-then-resample.**
  - Re-gate the stored output in a clean environment, which holds the model fixed.
  - Compare fingerprints: harness revision, served inputs, reported snapshot, envelope.
  - Resample k times and read a rate.
  - A cached rerun is a replay, and temperature 0 is not.
  - A re-gate cannot clear a generation-time fault.
  - Attribution is owed to passes too.
- **Flipped: golden path and clear-the-environment-first step 7.** A singleton that
  disappears on rerun is intermittent, not environmental. A failure that survives a
  rerun counts only on a fresh sample.
- **Flipped: golden path and the cluster decision rule.** A cluster in time points at the
  environment. A cluster on an item points at correlated model error or a task defect,
  and "models do not coordinate" rules out neither. When every configuration runs a task
  in one window, the two axes are confounded, so re-run in another window.
- **Widened:**
  - The Provider check covers a degraded backend and a moved snapshot behind a
    success-shaped envelope.
  - The fingerprint includes the harness revision stamped at run start.
  - Three new catalogue entries: silent provider degradation, unstamped harness change,
    cached rerun.
  - retract-and-record reports an exclusion both ways.
- **Verified and left untouched:**
  - "a large share of a new fleet's model defects are its own harness". Independent
    evaluators estimate a spurious share of up to a third, and a vendor measured pod
    errors on up to 6% of tasks.
  - The record shape of retract-and-record.
  - The existing catalogue entries.

**Applied (personas, memory-year harness):**
- **re-gate-then-resample: `better`, code.**
  - Two raw-retrieval runs 15 minutes apart, headers identical, split on 18 of 194 probes.
  - Both re-gated under one judge: 0 verdicts moved.
  - 17 moved with the served context, across the commit that stopped embedding dates
    (cfb1ee4812). It landed 15 s before the second run started.
  - 1 flip (p0162) had the same context size and a different answer: the consumer's
    own sample.
  - 16 of the 17 were passes earned by the leak.
  - Fixed: the header stamps the harness revision at start, rejudge stamps its own, and
    compare warns across revisions (d980f99cc, pushed). Controls: matching stamps are
    silent, differing ones warn, and dirty reads true before the commit and false after.
- **Singleton flip: `better`, experiment.**
  - The old rule labels the whole split noise and never asks why the leaking run passed.
  - The recorded-context pair agrees 194/194 with 194 cache hits, so survival proved
    nothing.
  - The model-sample flip is n=1. Context identity is by size, so 1 is an upper bound.
- **Cluster flip: `unmeasurable`.** Every rung shares one consumer model, so an item
  cluster cannot be split between correlated model error and task defect here.

Impact: none. `build-registry-map --dry-run` shows no fleet map pairs a context with this
subject, so no verdict went stale.

**Banked leads:**
- **Power for k.** The same variance study the sibling subject banked. Return when a
  fleet benchmark sizes its resamples.
- **Canary probes during a run.** The blind lane proposed known-answer probes as a live
  provider-drift monitor. One lane only. Return when a fleet run spans a provider incident.
- **Delta debugging over run manifests.** Bisecting the harness revision between a
  passing and a failing run. One lane only. Return when a stamped harness shows a split
  across revisions.

**Declined:**
- DeFlaker's recall and false-alarm figures: search summaries only, not in the PDF text.
- Root-cause percentages from the 2014 flaky-test study: its PDF is password-protected,
  and only the abstract was read.
- A benchmark framework's default retry-exclusion list: two snippets conflict and neither
  page loaded.
- Quantization as the cause of vendor differences: the verifier page names no cause.

Yield: high. dry_streak 0. Scan points 9 -> 5. The finding that ranked it is cleared;
"single stack" and "never swept" remain.

Source classes, this run. Kept:
- the paper that defines a tool's own semantics (the rerun asymmetry);
- providers' own postmortems;
- evaluation orgs' reports on their own exclusion policy.

Declined as sole support: search snippets, and pages that failed to load.
