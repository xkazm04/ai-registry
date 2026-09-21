---
layer: application
type: application
subject: codebase-scanning
technique: the-narrowest-view-owns-the-number
stack: node
verified_against: node@24
verified_on: 2026-09-17
date: 2026-09-17
applied: code
ab_verdict: better
---

# A repository-assessment pipeline priced its model's judgment at fetch scope

A maturity scanner reads a repository over an API, selects files with a ranked
picker, plans which selections a byte budget pays for, fetches them, and then asks a
model to score nine dimensions and to cite file paths for the facets it asserts. The
snapshot carries a `coverage` figure, and that figure is not decorative: it
multiplies the blend coefficient that decides how far the model's number may move
each dimension's score, it renders a "only part of the repository could be inspected"
caveat below 0.5, and it feeds a provenance hint that tells a reader "the ingest read
a fraction of the repository".

The figure had a term for transport success and a term for the byte plan's displaced
picks. It had none for the prompt's file window, which admits excerpts until a
character budget fills and then drops every remaining file with no record.

## Arm A, on the pipeline scanning its own tree

3,454 files listed, 31 selected by the picker, all 31 fetched, 0 displaced by the
byte plan — a clean ingest by both instrumented measures.

| | arm A | arm B1 (statement only) | arm B2 (statement + term) |
| --- | --- | --- | --- |
| files shown to the model | 14 of 31 | 14 of 31 | 14 of 31 |
| coverage | 0.85 | 0.85 | **0.38** |
| model's weight on every score | 0.51 | 0.51 | **0.23** |
| partial-read caveat | silent | silent | **fires** |
| scope stated to the model | no | yes | yes |

The 17 omitted files were the container and deployment manifests, the project's own
capability manifest, an API document and the entire end-to-end test directory. Any
dimension whose evidence lived only there was scored from an empty window by a
judgment carrying full-ingest confidence.

**Arm B1 is the finding that matters.** Printing the scope in the prompt is the
repair the rule prescribes literally, and measured on its own it changed no
consumer's output: same coverage, same weight, same caveat set, same warnings. The
statement is legible to the model and invisible to every deterministic consumer of
the judgment. A landing that stopped there would have claimed a win it does not
deliver.

## Controls

- **The figure is live**: under arm A's own unmodified code, adding ten displaced
  picks moved coverage 0.85 → 0.64, so the assertion was not reading a dead number.
- **The new assertions are red before the change**: 7 of 10 fail against the
  pre-change tree — three on the missing export, both *separate* assertions, the
  caveat threshold, and the prompt statement. The 3 that pass are the *agree*
  assertions, which is their job.
- **The floor, tested against itself**: with the window made to return nothing at
  all, six assertions elsewhere in the suite went red, so the suite can see a total
  window failure. It was entirely silent on the partial one at 14 of 31 — a floor
  that catches the catastrophe and not the defect.

## What the pair caught

The over-correction is a banner and a discount on every call. Asserted together on
one path: a file set that fits the window must produce a byte-identical prompt and
the identical coverage figure, while a set that overflows must lower the figure and
name the dropped paths. The first assertion alone is passed by the always-on banner;
the second alone is passed by changing nothing.

## The residual, stated

Threading the window's ratio into the ingest figure points a dependency from
ingestion toward the prompt builder. That direction is the finding restated — the
number cannot be computed without knowing the view — but the cleaner shape moves the
window arithmetic down beside the byte plan, which requires the content-sanitising
step to move with it.
