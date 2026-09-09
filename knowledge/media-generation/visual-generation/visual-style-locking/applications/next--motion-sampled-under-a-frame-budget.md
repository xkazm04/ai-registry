---
layer: application
type: application
subject: visual-style-locking
technique: motion-sampled-under-a-frame-budget
stack: next
status: reconciled
applied: experiment
ab_verdict: not-better
proof: ab-paired
verified_on: 2026-09-09
verified_against: next@16.3.3
---

# A filmstrip sampler that reports its own spacing

`verified_against` is read from the stack the tree **witnesses** — the `next`
pin in its `package.json` at the commit examined — not from a version anybody
guessed.

This application records a case where the consuming tree was **ahead of the
technique**, and the technique was corrected from what the tree already knew.
It is written as the negative it is: nothing was adopted here, and the reason
is the finding.

## The seam

A game-production pipeline renders a short animation to a numbered capture
directory and asks a vision model to critique the motion — a filmstrip judged
as one continuous action. That is exactly the decision this technique governs:
how many of the captured frames reach the reader, and what the reader is told
about the ones that did not.

The sampler is a pure function over the capture's filenames. It takes a cap,
picks an even-as-possible subset that always keeps the first and last frame,
and returns the chosen frames **together with a description of the sampling**:
how many were kept, how many were available, whether the spacing is constant,
the stride when it is, and the distinct gaps when it is not.

## What the tree knew that the technique did not

The technique as first written treated the frame budget as the whole story —
temporal resolution as budget divided by span, with "sample more" as the
implied corrective. The tree's own module comment states the sharper rule:

> *the sampling is part of the instrument* — a judge asked to score timing on a
> strip whose spacing the sampler made uneven is being asked to grade the
> sampler.

And the tree acts on it in three ways the technique had no rule for. It reports
kept-of-available rather than a bare count. It computes whether the spacing is
uniform and publishes the gaps when it is not. And when the caller supplies the
frames directly — so the sampler never saw the full capture — it reports the
denominator and the uniformity as **unknown rather than complete**, which is the
one branch a guessing implementation would have filled in.

Its prompt then spends a sentence telling the judge that the missing frames were
removed by the sampler and are not missing from the motion, so timing must not be
marked down for a gap the sampling explains. The technique's "silent failure" is
not silent here, because the tree says the quiet part out loud.

## The paired arm, and what it refuted

**Measurable:** for a given capture length, how the *regularity* of the strip
varies with the cap — the property a timing judgment is actually graded on.

**Arm A** was the technique's implied rule: a bigger cap is a better sample.
**Arm B** was the tree's rule: spacing decides, so check it.

The probe reimplements the tree's index-selection arithmetic exactly and
**asserts itself against the worked example in the tree's own comment before
reporting anything** — a 10-of-14 pick must produce source indices
0,1,3,4,6,7,9,10,12,13 with gaps of 1 and 2. It does, so the reimplementation is
the tree's semantics rather than an approximation of them.

Arm A is refuted, and not marginally. Across nine ordinary capture lengths there
are **31 pairs where a smaller cap yields a perfectly uniform strip and a larger
one does not** — 4 of 10 gives a clean stride of 3, while 5, 6, 7, 8 and 9 of 10
all give mixed gaps. A larger sample is routinely the worse instrument.

The structural fact behind it is arithmetic and was not designed by anyone: an
even-as-possible pick is uniform only when `(available - 1)` is divisible by
`(kept - 1)`. So when `available - 1` is prime, **the only uniform picks are two
frames and every frame** — there is no middle. Six of the nine lengths probed
have that property, including the 14-frame capture the tree names. The tree's
default cap is therefore not a sloppy number; it is the only kind of number
available, and declaring the irregularity is the correct engineering response
rather than a fallback.

## Verdict and what changed

`not-better`: nothing in this tree should adopt the technique as originally
written, and no code was changed. What changed was the corpus. The technique
gained the spacing constraint, the divisibility rule, the count-inversion
finding, and a declaration discipline lifted from what this tree already does —
publish kept-of-available, publish the gaps, tell the reader the removed frames
are the sampler's doing, and report an unmeasured denominator as unknown rather
than as a complete capture.

## What this realization cannot do

The sampler is pure and knows only filenames. It cannot see the motion, so it
cannot choose *informative* instants — a uniform stride is the best it can do
and a fast event still falls between samples if the capture rate was too low to
begin with. Nothing here addresses the capture rate; the discipline starts once
the frames exist. And the declaration protects a reader that reads the
declaration: it is an instruction in a prompt, not an enforced constraint, so it
bounds what an honest reader will conclude and not what an inattentive one might.
