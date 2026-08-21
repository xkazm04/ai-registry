---
layer: technique
type: technique
subject: frame-direction
technique: plate-elements-text-split
status: forged
laws: [checkability-routes-the-pixel, output-never-outruns-evidence]
shared_with: []
use_when: [deciding whether a mark is generated or code-drawn, specifying frames that mix imagery with figures and labels, keeping glyphs out of generated plates]
---

# Plate / elements / text split

Compose every frame as three drawn layers with different authors, and route
each mark to its layer by one epistemic question: **could a viewer check this
against a fact?** If yes, deterministic code draws it. If it only has to feel
right, a generative model may draw it. The split is not a rendering
convenience — it is how a frame stays honest about which of its marks are
claims.

## The three layers

| Layer | Author | Carries | Hard rule |
|---|---|---|---|
| **plate** | generative model | shape, colour, atmosphere — the *shape* of the argument | never text, never a checkable number |
| **elements** | vector code | geometry that means something: arrows, bars, brackets, rules, loops, markers | each element states what it asserts, or it is dropped |
| **texts** | vector code | kicker, caption, figure, label | every figure cites the fact that sources it |

A plate never contains a quantity. It contains the *shape* of the quantity —
one stack twice the height of another — and the figure layer states the
number, bound to the sourced fact behind it. The plate persuades; the
elements and texts assert; only the asserting layers are held to evidence.

## Rules for the plate subject

1. **No text, no letters, no numbers, no logos.** Generated glyphs are the
   one unconditional defect: a plate that comes back carrying letters is not
   a slightly worse plate, it is an unusable one. The practical corollary is
   to write **form-only descriptions**: named objects are text magnets — ask
   a model for a "reservation book" and it writes the word on the cover,
   measured to leak on every style tested — while shapes are not. Say what
   the shapes do, not what the objects are called.
2. **Reserve the text zone.** Captions and figures need ground to land on;
   the subject description explicitly leaves a region (typically the lower
   third) empty, so the layers compose instead of colliding.
3. **Compose within the locked style, not against it.** A chalk style cannot
   do soft gradients; an isometric style cannot do a flat elevation. The
   style block is an input to the subject, not a suggestion.

## Rules for elements and texts

- An **element** is geometry that carries meaning: the arrow that reverses,
  the bracket that groups the counter-case, the bar whose height *is* the
  magnitude. If you cannot say what an element asserts, it is noise — drop
  it.
- A **kicker** is two to five words taken from the beat's own label. It
  orients; it does not narrate.
- A **figure** is a quantity, and it must carry the identifier of the sourced
  fact that supports it. No supporting fact, no number on screen — this is an
  integrity rule, not a style rule, and it is the enforcement point where
  "output never outruns evidence" becomes mechanical: a validator can refuse
  an uncited figure without exercising any taste.
- A **caption** is at most one short clause. The narrator is already
  speaking; the frame is not a transcript.
- Precision limits travel with the evidence: when a fact is graded uncertain,
  the element drawn from it renders as proportion without axis ticks or exact
  bar heights. A cleaner chart is a stronger claim, and the layer that draws
  claims must not out-claim its sources.

## Decision rules

- Mark routing: *checkable → elements/texts; evocative → plate.* When
  genuinely torn, the mark is probably a quantity you are tempted to imply
  pictorially — draw the shape on the plate and state the number in a cited
  figure.
- A chart is never a plate. Even a stylised series belongs to code the moment
  a viewer could read a value off it.
- If a subject description names an object and you cannot restate it as
  shapes-doing-things, the beat's argument is not yet clear enough to direct;
  push back on the beat rather than shipping the noun.

## When not to use this

The split presumes a compositing pipeline where code can draw over generated
imagery. In a purely generative flow with no vector layer, the discipline
inverts into abstinence: no figures at all, since the only available author
for them is the one forbidden to draw them. Do not "solve" that by letting
the model write numbers — a frame with no figure is degraded; a frame with an
unsourced generated figure is dishonest.
