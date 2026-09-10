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
