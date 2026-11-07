---
source: batch
kind: batch
url: "youtube:6rIfkQ9vnvg, youtube:SRDQrFj8qAo"
title: "Previs camera lock, /shift batch of 2 videos from 2 channels"
author: "2 channels: Mira AI; Thomas Lundström"
words: 4629
extracted: 31
accepted: 0
declined: 0
leads: 5
already_covered: 13
untriaged: 11
currency: 2
dispatched: 0
applied: 0
shipped: 0
run_id: previs-camera-lock-1108
siblings: 2
fetches: 10
---

# Previs camera lock, mined under /shift, 2026-11-08

Plan `plan-20261107-120659`, cluster `previs-camera-lock`, board run
`2026-11-07-intake-shift-plan-20261107-120659-previs-camera-41372`. Two practitioner
build-walkthroughs, each mixed with a sponsored tour of the same hosted vendor. M = Mira AI (a
public prompt pack, 3,081 words, read in full by the miner; captions at the anchors). L = Thomas
Lundström (1,548-word transcript, a blog whose two render prompts were recovered from its editor
data, and an MIT-licensed blocking skill kit that was read and never run). Nothing on screen was
watched. Phase 7.7: gate=skipped.

**Expected yield, stated first:** catches against `motion-plate-library`, a few boundary rows, no
subject, and one replica per source. The core method (block in 3D, render the blockout, hand it to
the video model as the camera authority, re-dress it) was already mined twice, from two more
channels on the same vendor's method (`2026-09-09-blender-previs-to-video-reference`,
`2026-09-10-product-ad-blender-replication`). That held.

**Voices:** two channels, M and L, both sponsored by the same vendor. They are counted as two voices,
but their agreement is thin: they may agree for the vendor's reason. Neither mentioned the other's
material, and no row below takes the +1 for convergence on that alone.

**Admission:** the +3 accept bar holds for this shift. /intake Phase 5 Step 4 raised it after three
false positives across runs, and today's scorecard rows carry fp=1, 1, 1, 2 and 4. It governed every
scored row below, and none comes near it. `auto=0/11/0 fp=0`: neither miner accepted anything, so
nothing could fall at this read.

## What landed

Nothing in `knowledge/`. This note, its ledger lines and two held replica rows,
`shift-replica-r12-canyon-crossing` and `shift-replica-r13-agent-blocked-previs`. No project was
touched.

## Corrections to the plan

- **fl2va is the wrong pairing.** The plan pairs the depth patch with `minimax_h3_fl2va`. fl2va takes
  no reference images, only `first_frame` and `last_frame` (`nodes_minimax_h3.py` lines 132-133), so
  the cars' and robots' look would rest on words. Every depth-controlled run on this machine used
  ref2va with the ref2v 4-step LoRA (B11-r2, shift-ref-camera-1 arm b). **ref2va is the route.** The
  patch node calls itself a patch "to a text-to-video model" (line 584), so fl2va plus the patch is
  possible in code. It has never run, and it stays an open question for `clips-h3.py`.
- **"Previs has never carried identity" needs a qualifier.** shift-ref-camera-1 arm b (seed 7911)
  carried one reference image with the patch. Its positive control passed on position: one figure,
  centred in the mannequin's box at frames 30, 61, 92 and 120, by agent read. **Identity was never
  judged**, and two moving subjects were never tried.
- **The plan's 20 s replica is out of range.** H3 is trained on about 124-362 frames (node tooltips,
  lines 105, 131, 266), about 15 s at most, and a reference clip takes "2-15s" (line 275).
- **The reference-video route measured worse.** In shift-ref-camera-1, the path pair with a previs clip
  as `ref_video` was refused at 1.15x against the 1.5x floor. That clip took 247 s against 122-125 s for
  the depth-patch clips (124 frames, 864x480), about 2x the time. So a reference clip as the camera
  authority stays unmeasured, and both replicas use the patch.
- **"More than one shot"** belongs to L alone. M's source is one continuous shot.

## What the promotion read found

The lander re-read the primaries the miners saved (the pack's export, the kit's files, the two take
texts), the node source, the home documents in full, and the local evidence. No new web fetch.

| Claim | Primary or local text | Status |
|---|---|---|
| The wipe cut or invented a scene (M) | Pack Part 7: "The near-lens pass gave it too many featureless dark frames"; fix "move the 5s camera key slightly further from the road (z from 4.0 to ~6)" | **Confirmed as first-party prose.** Never watched, and no frame count is given |
| The final prompt has no camera language (M) | Pack Part 0: "our final prompt contains ZERO camera language"; the [7s-10s] beat says "The camera stays with the white car [...] rising slowly and widening" | **The source contradicts itself.** `movement-motivation` already draws the line |
| The kit blocks "first try" (L) | README line 13 and SKILL.md line 14: "With it, first try." Transcript [00:04:36]: "about 10 to 15 times" | **Contradicted by its author's own account** |
| The kit is MIT | LICENSE: "MIT License, Copyright (c) 2026 Thomas Lundström / Grove Media" | Confirmed. The replica writes its own code from the method |
| Take 2 re-describes beside the tag, inverting `reference-role-map` step 3 (L, row 6) | Take 2's added `Cast:` block sits before `Setup:` and the cuts. Each tag gets its discriminating body and wig: "only their bodies and wigs tell them apart". Take 1 had the tag mapping and no such block | **Narrowed.** The addition is in the map's position, not in the beats. Step 3 governs beats, and the decision rules already send identity blends to the map first. This is a map line that names the discriminator between near-identical references. Step 3 is not reversed. See row L6 |
| Under a depth control a proxy's colour carries nothing (L) | The patch encodes the control video through the VAE (`_fit_frames`, lines 427-429). A depth video has no colour channel to carry. A reference clip reaches Qwen every 12th frame (line 338, `FPS // 2`) | Confirmed by code. That is close to definitional, so it stays low |
| The control clip is fitted from its head | `_fit_frames`: `torch.arange(frame_count).clamp(max=frames.shape[0] - 1)` | Confirmed. A plate must have exactly the clip's length, so both rows assert the frame count with ffprobe |
| RTAI's logged failure is the class M1 targets | gravitone `trailer-clip/LESSONS.md` line 9: "A fixed-camera prompt did not hold where the shot asked for a character action near the camera: OR01, OR02 and OR04 left their CCTV angle" | **Confirmed, with a qualifier.** The logged failure was a *locked* camera. M1's plate moves. A held M1 shows that a plate pins a camera under near-lens action, and a locked plate is the easier case |
| clips-h3.py has no control input | gravitone 6331ec94, `clips-h3.py` line 30 `FRAMES = 124`, `graph()` line 113 builds fl2va with `first_frame` only | Confirmed |

## Triage

G/R/C are the lander's scores. The miner's score is in brackets where it differs. Voices: M, L.

| # | Voice | Claim | Shape, rule | G/R/C | Outcome | Reason or return condition |
|---|---|---|---|---|---|---|
| M1 | M | Build the camera as geometry, not words | technique | - | **catch** | `motion-plate-library` decision rule: "When the move is known before it is seen [...] build the blockout" |
| M2 | M | The prompt carries look and mood, never the move | technique | - | **catch** | `movement-motivation`: "When the camera is an input, the prose stops describing it". The source breaks its own rule, and the corpus's line governs |
| M3 | M | Re-skin by swapping sheets, camera untouched | technique | - | **catch** | `motion-plate-library` binding pass; B11-r2 held geometry in 3 of 3 styles |
| M4 | M | Author all views of a subject in one image | technique | - | **catch** | `approved-reference-sheet`; `multi-view-master-reference` |
| M5 | M | Crop a multi-view sheet before an H3 reference call | boundary amendment to `approved-reference-sheet`, Phase 5 | 1/1/1 | **untriaged** (0 < 3; render-bound) | One local render, R2's agent read. R12 crops by rule. Re-score if a second route shows the leak |
| M6 | M | Keep a sliver of scene visible through a full-frame wipe in a control plate | boundary technique for `motion-plate-library`, Phase 5 | 1/2/1 | **untriaged** (-1 < 3; render-bound) | First-party prose only. R3's words-only blackout held (agent read), which narrows the claim to length and channel. R12 counts the featureless run before any GPU and judges the wipe. A cut above a measured run and a hold below it is the local measurement this row lacks |
| M7 | M | Author a built camera path: travel while rotating, ease every key, aim across the path | technique, Phase 5 | 2/2/2 | **untriaged** (0 < 3) | "Never rotate in place" goes against `movement-motivation` step 3, where a pan is a glance with meaning. The other two rules converge with training data |
| M8 | M | Verify the plate before export | technique | - | **catch** | `verify-cheapest-artifact-first` rungs 1-3 |
| M9 | M | Overlapping subjects differ on every glance channel | boundary technique, Phase 5 | 1/2/1 | **untriaged** (-1 < 3) | `reference-role-map` handles blending by role scope, not by designing the subjects apart. R12's mapping line tests it indirectly |
| M10 | M | End the prompt with what is forbidden | technique | - | **catch** | `process--trial-matrix-design`: in-prompt negation was neutral on local H3 |
| M11 | M | Time-code the beats | technique | - | **catch** | H3 guide timestamp form |
| M12 | M | Draft cheaply first | technique | - | **catch** (closed) | The operator closed draft mode (film-draft-1, -2) |
| M13 | M | Drop lettering from moving surfaces | technique | - | **catch** | `verbatim-text-locking` architecture rule |
| M14 | M | Keep the scene, version every export | technique | - | **catch** | `motion-plate-library` "When the plate was built, the scene is the asset" |
| M15 | M | Hosted scene-agent behaviour, Nov 2026 | currency, corroboration table | n/a | **currency, no repo file** | One sponsored voice about a hosted tool we don't use. Blender stands in |
| L1 | L | Previs is the sole camera authority; re-dress it | technique | - | **catch** | `motion-plate-library` built previz; the 09-09 and 09-10 runs |
| L2 | L | Count the notes rounds an agent needs to block | lead | n/a | **lead** | R13 logs rounds against a computed checklist. Its count is agent self-review, not human notes, so it does not compare one-to-one with L's 10-15 |
| L3 | L | Gate a blocked camera before building, in frame widths | technique, Phase 5 | 2/2/2 | **untriaged** (0 < 3) | RED's primary corrects the kit's lens-blind degrees-per-second cap. Nothing shows a fast blocked pan breaks a depth-controlled take. R13 reports its pan rate per shot and does not tune it |
| L4 | L | Rig presets set the gate numbers | technique | 0/2/1 | **untriaged** (-2 < 3) | The author's numbers, no primary |
| L5 | L | Under a depth control a proxy's colour carries nothing | boundary amendment to `motion-plate-library`, Phase 5 | 1/0/1 | **untriaged** (+1 < 3) | Confirmed by code and close to definitional. Banked: it binds R13, which gives identity through pictures and position words |
| L6 | L | Near-identical references need their discriminator named beside the tag | boundary amendment to `reference-role-map`, Phase 5 | 1/2/1 [3/2/1] | **untriaged** (-1 < 3) | The promotion read narrows it. The miner scored an inversion of step 3, but take 2's `Cast:` block is a map line naming what tells same-costume references apart, and the beats still use labels. The effect rests on one creator's report on another vendor's model. The local A/B it needs is below |
| L7 | L | End every beat with state accounting | technique | 1/2/1 | **untriaged** (-1 < 3) | Source prose only. Used inside R13's prompt as the "End of shot" lines |
| L8 | L | Give each unblocked element a containment rule | lead | n/a | **lead** | Partial convergence with one gravitone lesson ("workers" drew humans where the sentence did not say robots) |
| L9 | L | Disown a multi-view sheet's layout | technique | - | **catch** | The model is the discriminator: L disowns the layout in prose on the vendor's model, and R2 crops on local H3. Recorded with M5 |
| L10 | L | Leave fluids as black gaps | lead | n/a | **lead** | No home, no measurement |
| L11 | L | One continuous take carries several cuts; fit it to the model's length | currency, corroboration table | n/a | **currency, no repo file** | For local H3, at most about 15 s. R13 runs 294 frames |
| L12 | L | Land a camera hold on a decelerating approach | technique, Phase 5 | 2/1/1 | **untriaged** (+1 < 3) | A first-party measurement (57 mm against 4.8 mm), and spline behaviour agrees. Used in R13's block.py |
| L13 | L | Blender 5.2 API traps for scripted blocking | lead | n/a | **lead** | An application only once a wired tree hits it. R13's block.py may |
| L14 | L | The kit's solver gates one subject only | lead | n/a | **lead** | R13's checklist counts every figure |
| L15 | L | Draft cheaply, regenerate the keeper | technique | - | **catch** | `resolution-as-stage-property`; closed by the operator |
| L16 | L | The published prompts are far shorter than the kit's form | technique | 0/2/1 | **untriaged** (-2 < 3) | Which prompt was a draft is inferred from editor data |

Every scored row fails the +3 bar. None is declined, and each is banked with its anchors in the
miners' reports.

**Where the voices chose opposite defaults:** for a multi-view sheet, L disowns the layout in prose
and our H3 runs crop it (M5, L9). The discriminator is the model route: the vendor's model in the
source, local H3 ref2va here. M's camera-silent rule and its own [7s-10s] beat disagree, and the corpus
line governs.

### The A/B row L6 needs (named, not banked)

Two robots in one H3 ref2va call, built from one shell and differing only in two marks: lamp colour
and one dent. Each robot gets a single-view reference. Both arms use the same seeds, the same plate
and the same beats, which say only the labels. Arm a has map lines that give each robot its picture
label only. Arm b adds, on each map line, the one mark that tells the robot from the other. That is
row L6's claim. An optional arm c names the mark in the beats instead, which is the reading step 3
actually forbids. The measure is confined to what differs: per sampled frame, how many frames show a
swap, a merge or a duplicate, by a fresh read of crops around each figure. A count gives the floor
across seeds. That row waits until RTAI needs near-identical robots in one shot. Its police are meant
to be identical, so the case does not arise yet.

## Leads

- **Agent blocking rounds** (L2, L14). Return condition: R13's round log and verdict.
- **Containment rules for unblocked elements** (L8). Return condition: a second local sighting
  beyond the trailer's "workers" lesson.
- **Fluids as black gaps** (L10) and **Blender 5.2 traps** (L13). Return condition: a wired tree that
  blocks fluid, or that scripts actions or FFMPEG output in 5.2.

## Held rows

Both rows are `kind: replica`, GPU, `machine: Lynx`, and each carries `render.use`. Both use models
on disk only, stills from Codex CLI `image_gen`, and our own cast with no third-party IP. Run R12
first: it tests the same patch on one continuous move at a smaller size, and R13 stops before its GPU
steps if R12 records an out-of-memory stop.

- **`shift-replica-r12-canyon-crossing`, about 35 GPU min at most.** M's exact scene and camera keys,
  converted to Blender's axes, rendered on the CPU as depth, grey and occluder-mask passes of 243
  frames. Before any GPU time it counts the featureless wipe frames from the mask. Over 12 frames
  applies the pack's own fix and re-counts. Then one ref2va take with the depth patch and five
  single-view references (car sheets cropped to single views), and a second take only if the first ran
  clean. Out of memory at 243 frames makes it a lead, with no fallback to a short clip. Use: RTAI's
  logged camera drift, OR01, OR02 and OR04.
- **`shift-replica-r13-agent-blocked-previs`, about 60-70 GPU min for at most 3 takes.** The runner
  writes its own blocking script and blocks a 4-shot, 12.25 s (294-frame) police search
  unattended. A checklist computed in Blender covers counts, the crane occlusion, cut frames, lens
  distance, frame fraction and pan rate. Each round is logged, capped at 15. The take is one
  depth-controlled H3 ref2va generation with R2's stills plus one new Codex still of the police back
  with no lettering. Use: RTAI brief item 4, and a possible blockout stage in `/trailer-clip`.

**No overlap.** R12 is one continuous move, with a geometry-driven wipe, two cars, hand-specified
blocking and no cuts. R13 is agent-blocked, with three hard cuts, a three-figure count and an
occlusion. They share only the route, and R12's memory outcome gates R13's GPU steps.
`shift-replica-r10-robot-form` (the cinematic lander's R-cpf-K1) is two robots trading lines,
a two-arm prompt-form test with no geometry and no control video. Neither row here has speech or
varies the form: both use the six-section form fixed. R13 shares K1's Rivet stills and none of its
questions.

## Phase 7.5, 8 and 9

- **7.5:** nothing landed in the upper layers, so no applied row is owed. Both replicas' project is
  gravitone (`/trailer-clip`).
- **8:** no project change. Proposed seams, for the operator after a verdict: `clips-h3.py`'s
  `graph()` gaining a control-video path on ref2va, and `/trailer-clip` gaining a blockout stage
  between keyframes and clips. The second is a new capability (E1), so it goes to Phase 7.6.
- **Proposals, not landed:** none at law, direction, XL or taxonomy level.
