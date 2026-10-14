---
layer: technique
type: technique
subject: depth-ordered-layered-art
technique: order-across-every-reachable-pose
status: forged
laws: [structural-proof-is-never-sufficient, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a layered picture explodes, opens or animates toward the viewer, the order is right at rest and apart but wrong in between, choosing the sample points for a motion check]
---

# Order across every reachable pose

## The concern

Keys that are right assembled and right apart are not therefore right in between. Every part
travels on its own spring, with its own start time, so at any instant each part has its own
share of its journey and the pair's relative position is a blend nobody drew. In one measured
case a line hid behind a column it was in front of for 40% of every explode, with both end
poses correct. A check that visits the rest poses reports a clean picture and a viewer sees
the defect on every interaction.

The second half of the concern is what a viewer can do, not what the author scripted. A quick
hover reverses the motion halfway. A part that left late is then late coming back, and can pass
through something that is already home.

## Procedure

1. **Put the motion in one place.** The stagger order and the spring constants live in one
   source shared by the page and the check, so the check replays exactly what the viewer sees.
   A check with its own copy of the constants measures a different animation.
2. **Replay the real motion with the real stagger.** Step the springs frame by frame, opening
   and closing, until they settle. Take every Nth frame if the cost demands it and state N.
3. **Add the reversals, placed at the structure of the motion.** A reversal is a state where
   the motion changes direction partway. Place one a few milliseconds either side of every
   stagger boundary, because those are the instants at which the set of parts in flight
   changes.
4. **Add the prefix states.** For each position k in the stagger: the first k−1 parts fully
   out, the k-th part at a quarter, half, three-quarters and all the way, the rest at home.
   This is the frame a reversal at a stagger boundary freezes, and each part's path must be
   clear of every part that has not yet left.
5. **Solve and check on the union.** The measured-order solver takes all of these states at
   once, each rule using that frame's shares. The check fails on any wrong pair at rest and in
   any replayed frame. Only the uniform states (every part at the same share, which no viewer
   sees) may hold an interlock, and they are listed, not failed.
6. **Report the number of states examined** beside the verdict
   ([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).
   A check over zero replayed states is the rest-pose check wearing a larger label.

## Decision rule: probe the structure of the motion, never round numbers

**Sample at the boundaries the motion has, not at times that look tidy.** In the measured case
the windows in which a reversal drove one part into another were about 15 ms wide. Probes at
0.15, 0.3 and 0.5 s missed every one; probes placed either side of each stagger boundary found
them. A defect window's width is set by the stagger, and a sampling grid unrelated to the
stagger is wrong in proportion to how narrow the window is.

## Authoring rules that remove most of the fixes

- **Whoever is outside leaves first.** On each side, the part that everything else is tucked
  behind or under moves first, and it is the last one home when closing. Closing is the
  reverse order, so the machine folds up from the inside out.
- **When a part's move vector points into a face of another part, that other part leaves
  earlier.** The target must be out of the way before the mover arrives.
- **Point every vector away from every face the part touches while the other side is in
  place**, not only the two it is attached to. A line threaded between two bodies moves in the
  sector both of their surface normals allow. A cable wrapped round a core may only move in the
  sector that is outward for its whole wrap; a wrap over half a turn allows nothing, so shorten
  it or end it on the near side.
- **Parts threaded through each other share one spring.** Two parts with separate springs
  that interleave will shear past each other during the stagger. Give them one value and let
  them travel as one.
- **A part moves with what it is mounted on.** A sensor bolted to a body rides that body's
  spring even if it highlights with another group. A part that borrows another group's vector
  but keeps its own spring slides along its mount and sinks into it mid-flight.
- **On a reversal, reschedule only what changes.** Cancel the pending target of every part that
  has not yet left, and stagger only those whose target changes, by their index in that shorter
  list. Rescheduling the whole list sends the early parts flying toward apart while later parts
  sit at home, and the picture works only because the next part moves out of the way a few
  milliseconds later.

## When not to use it

- **When the picture does not move, or moves only in the plane of the screen.** Order cannot
  change if nothing moves toward or away from the viewer.
- **When the motion is bounded so the order never changes.** A part that never crosses in
  front of or behind its neighbour needs the rest-pose check and one proof of the bound.
- **When the viewer cannot interrupt the motion.** A scripted one-way sequence has no
  reversals; the prefix states and reversal frames then check nothing a viewer can reach. State
  that, and do not run the work.
- **As a substitute for the authoring rules.** A check that finds sixty-six pass-throughs in a
  first explode is evidence the stagger order was never designed; fix the order first.

## What rests on code only

The 40% window, the roughly 15 ms bad windows, the 66 pass-throughs before the stagger was
ordered, and the prefix-state construction come from one toolkit's own measurement. The general
claim, that a time-varying order must be sampled where its structure changes and not on a
regular grid, is standard sampling practice and does not depend on that source.
