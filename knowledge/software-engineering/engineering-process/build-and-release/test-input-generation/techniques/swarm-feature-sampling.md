---
layer: technique
type: technique
subject: test-input-generation
technique: swarm-feature-sampling
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a randomized test draws each operation with fixed probability, deep or extreme states are never reached across many runs, choosing a distribution for a sequence generator]
---

# Swarm feature sampling

The default distribution in a sequence generator is uniform: each operation,
each feature, each variant drawn with equal and fixed probability on every
step. It is chosen because it looks neutral. It is not neutral — it is a
specific and badly-behaved choice, and it is the reason many randomized suites
never reach the states their authors most wanted tested.

## Why fixed uniform choice fails

Uniform draws over opposing operations produce a random walk that stays near
its origin. A container exercised with equal probability of insertion and
removal is, on average, nearly empty: the deep-container behaviour — the
resize, the rebalance, the eviction, the overflow — is not merely rare across
runs, it is rare *within every run*, and every run has the same expected shape.
Adding runtime does not help, because the tenth thousand run is drawn from the
same distribution as the first and has the same expected depth. The suite can
run for a year and truthfully report that it never tested a large container.

The general statement: **a fixed distribution is a constraint on the reachable
space in exactly the sense of
[generator-bounds-the-space](./generator-bounds-the-space.md)**, and it is the
one people fail to recognise as a constraint because uniformity reads as an
absence of choice rather than as a choice. What the check observed was the
distribution's typical output, not the system's range
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The technique: sample the probabilities, not only the values

Add one level of randomness above the one already there.

1. **Before each run, draw a configuration**: choose a random subset of the
   available features or operations to be active, and assign the selected ones
   random weights. Deactivated features have weight zero for that whole run.
2. **Generate the run from that configuration only**, rather than from the
   global distribution.
3. **Record the configuration with the seed.** It is part of the input and a
   reproduction is meaningless without it.

The consequence is a population of runs with genuinely different shapes:
some insertion-heavy and therefore deep, some removal-heavy and therefore
exercising the empty and underflow paths, some omitting a feature entirely so
that the remaining features interact without it. The aggregate covers states
that no single balanced distribution reaches with meaningful probability.

Two mechanisms are doing the work, and they are worth separating because only
the first is obvious:

- **Skew reaches extremes.** A run that only pushes reaches depths a balanced
  run never sees.
- **Omission removes masking.** This is the subtler and better-evidenced half.
  When a feature is always available, it can continuously suppress the
  condition another defect needs — a cache that is always being invalidated
  never grows stale, a compaction that always runs never lets a backlog form.
  Removing the feature entirely for a run lets the state it was suppressing
  actually occur.

## Evidence and its boundary

The technique is not folklore; it was published with measurement. Feature
omission was evaluated against default random generation under equivalent
compute budgets on a flash file system implementation and a satisfiability
solver, and found defects that the default distribution did not reach in the
same budget.

**And it carries a limit that practitioner retellings routinely drop**, which
matters because the technique is otherwise easy to over-apply:

> Feature omission wins when defects are *masked* by feature interaction. It
> **loses** when a defect requires several features to be active
> simultaneously — precisely the case where omitting one of them makes the
> defect unreachable.

So this is a distribution to add to a portfolio, never one to replace the
balanced generator with. The correct configuration includes runs at full
feature availability; a suite that only ever runs subsets has re-created the
original failure with a new shape, having made the all-features-together case
rare instead of the deep case rare.

## Choosing the feature set

The unit of omission should be a **feature the system branches on**, not an
arbitrary parameter:

- operations in a public interface, drawn as a sequence;
- optional behaviours that can be disabled — compression, caching, batching,
  background maintenance;
- fault classes in a fault-injecting generator, where omission means "this run
  has no disk errors" and skew means "this run is nothing but disk errors";
- configuration flags that select code paths.

Continuous parameters are a poor fit for omission and a good fit for the skew
half: draw the *range* per run rather than each value, so one run works
entirely with small values and another entirely with large ones.

## When not to use it

- **Where a single operation sequence is the specification** — a protocol
  handshake with a mandatory order — there are no independent features to
  select among, and the technique has nothing to act on.
- **Where the feature set is tiny.** With three operations, the subsets are few
  enough to enumerate deliberately, which is
  [exhaustive-when-bounded](./exhaustive-when-bounded.md) and strictly better.
- **Where features are not actually independent**, so that most drawn subsets
  are invalid configurations the system rejects at startup. Model the
  dependencies first, or the generator spends its budget being refused.
