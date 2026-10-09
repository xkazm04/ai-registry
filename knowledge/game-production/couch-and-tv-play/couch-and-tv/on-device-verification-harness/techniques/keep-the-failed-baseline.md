---
layer: technique
type: technique
subject: on-device-verification-harness
technique: keep-the-failed-baseline
status: forged
laws: [a-verdict-is-bound-to-its-content, no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a run failed an assertion and a later run passed, a measurement method was changed mid-investigation, a report is about to say a result improved or that a limit holds]
---

# Keep the failed baseline

The named concern: when a verification run fails, or turns out to have been measured with a
disturbing instrument, the record of that run is preserved and named, the change that followed
is described as a correction, and the final report states which claims the corrected run does
not support.

## The pull to tidy

An unattended loop that reruns until green produces a sequence of runs, and the natural
artefact is the last one. The earlier ones are overwritten, because the output path is the
same, or deleted, because they look like noise. The reader of the final report then sees a
clean result with no account of why the method looks the way it does, and the next person
simplifies the method and reintroduces the fault. Worse, the green run may have been reached
by narrowing the question: a threshold relaxed, a window excluded, an assertion dropped. From
outside, that is indistinguishable from a real improvement.

The rule that prevents it is that a measurement history is a result in its own right. The
failed run says what the game did under the earlier method; the successor says what it did
under the later one; the difference between the two is the only evidence that the change
mattered.

## What to keep

**The failing artefact whole.** The full output of the failed run under a name that says it is
the baseline, not a summary. Name the build fingerprint, the device, the date and the method
beside it.

**The reason it failed**, as a statement, including the failed assertion by name and its
observed count. "Three of four stale input frames were rejected where zero were allowed" is
a different finding from "the soak failed".

**The intrusive runs.** If an early measurement disturbed the system, the probe stalls are
evidence of the probe's cost. Keep them, and do not subtract the stalls from the record;
label them as caused by the instrument and explain how.

**The profiling that connects the two.** The measurement that identified the cause, with its own
numbers: the cost of the heavy step before slicing and the slice maxima after.

## How to report

Describe the later run as **measured corrections, not exclusions**. Name every correction: what
was changed, why, and what the earlier result was. Then write down what the corrected run
does not establish: which claims would be false if stated strictly (an "all windows are no
worse than the earlier run" claim when the worst window is marginally higher), which budget
was not met (a proposed performance bar the measured result misses), and what stays
unmeasured. A report that holds its own misses is one a reader can build on; a report that hides
them gets a rerun from a sceptic, with the first run's lessons lost.

The same applies to the original proposal. If the measured result is a baseline that differs
from the stricter bar that was proposed first, the report says the result is a baseline, and
that the bar is unmet, instead of silently moving the bar.

## Procedure

1. Write each run to a path that includes the method and a sequence or date; never to a
   fixed name that the next run replaces.
2. On a failure, copy the whole output to a baseline name before changing anything.
3. Make the change; run again; compare in a table of old and new per measure with units.
4. Write the corrections as a list: each item names the old method, the new method and the
   evidence that connected them.
5. Write the residual claims: what did not improve, what is not covered, what was not
   measured.
6. Bind the final report to the artefacts: the fingerprint of what was installed, the device
   and the paths of the kept runs.

## Decision rules

- **When a run fails an assertion that is not what the run was about, still keep it.** A
  failure of the zero-rejection assertion is a finding about the harness's synchronisation or
  the game's input handling, and it may recur.
- **When a later run is better only because something was excluded, say what was excluded.**
  If the exclusion is legitimate, such as a warm-up window, it is a declared rule.
- **When the corrected method changes the instrument, do not compare the runs without saying
  so.** The comparison is of two methods as well as two builds.
- **When no baseline exists, the improvement is a claim about nothing.** Do not write "better"
  without a kept denominator.
- **When storage is the concern, keep summaries of the baseline with its fingerprint and
  numbers, not nothing.** A bounded summary with provenance is evidence; a deleted file is not.
- **A passing report may not omit a failing sibling that shares its method.** If three runs
  were made and one failed for a reason that applies to the others, the others are qualified.

## When not to use it

A run that never started because of a plain environment fault, the device was asleep, the
cable was unplugged, is not a failed baseline; it is unmeasured, and is recorded as such
without clutter. And exploratory runs made while building the harness itself, before there is
any claim to bind, need not be archived.

## Evidence status

Measured on one device: a fifteen-minute baseline with twelve races failed its zero-rejection
assertion and had a worst transition several times the final one; it was kept, along with the
scenery profiling and the sampling change that explained the later run. The final report named
two misses against the originally proposed bar. The causes of the stale-frame rejections were
not isolated to a cause in the game or in the harness's timing.
