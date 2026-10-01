---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: distinct-hash-seed-diversity-alarm
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a sweep has a large run count but few distinct starting conditions, win rates move when more seeds are added, a change removed a source of variation from the controllers]
---

# Distinct-hash seed diversity alarm

A run count is a claim of sample size. It is true only if the runs are independent samples of the
space, and a deterministic simulation fed seeds that map to the same initial conditions returns
the same outcome again: eight thousand runs that fall into five distinct starting patterns are
five samples with a long tail of copies. The technique is an alarm that compares the number of
**distinct outcome fingerprints** to the number of runs, and refuses to publish a rate when they
diverge.

Status of claims: the alarm is **measured** over simulated runs, and what it guards is the
**sample size of a simulated result**. It says nothing about whether the simulated drivers
resemble players. It tells the reader whether a result represents many different races or the
same few.

## Why the run count is not enough

- **Seed maps that collapse.** A seed becomes lane offsets, skill rolls or spawn patterns through
  a small formula. If that formula takes the seed modulo a small number, the whole range of seeds
  collapses to that many patterns. The collapse is invisible in the seed column.
- **A change that removes variation.** Replacing an implicit per-seed variation with an explicit
  authored setting can leave only the few remaining sources of variation. In one campaign a
  reviewer found that making controller skill explicit had dropped the old modulo variation, so
  eight-seed cells repeated outcomes and the preliminary win rates were largely a statement about
  five patterns.
- **Reuse of a seed prefix across replications.** Rerunning with a larger count and the same seed
  range reproduces the earlier runs and adds new ones; the "bigger" run is the old run plus a
  tail.

## The alarm

1. **Fingerprint the end state.** At the end of each run take a stable hash of the complete
   simulation state, not only of the headline outcome. Two runs that finished with the same winner
   but different physical state are different samples; the full-state hash distinguishes them.
2. **Count distinct fingerprints per scenario**, and per cell where cells have few runs, and divide
   by the run count.
3. **Compare to a declared floor.** The ideal is one distinct fingerprint per run. Declare a
   fraction just under one, read from the same rule table as the other alarms, and fail the
   scenario when the fraction falls below it, naming the failure "repeated seed outcomes". A floor
   of exactly one is brittle where a legitimate collision is possible; a floor just under one is
   honest about that.
4. **Run it per cell, not only per scenario.** A grid of cells with a small count each can look
   diverse in total while each cell repeats itself.
5. **Add variation inside authored bounds, at reset only.** When the alarm fires, the repair adds
   a seeded offset or phase within a range the design already authors for that behaviour, applied
   when the run is reset. It must add no advantage the rules did not already allow, consume no
   randomness during the step (which would shift later draws), and leave the unseeded legacy path
   bit-identical.
6. **Keep the preliminary figures and say how far they moved.** Rates that moved materially as
   seed coverage widened show how undersampled the first run was. In one campaign three win rates
   went from about 58, 49 and 35 percent to about 73, 37 and 31 percent once coverage was widened.
   That movement is a finding about the instrument.

## Craft notes

- A hash alarm catches repeated outcomes. It does not catch outcomes that are different and
  correlated, such as two seeds one apart that share most of their state. Spot-check a few
  neighbouring seeds' initial state; a derivation that avalanches makes them unrelated (see the
  per-cell seed derivation technique).
- Report the distinct count beside every rate, with the run count: "1,982 distinct of 2,000". The
  standard error from the preset technique applies to the distinct count, not the nominal one,
  when the two differ.
- The alarm is one of several: unresolved runs and one-shot rate sit beside it. Print an all-clear
  as "no declared numeric alarm fired", and add that this is not a quality verdict.
- Rerunning a study at a larger size with the seed unchanged is a known simulation-study pitfall
  in the statistics literature; changing the base seed on a rerun, and checking stability across
  several base seeds, is the standard remedy and composes with the per-cell derivation.

## Decision rules

- If the distinct fraction is below the floor, no rate from that scenario is published; the
  scenario is `not measured` until repaired.
- If a repair changes the seed map, rerun every affected scenario and quote only the rerun.
- If a rate moves by more than its standard error between seed coverages, the lower coverage is
  the one in error unless the repair changed the game.
- If a sweep is cheap, widen the seed range first; adding authored variation is for the case where
  the existing range cannot produce enough distinct states.

## When not to use it

- **When the simulation has no stochastic input.** One run is the answer, and a distinct count of
  one is correct.
- **When identical outcomes are the finding.** A scripted benchmark that must replay identically
  asserts the opposite of this alarm; use it for the determinism test, not the sweep.
- **As a substitute for independence.** Distinct states are necessary for independent samples and
  do not prove it.
