---
source: youtube
kind: practitioner build-walkthrough (sponsored; tour half dominant)
url: https://www.youtube.com/watch?v=h_mR2BRibZ8
title: "New Insane AI Animation Workflow with GPT-6 Astra"
author: Stefan 3D AI
words: 2886
extracted: 14
accepted: 0
declined: 0
leads: 3
already_covered: 5
untriaged: 6
applied: 1
shipped: 1
dispatched: 0
run_id: yt3d2-hmr2
siblings: 0
intake_version: 2.9.0
---

# Agent rigs and animates from generated video references - second 3D render proof

Intake 2.9.0, the second run on the 3D path of Phase 6b, at the operator's request. A source
originates a finding; it never authorizes one. Captions `vtt/en.*`, 2,886 words, read in full.
Board: 0 siblings. **Same channel as eight existing pof pitfall entries and the registry's
2026-09-07 creature-workflow note**, so same-channel agreement is not independent corroboration
and the expected yield was low: catches against pof's own corpus, plus whatever this video adds past
the rigging rules the earlier run already produced.

**Declared focus (from the previous 3D run), applied before any pair was designed:** (1) secure a
usage context first - probed: none of pof's four candidate meshes carried an armature, so the run
built one; (2) state an attempt budget before driving an instrument - 3 per stage (rig, animate,
render) and 2 per video arm, fixed in the note before the first render; (3) read the managed
project's knowledge corpus during the seam hunt - done before extraction.

## Workflow recovered

1. Generate the creature in parts on a low-poly quad topology tier; assemble in the content tool
   [00:01:15-00:05:02].
2. A logically organised, optimised mesh is what lets an agent rig it without weight artifacts
   [00:02:07, 00:05:52].
3. One packed texture for a unit small on screen; team-colour crest as a separate object and
   material [00:04:12, 00:05:27].
4. **Generate animation reference videos and hand them to the agent to keyframe frame by frame**
   [00:06:17-00:06:42].
5. **Generate the reference at half speed, because the video model cannot make a clip shorter than
   3-4 s, and retime the result** [00:07:07].
6. Two generation iterations per animation; feedback twice per animation, by words and screenshots
   [00:06:42-00:10:53].
7. The agent drives the content tool through a command bridge and runs its own tests; ~30 min to a
   rig, ~2 h for all animations [00:07:58-00:10:53].
8. Exaggerate the tail at contact frames for readability; death legs "too symmetrical, cheating";
   an overlong idle cut to game length [00:09:38-00:12:35].
9. Turn left/right authored without new references; does not loop [00:11:19].

## Triage

Upper-layer rows scored; render-bound rows routed to Phase 6b; leads and currency admitted under the
corroboration table.

| # | Candidate, anchor | Shape | Prior art | Read | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | Generate in parts on a low-poly quad tier, 00:01:15 | technique | `image-to-3d-input-gating/part-cut-planning`; pof tier-and-budget entry | likely catch | Already covered |
| 2 | A logically organised mesh is what makes agent rigging work, 00:02:07 | technique | `mesh-finishing-for-engine-readiness/rig-preset-and-bone-remap-binding` (weights assumed solvable) | real gap | **Corroborated by this run's rig stage, shipped to pof as coverage; lead in the registry** (render-bound scope, no perceptual verdict) |
| 3 | **Generated video as the reference an agent keyframes from**, 00:06:17 | technique | `motion-quality-gating` gates footage for EXTRACTION, not as a keyframing reference; pof: text-to-motion + vision critic, no reference stage | real gap | **Phase 6b row 2: gate refused -> lead** |
| 4 | **Generate the reference at half speed and retime**, 00:07:07 | technique | `motion-sampled-under-a-frame-budget` holds the span arithmetic; nothing commissions a slower reference | real gap | **Phase 6b row 1: measured negative -> lead** |
| 5 | Iterate each animation twice with screenshot feedback, 00:09:38 | technique | `bounded-refine-iteration`; `review-iteration-loops` | likely catch | Already covered |
| 6 | Exaggerate a part at contact frames for screen-size readability, 00:10:03 | technique | `six-dimension-motion-rubric` (silhouette) | partial | Untriaged |
| 7 | Team colour as a separate object and material slot, 00:05:27 | technique | `imported-material-conformance` | thin | Untriaged |
| 8 | One packed texture for a small on-screen unit, 00:04:37 | technique | `shader-budget-authoring` | thin | Untriaged |
| 9 | The agent runs its own tests on the animation, 00:09:13 | technique | `unattended-build-loop/no-gate-self-certifies` | likely catch | Already covered - **and this run measured it** (below) |
| 10 | Turn animations authored without a reference, 00:11:19 | technique | none | thin | Untriaged |
| 11 | ~30 min to rig, ~2 h for all animations at high effort, 00:09:13 | dated fact | `production-pipeline-phasing` | thin | Untriaged |
| 12 | Organic creatures generated, not built from primitives, 00:00:50 | boundary | pof construct-vs-generate rule | likely catch | Already covered (same channel - not independent) |
| 13 | The video model cannot make a clip under 3-4 s, 00:07:07 | currency | none | dated | Untriaged |
| 14 | Cut an overlong idle to game length, 00:12:10 | technique | `montage-budget-and-root-motion-lint`, `genre-response-latency-norms` | likely catch | Already covered |

Admission: `auto=0/9/2` (two rows escalated to render proof), `fp=0`.

## Render proof

**Instruments proven:** image-to-video with first-frame conditioning (~60-76 s per 3 s clip);
Blender 4.2.1 headless with the bundled metarigs (human, quadruped, cat, wolf, horse, bird, shark);
three director harnesses whose measurables were written into their docstrings before any arm
existed, each asserted on a planted control where one was possible.

**Subject:** one unrigged pof character mesh (an armoured brute with a fused axe and shield), chosen
from rendered stills for a readable overhead chop and a near-neutral pose. No non-humanoid rigged
asset exists locally. The fused axe and shield were recorded as a confound before rigging.

### Row 1 - half-speed reference: the claim did not hold

The same still and brief, normal speed versus "slow motion, at half speed". Pre-registered
measurable: the strike span, the run of frames around the motion-energy peak above half the peak.

| Brief | Strike span, seeds 1 / 2 / 3 | Peak transition |
| --- | --- | --- |
| normal | 12 / 5 / 5 frames | 29 / 44 / 35 |
| half speed | 5 / 4 / 11 frames | 53 / 39 / 19 |

The first gate refused the pair (23.9 against a seed floor of 32.82). A three-seed extension was
pre-registered before it rendered: supported only if every half span exceeds every normal span. The
sets overlap completely, and an interim reading from one pair (peak "about a second later") did not
survive the extra seeds. **A speed instruction written as prose did not control speed on the local
model.** The trick is sound only where the generator honours it - `typed-input-owns-its-channel`
seen from the other side: speed in the prompt competes with nothing that owns the channel, where a
duration or frame-rate input would.

### Stage 1 - rigging, and the finding that shipped

One agent rigged the mesh to 2.0 m on the basic-human metarig. **Automatic weights failed outright**
on the imported mesh - split along its seams into 571 pieces, no solution, every vertex unweighted -
and succeeded only on a copy welded within 1 mm, with weights transferred back by position. The
budget of 3 attempts ended with a tear: one strip of faces joins the right fist to the thigh armour,
so raising the arm stretched ~500 edges past twice their length. **The operator approved one
over-budget fix.** Splitting 396 joining faces thinned the tear (507 -> 475 stretched edges) and moved
damage into the axe: a few dozen haft vertices were left weighted mostly to the thigh.

That is the source's own warning - a model generated as one solid piece causes weight problems -
reproduced by an independent agent on a fleet asset, with the mechanism measured. It shipped to pof
as a rigging pitfall; see `librarian/applied.md`.

**Two rig-report claims were contradicted by later instruments.** The rigger reported the attempt-3
axe as 100% on the hand; a per-vertex probe of the saved file found 733 of 765 axe vertices below
95% hand weight and 718 displaced by more than 5 cm at a raised pose, against 25 and 25 on attempt 4.
So attempt 4, the rig the operator had approved, was also the better one. Separately, one animation
agent reported zero foot movement "on any sampled frame"; the harness, measuring every frame, found
1.7 and 1.3 cm - the drift lives between keys. **An agent's own checks certified work that an
independent instrument did not** (row 9's catch, measured).

### Row 2 - reference keyframing: within agent variance

Four independent agents animated the same chop on the shared rig: two from the brief alone, two from
a declared 9-of-73 strip of the half-speed reference (stride 9), warned about the reference's two
defects (the shield hides the head at the top of the windup; the recovery is two-handed).

| Pair | Distance | Floor (larger replicate) | Ratio |
| --- | --- | --- | --- |
| text-only vs reference (shown pair) | 4.64 | 5.09 | 0.91 |
| replicate pairing | 5.41 | 5.09 | 1.06 |

Refused, not shown. What the reference did change, structurally: both reference arms are shorter
(48 and 60 frames against 66 and 70) - the retime the brief invited - while reach, key count and foot
contact overlap. **On this rig the reference moved timing, not the poses a strip can show.**

**Cleanup:** after both rows closed and the pof commit, the run's scratch directory (233 MB: nine
reference clips with every frame, the rig in four attempts, four animation arms and their renders,
harnesses) and the generation server's output for the run id (142 MB) were deleted, with the staged
input still and the ingested transcript - 375 MB in all. Every 3D output this run carried the run id,
so cleanup was scoped by name as the render-proof rule requires.

## Leads

1. **Video reference for agent keyframing (row 3).** Within agent variance on a rig with a visible
   defect; the reference shortened the action. Return: a clean rig from a parts-generated mesh (the
   source's step 1), where a perceptual pair can be judged without a tear in every frame.
2. **Half-speed reference generation (row 4).** A measured negative on the local model. Return: a
   generator exposing speed or duration as a typed input, or the source's own model measured with the
   same span protocol.
3. **Organised mesh before agent rigging (row 2).** Corroborated at code level and shipped to pof;
   registry placement waits on a perceptual verdict. Return: a second fleet asset rigged, or a subject
   decision for where generated-mesh rigging preconditions live.
