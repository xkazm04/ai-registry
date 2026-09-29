---
layer: application
type: application
subject: generated-speech-acceptance
technique: round-trip-intelligibility
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.10
---

# Round-trip intelligibility in an audio evaluation framework

Written against an open-source audio-model evaluation framework at commit
bead726925d43f526bed48a4a6a827595169429d. Read-only: the tree was cloned and
read, and nothing here was executed, installed or run. It requires Python 3.10
or later (`pyproject.toml:10 "requires-python"`), which is the runtime witness
for this document.

The technique says: pin the recognizer by its full identifier, choose the error
unit per language, calibrate on natural speech, keep the three axes apart, and
treat the run as a two-phase job. This tree realizes most of that, and the
places it does not are recorded below as deviations, because the standard does
not bend to the tree.

## The recognizer pin, and the incident behind it

The English scorer names its recognizer through a registry entry
(`registry/evaluator/seed_tts_eval.yaml:19 "model_name: seed-tts-whisper"`), and
that entry resolves to a full hub identifier
(`registry/model/whisper.yaml:12 "path: openai/whisper-large-v3"`). The Chinese
scorer carries the most instructive line in the tree, a comment above the pin:
`registry/evaluator/seed_tts_eval.yaml:25 "important: the asr model name not 'paraformer-zh'"`,
and then the pin itself,
`registry/evaluator/seed_tts_eval.yaml:26 "model_name: speech_paraformer-speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch"`.
The short alias resolves to a different checkpoint from the one the benchmark
was built on, and the comment is the scar of someone finding that out from a
number. The long-form scorer repeats the same pin and the same comment
(`registry/evaluator/long_tts_eval.yaml:10 "important: the asr model name not 'paraformer-zh'"`),
so the lesson was copied rather than centralized: three evaluator files carry a
copy, and one file cannot drift from another only by discipline.

## The unit is chosen by language, in one place

The scorer picks its error unit from the language code:
`audio_evals/evaluator/seed_tts_eval_asr_wer.py:28 "yue: cantonese, th: thai"`
introduces the character-level branch, and
`audio_evals/evaluator/seed_tts_eval_asr_wer.py:77 "measure_name ="` names the
metric it reports (character error for Chinese, Japanese, Cantonese, Thai and
Korean, word error otherwise). Korean is in the character list although it is
written with spaces, which is the "fix one unit per language and write it down"
rule in practice. The weakness is the label discipline one file over: the
framework's ASR reproduction note says its results file reports the metric as
`replication/qwen3_asr.md:13 "reports the metric as"` `wer(%)` for every dataset
even where it computed characters, and the note relabels by hand. That is the
mislabel the technique warns about, caught by a human and not by the tool.

## Chunking as part of the metric

The long-form recognizer is the same weights as the short-form one with one
extra argument: `registry/model/whisper.yaml:30 "chunk_size: 28"`. The
recognizer accepts a bounded window, so a long render is cut into 28-second
pieces, transcribed separately and joined. The cut is part of the long-form
number and is written in configuration next to the pin, where the technique
wants it, and not left to a default.

## Three instruments, one flat record

The voice-cloning evaluator is an ensemble of a recognizer scorer and a
similarity scorer, and its merge is a plain dict update with no composite:
`registry/evaluator/seed_tts_eval.yaml:6 "- simo"` names the second component
and `audio_evals/evaluator/ensemble.py:20 "res.update(e(pred, label, **kwargs))"`
merges each component's output into one record. The result keeps error and
similarity as separate numbers per clip. The second benchmark family uses a
different similarity model and adds a third instrument:
`registry/evaluator/cv3.yaml:6 "- cv3-speaker-sim"` and
`registry/evaluator/cv3.yaml:7 "- dnsmos"`, with the embedding model at
`registry/evaluator/cv3.yaml:118 "model_name: speech_eres2net_sv_en_voxceleb_16k"`
against `registry/evaluator/simo.yaml:4 "model_name: wavlm_large"` for the first.
Two embedding models and two families of predicted-quality estimator
(`registry/evaluator/speech_qulity.yaml:5 "- dnsmos"` and
`registry/evaluator/speech_qulity.yaml:6 "- utmos"`) live in one tree; the
similarity numbers from the two benchmarks are on different scales and the tree
does not warn a reader who lines them up.

Both similarity scorers compare the render to the prompt or reference clip that
conditioned the generator (`audio_evals/evaluator/simo.py:20 "[pred, label]}"`
and `audio_evals/evaluator/simo.py:26 "class CV3SpeakerSim"`, which passes the
prompt clip as its second input), not to a held-out natural clip of the same
speaker. The technique prefers the held-out clip because a render can score well
by copying the prompt's channel.

## The two-phase run

Generation and scoring do not share the accelerator:
`audio_evals/eval_task.py:196 "self._release_predictor()"` releases the
generator between the inference phase and the evaluation phase, and the
evaluation phase then loads scorers on demand. The practical reason is memory:
a generator and three scorers resident together is a run that dies before any
verdict exists, and a dead run is unmeasured, not pass.

## Deviations from the standard

- **No natural floor for synthetic scoring.** The searched replication notes,
  dataset configs and guides never score the natural reference clips through the
  synthetic recognizer path. The only natural-speech calibration in the tree is
  the recognizer evaluated as a system under test (the ASR replication note),
  and, for the style judge, the reference-audio row. So a synthetic English
  score of 1.81 or 2.53 cannot be told from the recognizer's own limit by this
  tree alone.
- **Synthesis failures leave the mean.** After the evaluation phase the
  aggregate is computed over successes
  (`audio_evals/eval_task.py:229 "res, answers = [item for item in res if item is not None]"`)
  and the failure count and rate ride beside it
  (`audio_evals/eval_task.py:237 "total_error / len(quiz) * 100"`). The rate is
  reported, which is the right half of the rule; the score itself is still
  conditional on producing audio and should be read that way.
- **The recognizer alias fix was copied, not centralized,** as above.
