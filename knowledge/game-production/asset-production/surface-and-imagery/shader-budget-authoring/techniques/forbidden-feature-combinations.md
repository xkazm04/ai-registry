---
layer: technique
type: technique
subject: shader-budget-authoring
technique: forbidden-feature-combinations
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
use_when: [two material features are enabled together and the result looks wrong, building a cost estimator that sums per-feature deltas, a frame-time regression appeared with no obvious cause]
---

# Forbidden feature combinations

## The concern

Additive cost models are wrong in a specific, recurring way. Two features whose
individual costs are honestly measured combine into something that is not their sum —
either because they contend for the same pipeline stage and are semantically
incompatible, or because one multiplies the other's work. A model that adds deltas will
report a comfortable total for a material that does not compile, or that renders
incorrectly, or that costs several times the estimate.

The technique is to keep an explicit list of pairs, separate from the cost table, and to
have the estimator **refuse** rather than return a number when it hits one.

## The two shapes

**Contention.** Two features want the same stage and the second operates on the output
of the first as though it had not run. Real vertex displacement together with a
texture-space depth fake is the canonical pair: the fake computes an offset against a
surface that has already physically moved, so the depth is applied twice and disagrees
with itself. This is not expensive — it is wrong. Nothing in a cost model can express
it, which is exactly why it must live outside the cost model.

**Superlinear interaction.** One feature adds a per-pixel iteration loop; the other adds
work inside the loop. Their deltas were each measured alone, so each is honest, and
together the cost multiplies rather than adds. A stepped depth technique combined with a
second expensive lookup inside its steps is the usual instance. Nothing errors; the
frame just falls off a cliff.

## Procedure

1. **Maintain the pair list as data, checked before the sum is computed.** A forbidden
   pair short-circuits: no total is produced, because a total would be a fabricated
   number and someone would plan against it
   ([refuse-rather-than-destroy](../../../../_laws.md#refuse-rather-than-destroy)).
2. **Return the refusal as an error with a reason and a resolution**, naming both
   features, saying which stage they contend for, and saying which one to drop for which
   effect. "Choose real displacement for a silhouette that reads at the object's
   outline, or the texture-space fake for interior depth on a flat surface — not both."
3. **Distinguish the two shapes in the output.** A contention pair is an error and never
   ships. A superlinear pair is a warning with a measured multiplier, and it may ship on
   a hero surface with an owner's sign-off. Collapsing them into one severity means the
   real errors get waived along with the expensive-but-legal ones.
4. **Discover new pairs by measurement, never by reasoning.** The discovery rule is the
   whole method: a forbidden combination surfaces as a **compile failure**, or as a
   **cliff in profiled frame time** where the model predicted a step. It never surfaces
   as a linear increase. So the way to find them is to profile combinations, not
   features — and any pair that has never been profiled together is *unmeasured*, which
   is not a pass ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
5. **Record the evidence next to the pair.** The platform, the renderer version, and the
   measurement that established it. A pair inherited from a previous project on
   different hardware may no longer be true, and an unjustified prohibition costs look
   for nothing.

## Decision rules

- **When the estimate and the profile diverge by more than a factor of about two, look
  for a pair before looking for a mistake.** Divergence of that size is the signature of
  a non-additive interaction, not of an arithmetic error.
- **When a pair is forbidden, do not offer a "reduced" version of it.** Halving the
  iteration count of a technique that is wrong in combination produces something wrong
  and cheap. The resolution is always to drop one of the two.
- **When a feature is expensive alone, that belongs in the cost table, not here.** This
  list is only for interactions. A list that accumulates single-feature entries becomes
  a second, worse cost table and stops being read.
- **When two features are compatible but redundant, say redundant, not forbidden.** Two
  ways of expressing the same depth are a waste, not an error, and mislabelling wastes
  as errors trains people to waive errors.
- **When the pair list grows past a handful of entries, suspect the cost model.** Many
  interactions usually means the deltas were measured in isolation under conditions that
  do not resemble a real frame.

## When not to use it

- **When per-feature costs have never been measured at all.** An interaction list on top
  of guessed baselines is precision on top of fiction. Measure the features first.
- **When the renderer composes materials from a shared layered framework** that resolves
  such conflicts internally. Then the framework owns the pair list and duplicating it
  guarantees drift.
- **As a substitute for profiling the actual scene.** The list catches known pairs. The
  combination that will cost you the milestone is the one nobody has hit yet, and only a
  profile of the real frame finds it.
