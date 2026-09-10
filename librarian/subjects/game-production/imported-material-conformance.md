---
subject: imported-material-conformance
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# imported-material-conformance

First touch: [[2026-09-07-medieval-house-interior]] — created by that `/intake` run, from a
2,666-word practitioner video whose only contribution was to make someone read two
neighbouring golden paths' closing sections.

## State

New subject, forged 2026-09-07 into `asset-production/surface-and-imagery`: a golden path
and six techniques, no applications yet. Placement verified against `taxonomy.json` before
drafting (the subcategory held three subjects of a permitted ten, flat), and the entry was
appended rather than reordered.

## Why it exists — the hole was in the corpus, not in the source

The candidate arrived as a modest technique: *the import step owes a material conformance
pass*. It was drafted twice into two different homes and disqualified by both, in their own
words:

- `geometry/mesh-finishing-for-engine-readiness` closes by disclaiming the import edge —
  *"correcting that is an import-edge decision with its own authority"* — and by disclaiming
  material judgment.
- `geometry/generated-asset-world-scale`, which actually holds the import edge
  (`unit-convention-at-the-engine-edge`), closes with *"what belongs here is only whether
  the output can be the right size."*

Four neighbours, each naming a different one of the others, and nobody owning a delivered
surface crossing into a renderer.

The second and stronger argument came from the **enumeration hunt**.
`unit-convention-at-the-engine-edge` asserts the edge disagrees about *"two things at
once"* — unit and axis — and that *"both disagreements produce an asset that looks
plausible and is wrong by a fixed factor."* There is a third disagreement and **it is not
round**, which is exactly why it survives: that technique's own diagnostic ("a factor of
exactly a hundred is a diagnosis, not a fix") is blind to it, so a surface error is never
classified as a boundary error at all. It reads as *cheap-looking*, which is
indistinguishable from "the generator is not very good at materials" — the explanation that
requires no investigation.

Landing it inside that technique would have falsified its standing sentence. That is the
admission gate's rewrite test working as designed: the arithmetic said the finding was too
big to be a paragraph in that file, and it was right.

## The spine the forge chose, and why it is not the spec's

The dispatch framed the subject as three coordinate disagreements. The worker restructured
it around **three shapes of failure with three different fix locations** — *misread*
(convert at the edge), *never stated* (a defaults policy), *unaddressable* (materialise
inside the import) — on the grounds that this is what routes a symptom to a remedy. The
opening claim is now that the information usually **arrives intact and is misread**, which
is a genuinely different epistemic shape from the twin subject's *information destroyed
upstream, re-establish it from something real*. Accepted; it is the better frame.

## Facts the subject rests on

Grounded in the interchange format's own specification, read in-run 2026-09-07, and stated
in the documents as properties of formats-in-common-use rather than attributed to a brand:

- Colour space is declared **per texture role** — base colour and emissive carry a display
  transfer curve, the measurement maps are linear — so one per-asset policy is wrong about
  three maps of five whichever way it goes.
- The metallic and roughness factors both **default to 1.0**; the emissive factor defaults
  to zero while base colour defaults to white. Two identically shaped omissions therefore
  have opposite consequences, one a no-op and one deleting the feature entirely. That
  asymmetry is the argument for reading defaults rather than deducing them.
- Transparency defaults to opaque and two-sidedness to false — which is why a delivered
  window arrives as an opaque card and the author goes looking in the modelling tool for
  something that was never lost.
- The gloss axis is **inverted and relocated at once** between conventions: the sense is
  reversed, and the two sides disagree about which texture and which channel hold the
  quantity. Negating without relocating drives the surface from an unrelated channel;
  relocating without negating gives the familiar uniformly-shiny import.

## The load-bearing idea

**The midpoint is the fixed point of the inversion.** A material at the centre of the range
is unchanged by the bug, so every spot check on an unremarkable material passes — the check
that would catch it is the same check that certifies it. Hence
`surface-conformance-swatch`: the known-object test for surfaces, twin of pushing a cube of
a stated size through the transform edge, and it **must straddle the midpoint**. Calibrate
at both ends, or the ruler reads correct while pointing backwards.

## Boundary with a neighbour, stated in both directions

`shader-budget-authoring/techniques/channel-packing.md` already carries the per-role
transfer-curve rule from the **authoring** side. Not a conflict of fact, but two authorities
in waiting. Resolved by adopting that neighbour's existing vocabulary and writing the
boundary into this golden path: *that subject decides what to pack when authoring, this one
reads what a format already packed when receiving.* If a later run touches
`shader-budget-authoring`, say the same thing from that side.

## Open, deliberately

- **The import edge has two halves in two subjects.** The transform half lives inside a
  subject named for *size*, which understates it. A future `apply-taxonomy.mjs` pass might
  reasonably want one import-edge subject with both halves; the golden path names the split
  explicitly so that pass can find it. Out of scope for a forge, and it is an `E2`
  escalation whenever someone raises it.
- **No applications.** Nothing in the managed fleet has an asset import edge — the fleet is
  web applications plus a 2D imaging studio, and that absence was measured, not assumed.
  The first application should be the swatch, because it is a test rather than an opinion
  and it fails loudly.
- **Object identity was considered and dropped.** Part names flatten at export and the
  assembling stage is the only one that knows what each part is — but so do pivot placement,
  LOD grouping and collision intent, and that generality is what makes it a wider
  content-pipeline observation rather than a seventh technique here. It sits as a lead in
  the source note, at law altitude, awaiting a second independent sighting.

## Architecture review - 2026-09-10

Read and assessed all 7 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/imported-material-conformance",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a7d00f7b026f6ea9",
  "disposition": "reverify",
  "coverage": "All 7 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "A post-import processor can be deterministic, tested and compulsory. Uniform symptoms do not uniquely identify a boundary defect, and idempotent correction need not double-convert. Migrate by actual pipeline ownership and covered behavior.",
    "Defaults are format-specific semantics, not necessarily missing evidence or exporter innocence. An exporter can omit an authored nondefault incorrectly; explicit and omitted default-equivalent values can intentionally mean the same thing.",
    "Use one-minus-value only when the source and destination parameterizations are complementary. Arithmetic negation is not inversion about 0.5, roughness one is not fully diffuse, and (1-map)*(1-factor) is not generally the original product. Midpoint symptoms are not a unique diagnosis."
  ],
  "sources": [
    {
      "url": "https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc",
      "scope": "Official specification search evidence identifies sRGB base-color RGB. Published specification direct open timed out; no renderer conformance execution or verification of universal format defaults."
    },
    {
      "url": "https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_specular/README.md",
      "scope": "Official extension search evidence specifies linear specular strength in alpha and sRGB specular color in RGB. Supports checking per-channel contracts rather than assuming all image channels share an interpretation."
    }
  ],
  "documents": {
    "imported-material-conformance.md": {
      "disposition": "reverify",
      "reason": "Reverify format-specific defaults stated as universal, mixed-channel denial, default omission as exporter innocence, obligatory material extraction and swatch passes as proof of an entirely correct edge. The encoding and swatch techniques are repaired; this golden path and prior librarian claims need reconciliation."
    },
    "techniques/a-fixer-script-is-the-edge-in-the-wrong-place.md": {
      "disposition": "reverify",
      "reason": "A post-import processor can be deterministic, tested and compulsory. Uniform symptoms do not uniquely identify a boundary defect, and idempotent correction need not double-convert. Migrate by actual pipeline ownership and covered behavior."
    },
    "techniques/colour-space-is-per-texture-role.md": {
      "disposition": "clarify",
      "reason": "Repaired per-role/per-channel encoding, linear alpha alongside encoded RGB, unsupported mappings and bounded diagnosis. A texture-wide color switch does not imply identical treatment of all channels."
    },
    "techniques/format-defaults-are-not-asset-properties.md": {
      "disposition": "reverify",
      "reason": "Defaults are format-specific semantics, not necessarily missing evidence or exporter innocence. An exporter can omit an authored nondefault incorrectly; explicit and omitted default-equivalent values can intentionally mean the same thing."
    },
    "techniques/gloss-axis-inversion-and-the-midpoint.md": {
      "disposition": "reverify",
      "reason": "Use one-minus-value only when the source and destination parameterizations are complementary. Arithmetic negation is not inversion about 0.5, roughness one is not fully diffuse, and (1-map)*(1-factor) is not generally the original product. Midpoint symptoms are not a unique diagnosis."
    },
    "techniques/materialise-on-import.md": {
      "disposition": "reverify",
      "reason": "Materials may already be addressable through subassets or import overrides. Names can be absent, duplicated or unstable; use a durable mapping and explicit reconciliation. Lost overrides have more than two possible causes."
    },
    "techniques/surface-conformance-swatch.md": {
      "disposition": "clarify",
      "reason": "Repaired calibration scope, independently derived expectations, channel/factor/default cases and complementary rendering checks. Passing fixtures no longer absolve untested importer branches or assign every later failure upstream."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all seven owned documents in full at the current bytes. This subject has no
applications, so every claim in it is a claim about formats and renderers, which makes it
the one subject in my group where primary sources decide the findings rather than internal
consistency. I checked the glTF 2.0 specification for the defaults and the per-texture
encodings the subject asserts. Two of the three findings below come from that check.

**Finding 1 — the mixed-encoding case exists, in the base specification.**
`colour-space-is-per-texture-role`, procedure step 4: *"Handle the shared texture as a
measurement, whole. Where several single-channel quantities share one texture, that texture
is measurement data in every channel — **there is no mixed case**, because a display curve
applies to the whole image and cannot be applied to two of its three channels."* glTF 2.0's
base colour texture is exactly a mixed case: the first three components MUST be encoded with
the sRGB transfer function, and the fourth component, if present, is **linear** alpha
coverage. One image, two encodings, in the format the subject is plainly written against.
`KHR_materials_specular` goes further and permits sRGB specular colour in RGB alongside a
linear specular strength in A of the same texture. The step's practical instruction — treat a
texture packing several single-channel measurements as measurement data — is right and
useful; the universal it is justified with is false, and an importer built on "there is no
mixed case" will decode base-colour alpha through a transfer curve.

**Finding 2 — the defaults are one format's, stated as every format's.** The golden path
and `format-defaults-are-not-asset-properties` both say "the interchange formats in common
use" state defaults, then give a specific set: the two gloss factors default to fully on,
base colour factor to white, emissive factor to zero, transparency to opaque,
two-sidedness to off. Every one of those is correct for glTF 2.0 — I checked the
specification and the schema defaults are `metallicFactor: 1.0`, `roughnessFactor: 1.0`,
`baseColorFactor: [1,1,1,1]`, `emissiveFactor: [0,0,0]`, `alphaMode: "OPAQUE"`,
`doubleSided: false`. They are not universal. USD's `UsdPreviewSurface` defaults roughness
to 0.5 and metallic to 0.0, so a delivery through that path omitting both arrives
mid-rough and non-metallic, and the subject's headline diagnosis — *"when a whole delivery
is fully metallic, suspect the defaults before the maps"* — points a reader the wrong way.
The technique's own procedure step 1 has the right instruction (read the default from the
format's own specification and record it in the participant table); the prose above it
generalises the one format's answers into the rule. Naming the format beside the values
costs a clause and removes the whole error.

**Finding 3 — the gloss conversion's justification is arithmetically wrong.**
`gloss-axis-inversion-and-the-midpoint`, procedure step 3: *"Negate the **product**, not the
map and the factor separately — negating twice restores the original and looks, from
outside, exactly like a conversion that never ran."* Inverting each term and multiplying
gives (1−f)(1−m), which is not f·m: at f = 0.2 and m = 0.5 the original product is 0.10 and
the doubly-inverted one is 0.40. Nor is it 1 − f·m, which is what the correct conversion
produces (0.90). So the error is not a no-op and does not look like a conversion that never
ran — it is a third, wrong surface, which is worse for diagnosis than the document claims,
because a no-op at least reproduces the familiar uniformly-shiny symptom the reader has been
taught to recognise. The instruction is right; the reason attached to it is wrong and
undersells the failure.

**Retracted.** The preceding 2026-09-10 record marked five of seven `reverify` on grounds
the documents answer. `materialise-on-import` was told that "materials may already be
addressable through subassets or import overrides" — the document's acceptance test is
whether a correction can be expressed as an edit to a named project artifact, which any
such mechanism satisfies. `a-fixer-script-is-the-edge-in-the-wrong-place` was told that a
post-import processor "can be deterministic, tested and compulsory"; the document's argument
is that such a processor is a *second authority* for the conversion and actively prevents
the edge from being fixed, which determinism does not touch. Those are withdrawn. One
phrasing there does overshoot its own argument — "it cannot be tested, because it has no
stated input" — but the following sentence makes the real claim (it has no stated expected
output, so "produces something better" is not a property anything can assert), so it is left
`keep`.

**What I could not verify.** Nothing was imported. No renderer was run, no swatch was built
or pushed through any edge, no exporter was exercised, and no channel packing was inspected
in an actual delivery. The glTF facts above were read from the specification, not observed
in an importer. The USD comparison is from my own knowledge of `UsdPreviewSurface` and was
not fetched in this pass — the finding it supports stands on the weaker and sufficient claim
that the stated defaults are glTF's and are presented as general. This subject has no
applications, so nothing here rests on a consumer witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/imported-material-conformance",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:720549b5c431ae0d",
  "disposition": "clarify",
  "coverage": "All 7 owned documents read in full at current bytes; the subject owns no applications. Format claims (material property defaults, per-texture and per-channel encodings) checked against the glTF 2.0 specification, and the gloss-conversion arithmetic recomputed. Explicitly not evaluated: any import execution, any renderer, any swatch built or pushed through an edge, any real delivery, and the USD comparison, which was not fetched in this pass.",
  "counterexamples": [
    "glTF 2.0's base colour texture: RGB encoded with the sRGB transfer function and alpha linear in the same image — a mixed case in the base specification, against 'there is no mixed case'. KHR_materials_specular permits the same split between sRGB specular colour and linear specular strength.",
    "A delivery through USD's UsdPreviewSurface, where roughness defaults to 0.5 and metallic to 0.0: an omitted pair arrives mid-rough and non-metallic, so 'when a whole delivery is fully metallic, suspect the defaults' is the wrong first question for that path.",
    "A renderer whose shading parameter is squared perceptual roughness: the conversion is not one-minus, and the midpoint is not the fixed point, so the subject's cheapest diagnosis — correct in the middle and wrong at both ends — never fires on a real inversion.",
    "A delivery whose materials carry no names (an unnamed default material per primitive): 'derive each material's identity from the delivery, not from its position' has nothing to derive from, and the only remaining handle is the index the rule forbids."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/KhronosGroup/glTF/main/specification/2.0/Specification.adoc",
      "result": "Read (not executed against any importer). Confirms baseColorFactor [1,1,1,1], metallicFactor 1.0, roughnessFactor 1.0, emissiveFactor [0,0,0], alphaMode OPAQUE, doubleSided false — every default the subject states, for this format. Establishes nothing about other interchange formats, which is the basis of finding 2."
    },
    {
      "url": "https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/schema/material.pbrMetallicRoughness.schema.json",
      "result": "Corroborates the base colour texture's per-channel contract: the first three components are encoded with the sRGB transfer function and the fourth, if present, is linear alpha coverage. This is the direct counterexample to 'there is no mixed case'. It does not establish how any particular importer treats that alpha."
    },
    {
      "url": "local: knowledge/game-production/asset-production/surface-and-imagery/imported-material-conformance",
      "result": "All seven documents read as primary evidence; established the gloss-conversion arithmetic error by recomputation and located the correct instruction sitting above the wrong justification. Established nothing about any import path in use."
    }
  ],
  "documents": {
    "imported-material-conformance.md": {
      "disposition": "clarify",
      "reason": "States one format's material defaults ('the two gloss factors default to fully on', transparency to opaque, two-sidedness to off, base colour factor white against emissive factor zero) as properties of 'the interchange formats in common use'. They are glTF 2.0's, verified; they are not USD's. Name the format beside the values. The three-shapes-of-failure table, the argument that these errors survive because none of them is round, and the diagnosis that a manual polish pass is a misclassified convention error are the subject's real contribution and are unaffected."
    },
    "techniques/a-fixer-script-is-the-edge-in-the-wrong-place.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify: determinism does not answer the document's argument, which is that a corrector becomes a second authority for the conversion and thereby prevents the edge from being fixed. The migration procedure — inventory, classify boundary versus asset, move one rule at a time, add the swatch case before moving it — is the operable half. 'It cannot be tested' overshoots; the next sentence states the real claim (no stated expected output), so the phrasing is loose rather than wrong."
    },
    "techniques/colour-space-is-per-texture-role.md": {
      "disposition": "clarify",
      "reason": "Procedure step 4's 'there is no mixed case, because a display curve... cannot be applied to two of its three channels' is refuted by the base specification: glTF's base colour texture is sRGB in RGB and linear in alpha, and KHR_materials_specular permits the same split in one texture. The practical instruction (treat a packed multi-quantity texture as measurement data) survives; the universal does not, and an importer built on it will decode base-colour alpha through a transfer curve. The colour-wrong-shading-right diagnostic is the document's best content and is correct."
    },
    "techniques/format-defaults-are-not-asset-properties.md": {
      "disposition": "clarify",
      "reason": "Same generalisation as the golden path: the three damaging defaults are stated as the formats', and they are glTF 2.0's. The document's own procedure step 1 gives the right instruction — read the default from the format's own specification and record it per participant — so the repair is to make the prose obey the procedure. The epistemic point underneath (a defaulted property and an authored one must be distinguishable after import because they have different owners) is the part worth keeping exactly."
    },
    "techniques/gloss-axis-inversion-and-the-midpoint.md": {
      "disposition": "clarify",
      "reason": "Procedure step 3's justification is arithmetically wrong: inverting the factor and the map separately gives (1-f)(1-m), which is neither the original product nor the correct conversion — at f=0.2, m=0.5 the three values are 0.40, 0.10 and 0.90. The failure is a third wrong surface, not a no-op, which makes it harder to diagnose than the document says, not easier. The instruction itself (negate the product) is correct, and the two properties that carry the technique — the midpoint as a fixed point, and the conversion being a relocation and a negation at once — are sound."
    },
    "techniques/materialise-on-import.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The acceptance test — a correction that cannot be expressed as an edit to a named project artifact means the import is not finished — is checkable without judgment and admits any mechanism that makes materials addressable. Reconcile-rather-than-replace, conversion and override as separate layers, and refuse-on-name-collision each name a specific failure, and the compiling-is-not-wiring reading (an embedded material renders perfectly and is unreachable) is exact."
    },
    "techniques/surface-conformance-swatch.md": {
      "disposition": "keep",
      "reason": "The straddle-the-midpoint rule is the one thing a swatch built by intuition always gets wrong, and the required contents are each tied to a defect no other case exercises — the empty material for the defaults, the emissive-texture-without-factor for the annihilating omission, the metalness pair because a defaulted metal and an authored one differ only in a value. Assert values not appearance, and expected outputs derived from the participant table rather than from a correct-looking run, are the two rules that keep it from enshrining the pipeline's behaviour on the day it was written."
    }
  }
}
```
