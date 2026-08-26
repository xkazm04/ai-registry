---
layer: golden-path
type: golden-path
subject: image-prompt-composition
status: forged
use_when:
  - writing prompts for a diffusion image model
  - building a prompt compiler for batch image generation
  - diagnosing style drift or text leakage in generated images
  - porting a look across image models
techniques:
  - two-block-style-and-action
  - style-first-token-ordering
  - assigned-colour-roles
  - shape-language-over-nouns
  - negative-prompting
  - prompt-budget-limits
  - prompt-dialect-matching
  - medium-vocabulary-locking
  - verbatim-text-locking
  - identity-split-from-state
---

# Image prompt composition

An image-generation prompt is not a sentence. It is a **compiled artifact**: an
ordered sequence of blocks with different scopes, different lifetimes, and
different failure modes, assembled the same way every time. The naive reading —
"describe what you want, vividly" — works exactly once. It fails the moment you
need a second image that belongs with the first, and it fails silently, because
each free-prose prompt re-derives the look from scratch and the model happily
invents a new one per call. The principal reading is that a prompt is a
**contract with a structure**, and the structure exists to answer three
questions the model will otherwise answer for you: what stays constant across
the whole project, what changes per image, and what must never appear at all.

## The anatomy: four blocks, four scopes

Every production prompt decomposes into blocks scoped to different lifetimes:

| Block | Scope | Holds | Changes |
| --- | --- | --- | --- |
| **Style** | the project | technique, palette with assigned roles, finish, line quality, what is banned | never, within a project |
| **Subject identity** | the project, one per recurring subject | what a returning character or product *is* — build, face, hair, the cut and colour of what it wears, voice timbre | never, while the subject recurs |
| **Subject / action** | one image | what this frame depicts — composition, elements, spatial relations, reserved space, and each present subject's current expression and posture | every call |
| **Constraint** | the architecture | the unconditional exclusions — typically "no text of any kind" — plus the negative prompt where the model takes one | never, anywhere |

The order on the page is the order above, and it is load-bearing (see
style-first-token-ordering): the block that must survive truncation goes
first. The identity row is the one most projects discover late: a
project with no recurring subject genuinely has three blocks, and the fourth
appears the moment the same character has to come back looking like herself.
Its scope is per-subject rather than global, and the split between it and the
action block runs *through* the description of one person — see
identity-split-from-state, which is where the boundary is drawn and why
leaving it undrawn defeats restatement. The separation is what makes the subject **swappable** — you can
replace the action block wholesale and the result still belongs to the
project, which is the entire definition of a locked style. A practitioner who
can say "I had a style lock, replaced the action" has this subject; one who
re-describes the look inside each prompt does not.

Two consequences follow immediately and are the most commonly missed:

1. **The style block is restated in full on every call.** Attaching an
   approved reference image is necessary and not sufficient — image
   references alone measurably let the look drift *within a single batch*,
   sometimes within a single clip. There is no short form of the style block
   and no call may opt out of it. This is why serious pipelines route every
   prompt through one compiler function rather than trusting each call site
   to remember.
2. **The constraint block is welded on, not remembered.** If the architecture
   composites its own text layer (and it should — see below), then "no text"
   is a property of every prompt forever, which means it belongs in the
   compiler, appended unconditionally, not in a checklist a human consults.

## Who draws what: the epistemic split

The deepest decision in image prompting is not phrasing — it is deciding what
the model is *allowed* to draw. Generative models hallucinate glyphs, mangle
numbers, and re-cast anything checkable. So the routing rule is epistemic, not
aesthetic: **if a viewer could check an element against a fact, deterministic
code draws it; if it only has to feel right, the model may.** The generated
image is a *plate* — shape, colour, atmosphere — over which a vector layer
composites captions, figures, and labels bound to real data.

This split reshapes the prompt itself. The prompt must:

- ban all text in the image, both positively ("no text, no letters, no
  numbers, no labels, no logos, no watermarks") and in the negative prompt.
  Be clear about *why*, because the reason has changed shape: current
  flagship models can render multi-region typography with high character
  accuracy, so the ban is no longer a workaround for a capability the models
  lack. It is an **architecture decision** — checkable content lives in the
  layer that binds to facts, and a generated glyph, however well-formed,
  belongs to no fact. A pipeline with no compositing layer may legitimately
  let a typography-capable model set text; it then owns per-character
  proofreading and gives up the fact-binding the split provides — the
  contract for that architecture, where the words *are* the artwork, is
  [verbatim-text-locking](./techniques/verbatim-text-locking.md);
- avoid **text-magnet nouns** — objects whose identity is writing (a ledger,
  a signpost, a certificate) invite the model to write on them, and it will
  (see shape-language-over-nouns);
- **reserve dead space** for the composited layer to land in ("the bottom
  fifth of the frame is completely empty ground") — the plate is designed
  around what will be drawn on top of it.

A plate that contains letters is not a lower-quality plate; it is an unusable
one, because the composited layer cannot overwrite what the pixels already
claim. Text leakage is the one unconditional fail, and it is graded as such.

## Precision comes from countability, not adjectives

A prompt earns control by being **checkable**. "A dynamic composition with
flowing energy" cannot fail, which means it cannot succeed either. "Exactly
three thick arrows chasing each other clockwise; two in the object colour;
the third, at the lower left, in the accent colour and pointing against the
other two" can be scored against the output — and a prompt you can score is a
prompt you can iterate. The craft rules:

- **Count what can be counted.** Exact panel counts, exact element counts,
  explicit inequalities ("the left pan rides visibly higher").
- **Assign, don't list.** A palette listed as three colours gets re-cast
  every image; a palette where each colour has a *role* — ground, objects,
  accent — holds (see assigned-colour-roles).
- **Technical beats evocative.** "Moody" varies per call; "desaturated, cool
  temperature, deep shadows, hairline strokes of even weight" repeats.
- **State the format explicitly.** Aspect ratio left to the model's default
  is a batch lost to a silent portrait render.
- **One idea per image.** Two competing mechanisms in one frame read as
  clutter and the viewer resolves neither.

Adjectives are not banned — atmosphere is legitimately the model's half — but
every element that carries the image's *argument* is specified countably, and
the rubric that judges the output checks the counts, not the vibe.

## Budgets: the prompt has a physical size

Prompts have two ceilings and both are routinely hit blind (see
prompt-budget-limits). Older, caption-trained text encoders attend to roughly
the first 77 tokens and **silently drop the rest** — no error, no warning,
just an image that obeyed half your prompt. Modern encoders read hundreds of
tokens but still weight early material more heavily, and vendors impose hard
character ceilings that surface as opaque errors. The composition discipline
is the defence: because the style block is first, a truncating model still
produces an on-style image that merely misses late subject detail — the
recoverable failure — instead of an off-style image, the unrecoverable one.
And because the budget is finite, the style block is written tight (roughly
100–250 words; longer crowds out the subject's share of attention) and the
subject block spends its tokens on the countable elements, earliest first.

## Failure modes of the naive reading

- **Per-image style re-derivation.** Free prose per image; every image its own
  look. The tell: no two outputs could be mistaken for the same project.
- **Reference-image faith.** Trusting an attached style reference to carry the
  look without restating the text block. Drift arrives mid-batch. Worse, a
  reference image is an *untrusted input*: legible text or metadata inside it
  can steer generation, and the symptom — output drifting from a prompt that
  reads correctly — gets blamed on the prompt for hours.
- **The listed palette.** Colours named without roles, re-assigned per image.
- **Text-magnet subjects.** Naming a writing-bearing object and getting
  writing — measured leaking on every single style variant when the brief
  named such an object, because the noun, not the style, invites the text.
- **The invisible truncation.** A long prompt, a short-window model, and a
  conclusion of "this model is incompetent" when the model never saw the
  second half. Diagnose by re-running with only the first blocks.
- **Blaming the prompt for a model failure.** A failure that survives many
  unrelated prompts is not a prompt problem. A model that never draws the
  countable mechanism across six different style blocks needs replacing, not
  re-prompting — separate the two before spending another hour on phrasing.
- **The kitchen-sink negative prompt.** Fifty boilerplate exclusions copied
  between projects, over-constraining the model and hiding the three
  exclusions that actually defend this project's look.

## The test of mastery

Take a project's prompt set. Swap every subject block into a different
prompt's style block. If every result still reads as its style block's
project, the styles are locked. Then truncate any prompt at its model's
window: if what survives is the look, the ordering is right. Then search the
outputs for glyphs: if any image contains a letter, the constraint block or
the subject's nouns failed, and that image is discarded regardless of how
good it looks — because in a composited architecture, a beautiful plate that
speaks is worth less than a plain one that stays silent.
