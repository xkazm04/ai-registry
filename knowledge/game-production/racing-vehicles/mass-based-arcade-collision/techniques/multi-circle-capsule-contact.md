---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: multi-circle-capsule-contact
status: forged
laws: [structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a long vehicle needs flank contact, one car can sit inside another's drawn body, choosing how many circles a silhouette needs]
---

# Build a car's contact shape from a short chain of circles

## The concern

A circle is the cheapest and most forgiving contact shape, and a car is not round. The
repair is not a better shape but several circles of one radius placed along the car's
axis, so that the union approximates a capsule. Two decisions matter: how many circles, and
where they sit. Both are derived from the drawn silhouette so that what a player sees
touching is what the model treats as touching.

A pair of circles at the nose and tail is enough for a short car. As the car lengthens the
gap between the end circles widens, and past a certain length a smaller object can sit in
the gap with no contact registered. The player sees one car overlapped by another and the
model reports nothing. A third circle at the centre closes the gap.

Status: the existence of the gap and its closure are provable geometry and a unit test can
assert them. Whether the rounded corners and the slight stand-off at the ends feel right is
authored and unfelt.

## Procedure

1. **Derive the circle radius from the silhouette's width.** Radius is half the width, so
   the circles span the car edge to edge.
2. **Derive the end offset from the silhouette's length.** The length is two times the sum
   of the offset and the radius, so the offset is half the length minus the radius. Assert
   both identities for every car; a car whose drawn size and contact size disagree is a
   defect the roster check should catch.
3. **Place the circles at the offset along the heading, at plus and minus.** For a zero
   offset the chain collapses to one circle. For an offset small enough that the end circles
   already overlap by more than the radius of the smallest opposing circle, two circles are
   enough.
4. **Add a middle circle when the gap between the end circles can admit an opponent.** The
   test is: the clear gap between adjacent circle edges is larger than the smallest
   opposing circle's diameter. At the roster's shortest and longest lengths verify both
   ends of the rule.
5. **Test every circle of A against every circle of B.** The number of tests is the product
   of the two counts. The contact limit for a pair is the sum of their radii. Resolve each
   contact that is found with the inverse-mass split, using each circle's own world position
   as the contact centre for the lever arm.
6. **Write the regression test with a small opponent.** Place a small body in the gap
   centre of a long car and assert that a resolve moves it outward. This is the test that
   fails if the middle circle is ever removed.

## Decision rules

- **When a car's length is roughly twice its width or more, suspect two circles are not
  enough** and decide with the small-opponent test, not with the ratio; the ratio is a
  prompt to test, never the rule.
- **When two cars with different circle counts meet, accept the product,** not the minimum.
  A three-circle car against a one-circle car makes three tests, and each is a valid
  contact.
- **When the sides of a car must feel flat,** add circles rather than shrinking the radius.
  Shrinking the radius makes the body narrower than the drawing.
- **When contact tests per pair become a measurable fraction of the step,** reduce the
  number of pairs tested by distance first, then reconsider the circle count. The
  neighbouring threshold for partitioning says when the pair count itself is the cost.
- **When a contact has a coincident centre,** fall back to a fixed normal and a minimum
  distance, because the direction of an exact overlap is undefined and the substitute only
  needs to be stable.

## When not to use this

- **Do not use it where a car must slide flush along another's flank under pressure,** such
  as precision pushing in a puzzle. A chain of circles gives a scalloped side with ridges
  at the circle seams, and the response has a faint chatter along it.
- **Do not model a trailer, a hinged tail or a weapon arm as one chain.** Articulated parts
  need their own bodies and a joint, which is outside this technique.
- **Do not raise the circle count to approximate corners.** A sharp corner is a different
  shape; the technique's promise is roundness.
