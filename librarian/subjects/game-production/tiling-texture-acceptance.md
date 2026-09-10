---
domain: game-production
subject: tiling-texture-acceptance
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# tiling-texture-acceptance

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/tiling-texture-acceptance",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a5bcec8231b9e614",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A periodic alternating black/white strip of even width has opposite-valued first and last texels; the wrap difference matches every interior transition rather than introducing a seam.",
    "Identical black outer rows around a bright interior give zero edge mismatch while creating an obvious repeated border.",
    "A flat painted checkerboard yields a non-flat luminance-derived normal map although its true geometric normal is constant."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/surface-and-imagery/tiling-texture-acceptance",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "tiling-texture-acceptance.md": {
      "disposition": "reverify",
      "reason": "Edge equality is neither necessary nor sufficient for visually seamless periodic sampling. Reverify the uncited one-in-four failure rate and millisecond/cost claims; even rare defects may justify cheap automation. Luminance height is a heuristic, generated base color is not a physical measurement, and normal maps have more than two acquisition methods. Visual repetition and material plausibility still need inspection."
    },
    "techniques/biome-themed-tile-prompting.md": {
      "disposition": "reverify",
      "reason": "The claimed training-distribution cause and universal noun-first remedy are hypotheses without a controlled corpus. Model changes can matter, conditioning need not prevent collapse, and an approved fallback can be normal. A request-to-property vocabulary describes intended material rather than measuring generated pixels; preserve unknown/error provenance separately."
    },
    "techniques/derive-only-what-the-source-encodes.md": {
      "disposition": "clarify",
      "reason": "Repaired faithful-normal versus heuristic-roughness inconsistency. Uses provenance per artifact and source, distinguishes authored values from measured values, allows explicitly authorized constants and estimates, and scopes non-identifiability instead of an unconditional metalness ban."
    },
    "techniques/luminance-heightfield-normal-derivation.md": {
      "disposition": "reverify",
      "reason": "Brightness-to-height is a heuristic even with a deterministic Sobel operator. State linearization, texel spacing, derivative normalization and physical height scale. Edge clamping does not invariably produce a flat one-pixel border; flipping only the green channel does not generally invert every bump. Export cost is nonzero and derived height needs its own intended-use acceptance."
    },
    "techniques/seam-threshold-calibration.md": {
      "disposition": "reverify",
      "reason": "Calibration needs held-out evaluation, uncertainty, label protocol and actual failure costs. A few dozen labels do not establish a universal base rate or 100x loss asymmetry; re-rolls can be expensive and dependent. Human labels can disagree, advisory checks still have costs, and centralized versioned policies may accept scoped per-call selection."
    },
    "techniques/texel-density-and-uv-tiling.md": {
      "disposition": "reverify",
      "reason": "Repeat count formula assumes a defined UV span and mapping along that axis. Preserve physical feature scale as well as texel density; unique-map resolution budgeting does not transfer directly to reusable tiling textures. Higher repeats can serve arbitrarily large surfaces; twofold mismatch and a handful of repeats are uncalibrated heuristics, not universal failures."
    },
    "techniques/wrap-around-edge-diff.md": {
      "disposition": "clarify",
      "reason": "Repaired edge-difference-as-proof and unconditional max-score failure. Defines boundary adjacency, internal comparison, alpha/color/channel semantics, calibrated statistics and actual repeated rendering; raw scores remain useful diagnostics without certifying seamlessness."
    },
    "applications/node--derive-only-what-the-source-encodes.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF excerpts and verification date were not rerun. Sobel faithfully differentiates the invented height field, not the physical surface. Modulo wrapping is locally sound for positive dimensions; channel decoding, sign, physical strength and provenance still need validation. Metalness may be authored from an independently known material contract."
    },
    "applications/node--wrap-around-edge-diff.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations and verification date were not rerun. removeAlpha discards coverage rather than resolving compositing; /255 needs decoded bit-depth assurance. Null is distinct in this function but no shown caller proves fail-closed admission. Header base rate is not a supplied corpus, and mean/max edge differences are diagnostics, not seamlessness proof."
    },
    "applications/process--biome-themed-tile-prompting.md": {
      "disposition": "reverify",
      "reason": "Historical process locations and verification date were not rerun. Displayed library fallback and prompt vocabulary do not establish unknown-class handling or causal model improvement. A 3D topology suffix is not necessarily appropriate to 2D texture generation; shared request keywords do not verify delivered material properties."
    }
  }
}
```
