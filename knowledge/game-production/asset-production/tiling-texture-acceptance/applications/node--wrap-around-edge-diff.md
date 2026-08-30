---
layer: application
type: application
subject: tiling-texture-acceptance
technique: wrap-around-edge-diff
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Wrap-around edge diff in a server-side generation flow

`src/lib/visual-gen/seam-check.ts` (PoF) implements the check as a pure analysis pass that
runs immediately after a tiling texture is generated, before anything is imported.

## The measure

`detectSeams()` (`seam-check.ts:59-102`) decodes the encoded bytes with `sharp`, calls
`.removeAlpha()` so the comparison is over colour channels only, and takes raw pixels.
Then, per axis:

- **Horizontal wrap** — column `x=0` against column `x=w-1`, summed over every row,
  mean absolute per-channel difference, divided by `255` to normalise to `0..1`.
- **Vertical wrap** — row `y=0` against row `y=h-1`, the same reduction over columns.

The axes are labelled `'left'` and `'top'` (`SeamAxis`), and the result carries
`worstEdge` as a human phrase — `'left edge'` or `'top edge'` — chosen by whichever delta
is larger, and `undefined` when clean. That last field is the one artists use; the deltas
are for the log.

## The threshold and the base rate

`DEFAULT_SEAM_THRESHOLD = 0.08` (`seam-check.ts:53`), documented in the file as
"~20/255 mean per-channel edge difference — a conservative 'visible seam' cutoff". Both
phrasings are given deliberately: the normalised fraction is what the code compares, the
`/255` form is what a person can picture.

The file header carries the argument for the whole check: tiling outputs from the
generation providers in use are "best-effort: roughly 1 in 4 has a visible seam that only
becomes obvious once the tile is repeated across a surface in-engine — costing a full
import → build → look cycle to discover." That measured base rate, not the elegance of
the arithmetic, is why the check is mandatory in this pipeline.

## Never breaking the flow it augments

`detectSeamsSafe()` (`seam-check.ts:104-120`) wraps the analysis in a try/catch, logs a
warning, and returns `null` rather than throwing. The docstring states the rule
explicitly: "a seam check must never break the generation flow it augments". Note what
`null` is and is not — it is a distinct third value alongside `hasSeam: true` and
`hasSeam: false`, so *not checkable* never renders as *clean*. The header also states the
pass is "Pure analysis — never mutates or re-uploads the image."

## Where it falls short of the technique

Recorded as deviations; the standard in `techniques/wrap-around-edge-diff.md` is not
lowered to match.

- **Mean only, no maximum.** A single hard discontinuity across a 1024-pixel edge barely
  moves the mean. The technique requires both statistics; this implementation reports one.
- **The threshold is asserted, not calibrated.** `0.08` is defended in a comment as
  "conservative". There is no labelled corpus, no catch rate and no false-flag rate — see
  `techniques/seam-threshold-calibration.md` for what would close this.
- **Only the source is checked.** The maps derived in `src/lib/texture-maps.ts` are never
  re-run through `detectSeams`, so a seam introduced by a derivation would pass unseen —
  mitigated here only because that derivation samples with wrap-around.
