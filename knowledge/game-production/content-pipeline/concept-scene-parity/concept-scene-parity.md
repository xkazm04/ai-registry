---
layer: golden-path
type: golden-path
subject: concept-scene-parity
status: forged
use_when: [a real-time scene must come to read as a painted or generated concept image, someone says the scene looks dated and nobody can say which part, deciding which stage of the pipeline to fund in the next look round, deciding whether a concept's look is reachable on the target device at all]
techniques:
  - element-scorecard-from-the-concept-camera
  - judge-in-the-destination-light
  - score-only-what-the-device-shows
  - grade-only-the-excess
  - cap-attribution-before-the-next-round
---

# Concept scene parity

A team holds a concept image, painted, photographed or generated, and a real-time scene
that is supposed to come to read as it. The first honest review of that scene is almost
always the same sentence: *it looks dated*. That sentence is true and useless. It names no
element, no stage and no lever, so the team spends its next round on whatever it is fastest
at, and the sentence comes back unchanged.

This subject owns the loop that turns the sentence into a measured, attributable gap and a
plan. Decompose the concept into its elements. Capture the scene from the concept's own
camera. Score each element. Name, for every element short of a match, the one stage that
caps it: the asset, the engine, the data or the composition. Fund the cheapest cap that buys
the most score. Re-capture under conditions identical to the last round. It also owns the
question the loop exists to answer in the end, which is whether the look is reachable on the
target device at all, and when to stop chasing and write the limit down.

## Where this subject stops

Four neighbours own ground that looks like this one from a distance, and the seam with each
is a rule a reader can apply. **A generated artifact measured against a reference it is
supposed to reproduce** belongs to reference parity gating: there the reference can be
pushed through the same instrument as the candidate, the comparison is registered and
numeric, and the question is whether one object is the right object. This subject begins
after that one, where finished assets have been placed in a lit, composed scene, and its
reference is an image that no renderer will ever reproduce exactly, judged by a person at a
fixed camera. If an instrument can score the comparison, use parity gating; if only an eye
can, and the levers are spread across art, engine, data and composition, it is this.
**Keeping many generations alike** belongs to visual style locking in the media-generation
bundle. Style locking makes a batch of images agree with each other; this subject makes an
engine scene agree with one image, and the concept it works from is often the product of
style locking rather than its subject. **Which renderer features a head-worn device can
afford** belongs to the standalone headset frame budgets subject. This subject consumes that
allowance and does not argue with it: every look result is reported beside its frame cost,
because a look that only fits over budget is a different finding from a look that fits.
**How the concept image itself is prompted** belongs to the media-generation bundle's prompt
craft, and **how a raw mesh becomes an engine-ready asset** to mesh finishing; this subject
judges the finished asset only where it stands.

## The concept is a painting, and the scorecard is its translation

A concept image is not a specification. It is a painting of a moment the product will rarely
show, made by a process with none of the product's constraints: invented labels, ten times
the real data density, photographic depth of field, bounce light everywhere, film halation
on every bright edge. The first discipline is to translate it, once, into a list of the ten
to twenty elements a viewer actually reads, each with a sentence saying what it is in the
product and how it will be built. That list is written before any score exists and changes
only by an explicit revision, because a list edited during scoring is how a hard element
quietly leaves the denominator.

Each element is then scored on a short ordinal scale from a capture at the concept's camera:
absent, present but reads as a placeholder, reads as the concept's element, matches it. The
result is the list, by name, with every zero visible. A total is a summary for the cover
page and never a result. This is the scene-scale form of the rule that no average hides a
failure: a high total over fifteen elements can sit on four that do not exist, and those
four were the interactive layer the concept was drawn to sell. The procedure, the ceiling
estimate that goes with it, and what that estimate is good for are
[element-scorecard-from-the-concept-camera](./techniques/element-scorecard-from-the-concept-camera.md).

The concept's cheats are recorded beside the list, not subtracted from it. Where the image
shows something no target device can show, the element keeps the concept as its bar, and a
separate column states the ceiling the device can reach and why. Rewriting the bar to what
is attainable makes every later score look better without the scene changing; dropping the
cheat makes the feasibility decision on a fiction. Both columns are needed, and they answer
different questions.

## The camera and the device are part of the instrument

A score is a reading taken through an instrument, and here the instrument is a camera pose,
a field of view, a resolution, a frame of post-processing and a device. Change any of them
between rounds and the comparison is between two instruments rather than two scenes. The
capture that scores therefore contains exactly what the target device shows: no
capture-only depth of field, no compositor layer the flat capture lacks and the headset
has, or the reverse. The pose command records what the view actually rendered, read back
from the camera, never what was requested, because a request that silently failed to apply
produces a sequence of approved captures taken at a different framing from the one everyone
believes in. See [score-only-what-the-device-shows](./techniques/score-only-what-the-device-shows.md).

## Light is part of the asset

A prop is never finished in the abstract. A neutral grey studio hides the three defects that
most often make a real-time scene read as a generation old: hard unbevelled edges, flat
roughness and missing occlusion. Assets pass review there and fail in place. So every
contributing asset is reviewed under the destination's own light: its darkness, its
practical lights, its real shadow, occlusion and reflection setup. The reflection setup is
the part teams forget. A scene with no reflection environment gives every glossy surface a
black mirror, and a scene whose reflection probes sit beside a bright panel gives every
glossy surface that panel. The probes are re-captured whenever the lighting is rebuilt, so
glossy surfaces are re-read after every bake. See
[judge-in-the-destination-light](./techniques/judge-in-the-destination-light.md).

## The grade is the last lever, and the narrowest

A colour grade fitted from the scene to the concept is tempting because it moves the whole
frame at once. It is also the lever with the most parameters and the least evidence: a
handful of matched regions cannot constrain a full colour matrix or three independent
channel curves, and both overfit, turning skin, warm accents or neutrals the wrong colour
while the fitted regions improve. The grade fits only the deviation the regions actually
show, keeps the tone curve's highlight shoulder, and never switches the tone curve off to
land an authored colour, because that buys one colour by clipping every emissive edge flat
white. See [grade-only-the-excess](./techniques/grade-only-the-excess.md).

## Every gap has one cap, and the judge sets the order

After each round, every element below a match names the single stage that caps it. The
four stages are deliberately coarse: the asset (the mesh, its finish, its materials), the
engine (light, shadow, reflection, post, the renderer's feature set), the data (what the
product actually holds to draw), and the composition (layout, scale, typography, what sits
where in frame). An element whose cap cannot be named is not ready for a round, because
money spent on it is spent on a guess.

The next round funds the cap with the best expected gain per unit of effort, weighted by
how much that element matters to the person judging. That weighting is the lesson builders
learn last. A team attributes caps by stage and ranks them by score arithmetic, in which
every element counts the same. The judge does not see it that way: a background prop
improved from placeholder to finished reads as *fine, but it does not matter*, while the
sheet in the middle of the frame dominates every verdict. Stage attribution is the
builders' job; salience is the judge's, and a ranking without the judge's salience
optimises the scorecard rather than the scene. See
[cap-attribution-before-the-next-round](./techniques/cap-attribution-before-the-next-round.md).

## Who scores

The score belongs to the person whose eye the scene is for. A builder's reading of their
own round is a self-report and is labelled as one: it is useful as a prediction of the
judge, and a builder whose readings sit consistently at the top of the judge's band has
learned something about their own optimism worth knowing. A machine pre-score is advice. A
verdict the judge gave in words rather than by blind choice is recorded as unblinded,
because the words were heard by someone who knew which arm was which, and the mapping from
words to arms is that person's reading, not the judge's.

## Feasibility: when to stop and write the limit down

The loop often exists to answer a go or no-go question: is this look reachable on this
device, at this team size, inside the frame budget? That question is answered from measured
rounds, never from estimates. After the first full round, the team holds three things per
element: its measured score, its attributed cap, and its device ceiling from the cheat
column. The decision rule is plain. When the bar requires an element at a level its device
ceiling does not reach, the bar is unreachable on that device and the answer is no for that
element, however good the next round is. When an element's cap sits in a stage whose
demonstrated output has not moved it for two rounds, stop funding it and record the limit.
When the sum of every element's realistic next step still falls short of the bar, the
answer is no now and the record says which elements would have to move.

A truthful *this element stalls at a 2 because the asset stage has not yet produced a
character that reads as the concept's* is a result, and a decision can be made on it. A
flattering capture is not a result, and neither is an estimate that the next round will
close the gap: estimates are good for ranking levers and bad at predicting totals, for
reasons the scorecard technique states.

Stopping is a golden-path decision rather than a technique of its own on purpose. It reads
the scorecard, the cheat column and the cap attribution and adds nothing to them except a
threshold and a willingness to write *no*; a separate procedure would restate all three.

## The failure modes of the naive reading

- **Fixing what the team is fastest at.** Without cap attribution, an engine-minded team
  tunes light for a week while the elements that read as placeholders are assets and data.
- **Reporting the total.** Four absent elements hide comfortably inside a respectable
  number, and they are usually the ones the concept was painted to show.
- **Summing per-stage ceilings.** Each stage's estimate assumes the other stages deliver a
  match; the sum predicts a scene nobody will build.
- **Judging assets in a grey studio.** The defects that date a scene are exactly the ones
  neutral light conceals.
- **Trusting the pose command.** A framing that silently never applied makes every
  comparison in the history a comparison at the wrong camera.
- **Scoring what the device will never show.** Capture-only depth of field or a missing
  compositor layer moves the score without moving the product.
- **Fitting the grade to a handful of regions with many parameters.** The fitted regions
  improve and everything else changes colour.
- **Rewriting the bar to the attainable.** The scores rise, the scene does not, and the
  feasibility question is answered on a fiction.
- **Letting the builder's reading stand as the verdict.** The judge's salience is the one
  input the builders cannot supply.
