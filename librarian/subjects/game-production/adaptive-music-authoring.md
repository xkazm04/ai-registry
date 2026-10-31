---
domain: game-production
subject: adaptive-music-authoring
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# adaptive-music-authoring

## Architecture review - 2026-09-09

Reviewed all nine documents. Corrected timing arithmetic and resource accounting,
qualified loop and adaptive-form guarantees, and made mapping and acceptance coverage
explicit. Both applications remain reverify work; no audio or consumer runtime was tested.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/adaptive-music-authoring",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:c02f74b1c0bb20cd",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "At 120 BPM, a 0.05 BPM difference over 120 seconds displaces a corresponding beat by about 50 ms, not one third of a second.",
    "A peaceful traversal can correctly stay in one tier while leaving combat coverage unmeasured.",
    "Equal total file lengths can have different loop origins; differing exit-tail lengths can share one aligned loop region.",
    "A long correlated crossfade can boost rather than dip; fade duration alone does not identify a bad loop.",
    "Two values at opposite ends of the same accepted loudness band need not agree.",
    "Four average 192 kbps streams do not establish peak demand during overlap or decoded resident memory.",
    "A nonrhythmic pad can span a meter change; a required climax cue can be harmed by an unconditional timeout."
  ],
  "sources": [
    {
      "url": "https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html",
      "scope": "Official variable-bitrate and sample-position/trimming contract; no packaged consumer decoder or audio tested."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-quartz-in-unreal-engine",
      "scope": "Official scheduling and 2048-frame/48 kHz latency example; no engine run or profiler capability verified."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "scope": "Official indexed excerpt on elapsed-time virtual-voice return and I/O delay; direct page retrieval returned 403, so full contract remains a verification lead."
    }
  ],
  "documents": {
    "adaptive-music-authoring.md": {
      "disposition": "clarify",
      "reason": "Scope adaptive forms, alignment, timing targets, resource ownership and evidence rather than treating implementation choices as universal laws."
    },
    "techniques/vertical-layering-versus-horizontal-resequencing.md": {
      "disposition": "clarify",
      "reason": "Remove false two-form completeness, mandatory physical playback and quadratic-cost guarantees; require effective transport and phrase alignment."
    },
    "techniques/transition-quantization-and-perceived-latency.md": {
      "disposition": "clarify",
      "reason": "Correct wait accounting and buffer units; replace universal attribution and interruption rules with measured platform and action contracts."
    },
    "techniques/loop-boundary-and-tail-contract.md": {
      "disposition": "clarify",
      "reason": "Define frame endpoints and conversions; qualify crossfade and tail-fold guarantees and codec padding; distinguish non-applicability."
    },
    "techniques/stem-and-voice-budget-derivation.md": {
      "disposition": "clarify",
      "reason": "Derive peak over actual concurrency in runtime units; separate encoded bitrate, decoded memory and burst demand; scope voice priorities."
    },
    "techniques/intensity-mapping-from-declared-game-state.md": {
      "disposition": "clarify",
      "reason": "Replace universal threshold and dwell prescriptions; define stateful replay, override precedence, continuous outputs and scoped coverage."
    },
    "techniques/music-acceptance-beyond-decode-checks.md": {
      "disposition": "clarify",
      "reason": "Correct tempo-slip arithmetic; separate complementary evidence, detector uncertainty, mix combinations, scheduling endpoints and applicability."
    },
    "applications/node--music-acceptance-beyond-decode-checks.md": {
      "disposition": "reverify",
      "reason": "Reverify authored-versus-measured values, missing equality invariant, resource estimates, codec and engine evidence."
    },
    "applications/process--intensity-mapping-from-declared-game-state.md": {
      "disposition": "reverify",
      "reason": "Reverify process thresholds, stateful replay, override conflicts and perceptual claims; preserve source-access limitation."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all nine documents at 44c89965. The 2026-09-09 entry above described documents
that no longer exist in that form; the golden path and six techniques are back at
their pre-pass bytes, while both applications still carry the "Review boundary -
2026-09-09" sections the pass appended, so those are reviewed as current content.

I re-derived the one arithmetic claim the previous entry challenged and it holds
against the document as it now stands. `music-acceptance-beyond-decode-checks.md`
rung 2 still says a 0.05 BPM drift "across a two-minute piece accumulates to roughly
a third of a second of slip". At 120 BPM nominal, 240 beats at 120.05 BPM take
240/120.05x60 = 119.95 s, so the slip is about 50 ms, not ~333 ms. The claim is
wrong by roughly a factor of seven and it is load-bearing: it is the justification
offered for a tight tolerance. The argument survives the correction (50 ms is still
a phase disaster in a layered set), which is why this is `clarify` and not
`deprecate`.

The finding I did not carry forward from the previous entry, and now retract as
stated: it called the two-form taxonomy "false two-form completeness" and asked for
its removal. The taxonomy is sound *within this subject's scope*, which is delivered
audio parts plus an assembly contract. What is genuinely missing is a boundary
sentence: a runtime that synthesises rather than assembles (MIDI/sampler-driven or
algorithmic scoring, where intensity moves note density and orchestration directly)
is neither layering nor resequencing, and none of this subject's rungs, budgets or
loop contracts apply to it. That is a silence, not an error, and I record it as a
counterexample rather than a document change.

The claim I would change on evidence is the phase-lock absolute. Three documents
assert, without qualification, that a stopped layer cannot be restarted in phase,
and the voice budget is derived from that ("a layer held running-but-silent for
phase lock is a voice precisely because nobody can hear it"). Wwise's virtual-voice
system is a direct counterexample to the *cost* half: a virtualised layer is removed
from the physical voice pool and its DSP, and the "Play from elapsed time" behaviour
returns it as if it had never stopped. I could not retrieve Audiokinetic's own page
(direct fetch returned 403 again, as it did on 2026-09-09); a secondary rendering of
the Wwise user guide and a community tutorial both describe the behaviour and add
the detail that matters here - Vorbis sources need a seek table for elapsed-time
return to be accurate. So the honest form of the rule is conditional on the
runtime's virtualisation and seek support, and the derivation should say which term
disappears when that support exists. Pending the vendor page, this stays a
`clarify` with a named verification lead rather than a rewrite.

`loop-boundary-and-tail-contract.md` over-generalises in the same way: "Any
block-based compressed encoding pads. The encoder prepends a delay and appends
enough samples to fill its last block, so the decoded stream is longer than the
source and offset from it." I read the Vorbis I specification directly. It confirms
the priming half - "Data is not returned from the first frame; it must be used to
'prime' the decode engine. The encoder accounts for this priming when calculating
PCM offsets" - but it also establishes that Vorbis supplies no framing of its own
and delegates sample-position accounting to the container. In Ogg the granule
position trims both ends, so a conforming decode reproduces the source sample count
and offset; the padding is present in the codec and *cancelled* by the container.
The document's operative rule ("never carry a loop boundary across a re-encode
without re-measuring it") is right either way, so the fix is to attribute the hazard
to the codec-plus-container pair actually shipped rather than to block coding as
such. I read the specification; I decoded no audio and executed no encoder.

Both applications remain `reverify`. They cite a consumer checkout at commit
`9aa31407` by file and line, and no checkout, rendered stem, profiler run or engine
session was evaluated here. Their `verified_on: 2026-09-02` witnesses are untouched.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/adaptive-music-authoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f5e49d8d949b70ce",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at 44c89965. Arithmetic in the tempo-tolerance, buffer-latency, grid-period and transition-matrix claims re-derived by hand. Two source checks made (Vorbis I specification read; Audiokinetic virtual-voice page unreachable, secondary rendering used). Explicitly NOT evaluated: any consumer checkout, rendered audio, decoder, profiler, engine session, listener test, or the historical incidents the applications cite.",
  "counterexamples": [
    "A 0.05 BPM error over 120 s displaces a beat by ~50 ms, not the ~333 ms rung 2 claims.",
    "A synthesised score - MIDI/sampler-driven or algorithmic, where intensity moves note density and orchestration directly - is neither vertical layering nor horizontal resequencing, and no rung, loop contract or stream budget in this subject applies to it. The subject is silent on the whole form.",
    "Under a virtual-voice system a silent layer costs no physical voice and no DSP while still returning in phase via elapsed-time behaviour, so the peak-voice derivation's phase-lock term is engine-conditional rather than universal.",
    "Ogg Vorbis carries granule positions that trim the codec's own priming at both ends, so a conforming decode reproduces the source sample count; 'any block-based encoding pads the decoded stream longer than the source' is false for that pair.",
    "A stinger that is also the head of a looping bed satisfies 'plays once' and 'must loop' at the same time; the loop technique's when-not-to-use list treats the two classes as disjoint.",
    "A trace covering only peaceful traversal correctly stays in one tier; the coverage guard must not read that scoped pass as a thrash failure."
  ],
  "sources": [
    {
      "url": "https://xiph.org/vorbis/doc/Vorbis_I_spec.html",
      "result": "Established that Vorbis primes its decoder from the first frame and that the encoder accounts for that priming in PCM offsets, and that Vorbis supplies no framing of its own, delegating sample-position and trimming to the container. It did NOT establish anything about a packaged game's decoder, about seeking accuracy, or about any encoder's actual behaviour; nothing was decoded."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "result": "Unreachable: direct retrieval returned HTTP 403, the same failure recorded on 2026-09-09. Establishes nothing first-hand and remains the verification lead for the phase-lock claim."
    },
    {
      "url": "https://gameaudioresource.com/2019/08/27/chapter-16-b-balancing-optimisation/",
      "result": "Secondary. Corroborates that a virtual-voice return behaviour named 'play from elapsed time' exists and continues an object as if it had never stopped, and that Vorbis sources require a seek table for it to behave. It did NOT establish sample-accurate phase return, current Wwise versions' semantics, or vendor wording; no middleware was run."
    }
  ],
  "documents": {
    "adaptive-music-authoring.md": {
      "disposition": "clarify",
      "reason": "States the phase-lock rule and the derived voice cost as universal; both are conditional on the runtime's virtualisation and seek support. Otherwise the golden path is accurate - the 120 BPM grid arithmetic, the ~43 ms buffer figure and the reservation authority all check out."
    },
    "techniques/vertical-layering-versus-horizontal-resequencing.md": {
      "disposition": "clarify",
      "reason": "'A layer that was stopped cannot be restarted in phase' is asserted absolutely and drives the form's whole cost model; qualify it against virtual-voice or seek-capable runtimes. Transition-count arithmetic (5 gives 20, 10 gives 90) and the magnitude-versus-kind rule are sound and stay."
    },
    "techniques/transition-quantization-and-perceived-latency.md": {
      "disposition": "keep",
      "reason": "Re-derived every number: 500 ms beat and 2000 ms bar at 120 BPM, the 4x shortfall against the attribution window, ~43 ms for a 2000-sample buffer at a common rate. All correct, all hedged where they are perceptual. The commit-horizon rule and the cover-the-gap move are the strongest material in the subject."
    },
    "techniques/loop-boundary-and-tail-contract.md": {
      "disposition": "clarify",
      "reason": "'Any block-based compressed encoding pads' so the decode is longer and offset is false for a codec whose container trims it, per the Vorbis I specification. Attribute the hazard to the shipped codec-plus-container pair; the re-measure rule itself is right and stays."
    },
    "techniques/stem-and-voice-budget-derivation.md": {
      "disposition": "clarify",
      "reason": "The peak formula's second term ('layers held running-but-silent for phase lock') is stated as an unconditional voice cost. Under virtualisation that term is not a physical voice. Name the condition; the reservation authority, the yield ordering and the bandwidth-binds-first observation are sound."
    },
    "techniques/intensity-mapping-from-declared-game-state.md": {
      "disposition": "keep",
      "reason": "Hysteresis, dwell floor, dwell ceiling and the coverage guard are internally consistent and correctly hedged ('on the order of', 'roughly'). The tuning figures are offered as ranges, not laws. No claim here failed a check."
    },
    "techniques/music-acceptance-beyond-decode-checks.md": {
      "disposition": "clarify",
      "reason": "Rung 2's tempo-slip arithmetic is wrong by roughly 7x: 0.05 BPM over two minutes is ~50 ms, not ~a third of a second. Correct the figure; the tolerance argument survives it. The rung structure and the deferred-not-passed discipline stay."
    },
    "applications/node--music-acceptance-beyond-decode-checks.md": {
      "disposition": "reverify",
      "reason": "Every file, line and incident citation is against consumer commit 9aa31407, which was not checked out. No rendered stem, packaged asset, profiler or engine run was evaluated, and the pipeline's own upper rungs are self-declared deferred."
    },
    "applications/process--intensity-mapping-from-declared-game-state.md": {
      "disposition": "reverify",
      "reason": "Describes a proposed method with no recorded trace-test result. The 15% hysteresis, phrase-length dwell and one-change-per-eight-bars figures are example tunings, not measured acceptance limits, and the Wwise lead behind its phase claim is still unretrieved."
    }
  }
}
```

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. The nine documents the 2026-09-10 record covered are
byte-unchanged, so its four clarify items were still owed. Three applications have been
added since. The phase-lock qualification no longer waits on Audiokinetic: FMOD's own
manual documents virtual channels whose position keeps ticking and which resume in place.
That confirms the voice half of the claim is runtime-conditional. It does not show
sample-accurate return, so the qualification keeps return accuracy as a measurement. The
2026-09-10 record called the 43 ms buffer figure correct. Quartz gives 43 ms for 2048
samples at 48 kHz, not for 'two thousand at a common rate', so that is now a precision
clarify. The new loop application's measurement scopes the loop technique's
ten-millisecond rule.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/adaptive-music-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:fccf430fd4de0e8d",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full. The nine carried from the 2026-09-10 record were checked by diff against 44c89965 (byte-unchanged) and re-read; the three applications added since were read in full. Primary sources opened this run: the FMOD 2.03 manual, the Unreal Quartz overview, the Vorbis I specification; Audiokinetic still 403. Arithmetic recomputed. Not evaluated: any consumer tree, rendered audio, decoder, engine, profiler or listener. No verification date refreshed.",
  "counterexamples": [
    "A 0.05 BPM error over 120 s at 120 BPM displaces a beat by ~50 ms, not ~333 ms (retained until applied).",
    "A synthesised score (MIDI/sampler-driven or algorithmic) is neither vertical layering nor horizontal resequencing, and no rung, loop contract or stream budget here applies to it (retained from 2026-09-10; a silence, not an error).",
    "Under FMOD's virtual voice system a silent layer gives up its real voice and CPU while its position keeps ticking, so the peak-voice formula's phase-lock term is runtime-conditional; the stream half of the cost is not shown to disappear.",
    "Ogg Vorbis trims priming and the final partial block through granule positions, so 'any block-based encoding pads the decode longer than the source' is false for that pair.",
    "An overlap-add loop with an 80-250 ms quarter-sine crossfade showed no seam notch or dip over three cycles (node loop application), so fade length alone does not mark a concealing fade.",
    "A stinger that is also the head of a looping bed is both 'plays once' and 'must loop'; the loop technique's exclusions treat the classes as disjoint (retained)."
  ],
  "sources": [
    {
      "url": "https://d1s9dnlmdewoh1.cloudfront.net/2.03/api/managing-resources-in-the-core-api.html",
      "result": "FMOD Engine 2.03 user manual, read 2026-10-31. Virtual channels are 'emulated with a simple position and audibility update, and so are not heard and don't consume CPU time'; 'When going virtual, the sound's time will still be ticked ... When the Channel becomes real again, it will resume as if it had been playing properly'; 'When channels stop being virtual, they resume from their proper place, part-way through the sound.' Virtual channels still count against the maxchannels (virtual) limit. Primary vendor confirmation that a silent layer need not hold a real voice; it does NOT establish sample-accurate phase on return, stream I/O behaviour while virtual, or Wwise semantics."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "result": "HTTP 403 again on 2026-10-31 (third run). A second Audiokinetic help URL also returned 403. Wwise wording remains unread first-hand; the FMOD manual above now carries the qualification instead."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-quartz-in-unreal-engine",
      "result": "Read 2026-10-31: 'If that buffer contains 2048 samples rendered at 48k samples per second (kHz) ... the buffer results in an audible latency of up to 43 milliseconds (ms)', and 'commands issued from the game thread take time to get to the audio engine' (worst case 56 ms with 13 ms threading latency). Supports the 43 ms figure only for 2048 samples at 48 kHz; 2000 samples is 41.7 ms at 48 kHz and 45.4 ms at 44.1 kHz."
    },
    {
      "url": "https://xiph.org/vorbis/doc/Vorbis_I_spec.html",
      "result": "Re-read 2026-10-31. 'Data is not returned from the first frame; it must be used to prime the decode engine. The encoder accounts for this priming when calculating PCM offsets'; and in the Ogg encapsulation, 'A granule position on the final page in a stream that indicates less audio data than the final packet would normally return is used to end the stream on other than even frame boundaries. The difference ... indicates how many trailing samples to discard.' So Ogg Vorbis trims both ends; nothing was decoded."
    },
    {
      "source": "Arithmetic",
      "result": "0.05 BPM at 120 BPM over 120 s: 240 beats at 120.05 BPM take 119.950 s, slip about 50 ms (rung 2 said about 333 ms). 96 BPM bar = 2500 ms, 5x the 500 ms window; 0.5-bar crossfade 1.25 s, real response 1.25-3.75 s. Stem application: 12 + 2 + 3 = 17. All recomputed."
    }
  ],
  "documents": {
    "adaptive-music-authoring.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10 and still present: the layering cost and the budget paragraph state that a stopped layer cannot be restarted in phase and that a silent layer is always a voice. FMOD's manual documents virtual channels that keep ticking and resume in place, so the voice half is runtime-conditional. Also 'a two-thousand-sample buffer at a common playback rate is around 43 ms' should be the Quartz figure, 2048 samples at 48 kHz."
    },
    "techniques/vertical-layering-versus-horizontal-resequencing.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: 'a layer that was stopped cannot be restarted in phase' and 'a voice and a stream per layer ... including the silent ones' are absolute; qualify for runtimes that virtualise silent channels, keeping phase accuracy on return as something to measure. Transition-count arithmetic (5 gives 20, 10 gives 90) and the magnitude-versus-kind rule hold."
    },
    "techniques/transition-quantization-and-perceived-latency.md": {
      "disposition": "clarify",
      "reason": "Every other number re-derived and correct. One precision fix: 'a two-thousand-sample buffer at a common playback rate is about 43 ms' - 43 ms is 2048 samples at 48 kHz per the Quartz page; 2000 samples gives 41.7 or 45.4 ms. The commit-horizon and cover-the-gap rules stay."
    },
    "techniques/loop-boundary-and-tail-contract.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: 'Any block-based compressed encoding pads ... the decoded stream is longer than the source' is false for Ogg Vorbis, whose granule positions trim both ends; attribute the hazard to the shipped codec-container-decoder. New: the node loop application measured an 80-250 ms overlap-add fold with no notch or dip, so scope the ten-millisecond ceiling to fades that hide a join. The re-measure rule stays."
    },
    "techniques/stem-and-voice-budget-derivation.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the peak formula's phase-lock term and 'a muted layer is still a voice' are unconditional; under virtualisation that term moves to the virtual count. Name the counting model. The reservation authority, yield order and bandwidth-binds-first observation hold."
    },
    "techniques/intensity-mapping-from-declared-game-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep. Hysteresis, dwell floor and ceiling, and the coverage guard are consistent and hedged as ranges."
    },
    "techniques/music-acceptance-beyond-decode-checks.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: rung 2's tempo-slip figure is wrong by about 7x (recomputed: ~50 ms, not a third of a second). The tolerance argument survives."
    },
    "applications/node--music-acceptance-beyond-decode-checks.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Citations against consumer commit 9aa31407 not reopened; no audio, packaged asset or engine run."
    },
    "applications/process--intensity-mapping-from-declared-game-state.md": {
      "disposition": "reverify",
      "reason": "Unchanged. A proposed method with no recorded trace result; its Wwise link is still unreadable first-hand."
    },
    "applications/node--loop-boundary-and-tail-contract.md": {
      "disposition": "reverify",
      "reason": "New since the last record; read in full. Internally consistent (quarter-sine fold summed at unity, three-cycle seam and RMS reads, honest unmeasurable verdict for the engine re-import). Its finding feeds the loop technique's clarify. The private VR tree and its audio were not reopened."
    },
    "applications/node--stem-and-voice-budget-derivation.md": {
      "disposition": "reverify",
      "reason": "New; read in full. 12 + 2 + 3 = 17 recomputed; the subtotal-not-total finding is sound and the verdict is honestly unmeasurable. Private tree not reopened."
    },
    "applications/node--transition-quantization-and-perceived-latency.md": {
      "disposition": "reverify",
      "reason": "New; read in full. Bar wait, crossfade range and the 2048-sample/48 kHz/43 ms horizon all recomputed and consistent with the Quartz page. The paired test counts (3 of 3 to 0 of 3; 946 files, 8289 tests) come from a private tree that was not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the six clarify items above in each document's own voice. The second record is
against the edited bytes. No application or verification date was touched.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/adaptive-music-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:23d6767be7d10378",
  "disposition": "reverify",
  "coverage": "All 12 documents decided. The six clarify items (five owed since 2026-09-10, one new) were applied and the edited passages re-read against the sources quoted. Applications untouched; they keep reverify, which is now the overall disposition. No verification date refreshed.",
  "counterexamples": [
    "A 0.05 BPM error over 120 s at 120 BPM displaces a beat by ~50 ms, not ~333 ms (retained until applied).",
    "A synthesised score (MIDI/sampler-driven or algorithmic) is neither vertical layering nor horizontal resequencing, and no rung, loop contract or stream budget here applies to it (retained from 2026-09-10; a silence, not an error).",
    "Under FMOD's virtual voice system a silent layer gives up its real voice and CPU while its position keeps ticking, so the peak-voice formula's phase-lock term is runtime-conditional; the stream half of the cost is not shown to disappear.",
    "Ogg Vorbis trims priming and the final partial block through granule positions, so 'any block-based encoding pads the decode longer than the source' is false for that pair.",
    "An overlap-add loop with an 80-250 ms quarter-sine crossfade showed no seam notch or dip over three cycles (node loop application), so fade length alone does not mark a concealing fade.",
    "A stinger that is also the head of a looping bed is both 'plays once' and 'must loop'; the loop technique's exclusions treat the classes as disjoint (retained)."
  ],
  "sources": [
    {
      "url": "https://d1s9dnlmdewoh1.cloudfront.net/2.03/api/managing-resources-in-the-core-api.html",
      "result": "FMOD Engine 2.03 user manual, read 2026-10-31. Virtual channels are 'emulated with a simple position and audibility update, and so are not heard and don't consume CPU time'; 'When going virtual, the sound's time will still be ticked ... When the Channel becomes real again, it will resume as if it had been playing properly'; 'When channels stop being virtual, they resume from their proper place, part-way through the sound.' Virtual channels still count against the maxchannels (virtual) limit. Primary vendor confirmation that a silent layer need not hold a real voice; it does NOT establish sample-accurate phase on return, stream I/O behaviour while virtual, or Wwise semantics."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "result": "HTTP 403 again on 2026-10-31 (third run). A second Audiokinetic help URL also returned 403. Wwise wording remains unread first-hand; the FMOD manual above now carries the qualification instead."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-quartz-in-unreal-engine",
      "result": "Read 2026-10-31: 'If that buffer contains 2048 samples rendered at 48k samples per second (kHz) ... the buffer results in an audible latency of up to 43 milliseconds (ms)', and 'commands issued from the game thread take time to get to the audio engine' (worst case 56 ms with 13 ms threading latency). Supports the 43 ms figure only for 2048 samples at 48 kHz; 2000 samples is 41.7 ms at 48 kHz and 45.4 ms at 44.1 kHz."
    },
    {
      "url": "https://xiph.org/vorbis/doc/Vorbis_I_spec.html",
      "result": "Re-read 2026-10-31. 'Data is not returned from the first frame; it must be used to prime the decode engine. The encoder accounts for this priming when calculating PCM offsets'; and in the Ogg encapsulation, 'A granule position on the final page in a stream that indicates less audio data than the final packet would normally return is used to end the stream on other than even frame boundaries. The difference ... indicates how many trailing samples to discard.' So Ogg Vorbis trims both ends; nothing was decoded."
    },
    {
      "source": "Arithmetic",
      "result": "0.05 BPM at 120 BPM over 120 s: 240 beats at 120.05 BPM take 119.950 s, slip about 50 ms (rung 2 said about 333 ms). 96 BPM bar = 2500 ms, 5x the 500 ms window; 0.5-bar crossfade 1.25 s, real response 1.25-3.75 s. Stem application: 12 + 2 + 3 = 17. All recomputed."
    }
  ],
  "documents": {
    "adaptive-music-authoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the layering-cost sentence now notes that a runtime which virtualises a silent channel and keeps its position changes the voice half of the cost, not the stream half, with return accuracy the runtime's to prove; the budget paragraph says a virtualised silent layer holds a virtual slot and that support is stated in the reservation; the buffer example now reads 2048 samples at 48 kHz."
    },
    "techniques/vertical-layering-versus-horizontal-resequencing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the virtualisation exception after 'muted means gain at silence', with phase accuracy on return (especially from a seeking compressed stream) to be measured; the cost line notes a virtual slot in place of a real voice for silent layers."
    },
    "techniques/transition-quantization-and-perceived-latency.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the buffer example now reads 'a 2048-sample buffer at 48 kHz is about 43 ms'."
    },
    "techniques/loop-boundary-and-tail-contract.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the compressed-encoding paragraph now says padding persists unless the container trims it, notes that a container whose per-page sample positions account for priming and the final partial block reproduces the source length (the Vorbis-in-Ogg case, left unnamed in the technique layer), and attributes the hazard to the shipped codec-container-decoder; the ten-millisecond rule now says it is about a fade that hides a join, not an overlap-add fold that carries the decay into the head, which is judged by measuring the seam over cycles."
    },
    "techniques/stem-and-voice-budget-derivation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the formula's phase-lock term is marked '(unless virtualised)' and the prose says the term moves to the virtual count on such runtimes, so the derivation names its counting model and whether the virtual return was measured in phase."
    },
    "techniques/intensity-mapping-from-declared-game-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep. Hysteresis, dwell floor and ceiling, and the coverage guard are consistent and hedged as ranges."
    },
    "techniques/music-acceptance-beyond-decode-checks.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: rung 2 now says, at 120 BPM, roughly fifty milliseconds of slip, a tenth of a beat and an audible flam between layers."
    },
    "applications/node--music-acceptance-beyond-decode-checks.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Citations against consumer commit 9aa31407 not reopened; no audio, packaged asset or engine run."
    },
    "applications/process--intensity-mapping-from-declared-game-state.md": {
      "disposition": "reverify",
      "reason": "Unchanged. A proposed method with no recorded trace result; its Wwise link is still unreadable first-hand."
    },
    "applications/node--loop-boundary-and-tail-contract.md": {
      "disposition": "reverify",
      "reason": "New since the last record; read in full. Internally consistent (quarter-sine fold summed at unity, three-cycle seam and RMS reads, honest unmeasurable verdict for the engine re-import). Its finding feeds the loop technique's clarify. The private VR tree and its audio were not reopened."
    },
    "applications/node--stem-and-voice-budget-derivation.md": {
      "disposition": "reverify",
      "reason": "New; read in full. 12 + 2 + 3 = 17 recomputed; the subtotal-not-total finding is sound and the verdict is honestly unmeasurable. Private tree not reopened."
    },
    "applications/node--transition-quantization-and-perceived-latency.md": {
      "disposition": "reverify",
      "reason": "New; read in full. Bar wait, crossfade range and the 2048-sample/48 kHz/43 ms horizon all recomputed and consistent with the Quartz page. The paired test counts (3 of 3 to 0 of 3; 946 files, 8289 tests) come from a private tree that was not re-run."
    }
  }
}
```
