---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: normalize-before-you-compare
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [two scoring paths report the same error metric and disagree, comparing systems whose transcripts differ in punctuation, numerals or script variant, a hard slice full of numbers and symbols, deciding whether a second acceptable reference may be used]
---

# Normalize before you compare

The transcript a recognizer returns is never compared to the reference text
as it stands. A function sits between them, and it decides what counts as an
error. That function is the normalizer, and it is part of the metric in the
same sense the recognizer is: change it and the number changes, hold it and the
number is comparable. Three normalizers that all report "word error" can
disagree on the same clip by more than the gap between systems.

## What the normalizer decides

- **Punctuation.** Deleting it and replacing it with a space are different
  operations. A hyphenated compound or a decimal point either fuses into one
  token or splits into two, and the same recognizer output then scores
  differently against the same reference.
- **Case, width and accents.** Whether case folds, whether full-width forms
  fold to their plain ones, whether accents are kept.
- **Numerals and symbols.** Whether digits become words, whether a percent
  sign is spoken out. The reference "5%" and the transcript "five percent"
  are the same reading and different strings.
- **Script variant.** A recognizer for one language may emit a variant script
  (traditional where the reference is simplified, for instance) on some share
  of clips. Unconverted, every character of such a clip is an error. This is a
  recognizer behaviour, not a synthesis one.
- **Multiple references.** Some pipelines accept a second, spoken-form
  reference and keep the better of the two per clip. That is a minimum, and a
  minimum is biased toward optimism: it only ever lowers the score.
- **Segmentation for unspaced scripts,** covered under the error unit in the
  round-trip technique.

## The measured lesson

One recognizer, evaluated on natural read Chinese speech, emitted the variant
script on roughly one clip in ten (about 10.8 percent) against references in
the other script. Scored raw, character error was 7.68 percent. Converting the
hypothesis to the reference script before comparing brought it to about 5.56,
against a published figure of 5.35. Two points of error, larger than the
separation between neighbouring systems, came from a conversion step, and
nothing in what the recognizer heard changed. The published figure was
approached only once the normalizer matched. The same behaviour is waiting
inside any speech scorer that uses such a recognizer to check synthetic
output: a scoring path that converts script and its sibling that does not
disagree by exactly this margin.

The general form of this hazard is **path asymmetry**: two scoring paths for
the same language, one that converts and one that does not. Then the same
system, the same clips and the same recognizer produce two different numbers,
and the difference is attributed to the benchmark or the model. The symptom is
a system that looks worse on one benchmark than another in the same language;
the check is to run one fixed clip set through both paths.

## Procedure

1. Write the normalizer as one function, versioned, applied to reference and
   hypothesis alike. Never normalize one side only.
2. Declare it in the header of every result: punctuation rule, case, numeral
   handling, script conversion, and how many references.
3. Hold it constant across every arm compared. A second normalizer for a
   second arm is a second metric.
4. Keep the raw pair (reference text, recognizer text) so any result can be
   re-scored under another normalizer; a normalized-only record cannot be
   audited.
5. Count what it changes: the share of clips whose script was converted, the
   share whose numerals were rewritten. A conversion rate near zero says
   the step is idle; a high one says the recognizer, not the synthesizer,
   is driving the score.
6. Test it on hand-built cases that include the awkward ones: a decimal,
   a hyphen, a full-width digit, a numeral, a mixed-script clip.
7. Make it fail loud. A numeral converter wrapped in a blanket handler that
   falls back to the raw text on any error produces per-clip path
   asymmetry: the clip whose reference converted and whose hypothesis did not
   scores as a mismatch, and no log line says why. Count and surface every
   fallback, and fail the run above a stated rate.
8. Declare the aggregation with it. Averaging per-clip rates and weighting each
   clip by its reference length answer different questions, and long clips
   dominate the second. Two benchmarks in one family may use one each; a number
   quoted without its weighting is another silent normalizer.

## Do not fit the normalizer to one recognizer

A normalizer built by reading one recognizer's mistakes and forgiving each
innocuous one favours that recognizer. Published work on a widely used
recognizer measured this directly: its standardization step reduced reported
error by very large relative amounts on some sets, and when checked against an
independently built normalizer the reduction differed most on the sets full of
contractions and numerals. The lesson for acceptance is that when two
recognizers are compared, or when a recognizer is replaced, the normalizer is
part of what changed.

## Decision rules

- When two results were produced under different normalizers, do not compare
  them; re-score from the raw pairs, or leave the comparison empty.
- When a minimum over two references is used, apply it to every arm and report
  the single-reference score beside it, because the difference is the credit
  the second reference gave.
- When the reference contains a numeral and the acceptance question is the
  literal reading, score the raw string as well, because a normalizer that
  forgives "one thousand" for "1,000" also forgives a mis-read digit string.
- When a system's score differs between two benchmarks in one language, diff
  the scoring paths before doubting the system.

## When not to use this

Where the deliverable is the exact string (a spoken code, an account number, a
name that must be read as written), normalization forgives the very error that
matters. Score those items raw, or by entity, and treat any normalized aggregate
as a second-class figure.
