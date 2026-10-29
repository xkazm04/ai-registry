---
layer: technique
type: technique
subject: concept-scene-parity
technique: owner-anchor-for-a-model-panel
status: forged
laws: [no-gate-self-certifies, a-number-carries-its-unit-and-basis, a-judge-of-the-generators-family-is-not-independent]
shared_with: []
use_when: [a panel of vision models scores the look rounds and the person the look is for has not scored any of them, the panel's total is near the go or no-go bar, two panels disagree about which of two versions is better, a round is about to be steered by one panel's stated preference, the scene moves or is seen in a headset and the panel only sees stills]
---

# An owner anchor for a model panel

The named concern: a blind panel of vision models, with a control frame, removes the bias
that comes from briefing (see [blind-panel-with-a-control-frame](./blind-panel-with-a-control-frame.md)).
It does not remove the panel's own leniency, its inconsistency between runs, or its blindness
to motion and depth. All three move the number without moving the scene. The person the look
is for is the only instrument whose reading is the requirement, so the panel is calibrated
against that person, and its total is reported in that person's units.

## What a model panel gets wrong on its own

- **It is lenient.** Model judges asked for an absolute score on a short scale crowd the upper
  half of it. Published evaluations of multimodal judges report that absolute scores correlate
  with human scores at about 0.5 at best, and that some judges give the top two marks to most
  images. A blind, controlled panel is still lenient, just consistently so.
- **It does not repeat itself.** Asked the same question again, judges change their majority
  answer often enough that a one-point move in a panel mean is not a reading. One look series
  scored the same frame 26.3 in one panel and 25.3 in the next.
- **It reverses its preferences.** In one series the panel preferred one treatment of an effect
  over another, the builders switched to it, and the next panel preferred the treatment they had
  left. Neither panel was wrong about its own frames. Each was one draw from a noisy instrument.
- **It cannot see what stills hide.** A panel reading screenshots and frame sheets cannot judge
  stereo depth, a card that slides while it should walk, or how an idle cycle reads in motion.
  Two judges who measured a stereo pair by block matching both concluded the pair could not
  settle the question.
- **It is far from expert taste.** The panel tracks large, visible defects well. It is weak at
  the fine aesthetic distinctions a style lives or dies on, which are exactly the distinctions
  left once a look has plateaued.

## The procedure

1. **The owner scores a blind sample early.** At the first scored round, the owner scores the
   same anonymised frames the panel scored, element by element, without seeing the panel's marks.
2. **Record the offset.** The owner's total minus the panel's total, on the same frames, is the
   panel's offset in the owner's units. Write it beside every panel total from then on.
3. **Re-anchor at every decision point and every few rounds.** People do not fix their criteria
   before they see outputs. The owner's reading of what good means moves as the work moves, so the
   anchor is refreshed rather than computed once.
4. **Ask comparative questions where possible.** "Which of these two is closer to the target" is
   the setting where model judges come nearest to people. Use absolute totals for the trail and
   pairwise choices for steering.
5. **Do not steer on one panel's preference.** A change of direction, especially one that reverses
   the last round's, needs either the owner's blind choice or two independent panels that agree.
6. **Put motion in front of the person.** Anything that only exists in motion or in a headset
   (animation, stereo depth, sliding, scale) is judged by the owner in the device or from a video,
   not inferred from a panel's reading of stills.

## What the anchor showed

One look series ran about twenty blind, controlled model panels over two days and climbed from a
control of 13 to 17 to a plateau of 24 to 26 of 36. When the owner read the last round, the owner
put it at about 20, so the panels were about 4 to 5 points generous on the frames that mattered.
The gap between the panels' 24 to 26 and the go bar of 30 looked like two good rounds. In the
owner's units it was about 10 points, which is a different decision. An anchor taken on the first
round would have shown that gap two days earlier.

## Decision rules

- **When a total decides go or no-go, report it in the owner's units.** That is the panel's total
  plus its latest offset, labelled as such. A raw panel total near the bar is not a pass.
- **When the offset has not been taken, the panel's total is a progress signal only.** Report the
  trail's direction, not its distance to the bar.
- **When a panel's preference reverses the last panel's, do not act on it alone.** Ask the owner,
  or run a second panel.
- **When the open question is about motion, depth or the device, the panel abstains.** Record the
  element as unmeasured until the owner has seen it in the medium.

## Cost

One extra blind scoring pass by the owner per decision point, about fifteen minutes. That is far
cheaper than the rounds a lenient trail can buy before anyone notices.

## When not to use this

- **When there is no owner.** Fall back to two panels from different model families and treat
  their disagreement as the uncertainty.
- **For defects a model sees reliably.** A cropped subject, a missing element or an obvious
  artifact needs no anchor: gate those with the panel or with deterministic checks.
