---
spec: forge
status: EXECUTED
subject: generated-speech-acceptance
bundle: media-generation
category: audio-generation
source: https://github.com/OpenBMB/UltraEval-Audio
source_commit: bead726925d43f526bed48a4a6a827595169429d
run_id: in-uea-0929
date: 2026-09-29
---

# Forge spec: generated-speech-acceptance

**Why this is XL, argued.** Four design decisions in one evaluation tree share one
home the corpus lacks: how a generated *speech* clip is accepted. The
`audio-generation` category holds music prompting, music acceptance and sound-effect
generation; nothing accepts a synthesized voice, and the two nearest subjects sit
in other bundles on other jobs (runtime voice pipelines; interview transcription
fidelity). The mechanical trigger (three design candidates, one home-if-new) fired,
the operator picked "forge it now" at the Phase 5 gate (2026-09-29), and one author's
account of a tree is thin evidence for a subject, so this spec names the web budget
that has to corroborate it.

## Placement (verified against the authority, not a count)

`knowledge/media-generation/taxonomy.json`: category `audio-generation`, layout
`nested`, holding 3 subjects before this entry and 4 after it (cap 10, no
subcategories, so subjects sit directly under the category). The director has
already appended `generated-speech-acceptance` to that category's `subjects`.

Subject folder: `knowledge/media-generation/audio-generation/generated-speech-acceptance/`.
From the golden path the laws file is `../../_laws.md`; from `techniques/` and
`applications/` it is `../../../_laws.md`. Bundle `stacks:` is `[next, python, go]`
plus the defaults, so `python` and `process` applications are valid. Purity profile
is `media`.

## The subject, in one paragraph

A synthesized voice arrives sounding finished, which is why it is dangerous: a clip
that sounds fine can drop words, drift off the requested speaker, or carry a
recording defect that only a scorer hears. Speech acceptance is the discipline that
measures three things that do not substitute for one another - **what was said**
(does the audio say the text it was given, recovered by a recognizer), **who said
it** (does it sound like the requested voice, by an embedding comparison), and **how
it sounds** (signal quality, by a predicted-quality model) - and refuses to average
them. It also owns the honesty layer that decides whether a number may be
compared with anyone else's: the recognizer, the normalizer and the embedding model
are each part of the metric, so a score without them is not a score.

## Proposed techniques (slugs are final; the decision rule each must carry)

1. `round-trip-intelligibility` - Score what was said by recognizing the render back
   and comparing it to the input text. The recognizer is part of the metric: pin it per
   language by its full identifier (an alias that resolves to a moving checkpoint
   changes the number without changing the code), and choose the error unit by script
   family (word error for space-delimited scripts, character error for the others).
   **Score the natural reference recording through the same path first**: that gives
   the recognizer's own floor, and a synthetic score near the floor is a recognizer
   limit, not a synthesis result.
2. `normalize-before-you-compare` - The normalizer is part of the metric. Three
   normalizers in one tree all reported "word error": one deletes punctuation, one
   replaces it with a space, one converts numerals to words and keeps the better of two
   reference texts per clip. Declare the normalizer, hold it constant across arms, and
   never compare numbers across normalizers. The measured case to carry: one recognizer
   run on a Chinese set emitted the traditional script on ~10.8% of utterances against
   simplified references; scoring unnormalized gave 7.68 character error, converting the
   hypothesis to the reference script gave ~5.56, and the published figure was 5.35.
   Scoring path asymmetry (one path in the tree converts script, its sibling does not)
   is the general hazard.
3. `three-axes-beside-intelligibility` - One clip, three instruments, three numbers,
   no composite: intelligibility (technique 1), speaker similarity (an embedding
   comparison against the reference voice) and predicted signal quality. Each axis
   names its model; a similarity number is comparable only within one embedding model
   (the same tree scores similarity with two different embedding models on two
   benchmarks); a predicted-quality score is a screen that routes a clip to a listener,
   not an acceptance verdict.
4. `hard-slice-stratification` - A standard set saturates and stops separating
   systems; report the hard and the long-form slices beside it. The measured case: one
   system scored 4.69 (English) on the standard long-form set and 32.84 on its hard
   set against a published 26.26, and another system's score on the standard set gave
   no hint of it. Decision rules: report the slices separately, never pooled; a slice
   is defined by what breaks the system (length, rare tokens, code-switching), not by
   where the scores happen to be low; a hard-slice regression blocks even when the
   pooled number holds.
5. `published-number-comparability` - Before putting a reproduced score beside a
   published one, name what the two share. Cause classes seen across seventeen
   replication notes in one tree: the published number came from a hosted service and
   the reproduction from released weights; a downstream summary redefined the metric
   (character error reported where the original benchmark reports word error, for four
   languages); the published row is a different split of the same corpus; a script
   normalization differs; the judge was retired; the upstream code moved after the
   paper; the vendor's own scorer, re-run, reproduces the reproduction and not the
   published figure (which puts the gap on the model side, not the scorer side). Rules:
   leave the comparison cell empty and say why when the definitions differ; say
   "cause not traced" rather than infer one the result files cannot support; carry the
   valid-row count beside every score (one note carries 999 of 1000 rows and says it
   did not trace the missing one).
6. `instruction-following-judged-on-audio` - Style, emotion and instruction adherence
   are scored by a judge model that listens, and a judge is an instrument that can be
   retired. When the benchmark's original judge is gone, do not present the new judge's
   number as the published one: replay the replacement over the benchmark's own
   reference recordings and compare with the published aggregate. The tree's own replay
   moved individual axes by up to 2.2 points in either direction and called that
   "broadly aligned" without a tolerance; the tolerance has to come from the new
   judge's own run-to-run spread, and the check certifies an aggregate, never an item.
   State the judge identity in the table header of every result.

## Boundaries it must NOT absorb

- **Runtime voice pipelines** (which engine to run, streaming, on-device versus
  cloud) belong to the software-engineering `voice-io` subject. This subject scores a
  finished clip; it never chooses an engine to ship. Write no cross-bundle link.
- **Music and effects acceptance** (loudness, peaks, defect taxonomy, loop seams)
  stay in their sibling subjects. Speech shares the loudness gate in principle;
  say so in one sentence and do not restate it.
- **Judge calibration against human labels** is a separate bundle's job. Technique 6
  states the replay check and stops before any agreement statistic.
- **Interview transcription fidelity** (entity errors versus aggregate error rate) is
  a recruiting subject. Do not import its content; the acceptance question here is
  about synthesized output, not transcribed input.
- **Translation quality measurement** is a localization subject. A recognizer's text
  is being scored here, not a translation.

## Where the instance lives (read-only tree; commit pinned above)

The director cloned it at `C:/t/in-uea-0929` for this run. **That path is a local
scratch location: it never appears in a published file.** Every anchor in an
application is root-relative `path:line "short quote"` and is machine-checked with
`node scripts/check-anchors.mjs <document> --root C:/t/in-uea-0929`. Verified by the
director (re-verify before relying on any):

- `registry/evaluator/seed_tts_eval.yaml:25` "important: the asr model name not 'paraformer-zh'" (recognizer pinned by full hub name; the comment is the incident)
- `registry/evaluator/seed_tts_eval.yaml:6` "- simo" and `registry/evaluator/cv3.yaml:6` "- cv3-speaker-sim" (two similarity models across two benchmarks); `registry/evaluator/simo.yaml:4` "model_name: wavlm_large" versus `registry/evaluator/cv3.yaml:118` "model_name: speech_eres2net_sv_en_voxceleb_16k"
- `audio_evals/evaluator/seed_tts_eval_asr_wer.py:75` "zhconv.convert(transcription" and `:77` `measure_name = "cer" if self.lang in` (script conversion on the hypothesis; unit by language)
- `audio_evals/evaluator/seed_tts_eval_asr_wer.py:22` "truth.replace(x," versus `audio_evals/evaluator/long_tts_eval_asr_wer.py:32` "re.sub(pattern," (delete versus replace with a space); `:25` numerals to words; `:66` "if wer2 < wer1:" (better of two references)
- `audio_evals/eval_task.py:196` "self._release_predictor()" (generator released before the scorers load, two-phase run)
- `replication/qwen3_asr.md:34` "10.8%", `replication/fishaudio-s2-pro.md:23` "online service", `replication/FireRedTTS3.md:26` "1.81" and `:79` "999/1000", `replication/moss-tts-v1.5.md:27` "本文不对根因作推断" (no root cause inferred), `replication/InstructTTSEval.md:45` "we evaluated the official reference audio", `replication/qwen3_tts.md:32` "33.91±13.06" (a 0.6B system's English score with a spread of 13 beside a 1.7B sibling at 3.77±0.19: a dispersion that size is a failure signal, not noise)
- Python witness: `pyproject.toml:10` "requires-python" - use `verified_against: python@3.10` and put the commit in the first paragraph.

## Applications (1-3, not per technique)

Write against this tree, all `stack: python`, all read-only ("Nothing here was
executed"): `python--round-trip-intelligibility.md` (the recognizer-pinning incident
and the ensemble of three instruments), `python--normalize-before-you-compare.md`
(the three normalizers and the script-conversion asymmetry) and, if there is a
distinct third thing to say, `python--published-number-comparability.md`. Do not
write an application that restates another.

## Web budget (primaries, ~6 fetches, spend them on the claims most likely wrong)

The tree is one author's account and needs corroboration for every number that goes
into a technique. In order of value: (1) the multilingual TTS benchmark paper that
reports word error for all 24 languages (checks the metric-redefinition claim in
technique 5); (2) the long-form TTS benchmark paper (checks the standard-versus-hard
gap); (3) the instruction-following TTS benchmark paper (technique 6); (4) the
predicted-MOS estimator papers (what the estimator is and is not calibrated for);
(5) the speaker-verification embedding paper the similarity axis relies on; (6) the
multilingual recognizer paper (floor on natural speech per language). Fold results in
as craft; where a primary contradicts this spec, the primary wins and the report says
so.

## Open questions the drafter decides (do not leave them for a later pass)

- Is `three-axes-beside-intelligibility` one technique or two (identity and quality
  have different remedies)? The spec says one; override with an argument.
- Does a fourth gate belong, as the music sibling has one: **rights and consent for a
  cloned voice** (whose voice, with what permission, disclosed as synthetic)? It is not
  in the tree, so it needs a primary; if you cannot corroborate it, leave it out and
  say so, do not draft it from memory.
- Where does the recognizer-floor control (technique 1) end and `unmeasured-is-not-pass`
  begin? Cite the law rather than restating it.
- Which of the media bundle's laws does each technique genuinely rest on? Zero to
  three per technique, never decorative. Anchors that exist today:
  `unmeasured-is-not-pass`, `output-never-outruns-evidence`, `refusal-is-a-state`,
  `cost-per-usable-output`, `checkability-routes-the-pixel`.

## Worker contract

Read `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`, this
spec, and the neighbours (`generated-music-acceptance`, `sound-effect-generation` and
the golden path of `music-prompt-composition`), in that order. Draft expert-first, then
reconcile. Run `node scripts/check-bundles.mjs` and fix what it reports for this
subject. **Run no git.** Override this spec where the evidence says it is wrong, and
say so in the report with the argument: both workers on 2026-08-22 overrode their
briefs and both were right.


## Execution record (2026-09-29)

Forged in the same session by one worker, reviewed by the director against the diff. Six techniques
and three applications as specified; gate green. **Overrides, all argued and accepted:** the
three-axes technique stays one technique; the rights and consent gate was left out for want of a
primary (the golden path says only that no score here decides permission); the Chinese script
figure is a recognizer evaluated on natural speech (the tree's note), not a synthesis-scoring
case, and the lesson is carried over; two extra law citations. **Director corrections:** the gap
between the benchmark paper's reference row and the repository's row is up to 3.8 points, not
"nearly three", verified against the paper's full text; two files normalized to LF. Source note:
[[2026-09-29-ultraeval-audio]].
