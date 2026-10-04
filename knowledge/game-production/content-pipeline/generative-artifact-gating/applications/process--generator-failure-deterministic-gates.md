---
layer: application
type: application
subject: generative-artifact-gating
technique: generator-failure-deterministic-gates
stack: process
status: forged
verified_on: 2026-10-01
---

# Process — deterministic gates ahead of local vision graders in a racer's art line

Read in the sibling art worktree of the racer project (`C:\Users\kazda\kiro\firetv-deathride-art`,
branch `deathride/art`, working tree partly uncommitted at read time, so the line numbers
below describe the working tree, not a commit). Paths are relative to that root. Nothing
here was felt by a human: every number is a measurement on a handful of test images, and the
thresholds are labelled provisional by their own configuration.

## The gates and where the thresholds live

`deathride/tools/art/process.py` holds the three gates; `deathride/art/gates.json` is the one
threshold authority.

- **Raw margin before trimming.** `process.py:64` computes the smallest distance from the
  subject box to a frame edge on the source image, `process.py:65` stores it as a fraction of
  the shorter side, and `process.py:69` appends `CROPPED_OR_MARGIN` when it falls under
  `source_margin_fraction` (0.03, `gates.json:4`). Its rationale cites the failing sample:
  `gates.json:22` "Provisional 3 percent: historical Bastion has only 16/1024 px right margin".
  The acceptance note states the consequence: `deathride/art/ACCEPTANCE.md:12` "Raw sprite
  margin is checked before trimming; a cropped source cannot pass by adding transparent
  padding."
- **Principal axis.** `process.py:76-80` takes the leading eigenvector of the foreground
  covariance and emits `AXIS_NOT_X` over ten degrees. `ACCEPTANCE.md:12` records the limit:
  "PCA measures an axis, never nose direction or camera projection", and `ACCEPTANCE.md:7`
  shows the Trail sample at 21.7407 degrees, with the local models independently noting a
  three-quarter view.
- **Repetition by autocorrelation.** `process.py:103-111` reduces to a 128-pixel greyscale
  copy, subtracts the mean, builds the circular autocorrelation from the power spectrum,
  normalises by the zero-shift value, masks shifts nearer than an eighth of the size, and
  keeps the peak and its shift; `process.py:117` emits `TILE_REPETITION` above 0.35 except for
  the kerb material, an exemption declared in code, not in the configuration.
  `ACCEPTANCE.md:9` "autocorrelation peak 0.95569 at half-height shift" is the asphalt
  failure; `ACCEPTANCE.md:10` shows oil at 0.41248 tripping repetition and both seam gates.

## What the model graders may decide

`deathride/tools/art/grade.py:85-103` is the whole decision function and its range is
`reject` or `owner-review`; there is no accept branch. Fewer than two graded answers returns
`VLM_UNMEASURED` (`:86`), any field disagreement returns `VLM_DISAGREEMENT` with no majority
vote (`:90`, `:93`), confidence under `vlm_confidence_min` returns `VLM_LOW_CONFIDENCE`
(`:91`), and a clean agreement ends at `OWNER_ACCEPTANCE_PENDING` (`:103`). The acceptance
note says it plainly: `ACCEPTANCE.md:27` "High self-reported confidence does not repair that.
Disagreement, low confidence, uncertainty, missing/schema-invalid output and missing human
calibration all route to the owner. Agreement never produces acceptance."

The schema failure is the upward lesson. `ACCEPTANCE.md:29` "The initial Qwen run emitted
confidence=100 despite a 0..1 schema bound. Those outputs failed closed." The repair
enumerated the allowed values (`grade.py:20`, `'enum':[0.0,0.25,0.5,0.75,1.0]` with the
description "Fraction, NOT percent"), which is stronger than a numeric range, and the raw
content was retained.

## Calibration claims, as the repo makes them

`gates.json:3` carries `calibration_status` "provisional; five historical tile samples,
executing-agent diagnostic labels, human calibration pending". `ACCEPTANCE.md:18` reports
that the seam threshold catches 3/3 labelled seams and falsely flags 0/2 and says it is
"training-set separation on five examples, **not held-out or human calibration**".
`ACCEPTANCE.md:20` labels the 30-image semantic set "**not owner or human labels**", and
the two local graders miss 5/8 and 1/8 defect fields (`ACCEPTANCE.md:24-25`).

## Deviations from the standard

- **Family independence is prose, not data.** `ACCEPTANCE.md:27` states that both installed
  models "report Qwen-family architecture, so they are not independent-family validation",
  but `grade.py:14` lists two models and `decide` treats agreement of the pair as a clean
  result with no family field to compare. The standard is to count families; here a person
  has to remember to.
- **The kerb exemption is in code** (`process.py:117`), where the standard puts every
  exemption in the configuration beside its rationale.
- **No human-labelled set exists**, so no false-accept rate is measured for any gate. The
  gates are shown to catch four named historical samples (`ACCEPTANCE.md:7-10`), which is
  recall on known failures, not a rate on unseen output.
- **Not measured at all:** owner quality, in-game look, and any live-device behaviour; the
  acceptance note itself lists them as unmeasured.

## Anchors that were approximate

The scout's `ACCEPTANCE.md:9-10` for the historical failures were lines 8-10 (Bastion on 8,
asphalt on 9, oil on 10). The confidence=100 note is on 29 as sent.
