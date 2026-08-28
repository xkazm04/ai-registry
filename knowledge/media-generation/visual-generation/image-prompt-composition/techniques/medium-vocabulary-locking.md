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
  - an original design keeps arriving as a recognisable existing one
  - a named film or studio is being used to set the quality bar
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

## Naming a work to set the bar imports the work

The impression words above are the common failure. There is a second one that
looks like the *cure* for them, because it is specific where they were vague:
reaching for a named production — a film, a studio, a franchise, a
photographer — to say how good the output should be. "At the fidelity of that
film" feels like a medium decision. It is not one, and it fails in a way the
adjective pile does not.

A caption-trained model has no channel that separates a title's *production
values* from its *content*. The name is one token cluster, and everything that
co-occurred with it comes back together: ask for a celebrated creature film's
level of detail while designing an original creature, and what arrives is that
film's creature — its ear shape, its skin palette, its marking language —
rendered beautifully. The render quality genuinely improves, which is what
makes the failure durable: the prompt appears to have worked, and the design
problem is discovered later by someone who recognises the source. Rewording
does not clear it. Two attempts at "something different, at that fidelity"
returned the same lineage with the hue rotated, because the request still
contained the attractor.

The failure is strongest exactly where it is least visible: when the subject
class you are designing overlaps the named work's signature subject. A title
famous for humanoid creatures poisons a humanoid-creature brief and barely
touches a still life. So the exposure is not "did I name a work" alone, it is
"did I name a work *known for this kind of subject*".

The correction is to split the two axes the name had fused, and to spend the
second one deliberately:

1. **Ask for the production values in medium vocabulary** — the render
   decisions the admired work made, in this technique's own terms: subsurface
   translucency, motivated key with a cool practical fill, fine skin
   micro-texture, physically plausible cloth. This is the half that was
   legitimate, and it survives the name's removal intact.
2. **Design the subject against the attractor, feature by feature.** Not
   "different", which moves toward the training mean — name the specific
   inversions: rounded ears where the attractor's are pointed, an antler crown
   where it has hair, a heavy silhouette where it is tall and slender. Each
   inversion is a decision the block can hold and a reviewer can check.
3. **Put the attractor's signature features in the exclusions**, alongside the
   style's opposites, for the same reason and by the same mechanism.

The general rule, and the reason this sits in a technique about vocabulary:
**a proper noun is a content token wearing a quality adjective's clothes.** It
is the one impression word that gets *more* dangerous the more precisely it is
chosen.

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
- **When a named work is carrying the quality bar**, split it: production
  values into the medium kit, the work's signature features into the
  exclusions, and the subject designed against them feature by feature.
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
