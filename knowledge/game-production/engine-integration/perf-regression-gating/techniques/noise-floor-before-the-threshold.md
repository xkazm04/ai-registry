---
layer: technique
type: technique
subject: perf-regression-gating
technique: noise-floor-before-the-threshold
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [choosing the threshold of a frame-cost gate, a performance check fails an unchanged build, a measured regression is smaller than the run-to-run difference nobody has measured]
---

# Noise floor before the threshold

The concern: a regression gate compares two measurements of a quantity that differs every
time it is measured, and the size of that difference is a property of the lane, not of the
change. A threshold chosen before the difference is known is a guess; a guess that fires
on an unchanged build is widened by feel, and a threshold widened by feel stops detecting
the thing it was built for. The remedy is to measure the lane's own spread first, by
running the unchanged build against itself, and to derive everything else from it.

## Procedure

**1. Fix the thing whose spread is wanted.** The spread belongs to a tuple: the gated
statistic, the capture window, the run mode, the machine class. Change any element and the
spread has to be taken again. The statistic is the one the gate will compare — a high
percentile, a hitch count, a per-stage mean — and not the mean frame time by default, because
the spread of a tail statistic is usually far larger than the spread of a mean and a
threshold calibrated on the mean is wrong for the tail.

**2. Replicate whole runs.** One replicate is a complete cycle: start the process, run
the scripted scenario, capture the window, tear down. Splitting one long run into slices
is not replication, because the slices share everything chosen once per boot — memory
layout, the state of every cache, where the scheduler happened to place the main loop. The
spread the gate faces is the one between runs, and a within-run split cannot contain it.

**3. Spread the replicates across the conditions the gate will meet.** Back-to-back
replicates share the machine's state and understate the spread; replicates taken at
different times of day, on a cold machine and a warm one, after and before unrelated work,
bracket it. The conditions that move the number are usually not the ones anybody listed,
so sample them rather than reason about them.

**4. Take the spread as the distribution of the statistic across replicates**, not as a
standard deviation assumed to describe a bell. Report the observed range and the largest
difference between any two unchanged replicates, with the number of replicates beside it.
A spread without its replicate count is a number with no basis.

**5. Stop on stability, not on a count.** Keep adding replicates until one more no longer
changes the estimated spread by more than the gate's resolution needs. If the estimate
never settles, the lane is unfit: its machine is shared, throttling, or running something
else, and the repair is to the lane, not to the threshold. No replicate count is right in
general; the count that is right is the one at which this lane's spread stopped moving, and
it is recorded with the spread.

**6. Derive the verdict rule from two quantities.** Let the spread be *s*, let the
observed delta be *d*, and let *e* be the smallest regression the team has committed to
catching on this statistic, never smaller than the resolution of the timer itself. The
rule reads the noise-adjusted upper bound of the change, not the change alone:

- **fail** when *d* exceeds both *s* and *e* — the regression is real and it is large
  enough to matter;
- **pass** when *d* + *s* does not exceed *e* — even at its upper bound the change is
  within what the team accepts;
- **unverifiable**, with the reason *resolution*, in every other case — the change cannot
  be told from the lane's own spread at the tolerance that matters.

The third branch is where a lane whose *s* is not smaller than *e* lives permanently: it
cannot certify a pass for a build that has not got faster, and the honest output is that it
cannot see what it is for. A
delta within *s* is never a pass on its own, because a pass would claim a sensitivity the
lane does not have; and a delta above *s* but below *e* is not a failure, because the team
has said it does not act on it.

**7. Publish the resolution with every verdict.** The sentence is "this lane cannot see a
change smaller than *s* in this statistic", attached to the result. A gate that blocks at
its derived threshold is honest about what it blocks; a gate that blocks at a threshold
wide enough to survive a bad machine and implies it protects against smaller regressions
is not, and the difference between the two is entirely in whether that sentence is printed.

**8. Compare in interleaved pairs where the lane allows it.** Run the base and the head
alternately on the same machine in the same job, so that drift lands on both, and compute
the difference per pair. The spread that bounds a paired difference is smaller than the
spread across days, and it is measured the same way: unchanged against unchanged, paired.

**9. Treat a rerun as a replicate.** A failed gate is not repeated until it passes.
Reruns join the sample, the statistic is recomputed over all replicates, and the verdict is
a function of the whole set. A pipeline that reports the best of several is selecting, and
its false-pass rate rises with every retry it permits.

**10. Re-characterize when the lane changes.** A driver or operating-system update, a
hardware swap, a changed scenario or window, a different instrument attached: each is a
new tuple and the old spread describes a lane that no longer exists. Record the date and
the cause of each re-characterization beside the spread.

## Decision rules

- When the spread is larger than the effect to detect, report *resolution* as the reason
  and repair the lane; do not widen the threshold to restore green. Widening hides the
  problem and removes the sensitivity in one move.
- When a threshold exists and no spread was ever measured, the gate is advisory until it
  has one. A blocking gate on an uncharacterized quantity is a guess with authority.
- When every recent delta is within the spread but all have the same sign, the per-commit
  gate cannot see an accumulating regression. Compare the head against a much older anchor
  in a slower lane with more replicates; the spread of an aggregate over many replicates is
  smaller than the spread of one, and sub-resolution changes surface there.
- When the same unchanged build yields a spread on one machine class and a larger one on
  another, the second class has its own spread and its own baseline; one number does not
  describe both.
- When a verdict is unverifiable for resolution, route it to whoever owns the lane. The
  author of the change did nothing wrong and cannot fix it.
- When a team asks how many replicates are enough, the answer is a procedure and not a
  number: collect until the spread stops moving, state how many that took, and treat the
  first estimate as provisional until it has survived a second batch taken on another day.
- When the lane to be gated does not yet exist, the gate's own logic can be exercised
  against simulated frames drawn from a stated noise model, and that is worth doing. What
  it measures is the gate, not the lane: the model's parameters are guesses and are named
  as guesses, every result carries the word *simulated*, and no figure from it is ever
  offered as the lane's spread.
- When the default values of a gate — the replicate count, the minimum frames, the
  tolerance — were chosen before any real lane was measured, they are placeholders, and the
  report says so beside the verdict that used them.

## When not to use

Do not characterize noise for a quantity that is deterministic: a count of operations
under a fixed toolchain, the size of an artifact. There the spread is zero in principle,
and the replicates are a determinism check — run twice, confirm identical, and the
check is cheap enough to keep. Where a deterministic count is a valid stand-in for cost,
because the work is bound by computation and not by memory or graphics, it is the better
gate and it needs no noise floor.

Do not use it for a one-off diagnosis. A person reading a single capture to explain a
symptom is not issuing a verdict and does not need a spread; the spread is for the
decision that blocks or passes a change.

Do not read the spread of a judged score, where the noise lives in the judge, as the
spread of a measured cost, where it lives in the machine. The move is the same — an
unchanged control, a delta read against it — and the sources of variance, the remedies
and the replicate design are not.
