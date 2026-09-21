---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: pseudo-localization-readiness
status: forged
laws: [format-skeleton-is-inviolable, coverage-is-counted-not-claimed]
shared_with: []
use_when: [testing whether a product is ready to be translated before paying for the first real locale, a translated build shows truncation clipping or strings still in the source language, deciding how much expansion a layout must absorb, a generated test locale floods the quality gate with findings]
---

# Pseudo-localization readiness

Before any engine is paid and before any translator is hired, one question
decides how expensive every later locale will be: **is this product ready to be
translated at all?** Hardcoded strings, sentences glued from fragments, layouts
sized to the source language's word lengths and fonts that cover one alphabet
are all defects of the *source* product, and each one is found far more cheaply
by a locale that costs nothing than by the first real one.

A pseudo-locale is that locale: generated from the source catalog by a
deterministic transform, with no engine, no request and no bill, rebuilt on every
change. It is not a translation and it asserts nothing about language; it asserts
that the product would survive one.

## Three orthogonal knobs

Two implementations read in code ship the same three transforms, each testing a
failure the other two cannot see. They are knobs, not a preset: toggle them
independently, because a defect observed with all three on cannot be attributed
to its cause.

- **Length correction** — pad or shrink every value to simulate expansion or
  contraction. Tests layout: truncation, overflow, wrapping into a second line
  the design never allowed for, and the inverse — a control that collapses
  when its label becomes short. The factors in circulation are published
  guidance, not measurements on any catalog: roughly +25–30% for some European
  targets, a contraction of 30–60% in characters for some East Asian ones, and a
  generic +40% for an English source. That last number is a body-copy figure; a
  single flat factor is the wrong instrument for the rule below.
- **Boundary markers** — a visible prefix and suffix around every value. Tests
  concatenation and clipping: a string whose marker is missing at one end was
  cut, and two markers meeting mid-sentence mean a sentence was assembled from
  fragments, which no real locale can translate correctly
  ([the source locale is the source of
  truth](../../../_laws.md#the-source-locale-is-the-source-of-truth) — that is a
  source defect, filed against the source).
- **Character transformation** — every letter replaced by an accented or
  script-shifted equivalent that stays roughly readable. Tests font coverage,
  encoding through every storage and transport hop, and, most valuably,
  **hardcoded strings**: anything still readable in plain unaccented source
  letters never went through the catalog. That is the only check in the whole
  topology that counts coverage from the rendered product rather than from the
  catalog ([coverage is counted, not
  claimed](../../../_laws.md#coverage-is-counted-not-claimed)).

All three transforms operate on translatable text only. Placeholders, rich-tag
names, syntax keywords and braces pass through untouched —
[the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
applies to a generated locale exactly as it does to a translated one. A
pseudo-locale that accents a placeholder name breaks the runtime, and every
failure it then reports is its own.

## Two rules that matter more than the knobs

**Expansion risk is concentrated in short strings.** The published band guidance
runs opposite to where designers look: a source value of ten characters or fewer
can need two to three times its length in a target, while one over seventy
characters needs roughly a third more. A single word has no synonyms of similar
length to fall back on; a paragraph averages out. So the risk sits in buttons,
tabs, column headers and badges — the fixed-width surfaces — not in the body copy
a +40% factor was drawn from. Apply the length correction **banded by source
length**, not flat, or the pseudo-locale over-tests the paragraphs that reflow
anyway and under-tests the labels that clip. The band figures are guidance; a
language subject supplies the real expectation for its language, and a
per-surface budget belongs to the copy-quality-gates subject.

**The pseudo-locale is exempt from every quality check while it exists.** Every
value in it differs from the source, fails terminology, fails spelling, fails
length ratio and matches no memory. Left inside the gate, it produces a wall of
findings that buries the real ones and teaches the team to ignore the gate. Mark
it in the language registry as a locale that is built and never offered,
excluded from every check, from every coverage number and from any memory or
cache that would let its values be reused as translations.

## Where it runs

It costs no engine time, so it is the one locale that does not need sharding: it
is generated in the same pipeline, woken by the same inputs, and finishes in the
time a build step takes ([sharded-translation-ci](./sharded-translation-ci.md)
covers the real locales that do). Build it **first** on every change to the
source catalog — a readiness regression introduced today is then caught today,
before a sharded run spends hours translating a string that was concatenated.

## When not to use it

- **As a substitute for a real locale.** It tests nothing about grammar, plural
  categories, word order or register, and nothing about right-to-left layout,
  which needs its own mirrored variant; a product that passes it is ready to be
  translated, not translated.
- **On content that is never rendered in a constrained surface** — a document
  corpus served as reflowing prose. Character transformation still finds
  encoding and hardcoding defects there; length correction finds almost nothing.
- **As a length sign-off.** Passing with a banded factor means the layout
  absorbs guidance-sized expansion. It does not certify a specific language's
  longest real string, which only rendering that string can do.

## Failure modes

- **A flat expansion factor.** The paragraphs reflow, the labels clip in
  production, and the pseudo-locale reported green because it padded the
  labels by the same third it padded everything else.
- **The pseudo-locale inside the gate.** Thousands of findings on day one; the
  gate is disabled or ignored, and the real locales lose it too.
- **Transforming the skeleton.** Placeholders accented, tags renamed; the
  pseudo-locale crashes, and its crash is misread as a product defect.
- **Offered in the switcher.** A test locale reaches users because the offer
  surface and the build list were the same list with no "never offered" state.
- **Run once at the start.** The product was ready in the first month; the
  hardcoded strings arrived in the sixth, and nothing was rebuilding the one
  locale that would have shown them.
