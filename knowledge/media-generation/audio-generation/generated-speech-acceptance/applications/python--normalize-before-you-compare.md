---
layer: application
type: application
subject: generated-speech-acceptance
technique: normalize-before-you-compare
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.10
---

# Normalizers as forks: three "word error" scorers in one framework

Written against an open-source audio-model evaluation framework at commit
bead726925d43f526bed48a4a6a827595169429d. Read-only: the tree was read, not
run, and nothing here was executed. The runtime witness is Python 3.10 or later
(`pyproject.toml:10 "requires-python"`).

The technique says the normalizer is part of the metric: declare it, hold it
constant, never compare across it, and treat a scoring-path asymmetry as the
first suspect when one system looks different on two benchmarks. This tree is a
useful specimen because it contains the hazard in three visible forms, and its
own replication notes measure one of them.

## Three normalizers under one label

The scorer used by the short-form voice-cloning benchmark deletes punctuation
outright: `audio_evals/evaluator/seed_tts_eval_asr_wer.py:22 "truth.replace(x,"`
and the matching hypothesis line replace each mark with nothing, keeping only
the apostrophe. A hyphenated compound or a decimal point therefore fuses into one
token. The scorer for the long-form benchmark replaces punctuation with a space,
`audio_evals/evaluator/long_tts_eval_asr_wer.py:32 "re.sub(pattern,"`, so the same
two characters split into two tokens. The same transcript scores differently
against the same reference under the two, before anything else differs.

The long-form scorer also rewrites numerals into words on both sides,
`audio_evals/evaluator/long_tts_eval_asr_wer.py:25 "num2words(int(m.group(0))"`,
which the short-form scorer never does, and it carries a second reference per
clip, taking the better of the two:
`audio_evals/evaluator/long_tts_eval_asr_wer.py:53 "label_text, label_text2 ="`
loads both and
`audio_evals/evaluator/long_tts_eval_asr_wer.py:66 "if wer2 < wer1:"` keeps the
smaller error. That is the minimum the technique calls optimistic by
construction: it is defensible, because a spoken form is a valid reading of
"5%", but only if the single-reference figure is published beside it, and
nothing in the record keeps that column.

A third variant hides in a generic evaluator that copies the short-form
function and drifts from it. The short-form scorer splits unspaced scripts into
characters while discarding whitespace,
`audio_evals/evaluator/seed_tts_eval_asr_wer.py:30 "[x for x in truth if x.strip()]"`,
and the generic copy splits every character, spaces included,
`audio_evals/evaluator/wer.py:52 "[x for x in truth]"`. Same task, same
recognizer, same references, two normalizers, and a reader of the results file
sees one column called word error.

## The script-conversion asymmetry

The short-form scorer converts the recognizer's Chinese output to the
reference script before comparing,
`audio_evals/evaluator/seed_tts_eval_asr_wer.py:75 "zhconv.convert(transcription"`,
and does it for Chinese only: the other unspaced languages in the same scorer
skip the call. The generic copy does not convert at all
(`audio_evals/evaluator/wer.py:73 "process_one(pred, label, self.lang)"`), and
neither does the long-form scorer. So one language has a converting path and two
non-converting siblings in one framework.

The framework's own recognizer replication note measures what that costs. Run
as a system under test on natural read Chinese, the recognizer wrote the
variant script on a share of utterances
(`replication/qwen3_asr.md:34 "10.8%"`), the framework scored without script
normalization, and the reproduced character error missed the published one
(`replication/qwen3_asr.md:34 "7.68(5.35)"`); converting the transcript first
brought it to about `replication/qwen3_asr.md:34 "5.56%"`. A two-point gap of the
kind that separates neighbouring systems, and it lived in the conversion step rather than in anything the recognizer or a synthesizer did.
The note's diagnosis is the standard the technique states, and it was made by
someone reading the transcripts, not by the tooling.

## Aggregation is a normalizer too

The two benchmarks also aggregate differently. The short-form task takes a plain
mean of per-clip rates (`registry/eval_task/seed_tts_eval.yaml:19 "agg: mean"`),
while the long-form task weights each clip by its reference length
(`registry/agg/wer.yaml:4 "weight_col: word_count"`). A long clip's errors count
for more in the second. Neither is wrong, but a number quoted from one family
and set beside the other needs the weighting named, and the results carry
neither.

## Deviations from the standard

- **The normalizer fails open.** The numeral conversion is wrapped in a blanket
  handler that keeps the raw text on any error
  (`audio_evals/evaluator/long_tts_eval_asr_wer.py:28 "except:"` followed by
  `audio_evals/evaluator/long_tts_eval_asr_wer.py:29 "text = text"`). If the
  reference converts and the hypothesis does not, or the reverse, the clip
  scores as a mismatch and no log line says why. The technique's rule is to
  fail loud and count every fallback; this code counts none.
- **No declaration in the result.** The results record the transcription and the
  reference text, which is enough to re-score, but not the normalizer, so a
  reader cannot tell which of the forks produced a given number.
- **Forks instead of one function.** Three near-copies of one normalizer is the
  standard's warning about a normalizer that is not a single, versioned
  function.
