---
layer: technique
type: technique
subject: visual-style-locking
technique: style-block-restated-every-call
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [composing any generation call in a styled project, wiring a pipeline hop from still to motion, debugging look drift inside a batch]
---

# Style block restated every call

Generative image and video models are stateless between calls, and their
apparent memory — a reference image, a conversation, a "same as before" —
does not carry a visual contract reliably. The technique is blunt: **the
complete textual style block travels with every single generation call**, in
full, with no abbreviation, no matter what else is attached. The action half
of the prompt changes per shot; the style half never does, and never shrinks.

## Procedure

1. **Store the style as a structured record, not a string.** The block's
   slots (technique, subject treatment, role-assigned palette, finish) live
   in the project's style artifact. Prompts are *compiled* from it at
   generation time. A hand-carried string forks: someone trims it for one
   call, the trimmed copy gets pasted forward, and the project now has two
   styles nobody decided between.
2. **Compile style + action into one prompt per call.** The compiler is one
   function with one owner. Every generation path in the system — previews,
   proofs, production frames, motion — goes through it. A path that
   assembles its own prompt is a path that will eventually drop the style
   half.
3. **Restate at every hop, including into motion.** The hop from a picked
   still into a video model is the one teams skip, on the theory that the
   still already embodies the style. It does not hold: dropping the textual
   block at that hop transforms the look *mid-clip*. A motion prompt is not
   self-contained; it inherits the project's style block like any other
   call.
4. **Label attached references for what they are.** When the sheet's images
   ride along, the prompt must say — before the images appear — that they
   are style references, not content to reproduce: match their technique,
   palette, line weight and finish; do not copy their subject matter. An
   unlabeled attachment is ambiguous, and the model resolves the ambiguity
   toward "subject", returning the reference's content in the new frame —
   the exact inverse of a style lock.
5. **Translate what the provider cannot express, never drop it.** Providers
   differ in surface: one takes a negative-prompt field, another takes
   none. A style contract that includes exclusions ("no gradients", "no
   text") must survive the translation — as an explicit exclusion clause in
   prose where no field exists. Silently dropping the untranslatable part
   means the contract holds on one provider and not another, which reads as
   random drift.

## Decision rules

- When any generation call is being composed, include the full compiled
  style block — because a single omitted call is a visibly foreign frame,
  and foreign frames are found in review, at the expensive end.
- When a still moves to a motion model, restate the block — because the
  image alone measurably fails to hold the look through the clip.
- When references are attached, state their role first — because unlabeled
  images are read as content.
- When a provider lacks a field the contract uses, compile the contract
  into what the provider does accept — because the contract, not the API
  shape, is the invariant.
- When prompt length is under pressure, cut from the action block, never
  the style block — and prefer styles whose blocks are compact over
  abbreviating a verbose one per-call.

## What survives and what degrades

Restating the block guarantees the *contract* arrives; it does not make the
model able to honor every clause. Large shapes, bold type, and simple
sustained motion survive generation; fine typography, dense small detail,
and elaborate movement over long clips degrade regardless of how faithfully
they are restated. Author styles in big blocks, and treat a clause the model
demonstrably cannot hold as a style-design problem, not a prompting problem.

## When not to use it

For a genuine one-off image with no siblings, the two-block split is
overhead — there is nothing to be consistent *with*. And inside a pure
editing operation on an existing render (a targeted repair, a crop), the
source image is the content and the style is already in it; restating the
block there can push the editor toward re-rendering rather than the minimal
edit. The technique governs generation calls that mint new frames of a
styled set, which is everything else.
