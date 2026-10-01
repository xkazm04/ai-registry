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
combat, armour does nothing in it, so the best-fitting armour weight is near zero. The rating
then prices armour at nothing, a heavy class can collect it free, and the identity pair "armour
high" is satisfied without a cost. The weight is not wrong for the data; the data is silent.
The rule is to report any near-zero weight together with the mechanics the simulation did not
include, and to treat the rating as *not calibrated* for those mechanics until a run that
exercises them is fitted
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). Braking is the
other usual casualty on a course set with no demanding braking zones.

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
  transfer.
- When the course mix changes, refit. The weights embody the mix.

## Why not simply set weights equal

Equal weights across quantities of different scale would price a metre per second the same as
a kilogram. The per-point unit normalisation handles scale; it does not handle importance. A
point of speed and a point of braking are not the same value to the outcome, and the data
says so. The fit is the cheapest honest way to price them; the residuals say how far to trust
the price.

## When not to use it

When there are too few classes to constrain the fit — fewer vehicles than weights — the
solution is underdetermined and any residual table is a fiction. When the simulation is not the
shipping ruleset, the fit calibrates a different game; fix the harness first. And when the
rating is only a display, with no gate depending on it, spend the effort on the acceptance
check instead.
