---
layer: technique
type: technique
subject: image-prompt-composition
technique: assigned-colour-roles
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when:
  - specifying a palette in a generation prompt
  - the right colours appear in outputs but land on the wrong elements
---

# Assigned colour roles

## The concern

A palette *listed* is a palette *re-cast*. "Navy, cream and cyan" tells the
model which colours may appear; it says nothing about where. So each
generation redistributes them — navy objects on a cream ground here, a cyan
sky there — and the batch reads as three colourways of a mood board rather
than one project. The colours were obeyed; the *look* was not, because the
look lives in the assignment, not the swatch list.

The fix is to promote each colour from a list item to a **role**: a standing
job that colour performs in every image of the project.

## Procedure

1. **Define a small closed set of roles.** The proven minimal set is three:
   - **ground** — the dominant background;
   - **objects** — every object, rule, and structural element;
   - **accent** — used *only* on the single element that carries the
     image's point, and nowhere else.
   Extend only when the project demonstrably needs more (a second object
   tone, a skin tone), and keep the set closed — an open-ended palette is a
   listed palette again.
2. **Bind each colour to exactly one role, with a name and a hex value.**
   Both matter: the name ("deep ink navy") is what the model actually
   steers by; the hex is the human contract and what the composited vector
   layer matches. State them together.
3. **Compile the assignment into a sentence per colour**, in the style
   block: "deep ink navy (#0B1B2B) as the dominant background; warm paper
   cream (#F5EFE0) for every object and rule; bright cyan (#67E8F9) used
   only on the single element that breaks." The phrasing of the accent role
   is the load-bearing part — "only … and nowhere else" is an instruction a
   model can hold; "also some cyan" is not.
4. **Make the action block spend the accent.** Each image's subject names
   which single element takes the accent ("the third arrow, at the lower
   left, is cyan and points against the other two"). The accent is the
   project's pointing finger; an image that spends it twice, or not at all,
   has misfired even if every pixel is in-palette.
5. **Grade against the assignment.** The rubric line is countable: "three
   colours only, with the accent nowhere except the named element." An
   image with in-palette colours in the wrong roles fails.

## Decision rules

- **When outputs use the right colours in the wrong places, the palette is
  listed somewhere it should be assigned** — usually an action block that
  re-mentions colours loosely. Colour language belongs in the style block
  and in the accent-spending sentence, nowhere else.
- **When two elements both deserve the accent, the frame has two ideas** —
  split it into two images rather than diluting the accent, because an
  accent used twice stops meaning "look here".
- **When the composited layer must sit on the plate**, derive its colours
  from the same role table — captions in the objects colour, highlights in
  the accent — so the drawn and generated halves read as one system.
- **When porting the look to a new model**, the role sentences port
  verbatim; only re-verify that the model honours "only … and nowhere
  else", which is the clause weaker models drop first.

## When not to use it

Photographic and painterly styles whose identity *is* broad, naturalistic
colour cannot be role-locked without flattening them — there, constrain
temperature, saturation and lighting instead, and accept per-image colour
variation as part of the style. And within a role-locked project, do not
multiply roles to capture every nuance you see in a good output; roles are a
steering wheel, not an inventory, and past four or five the model treats the
assignment as a list again.
