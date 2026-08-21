---
layer: technique
type: technique
subject: test-harness
technique: history-driven-partitioning
status: forged
stage: team
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [splitting one suite across parallel workers, one worker always finishes last, adding parallelism stopped helping]
---

# History-driven partitioning

Splitting one suite across parallel workers is a bin-packing problem, and the naive solutions
solve the wrong one. Distributing by file count, alphabetically, or by hashing a name all
optimize for *equal numbers of tests*. What matters is **equal duration**, and test durations
in a real suite span three or four orders of magnitude.

This is within-suite distribution, distinct from suite-partitioning, which decides which tests
form a machine together in the first place. Partition into suites first; only then split a
suite across workers.

## Why the naive split wastes most of what you buy

A suite of 16 minutes across 4 workers has a floor of 4 minutes. Split by file count, the
typical outcome is one worker at 9 minutes and three at 2 or 3 — because a handful of files
hold the integration-flavoured tests and the rest are fast. Wall clock is set by the slowest
worker, so the run takes 9 minutes: the parallelism bought 44% of its potential, and doubling
the workers again buys almost nothing, because the 9-minute worker does not divide.

The tell is easy to check and almost nobody checks it: **compare the slowest worker's duration
against the mean**. A ratio near 1 means the split is working. A ratio of 2 or more means most
of the capacity is idle, and the fix is the split, not more workers.

## Split by measured duration

1. **Record per-test duration on every run**, keyed by stable test identity.
2. **Partition to equalize predicted total duration**, not count. Longest-first greedy
   assignment — sort tests by duration descending, assign each to the currently-least-loaded
   worker — is within a few percent of optimal and takes ten lines. Nothing more sophisticated
   is needed.
3. **Rebalance continuously.** The distribution is recomputed from recent history, not frozen
   at the moment somebody tuned it. A hand-tuned split is correct on the day it is written and
   decays from then on.

The history is the same retained, stably-keyed result store that flake detection needs, per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse). Identity keyed by file
path plus position breaks whenever a test is inserted; a rename resets a test's measured
duration to unknown. Both degrade the split silently — nothing fails, the run just gets slower
— which is why this is stated as an identity requirement rather than a storage detail.

## The cold-start problem

A test with no history has no predicted duration, and the naive handling — assume zero — puts
every new test on one worker, which is precisely where new slow tests appear.

- **Assign unknown tests a pessimistic default**, at or above the suite's current median, so an
  unmeasured test cannot silently unbalance the split.
- **Distribute unknowns evenly** across workers rather than grouping them.
- **Measure on the first run** and use the real number from the second onwards.

A suite whose history has just been reset — first run after adopting this, after a mass rename,
after a retention window expires — is entirely cold. It will be badly balanced once. That is
acceptable and expected; what is not acceptable is a system that stays cold because nothing
writes the history back.

## What the split must not break

- **Ordering dependence.** If tests depend on execution order, splitting exposes it as
  intermittent failure that looks like flakiness. That is a real defect the split *revealed*,
  not one it caused — fix the dependence rather than freezing the split to hide it.
- **Shared exclusive resources.** Tests contending for one port, one directory, or one external
  account cannot be distributed by duration alone; they need per-worker isolation, or they need
  to be in a serial lane. That is isolation-lanes' subject, and it constrains this one.
- **Setup amortization.** If workers each pay an expensive per-worker setup, the split has a
  fixed cost per worker and there is a point past which more workers make the run slower.
  Measure it rather than assuming; the crossover is usually lower than expected.

## The numbers to publish

Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate), each with its
window and worker count:

- **Slowest worker over mean worker.** The efficiency of the split, and the one number that
  decides whether to fix the split or buy capacity.
- **Total suite duration and wall clock.** Their ratio is the realized parallelism.
- **Count of tests with no duration history.** A quietly growing number here explains a
  quietly degrading split.

## When NOT to split

- **The suite already fits its budget.** Splitting adds a per-worker setup cost and a class of
  order-dependence failure. Do not pay for it before it is needed.
- **The suite is dominated by one long test.** No split helps; the floor is that test. Split the
  test or accept the floor.
- **Workers are not free.** Above the setup-cost crossover, more workers is a slower, more
  expensive run.

## Decision rules

- Partition into suites first; split a suite across workers second.
- Split by measured duration, never by count, name, or hash.
- Longest-first greedy assignment is sufficient; nothing more elaborate is required.
- Recompute from recent history every run; never freeze a hand-tuned split.
- Unknown-duration tests take a pessimistic default and are spread evenly.
- Publish slowest-over-mean, realized parallelism, and the count of unmeasured tests.
- Order dependence exposed by a split is a defect revealed, not a reason to freeze the split.
