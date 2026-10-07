---
layer: application
type: application
subject: render-submission-economy
technique: residency-budget-checked-before-decode
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# A 52 MiB texture table, checked from the PNG header

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21 on libGDX 1.13.5. The design is the I2 wave's, written down on
2026-10-01 before its sustained run (`docs/concepts/deathride/I2-stick-budget.md`) and enforced in commit
`5c213cf4` the same day. The device is one Fire TV stick, model AFTKM; every device figure below is from
that unit and that run.

## The table, declared first

The design opens with units and basis — binary MiB, RGBA texels without mipmaps — and then a table whose
every row carries its derivation, for example
`docs/concepts/deathride/I2-stick-budget.md:7 "World/UI pages 8, repeat tiles 2.75, one optional backdrop 4"`,
a total
`docs/concepts/deathride/I2-stick-budget.md:12 "Total owned textures | 52"`, and a separate process budget
`docs/concepts/deathride/I2-stick-budget.md:13 "not a Java heap estimate"` for whole-process PSS at
192 MiB. The code holds the same numbers:
`deathride/game/src/main/kotlin/dev/deathride/game/TextureBudget.kt:6 "RGBA storage without mipmaps. PSS is measured separately on the device."`,
with `ART=32*MIB`, `SCENERY=16*MIB`, `FONTS=11*MIB` and `TOTAL=52*MIB` on the lines that follow. The
8 MiB large-font page is named in the table as the one exception to the 4 MiB page limit, as the technique
asks.

## The check runs before the decoder

`deathride/game/src/main/kotlin/dev/deathride/game/TextureBudget.kt:17 "Read only the fixed PNG header, before a decoder can allocate the pixel buffer."`
The function verifies the eight-byte signature and the `IHDR` chunk, reads width and height, refuses an
edge beyond the class limit and returns texels times four. The loader calls it and then the residency
check, and only then constructs the texture:
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:79 "TextureBudget.pngBytes(it,limit)"`,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:80 "resident texture budget"`,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:81 "val t=Texture(source)"`. The header is
read once and the pixels are decoded once. Atlas pages get a page-count limit per group as well,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:89 "atlas page budget"`.

The budget handed to the art loader is what is left after the fonts and the scenery target are counted,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:234 "TextureBudget.remainingArt(fontTextureBytes"`,
so the three claimants share one total rather than each assuming the whole.

## A refusal draws the fallback

A rejected or failed load is logged and counted,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:39 "art fallback"`, and the system that
asked for it draws its procedural version. The design states the rule as
`docs/concepts/deathride/I2-stick-budget.md:15 "Asset loads must reject an over-budget allocation and retain their procedural fallback."`
The regression for the header path is
`deathride/game/src/test/kotlin/dev/deathride/game/AtlasArtTest.kt:45 "oversizedOrMalformedPngIsRejectedBeforePixelDecoding"`,
which covers an oversized edge, a wrong signature and a truncated file.

## What the device showed

The final I2 run on the AFTKM stick, 2026-10-01: 900.024 s, eleven races across five themes, two
controllers at 30 Hz. `docs/concepts/deathride/I2-stick-budget.md:60 "PSS from sixteen"` observations
read 107.018–115.502 MiB against the 192 MiB budget, with first and last warm medians 114.035 and
113.880 MiB and a fitted warm trend of +0.04993 MiB per minute. Owned textures stayed at 37.970 MiB (art
10.750 MiB) against 52 and 32. The same run's real-GL missing, failed, over-budget and invalid-metadata
fallbacks passed. The figures are one unit, one run, sixteen PSS samples; they are not a claim about a
longer session or another stick.

## Deviations

- **The table lives twice.** The design document and `TextureBudget` hold the same numbers by hand; a
  change to one does not move the other, which is the drift the law about a check sharing its law's source
  warns of. The code is the operative authority.
- **The process budget is generous against the platform's.** Amazon's KPI page asks a foreground Fire TV
  app at 1080p or lower to stay under 300 MB PSS
  (https://developer.amazon.com/docs/app-testing/measure-kpis-fire-tv-apps.html); the project's 192 MiB is
  stricter, which is the right direction, and the measured peak sits well under both.

## Outside corroboration

Android's guidance for bitmaps gives the same order — "check the dimensions of a bitmap before decoding
it" with `inJustDecodeBounds` (https://developer.android.com/topic/performance/graphics/load-bitmap) —
and states the mip chain's cost as 33% (https://developer.android.com/games/optimize/textures). Meta's
Quest memory guidance says textures created through GLES or Vulkan sit in the same main memory as every
other allocation and recommends a total texture budget
(https://developers.meta.com/vr/blog/getting-a-handle-on-meta-quest-memory-usage/), which is why the
technique transfers to standalone headsets; no headset was measured here.
