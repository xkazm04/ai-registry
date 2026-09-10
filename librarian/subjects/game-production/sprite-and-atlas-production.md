---
domain: game-production
subject: sprite-and-atlas-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# sprite-and-atlas-production

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/sprite-and-atlas-production",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2daf4f27bdc12d68",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two frames both use the declared brown and red entries but swap a coat from brown to red; both are palette-clean and the animation still flickers.",
    "A resolver returning the same grass image for all 256 masks is total but can render every boundary incorrectly.",
    "A one-pixel white line averaged with black during a 2:1 reduction becomes gray or is dropped, despite an integer scale factor."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/surface-and-imagery/sprite-and-atlas-production",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://learn.microsoft.com/en-us/windows/uwp/graphics-concepts/bc7-format",
      "scope": "Official search excerpt confirms BC7 can use multiple endpoint pairs, limiting the single-line block model; no encoder output measured."
    },
    {
      "url": "https://wikis.khronos.org/opengl/Array_Texture",
      "scope": "Official search excerpt identifies array layers as an atlas alternative with mipmaps; no consumer renderer tested."
    }
  ],
  "documents": {
    "sprite-and-atlas-production.md": {
      "disposition": "reverify",
      "reason": "Useful asset/set contracts, but pixel-art constraints are generalized to all sprites. Quantization cannot guarantee temporal coherence, relational defects can often be repaired, and visual semantic checks are not all arithmetic. Mip example confuses levels with halvings; padding/wrap and compression bans need actual sampling/format scope."
    },
    "techniques/atlas-packing-and-bleed-margins.md": {
      "disposition": "reverify",
      "reason": "Margin must include generation kernel, LOD range, anisotropy, UV precision, alpha representation and per-level layout. Four levels means three halvings when base is counted; 200/128 is 1.5625, not four. Nearest with bounded coordinates can avoid gutters; tiling subregions can use wrap-aware gutters or array layers. A page limit need not be spent, page count needs dimensions/format, and IDs alone do not preserve a stale coordinate manifest."
    },
    "techniques/autotile-rule-set-completeness.md": {
      "disposition": "clarify",
      "reason": "Repaired completeness-versus-correctness and case-count-versus-distinct-art claims. Defines resolver domain, expected semantic output, valid transformations, multi-terrain junctions and explicit fallback policy; enumeration remains scoped to the encoded model."
    },
    "techniques/lossy-compression-acceptance-for-flat-art.md": {
      "disposition": "reverify",
      "reason": "Single endpoint pair does not describe every block format. Lossy formats can represent some hard edges exactly; downsampling can erase a one-pixel feature and source lossless storage does not imply resident GPU compression. Validate actual target encoding, alpha and displayed scale; encoder failures are possible, and one example per class does not certify every asset."
    },
    "techniques/palette-discipline-across-frames.md": {
      "disposition": "clarify",
      "reason": "Repaired quantization-as-coherence guarantee, color count as proof of membership, automatic hard alpha cutoff and large color error as proof of an unwanted object. Separates palette membership, role consistency, color management and temporal inspection."
    },
    "techniques/pixel-grid-and-resolution-contract.md": {
      "disposition": "reverify",
      "reason": "Whole-number enlargement is useful for pixel art, but integer reduction still averages colors or discards marks. Dimensions do not establish an authored grid; different density can be intentional. Quantized rendering remains stepped despite smooth simulation, one-off art still needs presentation constraints, and finite distance-field textures are not infinitely resolution-independent."
    },
    "techniques/sprite-sequence-timing-and-pivot-stability.md": {
      "disposition": "reverify",
      "reason": "Declared timing and anchor coordinates are useful but shared defaults can be valid. Four hundredths versus four sixtieths differs by 5/3, not 2.5. Ground-contact and anchor motion require pose/trim/flip conventions; max excursion alone cannot prove loop continuity or diagnose every jitter cause."
    },
    "applications/node--atlas-packing-and-bleed-margins.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF source locations and verification date were not rerun. Four mip levels are base through level 3; the proposed four-texel gutter is not established by the stated sampling model. Grid indices do not stop content reassignment, and aligned mip downsampling need not mix cells regardless of gutter. BC7 is not DXT5-equivalent behavior; spec presence and cited gallery guard do not prove packed bytes or rendering."
    },
    "applications/process--pixel-grid-and-resolution-contract.md": {
      "disposition": "reverify",
      "reason": "Historical process references and verification date were not rerun. An 8:1 reduction does not preserve a quarter-pixel outline as hard pixel art; anti-aliased icons belong to a different contract. The source excerpt does not establish a current whole-tree absence of dimension checks or prove larger generation necessarily adds harmful detail."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all nine owned documents in full at the current bytes and recomputed every piece of
arithmetic in them. This subject is the one in my group whose findings are hard rather than
interpretive: three separate numbers are wrong, and in two of the three cases the *correct*
version of the same calculation appears elsewhere in the same subject, which is what makes
them repairs rather than judgment calls.

**Finding 1 — the duration-unit example is off by the wrong factor.**
`sprite-sequence-timing-and-pivot-stability`, procedure step 5: *"A bare '4' is four
hundredths of a second in one runtime and four sixtieths in another, and the resulting
animation is a factor of two and a half out."* Four sixtieths is 0.0667 s and four
hundredths is 0.04 s; the ratio is 100/60 = 5/3, about 1.67. Two and a half is the ratio
between hundredths and fortieths. The point of the section — that a bare number with no
unit produces a silently wrong playback speed — is exactly right, and the number chosen to
illustrate it is the kind of unchecked figure the section is warning against.

**Finding 2 — a mip *count* restated as a number of *halvings*.**
`atlas-packing-and-bleed-margins`, decision rules: *"seven halvings of a four-thousand-texel
page leave each two-hundred-texel region four texels across."* Seven halvings of two hundred
is 1.56 texels. The figure comes from the application, where the source comment says a mip
**count** of 7 over a 256-pixel cell runs it down to 4 pixels — that is six halvings of 256,
and the restatement changed both the operation and the operand. The same technique's
procedure step 1 gets the identical relationship right (*"With four halvings, a texel at the
deepest level spans sixteen at the top"*), and so does the golden path (*"two texels of the
top level are a quarter of a texel"* at the fourth mip level — 2/8, correct for three
halvings). The decision rule is the only place in the subject where the arithmetic slips,
and its conclusion survives any of the correct figures.

**Finding 3 — the application's recommended margin is derived against its own rule.**
`node--atlas-packing-and-bleed-margins.md` describes a chain of `4096→2048→1024→512` with
cells `256→128→64→32` and `mip count = 4`: base plus three halvings, deepest reduction
factor 8. It then says *"at mip level 4 a cell's edge texel is an average of sixteen source
texels"* — at a factor of 8 a texel covers 8×8 = 64 source texels; sixteen corresponds to a
factor of 4 — and concludes that *"256-pixel cells with four mip levels need at least four
texels of extruded margin"*. The technique's derivation is the filter's reach (one texel for
bilinear) multiplied by the reduction factor of the deepest level in use, which for this
chain gives **eight** texels, not four. The recommendation is the actionable half of the
document and it is half the size its own governing rule produces. The usable-area figure
that follows it (248 px inside a 256 px cell) inherits the same halving.

**Finding 4 — the subject contradicts itself about the block format.** The same application
quotes, without comment, `BC7 (DXT5-equivalent, full alpha for transparency)`, while
`lossy-compression-acceptance-for-flat-art` step 3 tells the reader that within the
block-compressed family "modes with more endpoint precision and more partitioning cost the
same memory and handle hard edges far better than the oldest fixed four-colour mode". The
application records every other deviation in that step meticulously and lets this one pass
as quoted repo prose. Where an application reproduces a claim the owning technique
contradicts, it should say so.

Related and softer: both the golden path and the technique characterise fixed-rate block
compression as storing "a pair of endpoint colours per block", and derive from that single
line through colour space the conclusion that a block straddling an outline "must
approximate". That is exact for the oldest mode and weaker for partitioned modes, which the
technique's own step 3 knows about. The class-level rule (flat art takes a lossless or
indexed path) does not depend on the strength of the derivation, so this is recorded as a
bound on the argument rather than as a defect in the conclusion.

**Retracted.** The preceding record marked seven of nine `reverify`, several for reasons
the documents answer directly: `pixel-grid-and-resolution-contract` was told that "integer
reduction still averages colors or discards marks", which is precisely what the document
says reduction by two or four does correctly and what it forbids at 1.7; and
`palette-discipline-across-frames` was told that quantisation cannot guarantee temporal
coherence, which the document's closing section states itself ("a palette-clean set can
still be incoherent in every other way"). Those are withdrawn. The three arithmetic findings
the prior pass raised are independently confirmed here and are the reason this subject's
overall disposition is `clarify`.

**What I could not verify.** No packer was run, no page was packed, no bytes were read, no
encoder was exercised, and the consuming checkout was not opened — the two applications are
historical witnesses at `verified_on` 2026-09-02 against branch `master`, and those dates
are left untouched. The BC7 characterisation was assessed against the owning technique in
this corpus rather than against a format specification; a specification check would settle
it more strongly and was not performed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/sprite-and-atlas-production",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:e77e8a24eccf56b7",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at current bytes, with every numeric claim recomputed: mip depths and reduction factors, gutter derivations, the duration-unit ratio, the 8:1 icon reduction, and the 16/47/256 autotile counts. Explicitly not evaluated: any packer or encoder execution, any rendered sample, the consuming checkout at branch master, and the BC7 claim against a format specification. No verification date refreshed.",
  "counterexamples": [
    "An art class delivered as texture-array layers rather than atlas pages: regions have no neighbours, the entire bleed-margin apparatus is inert, and 'pages per class' has no referent — the technique's exclusions cover single large art but not this case.",
    "A three-terrain junction cell: the completeness technique correctly says transition domains are per pair, but a cell where three terrains meet simultaneously belongs to no pair's enumeration, so a set that is provably complete over every pair still has an unreachable-by-enumeration case in play.",
    "A set whose anchors are derived per frame from the art's own bounding content and then trimmed: the excursion check reads near zero on the declared axes while the subject's silhouette centroid still wanders, because the instrument measures the feature it was pointed at rather than the wander a player sees.",
    "A partitioned block-compressed mode encoding a two-colour hard edge exactly: the 'block straddling an outline must approximate' derivation assumes one endpoint pair, and the class-level rule survives without it — but the stated mechanism does not."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/asset-production/surface-and-imagery/sprite-and-atlas-production",
      "result": "All nine documents read as primary evidence and every numeric claim recomputed. Established three arithmetic errors and one internal contradiction about block-format capability, in each case against a correct statement of the same relationship elsewhere in the subject. Established nothing about the consuming checkout or about any rendered or encoded output."
    }
  ],
  "documents": {
    "sprite-and-atlas-production.md": {
      "disposition": "keep",
      "reason": "Its own mip arithmetic is correct — two texels of padding become a quarter of a texel at the fourth mip level, which is 2/8 for three halvings — and the four relational defects that open it are the clearest statement in the subject of why a per-image rubric is structurally blind here. The block-compression model it inherits ('a pair of endpoint colours per block') is exact only for the oldest mode; the class-level conclusion does not depend on it, so this is a bound on the argument rather than a defect."
    },
    "techniques/atlas-packing-and-bleed-margins.md": {
      "disposition": "clarify",
      "reason": "The decision rule 'seven halvings of a four-thousand-texel page leave each two-hundred-texel region four texels across' is wrong: seven halvings of 200 is 1.56. The source figure was a mip count of 7 over a 256-pixel cell, i.e. six halvings. Procedure step 1 states the same relationship correctly, so the repair is local and the rule's conclusion is unaffected. Everything else — derive the margin rather than picking it, extrude before padding, extrude under transparent texels, address by name — is sound and each rule carries its failure."
    },
    "techniques/autotile-rule-set-completeness.md": {
      "disposition": "keep",
      "reason": "The counts are right: four sides gives sixteen cases, eight neighbours gives 256 masks collapsing to 47 distinct outcomes under the standard corner rule, and the document insists the collapse be computed from the stated rule rather than remembered. Enumerate-and-assert plus assert-the-enumeration-was-non-empty is the completeness pattern done properly, and the reverse direction (an image no case selects) is the half most sets omit."
    },
    "techniques/lossy-compression-acceptance-for-flat-art.md": {
      "disposition": "clarify",
      "reason": "The concern section derives 'the encoder must approximate' from a single-endpoint-pair model, while step 3 of its own procedure tells the reader that partitioned modes with more endpoint precision handle hard edges far better at the same memory. State the model as the oldest mode's and the conclusion as class-level, or the document argues against its own step 3. The measurement discipline — maximum error and error restricted to pixels adjacent to a strong gradient, never a whole-image mean — is the transplantable part and is correct."
    },
    "techniques/palette-discipline-across-frames.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify, whose objection (quantisation does not guarantee coherence) is the document's own closing paragraph. Quantise-into-the-declared-palette as the guarantee with the prompt as only a base-rate improvement, measure-before-quantising as the drift diagnostic, distinct-colour count as an intake check, and transparency kept out of the colour contract are each argued from a specific failure."
    },
    "techniques/pixel-grid-and-resolution-contract.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify, which restated the document's own rule back at it. The fractional-scale argument is stated as damage with a named mechanism (some authored pixels get three screen pixels and their neighbours four, and which one is fat migrates with the camera), the whole-number reduction rule is correct, and 'when more resolution is available for free, do not take it' is the budget law applied where it actually bites."
    },
    "techniques/sprite-sequence-timing-and-pivot-stability.md": {
      "disposition": "clarify",
      "reason": "Procedure step 5 says four hundredths versus four sixtieths puts an animation 'a factor of two and a half out'; the ratio is 5/3. The section's argument — a bare number with no unit produces a silently wrong playback speed — is correct and is undermined only by its own unchecked figure. The anchor material (declare per frame, anchor to a stable feature of the subject, check excursion as a series, trim and re-anchor in one operation) is the strongest content here."
    },
    "applications/node--atlas-packing-and-bleed-margins.md": {
      "disposition": "clarify",
      "reason": "Two numeric repairs. For the declared chain (256-px cells down to 32, mip count 4, three halvings) a deepest-level texel averages 64 source texels, not sixteen; and the technique's own derivation — filter reach times the deepest reduction factor — gives an eight-texel margin, not the four the document recommends, with the 248-px usable-area figure inheriting the same halving. Separately, it quotes 'BC7 (DXT5-equivalent)' without flagging that the owning technique says partitioned modes are far better than the oldest four-colour mode. The mip-floor lesson (floor the chain on the cell, not the page) is genuinely valuable and unaffected. verified_on 2026-09-02 stands unrefreshed."
    },
    "applications/process--pixel-grid-and-resolution-contract.md": {
      "disposition": "keep",
      "reason": "The arithmetic checks out: 256 px authored against a 32 px minimum display size is 8:1, a whole-number reduction, and a 2 px stroke at that ratio is the quarter-pixel the document says it is. The finding it reports — a class resolution declared in prose and a generation call defaulting to 512 with nothing reconciling them — is the failure the technique exists to prevent, observed rather than asserted, and the 3D half's texel-density constant is the right comparison. verified_on 2026-09-02 stands unrefreshed; no current re-read of the tree confirms the absence of dimension checks."
    }
  }
}
```
