---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: inverse-mass-impulse-split
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [two cars of different mass touch, a heavy car must win a shove, cars sink into each other or jitter apart]
---

# Split the position repair and the velocity impulse by inverse mass

## The concern

Two bodies overlap and are approaching. Two separate quantities have to be repaired, and
both must be shared out between the bodies in the same proportion, or the heavy car stops
being heavy. The proportion is the inverse mass: a body with a third of the mass takes
three times the share. Written once, as a sum of inverse masses, it serves the displacement
and the velocity change alike.

The failure of the naive reading is to split the work evenly because the contact is
symmetric, or to move only the lighter body and leave the heavy one as a static wall. The
first makes a small car and a truck trade places like equals. The second is a hidden
assumption that the heavy body never moves, which is wrong the moment two heavies meet.

Status of the claims here: the momentum and the share ratio are arithmetic and a unit test
proves them exactly. How heavy "heavy" should feel is authored and has not been felt by a
person.

## Procedure

1. **Compute the inverse masses and their sum once per contact.** `invSum = invA + invB`.
   A body with no mass limit (a fixed obstacle) has an inverse of zero and is the only
   legitimate way to make something immovable. Guard the sum: if it is zero, both bodies
   are fixed and nothing is resolved.
2. **Find the contact normal from the two contact centres, pointing from A to B.** If the
   centres coincide, substitute a fixed axis instead of dividing by a near-zero distance;
   the substitute only has to be deterministic.
3. **Split the position by inverse mass.** The overlap is the sum of radii minus the
   centre distance, plus a tiny margin so the pair ends separated rather than exactly
   touching. Move A backward along the normal by `overlap * invA / invSum` and B forward
   by `overlap * invB / invSum`. The two shifts sum to the overlap, so the pair separates
   in one repair.
4. **Test whether the bodies are still closing.** The relative normal velocity is B's
   velocity minus A's, projected on the normal. If it is not negative the bodies are
   already separating and no impulse is applied; applying one anyway adds energy.
5. **Compute one scalar impulse.** `j = -(1 + e) * relative / invSum`, where `e` is the
   pair restitution chosen by the pairing technique. Apply `-j * invA * normal` to A and
   `+j * invB * normal` to B. Total momentum is unchanged, and each body's velocity change
   is its share of `j`.
6. **Read the check back as a ratio.** For a pair of 600 and 1800 mass units where only the
   lighter moves, the lighter body's velocity change divided by the heavier's is exactly
   three. State this as the acceptance test; it fails loudly if someone swaps in an even
   split.

## Decision rules

- **When two bodies overlap but are separating, repair position only.** A velocity
  impulse on a separating pair makes bodies stick or pull together.
- **When the pair is resolved more than once in a step, keep the closing test on every
  pass.** The second pass finds the pair separating and does nothing, which is what stops
  restitution from being applied twice to one meeting.
- **When the mass ratio between the extremes is below about two, widen it before tuning
  the solver.** The contact is not at fault; the roster has no weight classes to express.
- **When something must be immovable, give it an inverse mass of zero** rather than a large
  mass. A large finite mass still moves and still accumulates error over a long session.
- **When the overlap found each step is a large share of a circle radius, suspect speed,
  not the solver.** A fast pair tunnels or sinks; reduce the step, cap the speed or sweep
  the contact. Do not raise the positional correction to compensate.

## When not to use this

- **Do not use it for a body whose contact must be governed by a spring or a rope.** Those
  are soft constraints with their own stiffness and damping, not an instantaneous impulse.
- **Do not use a single-scalar impulse where the contact point's own velocity matters,** such
  as a fast-spinning wheel grinding on a wall. The scalar uses the centre velocity only; the
  spin technique states what is deliberately ignored.
- **Do not add a percentage-and-slop position scheme on top** unless pairs demonstrably
  jitter. The full separation is exact for circle pairs; softening it is a stability tool
  for stacked bodies, which a racing field does not produce.
