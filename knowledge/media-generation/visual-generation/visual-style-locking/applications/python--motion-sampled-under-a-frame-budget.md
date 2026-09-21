---
layer: application
type: application
subject: visual-style-locking
technique: motion-sampled-under-a-frame-budget
stack: python
status: reconciled
applied: code
ab_verdict: better
proof: ab-paired
verified_on: 2026-09-14
verified_against: python@3.14
---

# Two readers, six sources, six palette disagreements, and the number that settled four

`verified_against` is read from the stack the tree **witnesses**: the interpreter
pinned by the blocking job in its CI workflow, which runs the pipeline's
stdlib-only selftest. The case added here runs in that job.

## The seam

A content pipeline builds a style library from reference footage. Ingest cuts
each source at detected scene changes and publishes the kept frames with a
timestamp each. A second step then profiles each source's art style by showing
eight of those frames to two vision readers at once, one local and one hosted,
and asks each for a closed set of observables, among them a palette category
(`monochrome`, `duotone`, `complementary-split`, `desaturated-naturalistic`,
`saturated-vivid`, `warm-cool-split`). The generator-facing recipe is written
from those answers.

That step makes both decisions this technique governs. It chooses which eight of
the published frames a reader sees, and it asks a perceiver for a value that
sits in the pixels.

## Arm A: the palette category, as the readers gave it

Six sources were profiled by both readers over the same eight frames. **The two
readers gave different palette categories for all six.** No run of either reader
is wrong in a way a prompt could fix: the same eight frames went to both.

## Arm B: the palette, measured over the same eight frames

The frames each reader was sent were re-derived from the step's own selection
rule, and the pick matched the recorded frame names for **6 of 6** sources. Over
those pixels: the share of hue-bearing pixels inside the densest 60-degree hue
window, the two densest 30-degree hue families, mean saturation, and the
near-black share. A second run of the measurement was byte-identical.

| Source | Measured | Readers | Settled? |
| --- | --- | --- | --- |
| 1 | 99.6% in one 60-degree window, cyan to blue | monochrome / duotone | yes - one hue family |
| 2 | 86.8% in one window, greens | monochrome / duotone | yes - one hue family |
| 3 | teal 41% + orange 24%, mean saturation 0.32 | saturated-vivid / complementary-split | yes - a complementary pair at low saturation |
| 4 | red 25% + green-teal 20%, 36% in any window, saturation 0.31 | saturated-vivid / warm-cool-split | yes - a split at low saturation |
| 5 | 98.7% in one warm family, saturation 0.32 | monochrome / desaturated-naturalistic | no - both categories describe it |
| 6 | magenta 31% + blue 21% | duotone / warm-cool-split | no - both categories describe it |

**Four of six disagreements are settled by the measurement.** The other two are
not undecided because the number is missing. The categories overlap: a single
warm hue at low saturation is both monochrome and desaturated, and the enum
never said which wins. That is the technique's boundary between values and
categories, found in a tree rather than argued.

## The sampling, declared

The same row now records what the step picked from:

| Source | Kept of available | Stride |
| --- | --- | --- |
| 1, 2 | 8 of 17, 8 of 16 | 2 |
| 3, 5, 6 | 8 of 30 | none - gaps of 3 and 4 |
| 4 | 8 of 36 | none - gaps of 4 and 5 |

The selection was described in its own code as a spread across the runtime. It
was even for two sources of six. Nothing was wrong with the pick. What was
missing was the sentence saying so, which the technique requires.

## The change

A new stdlib-only module holds the selection rule, unchanged so that old and new
rows stay comparable, and returns it with the kept, available, stride and gaps.
It also holds a pure palette measurement over pixel tuples, with the image
library imported only inside the function that opens frames, so the gate can
exercise it without installing anything. The profiling step writes both beside
the readers' answers. The selftest gained one case: the pick is the historical
one, an uneven stride is declared, a teal-orange split is half in any window and
names both families, and a frame of pure shadow reports its hue as unmeasured,
never as an even spread.

Writing that case caught a defect in the first draft: a hue of exactly 180
degrees was binned at 179 and filed under the wrong family. The source-level
table above was re-derived after the fix.

## The structural fact

The pipeline already knew when each frame was taken and where each cut fell,
because ingest records both. The disclosure was lost one hop later, when the
profiling step re-sampled the published frames and wrote down only their names.
**Sampling information does not travel on its own between two stages that each
sample.** Each stage has to declare its own pick, or the second one erases what
the first one measured.

## What this realization cannot do

- It does not choose a category. It gives the reader of a disagreement the number
  that decides it, and where the categories overlap it decides nothing.
- It measures a 160 x 90 downscale of the frames, which is enough for hue
  families and saturation and not for fine texture or grain.
- It says nothing about whether a recipe written against the measured palette
  renders closer to the source. That needs a render pair, and no run has made one.
- It does not change which frames are picked, only what is said about them.
