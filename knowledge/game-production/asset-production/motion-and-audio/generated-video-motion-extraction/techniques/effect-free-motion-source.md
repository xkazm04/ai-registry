---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: effect-free-motion-source
status: forged
laws: [a-prohibition-in-a-generative-prompt-plants-what-it-forbids]
shared_with: []
use_when: [writing the prompt for a clip that will be used as a motion source, a generated attack looks spectacular and its extracted motion is noisy, deciding whether impact effects belong in the clip or in the engine]
---

# Effect-free motion source

A motion-source clip carries the body and nothing else. Fire, trails, sparks, dust, magic,
smoke and impact bursts are added by the engine at runtime, under control of the gameplay
that triggers them. Baked into the clip they buy nothing, because nobody will see the clip,
and they cost the measurement in three ways.

- **They become the tracked point.** A silhouette rule, a detector and a segmenter all
  look for bright, moving, high-contrast pixels at the body's edge. Effects are exactly that.
- **They hide the contact.** An impact burst covers the weapon and the feet at the instant
  of contact, which are the frames a contact window and a foot-plant read most need.
- **They change the character.** A model asked for fire is asked for a different scene, and
  it may redraw the character to suit it.

A detector trained to ignore sparks recovers some of the tracking. Nothing recovers a blade
hidden behind a fireball, because the information is not in the frame.

## Measured once, on one model

One locally run video model, a two-panel clip with the same first frame and the same two
seeds, one sentence of the prompt changed from asking for no effects to asking for a blade
wreathed in fire with sparks, embers and an impact burst:

| Arm | Seed | r at lag 0 | best lag | mean row residual | top-row jitter front / side |
| --- | --- | --- | --- | --- | --- |
| plain | A | 0.982 | 0 | 10.1 px | 0.37 / 0.18 px |
| plain | B | 0.942 | 4 | 13.0 px | 0.19 / 0.06 px |
| fire | A | 0.861 | 4 | 26.9 px | 0.50 / 3.72 px |
| fire | B | 0.837 | -12 (edge of search) | 46.9 px | 1.65 / 1.01 px |

The frames show why. Rising embers became the top of the silhouette for the whole swing,
so the tracker followed sparks, not the blade. At impact the burst covered the blade and both
feet. In seed B the character's silhouette also changed once the fire took over. The fire
arm's strike window on seed A collapsed to one frame. The two arms differ by one sentence, so
the motion itself also differs between them, and this is two seeds per arm. It is a measured
example of the mechanism, not a rate.

## How to ask for it: the prohibition question

The bundle's law on prompts says that naming what a generator must not do plants it, so the
brief states what is wanted and the prohibition lives in a checker. The plain arm above used a
prohibition ("no effects, no fire, no particles") and produced no effects on either seed. That
is not evidence against the law. The clip's first frame was a clean render of the character
from both cameras, and an image-conditioned model takes most of its content from that frame;
the prohibition may have done nothing at all. Two seeds with no positive-only control cannot
tell a prohibition that worked from one that was overridden.

What would decide it is a three-arm run on the same first frame and seeds: the prohibition,
a positive-only description of the same scene (a bare steel blade, clear air, a plain studio),
and neither. Score each with the checker below. Until that has been run on the model in use,
follow the law. It costs nothing, and it is the safer default on a model whose behaviour is
unmeasured.

## Procedure

1. **Describe the plain scene positively and flatly.** A bare blade, clear air, an even light,
   a plain background, a still camera, the whole body in frame. Do not list effects to avoid.
2. **Condition on a clean first frame.** A render of the rig with no effects in it is the
   strongest instruction the clip gets.
3. **Check after generating.** Count moving pixels outside the character's silhouette envelope
   from the first frame. Watch the row residual and the frame-to-frame jitter of the tracked
   point, which rise when something other than the body becomes the point. Compare silhouette
   area to the first frame to catch a redrawn character.
4. **Reject, do not clean.** Re-roll a clip that fails. Masking effects out of the frames
   leaves holes exactly where the contact was.
5. **Record what the engine must add.** The effect the designer wanted goes into the action's
   runtime description, keyed to the measured contact window, so the intent is not lost when it
   is left out of the clip.

## Decision rules

- **When the effect is part of the motion's physics (a cape, a long sleeve, a chain weapon),
  it is not an effect.** It moves the body or is moved by it. Keep it, and expect it to need
  its own tracking.
- **When a clip shows an effect the prompt did not ask for, treat it as a failed clip.** Do not
  add a prohibition to the prompt to suppress it. Change the positive description or the first
  frame, and count the hit rate.
- **When the art direction needs the clip to look finished for a review, generate a second clip
  for the review.** The motion source and the presentation piece are different artifacts.

## When not to use it

- **For a clip a person will watch.** That is footage, and effects are part of its job.
- **For the effect's own reference.** Timing a fire trail or an impact flash from generated
  video is a separate measurement on a separate clip, with the body as context rather than as
  the subject.
