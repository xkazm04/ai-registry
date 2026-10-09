---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: oriented-capsule-grid-lint
status: forged
laws: [structural-proof-is-never-sufficient, one-authority-per-quantity]
shared_with: []
use_when: [checking that starting-grid slots do not overlap, a two-wide row is rejected as overlapping or a nose-to-tail overlap is accepted, the grid sits on a bend]
---

# Oriented-capsule grid lint

A starting grid is the one place where every car must stand on the road at once, on a bend if the
start is on one, with the road's heading different at each slot. The check that slots do not overlap
has to use the **silhouette the cars really have**: an oriented capsule, a line segment along the
car's heading with a radius, tested against every other slot's capsule with a margin.

## Why not circles, why not points

A bounding circle around a long car has the car's half-length as its radius. Two such cars standing
side by side on a two-wide row are far apart as bodies and overlapping as circles, and the check
rejects a row any driver would call fine. The designer's reaction is to space the slots out until the
check passes, and the grid becomes a long, thin queue that wastes the road's width and reads as
unfair to the back row. A point per car goes the other way: it accepts a row where one car's nose is
inside the next car's tail, because a point has no length.

A capsule has both properties. Its radius is the car's half-width, so side-by-side distance is judged
by width. Its segment is the length not already covered by that radius, so nose-to-tail distance is
judged by length. Tested in the plane, two capsules are separated when the **shortest distance between
their segments** exceeds the sum of the radii, plus a margin.

## Construction

For a slot at a position along the lap and a lateral offset:

1. Sample the track at that arc position and lateral offset to get a world point and the heading of
   the road there. Use that slot's own heading, not the heading at the start line; on a bend the rows
   fan.
2. The capsule's segment runs along the heading, centred on the point, with half-length equal to half
   of the difference between the car's length and its width. Its radius is half the width.
3. Between any two slots, compute the shortest distance between the two segments and compare it with
   the car width plus an authored margin. Segment-to-segment distance is zero when the segments cross
   and otherwise the least of four point-to-segment distances; implement the crossing test, not only
   the endpoint test, or two crossing segments report a positive distance.

The arc position of a slot is typically behind the start line, so it is negative as a fraction of the
lap. Wrap it into the lap before sampling, and test that a negative position works as a deliberate case.

## Which car

The slot is not yet assigned to a car when the track is authored, because the grid order depends on
qualifying or on a selection nobody has made. So the check uses the **roster's longest length and
widest width for every slot**, an envelope that no real car exceeds. That is conservative, and
intentionally so: it means a grid that passes is safe for every possible assignment, and a grid
whose rows fit the envelope never needs a re-check when the cars are shuffled. The cost is that a row
of small cars looks sparse. If that cost matters, the answer is a per-assignment check at race start,
not a looser authoring check.

## Keep the silhouette single-sourced

The capsule used here, the capsule or circles the collision code uses, and the shape the artist draws
should all derive from one dimension table. If the lint uses the table's length and width while
collision uses three overlapping circles derived from the same numbers, a test that asserts the two
agree is cheap and prevents the quiet divergence that lets the lint pass a grid on which the cars then
collide at the start. This is
[one authority per quantity](../../../_laws.md#one-authority-per-quantity) applied to a shape.

**Match the shape collision uses, which is not always a capsule.** A capsule rounds off the four
corners of a boxy body. Each corner sticks out past the capsule by about a fifth of the car's
half-width (the square root of two, minus one, times the half-width). Staggered slots on a bend
can meet corner to corner, and that is where the capsule under-reports. When collision is built
from circles or capsules, the capsule is the right lint shape. When collision or the drawn body is
an oriented box, use an oriented box with a separating-axis test, which costs about the same. If
the capsule is kept anyway, the margin must cover both corners' overhang.

## Margin

The margin is authored, a fraction of a metre in a game where cars are several metres long, so that
cars standing on a grid are not touching. It is a margin on distance between bodies and should be read
from the rules table with the other thresholds. Tune it as a feel decision, not a physical one: a
tighter grid reads as more aggressive.

## Related site checks

Every other site on the road is checked against the same car envelope. A pickup or a hazard must lie
inside the road with the widest car's half-width to spare after the verge, which turns the check into
`|lateral offset| + half-width <= road half-width at that position - verge`. The road half-width is
interpolated at the site's arc position, so a site that sits in a narrowing is caught where a
check against the nominal width would not.

## Author the grid on a straight

Motorsport builds a grid by construction: a stated length of road per car, a stated width held
through the first corner, on the start straight. Authoring tools can do the same. Find a straight
long enough for the whole field, and when a bend grid overlaps, move the start onto the straight
rather than loosening the margin. The capsule check still runs, as the guard for the case where
authoring did not avoid the bend.

## Procedure

1. Read the margin, the envelope car and the verge from the one authority.
2. For every ordered pair of grid slots, build capsules at each slot's own heading and test.
3. Fail with the two slot indices, the distance found and the distance required.
4. Add the mutants described under the mutation discipline: two slots moved onto the same place must
   fail, and a good two-wide row must pass. **Both directions.** A grid lint proven only on rejections
   may be rejecting everything.
5. Assert the slot count equals the expected field size; an empty or short grid otherwise passes
   because there is nothing to compare.

## What was measured, simulated, authored

The distance test is exact geometry. That a field of simulated cars starts from these grids without
frame-zero collisions is simulation. Whether a human finds the grid fair or a driver at the back
finds the first corner survivable is not known.

## When not to use this

- **For a rolling start** where cars begin already moving along the lane; use a following-distance
  check on the lane, not a standing grid.
- **When cars are near-identical circles**, where a circle test is correct and cheaper.
- **As evidence that the first corner is fair.** Non-overlap at standstill is the floor; what happens
  when six cars reach the first bend is a behaviour measured by running them.
