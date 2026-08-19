---
layer: technique
type: technique
subject: image-prompt-composition
technique: shape-language-over-nouns
status: forged
laws: [checkability-routes-the-pixel]
shared_with: []
use_when:
  - describing subjects in a plate prompt without inviting text
  - generated images keep containing letters or brand marks
---

# Shape language over nouns

## The concern

Models draw what a noun *implies*, not what your architecture permits. Ask
for a "reservation book" and the model writes *Reservation* on it — measured
leaking text on every one of six style variants, because the object's whole
identity is writing and the style cannot save you from the subject. Ask for
a named company's collapse and you get its logo, its ticker, and a chart
with invented numbers. Nouns are **text magnets** and **checkability
magnets**: they smuggle in glyphs, brands, and quantities that a composited
architecture must never let the model draw, since anything a viewer could
check against a fact belongs to the deterministic layer.

The technique is to describe such subjects by **what the shapes do**, not by
what the objects are called.

## Procedure

1. **Identify the text magnets in the brief.** Any object whose function is
   to carry writing or numbers: books, ledgers, signs, labels, screens,
   dashboards, tickets, certificates, calendars, newspapers, keyboards,
   clocks with numerals. Any proper noun: companies, products, people.
2. **Translate each into geometry plus behaviour.** State the form, the
   count, the relation, the motion of the idea:
   - not "a balance sheet collapsing" → "two stacks of discs, the left one
     twice the height of the right, with the right one visibly toppling";
   - not "an open reservation book" → "a wide flat slab, hinged at the
     centre, its two halves splayed open, rows of faint horizontal rules";
   - not "a clock at midnight" → "a plain circle with two thin radial
     hands, both pointing straight up".
   The translation keeps the *argument* of the subject — the twice-the-
   height, the toppling — and discards the vocabulary that invites text.
3. **Quantify the shapes.** Shape language composes naturally with countable
   precision: exact counts, explicit inequalities, named positions. This is
   what makes the translated prompt *more* controllable than the noun it
   replaced, not merely safer.
4. **Leave symbolic slots open on purpose, in shape terms.** Where the image
   needs an emblem for an abstract idea, ask for one by meaning and
   constraint — "one small emblem of your own invention that stands for a
   promise made and then not kept; keep it geometric, simple, in the same
   flat language" — rather than naming a cliché object. The model's
   invention is usable precisely because it was asked for shapes.
5. **Keep the belt and braces.** Shape language reduces the *invitation* to
   write; the no-text clause and the negative prompt remain the enforcement.
   Neither substitutes for the other.

## Decision rules

- **When text leakage concentrates on one subject across many styles, the
  noun is the cause** — re-describe the subject; do not tighten the style
  block or blame the model.
- **When the brief needs a quantity, the plate gets the quantity's shape
  and the vector layer gets the number.** "A line descending in exactly
  four flat steps" is plate; "-38%" is a composited figure bound to a
  sourced fact. Never let the model render the number as pixels.
- **When a model must render deliberate in-image typography** (a different
  architecture, where text is wanted), quote the literal characters
  explicitly — unquoted text-adjacent language produces unpredictable
  glyphs. In a composited architecture this case does not arise; the
  answer is always the vector layer.
- **When the shape translation stops being recognisable**, you have
  abstracted past the audience. The test is a viewer naming the idea
  without a caption; if they cannot, restore one identifying feature of the
  object — its silhouette, not its label.

## When not to use it

Subjects with no checkable or textual content — landscapes, abstract
atmosphere, generic figures — gain nothing from translation; name them
plainly. And in a pipeline whose product *is* rendered text (title cards on
a text-capable model), the technique inverts: there you specify the exact
quoted string and typographic treatment instead of banning text. The
technique serves the composited-plate architecture; it is not a universal
prompting virtue.
