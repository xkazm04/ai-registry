---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: min-restitution-pairing
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [each vehicle carries its own bounciness, deciding a pair's rebound, a wall has no restitution of its own]
---

# Pair two restitutions by taking the smaller

## The concern

Restitution is a property of a surface or a body, but a collision is a property of a pair.
When each car carries its own number, something has to turn two numbers into one before the
impulse is computed. Three candidates are in common use: the product, the mean and the
minimum. The choice decides which car "wins" the rebound, and it is one line of code that is
rarely argued about and often wrong.

The mean lets a lively car make a dead one bounce. That reads as a bug: a soft, armoured
truck meeting a springy bumper car should absorb, not return, the energy. The product is
too dead at the low end, since a pair of cars each at one half end at one quarter and
nothing in the roster can bounce. The minimum states the physical intuition directly: the
less elastic of the two surfaces decides how much energy is lost, because a rebound cannot
return more than the deadest part of the contact can give back. It is also order
independent, which keeps the result identical when a pair is visited as (A, B) or (B, A).

Status: the minimum is an authored rule, not a measured one. The test that proves it is
arithmetic (the pair rebound equals the smaller value's); how it feels is not established.

## Procedure

1. **Author one restitution per body class,** in the same table as mass and size, in the
   range from zero to one. Zero is a dead stop and one is a perfect rebound; values above
   one add energy and need a stated reason.
2. **Resolve the pair value as the smaller of the two,** and use it only in the impulse
   scalar. Every use of the pair value is the same expression, so there is one place to
   change.
3. **Keep the pair value out of the position repair.** Restitution affects velocity; the
   overlap is fixed independently.
4. **Treat a boundary as a second body.** If the boundary has its own value, take the
   minimum with the car's. If it has none, say which side wins: either the boundary is
   assigned zero and the car is effectively dead against it, or the car's value is used
   alone. Write the choice into the technique's acceptance notes.
5. **Verify with an asymmetric pair.** Resolve a body of restitution 0.9 against one of 0.1
   and assert the outgoing relative speed equals one tenth of the incoming, then swap the
   arguments and assert the same.

## Decision rules

- **When two roles must feel different on contact, differ the restitution of the role that
  should absorb,** not the role that should bounce. The minimum means a high value alone
  buys nothing against a dead partner.
- **When a heavy class should never be bounced off by a light one,** author a low value for
  the heavy class. That uses restitution for feel and leaves mass to carry the weight, so
  two knobs are not fighting over one outcome.
- **When playtests say collisions feel "dead" across the board,** raise the values in the
  table, not the formula. The formula is correct and the table is what the designer owns.
- **When a boundary's behaviour differs from a car-to-car contact,** author the boundary
  value separately and say so. A boundary silently inheriting the car's number is a quiet
  second authority over the same quantity.

## When not to use this

- **Do not use it where the pair outcome should be an authored result of a matchup.** If a
  specific class against a specific class must always rebound a set amount, that is a
  table of pair values, and the minimum is not the right tool.
- **Do not pair by minimum for bodies of very different mass without checking the feel.**
  The mass split already makes the light body fly; a high restitution on the light body
  against a heavy one will have no effect, which is correct and surprising.
- **Do not store a restitution above one to fake a boost.** Energy added at contact is a
  separate mechanic and needs its own name and bound.
