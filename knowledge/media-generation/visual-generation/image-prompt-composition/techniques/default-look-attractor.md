---
layer: technique
type: technique
subject: image-prompt-composition
technique: default-look-attractor
status: forged
laws: [unmeasured-is-not-pass, style-is-restated-not-remembered]
shared_with: []
use_when:
  - every frame of a project is consistent and none of them is distinctive
  - a style block is being written from words like cinematic, premium or epic
  - generated frames could be swapped with another project's without anyone noticing
---

# Default-look attractor

## The concern

Every current image and video model has a **default look**: the register its
preference and aesthetic-reward tuning converged on, because that register scored
well with raters. Published work describes the mechanism as preference mode
collapse, outputs converging on "monolithic styles or pervasive overexposure".
Reward-tuned models produce visually similar outputs with recurring artifacts, and a
2025 study of generator and captioner loops found them collapsing onto a dozen
commercially safe motifs, which its authors called visual elevator music. In
cinematic photoreal work the register is easy to recognise:

- warm practical lamps against a cool night;
- shallow focus with oval bokeh and a horizontal flare;
- a centred subject at eye level and medium distance, glossy skin;
- any "magic" rendered as glowing particles or threads of light.

The attractor is not a defect to be patched. It is what the model returns for every
slot the prompt leaves open, and for every word that names the category of a good
image instead of a decision. A consistency pipeline makes this worse rather than
better: it restates the attractor faithfully on every call, so the project is
consistently generic. The craft is to **find the attractor, then specify against it
axis by axis**. Asking for something "different" or "unique" moves toward the
training mean, not away from it.

## Procedure

1. **Measure the attractor on the target model.** Run the brief's action block with
   the style block stripped, four samples or more. List what recurs: the light
   source and direction, the palette, camera height and distance, where the subject
   sits in the frame, the focus depth, and the effect idiom. That list is the
   attractor for this model and subject. It is the thing the style block has to
   overrule, and until it has been sampled it is a guess.
2. **Strip category-quality words.** Remove "cinematic", "epic", "film still",
   "premium commercial", "masterpiece", "stunning" and their kin. Each names the
   register you are trying to leave. One vendor's own image-prompting guide goes
   further and has the prompt say outright "avoid cinematic lighting, dramatic
   colour grading" to get an unpolished result. Replace each removed word with a
   physical decision:
   - **The light:** one named source, its direction, and what falls to black
     ("a single sodium streetlight from frame left, everything beyond it black").
   - **A palette by role:** see assigned-colour-roles.
   - **A capture register with its imperfections:** period colour negative with
     halation, a worn tape transfer, a phone snapshot with blown highlights,
     16mm grain. The distinctive examples in vendors' own video guides ride on
     exactly such a period or medium reference.
3. **Invert the attractor axis by axis, by name.** For each recurring item from
   step 1, either keep it on purpose or name its replacement:
   - **Camera height:** floor level or an overhead plan view instead of eye level.
   - **Placement:** the subject at the frame edge with negative space, or a speck
     in an extreme wide, instead of centred.
   - **Focus:** deep focus with everything sharp, so the staging narrates, instead
     of shallow bokeh.
   - **The effect idiom:** make the magic out of the scene's own material (wet
     paint, paper, cardboard, string, sound made visible) instead of light
     particles. Physical, in-world effects read as authored; luminous particles
     read as the model.

   The named-inversion rule is the same one medium-vocabulary-locking applies to a
   named work's attractor: "different" is not an instruction, "overhead, deep focus"
   is.
4. **Give the project one formal device.** One rule that every shot obeys:
   - locked-off symmetrical tableaux;
   - one continuous camera move;
   - every shot from directly above;
   - one colour per character and no other saturated colour.

   A device produces consistency through authorship. The verbatim style block
   produces it through repetition, and only the first is distinctive. The device
   lives in the style block because it is a project rule.
5. **Sample wide, then lock.** Run the exploration on light prompts and in volume.
   Ratify the look from the samples (see the style-locking subject's approval
   step), and only then compile the full verbatim blocks. A compiled contract
   written before the engine's range has been seen locks in step 1's list.
6. **Finish outside the model.** Apply one grade and one grain pass across every
   shot in post. The model delivers a plate, not the final colour. Practitioners
   who are praised for their look report adding grain against the waxy synthetic
   surface, and baking most of the grade into a deliberate, project-wide step.

## Decision rules

- When the frames are consistent and forgettable, look at the style block before the
  action blocks. A style block made of register words is the attractor written down.
- When a reference image was generated by the same model family, assume it carries
  the attractor in. Re-derive its light, framing and effect idiom from step 3, and
  do not trust it to carry them.
- When you invert, invert one coherent register, not every axis at random. A frame
  that is grainy, tilted, overhead and neon at once is a second cliché, "the
  anti-AI look".
- Keep a numeric camera term only when a controlled pair on the target model shows
  it does something its effect phrasing did not (see the cinematic-language subject's
  lens-effect language).

## When not to use

- When the brief's category convention *is* the gloss: a product hero shot where
  showroom polish is what buyers expect, or a parody of generated advertising. In
  both cases the attractor is the right register on purpose.
- When an existing brand system already fixes the light, palette and framing. Then
  the job is matching that system, not escaping a default.
- When the problem is the idea, not the image. A distinctive render of a median
  concept is still a median ad. Fix the premise first (concept development
  precedes this technique).

## Failure modes

- **"Make it unique."** Asking for originality in adjectives moves the sample toward
  the centre of the distribution.
- **The attractor smuggled in by reference.** Masters rendered by the same model
  with the same register words pass identity checks and seed every downstream frame
  with the default look.
- **Inverting in the prompt what the grade should fix.** A colour cast and missing
  grain are cheaper and more reliable to set in post than to fight per call.
- **Unmeasured distinctiveness.** "It looks less generic" without step 1's list is
  an impression. The check is whether the recurring items from the stripped run
  still recur in the final frames.
