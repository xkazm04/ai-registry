---
layer: technique
type: technique
subject: concept-scene-parity
technique: score-only-what-the-device-shows
status: forged
laws: [a-number-carries-its-unit-and-basis, no-gate-self-certifies]
shared_with: []
use_when: [setting up the capture a look scorecard is read from, a capture looks better than the device ever will, a framing or field of view seems to have changed between rounds, the concept shows an effect the target device cannot render]
---

# Score only what the device shows

The named concern: the capture a scene is scored from is an instrument, and an instrument
that differs from the device the player holds measures a scene that does not ship. Two
directions of error exist, and both move the score without moving the product.

## The capture must not show more than the device

Effects that exist only in the capture path raise the score for free. Depth of field is the
usual one: a flat capture can blur the far edge as a photograph does, and a head-worn
display never will, because the player's eye focuses wherever it likes. Others are a
post-process pass the device's path does not run, a supersampling factor the device cannot
afford, or a resolution above what each eye actually gets. Each of them is excluded from
the scoring capture. Film grain and vignette are allowed only where the device path runs
them too.

## The capture must not show less than the device

The reverse error is quieter. A head-worn device often draws some content as compositor
layers, text and panels composited after the scene for sharpness, and a flat capture of the
scene does not contain them. Score that capture and the panels look absent or blurred,
and the team spends a round on text the player already sees crisply. Where the device adds
a layer, the scoring capture either includes an equivalent or the affected elements are
scored from a device capture and marked as such.

## The camera is fixed, and it reports what it rendered

Pose, field of view, aspect and resolution are identical every round, and they are written
with the scorecard. That much is obvious. The less obvious rule: **the command that puts the
view in the scoring pose logs what the view actually rendered, read back from the camera
after the frame, not what it was asked for.**

The reason is a failure that is invisible until it ends. A pose command can request a field
of view that never applies, because the camera in use ignores the call or something later
overrides it. Its log line echoes the request, every capture is taken at the default, and
the team approves round after round of framing against a number that was never in effect.
In one run that is exactly what happened: the declared field of view was twenty degrees
narrower than the default the captures were actually taken at, and it was found only when a
later change made the declared value apply and cropped the frame. The fix that run chose,
re-declaring the value the history was taken at, was the right one there because that
framing was the one matched to the concept; the general lesson is that the log must have
been able to say so on the first day.

## The concept's own cheats are recorded, not scored away

Some of what the concept shows no device can: photographic depth of field, film halation,
bounce light everywhere, more data than the product holds. Those stay in the concept and
stay in the bar. Beside the scorecard, each affected element gets a cheat note: what the
concept does, why the device cannot, and the ceiling the device can reach. The score is
read against the concept; feasibility is read against the ceiling. Rewriting the bar
instead would make every later score rise with nothing changed, and the comparison against
the original concept would be lost.

## Procedure

1. List every effect in the capture path and mark which the device path also runs.
2. Switch off every capture-only effect for the scoring capture.
3. List every compositor layer the device adds and decide, per element, whether the flat
   capture includes an equivalent or the element is scored from the device.
4. Fix pose, field of view, aspect and resolution, and write them with the scorecard.
5. Make the pose command log the rendered camera state, read back, every time.
6. Write the cheat note for each element the concept renders beyond the device.

## Decision rules

- **When the logged camera state differs from the declared one, stop scoring.** Every
  capture since the last agreement is at an unknown framing.
- **When a capture looks better than the device, find the capture-only effect** before
  crediting the round.
- **When a flat capture scores a layered element low, check whether the device composites
  it** before funding a fix.
- **When the concept depends on an effect the device lacks, keep the bar and write the
  ceiling.** Never lower the bar to fit.

## When not to use this

- For a marketing still, whose job is to look like the concept and which is honest about
  being a still.
- For exploratory lookdev frames that are not scored; the rule binds the scoring capture,
  not every image a team makes.
