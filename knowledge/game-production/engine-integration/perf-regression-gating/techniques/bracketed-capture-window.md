---
layer: technique
type: technique
subject: perf-regression-gating
technique: bracketed-capture-window
status: forged
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input]
shared_with: []
use_when: [deciding which frames of a run a cost gate measures, a symptom lasts a second inside a long session, a capture is started and stopped by hand or by an automated agent, a warm-up cost is polluting a steady-state number]
---

# Bracketed capture window

The concern: which frames of a run are measured. A cost number is a statistic over a
window, and the window is a choice that changes the number as much as the code does. Left
to hope — the capture starts when someone is ready and stops when they are satisfied — the
window is an uncontrolled input, and a gate whose inputs include a person's timing is not
reproducing anything. The rule is that the window is a property of the scenario, fixed in
advance and recorded with the verdict.

## Procedure

**1. Bound the window with the scenario's own phase markers.** The scripted scenario emits
a marker when each phase begins: load, settle, quiet, stimulus, recovery. The capture opens
at one marker and closes at another, and both are functions of the scenario's frame
counter or phase, not of wall-clock time and not of anyone's judgement. The verdict records
the two markers and the number of frames between them.

**2. Precede the stimulus with a quiet phase.** A stretch of the same scenario in a
known-idle state, captured immediately before the stimulus in the same run, gives the run
a reference of its own. At the least it is a drift indicator reported beside the verdict —
if the quiet frames of two runs of one build differ, the machine moved between them. Where
the stimulus is the only difference between the phases, the symptom can also be read as the
difference between the stimulus window and the quiet window of one boot, which cancels part
of what the machine was doing that minute. The quiet phase is a within-run reference only;
it is never the baseline the gate compares across builds, which is a separate artifact with
its own binding.

**3. Exclude warm-up by construction.** The first frames after a load, and the first use
of any feature, pay for things the steady state does not: lazily built resources, caches
filling, streaming catching up, first-touch memory. They are real costs and a different
quantity from the one this window measures. Exclude them by starting the window after a
declared settle phase. To place the end of warm-up for a given lane, slide the window's
start across the opening seconds of unchanged runs and watch the gated statistic; the point
beyond which it stops moving with the start offset is the end of warm-up for that lane, and
it is found by measurement, not by reasoning about what ought to be settled.

**4. Do not discard the warm-up cost; route it.** If first-use cost matters to players, it
has its own window, its own statistic and its own baseline. Excluding it from the
steady-state gate is not the same as deciding nobody cares.

**5. Capture the smallest window that contains the symptom.** A symptom that lasts a
second inside a ten-minute session is about a sixth of one percent of the frames, and a
statistic over the session moves by almost nothing when that second doubles in cost. A tight window
makes the symptom a large share of the sample, so the statistic moves when it should.

**6. Make an intermittent symptom appear on cue, and repeat the window.** Lengthening a
window to catch something that happens sometimes only raises the odds of catching it at the
price of everything else the window now contains. The scenario triggers the symptom, the
window brackets the trigger, and the whole window is repeated as replicates. The unit of
replication is the window; the gated statistic is computed per replicate and aggregated
across replicates, because pooling the frames of many replicates hides the variation
between runs that the noise floor exists to measure. A symptom that cannot be triggered by
script cannot be gated by this stage, and belongs to field telemetry instead.

**7. Let the scenario drive the capture, not the party under test.** Whoever starts and
stops the capture by judgement chooses the window, and a window can be drawn around a
regression or away from it. When the producer of the change, a person or an automated
agent, also picks the window, the verdict is the producer's own claim
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)). A capture facility
that only offers manual or agent-driven start and stop is wrapped so that the scenario
sends the signals, or its output is labelled exploratory and kept out of the gate.

**8. Test an agent-driven capture instead of trusting it.** Where a facility offers
automatic start and stop, treat its reliability as a hypothesis about one's own tooling:
run it repeatedly against an unchanged scenario and compare the windows it produced — frame
count, the phase each began and ended in. If their variation is a visible fraction of the
effect to detect, the capture driver is a noise source, and it is characterized like any
other before it is allowed to block.

**9. An empty window is a loud failure.** A capture that started and never closed, or
closed with no frames in it, or whose end marker never fired, is unverifiable with the
reason *window*. It is not zero cost and it is not a pass, and the splitter never guesses
a start when the marker is absent
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).

**10. Use the fixed step to check the window's length.** At a declared fixed step the
number of frames in a window is a function of the plan: the scenario's duration times the
step rate. A captured window whose frame count differs from the plan by more than the
step's own granularity was truncated, or was not run at the declared step, and the verdict
is unverifiable with the reason *window* instead of a number computed from the short
window. The check is free, because the expected length costs nothing to know.

**11. Count the instrument's own artifacts and drop them out loud.** The first frame a
profiler records, or any frame with a non-positive duration, is an artefact of the
instrument and not a cost. Drop such frames from the window, count how many were dropped,
and report the count beside the verdict; a frame coerced to a number to keep the length
right is a fabricated input.

## Decision rules

- When the window is wide enough that the symptom is a small share of it, narrow the window
  to the symptom and repeat it; do not lengthen it.
- When the statistic still drifts with the window's start offset, the settle phase is too
  short for this lane; lengthen the settle, not the window.
- When the symptom cannot be scripted, the stage cannot gate it; record it as unverifiable
  for the stage and move it to a different kind of evidence.
- When two captures of the same scenario differ in frame count or phase alignment, the
  statistic over them is not comparable; the difference in windows is reported with the
  difference in numbers.
- When the same frames serve two gates, say so; a window shared by a percentile gate and a
  hitch gate gives them correlated verdicts, and a roll-up that counts them as independent
  evidence overstates agreement.

## When not to use

Do not bracket a window for endurance. A slow leak, a clock that throttles after several
minutes and a cost that creeps upward over a long session are trends, and the long window
is the measurement; they are gated as a slope over a stated duration, in their own lane.

Do not insist on a scripted window for exploratory profiling. A person who is hunting for
the cause of a symptom starts and stops the capture by hand, and that is the right tool for
the investigation. The output is evidence for a diagnosis; it is not a verdict, and it is
labelled so.

Do not use a window to dodge the sample-size question. A very tight window gives a tail
statistic too few frames to mean anything; the percentile technique states how many frames
beyond the cut a statistic needs, and the answer to a window that is too small is more
replicates, not a looser statistic.
