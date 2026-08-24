---
layer: technique
type: technique
subject: image-prompt-composition
technique: medium-vocabulary-locking
status: forged
laws: [style-is-restated-not-remembered, unmeasured-is-not-pass]
shared_with: []
use_when:
  - writing a style block for a specific artstyle family
  - a style reads generically despite detailed prompting
  - realism adjectives are making outputs look worse
---

# Medium vocabulary locking

## The concern

A style is locked by the **working vocabulary of its medium**, not by
adjectives about the result. "Beautiful watercolor style" names an
aspiration; "wet-on-wet washes, bleeding edges, white paper showing
through" names decisions a watercolorist makes, and the model — trained on
images captioned by people who knew the medium — resolves those terms into
the physics of the look. The general rule: **describe the process that
would have made the image, not the impression it should leave.**

The negative form of the rule matters as much: quality adjectives
("hyperrealistic", "ultra-detailed", "8K", "masterpiece") are not neutral
padding. On photographic styles they push toward the over-sharpened,
over-saturated register those words co-occur with in training data — the
recognizably synthetic look they were meant to prevent. The craft is a
vocabulary *exchange*: every impression word out, a medium word in.

## Procedure — the vocabulary kit per style family

Build the style block from the medium's own decision vocabulary:

1. **Photographic styles: camera physics, never realism claims.** Lens and
   aperture ("85mm portrait lens, f/1.8"), light source and direction
   ("soft window light from the left", "golden-hour backlight"), micro
   texture ("skin pores, fabric weave"), and a capture-medium register
   ("shot on film") that carries tonal character. Structure: subject →
   camera → light → scene. One boundary, measured (2025–26, image and
   video probes alike): the model reads the *register* of camera terms,
   not their numbers — prompts differing only in f-stop render the same
   depth of field, and stated focal lengths do not produce their optical
   geometry. Name the effect ("shallow depth of field, background softly
   defocused", "wide low-angle framing") and treat any numeric setting as
   an impression word in a physics costume until the project's own
   controlled pair proves it does work on the target model.
2. **Painterly styles: technique nouns plus substrate.** The named moves of
   the medium ("impasto, visible brushstrokes, glazing" for oil;
   "wet-on-wet, soft washes, translucent layers" for watercolor) and the
   surface they happen on ("canvas grain", "cold-pressed paper"). The
   substrate term does disproportionate locking work — it forces the
   texture layer the style lives in.
3. **Flat graphic styles: finish and absence terms.** Solid fills, uniform
   stroke weight, hard geometric shapes, generous empty space — and
   explicit bans, because this family is defined by what is missing ("no
   gradients, no shading, no photographic texture"). The exclusions carry
   unusual load and belong in both prompt halves.
4. **Era-locked styles: period plus discipline terms.** Named era and
   hardware register, palette constraint, and the medium's edge discipline
   ("limited palette, dithered shading, hard edges, no anti-aliasing") —
   the classic failure is the medium's constraint dissolving (soft
   blended pixels, modern gradients in a retro frame), so the constraint
   is stated as the style's core, not its decoration.
5. **Drawn/animation styles: production vocabulary.** Line weight, shading
   convention ("cel shading, two-tone shadows"), and — on niche models
   with a tagged corpus — that corpus's exact tags per
   prompt-dialect-matching.

In every family, close the block with the style's *opposites* as
exclusions: the adjacent looks the model drifts toward (photo finish from
painterly, 3D render from flat, illustration gloss from photographic).

## Decision rules

- **When a style reads generic**, audit the block for impression words and
  replace each with the medium decision it was gesturing at.
- **When outputs over-resolve** (paint smoothing into photo, pixels
  anti-aliasing, vector gaining gradients), the missing element is the
  opposite-ban — add the specific adjacent look as an exclusion rather
  than intensifying the positive vocabulary.
- **When two style families must blend**, pick the dominant medium's kit
  as the base and import at most one or two terms from the other; two full
  kits fight, and the model resolves the fight per-image.
- **Vocabulary claims are measurable — treat them so.** A term earns its
  place in the project's kit by a controlled pair (block with and without
  it); a kit assembled from folklore is the kitchen-sink negative prompt
  wearing positive clothes.

## Failure modes

- **The adjective pile.** Ten impression words, zero medium words — the
  model averages toward its default register for the subject.
- **The borrowed kit.** A vocabulary that locked one family pasted onto
  another ("impasto" in a vector block) — contaminates instead of locking.
- **Substrate amnesia.** Painterly blocks without a surface term produce
  digital-smooth paint that reads as neither painting nor photo.
- **Constraint decoration.** Era styles where the discipline terms trail
  at the end of the prompt and lose to the model's modern priors — the
  constraint is the style; order it accordingly.
