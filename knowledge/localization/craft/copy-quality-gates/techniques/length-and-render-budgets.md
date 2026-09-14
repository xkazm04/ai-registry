---
layer: technique
type: technique
subject: copy-quality-gates
technique: length-and-render-budgets
status: forged
laws: [the-source-locale-is-the-source-of-truth, every-finding-cites-an-anchor]
shared_with: []
use_when: [a string passes its length check and still overflows on screen, deciding which kind of length budget a surface needs, source copy is written for a surface that every locale will have to fit]
stage: solo
---

# Length and render budgets

"Length budget" names three different instruments, and a gate that implements one
while the contract means another passes strings that overflow. Three tools read in
their shipping source each carry a different one or a combination
(code-verified, 2026-09). They answer different questions, fail in different
places, and belong to different owners.

## Three budgets

- **Ratio to source.** A configured factor — 1.2 to 1.3, for example — with an allowed deviation counted in characters *and* in words, so a target that
  is short in characters but long in words is still caught. It measures growth
  relative to what the layout already held and knows nothing about the surface:
  a source that already overflows passes every target that matches it.
- **Absolute characters.** A hard cap per surface, where something downstream
  truncates or rejects. It measures the field limit and knows nothing about width:
  character count is a proxy for rendered width, and the proxy is worst exactly
  across scripts, where full-width glyphs, combining marks and ligating scripts move
  width per character in opposite directions.
- **Rendered size.** The check renders the string in the real font — face, size,
  weight, letter spacing, and the per-language font override the product actually
  ships — and fails on pixel overflow of the declared box, returning **the rendered
  image as the finding's evidence**. It is the only one of the three that measures
  the defect rather than a proxy for it. One tool marks these warnings
  **unignorable**, the only such class it ships (code-verified): a reviewer can
  dismiss a pattern finding they disagree with, but not a picture of text leaving
  its box.

A surface with a hard truncation limit needs the absolute budget; a surface with a
fixed-width box needs the rendered one; the ratio is a cheap early warning for
everything else and never the only budget on a short surface.

## Short strings carry the risk

Expansion is concentrated in short strings — published band guidance puts a source
of ten characters or fewer at up to 200–300% and a source over seventy characters
near 130% (published guidance, not a measurement on any one catalog; the sibling
pipeline subject's
[pseudo-localization-readiness](../../translation-pipeline-topology/techniques/pseudo-localization-readiness.md)
technique carries the bands). A single ratio
factor is therefore a body-copy number. Applied uniformly, it passes the button
labels and tab titles most likely to overflow and flags long paragraphs that
reflow harmlessly. A ratio budget is banded by source length or it is replaced, on
short surfaces, by an absolute or rendered budget.

## Warn on the source

The rule that makes all three cheaper runs on the source, not the targets. When the
source is English and already at about **85% of its own budget**, the check warns on
the *source* (code-verified): English is usually among the shortest renderings, so a
source near its limit guarantees that every target will overflow. Under
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
that is a source defect — fixed once by shortening the source or widening the
surface, instead of by every localizer abbreviating in their own language. The 85%
margin is the shipped value for an English source; a source language that is not
typically shortest needs its own margin, and none is in evidence.

## Who owns the number

A budget is a property of the **surface**, so it lives in the product's contract
beside the surface's register ([copy-contract-before-drafting](./copy-contract-before-drafting.md)),
and a budget finding cites it per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor). A
length check with no declared budget has nothing to cite and enforces its author's
guess. A language subject supplies the *expansion expectation* for its language —
how much a target typically grows, where it grows most — never the number, because
the same language fits a wide card and overflows a narrow button.

## Procedure

1. **Declare per surface which budget applies** — ratio, absolute, rendered or a
   combination — and the value, in the contract.
2. **Band ratio budgets by source length**, or replace them on short surfaces.
3. **For rendered budgets, render with the font stack each locale actually ships**,
   including per-language overrides, and attach the image to the finding.
4. **Run the source-side check before any target exists**, and route a source near
   its budget to the source owner.
5. **Count strings checked per budget type**, so a surface whose rendered check
   silently fell back to a character count is visible as a coverage gap.

## Decision rules

- **When a surface truncates, give it an absolute budget; when it clips a box, give
  it a rendered one**, because each measures a different failure and neither
  substitutes for the other.
- **When a rendered check fails, do not let it be dismissed without a change**,
  because the evidence is the defect itself, not an inference about it.
- **When the source sits at 85% or more of its budget, fix the source or the
  surface**, because every target inherits the overflow and each locale can only
  hide it in its own language.
- **When a ratio factor is applied to strings of every length, band it**, because
  one factor over-flags long copy and under-flags the short strings that break.

## When not to use it

- **On surfaces that reflow.** Body text in a responsive column has no pixel budget;
  a rendered check there reports the layout's normal behaviour as a defect.
- **With a font the product does not ship.** A render in a fallback face measures a
  string nobody will see.
- **On a pseudo-locale.** A locale padded to test layout exists to fail these
  budgets and is exempt from the gate while it runs.
