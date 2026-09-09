---
layer: technique
type: technique
subject: visual-style-locking
technique: motion-sampled-under-a-frame-budget
status: forged
laws: [style-is-restated-not-remembered, unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [capturing a motion signature from reference footage rather than hand-authoring it, deciding how much of a reference to hand an extractor in one pass, a style readback describes the reference fluently and the recreation does not move like it, choosing the span of a clip to analyse, a practitioner reports that short excerpts replicate well and long ones drift]
---

# Motion sampled under a frame budget

[style-onboarding-from-sample](./style-onboarding-from-sample.md) separates a
house style into three stages and reaches a hard verdict on the third: the
motion signature cannot be read back, because a sequence of frames is not
evidence anything in the pipeline reads as motion, so the stage is
hand-authored from a decomposition. That verdict stands on the mechanism it
names. What it does not carry is the case between reading and hand-authoring —
**sampling** — which is what a practitioner is actually doing whenever they
point an extractor at reference footage and get something usable back.

This technique owns that middle case: what the sample is made of, the
arithmetic that decides its fidelity, and the failure it produces when the
arithmetic is left implicit.

## There is no motion channel, so the sample is stills in one request

The premise is a platform fact rather than a modelling opinion, and it is worth
stating precisely because every rule below is derived from it:

- The visual input is **an image block**. There is no video block, no clip, no
  frame-rate parameter.
- Animated container formats do not smuggle motion through that door: where an
  animated format is accepted at all, **only its first frame is used**. An
  animation is not a slow image; it is silently one image.
- Several images travel in one request and are analysed jointly, so a motion
  approximation exists — but it is *a set of stills the caller chose*, and
  every property of the resulting readback is a property of that choice.

So the caller is the sampler. Nothing upstream decides which instants the model
sees, and nothing downstream reports which instants it missed.

## The budget is per request, and the span is the only lever

Two constraints bound the sample, and neither scales with how much footage the
caller wants understood:

- **A hard cap on images per request**, fixed by the platform and by the
  surface being used — a low double-digit cap on a chat surface, low hundreds
  on a programmatic one.
- **A quality cliff at a small threshold**: past roughly the first score of
  images, a stricter per-image dimension limit applies to *every* image in the
  request. Buying more instants therefore costs resolution on all of them, so
  the two axes of fidelity trade against each other rather than adding.

The arithmetic that follows is the whole technique:

> **temporal resolution = frame budget ÷ span analysed.**
>
> The budget is fixed by the platform. The span is chosen by the caller.
> **Span is the only control anyone has over how much motion the sample
> contains.**

Halving the span does not merely make the task smaller; it **doubles the
evidence per second**. That is why a practitioner's report that short excerpts
replicate faithfully and a long stretch does not is a statement about their
sampling rate, not about the model's attention.

## Count is necessary; spacing is what gets graded

The arithmetic above is a floor, not a sufficient condition, and treating it as
sufficient produces a strip that is larger and worse. A judgment about *motion*
is a judgment about rhythm, and rhythm is carried by the **spacing** between
samples rather than by how many there are. Hand a reader a strip whose spacing
the sampler made uneven and the reader is grading the sampler.

An even-as-possible pick of `kept` from `available` has a constant stride only
when

> **(available − 1) is divisible by (kept − 1).**

That is a far tighter constraint than it looks, and it has two consequences
that invert the naive reading of the budget:

- **A larger sample can be strictly worse than a smaller one.** Across ordinary
  capture lengths, picks that are non-uniform sit beside smaller picks that are
  perfectly uniform — 9 of 10 lands on gaps of 1 and 2, while 4 of 10 lands on a
  clean stride of 3. Buying more instants bought an irregular clock.
- **Often no uniform middle exists at all.** When `available − 1` is prime, the
  only uniform picks are two frames and every frame. Several of the most common
  capture lengths have exactly that property, so a sampler asked for "about ten
  of fourteen" is not choosing badly — there is nothing better to choose.

So the rule that follows is not "sample more". It is: **prefer a uniform stride
to a larger irregular one whenever both fit the budget, and when no uniform pick
exists, stop trying to fix it by choosing a nicer number and declare it
instead.**

## The failure is silent, and it is the reason this needs writing down

An undersampled request does not fail. It returns a fluent, confident,
well-organised motion description — because the stills it did receive are real
and it describes them correctly. What changed is that everything between them
never existed: a transition that completes in a fifth of a second falls
entirely between two samples taken a second apart, and the readback's silence
about it is indistinguishable from the reference not having one.

This is [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) in
its sampling form, and it inverts the usual reading of a good result. A
description that covers the reference smoothly end to end, produced from a
span the budget could not have covered densely, is **evidence of interpolation
rather than of observation** — the model wrote the connective motion that
should have been there. The recreation then looks subtly generic in exactly
the places the original was distinctive, which is the defect that sends people
back to hand-authoring with the conclusion that capture does not work.

## Declare the sampling, and the silent failure stops being silent

The failure above is silent only while the sampling is undisclosed. It costs
almost nothing to disclose, and disclosure is what lets a reader discount
exactly what it could not see:

- state **kept of available**, never a bare frame count — a strip described only
  by its size is indistinguishable from a complete one;
- state the **spacing**: the stride when there is one, and the distinct gaps
  when there is not;
- tell the reader, in the same breath, that the frames between the samples were
  **removed by the sampler and are not missing from the motion** — so an absent
  in-between is not evidence of a jump, and timing is judged only on rhythm that
  survives the sampling;
- and where the caller supplied the frames directly, so the sampler never saw
  the full capture, report the sampling as **unknown rather than complete**. A
  strip whose `available` is unmeasured must not be published as evenly spaced,
  because a guessed denominator invents coverage
  ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).

A declared irregular sample is usable evidence with a stated limit. An
undeclared one is a description of motion the reader was never shown, and the
two are indistinguishable from the outside — which is the whole reason this
section exists.

## Derive the span from the fastest thing you need

Do not pick a span and hope. Pick it from the shortest event whose character
must survive capture — the snap of a card into place, the beat an element holds
before it leaves — and require enough samples across that event to characterise
it rather than merely notice it. Three is the floor for a direction and a
duration; fewer than that records that something happened.

> max span = (frame budget ÷ samples required per event) × event duration

Everything else follows from working that backwards. Where the answer is
shorter than the passage you wanted to analyse, the passage is analysed in
several requests, each with its own block — and that is a correct outcome, not
a workaround.

## Each span is its own hypothesis, and they are not averaged

A per-span capture is not a fragment of a whole-reference capture. It is the
only kind that has evidence under it, so the blocks are kept apart and treated
the way the parent technique treats any readback: as drafts a human edits.
Two rules keep the set honest, and both are the parent's coherence gate applied
to time instead of to a collection of stills:

- **Disagreement between spans is a finding, not noise.** Where two spans of
  one reference describe incompatible motion, the reference changed behaviour
  and the style has more than one register — which is worth knowing and is
  invisible to a single whole-reference pass, because that pass would have
  blended them into a hybrid nobody chose.
- **Never merge spans by averaging their blocks.** The union is assembled
  deliberately, per asset class, exactly as the parent's hand-authoring
  decomposition does; a mean of two descriptions is a description of nothing.

Record the span each block came from, with its sample count. A block whose
sampling is not written down cannot be re-derived, and its fidelity cannot be
argued about later
([output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence)).

## Decision rules

- Never hand an extractor a reference longer than the budget can sample; cut it
  into spans first, and derive the cut from the fastest event you need.
- Treat any whole-reference motion readback as unsampled until its span and
  frame count are stated — fluency is not coverage.
- When more instants are bought, check two things they cost: what the dimension
  cliff took from every image already there, and whether the larger pick is
  still evenly spaced. Density, resolution and regularity are one budget, not
  three.
- Prefer a uniform stride to a larger irregular pick whenever both fit; where
  `(available - 1)` admits no uniform middle, take the irregular pick and
  declare its gaps rather than presenting it as evenly spaced.
- Publish the sampling with every strip - kept of available, the stride or the
  gaps, and an instruction that the removed frames are the sampler's doing and
  not the motion's. A bare frame count is a coverage claim nobody checked.
- Where the frames arrived already chosen, report the sampling as unknown; a
  denominator nobody measured must never be rendered as a complete capture.
- Keep one block per span, with its sampling recorded, and assemble the union
  by hand per asset class.
- When two spans disagree, keep both and name the registers; do not average.
- Where the motion is faster than any affordable sample rate, stop sampling and
  hand-author it — the parent technique's rule is the correct floor, and this
  one does not repeal it.

## When not to use it

When the motion is the point of the work and the budget cannot buy a rate that
resolves it, this is a slower road to the hand-authored block and the
decomposition should simply be written. When the reference is not yours, the
sampling question is downstream of a prior one the parent technique settles —
what may be taken from someone else's work at all — and a denser sample of a
borrowed motion signature is a better copy, not a safer one. And when a
project already has a locked motion block that proofs cleanly, re-capturing it
from footage buys nothing: the block is the artifact, and it is restated rather
than rediscovered
([style-is-restated-not-remembered](../../../_laws.md#style-is-restated-not-remembered)).
