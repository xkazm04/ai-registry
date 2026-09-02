---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: palette-discipline-across-frames
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [generating the frames of one sprite set independently, colours drift between frames of the same animation, constraining generated art to a project palette, checking that a delivered frame was authored to the colour contract]
---

# Palette discipline across frames

## The concern

A set of two-dimensional art — a cycle, a directional set, a tile family, a screen of icons —
is judged as a set. Its colours are read together, and the eye is extraordinarily sensitive to
a colour that is *almost* the same as its neighbour and much less sensitive to a colour that is
boldly different. Two browns four steps apart read as flicker; two browns forty steps apart
read as a design decision.

The generative pipeline attacks precisely this weakness. Each frame is one request, answered
independently, and a model asked twice for the same coat returns two coats a few steps apart.
Nothing in the request was violated; nothing in a per-frame review catches it; and when the
frames are played in sequence the character's clothing shimmers. The technique is to make the
palette a declared, enforced object rather than an emergent property of a series of requests.

## Procedure

1. **Declare the palette as an ordered list of colours with names and roles**, owned by the art
   class or the set. Roles matter more than counts: outline, skin base, skin shade, primary
   fabric, primary fabric shade, metal, metal highlight. A palette whose entries carry roles can
   be re-skinned, checked, and reasoned about; a bare list of colours can only be diffed.
2. **Push the palette into the request** where the generator can accept it, as explicit colour
   language or a reference the whole set shares. This raises the base rate and is not the
   guarantee — a model given a palette in words will still drift, because the words are a
   suggestion and the pixels are what is delivered.
3. **Quantise every delivered frame into the declared palette** as a pipeline stage, mapping
   each pixel to its nearest declared entry in a perceptually uniform colour space rather than
   in raw channel distance. This is the guarantee. After it, drift is not something you hope
   against; it is something the pipeline cannot express.
4. **Measure before quantising, and keep the measurement.** How far each frame had to move to
   land on the palette is the diagnostic that tells you whether the generation is drifting worse
   over time, whether one prompt variant is better behaved, and whether a delivery was authored
   to the contract at all.
5. **Count distinct colours as an intake check.** A frame delivered with a few dozen colours was
   authored to a constrained palette; a frame with several thousand was not, whatever it looks
   like. It is one pass over the pixels and it separates two situations that are otherwise
   indistinguishable in review.
6. **Keep transparency out of the colour contract and check it separately.** Semi-transparent
   fringe pixels are the usual reason a "sixteen-colour" frame reports thousands, and they are a
   different defect with a different fix — a hard transparency cutoff — from a palette breach.
7. **Version the palette and bind deliveries to the version they were quantised against.** A
   palette revision does not retroactively make older frames correct, and a set holding frames
   from two revisions is incoherent in exactly the way the palette existed to prevent.

## Decision rules

- **When the palette exists in more than one place, it is already drifting.** The list that
  composes the request, the list the quantiser maps into, and the list any interface uses to
  preview the art must be one object with one owner
  ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). Two copies
  produce a set that was requested in one palette and delivered in another, and the difference
  is small enough that nobody sees it until the frames are played.
- **When frames are generated independently, assume drift and check for it.** Independence is
  the cause; a per-frame review cannot detect it, because each frame is individually correct.
  The check is between frames, and it must exist for the same reason a seam check exists.
- **When a frame is accepted without a palette check, record that it was not checked.** An
  unquantised frame and a frame that quantised cleanly are different states, and collapsing
  them means nobody can later say which parts of a library are coherent
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When quantisation moves a pixel further than a stated tolerance, that is a content failure,
  not a colour failure.** A large forced move means the delivery contains something the palette
  has no entry for — a light source, a material, an object nobody asked for. Report it as such;
  silently snapping it to the nearest entry produces a frame that is technically compliant and
  visibly wrong.
- **When the target is an indexed representation, the palette count is a hard constraint and the
  index order is part of the contract.** Palette-cycling effects, per-team recolours and
  index-based masking all read indices rather than colours, so a re-quantisation that preserves
  the colours and reorders the entries breaks every one of them.
- **Judge the set against sets that shipped, not against its own best frame.**
  ([grade-against-what-ships-not-on-a-curve](../../../../_laws.md#grade-against-what-ships-not-on-a-curve))
  A batch where every frame is individually acceptable and the set flickers is a failed batch,
  and grading on the batch's own average is how that ships.

## When NOT to use it

- **Painterly or photographic art** with continuous tone as its point. Quantisation banding
  destroys precisely the gradients the style is made of, and the coherence problem is real but
  solved differently — by a shared reference and a style lock, which is generative-media craft.
- **Effects and particle art** whose value is in additive gradients and soft falloff. A
  constrained palette flattens them into visible steps; coherence there is a matter of shared
  ramps rather than a shared index set.
- **A set of exactly one image.** There is nothing to be coherent with, and a palette imposed on
  a one-off costs authoring freedom for no benefit.

## What this technique does not tell you

A palette-clean set can still be incoherent in every other way: inconsistent light direction,
inconsistent line weight, inconsistent proportion, inconsistent level of detail. Colour is the
axis that is cheap to enforce arithmetically, which is why it is worth enforcing first — not
because it is the only axis on which independently generated frames disagree.
