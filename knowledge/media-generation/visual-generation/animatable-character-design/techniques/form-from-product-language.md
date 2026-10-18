---
layer: technique
type: technique
subject: animatable-character-design
technique: form-from-product-language
status: forged
laws: []
shared_with: []
use_when: [choosing the material palette and structure of a product's companion character, a character concept looks striking but could belong to any product, the being's colour must change with the product's runtime state]
---

# Form from the product's language

Banning the default opens a field too large to search. What narrows it to
something with a reason to exist is derivation: the being is assembled from
the visual language the product already speaks. The test of a derived being
is that someone who knows the product recognises it as the product's before
being told.

## Inventory before you imagine

Before any direction is written, collect what the product already has, and
put it in the brief as material rather than as mood:

- **The palette with roles.** Ground, surface, text, accent — and above all
  the **state hues**: the colour the interface takes when it is idle,
  listening, thinking, speaking, succeeding, warning, failing. These are the
  colours the being will have to wear at runtime, so they are the most
  important input in the inventory.
- **Existing presence motifs.** Whatever the product already uses to say
  "something is here" — a pulse, an orb, a glow, a ring, a mark, a cursor
  behaviour. A companion that grows from an existing motif inherits a
  meaning users already learned.
- **The namesake.** What the product is named for or stands for, broken into
  attributes — not the emblem, the attributes. A namesake of wisdom offers
  watchfulness, a night creature's frontal gaze, the fold of a written page;
  those are shapes a being can be built on.
- **The voice**, where the product speaks. The form has to be something
  that voice could plausibly come from; a warm, calm adult voice issuing from
  a skittering swarm or a toy reads as a dubbing error before it reads as a
  character.
- **An owner-supplied reference** for finish and ambition. It sets the bar,
  not the answer: candidates are judged against its level of craft, and
  copying its subject is a failure of the same kind as the default.

## Light belongs to the being

The one rule in this technique that is functional rather than aesthetic:
**the being emits its own light, on a near-black ground, and is not lit from
outside.** Brief it as "light from within", "glow carried in the material",
"no key light, no rim light, no environment colour on the subject".

The reason is runtime, not taste. A being lit by an external source has its
colour decided by the scene at generation time; changing the state means
regenerating the being. A being whose light is internal and close to neutral
in hue — luminance carried by the image, chroma left open — can be tinted
per state by a shader or a blend, so one still serves every state hue in the
inventory. The near-black ground is part of the same contract: it gives the
tint nothing to contaminate and lets the being composite onto any surface
the product draws.

Two refinements matter in practice. First, "close to neutral" does not mean
colourless: a being drawn in **one** hue — the product's identity hue,
emitted, on black — can be hue-shifted or overlaid per state as easily as a
neutral one, because there is only one chroma to move. What cannot be tinted
cleanly is a being whose structure depends on several hues at once. Second,
light on black is also the easiest material to **split**: each moving part
can be lifted as additive light over a filled copy, so where two parts
overlap their glow sums the way light does and nothing has to be invented to
occlude. The same rule that serves the runtime tint serves the layer split.

Two checks on a candidate, before it is shortlisted:

- **Does its colour survive desaturation?** Convert it to luminance only. If
  the being is still legible — its structure, its focal region, its speaking
  element — its form is carried by light and the hue can be reassigned. If it
  dissolves, its form was carried by colour, and every state tint will
  damage it.
- **How many hues carry structure?** One, or none, and the being can be
  tinted. Two or more, and each state tint will fight at least one of them.
- **Is there a cast?** Look for highlights on one side, shadows on the
  other, coloured spill on edges. Any directional light is a scene the being
  can never leave.

## The namesake as structure

A namesake worn as costume is an emblem pinned to an unrelated body: a
helmet, a badge, a bird on a shoulder. It reads as branding and dates fast.
A namesake as structure is the shape of the being itself: the gaze of a
nocturnal creature as the focal region, the folded planes of a page as the
body, the lattice of a woven thing as its material. Brief the attributes,
and ask which of them the being is *built from*.

## Decision rules

- When a candidate's palette is not the product's palette, it is not a
  candidate yet, however striking; re-brief with the inventory attached.
- When the product has no state hues, decide them before the character —
  the character will be asked to carry them, and inventing both at once
  produces a being tinted with colours the interface does not use.
- When a direction is lit beautifully from outside, keep its form and
  re-brief the light; a lit candidate is a draft, not a reject.
- When the namesake appears as an object the being holds or wears, push it
  one step inward: what would the being look like if it were made of that?
- When the owner's reference and the product's palette disagree, the
  palette wins on colour and the reference wins on finish.

## When not to use it

A product with no visual language yet — a name and nothing else — has
nothing to derive from, and the order reverses: settle the product's palette
and state hues first, then design the being. And a character designed for a
story world rather than a product interface answers to that world's language,
not to a palette of runtime states.
