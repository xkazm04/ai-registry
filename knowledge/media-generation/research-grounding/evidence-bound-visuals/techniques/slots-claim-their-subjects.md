---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: slots-claim-their-subjects
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [generating figures for a piece whose surrounding copy names real people or places, filling a roster or directory layout with generated imagery, deciding whether a silent generated figure needs a label, reviewing a render whose caption supplies an identity the image does not]
---

# Slots claim their subjects

Every other mark in this subject's grammar makes its claim *intrinsically*.
The axis claims precision by its ticks, the arrow claims causation by its
head, the number claims checking by being a number, the testimonial claims a
witness by speaking, the screenshot claims a record by its chrome. Read the
mark and you can name what it asserts.

One mark does not work that way:

> **A generated figure placed in a slot the piece has labelled claims the
> subject named on that label** — even when the figure itself asserts
> nothing at all.

An anonymous face is an innocent mark. The same face in the third cell of a
roster whose heading names real practitioners is an assertion that this is
one of them. Nothing changed in the pixels; the *position* supplied the
claim. This is the case where reviewing the render tells you least, because
the render is not where the overclaim lives.

## Why it is the hardest mark to catch

The other marks can be caught by looking at the element. This one is
invisible at element review by construction, and three properties compound
that:

- **The generator was never told.** A request for a portrait is discharged
  correctly by a plausible portrait. The model has no access to the caption,
  the column heading, or the product's premise, so it cannot know it is
  filling a denoting slot rather than a decorative one. Nothing it returns
  can be wrong in its own terms.
- **The reviewer sees the asset, not the page.** Generated material is
  usually judged in a batch view, one crop at a time, at exactly the moment
  its slot is not visible. The defect exists only in the assembled artifact.
- **Silence reads as modesty.** A figure making no claim looks like the
  *safe* option next to one that speaks, so the case that most needs a label
  is the one least likely to be flagged for one.

## The two properties, and why the pairing is the trigger

1. Does the surrounding artifact **denote** — does its copy, heading,
   schema or premise name a real subject for this position?
2. Is the occupant **generated**?

Neither alone is a defect. A generated figure in an undenoted slot is
ordinary illustrative material and nothing here constrains it. A photograph
of the actual person in a denoted slot is simply correct. It is the pairing
that manufactures a subject — and the artifact, not the image, is where the
pairing becomes visible.

Note what this does *not* require: no line is spoken, no first-person claim
is made, no realism threshold is crossed. A stylised figure in a denoted slot
still fills the denotation. Realism changes how badly it fails, not whether.

## Where the denotation comes from

The label is rarely a caption. In practice the denoting context is:

- **A schema field** the layout binds to — a roster, a directory, a leaderboard,
  a card grid whose records are real entities.
- **A heading or column that quantifies** — "the twelve we track", "this
  season's finalists". A count is a denotation: it says these positions are
  occupied by members of a real set.
- **The product's own premise.** The strongest and least visible source. A
  surface whose entire purpose is to report on real named subjects denotes
  every subject-shaped position on it, whether or not any text says so.

That last one is why this cannot be delegated to a caption check. The premise
denotes silently, and it denotes hardest exactly where the product is most
useful.

## Procedure

1. **Mark denoting slots in the layout, not in the asset.** The property
   belongs to the position — a template field, a schema annotation — so it
   holds however the slot is later filled and survives a change of generator.
2. **Refuse generation into a denoted slot by default.** The honest fills are
   the real subject's own image, a licensed stand-in carrying its own
   attribution, or a non-denoting placeholder that visibly declines to be a
   person: a monogram, a silhouette, an empty state. An empty state is a
   better answer than an invented occupant, and
   [refusal-is-a-state](../../../_laws.md#refusal-is-a-state) is what lets it
   be reported rather than filled.
3. **Where a generated occupant is genuinely wanted, break the denotation
   instead of labelling around it.** Move the figures out of the roster,
   or say in the frame that the depictions are illustrative. A disclosure
   that lives anywhere the slot does not travel to is not a disclosure.
4. **Review assembled, at least once.** One pass over the composed surface,
   not the asset batch, because that is the only view in which this mark
   exists.

## Failure modes

- **The populated roster** — generated occupants filling positions the
  surrounding schema says are real entities.
- **The count that became a cast** — a stated quantity of real subjects,
  discharged with generated ones so the number stays whole.
- **The premise denotation** — a product about real named subjects filling
  its own subject positions, with no text anywhere to catch.
- **The batch-view pass** — every asset approved individually, the assembled
  page never looked at.
- **Trimming instead of labelling** — cutting the region where the invention
  showed, which removes the evidence and leaves the practice.

## When not to use this

Undenoted decoration is untouched by this: mood imagery, abstract figures, a
hero illustration that names nobody. So is fiction, and so is any surface
whose subjects are avowedly invented — a demo populated with sample data is
denoting nothing, provided the surface says it is a demo somewhere the demo
travels. The technique governs positions that point at real subjects, not
generated people in general; per the subject's own boundary most of the
screen is legitimately the model's, and this concerns the positions that
point.
