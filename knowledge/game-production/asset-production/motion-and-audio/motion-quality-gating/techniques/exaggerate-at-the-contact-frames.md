---
layer: technique
type: technique
subject: motion-quality-gating
technique: exaggerate-at-the-contact-frames
status: forged
laws: [grade-against-what-ships-not-on-a-curve]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [an attack or impact reads in a close-up and not at gameplay size, a unit is small on screen and players cannot tell when its hit lands, a fix for an unreadable strike proposes slowing or lengthening it, animation keyframed from a reference video or capture at true proportion]
---

# Exaggerate at the contact frames

Motion taken at true proportion - keyframed from a reference video, solved from capture,
or synthesized by a model trained on real bodies - is right at the size it was authored at
and can vanish at the size a small unit is played at. A tail sweep that is a clear strike
in a close-up is a couple of pixels of travel on a unit a few dozen pixels tall. When the
player cannot tell when a hit lands, the read is missing from a handful of frames: the
contact frames, where the hit lands.

## The rule

**Push the part that carries the read past physical plausibility on the one to three
frames around contact, and only there.** The tail, weapon or limb that makes the hit goes
further than the reference on the contact pose, held a frame or smeared where the frame
rate allows. The anticipation and the recovery stay close to the reference, so the clip
still reads as a trained body moving.

The two fixes it replaces both spread the change over the wrong frames:

- **Lengthening the strike** makes the motion visible and late. It moves the hit, and any
  damage event bound to it, later against the input - a responsiveness cost the craft
  rubric does not score - and the tail still travels its true-proportion distance, only
  slower. Spacing slower also removes the snap that marks the moment of contact.
- **Scaling the amplitude across the whole clip** makes every frame rubbery and still does
  not mark contact, because the extreme is no longer reserved for it.

## Decision rules

- When playtest says "I can't tell when it hits", change the contact pose first, before
  adding frames, effects or hit-stop; those complement a readable contact, they do not
  replace one.
- Keep the strike's frame count and the contact frame where the responsiveness budget put
  them; this technique changes poses, not timing.
- A unit that fills the screen needs little or none of this; the push is for units small
  enough that true proportion does not read.

## Evidence

Measured 2026-11-11 (backlog 8-031, blind-ab): one probe, a small creature unit whose tail
strike was unreadable in playtest, with a proposal to lengthen the strike and keep the
reference amplitude. Both arms held this subject's golden path and the six-dimension
rubric. Placing the push on the contact frames scored 6 of 6 with this technique against 3
of 6 without; arms without it pushed amplitude across the strike or added a hold. Judging
the clip at the unit's gameplay size was found by both arms (6 and 6) and is not part of
this technique.
