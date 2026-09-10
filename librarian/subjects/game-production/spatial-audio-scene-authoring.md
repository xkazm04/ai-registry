---
domain: game-production
subject: spatial-audio-scene-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# spatial-audio-scene-authoring

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/spatial-audio-scene-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:8a9e12b2c7d4f4e1",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 1 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Dialogue may require both an admitted voice and reduced competing music; choosing only one leaves either starvation or masking unresolved.",
    "An outer radius of 20 units and max(0.3*radius,50) gives inner radius 50, reversing the intended distance band.",
    "A required trap telegraph omitted with probability one half is absent on half the sampled triggers, regardless of whether ambience feels less repetitive."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/motion-and-audio/spatial-audio-scene-authoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.audiokinetic.com/en/library/edge/?id=concept_virtualvoices.html&source=SDK",
      "scope": "Official search excerpt distinguishes physical/virtual voice selection by threshold and playback limits; no engine run."
    },
    {
      "url": "https://www.audiokinetic.com/ja/library/edge/?id=defining_properties_of_bus&source=Help",
      "scope": "Official search excerpt describes ducking as reducing competing bus levels; used to distinguish mixing from voice admission."
    }
  ],
  "documents": {
    "spatial-audio-scene-authoring.md": {
      "disposition": "reverify",
      "reason": "Room-derived defaults and explicit missing assets are useful. Reverify unreferenced loudness recommendations, fixed hearing/voice limits, outdoor reverb and one-to-one acoustic parameter claims. Reservation and ducking address different failures and can coexist; geometry, material and mix context defeat universal room-type prescriptions."
    },
    "techniques/attenuation-falloff-and-distance-filtering.md": {
      "disposition": "reverify",
      "reason": "A positive radius fraction already gives a full-level core: absence of a floor does not eliminate it. Clamp a minimum inner radius against the outer boundary, distinguish falloff width from absolute outer distance, and validate units. Logarithmic, 30 percent and 2 kHz are authoring examples, not universal acoustic endpoints; level and spectrum alone cannot uniquely recover distance."
    },
    "techniques/event-priority-concurrency-cooldown.md": {
      "disposition": "clarify",
      "reason": "Repaired the exclusive ducking-or-reservation rule, unspecified concurrency scope and unbounded critical priority. Distinguishes voice admission, masking, virtualization and measured hardware cost; numeric presets remain project decisions."
    },
    "techniques/occlusion-to-volume-and-filter.md": {
      "disposition": "reverify",
      "reason": "The direct/wet distinction is a useful approximation, not a universal physical model. Reverify material-frequency behavior, sub-bass exemption and the claim nobody notices distant approximations. A 20 kHz filter is not necessarily bypass or valid below the sample-rate limit; hysteresis and temporal debounce differ."
    },
    "techniques/reverb-parameter-tables.md": {
      "disposition": "reverify",
      "reason": "Preset values require implementation ranges and listening evidence. Decay depends on absorption as well as size; early delay depends on source/listener path geometry, not just nearest wall. Outdoor dry treatment and convolution with authored impulse responses are valid; all-zero decay may be invalid rather than bypass, and arbitrary mid-scale custom is not neutral."
    },
    "techniques/room-type-to-acoustic-profile.md": {
      "disposition": "reverify",
      "reason": "Room function does not establish enclosure, wall transmission or narrative importance. State modifier precedence and stable override identity; occlusion step addition contradicts the all-multiplicative instruction. Randomly omitting a required trap warning changes gameplay and needs a cue contract, not an unconditional probability below one."
    },
    "techniques/two-d-vs-three-d-spatialization-choice.md": {
      "disposition": "reverify",
      "reason": "The single bit contradicts the proposed positionless footsteps with world reverb. Position, attenuation, filtering, reverb sends and bus routing are related but independently authorable; diegetic music can use a music bus with spatial routing. Head-relative sources can retain directional cues, and 2D games can use spatial sound."
    },
    "applications/node--room-type-to-acoustic-profile.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations, generated engine identifiers, provider incident and verification date were not rerun. The 0-8 room scale and 0-3 event scale are not shown reconciled; max(radius*0.3,50) can exceed a tiny outer radius. Source-table repetition is not listening validation or API compilation evidence; placeholder comments alone do not prevent shipping."
    },
    "applications/process--event-priority-concurrency-cooldown.md": {
      "disposition": "reverify",
      "reason": "Historical process catalog and verification date were not rerun. The displayed table has three UI and six world rows, not four and seven. Seed values do not independently validate technique values copied from them; missing measured load is correctly disclosed. Ducking cannot replace admission protection and reservations are not the only possible priority policy."
    }
  }
}
```
