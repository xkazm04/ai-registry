---
layer: technique
type: technique
subject: vehicle-archetype-balance
technique: weights-fit-to-sim-with-published-residuals
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [choosing the weights of a rating, a rating says two vehicles are equal and a race says they are not, reporting how far a rating can be trusted]
---

# Weights fit to a simulation, with the residuals published

The concern: a rating's weights decide what "equal strength" means, and a weight picked by
taste is an unexamined opinion. The technique is to pick weights by fitting them to simulated
race outcomes under constraints, and to publish how well the fit holds — the **residuals** —
beside the weights, so that "equal rating" is read as a summary with an error bar and never as
an equivalence.

Status of claims: the weights are a **simulated** calibration. The residuals are a **simulated**
measure of that calibration's error. Neither says anything about how a human perceives the
classes, and neither covers any mechanic the simulation did not exercise.

## Procedure

1. Run the roster through the declared course mix at a stated race count with every class at
   equal driver skill and record each class's performance as one comparable figure — for
   instance the inverse of its mean time, normalised to the tier mean, over the mixture.
2. Fit the weights so rating ratios track those performance ratios, under constraints that keep
   the rating interpretable: every weight positive, every vehicle inside the tier tolerance,
   weights tied together where the physics is one thing seen twice (the two halves of handling
   share a weight).
3. Compute the residual per vehicle: the gap between its performance ratio and its rating
   ratio. Publish the full set, and the worst. In the source's Pro tier the constrained rating
   ratios span about 0.97 to 1.03 while the observed performance ratios span about 0.947 to
   1.059; that spread is the honest statement of what "equal rating" means there.
4. Re-fit only with the same constraints and a changelog entry. A refit that moves a vehicle
   out of its tier is a roster change, not a calibration.
5. Re-run the independent recomputation of the constraints. The fitting tool is an optional
   dependency of the workflow and not of the game; its warnings are logged, and the saved
   result is validated by a separate recomputation, not by the fitter's own report
   ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

## What the fit cannot see

A fit is only over the mechanics the simulation exercises. If the harness runs movement and no
combat, armour does nothing in it, and the data says nothing about what armour is worth. The
rating can then price armour at nothing, a heavy class can collect it free, and the identity
pair "armour high" is satisfied without a cost. Braking is the other usual casualty on a course
set with no demanding braking zones.

**A silent stat's weight is unidentified, not zero.** The first version of this technique said
the best-fitting weight of an unexercised stat is near zero, and told the reader to look for
near-zero weights. The source's own refit showed that is not the signature. A roster of ten
vehicles fitted for eight weights leaves the silent stats free, and they land wherever the
exercised stats they correlate with push them. The original fit put armour and braking at its
lower bound (0.1). Nine days later a refit used the same bounds and movement-only data from the
replaced physics. It put armour at about 2.3, although armour still did nothing in that run. Neither
number is a measurement: one is a constraint bound and the other is a correlation. The rule is
to list every stat the simulation did not exercise and to mark its weight **unidentified**,
whatever its value. Treat the rating as *not calibrated* for those mechanics until a run that
exercises them is fitted
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). A weight sitting
exactly on a bound is a property of the fitter, and the report says so.

**The fit is bound to the ruleset it ran, not to the stats.** The weights describe how stats
turned into race outcomes under one movement model. Change that model and the weights are stale
even if no vehicle's stats moved. In the source, the movement step was replaced by a two-axle
solver within hours of the fit. Nobody refit. Eight vehicles whose stats never changed moved
their residuals, and one two-vehicle tier flipped: its pair now finished level while its
ratings sat six percent apart, at the edge of the tolerance. The budget check still passed
every vehicle. Only the residual table could see it. A refit on the new physics with the same
constraints cut the fit error by more than two thirds. Commercial rating systems show the same
thing at scale: a long-running console series recalculated its whole rating table twice in two
years.

## Decision rules

- When the residual of a vehicle is large and one-sided across several courses, the weights are
  wrong; when it is large on one course only, the course mix is a better suspect.
- When a fit wants a negative weight, the stat is anti-correlated with winning in the sample; do
  not constrain it positive and carry on. Check whether the stat is paid for twice in the
  mapping, or whether the sample is too thin to separate it from another stat.
- When the residual exceeds the budget tolerance, say so in the same table. A three percent
  tolerance on a rating whose fit error is six is a tolerance that cannot be enforced
  physically.
- When parts or upgrades change the mix of stats, refit; a fit made at stock settings does not
  transfer. Include the extreme parts in the fitting sample: the published exploits of rating
  systems run through one under-priced part. A tyre that cost little rating and still gave
  enough lateral grip is one example. The fix the vendor shipped kept the part's price and
  changed its physics.
- When the course mix changes, refit. The weights embody the mix.
- When the movement step changes, refit, even if no stat changed. Stamp the weights with the
  ruleset they were fitted on (a commit, a model name), so that a solver swap fails a check
  instead of leaving the old calibration standing.
- When the fitter lands a weight on a bound, report it as on the bound. Do not read it as the
  stat's price.

## Why not simply set weights equal

Equal weights across quantities of different scale would price a metre per second the same as
a kilogram. The per-point unit normalisation handles scale; it does not handle importance. A
point of speed and a point of braking are not the same value to the outcome, and the data
says so. The fit is the cheapest honest way to price them; the residuals say how far to trust
the price.

## When not to use it

When there are too few classes to constrain the fit — fewer vehicles than weights — the
solution is underdetermined and any residual table is a fiction. A margin of two or three
vehicles over the weight count is not much better. The residuals of the exercised stats can be
read, but the silent stats' weights cannot. When the simulation is not the
shipping ruleset, the fit calibrates a different game; fix the harness first. And when the
rating is only a display, with no gate depending on it, spend the effort on the acceptance
check instead.
