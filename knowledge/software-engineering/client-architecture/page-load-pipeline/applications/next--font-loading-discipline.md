---
layer: application
type: application
subject: page-load-pipeline
technique: font-loading-discipline
stack: next
status: forged
verified_on: 2026-10-22
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# Fonts declared at weights the headlines never request

Tree: systedo-case, read at `35815449` (2026-10-22), `next` 16.3.3 from the package manifest and
the build. The seam is the root layout's font declarations: three self-hosted families (a display
serif, a grotesque for body, a mono for figures), each in the Latin and Latin Extended subsets
because the copy is Czech.

## What conformed

The tree meets most of the technique without having been told to. The build emits a swap display
on every face, a size-adjusted fallback face for each family (the metric-matched fallback), and a
Latin Extended subset carried by the framework's range-split faces, so no family arrives whole.
Foreign font stylesheets are absent; the files are same-origin. The seam was chosen to falsify
"the tree conforms" and these four held.

## What did not

The display serif was declared at weights 400, 500 and 600. The hero title and every section
heading are set at weight 300 (`font-light`, and `font: 300 ...` in the hero stylesheet, plus a
300 italic emphasis). The built stylesheet holds no face below 400, so the browser matched 300 to
400 and the headlines rendered one step heavier than designed. The three declared weights resolved
to one file per style and subset, so the enumerated list cost nothing and hid the fault.

## Paired proof

Target: faces whose weight range covers the requested weights. Floor: font files preloaded and
the type check.

| Arm | Display serif faces | Weights covered | Preloaded display files | Typecheck |
| --- | --- | --- | --- | --- |
| A, enumerated 400/500/600 | 30 rules, one file per style and subset | 400, 500, 600 (300 absent) | 4 | clean |
| B, variable range | 10 rules, one range face per style and subset | 300 to 700 | 4 | clean |

Whole built stylesheet: 47 font-face rules in A, 27 in B. Both arms are real builds of the same
tree. Not measured: a rendered glyph comparison. The claim is the descriptor match, which the
browser's weight-matching rules decide; no browser was run.

## What this cannot show

It cannot say the heavier weight was wrong for the brand, only that it was not the one the
styles asked for. It also leaves the other finding open: the framework preloads both subset files
of every family for every visitor, so an English reader pays for the Czech subset on a cold visit.
