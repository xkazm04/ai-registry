---
layer: application
type: application
subject: video-assembly
technique: generated-shot-sourcing
stack: python
status: forged
verified_on: 2026-09-22
verified_against: python@3.12
applied: render
ab_verdict: better
proof: ab-paired
grader: operator
---

# Python: a first-and-last-frame clip given three spans for one travel

This application tests the section *A clip pinned at both ends is paced by the
model, not by its span* on a local generation stack. The stack is a node-graph
server at version 0.33.0 under Python 3.12.1 (both witnessed from the running
process: the server's `system_stats` endpoint and the interpreter's own `--version`). It runs
an open-weights first-and-last-frame video model at fp8 with its 8-step turbo
adapter, driven from a Python harness that submits API-format graphs. The
consuming project already ran this model in a forward-chaining lane, and its
notes recorded one half of the finding before this test: an open-ended clip
"arrived by 40% of its length" and repainted the rest.

## What was rendered

- **One travel.** A continuous medium shot of an original character turning her
  head from camera toward a light shaft. The first and last frames were taken
  from a clip this stack had already rendered legibly in 73 frames. That clip is
  the positive control: the scenario is one the stack can compose, so a failure
  in either arm is about span and not about the brief.
- **One variable: span.** 22, 73 and 175 frames (all on the model's `17k+5`
  grid), at 672x384, 8 steps, the same prompt, the same keyframes, the same
  sampler, and two seeds each. That is six clips, 45-100 s apiece on one
  24 GB card.
- **Two pairs:** travel-sized (73) against short (22), and travel-sized (73)
  against long (175), each shown at both seeds.

## What was read

| Measure | 22 | 73 | 175 |
| --- | --- | --- | --- |
| displacement from frame 1, deciles 3-5 (% of own peak) | 54-85 | 54-78 | **40-59, flat** |
| largest frame step / median step | 1.4-1.6 | 1.7-2.2 | **3.0-3.9** |
| last frame to target (mean abs) | 0.017 | 0.016 | 0.016 |

Every arm reached the target frame, so the end channel held at every span. The
long arm spent its surplus standing still: the displacement stays flat through
the middle of the clip, and a single step near frame 130 is three to four times
the median. That step is the snap.

**Discrimination.** Distance between arms at matched normalised time, against
the same arm's seed-to-seed distance: 0.88x for short against sized and 1.16x
for long against sized. Both fall below the 1.5x gate, so the gate refused both
pairs as a basis for landing.

**Operator, blind.** Long against sized: sized on both seeds. The operator
overruled the refused ratio, and the pick matches the pre-read. Short against
sized: the short clip on one seed, the sized clip on the other. That split is
what a 0.88x ratio predicts, and it is recorded as `unmeasurable` for the short
side. The verdict above is for the long side only.

## What this cannot show

- One travel, and a small one. The short-span "it cuts" failure a practitioner
  reported for bridges was not reproduced, and a head turn is exactly the travel
  a model can compress. A large camera move or a change of place was not tested.
- One model, with the keyframe channel present in every arm. Whether a bridge
  built from masked pixels *without* the end-frame channel converges, which the
  same practitioner reported it does not, is untested here.
- Two seeds per arm. The long-side preference is 2 of 2, with no statistic
  behind it.
