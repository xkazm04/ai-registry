---
layer: technique
type: technique
subject: review-iteration-loops
technique: partial-regeneration-seams
status: forged
laws: [edit-do-not-regenerate, style-is-restated-not-remembered, unmeasured-is-not-pass, cost-per-usable-output, refusal-is-a-state]
shared_with: []
use_when: [applying an edit plan to audio or video rather than text, one section of a generated piece must change while the rest is kept, a regenerated region satisfies its brief but the result breaks at the joins, deciding whether a section edit is local or secretly global, a generated clip is wrong in one span or one corner and a re-roll is the only remedy anyone has proposed, one panel of a multi-panel reference or storyboard sheet is wrong]
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

## The edit pass is itself lossy

In generative pixel media the edit operation has a cost the edit-plan
arithmetic does not show: **each generative pass re-encodes what it
touches, and re-encoding softens.** One edit trades a little crispness for
the change; a chain of edits — fix the hat, then the hands, then the
background, each applied to the previous edit's output — accumulates the
loss visibly, as smoothing, plastic texture, and speckled compression
artifacts, until the asset reads as a copy of a copy. Practitioners meet
this independently and converge on the same three moves:

- **Every edit applies to the stored original, never to a previous edit's
  output.** Kept-by-reference already says this for the kept regions; this
  extends it to the *chain* — three notes on one image are three edits from
  the original (or one combined edit), not a three-generation lineage.
- **Composite when the tooling allows it.** The strongest form keeps the
  original's pixels everywhere and takes only the edited region from the
  new render — masked over the original, so the loss is confined to the
  region that had to change.
- **Mechanical changes take the deterministic tool.** Removing an object on
  a clean ground, cropping, covering — an ordinary editor does these with
  zero generative loss, and reaching for the model where a rectangle would
  do spends quality on nothing.

**Where the artifact is a multi-panel sheet, compositing stops being the
strongest option and becomes the only one.** A sheet minted as a single image
— a turnaround, a set of angles, a storyboard row — has no addressable
region: a request to fix one panel re-renders every panel, and the model
re-decides the others while it is there. So the fix is not "regenerate that
panel", which the interface will appear to accept; it is regenerate the
sheet, take only the corrected panel, and composite it back over the
original. The step nobody performs is the one that makes it safe: **diff the
panels you did not ask about.** They came back changed often enough that
assuming otherwise reintroduces, silently and across the whole sheet, exactly
the drift the sheet exists to prevent.

## In time-based media the deterministic tool has two more operations

The bullet above lists what an ordinary editor does to a still: remove on a
clean ground, crop, cover. A clip has a second axis, and that axis carries
two operations a still does not have — **excise an interval**, and **reverse
one**. Both cost nothing generative, and the second is the one practitioners
find late, because nothing about a defective render suggests that playing a
span of it backwards is a repair.

What makes this more than a bag of tricks is that the defect's own *extent*
chooses the operation. Locate the defect before choosing a remedy:

| The defect occupies | Remedy | What it costs |
| --- | --- | --- |
| a bounded interval, with the material either side standing on its own | **excise** the span | those seconds, and a seam to gate |
| a bounded interval whose motion runs the wrong way | **reverse** that span | nothing, where the motion is time-symmetric |
| a bounded region of the frame, clear of the subject | **reframe** — scale and reposition until the region falls outside the crop | resolution, and the framing the shot was composed on |
| the whole clip — wrong subject, wrong texture, wrong light | none of these | a regeneration, honestly priced |

Only the last row earns a new sample. Routing every defect to a re-roll pays
generation rates for three problems an editor solves for nothing, and pays
them repeatedly, because a re-roll is a *fresh sample*: it does not fix the
defect, it re-enters the lottery that produced it. This is the same economy
[cost-per-usable-output](../../../_laws.md#cost-per-usable-output) prices
elsewhere, arriving one stage later — the cheapest usable output is often a
rejected render with ninety per cent of its duration intact.

**Reversal has a hard boundary, and it is the operation most likely to be
over-applied.** It is available only where the depicted motion is
time-symmetric: a barrier that drops when it should have risen, a mechanism
that closes when it should have opened, drifting smoke, a swinging weight.
It is unavailable wherever the material carries an arrow of time the viewer
already holds — gait, any mouth on screen, flame, dissipating smoke,
anything spilling, shattering or burning. Applied there the repair is louder
than the defect. And reversal is a property of the whole span, not of the
defective moment: everything inside the interval reverses, including the
elements that were already correct.

Two dispositions follow for the gate that found the defect. A clip whose only
failing defect has an editorial remedy is **accepted with a named repair**
rather than rejected — and the repair travels with the clip as provenance,
because nobody downstream can infer from a clean-looking timeline that one
shot is holding a crop it must not lose or a reversal it must not re-cut
through. And a defect that no editorial remedy reaches and no re-brief
addresses does not become a retry budget: per
[refusal-is-a-state](../../../_laws.md#refusal-is-a-state) the same request
is never re-sent blind, so the slot either takes an amended brief or reverts
to an honest empty state carrying what was asked and what came back.

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
- When a clip's defect is bounded in time or in frame, price the editorial
  remedy before the re-roll, because a re-roll re-samples the whole shot to
  address a fault that occupies a fraction of it.
- When the remedy is a reverse, check that nothing in the span carries an
  arrow of time — a mouth, a flame, a gait — because the reversal takes the
  whole interval and not the defect.
- When a repair leaves the clip depending on a crop, a trim or a reversal,
  record it with the clip; a downstream editor who re-cuts through an
  undeclared repair restores the defect.
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
