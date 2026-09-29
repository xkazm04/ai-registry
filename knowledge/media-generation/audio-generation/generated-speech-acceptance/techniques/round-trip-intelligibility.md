---
layer: technique
type: technique
subject: generated-speech-acceptance
technique: round-trip-intelligibility
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [scoring whether a synthesized clip says the text it was given, a synthetic error rate looks very low and nobody knows the recognizer's own floor, choosing the error unit for a language, scoring clips longer than the recognizer's window]
---

# Round-trip intelligibility

The scalable test for "does this audio say this text" is to recognize the
audio and compare the transcript to the input. The number that results is the
combined error of two systems, the synthesizer under test and the recognizer
that listened, and the technique is the set of moves that keep the recognizer
from silently owning the result. A score with no account of its recognizer is
a measurement with an unknown instrument.

## The recognizer is part of the metric

Pin it, per language, by its full identifier: the complete model name and
revision, never a short alias. An alias that resolves to whatever checkpoint
is current changes the number without changing a line of the scoring code, and
the change looks like the synthesizer improving or regressing. Choose the
recognizer per language rather than one for all, because recognizers differ
enormously in accuracy across languages and a multilingual model that is
excellent in one language can be poor in another. Record the identifier in the
result header, next to the score, every time.

## Choose the error unit by script family

Word error rate assumes a word is a unit somebody has already delimited. In
scripts that separate words with spaces that holds. In scripts that do not
(Chinese, Japanese, Thai and a few others) a "word" is whatever a segmenter
decided, so word error measures the segmenter as much as the audio. Score
those languages at the character level, and say the unit in the header. A
spaced script is not automatically a word-level one: where spacing is a weak
convention, community practice scores by character even though spaces exist, so
the rule is to fix one unit per language, write it down, and hold it. Do not
average a character-level figure with a word-level one, and do not describe a
character-level number as word error: they are different quantities, and one
downstream summary that relabels the unit produces a gap that no synthesizer
caused. The same trap sits inside a tool: a result key that says "word error"
for every language while computing characters for some is a mislabel waiting to
be copied into a table. A single clip mixing scripts needs the unit declared per
script, not guessed.

## Score the natural recording first

Before scoring any synthetic clip, run the natural reference recording of the
same text, when one exists, through the identical path: same recognizer,
same normalizer, same chunking. That yields the recognizer's own floor for this
language and this kind of text. Report synthetic error as a distance from the
floor, not as an absolute. Two consequences follow, and both are rules:

- When a synthetic score is at or near the floor, the recognizer is the limit.
  Differences among systems inside that band are not synthesis results, and no
  ranking may be drawn from them.
- When no natural recording exists (a slice of rare tokens, say), there is no
  floor. The score is then usable only as a relative measure between systems on
  identical text, and the report says that instead of implying an absolute.

A score with no floor is a number and not yet a verdict. The bundle's rule that
unmeasured is not pass applies to the instrument itself: a run whose
recognizer was never calibrated on natural speech has not measured
intelligibility, whatever it printed.

## Read the error's shape, not only its size

Split the error into substitutions, deletions and insertions. Synthesis
failures and recognizer failures have different signatures. Dropped words,
truncated endings and early stops show as deletions; repeated phrases, looped
words and invented tails show as insertions; a rare proper noun read plausibly
but recognized as a common word shows as a substitution and is often the
recognizer's doing. A mean error rate hides a handful of catastrophic clips
inside many clean ones, so also report the share of clips above a stated error
threshold, and read the dispersion. A system whose mean is high and whose
run-to-run spread is as wide as the mean is failing, not fluctuating: a
healthy system repeats to within a small fraction of its score, and a spread
that large is a failure signal that a mean would bury.

## Long clips are chunked, and the chunking is metric

Recognizers accept a bounded window. A long render has to be cut, transcribed
piece by piece and joined, and the cuts are a source of error: a word split
across a boundary is lost or doubled. Cut at silences where possible, apply the
identical chunking to the natural floor, and record the chunk length in the
header. A long-form score produced with different chunking is a different
metric.

## Decision rules

- When two systems differ by less than the recognizer's floor band, report them
  as tied, because the instrument cannot separate them.
- When the text contains items a recognizer will not reproduce literally
  (numerals, symbols, web addresses), read the score together with the
  normalizer, because the two are one instrument.
- When a recognizer is upgraded, re-score the natural floor and the previous
  arms together, because a moving instrument invalidates old rows.
- When the language has no recognizer with a measured floor, route the clip to a
  listener and record the axis as unmeasured.

## When not to use this

Round trip measures linguistic content, so it is the wrong instrument for
non-linguistic output: laughter, breaths, singing, or interjections of one or
two syllables where any recognizer's floor is too high to see the effect. It
also underestimates unintelligibility: a strong recognizer leans on context
and can restore a word a human listener would not catch, so treat the score as
a generous upper bound on human intelligibility and keep a listener on
anything shipped to people.
