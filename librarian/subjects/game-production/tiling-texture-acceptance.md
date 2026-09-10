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

## 2026-09-10 — architecture re-review after the compression revert

Read the golden path, all six techniques and all three applications at their reverted
bytes, then went to the primary source: the pof checkout at HEAD `d823bffe`, where I read
`visual-gen/seam-check.ts` and confirmed the presence of `texture-maps.ts`. I read that
source; I decoded no image, ran no seam check, derived no channel and looked at no tiled
result.

**The subject's core is right and cheap to defend.** The framing move — a tiling texture
has a property no other generated image has, and that property is arithmetic rather than
taste — is what earns the whole subject, and the cost ratio it turns on (milliseconds to
check, a full import/build/look cycle to discover) is correct on its face. The material
table with four rows and four honest labels (measured / derived / heuristic / refused) is
the most transplantable thing here and generalises far past texturing: it is the rule for
any process that expands one artifact into several. The observation that a naive derivation
destroys the property the acceptance check just cleared — because every neighbourhood
operator has to decide what lies past the edge, and clamping is the library default — is the
kind of finding that only comes from having been bitten, and the requirement to re-run the
seam measure on the derived channels rather than only the source follows from it correctly.

**Finding one, and it is the load-bearing one: the base rate has no measurement behind it.**
The golden path stakes the whole argument on it explicitly — "**The base rate is the
argument.** Measure it on a real corpus rather than asserting it: across a body of generated
tiling outputs from current image models with tiling requested in the prompt, roughly one in
four comes back with a visible seam. That figure — not the elegance of the method — is what
justifies the check." `seam-threshold-calibration` repeats it as step five ("Measured on
current general image models asked for tiling output, roughly one in four comes back
seamed"). I traced it to its only witness. It is a sentence in the docstring at the top of
`seam-check.ts`: "AI 'tiling:true' outputs (Leonardo) and 'seamless PBR' tiles (Scenario)
are best-effort: roughly 1 in 4 has a visible seam". There is no corpus, no population size,
no labelling procedure and no date anywhere behind it — and the application that cites the
same file says so itself two sections later, recording as a deviation that "the threshold is
asserted, not calibrated. There is no labelled corpus, no catch rate and no false-flag
rate." The same absence that condemns the threshold condemns the base rate, and the subject
notices it for one and not the other. This is the corpus asserting a measurement while
instructing its reader not to, which is a sharper defect than a wrong number would be. The
repair is small: state it as an operator's field estimate from two named providers, or
measure it.

**Finding two: a deviation the application should have caught.**
`seam-threshold-calibration` ends with "Never let the threshold be a per-call parameter a
caller can pass. Then every caller has its own cutoff, the quantity has as many authorities
as there are call sites, and the calibration means nothing." The consumer does exactly that:
`SeamCheckOptions` declares `threshold?: number` — "Normalized 0..1 mean-delta threshold
above which an axis is flagged. Default 0.08" — so any call site may substitute its own
cutoff. `node--wrap-around-edge-diff.md` lists three deviations and this is not among them,
even though it is the one that would void the calibration the document's other deviation
asks for. The three it does record are all still accurate at HEAD: the result carries a mean
delta per axis and no maximum, the `0.08` default is defended in a comment rather than by a
corpus, and only the source is checked while `texture-maps.ts` output is not re-run through
`detectSeams`.

**What the technique gets right that the consumer does not.** `wrap-around-edge-diff`
requires both a mean and a maximum, with the reasoning stated — mean catches gradual tonal
mismatch, max catches a short hard discontinuity that barely moves a mean over a
thousand-pixel edge, and the eye is a discontinuity detector rather than an averager. The
consumer reports the mean only. The standard is not lowered and should not be; this is the
gap the application correctly names first.

**Where the subject is properly humble.** Three documents end by naming what passing does
not prove: a clean edge score says nothing about whether the tile reads as repetitive at
four repeats; a correctly-signed seamless derived normal says nothing about how the surface
looks under shipping light; and `texel-density-and-uv-tiling` hands the density target, the
achieved density and the labelled channel set downstream rather than deciding sampler
budgets or shading models. That last handoff is the cleanest seam in the bundle.

**Not evaluated.** No image was decoded or scored, no threshold was calibrated against a
labelled corpus, no normal map was derived or inspected under light, no texel density was
measured on an environment, and no biome vocabulary was A/B-generated. The one-in-four rate
is recorded here as unresolved, not as refuted — I established where the number comes from
and that no corpus stands behind it, not that it is wrong.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/tiling-texture-acceptance",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:9784bddd6401f00f",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at their reverted bytes. The base-rate and threshold claims were traced to their primary source by reading src/lib/visual-gen/seam-check.ts in the pof checkout at HEAD d823bffe. Not evaluated: no image decoded or scored, no seam check executed, no threshold calibrated against a labelled corpus, no channel derived, no derived map inspected under light, no texel density measured on an environment, and no biome vocabulary generated with and without its words.",
  "counterexamples": [
    "A strongly-featured tile with a bright asymmetric element scores a perfect edge delta and produces obvious grid repetition at four repeats; wrap-around-edge-diff names this and routes it to a perceptual rung, so it is a declared silence rather than a gap.",
    "A source that mixes pigment and relief — painted markings on a rough concrete slab — derives correctly in the relief regions and embosses the paint, and the technique is explicit that no parameter setting fixes it because the information was never in the image.",
    "A texture whose seam check cannot run because the bytes will not decode must render as not-checkable, and the consumer's detectSeamsSafe returning null is the third value that keeps it distinguishable from clean; a pipeline that mapped that null to false would reproduce exactly the failure the technique exists to prevent."
  ],
  "sources": [
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/visual-gen/seam-check.ts", "result": "Read at pof HEAD d823bffe. Established that the 'roughly 1 in 4' base rate exists only as a sentence in the file's docstring, attributed to two named providers, with no corpus, population, labelling procedure or date behind it — so the subject's presentation of it as a measurement is unsupported. Also established that SeamCheckOptions exposes `threshold?: number` per call, which the calibration technique forbids and which the application's deviation list omits, and confirmed the three deviations the application does record (mean without max, asserted 0.08 default, source-only checking). Did not run the check or score any image."}
  ],
  "documents": {
    "tiling-texture-acceptance.md": {"disposition": "clarify", "reason": "Everything holds except the sentence the subject rests its case on. 'The base rate is the argument. Measure it on a real corpus rather than asserting it ... roughly one in four' asserts the figure it forbids asserting: its only witness is a provider-specific docstring in the consumer with no corpus, no population and no date. Restate it as a field estimate from two named providers, or measure it."},
    "techniques/biome-themed-tile-prompting.md": {"disposition": "keep", "reason": "Correctly diagnoses collapse toward the training distribution as a prompt-composition defect rather than a model defect, requires material nouns rather than adjectives and a leading rather than trailing position, insists a fallback be a named generic rather than the empty string, and makes a fired fallback a counted finding."},
    "techniques/derive-only-what-the-source-encodes.md": {"disposition": "keep", "reason": "The three-way split with the middle bucket identified as where honesty is usually lost, the refusal test stated as an asymmetry (a missing channel is found in minutes, a wrong one in days), labels travelling with the artifact rather than in a document beside it, and the fourth status for a learned estimator handled in 'when not to use it'."},
    "techniques/luminance-heightfield-normal-derivation.md": {"disposition": "keep", "reason": "Wrap-around sampling as the step skipped by default and the whole reason a derived map reintroduces a seam; bake-versus-derive decided on provenance rather than fidelity; the pigment case named as unfixable by parameter; the height field shipped as an artifact rather than discarded as an intermediate."},
    "techniques/seam-threshold-calibration.md": {"disposition": "clarify", "reason": "The two-rate calibration, the consequence asymmetry that sets the bias low, and the rule against a per-call threshold are all correct. Step five presents the one-in-four base rate as 'measured on current general image models' when the only witness is a docstring naming two specific providers — the same absence of a labelled corpus that the technique itself says makes a threshold uncalibrated."},
    "techniques/texel-density-and-uv-tiling.md": {"disposition": "keep", "reason": "Identifies inconsistency rather than absolute softness as the failure, derives the repeat count instead of dialling it, requires the achieved density to be computed back and compared, allows only declared exceptions, and hands density target, achieved density and labelled channel set to the shading side without deciding sampler budgets."},
    "techniques/wrap-around-edge-diff.md": {"disposition": "keep", "reason": "Full-resolution decode rather than a preview, one-pixel bands, both mean and maximum with the reason each is needed, per-axis judgement, a named worst edge for the artist rather than only deltas for the log, and not-checkable as a third value that must stay distinct from clean all the way downstream."},
    "applications/node--derive-only-what-the-source-encodes.md": {"disposition": "keep", "reason": "The three buckets are each realised and each named — the double-modulo wrap helper, the height field shipped as its own channel, the inverted-luminance roughness declared a heuristic with its inversion exposed, and metalness refused by absence. Its three recorded shortfalls (labels in comments not artifacts, the invert choice unrecorded, the refusal silent) are the right ones."},
    "applications/node--wrap-around-edge-diff.md": {"disposition": "clarify", "reason": "The three deviations it records were re-checked at pof HEAD and all three hold. It misses a fourth that voids the calibration its second deviation asks for: SeamCheckOptions exposes `threshold?: number` per call, which seam-threshold-calibration explicitly forbids. It also relays the one-in-four base rate as measured without noting that the same file supplies no corpus for it."},
    "applications/process--biome-themed-tile-prompting.md": {"disposition": "keep", "reason": "A closed six-class union, three word kinds per entry mapping onto the technique's noun/condition/colour split, a named fallback asset rather than an empty string, and the single-source half shown as one STYLE_RULES table consumed by both the composer and the analyser. Its three shortfalls — uncounted fallbacks, unrecorded producing class, and 'industrial' being both a class and the shape of the original regression — are well chosen."}
  }
}
```
