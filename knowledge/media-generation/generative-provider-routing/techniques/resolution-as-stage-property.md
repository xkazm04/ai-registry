---
layer: technique
type: technique
subject: generative-provider-routing
technique: resolution-as-stage-property
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate]
shared_with: []
use_when: [generation spend is dominated by drafts, choosing render sizes for a multi-stage pipeline, a winner needs delivery resolution]
---

# Resolution as a stage property

Generation vendors price by output size, and steeply — per-image rates
commonly double per size step, so the span from a small draft to a full
delivery render is often four to eight times the money for the same prompt.
A pipeline that renders everything at one "reasonable" global resolution is
therefore paying a delivery premium on every image whose purpose is to be
thrown away. The correction is structural, not a tuning pass: **resolution
belongs to the pipeline stage, not to a global setting.** Each stage of the
funnel — explore, grade, deliver — has its own size, chosen by what that
stage's output is *for*.

## The ladder

- **Draft — the smallest size the stage's question can be answered at.**
  Drafts exist to explore composition, subject reading, and prompt
  direction, and to be discarded. Every one of those judgments survives a
  small render. The draft stage is also where candidate fan-out lives —
  many variants per beat — so it multiplies whatever rate it runs at, which
  is exactly why it must run at the cheapest rung. Fast iteration small,
  then promote the winner: wide exploration at the draft rate buys more
  usable winners per unit of spend than narrow exploration at a premium
  rate ([cost-per-usable-output](../../_laws.md#cost-per-usable-output)).
- **Proof — the mid size where acceptance is judged.** The graded candidate:
  on-brief checks, style-conformance reads, stray-text detection, human
  review. Mid resolution is the floor here because some defects are
  invisible below it — texture artifacts, small-element integrity, edge
  quality — and a pass granted at a size where the defect cannot be seen is
  not a pass. Match the proof size to the smallest size your graders (human
  and machine) are validated at.
- **Final — delivery size, winners only.** The full rate is paid exactly
  once per *accepted* image, after the brief and the review have converged.
  By construction the expensive rung processes only survivors.

Three rungs is the useful default; what is load-bearing is not the count but
the invariant that **spend per image rises only as certainty rises**.

## Promotion, not regeneration

Moving up a rung re-renders — same prompt, same references, same
conditioning, larger size — and that makes promotion a *risk event*, because
a diffusion render at a new size is a new sample: composition can shift,
elements can drop, defects can appear where the proof had none. Two
disciplines follow:

- **Promote the winning request, byte-for-byte.** The prompt and every
  conditioning input are carried over unchanged; only the size parameter
  moves. Any "improvement" folded in during promotion voids the review that
  selected the winner, in the same way any regeneration voids review
  ([edit-do-not-regenerate](../../_laws.md#edit-do-not-regenerate)) — if
  notes exist, they are edits applied *after* the promoted render exists,
  never a rewrite smuggled into the size change.
- **Re-verify at the top.** The final render gets the proof stage's checks
  again, cheaply — it is one image, not a fan-out. A promotion pipeline
  that trusts the proof's grade for the final's pixels is grading an image
  that no longer exists. Where the vendor supports true upscaling of the
  accepted pixels (rather than re-sampling), prefer it for exactly this
  reason: it preserves the reviewed image instead of re-rolling it.

## Interactions with routing

Size is part of the request the router prices and the ledger binds rates to:
a per-image rate measured at one size does not quote at another, so each
rung needs its own priced row — or an honest "unpriced" — before its spend
can be estimated and gated. And a re-route mid-ladder is a caution flag: a
fallback vendor snaps to a different pixel grid and may not offer the same
rung sizes, so a proof graded on one vendor should be promoted on that
vendor absent a reason strong enough to accept a cross-vendor re-sample.

## Decision rules

- Set each rung by the question asked at that stage, not by a uniform
  fraction of delivery size; then check the rate card — if two adjacent
  rungs price the same, merge them, because the ladder's cost is real
  (promotion re-renders, re-verification) and is only worth paying between
  rungs with a genuine price gap.
- Aspect ratio is pinned at *every* rung, explicitly. The ladder varies
  size, never shape — a draft explored at one ratio and delivered at
  another was never a draft of the delivered image. Vendors default aspect
  when unpinned, and a whole batch coming back in the wrong orientation is
  a documented, expensive way to learn this.
- Meter the funnel: renders and spend per rung, and the promotion survival
  rate. A final rung rejecting often means the proof rung is graded below
  the size its defects show at — fix the proof size, not the final's

## When not to use this

Single-shot pipelines with no exploration stage (one image per request,
straight to the user) have no funnel to ladder — they need one deliberate
size, priced and pinned. Skip the ladder too when the cheap rungs are
useless for the judgment being made — some styles read entirely differently
below a threshold size, and a draft that cannot predict its own promotion
is spend, not savings. The test for keeping the ladder: does a draft's
verdict usually survive promotion? If not, your real draft size is one rung
higher than you hoped.
