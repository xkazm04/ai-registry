---
domain: agent-operations
subject: agent-benchmark-design
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# agent-benchmark-design

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78. The
primary checkout's main was 146 behind origin, so the run worked from origin/main
(92c67bee) in a detached worktree. Two clean worktrees from earlier dispatches of this
subject (2026-09-26) held no commits; nothing had reached origin.

## 2026-09-27 - the bar is measured before it is trusted, one run per cell supports a paired test, identical is not neutral

**Depth rung:** L2 primary for the corrections. L3 empirical for the new technique, which
ran on a fleet harness's stored artefacts:
- the evals-statistics paper on paired question-level differences and clustered errors;
- a 2026 run-to-run variance study of agent benchmarks (60,000 trajectories);
- a vendor post measuring infrastructure noise in agentic evals;
- the agentic-benchmark checklist paper (task and outcome validity; a trivial agent at 38%);
- an agentic benchmark's CI rule ("Oracle solution passes. Dummy solution fails.");
- patch-correctness studies of green patches (7.8% failing developer tests, 29.6%
  behaviourally divergent; 345 erroneous passes changing 18 and 11 rankings);
- a vendor's audit of hard-failed tasks (59.4% with material defects; read through a
  proxy, the page answered 403, so unverified) and a browsing benchmark's (21 of 118
  zero-pass tasks with bad ground truth, verified);
- a model-scaffold leaderboard paper and a prompt-format sensitivity study.

**Lanes:** four.
- A blind training-data lane.
- A web counter-evidence lane.
- A primary-source task-validity lane.
- A landscape lane.

**Convergence:** all four reached the new technique independently. The blind lane
ranked it first among missing practices, before any search.

**Landed (df6f8f4d):**
- **New technique, null-and-reference-controls.** A run that does nothing must fail
  every work task, a known-good solution must pass, and a scripted shortcut must fail.
  - Null passes split into restraint tasks, reported apart, and check defects.
  - A second correct solution of a different shape catches a check that asserts one
    implementation.
  - Outlier passes are read first.
  - Universal failure is the audit's trigger, not its verdict.
- **Flipped: golden path, "cannot support ... a p-value".** The task is the unit that
  repeats, so a paired sign test over shared cells is legitimate. What stays unsupported:
  per-cell verdicts, fine margins, and stability inside rerun noise. A few repositories
  are a few clusters. Rerun only the cells a recommendation hinges on.
- **Flipped: golden path and eligibility-before-ranking.** The mechanical bar is
  necessary, not sufficient. Green gates pass divergent patches, and over-strict ones
  reject correct work.
- **Flipped: golden path, "has found a bug in the task".** Now "probably". Universal
  failure triggers the audit. The defect list covers the tasks' checks, not only their
  instructions. And a task that doing nothing passes cannot trigger it.
- **Conditioned: comparable-cell-construction.**
  - Byte-identical pins the words, not neutrality.
  - The engine as shipped is part of the cell.
  - The resource envelope is a pin: guaranteed resources and the kill threshold, stated
    separately.
  - A narrow-margin recommendation is rerun under a paraphrase.
- **Verified and left untouched:**
  - coverage-and-provisional-labelling; no lane contested it;
  - "a prompt tuned per vendor measures the tuning"; no source recommends per-model
    tailoring for a comparison;
  - the eligibility-then-ranking ordering itself.

**Applied (personas, memory-year harness, three rows):**
- **null-and-reference-controls: `better`, code.** The empty rung's 0.08 was 14
  restraint probes plus p0136, where "UNKNOWN" passed a no-emoji check. The golds
  judged as their own answers failed 1 of 166 (p0009, "English" read as naming a
  retired value through a shared first word). The only two probes every real rung fails
  were both check defects: p0009, and p0134, where a question mark was required.
  - Fixed in personas 1ba2856b6 and 6f963318f, both pushed.
  - Calibration plants 16 cases; mutation turns them red.
  - Old judge against new over all 16 stored runs: exactly 16 verdicts move.
  - Aggregates hid a leader that is worse at restraint (0.79 vs 1.00) and better at the
    work. No ranking moved.
- **Golden-path paired-test flip: `better`, experiment.** The seam already realized it
  (ladder_resolution, 2026-09-24). On the split, every top pair still ties.
- **Universal-failure flip: `better`, experiment.** The whole all-fail population is two
  probes, and both are in the check. The "hard, not broken" half is untested here.
- **comparable-cell conditions: `unapplied`.** No fleet configuration-benchmark harness
  is in a tracked tree.

Impact: none. `build-registry-map --dry-run` shows no fleet map pairs a context with this
subject (the two `agent-operations` string hits are a different subject), so no verdict
went stale. Ten maps read STALE from other landings; this run did not regenerate them.

Owed in personas, left to the harness owner: four planted over-matches in its own
calibration check were red before this run and still are, all from the first-word
tolerance in `contains_value`.

**Banked leads:**
- **For model-and-effort-selection.** A model-scaffold leaderboard paper reports equal
  or lower accuracy at higher reasoning effort in 21 of 36 model-agent-benchmark
  combinations. That is a condition candidate for `cheapest-sufficient-tier`. Return
  when that subject is swept. It is one source; needs a second.
- **Power guidance.** Runs needed to resolve a 5 / 2 / 1 point gap, about 2-3 / 9 / 36,
  from the variance study's table. Summary-only, not re-verified. Return when a fleet
  benchmark plans reruns.
- **Impossible-task variants.** Spec-contradicting tests where any pass is cheating;
  abort permission cut cheating sharply in the source. This is a shortcut-control
  strengthening. Return when a fleet benchmark grades code changes with tests the agent
  can reach.

**Declined:**
- A scaffold-only swing of 10-48 points: secondary summaries only.
- "Most" all-fail tasks are broken, as a default: the verified audit put it at under a
  fifth, so the technique states the spread instead.
- Per-vendor prompt tailoring as the fix for non-neutral text: no primary source
  recommends it for comparisons.

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- benchmark maintainers' own write-ups of their CI and audits;
- empirical patch-correctness studies;
- vendor engineering posts that report their own measurement with a p-value.

Needs a second source: vendor pages reachable only through a proxy.
