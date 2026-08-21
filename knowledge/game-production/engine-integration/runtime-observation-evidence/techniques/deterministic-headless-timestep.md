---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: deterministic-headless-timestep
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a runtime measurement varies between machines, building a headless observation run, choosing between a render-less and a rendering run mode]
---

# Deterministic headless timestep

The concern: making an unattended run of a real-time system produce numbers that mean the
same thing twice. A quantity sampled from a loop whose rate is set by machine load is not a
measurement of the artifact — it is a measurement of the machine, wearing the artifact's
name. Derived quantities are worse than sampled ones: anything divided by elapsed time
inherits the noise and amplifies it, so acceleration and jerk metrics computed over an
uncapped loop can swing by an order of magnitude between two runs of identical content.

## Procedure

**1. Pin the simulation rate and decouple it from wall clock.** Run the world at a declared
fixed step, advanced by the harness rather than by real elapsed time, and state that rate
in the run's metadata. Sixty steps per second is a common choice because it matches the
content's authoring assumptions; the specific value matters far less than that it is fixed,
declared, and identical across the machines that compare results.

**2. Split the run modes by required tier, and make the split the only difference.** Two
modes: one with the renderer disabled — cheap, fast, safe on machines with no display —
serving every rung up to behavioural; one with an offscreen renderer at a declared
resolution, serving the perceptual rung. Build both from a single description of the
scenario so the only divergence between them is the render mode. When the two launch paths
are constructed separately they drift, and the drift shows up as a behavioural result that
cannot be reproduced under capture.

**3. Run unattended-clean.** No splash, no pause on error, no interactive prompt, no live
code reloading. Anything that waits for a human turns an observation into a hang, and a
hang is the worst failure mode a harness has: it consumes the timeout budget and then
reports something indistinguishable from a slow failure.

**4. Settle before the first sample.** Give the world a declared interval after load and
before the pre-act snapshot. Physics settling, streaming, and initialisation transients all
resolve inside it. Without a settle the baseline is a transient and every delta computed
from it is fiction. State the settle interval per run; different scenarios legitimately need
different ones, and the perceptual path usually needs a longer one than the behavioural.

**5. Isolate known confounders explicitly, one named switch each.** Remove the autonomous
agents that would interfere with the subject you are measuring. Drive a single motion
directly, bypassing the graph, when you need to decide whether a defect lives in the
skeleton or in the logic above it. Each isolation is off by default, named in the scenario
description, and recorded in the result — a reader must be able to see which confounders
were excluded from the run they are reading.

**6. Judge by emitted markers, not by process exit status.** A host process for a large
runtime may fault during teardown after doing all its work correctly, and may exit cleanly
having done nothing. Have the run emit structured markers describing what it observed, and
parse those. Where you can choose between a facility that reports through an exit code and
one that reports through parseable output, take the second even when it is slower; an exit
code carries one bit and it is usually about the wrong thing.

**7. Scope teardown to what you spawned.** Terminate by process identity, never by process
name. A name-based sweep at the end of a run will kill a colleague's live session on a
shared machine — an expensive lesson that costs a day of somebody else's work and produces
no observation at all in return. The broader discipline of driving a live runtime without
destroying it is a separate subject; this is the part that belongs to the observation run.

## Decision rules

- When a measurement differs between two machines by more than the calibration gap, suspect
  the timestep before suspecting the content.
- When a required tier is behavioural or lower, choose the render-less mode. Paying for a
  renderer you will not look at buys nothing and costs minutes.
- When a perceptual capture is requested, verify the scene is a lit one before running. An
  unlit scene renders black, and black is indistinguishable from a genuine render failure —
  you have spent the expensive run and learned nothing.
- When a run exceeds its wall-clock budget, terminate it and record the outcome as
  unverifiable with the elapsed time, not as a failure.
- When an expensive observation serves several consumers in the same cycle, run it once and
  share the artifact by cycle identity. Repeated boots of a heavy runtime are the main way
  an observation layer becomes too slow to keep.

## When not to use

Do not fix the timestep when what you are measuring *is* real-time performance. Frame
pacing, hitching, and thermal behaviour are properties of the uncapped loop, and a fixed
step hides exactly the phenomenon under study. Those measurements need a different harness
with a different honesty discipline; do not run them through this one.

Do not extend determinism into forcing a seed on systems whose variability is the product —
procedural generation, adversarial behaviour. There, fix the seed for reproduction of a
specific report, but measure the distribution across seeds for the general claim.
