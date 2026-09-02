---
source: github:k2-fsa/sherpa-onnx
kind: repository - vendor repository (an open on-device speech runtime over a fixed inference engine; one C++ core, ~15 language bindings, ~12 platforms, a model zoo of many architectures behind one config surface)
url: https://github.com/k2-fsa/sherpa-onnx
title: "sherpa-onnx - speech-to-text, text-to-speech, speaker diarization, VAD and keyword spotting on device"
author: k2-fsa (Next-gen Kaldi)
commit: 917bed95c8e5c7c18aa4d69fea42e9ef8ef0a60e
words: 2516 landing / ~38,300 in-tree markdown (10,422 in CHANGELOG.md as per-PR lines; the rest is per-binding example READMEs) - the yield came from the C++ headers and validators, not from any markdown
extracted: 15
accepted: 3
declined: 0
leads: 3
already_covered: 4
untriaged: 5
dispatched: 0
applied: 3
shipped: 1
run_id: intake-sherpa-onnx-0902
siblings: 1
rescan_when: "a released CHANGELOG section carries a fix to the VAD long-segment rule or the endpoint rules (they have been stable since the Kaldi port); or a second source states that prompt-biased decoders hallucinate on silence with a measurement (untriaged #11 would then be a technique amendment); or 8 weeks elapse"
---

# sherpa-onnx (vendor repository)

**Class read at Phase 2:** vendor repository. Expected yield: 1-3 landings, from
config-plus-the-code-that-reads-it, not from the README. The declared focus
(sweep per-PR changelog fragments before the operating documents) was applied:
the 10,400-word CHANGELOG was read first. **It produced one landing's trigger
and no landing's content** - the changelog line "Fix Qwen3-ASR hallucinating
text on silent audio with hotwords/language set" named the hazard, and the
implementation (`TrimAudioFeatures` + the `all_silent` short-circuit before
prompt tokens are built) supplied the rule. The rest of the changelog is
packaging. Word cost: ~10,400 read for one pointer.

**Board:** 1 live sibling at Phase 0 (an intake on a self-hosted observability
repo), holding nothing under `voice-io`. No collision.

**Phase 1 focus checks.** Re-scan conditions: one ledger row carries one
(matrix-rust-sdk, one day old) - not fired. Leads in the last ten source notes:
none fired. Said out loud, as the focus asks; the answer was "none", which is a
result.

**Fetches:** 0 of 3 for corroboration. One download of the connected project's
own catalog model for the A/B (an experiment resource, not corroboration).
Corroboration was training-data convergence (the three-rule endpointing design
is the standard toolkit's, the VAD hysteresis/min-duration/max-segment shape is
the detector vendor's own utility, and prompt-hallucination-on-silence is the
best-known failure of prompted attention decoders) plus the tree's own
implementation plus a measurement on a connected project.

## Sweep

Order followed: CHANGELOG (fragments) -> `csrc/*.h` config structs with their
`Validate()` and `Register()` help text (the instrument) -> `scripts/benchmark/`
(the measurement) -> the Qwen3 recognizer impl (the silence guard) -> README
last. Files that produced candidates: `endpoint.h/.cc`,
`silero-vad-model-config.h`, `keyword-spotter.h`, `online-recognizer.h`
(hotwords help text), `offline-recognizer-qwen3-asr-impl.h/.cc`,
`scripts/benchmark/README.md`, `CHANGELOG.md`.

## Candidates

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | Endpointing rules conditioned on decoded content, plus a hard cap | voice-io/stt-pipeline (single threshold) | corrects-claim | real gap | **accepted** - amendment "The silence threshold is not one number" |
| 2 | K | amendment | S | VAD hysteresis, min durations, lower the bar on a long segment | voice-io/stt-pipeline (segmentation) | new-technique | partial | **accepted** - folded into #1's closing paragraph |
| 3 | K | technique | L | Hand the known vocabulary to the decoder, not only the matcher | voice-io/spoken-intent-parsing (matches after) - total empty on the concept | new-technique | real gap | **accepted** - `decode-time-vocabulary-biasing` |
| 4 | K | amendment | S | A prompted decoder hallucinates on silence; gate before the prompt | voice-io/stt-pipeline (three empties) | corrects-claim | real gap | **folded into #3** as its central section; the transcript-boundary half landed as a second stt-pipeline amendment |
| 5 | K | technique | M | Measure word timestamps against forced alignment, not WER | none (map: nothing owns caption timing or word-timestamp accuracy) | new-subject | partial | **lead** - see below |
| 6 | K | technique | L | Speaker diarization as segmentation -> embedding -> clustering | none | new-subject | thin | **lead** |
| 7 | K | amendment | S | Wake detection is a separate small model with per-keyword threshold | voice-io/stt-pipeline ("auto-start is a different product") | none | likely catch | **untriaged** - the corpus states the product boundary; the tree supplies the engineering reason (a KWS model with `keywords_threshold`, `keywords_score`, `num_trailing_blanks` per keyword). Anchor: `keyword-spotter.h` |
| 8 | K | correction | S | Validator range and consumer clamp must share one constant | quality-gates/prose-rule-drift; design-canon "canon-as-single-source-of-thresholds" | none | likely catch | **already covered** - CHANGELOG "Align the silence scale range between Validate() and ScaleSilence" is an instance of a rule two subjects already state |
| 9 | T | script | S | Variance as E[(x-mean)^2], never E[x^2]-mean^2, in float32 | none (no numerics subject) | none | thin | **untriaged** - anchor: CHANGELOG "Fix float32 catastrophic cancellation in variance computation (#3862)"; a real, reusable numerics rule with no home |
| 10 | K | amendment | S | Display must not force transcript casing | voice-io/transcript-normalization | none | likely catch | **already covered** - the reader/reasoner rule owns it |
| 11 | K | amendment | S | An engine rejecting a voice is a per-utterance failure, not a process abort | voice-io/tts-pipeline | none | likely catch | **already covered** - engine failure isolation is stated; anchor: "Do not abort the process when espeak-ng rejects the voice (#3749)" |
| 12 | K | amendment | S | Per-worker model copies scale memory linearly | voice-io/on-device-vs-cloud | none | thin | **untriaged** - anchor: `scripts/benchmark/README.md` "Each worker loads its own model copy" |
| 13 | P | practice | S | Register/Validate/ToString triad on every config struct | none | none | thin | **untriaged** - a self-describing config discipline (CLI flags, validation, printable state from one struct); anchor: every `*-config.h` |
| 14 | K | technique | M | Speech enhancement as a pre-recognition stage | voice-io (map: nothing) | new-technique | thin | **lead** |
| 15 | K | amendment | S | Biasing needs a search that keeps alternatives; greedy cannot be biased | - | - | real gap | **folded into #3** ("score-boost biasing... needs a search that keeps alternatives") |

## Verification notes

- **#1** was the enumeration hunt: the golden path and the technique both
  describe auto-stop as "trailing silence past a threshold" - one number - and
  the tree's `EndpointConfig` carries three rules, two of which differ only in
  whether anything has been decoded. The corpus's one obligation ("generous
  enough to survive thinking pauses") is exactly the rule-2 case and says
  nothing about rule 1 or rule 3. The **cap** turned out to be the sharper half:
  it applies to explicit endpointing too, and the connected tree confirmed it by
  absence (no hold cap, a two-minute engine timeout).
- **#3** was the missing-stage hunt: `spoken-intent-parsing` says "the set of
  valid utterances is small and known - the visible choices" and then matches
  the transcript against it; nothing in the subject asks whether that set could
  reach the engine. The tree implements both mechanisms (context-graph boosting
  under beam search, and prompt tokens for its LLM-style recognizer) and its
  hallucination fix drew the boundary between them. **The connected tree then
  measured the technique's own precondition as unmet** (a small distinct grammar,
  correctly recognized without help) - so the technique's "bias only where a
  confusion is measured" section was written from the seam, which is the
  not-better row doing what it is for.
- **The run's best fact came from arm A of the A/B, not from the source**: the
  connected tree's engine prints a bracketed blank-audio marker on silence with
  exit 0, so its empty-transcript guard had never fired. That is the second
  stt-pipeline amendment and the shipped commit.

## Applied

| Landing | Project | Mode | Verdict |
| --- | --- | --- | --- |
| decode-time-vocabulary-biasing | personas | experiment (`ab-paired`, n=5, the product's engine and catalog model at the product's flags) | not-better - condition: closed grammar of ~10 distinct words already recognized; return when the grammar carries entity names |
| stt-pipeline (no-speech marker in the text channel) | personas | code (`ab-paired` reduction, rustc 1.97.1; crate gate red for an unrelated build-script permission) | better - **shipped** |
| stt-pipeline (the cap applies to explicit endpointing) | personas | simulation (three cases from the tree, one of them measured) | better - filed as the project's next change |

## Leads

- **Word-timestamp accuracy is its own measurement, not WER.** The tree's
  benchmark scores predicted word boundaries against forced alignments and
  reports match rate, median error and the fraction within 20 ms / 50 ms as
  separate numbers from WER. Nothing in the corpus owns caption or
  karaoke-highlight timing. *Return when a managed project renders word-level
  timing (captions, click-to-seek, read-along highlighting) or when a second
  source reports the same protocol.*
- **Diarization as a pipeline** (segmentation model -> speaker embedding ->
  clustering, with the segmentation window shift as the tunable that trades
  boundary precision for cost, and an off-by-one at the window edge as the
  paid-for failure). *Return when a managed project ingests multi-speaker
  audio.*
- **Speech enhancement before recognition** as a stage with its own
  attenuation limit (the tree caps how much a denoiser may remove, because an
  over-aggressive denoiser deletes consonants). *Return when a managed project
  captures in a noisy room or when a second source states the attenuation
  cap.*

## The curator's boundary

The tree's own boundary statement is the list of things one runtime treats as
peers: recognition, synthesis, VAD, keyword spotting, diarization, speaker
identification, enhancement, audio tagging, punctuation. The corpus's
`voice-io` treats the first two as the subject and the rest as engine
capabilities or as "a different product". The gap is diarization and
enhancement, both filed above as leads; keyword spotting stays where the corpus
put it.
