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
waist between the end circles deepens. An opponent's nose can then sink past the drawn flank
with no contact registered: the player sees one car overlapped by another and the model
reports nothing. A third circle at the centre makes the waist shallow.

The waist matters long before an opponent fits inside it. For two adjacent circle centres
`s` apart, an opponent whose radius sums with the car's to `R` sinks
`depth = R - sqrt(R^2 - (s/2)^2)` past the flank before it touches. On a real roster
(2026-10-09), a car at 2.8 times as long as wide with two circles let the smallest opponent
sink 60% of the car's width into its side, while the gap between its end circles was still
narrower than that opponent. A third circle cut the depth to 11%.

The chain is not the only cheap shape. A true capsule is a segment plus a radius. Its contact
test is the closest points of two segments, which is one test per pair, gives flat flanks
and has no waist at all. The chain earns its place when the solver already speaks only
circles, or when each circle's offset is wanted as the lever arm for spin.

Status: the waist depth and its reduction are provable geometry and a unit test can assert
them. Whether the rounded corners and the slight stand-off at the ends feel right is authored
and unfelt.

## Procedure

1. **Derive the circle radius from the silhouette's width.** Radius is half the width, so
   the circles span the car edge to edge.
2. **Derive the end offset from the silhouette's length.** The length is two times the sum
   of the offset and the radius, so the offset is half the length minus the radius. Assert
   both identities for every car; a car whose drawn size and contact size disagree is a
   defect the roster check should catch.
3. **Place the circles at the offset along the heading, at plus and minus.** For a zero
   offset the chain collapses to one circle.
4. **Choose the circle count from the waist depth you will tolerate, not from whether an
   opponent fits in the gap.** Author the tolerated depth as a share of the car's width.
   Compute the depth for every car against the smallest opponent; where it exceeds the
   share, add a middle circle (or more, evenly spaced) and compute again. The older test,
   "the clear gap is larger than the smallest opponent's diameter", only catches an opponent
   whose centre reaches the axis. It passes cars whose flank gives away more than half
   their width.
5. **Test every circle of A against every circle of B.** The number of tests is the product
   of the two counts. The contact limit for a pair is the sum of their radii. Resolve each
   contact that is found with the inverse-mass split, using each circle's own world position
   as the contact centre for the lever arm.
6. **Write the regression test with a small opponent.** Place a small body in the gap
   centre of a long car and assert that a resolve moves it outward. This is the test that
   fails if the middle circle is ever removed.

## Decision rules

- **When a car's length is roughly twice its width or more, suspect two circles are not
  enough** and decide with the waist depth, not with the ratio; the ratio is a prompt to
  compute, never the rule.
- **When flank contact must be exact and the solver can take one more shape,** use a true
  capsule instead of adding circles. One segment-distance test replaces the circle-pair
  product and the waist disappears.
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
