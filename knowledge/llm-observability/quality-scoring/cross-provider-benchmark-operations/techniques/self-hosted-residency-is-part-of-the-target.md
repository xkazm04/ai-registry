---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: self-hosted-residency-is-part-of-the-target
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when: [a benchmark matrix includes a model served on your own hardware, deciding whether an open-weight model can run locally at all, comparing a local model's latency against a hosted one or against another local model, a local target's speed changes with context length or with what else is loaded]
---

# Self-hosted residency is part of the target

A hosted target's latency is a property of the model and the provider. A
self-hosted target's latency is a property of the model **and of where its
weights and cache actually live while the case runs** - accelerator memory,
host memory, or a split between them. The split is not fixed. It moves with
the context window the target was loaded at, because the attention cache grows
with it; with the weight format; and with whatever else holds accelerator
memory at that moment. A matrix that records a local target as a model name
and a quantization has left out the variable that dominates its latency column.

Measured on one workstation-class machine with 24 GB of accelerator memory: a
27B model in a 4-bit format ran fully resident at a small context, but loaded
at a 32k window it placed 10% of itself in host memory, and at a 64k window
30%, growing from roughly 17 GB of weights to 27 GB resident. A 12B model at a
32k window stayed fully resident. Put those two in one scorecard without the
split and the latency comparison is between offload and no offload, not
between two models.

## The rule

**Residency is an axis of a self-hosted target, declared before the run and
read back after it.** Treat it the way the matrix already treats a sampling
knob (sampling-knobs-are-axes-not-strings): the context window a local target
is loaded at is part of the target's identity, not a runtime detail, and two
windows are two targets.

## Procedure

1. **Screen for fit before admitting a target.** Resident size is priced by
   *total* parameters times bits per weight, plus the cache at the declared
   window. A sparse mixture-of-experts model is fast because few parameters are
   *active* per token, but every expert has to be resident somewhere, so its
   memory is priced by the total. A model with 300B total parameters and 15B
   active is roughly 170 GB at a 4-bit format and 100 GB even at 2-3 bits.
   Where the sum of accelerator and host memory cannot hold it, the target is
   not admitted locally. That is an eligibility result, not a missing cell, and
   the scorecard says which targets were screened out and why.
2. **Pin the window per target, in the declaration.** Load every local target
   at the window the workload needs and no larger. A default window chosen by
   the serving layer is an undeclared knob.
3. **Read the placement back, per run.** After warm-up, record the fraction of
   the target resident on the accelerator, as reported by the serving layer,
   into the result row beside the determinism stamp. A run whose placement
   differs from its declaration is a different target and is not compared as
   the same one.
4. **Hold co-residency fixed.** A generation pipeline, a second model or an
   embedding service that holds accelerator memory during one arm and not the
   other changes the split. Run arms against the same resident set, or unload
   everything between arms, and record which.
5. **Discard the cold load.** The first call pays the weight transfer, which can
   exceed the warm latency by two orders of magnitude and can change the output
   as well as the time. Warm each target and run it at least twice before
   reading its latency.

## Boundaries

Handicap disclosure records when a target was asked a *different question*
(handicap-disclosure-in-the-result-row); residency records the conditions it
answered the *same question* under. A local target truncated to a smaller
window to make it fit carries both: the truncation is a handicap, and the
window it ran at is its residency.

This technique does not rank serving layers or weight formats. Which format
loses least quality at a given size is a quality measurement, and it runs
through the matrix like any other target pair: two formats of one model are two
targets.

## What it cannot do

The placement fraction explains a latency difference; it does not predict one.
Offload cost depends on the host memory bandwidth and on which layers were
placed off the accelerator, so two runs with the same fraction on different
machines are not interchangeable. Residency makes a local latency column
honest on the machine that measured it and says nothing portable about any
other.
