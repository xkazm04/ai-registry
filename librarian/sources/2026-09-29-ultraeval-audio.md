---
source: github:OpenBMB/UltraEval-Audio
kind: repository
url: https://github.com/OpenBMB/UltraEval-Audio
title: UltraEval-Audio - a unified benchmark framework for ASR, TTS, audio-codec and audio-LLM evaluation
author: OpenBMB
words: 2219
words_in_tree: 9732
extracted: 13
accepted: 3
declined: 0
leads: 3
already_covered: 3
untriaged: 3
dispatched: 1
applied: 3
shipped: 1
run_id: in-uea-0929
siblings: 0
fetches: 1
rescan_when: a release lands after bead7269 (2026-09-16); or 8 weeks elapse (2026-11-24)
---

# A retired judge was replayed but never bounded, and no stored row could say which judge scored it

**Class:** research-model release in its evaluation-harness form. A model lab's own framework
for scoring speech models, shipping the engine, the registry of tasks, and seventeen
replication notes that put each reproduced number beside the vendor's published one. The
README is the advertisement (2,219 words on the landing page); the first-party prose in the
tree is **9,732 words** (FAQ, six operating docs, seventeen replication notes), and the
first-party code is about 10,000 lines beside 1,263 vendored third-party files that were not
swept. Expected yield per the class: the prompt and config artifacts and the code that reads
them; here the replication notes were the measurement half and the scorers were the
instrument half. The director spent 1 of 3 fetches, to verify against the primary a claim the forge worker made
about the benchmark's reference row; the two landings are otherwise corroborated by executed code
and by a fleet tree, and the worker carried its own web budget for the new subject.

Declared focus from the scorecard (when an experiment row reads `better` or `unmeasurable`,
name the smallest code change it implies and ship that half in the session) applied and was
met: the judge seam produced a three-file change, committed in the project and not pushed.

## Sweep

Cloned at `bead726925d43f526bed48a4a6a827595169429d` (2026-09-16), `requires-python >=3.10`.
Read, in yield order: the operating docs (FAQ, resume, custom task); all seventeen replication
notes; the pipeline (`main.py`, `eval_task.py`, the resume loader, the recorder); the isolation
and environment layer (`isolate.py`, `env_setup.py`, `model_pool.py`); the scorers (four WER
variants, the speaker-similarity and ensemble wiring, the instruction-following judge and its
aggregator) and the registry YAML that binds them; the head of the environment test suite.
**Not read:** the paper PDF checked into the tree, the eighty model adapters, the
multiple-choice and reasoning evaluators (`bbh.py` alone is 921 lines), and the vendored
libraries. Two of those are leads below.

## Design record

```
decision:   Speech is scored by a round trip: the generated audio is transcribed by a recognizer
            that is pinned per language by its full hub name, and compared with the input text.
forces:     no per-clip ground truth exists for "said the right words"; humans do not scale; an
            alias that resolves to a moving checkpoint changes the number without changing the code.
buys:       a reproducible intelligibility number whose recognizer is part of its definition.
rejects:    a predicted-quality score alone; a single shared recognizer for every language.
where:      registry/evaluator/seed_tts_eval.yaml:25 "important: the asr model name not"
            audio_evals/evaluator/seed_tts_eval_asr_wer.py:77 "measure_name"
stage:      the acceptance step, after generation and before any human listen
corpus:     NONE. Nearest: the runtime voice-pipeline subject (engine choice, not scoring a clip).
```

```
decision:   One clip is scored on three instruments in one pass (round-trip word error, speaker
            similarity, predicted signal quality), and the similarity model differs between two
            benchmarks in the same tree.
forces:     intelligibility, identity and quality fail independently; an average would hide which.
buys:       a per-axis verdict whose instrument is named.
rejects:    a composite score.
where:      registry/evaluator/cv3.yaml:6 "- cv3-speaker-sim"
            registry/evaluator/seed_tts_eval.yaml:6 "- simo"
            registry/evaluator/simo.yaml:4 "model_name: wavlm_large"
            registry/evaluator/cv3.yaml:118 "model_name: speech_eres2net_sv_en_voxceleb_16k"
stage:      the acceptance step
corpus:     NONE (music acceptance is loudness and defects).
```

```
decision:   Three normalizers in one tree all report "word error": one deletes punctuation, one
            replaces it with a space, one converts numerals to words and keeps the better of two
            reference texts per clip; only one path converts script.
forces:     each benchmark ships its own scoring script and the framework ports it faithfully.
buys:       agreement with each benchmark's published figure.
rejects:    one shared normalizer.
where:      audio_evals/evaluator/seed_tts_eval_asr_wer.py:22 "truth.replace(x,"
            audio_evals/evaluator/long_tts_eval_asr_wer.py:32 "re.sub(pattern,"
            audio_evals/evaluator/long_tts_eval_asr_wer.py:66 "if wer2 < wer1:"
            audio_evals/evaluator/seed_tts_eval_asr_wer.py:75 "zhconv.convert(transcription"
            replication/qwen3_asr.md:34 "10.8%"
stage:      inside the scorer
corpus:     NONE for scoring recognizer output (product-localization scope only).
```

```
decision:   A resume records one typed row per stage per item, replays cached stages into a fresh
            file, and keys the cache by row position; a separate mode keeps only prompt and
            inference so an evaluator can change without regenerating.
forces:     runs are hours long and get killed; scorers change more often than models.
buys:       a complete results file on every run, and a re-score door.
rejects:    appending to the old file.
where:      audio_evals/dataset/resume.py:42 "idx = int(doc"
            audio_evals/eval_task.py:66 "score = kwargs"
            audio_evals/dataset/dataset.py:31 "def load_inf_file"
stage:      the resume step
corpus:     eval-harness / eval-economics states the keying rule; this tree fails it three ways.
```

```
decision:   The judge model behind a benchmark was withdrawn; the integration replays a
            substitute over the benchmark's own reference recordings and compares with the
            published aggregates, cell by cell, and keeps the judge out of the stored row.
forces:     no human labels exist for a benchmark the team does not own.
buys:       a first check that the substitute measures the same construct.
rejects:    presenting the substitute's numbers as the published series.
where:      replication/InstructTTSEval.md:45 "we evaluated the official reference audio"
            replication/InstructTTSEval.md:70 "broadly aligned"
            audio_evals/evaluator/instruct_tts_eval.py:136 "gemini_score"
stage:      validating a replaced instrument
corpus:     judge-calibration-and-drift says a new judge "starts uncalibrated" and reaches trust only
            through human labels; the no-labels case is not modelled.
```

```
decision:   Seventeen notes each put a reproduced score beside the vendor's, naming a cause where
            one is known and refusing to infer one where it is not.
forces:     reproductions disagree with published numbers for reasons that are not the model.
buys:       comparisons that say what they share.
where:      replication/fishaudio-s2-pro.md:23 "online service"
            replication/moss-tts-v1.5.md:27 "本文不对根因作推断"
            replication/FireRedTTS3.md:79 "999/1000"
stage:      reporting a reproduction
corpus:     eval-harness / measurement-revision covers a re-run against your own published number.
```

```
decision:   Generation runs in parallel, the generator is released, then scoring runs after the
            accelerator memory is free.
forces:     the generator and the scorers (a recognizer, an embedding model) do not fit together.
where:      audio_evals/eval_task.py:196 "self._release_predictor()"
stage:      between generation and scoring
corpus:     NONE. Nearest: eval-economics (durability and price, not residency).
```

**Routing count (written before deciding).** One system (an evaluation harness). Decisions the
corpus does not model: five (round trip, three-instrument scoring, normalizers, the
no-labels judge swap, residency). **Sharing one home-if-new:** three, and four with the
reproduction cause classes, all `media-generation/audio-generation/generated-speech-acceptance`.
The XL trigger fired mechanically. Decision: **forge a scoped subject in this session, not a
repository handoff** (the operator picked "forge it now" at the gate, 2026-09-29). The
judge-swap and the residency decisions have other homes and do not ride with it.

## Triage (v2.5 score; siblings live at start: 0, one joined at phase 6)

| # | Title | Prior art | Read | G/R/C | Rule | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Replay a retired judge over the benchmark's reference outputs, tolerance from its own floor | judge-calibration-and-drift / trust-bar-verdict ("new judge model starts uncalibrated") | real gap | 2/0/2 | score | **accepted: technique `judge-replacement-bridge`** + application; applied `experiment` better, shipped |
| 2 | Accept a generated speech clip (round trip, three axes, normalizer, hard slice) | none for speech (audio-generation holds music and effects) | real gap | XL | E4 | escalated; operator: forge now. **Dispatched** (see below) |
| 3 | A resume keyed by position and blind to the evaluator | eval-harness / eval-economics (models the rule) | partial, promoted by execution | app | source-tree | **application** `python--eval-economics--ultraeval-audio`, executed A/B better |
| 4 | Name the cause class of a reproduction gap | eval-harness / measurement-revision (adjacent) | partial | 2/1/2 | score | not accepted alone; **folded into the XL spec as technique 5**, where the worker corroborates it against primaries |
| 5 | Script normalization moved one character error from 7.68 to about 5.56 (published 5.35) | localization / chinese (product scope only) | real gap | - | - | folded into the XL spec (technique 2); no home elsewhere |
| 6 | A spread of 13 on a mean of 34 is a failure signal (0.6B: 33.91 plus or minus 13.06; its hard set scored 10.70) | eval-harness / reliability-aggregation, measurement-revision | likely catch | - | - | already covered |
| 7 | Failed rows leave the aggregate and the failure rate sits beside it | measurement-honesty / unmeasurable-vs-zero, incomplete-not-verdict | likely catch | - | - | already covered; the aggregator's zero-valid rate of 0.0 is one instance, recorded in application 1 |
| 8 | Idempotent environment prep: fingerprint in the marker name, in-process cache, cross-process lock with flock then O_EXCL fallback | sidecar-provisioning; concurrency-guards; stage-level-result-caching ("the marker points, the result decides") | likely catch | - | - | already covered |
| 9 | Release the generator before the scorers load | eval-economics (no residency) | thin | - | - | **untriaged**: no consumer; anchor `audio_evals/eval_task.py:196` "self._release_predictor()" |
| 10 | Item identity by name, not position | eval-economics bullet 3 | partial | 1/0/1 | score | **untriaged**: boundary case, executed, banked until a third tree shows it |
| 11 | A per-item error ratio with no upper bound; the notes filter items above 1000 | measurement-honesty | partial | - | - | **untriaged**: `replication/step-audio-r1_1.md:25` "Filtered abnormal samples"; the cause is not stated |
| 12 | A cloned voice needs consent and provenance | none (not in the tree) | - | - | V2 | **lead**, see below |
| 13 | Capability detected by signature must not unwrap decorators | none | thin | - | - | dropped: language-specific, no corpus home |

`auto=1/2/1  fp=0` (one auto-accept; two rejected on score, of which one was re-homed into the XL
spec and one banked; one escalated).

## Landings and applied rows

- **`judge-replacement-bridge`** (llm-observability, judge-calibration-and-drift): technique,
  golden-path section and failure mode, and `python--judge-replacement-bridge`. Executed with the
  judge stubbed: a full outage leaves the aggregate with no axis keys and only a failure rate;
  with 12 clips (4 clean, 4 unparseable, 4 raising) the aggregate's own counts account for 8 of 12,
  the real upstream error is replaced by an unbound-variable crash, and rows from two judges are
  identical. Arm B (null row with the real error, judge named in the row): 12 of 12 accounted,
  0 error rows, every row names its judge, headline rate over the clean verdicts unchanged.
  A second finding inside the aggregator: with no valid scores an axis reads 0.0 percent and enters
  the average. **Seam chosen to falsify, in the fleet** (`gravitone`): the judge retry ladder
  could have mixed judges inside one agreement figure. On 29 recorded cycles it never fired
  (58 of 58 picks from the first rung, 0 errors), so that hypothesis is refuted on history; what
  held was attribution. Paired replay over 27 cycle copies: judged pairs naming the judge 0/46 to
  46/46, everything else identical on 27/27, a synthetic outage stored as an error and not a pick.
  **Shipped** as `1fe0c17` in the project (not pushed). Bridge half: `unmeasurable`, instrument
  named in the ledger row.
- **`python--eval-economics--ultraeval-audio`** (software-engineering, eval-harness): a second
  witness that is executed and keyed on a different axis than the first. `experiment`, `better`,
  floor held (an unchanged-config resume still makes 0 calls).
- **Convergence, +1 on row 1:** two independent trees drop the judge's identity from the stored row.

## The forged subject: `generated-speech-acceptance`

Dispatched once, on the spec `librarian/handoffs/2026-09-29-generated-speech-acceptance.md`
(marked `EXECUTED`). One golden path (146 lines), six techniques (112 to 133 lines), three
`python--` applications against this tree (`round-trip-intelligibility`,
`normalize-before-you-compare`, `published-number-comparability`), all read-only. The category
`audio-generation` now holds four subjects. Gate green; the worker's 53 anchors and every anchor in the run's
own documents held under `check-anchors`.

**Director review, of the diff and not the report.** Purity grep over the upper layers with the
source's own vocabulary (recognizer, embedding, benchmark and vendor names): clean, with a
positive control showing the grep sees the words when they exist. Numbers in the techniques were
matched against the tree's notes (10.8 / 7.68 / 5.56 / 5.35; 4.69 / 4.98 / 32.84 / 26.26;
33.91 plus or minus 13.06 against 3.77 plus or minus 0.19; 1.81 against 1.64) and held. Three of
the worker's claims about the tree were re-read in code and held (a similarity row labelled
word error in one note, a 28-second recognizer window, length-weighted aggregation on the
long-form task only). Two files came back with CRLF and were normalized to LF.

**One correction, verified against the primary (director fetch 1 of 3).** The worker said the
benchmark paper's reference row and the project repository's row differ by "nearly three
points". The paper's full text has both tables (English 96.2 / 89.4 / 67.2, Chinese 90.9 / 86.7 /
69.8); the repository's figures (93.6 / 89.8 / 70.0 and 92.0 / 84.1 / 66.0) are not in the paper.
The two publications differ by up to **3.8 points** on one cell, more than any gap the replay was
judged on, and against the paper's row the same replay reads from about -4.3 to +4.1. Corrected in
the worker's technique and application, and it strengthened `judge-replacement-bridge`: two
publications of one reference row set the minimum tolerance.

**Spec items the worker overrode, with the argument:** kept `three-axes-beside-intelligibility` as
one technique (the routing sits inside it; a split would invite a composite); left the rights and
consent gate out (no primary, so no claim about law, and the golden path says only that no score
here decides permission); described the Chinese script figure as a recognizer on natural speech,
which is what the tree's note actually is, and carried the lesson over to speech scorers; added
`refusal-is-a-state` and `checkability-routes-the-pixel` where a technique genuinely rests on them.
**Upward lessons from the tree, taken into the draft:** a numeral converter that fails open to raw
text, a per-clip asymmetry nobody sees; aggregation as a silent normalizer (plain mean on one
benchmark, length-weighted on the other); failed syntheses dropping out of the mean and flattering
the system that failed most; the recognizer window as part of the long-form metric; one unit per
language, declared, since a spaced script can still be scored by character; a result key that says
word error while counting characters. **Deviation recorded:** the tree never scores natural
reference clips through the recognizer path it uses for synthetic speech, so it has no floor.

**Worker fetches:** five primaries (the multilingual synthesis benchmark paper, the long-form
paper, the instruction-following paper, the predicted-quality estimator paper, the multilingual
recognizer paper). The metric relabelling in a downstream README was confirmed against the
original's own table; the original leaves the unit for unspaced scripts open. The worker skipped
the speaker-embedding paper and any rights primary. It also noted that two arXiv links in the
tree's replication notes look wrong (one resolves to a different paper): a defect in the tree, not
in the corpus.

**Apply step for the six new techniques:** owed and not run. No fleet project generates or scores
speech (the TTS service that owned the slug was retired 2026-09-21), so each row is `unapplied`
with the return condition "when a fleet project grows a narration or speech track". The
scorecard names this.

## Leads

- **Rights and consent for a cloned voice.** Not in the tree, so it needs a primary. Return
  condition: the forge worker finds one, or a fleet project generates a narration track.
- **The paper checked into the tree.** Not read. Return condition: a `--delta` scan at a newer
  commit, or the worker's fetch budget reaching it.
- **The answer-extraction evaluators** (`bbh.py`, `mcq.py`, `ifeval.py`, `voice_bench.py`): a
  cascade for pulling a choice out of free-form output, never opened. Return condition: a run that
  scans an answer-extraction subject.

## Directions not proposed

`directions=not-run`. The two subjects with existing homes (`eval-economics`,
`judge-calibration-and-drift`) already have fleet consumers, and the fleet-map generator writes a
shared-tree file, so it was not run in a checkout carrying other sessions' uncommitted work.

## What this run learned about the method

- **A third-party harness can be executed without installing it.** The heavy scoring packages were
  irrelevant to both questions, so stubbing them let the tree's own resume loader, task runner,
  evaluator and aggregator run unmodified. Two of the run's four findings came from executing it and
  not from reading it (the unbound-variable crash and the two-channel failure accounting), and the
  read alone had missed both.
- **A falsifying seam can refute its hypothesis and still ship.** The ladder never fired, so the
  claim that judges mix inside one figure is false on history. The change shipped anyway because the
  measurable was attribution, which moved from 0 to 46 of 46, with the floor held.
- **Patch a fleet file by its own line endings.** The working copy was CRLF and the index LF, so a
  replay that normalized newlines matched text the file did not contain.
