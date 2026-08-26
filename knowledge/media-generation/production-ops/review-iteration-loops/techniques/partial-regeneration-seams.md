---
layer: technique
type: technique
subject: review-iteration-loops
technique: partial-regeneration-seams
status: forged
laws: [edit-do-not-regenerate, style-is-restated-not-remembered, unmeasured-is-not-pass]
shared_with: []
use_when: [applying an edit plan to audio or video rather than text, one section of a generated piece must change while the rest is kept, a regenerated region satisfies its brief but the result breaks at the joins, deciding whether a section edit is local or secretly global]
---

# Partial-regeneration seams

The edit-plan discipline was written for discrete media: beats, lines, blocks
— things with clean boundaries, where "everything not named by an operation is
byte-identical" is a complete honesty contract. A continuous medium keeps the
contract and adds a problem the contract cannot see. When one section of a
song, one region of an image, or one span of a shot is regenerated while the
rest is held, the artifact acquires **seams** — boundaries between kept and
regenerated material — and the seam is a property *neither side owns*. The
regenerated section can match its brief perfectly, every kept section can be
bit-exact, and the piece still fails at the joins: a key that lurches, a
tempo that stumbles, lighting that jumps, a texture whose grain changes mid-
surface. Per-region review passes; the artifact does not.

Three structures close this, and generation tooling that supports section
editing converges on all three.

## Kept material is referenced, never re-rendered

The edit request carries the kept sections **by reference to the stored
original**, so that "unchanged" is enforced by construction rather than by
hoping a model reproduces its own output. Asking a generator to re-emit the
parts that were fine is regeneration of the whole wearing an edit's clothes
— every re-emitted section is new material that has silently shed its
review capital, even when it sounds close. This is the continuous-media form
of "byte-identical": the bytes are the original's bytes because they *are*
the original, spliced.

## Continuity at the seam is a declared setting, not a hope

Each regenerated region carries an explicit statement of how strongly it must
adhere to its surroundings — current tooling exposes this as a per-section
adherence level, and the general form is a dial from "blend invisibly" to
"deliberate departure". The right value is a property of the *note*, not of
the medium: a lyric fix inside a chorus wants maximum adherence, because the
reviewer approved everything about that chorus except one line; "replace this
bridge with something darker" wants low adherence *inside* the region and a
designed transition at its edges. When the note asks for departure, the seam
moves from invisible to **designed** — one side of the joint has to bend, and
the edit plan says which: a transition bar, a fill, a cut on a structural
beat. An undeclared joint gets resolved by accident, and accident at a seam
is exactly the artifact a reviewer cannot un-hear.

## One region anchors the global frame — edits to it are not local

In any sectioned generation, some region's properties set the whole's: the
opening section establishes genre, palette, and tonal world, and everything
after is generated *in its light*. Identify the anchor before editing.
An edit that touches the anchor region is not a local edit — it is a global
restyle wearing a local edit's clothes, because every kept section's
"unchanged" status is now unchanged-against-a-frame-that-moved. Price it,
review it, and restart the capital accounting as the global change it is.
The honest plan for "make the intro orchestral" on a synth track is a fresh
draft with a restarted review clock, not thirty edits.

## Decision rules

- When a note names one region, hold every other region by reference and set
  adherence high, because the reviewer's approval of the rest is the capital
  being protected.
- When a note asks a region to depart from its surroundings, design the seam
  in the plan — name which side bends and how — because an unstated joint is
  an edit nobody reviewed.
- When the edit targets the anchor region, declare the change global and
  restart the review clock, because "unchanged" sections against a moved
  frame are unreviewed work presented as approved.
- Gate the applied result **at the seams, not only inside the regions** —
  key and tempo agreement, level matching, continuity of the frame across
  the joint — because per-region verdicts compose into no verdict at all
  about the boundary between them.

## When not to use this

Discrete media do not need it: text beats have no acoustic joint, and the
base edit-plan rules are complete there. And when the medium is rendered from
a symbolic source of truth — notation, a score, a parameter file — edit the
*source* and re-render the whole: the render is disposable, the seams are the
renderer's problem, and splicing renders to protect capital that lives in the
symbolic layer is solving the problem on the wrong side.
