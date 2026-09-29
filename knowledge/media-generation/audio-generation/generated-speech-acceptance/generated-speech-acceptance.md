---
layer: golden-path
type: golden-path
subject: generated-speech-acceptance
status: forged
use_when: [deciding whether a synthesized voice clip says what it was given, comparing two speech generators or two runs of one, a reproduced score disagrees with a published one, scoring style or emotion adherence with a listening judge, a clip sounds fine and a scorer disagrees, a listener prefers a different candidate than the top score]
techniques:
  - round-trip-intelligibility
  - normalize-before-you-compare
  - three-axes-beside-intelligibility
  - hard-slice-stratification
  - published-number-comparability
  - instruction-following-judged-on-audio
  - listening-board
---

# Generated speech acceptance

A synthesized voice arrives sounding finished, and that is what makes it
dangerous. A clip can drop a word, stop early, read a number the wrong way,
drift off the requested speaker, or carry a recording defect that only a
scorer hears, and still play as a confident, fluent take. Speech acceptance
is the discipline that refuses to let "sounded fine" stand in for checked.
It measures three things that do not substitute for one another: **what was
said** (does the audio say the text it was given), **who said it** (does it
sound like the requested voice), and **how it sounds** (is the signal clean).
It refuses to average them, and it owns a fourth job that music acceptance
never needed: deciding whether a number may be put beside anyone else's.

## What was said is measured by a second machine

The only scalable way to ask whether a clip says its text is to recognize it
back and compare the transcript to the input. That makes the score a joint
product of two systems: the synthesizer under test and the recognizer doing
the listening. Nothing about that is a flaw, provided the recognizer is
treated as part of the metric rather than as a neutral ruler: pinned by its
full identifier, chosen per language, scored in the error unit the script
calls for, and calibrated by running the natural reference recording of the
same text through the identical path first
([round-trip-intelligibility](./techniques/round-trip-intelligibility.md)).
The natural recording gives the floor. A synthetic score at that floor is a
recognizer limit, not a synthesis result, and the honest report says so
instead of ranking two systems inside the noise.

## A comparison is only as good as its normalizer

Between the recognizer's text and the reference text sits a function that
nobody advertises: the normalizer. It decides whether punctuation is deleted
or turned into a space, whether numerals become words, whether two script
variants of the same language count as equal, whether a second acceptable
reference is allowed to win. Each choice moves the reported error by amounts
comparable to the differences between systems, and each is invisible in the
final table
([normalize-before-you-compare](./techniques/normalize-before-you-compare.md)).
The rule is that the normalizer is declared, held constant across arms, and
never compared across. The most dangerous form is asymmetry: two scoring
paths for the same language, one converting the script and one not, so that
the same system looks different on two benchmarks for a reason that has
nothing to do with the system.

## Three instruments, three numbers, no composite

Intelligibility says nothing about voice. Speaker similarity, an embedding
comparison against the requested voice, says nothing about whether the words
survived. A predicted-quality score says nothing about either. A clip that is
clean and on-voice and drops a clause has failed; a clip that reads every word
in the wrong voice has failed a cloning brief; averaging them lets one axis
pay for another. Each axis therefore carries its own instrument, named, and
its own threshold set from what the brief committed to
([three-axes-beside-intelligibility](./techniques/three-axes-beside-intelligibility.md)).
Two facts keep the axes honest. A similarity number is comparable only within
one embedding model, because the scale belongs to the model. And a predicted
quality score is a screen that routes a clip to a listener, calibrated against
listener averages that it tracks far better across systems than across single
clips; it is not an acceptance verdict. Loudness and peak acceptance follow
the same measured gates as any delivered audio, covered by the music
acceptance subject, and are not restated here.

## A saturated set stops separating systems

A standard set of short, well-formed sentences saturates: good systems land
within the recognizer's floor of each other and the benchmark can no longer
tell them apart. What separates them is the slice where synthesis actually
breaks: long-form text where errors accumulate, rare tokens such as web
addresses, phone numbers, large numbers and formulas, code-switching, classical
or poetic text. A system that scores respectably on the standard set can
score many times worse on the slice that breaks it, and nothing in the
standard number hints at it
([hard-slice-stratification](./techniques/hard-slice-stratification.md)).
Slices are reported beside the standard set, never pooled into it, defined
by mechanism rather than by where scores happened to be low, and a regression
on a hard slice blocks a release even when the pooled figure holds.

## A number is a claim about a protocol

Putting a reproduced score beside a published one asserts that the two share
a protocol, and most of the time they do not. The published figure may have
come from a hosted service while the reproduction ran released weights; a
downstream summary may have redefined the unit; the row may come from a
different split; the normalizer may differ; the judge may have been retired;
the upstream code may have moved since the paper. Every one of those produces
a gap that looks like a verdict on the model
([published-number-comparability](./techniques/published-number-comparability.md)).
The discipline is to name what the two numbers share before writing them in
one row, to leave the cell empty and say why when the definitions differ, and
to write "cause not traced" rather than infer a cause the result files cannot
support.

## Style is judged by a listener, and a listener can be retired

Emotion, style and instruction adherence have no deterministic checker, so
they are scored by a judge model that listens, against a rubric. That judge
is an instrument with an identity, a version, a run-to-run spread and a
lifespan. When the benchmark's original judge is gone, the replacement's
number is not the published number; it becomes comparable only after the
replacement has been replayed over the benchmark's own reference recordings
and matched, within a tolerance taken from its own spread, to the published
aggregate
([instruction-following-judged-on-audio](./techniques/instruction-following-judged-on-audio.md)).
That replay certifies an aggregate. It says nothing about any single item,
and the judge's identity belongs in the header of every table it produced.

## The listener's verdict is an artifact too

The scorers rank; when the question is which generator or which voice to
adopt, a listener decides, and that hearing needs as much structure as any
scorer or it produces an impression a number can always outvote. The
instrument is a board: every arm on the same line side by side, the reference
and a held-out clip of the same speaker as audible anchors, every measured
clip reachable, device runs labelled as takes where the generator samples,
one clip at a time in a matched format, the scores printed under each clip,
and a short list of questions aimed at what the scorers cannot hear —
delivery copied along with timbre, texture, numbers and a final rise. Its
output is a record: the listener's choice per use beside the scorers'
ranking, the audible cause of any disagreement or "cause not traced", and how
many listened. A scorer lead smaller than the set can resolve is a tie the
listener breaks, and a listener who overrules the top score is evidence about
the score
([listening-board](./techniques/listening-board.md)).

## What no score decides

None of these instruments knows whose voice a clip imitates or whether that
person agreed. A similarity score measures resemblance, not permission, and
a clip with every axis green can still be a clip that must not ship. Rights,
consent and disclosure for a cloned voice are a gate of their own, decided
outside this subject and by people, and the acceptance record here does not
stand in for it. Equally, a listener stays in the loop: the scorers narrow
what a person must hear, they do not replace hearing.

## Where this subject ends

In one sentence: this subject **judges a finished synthetic
voice clip against its text, its requested voice and its brief**. Which engine
to run, whether to stream, whether to synthesize on the device or in a
service, are runtime pipeline choices for the product engineer; nothing here
chooses what to ship. Music and sound-effect acceptance, with the loudness,
peak and defect vocabulary shared in principle with this subject, live in the
[music acceptance](../generated-music-acceptance/generated-music-acceptance.md)
subject one folder over. Transcription fidelity for recordings of real people
(entity errors weighed against the aggregate rate) is a different problem, an
input rather than an output. Translation quality is scored elsewhere, since
what is scored here is a recognizer's text against the text the synthesizer was
given. And whether a judge agrees with human labels is calibration, a separate
craft; this subject stops at the replay check.
