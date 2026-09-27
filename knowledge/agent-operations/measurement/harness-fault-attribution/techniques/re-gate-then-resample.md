---
layer: technique
type: technique
subject: harness-fault-attribution
technique: re-gate-then-resample
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [a failure passed on rerun and is about to be called environmental, a failure survived a rerun and is about to be called the model's, two runs of one configuration disagree, deciding what a rerun can prove]
---

# Re-gate, then resample

The concern: the checklist's decisive step is "does it reproduce clean", and a rerun
answers a different question from the one it is asked. A fresh rerun changes at least
two things at once: the environment and the model's sample. Often it changes a third, the
harness itself, because harnesses are fixed while the corpus runs. So when the verdict
flips, nothing says which of the three moved it. And when it holds, that proves nothing if
the rerun only replayed a cached answer. **Split the rerun. First re-gate the run's stored
output in a clean environment, holding the model fixed. Then compare the two runs'
fingerprints. Only then resample, and read the result as a rate.**

## The three moves

1. **Re-gate the stored output.** Put the run's own output (the diff, the answer, the
   written files) through the current check in a clean environment. Nothing is sampled,
   so the model's contribution is held exactly.
   - If the verdict flips, the fault was in the scoring side: the gate, the grader, or
     the environment the check ran in. No model finding survives it.
   - If it holds, the output really fails a sound check. Whether that is a property of
     the model is a question for step 3.

   Re-scoring identical stored outputs through a rebuilt harness has moved a published
   benchmark score for one agent and not for another. That is the size of what this step
   finds.
2. **Compare the fingerprints before calling anything a rerun.** Compare the harness
   revision, the inputs the run was actually served (the retrieved context, the starting
   tree, the tool results), the model snapshot the provider reported, and the resource
   envelope. A pair whose fingerprints differ is not a rerun, it is a diff. Attribute the
   flip to the layer that differs, not to "noise".
3. **Resample, k times, clean.** Only now draw fresh samples in a clean environment, with
   everything else pinned. The result is a failure rate, not an event.
   - A pass on rerun proves the failure is **intermittent**. It does not prove the
     failure is environmental.
   - Failing on every rerun leaves the cause **unknown** until the other two moves have
     spoken.

## What each move cannot see

- **A re-gate clears only the scoring side.** A fault during generation shaped the output
  itself: the agent read a sibling's artefact, the host slept mid-run, or the provider
  served a degraded answer. Re-gating that output faithfully reproduces a result the
  environment caused. Read the trajectory for state the run did not create, then resample.
- **A cached rerun is a replay.** When the rerun hits a response cache, or replays
  recorded inputs, it reproduces the first run by construction. Survival then proves
  nothing about the cause. The same holds for a grader cache keyed without the output: it
  returns the old verdict for a new answer. Confirm the call executed before reading the
  result.
- **Temperature 0 is not a replay.** Served models vary run to run even at zero
  temperature, because the serving stack does not hold numerics fixed across load. Pin
  what can be pinned, and still count the resample as a sample.

## Decision rules

- **Every flip names its layer.** Label it scoring, served input, harness revision, or
  model sample. When the evidence cannot separate them, the honest label is "intermittent,
  unattributed, rate k of n", never "environmental" by default.
- **Stamp the harness revision on every run, at its start.** Two runs with identical
  configuration headers can be two harnesses. Without the stamp, a harness change reads as
  rerun spread, and the spread is then quoted as the benchmark's noise floor.
- **Attribute passes as well as failures.** A harness defect that inflates a score is
  never triaged, because nobody investigates a green. When a pair splits, look at the
  run that passed as well as the one that failed.
- **Size k to the claim.** One clean rerun can show a failure is intermittent. It cannot
  show a rate. A model finding that turns on a rate needs enough samples to separate that
  rate from the configuration's own run-to-run spread.

## When not to use it

- **No stored output.** A harness that keeps only conclusions cannot re-gate, and every
  attribution falls back to a resample. Fix the record first, per the recompute discipline
  in the sibling measurement subjects.
- **The output is the whole environment.** Where a run's product is a mutated live system
  that cannot be captured, only the trajectory read and the resample remain. Say that the
  scoring side was never isolated.
