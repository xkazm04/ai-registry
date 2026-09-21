---
layer: technique
type: technique
subject: eval-harness
technique: rebase-the-varied-input
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [writing an invariance check that replays one scenario with a single input shifted, a purity or determinism check has never failed since it was written, a comparison normalises timestamps ids or offsets before diffing]
---

# Rebase the varied input

An invariance check asks one question: if I move exactly one input and hold
everything else, does the output stay the same? Replay a scenario at two base
dates and assert the recall is identical, and a component that reads the wall
clock is caught. Run it under two random seeds with the seed-dependent part
held, and a hidden source of nondeterminism is caught. The shape is cheap,
general and strong, and it has one way to become vacuous that reading the check
will not reveal.

**The quantity you varied reappears in the output.** A correct component
renders the injected instant into what it returns, so the two replays differ in
every date they print. A naive comparison fails on every probe, forever. The
reflex that fixes that is to mask the field before comparing (replace every
date with a placeholder), and it works: the check goes green. It also removes
the only place a wall-clock read is likely to show. A date rendered from the
writer's clock instead of the injected one lands in exactly the field the
normaliser erases, so the check reports identical output on both arms.

Measured on a memory harness's own clock-purity check, as a 2x2 with no model
calls. Two backends: the stock one, and a copy that stamps the wall clock onto
every line of recalled context. Two normalisers: the shipped mask, and a
rebasing one. The contaminated backend **passed the shipped check on 46 of 46
probes**, although every line of its recalled context was wrong. The rebasing
normaliser failed it on 46 of 46. The clean backend passed under both, so the
fix bought its reach without a single false positive.

## The rule

**Normalise a varied quantity by the inverse of the variation, never by
erasure.** If the replay shifted a base date by N days, rewrite each date as its
offset from *that arm's* base. A date derived from the injected clock yields the
same offset on both arms. A date read from anywhere else is off by exactly N.
The comparison keeps its full reach over the field and still tolerates the
difference that is supposed to be there.

The same move generalises to every injected quantity:

| Varied input | Erasure (vacuous over that field) | Rebase (keeps the assertion) |
| --- | --- | --- |
| base date / clock | every date becomes a placeholder | every date becomes an offset from the arm's base |
| seed | every generated id becomes a placeholder | ids re-keyed by first appearance, so identity *structure* is compared |
| working directory / root | every path becomes a placeholder | paths made relative to the arm's root |
| locale / timezone | every formatted value becomes a placeholder | values parsed back to a canonical form, then compared |

Erasure is still right for a quantity the check did **not** vary and that is
nondeterministic by nature: a fresh identifier minted per run carries no
relationship to anything you injected, and there is nothing to rebase it
against. The discriminating question: **is this field a function of the input I
moved?** If yes, it carries the signal, so rebase it. If no, it is noise, so
erase it. A field that is both (an id derived from a seed, a filename derived
from a date) gets the rebase.

## Where this sits among the ways a pass is vacuous

A pass is evidence only where a failure was reachable. The other two failures
of that assumption live in the scenario (the candidate can answer it without
the material under test:
[unaided-baseline-screening](./unaided-baseline-screening.md)) and in the
incentive (an all-green run is compatible with doing nothing:
[overshoot-and-restore](./overshoot-and-restore.md)). This one
lives in neither. The scenario discriminates and the check targets the right
property, but the step between *running* and *comparing* removes the quantity
that carries the difference. Screening the scenario does not find it, and
neither does pushing against the boundary. Only an arm built to fail finds it.

That is also why this one survives for months. The check was written for
exactly this defect, it names the defect in its own docstring, and it has been
green on every backend it has ever seen. A check that has never failed is either
guarding a clean system or guarding nothing, and the run cannot tell which from
inside.

## How to test for the property

- **Build the contaminated arm before trusting the check.** Take the cleanest
  backend and change one thing, so it reads the varied input from the forbidden
  source (the wall clock, an unseeded generator, the process cwd). Run the
  check. It must fail. If it passes, the normaliser is erasing the signal.
  Keep that arm in the suite as the check's own negative control.
- **Run the 2x2, not the one cell.** Clean backend and contaminated backend,
  crossed with the old normaliser and the new one. The new normaliser has to
  catch the contamination *and* keep the clean backend green. A normaliser that
  catches everything by failing everything has traded a false negative for a
  false positive and gained nothing.
- **Grep the normaliser for every pattern it replaces, and ask the
  discriminating question of each.** Every substitution to a constant
  placeholder is a field the assertion does not reach. Write down, beside the
  pattern, whether it is noise or a function of the varied input.
- **Report the reach with the result.** "Clock purity PASS" is not a finding.
  "Clock purity PASS over structure, item count and rebased dates; ids erased"
  is. The predicate is part of the number
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Boundaries

- **This does not make a nondeterministic layer checkable.** A component that
  calls a sampled model returns different text on every run, whatever the clock
  did. Rebasing dates does not fix that. Such a layer is either held out of the
  invariance check with the exclusion stated, or checked on a property that
  survives sampling. The rebase only guarantees that the layers you *do* compare
  are compared on everything they render.
- **It is not snapshot normalisation.** An approved snapshot erases
  nondeterminism so a recording stays stable across runs, and the rule there is
  to normalise in the serialiser. That rule is about a recording. This one is
  about an assertion whose whole content is a controlled variation, and there
  the fields that vary are the evidence, not the noise.
- **It does not choose the shift.** Pick a shift the component cannot absorb.
  Shifting a date by a whole number of weeks hides a component that reads only
  the weekday, and a shift inside one daylight-saving regime hides a timezone
  bug. The contaminated arm tells you whether the shift was big enough, because
  it has to fail.
