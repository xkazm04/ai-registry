---
source: operator-verdict:velocity-join-sighted
kind: operator verdict (a sighted check of real motion seams, graded by the operator, plus one proof-row redesign decided the same day)
url: none
title: "Velocity join, sighted: the operator's seam grades and land decision, and the Flex six-step floor redesign"
author: operator, via /shift decisions (2026-11-11 seam grades, 2026-11-16 land answer and Flex answer)
words: 0
extracted: 3
accepted: 1
declined: 0
leads: 1
already_covered: 0
untriaged: 1
dispatched: 0
applied: 1
shipped: 0
run_id: shift-velocity-and-flex
siblings: 0
fetches: 0
---

# Velocity join, sighted: the join rule lands on two axes; the relative band stays the operator's

Board run `shift-velocity-and-flex`, a lander seat for two operator decisions recorded in
`.ai/shift/review/decisions-1116.json`. No video and no web read. The origin is cluster
`generated-mesh-to-moving-asset`
([2026-11-10-generated-mesh-to-moving-asset](2026-11-10-generated-mesh-to-moving-asset.md)),
where row M-M2 cleared 3/0/2 and was held by the render clause for a sighted verdict.

## What arrived

**The sighted check** (`.ai/shift/replicas/velocity-join-sighted/`, built 2026-11-11, CPU only).
27 real seams from a CC0 motion library and earlier replica renders, sampled at 30 fps by a
dependency-free glTF evaluator over the 22 body bones two rigs share, root-relative to the pelvis,
and measured with pof's own loop-closure formulas and default bands (pose RMS 10/40 mm, worst joint
25/80 mm, velocity jump 15/50 mm). Of 27: both pass 19, pose pass with velocity fail 1, pose fail
with velocity pass 4, both fail 3. Eight were shown with clips, stick figures and per-frame charts.

**The operator's grades** (`verdict.json`, 2026-11-11, sighted). The dispatch and the 11-11
report say 6 pop. `verdict.json` holds **5 pop, 2 fine, 1 can't tell**, and this note follows the
file.

| Seam | Pose RMS / worst (mm) | Velocity jump (mm) | In-clip change p95 / max (mm) | Fixed bands | Jump / p95 | Operator |
| --- | --- | --- | --- | --- | --- | --- |
| walk loop wrap | 0 / 0 | 24.2 | 8.3 / 17.8 | velocity warn | 2.9x | fine |
| formal walk loop wrap | 1.2 / 5.7 | 31.0 | 8.4 / 19.6 | velocity warn | 3.7x | can't tell |
| jog loop wrap | 1.0 / 4.1 | 77.3 | 65.9 / 95.7 | **velocity fail** | 1.17x | **pop** |
| walk retargeted, loop wrap | 0 / 0 | 7.3 | 7.3 / 7.3 | pass | 1.0x | **pop** |
| splice jab to cross | 0 / 0 | 1.2 | 71.1 and 40.2 | pass | under 0.1x | fine |
| splice idle to walk | 144.1 / 399.7 | 14.4 | 0.3 and 8.3 | pose fail | 1.7x of the walk side | pop |
| splice attack to idle | 151.5 / 366.8 | 1.6 | 174.3 and 0.3 | pose fail | small | pop |
| splice walk to jog | 255.8 / 700.7 | 83.2 | 8.3 and 65.9 | both fail | 1.3x of the jog side | pop |

**The land answer** (2026-11-16): `yes-relative`, "yes, but grade the jump against the clip's own
in-clip motion, not a fixed mm band". The 11-11 page had called the jog's fixed-band fail "possibly
a false alarm" before the grades came in.

## Promotion read (pof at ccbe02aea, read only)

- `src/lib/motion-gate/loopClosure.ts`: three axes, pose RMS, worst joint and velocity jump, each
  banded pass/warn/fail with defaults 10/40, 25/80 and 15/50 mm. The verdict is the worst axis, never
  a mean. A one-shot returns `n/a`. The docstring: "Poses can match exactly while the clip still
  stutters, so this is a separate axis." Confirmed.
- `scripts/visual-gen/ardy/pof_loop_closure.py`: the metric. Root-relative (root track, or joint 0
  as fallback); `vel_jump = rms((rel[1]-rel[0]) - (rel[-1]-rel[-2]))` in mm. The sighted page used
  this definition. Confirmed.
- `src/lib/motion-gate/seamConstraints.ts`: both endpoint pins required ("pinning only the last
  frame made the seam worse (141.8 -> 153.5 mm)"), plus a velocity-matched frame at T-2 that "halved
  the seam velocity jump (29.28 -> 15.73 mm)". Confirmed.
- `scripts/visual-gen/ardy/pof_npz_concat.py`: re-anchors root XZ per clip, refuses mixed fps and
  joint counts, and measures no seam. Confirmed.

**What the read contradicted.** The relative band. On the five graded seams that pass on pose,
the operator's two pops sit at 1.17x and 1.0x of the clip's own p95 frame-to-frame change, and the
fine walk wrap sits at 2.9x. Any relative threshold that flags the jog flags the fine walk first.
The fixed bands were the better discriminator here: they failed the jog the operator saw pop, and
only warned (did not block) on the walk wraps. Neither rule caught the retargeted walk, a pop where
pose and velocity both pass. One reading keeps the relative band alive: the jog clip has its own
95.7 mm spike every cycle, mid-clip, and on a looping preview a viewer cannot tell that spike from
the wrap. That is the discriminator for the operator (below).

## Triage (Phase 5, accept at G-R >= 3 and G >= C; **+3 governed both rows**, the shift's raised bar)

| # | Row | Shape | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- |
| V1 | A join (loop wrap, splice, generated in-between) is accepted on pose and velocity jump at the seam, graded apart, worst wins; a pose pin leaves velocity free, so carry velocity into a regenerated join; routes in order: producer continuation, regenerated join, measured splice; a crossfade is the baseline; the jump is reported with the clip's own frame-to-frame change as its basis | technique | real gap | 3/0/2 | **accept**, landed as `join-seam-continuity` |
| V2 | Grade the velocity jump against the clip's own within-clip frame-to-frame motion, not a fixed band (the operator's `yes-relative`) | technique clause | contested | 3/3/1 | **untriaged**, the operator's call |
| V3 | Seam measure inside pof's concatenation and a relative band in `loopClosure.ts` | application | proposal | - | **lead**: pof code is not changed by this seat |

**V1, raw 3 - 0 = 3.** GAIN 2 (a new technique; `motion-quality-gating` is outside
`librarian-scan --top 15` today) +1 convergence (pof's 2026-08-19 measuring run and the 11-10
vendor demo reached the rule apart; the operator's sighted grades add a third, independent of both:
the one pose-pass seam the velocity axis failed is the one the operator saw pop). RISK 0: the seat
opened all four pof files above. Append only: every sentence in the golden path and its seven
techniques stays true. COST M. It clears. The wording changed from M-M2's draft in two places, both
from the read: "accepted on velocity, not on pose" became "on both axes, worst wins" (the splices
the operator saw pop were caught by pose, and the velocity axis alone would have passed two of
them), and M-M3's both-neighbour fill (untriaged 2/1/1) is not named as its own route; only the
regenerated join that pof measured is.

**V2, raw 3 - 3 = 0.** GAIN 2 +1 (the same convergence). RISK +2 rewrite: the subject's
`montage-budget-and-root-motion-lint` says "This is the one place in this subject where a relative
comparison is correct", and a relative seam band makes that sentence false. +1 the evidence
contradicts itself here and the seat had to pick a side: the operator answered relative, and the
operator's own grade on the jog is a pop that only the fixed band caught. Rejected by the score, so
**recorded untriaged, never declined**. The technique records the band as unsettled, puts the jump's
basis (the in-clip p95 and max) beside every number, and asks that the band be chosen per clip
family from graded seams. That much is the "report the basis" law, not a relative verdict.

**The discriminator, for the operator.** One sighted look settles V2: the jog wrap shown with the
seam isolated (the two seam frames slowed and repeated) against the jog's own mid-clip 95.7 mm
spike, isolated the same way. If the operator sees the pop at the wrap and not at the spike, the
fixed band was right and V2 stays unlanded. If the pop is at the spike, the 11-11 grade measured the
clip, not the seam, and V2 re-scores without its +1 contradiction: 3/2, still short while the
montage sentence stands, so it lands as a scoped rewrite on the operator's word.

## Phase 6b

M-M2 was held by the render clause on 11-10 because it changes how a clip is accepted. The verdict
it owed was sighted: does a join that passes on pose and fails on velocity read as a hitch? The
operator's grade answers it, yes, once, on the jog wrap (n=1 in that class; 1 of 27 measured seams
is in that class). The landing rests on that verdict, not on a video.

## Phase 7.5

`join-seam-continuity` x pof, mode `experiment`, grader operator, verdict **better**. Seam:
`loopClosure.ts` (pose-plus-velocity, already there for loops) and `pof_npz_concat.py` (no seam
check). Arm A: pose only (and, at concatenation, nothing). Arm B: both axes with pof's bands, worst
wins. Read from the operator's grades on the 8 shown seams. Target: pops accepted. A accepts 2 of
the 5 pops (jog, retargeted walk); B accepts 1 (retargeted walk). At concatenation, A measures none
of the 4 splices and B rejects the 3 the operator called pops. Floor: no seam graded fine is
rejected. B blocks neither the fine walk wrap (warn) nor the fine jab splice (pass). Held. The
retargeted walk escapes both arms, which is why the technique keeps the perceptual gate on the seam.
No application document: pof is not changed by this seat, and the proposals below are the seam.

## The Flex six-step row (decided the same day)

Row `shift-proof-h3-flex-fl2va-6step` was refused on 11-11 at render-triage's discrimination
gate: the arms differed by 4.632 (mean abs RGB, 320x176, all 124 frames) against 38.383 for arm A
at a second seed, 0.12x where the gate needs 1.5x. The second seed redrew the scene (the camera
pushes in), and the claim is an equivalence claim. The operator answered `redesign-floor`. The row
is rewritten by id in the bank. What the tool supports, read at `scripts/render-triage.mjs`: one
gate, `between >= 1.5 x within`, with `within` documented as the same approach "at a second seed";
a manifest-supplied pair of numbers, no metric of its own, and only `--allow-indistinct` and
`--reseal` as flags. **It has no equivalence mode**, and render-proof.md's verdict table maps a tie
on a pair that passed to `unmeasurable` for quality. The redesign therefore stays inside the gate:
the floor becomes arm A re-rendered at the **same** seed (run-to-run noise with the composition
pinned), which is what gpu-bank.md's "pin the scene" and render-proof.md's "control from the arm
that holds the channel fixed by design" point at. What each result will mean is written into the
row before anything renders, including the case where the rerun is bit-identical and the gate says
nothing. The 11-11 arm A and arm B clips are reused, so one clip renders.

## Leads

1. **Seam measure in pof's concatenation, and the band question in `loopClosure.ts`** (V3,
   proposal; pof not edited). `pof_npz_concat.py`: run the `pof_loop_closure.py` measure at every
   join (last two frames of clip k against the first two of clip k+1, root-relative after the XZ
   re-anchor) and journal pose RMS, worst joint, velocity jump and each side's in-clip p95 and max
   beside `POF_SECTION_STARTS`. `loopClosure.ts`: carry the in-clip p95 and max in `LoopMetrics`
   and in the reason string, so a card shows its basis. A relative band (`velJump` against k x
   in-clip p95) stays behind the operator's V2 answer. *Return when* the operator answers the
   discriminator above, or pof's next combo montage is concatenated.

Phase 7.7 skipped: gate=skipped.
