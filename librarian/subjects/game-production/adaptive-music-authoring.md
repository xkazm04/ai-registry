---
domain: game-production
subject: adaptive-music-authoring
last_touched: 2026-09-10
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
