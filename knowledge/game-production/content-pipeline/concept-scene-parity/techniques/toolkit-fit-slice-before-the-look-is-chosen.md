---
layer: technique
type: technique
subject: concept-scene-parity
technique: toolkit-fit-slice-before-the-look-is-chosen
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve, structural-proof-is-never-sufficient]
shared_with: []
use_when: [choosing between concept images for a game's look, a team without a dedicated artist will produce the look with generators and agents, the concept was chosen because it looked good and nobody has built its hardest element, look rounds keep improving the backdrop while the character and the hands stay where they were, deciding whether to retarget a look that has plateaued]
---

# A toolkit-fit slice before the look is chosen

The named concern: a concept image is usually chosen because it is beautiful. Whether the team's
actual toolkit can produce it is a separate question, and it is cheapest to ask before the
choice, not after twenty rounds. The question is not whether the toolkit can produce *a* frame
like the concept. It is whether the toolkit can produce the concept's hardest elements, in
motion, at the quality the concept shows. The hardest elements are the ones the player looks at
most and the ones generators are weakest at.

## Which elements to slice

Rank the concept's elements on two axes: salience (how much of the player's attention they get)
and risk (how badly the team's toolkit is known to do them). Slice the two or three elements that
are high on both. For most games these are some of:

- **The player's own hands or viewmodel.** They sit closest to the eye, take the most screen, and
  are seen in every second of play. Generators and image-to-3D tools have no strong recipe for
  stylised first-person hands.
- **A recurring animated character.** One character must look the same across views, states and
  hundreds of frames. Generative pipelines are weakest at exactly this: identity drift, limbs that
  melt between keys, scale pops, costume parts that appear and vanish.
- **Line quality on moving geometry.** A look whose identity is its line work (ink, chalk, pencil,
  engraving) needs that line to hold on deforming 3D or on generated frames. That is a
  rendering-craft problem, not a generation problem.
- **Mixed media.** If the frame will combine a painted plate, generated sprites and 3D meshes, the
  slice must include all three in one frame. Each medium drifts into its own idiom, and a frame of
  three idioms reads as a composite however good each layer is.

Elements the toolkit is strong at stay out of the slice. A painted backdrop, a sky, sand, a single
still illustration, an icon or an effect flipbook can be left for later.

## The procedure

1. **Shortlist two or three candidate looks.** Include at least one chosen for its fit to the
   toolkit, not only for its beauty. Flat painted cards, a strong uniform post pass over simple
   geometry, a look built from static illustrations, and a stylised cel look with authored shadow
   colours all tend to suit a generator-led team.
2. **Fix each look's target at the game's own camera.** Paint three or four in-game mock-ups per candidate
   look at the real camera and play distance, and let the owner pick one. Write it down as a short style file
   with one approved anchor asset per asset class. Every slice element is then made and judged against that
   anchor, not against the concept.
3. **Route each sliced element to its producer before building it.** That means a free kit, a scripted model
   or a generator, decided by a paired trial
   ([declare-the-producer-per-asset-class](../../generative-artifact-gating/techniques/declare-the-producer-per-asset-class.md)).
   A generator chosen by default for an element it is weak at is the commonest way a slice fails for the
   wrong reason.
4. **Build only the sliced elements, in each look, with the real toolkit.** Use the same
   generators, engine and budget the production would use, with no hand-painting the production
   will not have.
5. **Judge them in motion, in context, at play distance, by the owner.** Use the destination light
   and the device, and a short capture of the element animating. A still of a hand proves nothing
   about a hand that moves.
6. **Choose the look whose slice reached its bar.** If no look's slice reached it, the team lacks
   the capability, not the polish. Either acquire it (a hired artist for that element, a different
   technique) or choose a look that does not need it.
7. **Write the slice result into the decision record.** For each sliced element, record the level
   reached, the stage that capped it, and the toolkit change that would lift it.

## What skipping it cost

One project chose a stylised hand-drawn look from a concept and spent two days of look rounds on
it with two builders, local generators and model judges. The rounds were ordered by what the
builders could move fastest:
- backdrop, sand, sky and effects improved quickly;
- the player's hands got a dedicated pass only halfway through;
- in eight rounds the hands moved from wood grain, to plastic, to cardboard, to smeared highlights,
  and never read as drawn;
- the opponent, a generated painted card, held its identity but never gained volume.

The total plateaued well under the bar, and the project was stopped. A one-afternoon slice of the
hands and one animated opponent clip, judged by the owner in motion, would have shown the same
ceiling before any polish round.

## Decision rules

- **When the look is chosen without a slice, record that as an assumption**, not a fact, and slice
  the riskiest element before the first polish round.
- **When an element does not reach its bar in the slice, polish will not get it there.** Change the
  technique, add the capability, or change the look.
- **When a candidate look needs the toolkit's weakest element at its highest salience, rank it
  last,** however good the concept is.
- **When the frame mixes media, the slice includes the mix.** A layer judged alone hides the seam.

## Cost

One or two days for two or three elements in two or three looks. That is less than a single week
of polish on a look that cannot be reached.

## When not to use this

- **When the team has an artist who has already produced the look in this engine.** That
  production is the slice.
- **When the look is defined by the toolkit's own strengths** and has no high-risk element.
  Slice anyway if a character must animate.
