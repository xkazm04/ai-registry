---
layer: technique
type: technique
subject: motion-quality-gating
technique: join-seam-continuity
status: forged
laws: [structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [accepting a looping clip whose first and last poses already match, concatenating clips into one motion or a sectioned montage, a generated in-between or regenerated join is offered as fixed, a loop or splice hitches although a pose check passes, choosing how to join motions that came from different producers]
---

# Join seam continuity

Every motion that is not one take has a join in it: the wrap of a loop, the cut between two
clips concatenated into one, the frames a generator filled between two keys. The join is
where a clip that is fine everywhere else pops, and it is the place the usual checks look
least. A pose check asks whether the two sides meet. That is half the question. Two sides can
meet exactly and still hitch, because the body arrives at the shared pose moving one way and
leaves it moving another.

## The rule

**Accept a join on two axes measured at the seam, and grade each apart: pose distance and the
velocity jump.** The velocity jump is the change in per-joint frame-to-frame motion across the
join: what the body was doing on the last frame before it, against what it does on the first
frame after it, RMS over joints. Measure both root-relative, so a clip that travels is not
failed for travelling. The join's verdict is the worse of the two axes, never their average,
because a perfect pose with a velocity break still hitches on every cycle.

A pose check alone passes the commonest broken join there is, the loop whose ends were pinned
to match. Pinning makes the poses meet and leaves the velocity free. In one measured loop fix,
pinning the same pose at both ends closed the pose gap to under a thousandth of a millimetre
while the seam's velocity jump stayed at about 29 mm per frame. A pin on the last frame alone
made the seam worse.

## Carry velocity, not just pose, into a regenerated join

When a join is regenerated rather than spliced, give the generator velocity, not only the two
poses:

- for a constrained regeneration, pin both ends and add a **velocity-matched frame** beside the
  seam: the seam pose stepped back by the first frame's own motion. In the measured fix this one
  frame halved the velocity jump;
- for a learned in-betweener, supply **several context frames on each side**, not one key pose,
  since a single pose carries no direction of travel.

## Join routes, in order of preference

1. **One continuation from the producer**, where it can make one: the second motion conditioned
   on the tail of the first, so the seam is never made at all (`self-conditioned-supply@media-playback`
   states the general rule for producers that condition on their own output).
2. **A regenerated join** with both sides pinned and velocity carried as above.
3. **A splice**, and only with the seam measured on both axes and every patched channel listed
   (root re-anchored, contacts re-derived, and so on), so a reader can see what the splice changed.

A linear crossfade across the gap is the **baseline a join method has to beat**, not a method. It
blends two poses and invents no weight transfer, so it is the arm every comparison of join
methods includes.

## Report the jump with its basis

A velocity jump in millimetres means nothing without the motion around it. A jog's ordinary
frame-to-frame change can exceed a walk's worst seam. So the seam report carries, beside the
jump, the clip's own frame-to-frame change on each side (a high percentile and the maximum, over
the same joints), and the unit, and whether it is root-relative. The verdict still comes from a
stated band; the basis is what lets a reader tell a hitch from a fast clip.

Which band decides is not settled here. On a sighted check of real seams, fixed millimetre
bands flagged the one seam that passed on pose and failed on velocity, and the viewer saw it
pop; a band scaled to the clip's own frame-to-frame motion would have passed it. Neither band
caught a seam the viewer also called a pop, where pose and velocity both passed. Choose the
band per clip family from graded seams, and record which band ruled.

## Decision rules

- **A seam nobody measured is not a passed seam.** A concatenation step that re-anchors the root
  and checks nothing has made joins with no verdict; the report says unmeasured, not clean.
- **A clip that was never meant to loop is not graded on its wrap.** It returns not-applicable,
  never pass.
- **The worst joint gets its own number.** An RMS over all joints hides one limb that is far out
  at the seam; report it beside the RMS.
- **Both axes passing is not acceptance.** The seam checks are structural. A join can pass both
  and still read wrong, from contact, timing or a retarget, so the perceptual gate still watches
  the seam itself, slowed down, with the seam frames marked.

## When not to use it

- **As the craft verdict.** These numbers are an integrity check. They say whether the join is
  broken, never whether the motion is good.
- **To compare clips of different speeds on one fixed band** without the basis beside the number.
  The same millimetres read differently in an idle and in a sprint.
- **On a cut that is meant to be a cut**, such as a camera change in a cinematic or a hard state
  change the design wants to read as instant. Declare those joins; do not grade them as seams.

## The failure this prevents

A walk cycle is fixed for looping by pinning its last pose to its first. The pose check reads
zero, the clip is marked fixed, and in game the character stutters once per stride, forever,
because the feet arrive at the shared pose decelerating and leave it accelerating. The number
that would have named it, the velocity jump at the wrap, was one subtraction away and nobody
asked for it.
