---
kind: harvest-specs
created: 2026-08-28
updated: 2026-08-28
---

# Spec bank - approved content awaiting an attended landing

Clusters the operator APPROVED but deferred ("recommended cut now, rest as
specs"). Each entry carries enough anchor detail to land without re-mining.
Strike an entry when it lands; the landing session re-verifies prior art at
body level first.

## 1. Simulation boundary fixes (game-production) - from GAME-011, 2026-08-28

- `goal-seek-on-a-seeded-monotonic-lever` (encounter-balance-simulation):
  add the MONOTONICITY PRECONDITION - when the balance lever is
  non-monotonic spatial edits (tile swaps), goal-seek does not apply; the
  measured alternative ranking is learned swap policy 68.0% of 1000 levels
  balanced to target (88.9% improved) > swap hill-climb 59.6% > replace
  hill-climb 14.3%; distribution-preserving swaps kept 0% unplayable vs
  38.8-83.1% for replace-style edits (arXiv 2503.18748v1, Tables I-III).
- `monte-carlo-scenario-presets`: estimator-convergence sim-count sizing -
  accept n when mean+sd of the outcome estimate < threshold (paper used
  0.05, hit at n>=14 with deterministic agents; the procedure ports, the
  number does not).
- Caveat to carry: the paper's players are SCRIPTED (RL is in the editing
  loop); it confirms, not challenges, the scripted-agents assumption. No
  human-perception validation anywhere.

## 2. Retirement-as-content (game-production) - from GAME-005, 2026-08-28

- Amend `orphaned-artifact-visibility` (content-drift-and-revision): from
  detection to EXECUTABLE RETIREMENT - removal/rename shipped as declarative
  migration entries (old id -> replacement, or explicit null-target for
  errorless deletion, with payload fixups); the criterion for whether
  migration is required is the PERSISTENCE SURFACE (is the id written into
  user save state), not the content type; per-type universal fallback
  entities as the alternative; migrations live in version-stamped folders
  and are themselves deleted after the next stable (retirement machinery has
  a lifecycle). Mod-level removal carries a user-facing reason string
  (cross-domain corroboration of never-fail-silently-reason-strings, already
  caught).

## 3. Music family amendments (media-generation) - from MED-009, 2026-08-28

- `reference-track-anchoring` (music-prompt-composition): melody-anchor-
  carries-contour-only - chromagram conditioning preserves pitch-class
  contour, discards timbre/rhythm/voicing; vendor-measured adherence 0.44
  chroma cosine on released models - a loose harmonic guide, never a
  soundalike path.
- `generated-audio-defect-taxonomy` (generated-music-acceptance): add
  silence-collapse ("generates end of songs, collapsing to silence"),
  vendor-attested.
- `loudness-and-peak-acceptance`: 32 kHz output (below 44.1k delivery
  standard - resample on export), mono base/stereo fine-tunes, reference
  writer normalizes -14 LUFS with loudness compression.
- `rights-and-provenance-record`: the clean-provenance-vs-license split -
  fully licensed training data does NOT clear outputs when weights are
  CC-BY-NC; provenance and license are separate rows in the record.
- Currency (record only): this family accepts text + optional chromagram
  melody ONLY - no BPM/bar/section inputs; tempo and structure survive only
  as prose; long-form is chained continuation. Sibling model (JASCO) takes
  time-stamped chords/drums/melody at a 10s window - lead for a second
  stack on temporal briefing.
