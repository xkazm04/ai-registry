---
layer: technique
type: technique
subject: model-composed-workspace
technique: composition-motion
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [streamed text and model-placed views make the screen jump and flicker, a model-made rearrangement reads as everything disappearing and reappearing, people cannot tell which content the model produced]
---

# Composition motion

A screen that a model drives changes more often than one a person drives, and
for reasons the person did not initiate. A product's motion system already knows
how to make an entrance, a fold or a value change legible; what it does not know
is the handful of changes that only happen because a model is composing - text
arriving word by word, a component materialising while its arguments are still
streaming, a region re-forming at the model's request - and the provenance
question those changes raise: which of this did the model make? This technique is
those cases. The motion system itself - presets, budgets, reduced-motion
mechanics, continuity - is [motion](../../../../ui-surfaces/feedback-and-style/motion/motion.md),
and nothing here replaces it.

## Text reveal: by word, briefly, then gone

Streamed text arrives in bursts at machine cadence. Revealing each token as it
lands makes the paragraph shimmer at the producer's speed rather than the
reader's. The settled practice:

- **Reveal by word or short phrase**, with a short fade of the order of a tenth of
  a second or so per chunk - long enough to soften the edge, short enough that a
  reader never waits for a word they could already read.
- **Segment by the reader's locale.** Splitting on spaces does not work for
  languages written without them; use the platform's locale-aware word
  segmentation, or fall back to small character runs.
- **Pace to reading, not to compute.** When the model outruns the reader, the
  reveal does not try to keep up word for word; when it is slower, the reveal does
  not invent smoothness by holding words back.
- **Remove the animation when the message settles.** The settled message is plain
  text with no residual animated spans, so selection, copying and assistive
  technology see a paragraph, not a hundred animated fragments.

No study has yet compared token, word and chunk reveal for comprehension; the
practice above is the field's convergence, held as a default and not as a law.
Under reduced motion, the fade is withdrawn and text appears in chunks at the
render cadence - the content is never held back. Batching arrivals into one
update per frame is
[render-throttling](../../../runtime-and-io/streaming-output/techniques/render-throttling.md).

## Materialisation: reserve the footprint, fill in place

A component whose arguments are still streaming is **placed at once at its final
size**, as a skeleton in the slot and span it will occupy, and fills in place as
its data arrives. Nothing below it moves when it completes. A component that
starts small and grows as rows arrive pushes the rest of the reply down the
screen while the user is reading it, and every arrival is a jump.

The skeleton is honest about what it is: a placeholder shape, not a fake value. A
streaming chart does not draw a flat line at zero while it waits, and a table does
not render empty cells that read as "no data"
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Only the
validated, settled component is the answer; nothing partial is persisted.

## Model-made rearrangement: only what moved, once

When the model's operation changes the region - a view added, focused, removed,
reordered - animate **only the views that changed**, each with one shared-element
transition from its old slot to its new one. Views that did not change do not
move, do not re-enter and do not flash. The amount of motion is the size of the
change, derived from a delta between the old and new arrangement, never the size
of the region. The identity and delta rules are
[continuity-across-change](../../../../ui-surfaces/feedback-and-style/motion/techniques/continuity-across-change.md);
what is specific here is that the delta is between two compositions, and view
identity must survive recomposition for it to be computable at all.

Under reduced motion, a moved view cuts or cross-fades in place; travel and
scaling are withdrawn, the change itself is not. The degraded path still shows
the final arrangement and the "what changed" line, per
[content-bearing-degradation](../../../../ui-surfaces/feedback-and-style/motion/techniques/content-bearing-degradation.md).

## A calm budget

A constantly recomposing surface must still come to rest. Budget the model's
motion separately from the product's own, and tightly:

- one rearrangement transition per reply, not one per operation;
- no idle or ambient animation inside the region;
- no attention-seeking motion (pulses, bounces) on model-placed views - the "what
  changed" line and a brief highlight carry attention, and the highlight ends.

The mechanism for keeping that a number with an owner rather than a hope is
[taste-budgets](../../../../ui-surfaces/feedback-and-style/motion/techniques/taste-budgets.md).

## Provenance: a labelled marker that yields to human edits

People should be able to tell which content on the screen the model composed.
Give model-originated content a **labelled marker** - a short word, not a symbol
alone - with an explanation available on request: what produced it, from which
modules. An icon on its own fails: when a glittering-star icon was tested, people
did not associate it with the concept the designers intended, and the
recommendation that came out of that work is that such an icon always travels
with a label.

When a person edits model-originated content, it **returns to the ordinary style**
and the marker is removed, because it is no longer the model's; offer a way back
to the model's version where that is meaningful. A marker that persists on content
a person rewrote misattributes their work; a marker that vanishes on a cosmetic
change is noise.

## Decision rules

- **When a streamed component would change size on completion, reserve its final
  size first.**
- **When more than the changed views move during a recomposition, the delta is
  wrong**, usually because view identity was lost.
- **When the reveal animation is still present on a settled message, strip it.**
- **When a marker is only an icon, add the word.**

## When not to use this

- **Static, one-shot compositions** that render whole after the model finishes:
  there is nothing to reveal and nothing to reserve, only the motion system's
  ordinary entrance.
- **Data-dense professional surfaces** where any animation competes with reading
  figures; there the reduced form is the default for everyone.
