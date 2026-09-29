---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: hard-slice-stratification
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a benchmark no longer separates the systems being compared, a system must render long text or web addresses and numbers, a release is about to ship on a pooled score, choosing what to test beyond the standard sentences]
---

# Hard-slice stratification

A standard set of short, clean sentences saturates. Once systems land within
the recognizer's floor of one another, the set stops separating them, and
the score keeps being reported because it is cheap. What still separates
systems is the text that breaks them, and that lives on slices the standard set
does not contain. This technique is the practice of reporting those slices
beside the standard set, by name.

## What a slice is

A slice is defined by a mechanism that breaks synthesis, fixed before scoring:

- **Length.** Long-form text, where error accumulates: attention drifts, phrases
  repeat, the render stops early or trails into noise. Length is a slice even
  when every sentence in it is easy.
- **Rare tokens.** Web addresses, email addresses, phone numbers, large numbers,
  formulas, abbreviations, units. These have no single spoken form, and the
  reading is the whole question.
- **Mixed scripts and code-switching.** Names and phrases from another language
  inside a sentence.
- **Register.** Classical or poetic text, dense clinical or legal phrasing,
  emphatic and emotive text.

In a published long-form benchmark the pattern is stark. The standard long-form
text produced single-digit error for the better systems; the hard portion,
built from exactly the rare-token categories above, produced error several times
higher for the best system and, for weaker ones, error near the ceiling, with
the systems spread from the twenties to the nineties. A system whose standard
score is respectable gave no hint of that. A reproduction sharpens the point:
one released system scored 4.69 English word error on the standard long-form
text against a published 4.98, a small win, and 32.84 on the hard portion
against a published 26.26, a loss of more than six points. The standard set
pointed one way and the slice the opposite way, so a release gated on the
standard number would have shipped the regression.

## Rules

1. **Report slices separately, never pooled.** A pooled mean is dominated by
   whichever slice has more items and dilutes a rare catastrophic failure into
   a rounding difference. Each slice gets its own row, its own valid-item
   count and its own dispersion.
2. **Define slices by what breaks the system, not by where scores are low.** A
   slice chosen after looking at the scores is selected on the outcome: it will
   look easier the next time by regression toward the mean and it will hide
   whatever else broke. Write down the mechanism, then build or find text that
   contains it.
3. **A hard-slice regression blocks release even when the pooled number holds.**
   The pooled figure is the least sensitive statistic in the report, and a
   regression it absorbs is one users of that slice will meet first.
4. **Measure the floor per slice, where a floor exists.** A natural recording of
   a web address read aloud disagrees with its written form by a large margin, so
   a hard slice has its own recognizer floor, which is much higher than the
   standard set's. Where no natural recording exists, the slice yields a relative
   ranking on identical text and nothing absolute.
5. **Remember the slice is partly a normalizer test.** Numerals, symbols and
   addresses are exactly where normalization dominates the score; a hard-slice
   figure carries the normalizer in its header, and a change of normalizer is a
   change of slice.
6. **Keep slice sizes honest.** A slice with a few dozen items supports a
   direction and not a decimal; report an interval, or say the slice is a smoke
   test.
7. **Report the dispersion, and read a wide one as a failure.** Across repeated
   runs on the same slice a healthy system moves by a small fraction of its
   score. In one reproduction a small system's English error on a standard
   set was 33.91 with a spread of 13.06, beside a larger sibling at 3.77 with
   a spread of 0.19. A mean with a spread that wide is a system that
   intermittently fails, and the mean is the wrong summary of it.
8. **Count what never reached the scorer.** Items where synthesis failed drop
   out of a mean computed over successes, so a system that fails exactly on
   the hard items looks better on the hard slice. Report the failure count
   and rate beside the score, and read the score as conditional on producing
   audio.

## Building the slices

Start from the failure classes the system has already shown in listening, and
from the text types the product actually renders. Sample real instances,
including ugly ones; do not synthesize idealized examples, because the failures
sit in the awkward tail. Freeze the slice definition and the item list with a
version, so a later run cannot quietly swap in easier items. When a new
failure appears in production, add a slice for its mechanism rather than
widening an existing one.

## Decision rules

- When the standard set no longer separates the systems under comparison,
  stop citing it as the discriminator and promote a slice.
- When a candidate wins pooled and loses a slice the product depends on, it
  loses.
- When a slice is added after a failure, backfill it on the previous versions,
  because a slice with no history cannot show a regression.
- When a slice has no natural floor, do not quote it as an absolute rate.

## When not to use this

Early exploration with a handful of clips does not need stratification: the
signal is in the listening. And a product that only ever renders short, plain
sentences has the standard set as its whole workload; there the standard set is
the right test and slices beyond it would answer questions nobody asks. Even
there, keep watching for the first long or rare-token request, since that is
the day the standard number stops being the whole story.
