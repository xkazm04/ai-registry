---
layer: technique
type: technique
subject: cross-runtime-rules-conformance
technique: golden-trace-conformance-vectors
status: draft
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input, structural-proof-is-never-sufficient]
shared_with: []
use_when: [proving a port computes what the reference computes, a conformance suite checks only final states, choosing scenarios for a vector set]
---

# Golden-trace conformance vectors

The named concern: a port is called equivalent to its reference because a handful of end
results match. End results hide routes. Two simulations can reach the same score through
different damage on different ticks. When an end result does differ, it cannot say where the
runtimes parted. A golden trace records the reference's route, and the port replays it step
by step.

## What a vector holds

- **Identity.** A name and a one-line note saying what rule the scenario is about.
- **Inputs.** The seed, the starting setup and the input for every tick, or every operation
  applied at a named tick. The port replays these inputs. It never re-decides them, because
  an input chosen by the port's own controller is not the reference's scenario.
- **Checkpoints.** The expected state at regular ticks, at every tick where an operation
  applies, and at the end. Each checkpoint is compared field by field.
- **The event log.** The ordered list of what happened, with ticks. Many rule differences
  show up as an extra or missing event long before they move a total.
- **The tolerance**, declared per vector ([declared-numeric-tolerance](declared-numeric-tolerance.md)).

The reference runtime writes all of it. Expected values saved from the port are not golden;
they are a snapshot of the port.

## Choosing scenarios

1. **One rule family per short vector.** Each spell, status, resource and clock gets a
   scenario that exercises it in isolation, so a failure names its family.
2. **Long mixed bouts.** A few scenarios run for a full session's length with many systems
   interacting. They catch compounding drift and limits that only long play reaches.
3. **Edges by construction.** Caps, floors, timers that expire on the same tick, ties broken
   by order. For each limit, check that at least one scenario runs long enough, or is set up
   far enough, to reach it. A scenario named after a rule that stops before the rule's limit
   cannot see a change to the limit.
4. **Seeds from the reference's own presets.** Where a balance simulation already has
   scenario presets, reuse them, so the vectors cover what designers actually tune.

## Replayer rules

- **Fail at the first difference, and say where.** Report the tick, the phase within the
  tick, the field path, the expected and actual values. One located failure is worth more
  than a count of differing fields downstream of it.
- **Check that every checkpoint was consumed.** A replay that stops early, or skips a row,
  passes every comparison it made.
- **Register one test per vector file**, discovered from the directory, and fail loudly when
  the directory is empty. An empty suite is green by default.
- **Compare the vector count with the file count.** A support file mistaken for a vector, or a
  vector silently skipped, changes what the green means.

## Decision rules

- **When a vector fails, read the first failing tick before the field.** The tick says which
  system ran; the field only says where the damage landed.
- **When the reference changes, regenerate every vector from the new pin** and review the
  diff of expected values as a design change.
- **When the suite is cited as evidence, cite its size, the pin it was generated from and the
  build it ran against.** A suite result without those is not reproducible.

## When not to use it

- **Rules that are non-deterministic by design**, with randomness not drawn from a seeded
  generator both runtimes share. Make the randomness seeded first.
- **Presentation.** Animation, audio and effects are outside the rules and vary per runtime
  on purpose. Vectors cover what the rules decide.
