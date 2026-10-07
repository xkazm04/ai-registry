---
layer: technique
type: technique
subject: perf-regression-gating
technique: equivalence-before-the-saving
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [landing an optimisation of a deterministic simulation or parser, deciding whether a measured speedup may be claimed, an optimisation measured within noise and somebody wants to keep it anyway, recording the alternatives an optimisation wave tried and rejected]
---

# Equivalence before the saving

The concern: an optimisation makes two claims, and a performance gate usually checks only the
second. It claims that it changed nothing a player, a replay or a downstream reader can observe,
and it claims that it costs less. A faster simulation step that moves one car by one unit in the
last place has changed the game: replays diverge, a tuned balance shifts, and a bug report filed
against yesterday's build no longer reproduces. A faster parser that accepts one input the old one
rejected has changed a protocol. So the saving is not counted until the equivalence is proven, and
the equivalence is proven by something other than the optimisation's author's belief that the
change was pure.

## Procedure

**1. Prefer optimisations that are identical by construction.** Some changes cannot alter output if
they are written correctly, and they are the ones to try first: caching a value of a pure function
keyed on the exact bits of its inputs and recomputing when any bit changes; a precomputed table
built with the same expressions the loop used; a lookup by a name resolved once into an index into
the same storage the name lookup read; a coarse-to-fine search whose pruning provably cannot
discard the true answer. Each still gets step 2, because "by construction" is the claim the test
exists to check.

**2. Prove equivalence against a reference the change did not write.** For a deterministic
simulation, golden replays recorded on the parent commit — whole runs with a fixed seed and a fixed
step, chosen to exercise the code the change touched, contact-heavy if it touched collisions — must
replay bit-identical on the changed build. For a parser or a table loader, an oracle: the old
implementation kept in the test suite and run over every real input the product ships, comparing
the outputs and their order. For a fast path in front of a general one, a differential test: tens of
thousands of random inputs and mutations of real ones, each run through both paths, with every
disagreement a failure. For a precomputed table, raw-bit equality with the expression it replaced. A
reference recorded on the changed build certifies the change against itself
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)).

**3. Then measure the saving against the lane's noise.** The benchmark states its scenario, its
step count, its repetition scheme and its host; the saving is read against the spread the noise-floor
technique measured for that benchmark. A difference inside the spread is not a saving.

**4. Revert what did not pay, and keep the record.** An equivalent change whose saving is within
noise is reverted — it added code and bought nothing — and recorded with its hypothesis, its before
and after figures and the spread it fell inside. The record is the alternative that lost, and it is
what stops the next wave from trying it again on the strength of the same intuition.

**5. Measure in the order the changes will land.** An optimisation's value depends on what was
already removed. A bounding test that would have skipped an expensive inner loop is worth nothing
once that loop's dominant cost has been cached; an interleaved memory layout that helps a large
population does nothing for a small one. Each candidate is measured on top of the ones that landed
before it, and a rejected candidate is re-measured only if the stack beneath it changes.

**6. Keep the equivalence tests after the change lands.** The golden replays and the oracle are the
guard that the next optimisation is held to; deleting them with the reverted candidates leaves the
next change with nothing to be equivalent to.

## Decision rules

- **When an optimisation changes numerics — fewer samples, a different starting hint, a reordered
  sum — it is a behaviour change.** It needs a decision about the new baseline and a replay of the
  quality measures it might move, not an equivalence test it cannot pass.
- **When the golden replays do not cover the code path the change touched, the equivalence is
  unproven.** Add a replay that reaches it before claiming the change, and say which path was
  uncovered until then ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a saving is within the benchmark's spread, call it not better.** Not "small", not "within
  noise but kept"; not better, reverted, recorded.
- **When a saving is measured on a host, state the host.** A microsecond figure from a desktop
  virtual machine says the work shrank there; the device frame is a separate measurement
  ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
- **When an optimisation trades memory for time, report the memory.** A finer spatial index that
  halves the candidates may double the resident size of the structure, and on a small device that is
  part of the decision.
- **When an equivalence check is too expensive to keep in the suite, keep it as a switchable check
  and record the last run's size and result.** A check that ran once and was deleted is a claim
  without a witness.

## When not to use

Not for a change whose purpose is to alter behaviour — a tuning pass, a fix — where equivalence is
the wrong question and a replay baseline decision is the right one. Not for presentation-only
changes, whose equivalence is a picture comparison rather than a replay. And not as a reason to
avoid an optimisation that cannot be bit-identical: those are legitimate, and they are judged as
behaviour changes with their own review, not smuggled in under a performance label.
