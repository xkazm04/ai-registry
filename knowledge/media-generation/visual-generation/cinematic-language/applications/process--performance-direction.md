---
layer: application
type: application
subject: cinematic-language
technique: performance-direction
status: forged
stack: process
verified_on: 2026-09-07
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A poster judge called an obedient clip frozen, and a frame ruler said otherwise

*Verified against the consuming tree at commit `e1c31ec` (the seam as read)
and `577524b` (the measure as shipped), 2026-09-07. The stack is a process —
a measurement lane run by hand — so there is no runtime version to verify
against; the interpreter the self-test gate ran under was 3.12.*

The amendment says a harness gets directed stillness wrong in two places: a
global anti-freeze negative argues against every request including the ones
whose contract is stillness, and a judge that reads three posters cannot see
a near-still clip move, so it calls obedience a defect. This application is
the recorded instance that produced the second half, measured after the fact
against the clips the harness kept.

## The instrument, and where the decision was made

The dojo video lane (`pipeline/foundry/dojo_video.py`, gravity) renders
seed-matched A/B duos of five-second clips through a local text-to-video graph
and judges them **from three posters** — first frame, midpoint, last frame —
each read back in words by a vision model, so that a blind chokepoint judge
"sees start, middle and end in words — enough to judge staging, light, and
whether ONE readable move happened" (its own docstring). Two decisions the
amendment governs are made in that file by default:

- **the negative** (`dojo_video.py:39`) is one constant for every request:
  "static frame, frozen image, no motion, jitter, flicker, morphing anatomy,
  extra limbs, …", encoded once and wired to every sampler call;
- **the judge's rubric** requires a move, and its only evidence is three stills.

The cycle `2026-08-31-video-compose` — the lane's first video cycle, run to
test motion-intent-authoring's claim that "ONE authored move with the
camera's behaviour stated" transfers from stills to motion — briefed one of
its two challengers as a near-still, in the technique's own phrasing: *"Motion:
almost still — a thin band of mist drifts a fraction to the right across the
ground; the window light flickers once; the camera does not move."* Its
baseline arm was the same scene as a bare sentence with no motion line.

The chokepoint judge picked the **baseline**, and gave its reason: *"B's three
readbacks describe the same frozen wide of a lit hut with nothing advancing."*
The clip that obeyed the direction was scored down for obeying. Nobody
arranged that; it is what a three-poster rubric does to a shot whose whole
motion is below what three posters can show.

## A and B, paired on the recorded clips

The measurable is whether the clip moved. Arm A is the harness's verdict as
recorded (three posters read back, judge picks). Arm B is a frame ruler: the
mean luma of the difference between consecutive frames at 320 px, averaged
over the clip, on the same four clips the harness kept. The ruler was
asserted before it was read — on a moving clip, and on a frozen floor built
by looping one of the clip's own posters through the same VP9 encode:

| clip | brief | arm A (poster judge) | arm B (mean frame delta) |
| --- | --- | --- | --- |
| frozen floor | one PNG looped, same codec | — | **0.000** (max 0.0025) |
| v1-reset-still challenger | "almost still, camera does not move" | "frozen … nothing advancing", lost | **0.210** |
| v1-reset-still baseline | bare sentence, no motion line | picked | 0.558 |
| v1-rung-advance challenger | "three slow steps, the camera holds" | lost (restaged, per judge) | 3.129 |
| v1-rung-advance baseline | bare sentence | picked | 8.547 |

Two arms over four clips, one instrument each, n=1 pair per claim. The
near-still challenger sits **two orders of magnitude above the frozen floor**
and at a third of its own undirected baseline — it moved, a little, which is
exactly what it was told to do. Arm A could not see that and said "frozen";
arm B can, and the number travels with its floor.

**The seam was chosen to falsify, and here is what a caught result would
have taught.** Had arm B put the challenger at the floor, the finding would
have inverted: the anti-freeze negative did not prevent freezing, and "almost
still" collapses to still at this model scale — a boundary on the directive,
not on the judge. It did not. The clip moved and the instrument was blind,
which is the amendment's second half confirmed by a seam that could have
killed it.

## Verdict: better

Frozen is a measurement the harness did not have and now does. The shipped
change (`577524b`) adds a stdlib-plus-ffmpeg ruler (`motion_energy.py`) with
the calibrated floor written beside the number, a third pre-filter command in
the lane's measurement script that writes it into the cycle's `measures.json`
next to the readbacks, and a self-test case pinning the three verdicts —
frozen, not frozen, unmeasured — under the gate that already runs without a
card. Seven cases green.

The negative was **not** changed. Removing "no motion" from a global negative
is a prompt change whose effect on dead-clip rate has no paired proof yet;
the ruler is what would let one be run, per shot, with the floor as the
predicate. That is the next experiment, not this one.

## What the tree could not have been built to prove

The cycle was designed to test a *different* technique's claim, and its
challenger quoted that technique's own example of near-stillness almost
verbatim. So the harness, built to measure whether the corpus's motion rules
transfer, penalised the one rule that says stillness is a direction — with a
rubric that had been written to catch dead clips. That the judge's reason
contains the word "frozen" for a clip at 0.21 is the structural fact: the
rubric's vocabulary has one word for "did not move" and "moved less than
three posters can show", and the negative prompt has the same word in the
same place. Neither was designed to conflate them; the poster sampling did it.

## What this realization cannot do

The ruler cannot say *what* moved: mist and a figure twitch score alike, and
a camera drift over a frozen world reads as motion. It judges nothing about
whether the move was the one briefed. It is one pair on one model family at
one resolution; the floor is calibrated to one codec setting and says so in
the file. And the human's pick is still the verdict in this lane — the number
is a pre-filter the judge reads, not a replacement for the judge.
