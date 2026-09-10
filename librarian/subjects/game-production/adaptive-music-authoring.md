---
domain: game-production
subject: adaptive-music-authoring
last_touched: 2026-09-09
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
