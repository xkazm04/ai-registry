---
layer: technique
type: technique
subject: perf-regression-gating
technique: percentile-and-hitch-gate
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [choosing the statistic a frame-cost gate compares, the average is flat and players report stutter, a worst-frame number keeps changing between identical runs, reporting a performance verdict beside the distribution it came from]
---

# Percentile and hitch gate

The concern: which statistic of the window's frame costs carries the verdict. A mean, or
the frame rate derived from it, moves when the whole distribution shifts and stays where it
was when a few frames get much worse. Players do not experience the mean; they experience
the rare long frame, and a gate that reads the mean passes exactly the regression they
report. Gating on a high percentile and on a count of hitches fixes that, at the price of
two new problems — a tail statistic has a sampling error of its own, and a maximum is the
worst statistic of all — which are what the procedure is for.

## Procedure

**1. Gate on three statistics, because each fails differently.** A **high percentile** of
per-frame cost is stable and catches a systematic shift of the slow end. A **hitch count**
catches rare spikes that a percentile below their share of the window cannot see. A
**missed-frame count** counts frames whose cost exceeds the frame interval itself, which is
the policy statement of the budget and is the one that moves when the entire distribution
rises. The mean and the rate are kept as context fields; they are not the gate.

**2. Define a hitch relative to the run's own median.** A hitch is a frame whose cost
exceeds a multiple of the window's median. The multiple is chosen from the unchanged
replicates, at the value where the hitch count of an unchanged build is stable across them,
not from a round number. A hitch relative to the median catches a spike in a build whose
typical frame sits far under budget, where a budget-relative count would report nothing
until the spike exceeded the whole interval.

**3. Keep the budget-relative count beside it.** A sustained overrun raises the median with
it, so no frame looks like a spike against its own run, and the median-relative count
stays flat while the build is plainly worse. The two counts cover each other's blind side;
the gate reads both.

**4. Count events, not frames.** A stall that lasts several consecutive frames is one
event that the player experienced once. Group maximal runs of over-threshold frames into
events, gate on the number of events, and record the longest run beside it. Counted as
frames, one long stall reads as a dozen hitches and a build with a dozen separate small
ones reads the same.

**5. Read the tail's size off the window.** The effective sample of a percentile is the
number of frames beyond it: with *N* frames and a percentile at fraction *p*, that is
*N*(1 − *p*). A three-hundred-frame window leaves three frames beyond the ninety-ninth
percentile, so the statistic is the third-worst frame and moves with any one of them. State
*N*(1 − *p*) beside every percentile, because it is the basis of the number
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

**6. Choose the percentile by its spread, not by convention.** Take the highest percentile
whose spread across unchanged replicates still resolves the effect the team must catch.
Higher is more sensitive to rare spikes and noisier; lower is steadier and blind to
spikes narrower than the tail. When no percentile resolves the effect at the window's
size, the remedies are more replicates aggregated per window or a longer scripted window,
and a looser statistic is the last resort; the measured spread arbitrates and a table
of recommended values does not.

**7. Use the maximum as a locator only.** The worst frame of a window grows with the
window's length, is owned by one outlier, and on a shared machine is often a scheduling
artefact rather than the build's. It stays in the payload, with the frame's index and phase, so a
reader can go and look at it; it does not enter the verdict. This is the same rule a parity
gate applies to samples that are positions on one artifact. It applies with more force here,
where the samples are draws from a process whose own maximum is unbounded.

**8. Report the distribution beside the verdict.** A quantile table — the median, a few
high quantiles, the maximum — the frame count, the hitch events and the longest run travel
with the result. A verdict that says *regression* and nothing else cannot be re-read when
someone disputes it, and a distribution shows a shifted body and a longer tail as the
different things they are.

## Decision rules

- When the mean is flat and a tail statistic rose by more than its spread, it is a
  regression. The mean's silence is not exculpatory.
- When the tail count *N*(1 − *p*) is too small for the statistic to be steady across
  unchanged replicates, the verdict is unverifiable with the reason *sample*; it is never a
  pass on a statistic that was computed from a handful of frames.
- When a hitch threshold was never calibrated on unchanged runs, the hitch count is
  advisory; a multiple chosen by feel produces a count that jumps on noise.
- When both the median-relative and the budget-relative counts rose, report both; when only
  one rose, report which, because they point to different causes — a new spike, or a shifted
  distribution.
- When a run's frame count differs from the baseline's, compare rates per frame, record
  both counts and say so; a count over a longer window is not a regression.
- When the worst frame is the only thing that changed, record it as a locator finding with
  its index. If it recurs in the same phase across replicates it is a real event and the
  event count will show it; if it does not recur it was the machine.
- When a bar is written as "no window over the limit" on rolling windows read more often
  than their length, count the frames over the limit and their events, not the windows. One
  slow frame sits in every window that contains it, so the count of failed windows follows
  the polling rate and the spacing of events rather than their number, and it can stay flat while the
  worst frame falls tenfold. The window bar may stay as the policy statement; the gate reads
  events.

## When not to use

Do not gate on a tail where the window holds too few frames for any percentile to be
anything but one of them; with a few dozen frames, report the sorted values and gate on a
paired comparison against a rerun instead.

Do not use the tail where the product's cost is a throughput over a long batch rather than
a per-frame experience: an offline simulation, a bake, a build step. The mean, or the total,
is the correct statistic there, and a tail gate would penalise variation that nobody feels.

Do not use a hitch count for quantities that are not per-frame. The duration of a load or
the cost of a one-off operation is a single number per run, and its noise floor is the
replicate spread; there is no distribution inside one run to take a tail of.
