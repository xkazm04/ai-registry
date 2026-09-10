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
