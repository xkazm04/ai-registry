---
source: youtube
kind: video
url: "youtube:YimPUrc29gU"
urls:
  - https://www.youtube.com/watch?v=YimPUrc29gU
  - https://docs.blender.org/manual/en/latest/grease_pencil/modifiers/generate/line_art.html
  - https://docs.blender.org/manual/en/latest/grease_pencil/modes/draw/stroke_placement.html
  - https://developer.blender.org/docs/release_notes/4.3/grease_pencil/
title: "Line art over 3D in Blender, /shift batch of 1 video from 1 channel"
author: "1 channel: Summer Day Studios (first note from this channel; first-party practitioner, a Maya user's first look at a Blender feature)"
words: 1967
extracted: 7
accepted: 0
declined: 0
leads: 3
already_covered: 2
untriaged: 2
currency: 0
dispatched: 0
applied: 0
shipped: 0
held: 0
run_id: shift-1120-la3d
siblings: 2
fetches: 4
rescan_when: the operator reopens 3D-layout keyframes (previs, closed 11-08 as R13) or picks an inked look for a multi-cut story; or the corpus opens a stylised or non-photoreal rendering subject; or 8 weeks elapse (2027-01-15)
---

# Line art over 3D in Blender, mined under /shift, 2026-11-20

Plan `plan-20261120-104354`, cluster `line-art-over-3d`, board run `shift-1120-la3d`. The question:
can a 3D model render as hand-drawn line art in Blender, and what does the setup need on our version?
One miner read the transcript in full, fetched three primaries and probed Blender headless on the CPU;
the lander re-read the saved primaries at the quoted lines and re-ran the 5.2.2 probe. No GPU, no
render, no download, no ComfyUI contact. Phase 7.7: gate=skipped.

- **S** = `youtube:YimPUrc29gU`, Summer Day Studios, "Make Your 3D look HAND DRAWN With Grease Pencil"
  (1,967 words, 8:56, uploaded 2026-11-09). He calls it "not so much a tutorial" [00:01:42] and the
  feature "not new by any means, but it's new to me" [00:08:10].

**Class and expected yield, stated first:** a first-party practitioner account with a feature-demo
half. The demo (aircraft, cross-hatching, praise for the look) yields nothing; about five sentences on
what went wrong while setting it up are the material. Expected: zero or one technique, more likely
leads. That held: 0 accepted, 3 leads, 2 catches, 2 untriaged.

**Voices.** One channel, so no convergence on any row.

**Admission.** The **+3 bar** governed the rows that carry a Phase 5 score (1 as an amendment, 3, 4,
5). It comes from `/intake` Phase 5 Step 3 (its v2.21 paragraph) and Step 4 as they stand, read against
`SCORECARD.md`: the last nonzero entry is 2026-11-19's fp=1 (`layout-decision-placement`), and no
rejected row is recorded as re-derived by a later run, so the step-down to +2 has not fired. A step is
a method edit, never a lander's setting. No scored row would clear +2 either; the highest is +1.
Leads ran under the corroboration table. `auto=0/2/0 fp=0`: the miner accepted nothing, so no accept
died here.

**Replication.** The source shows finished work (a line-art aircraft with hand-drawn hatching), so
`replication.md` applies. The description carries no prompts, shot list or project file; it links a
studio site and a storefront, not followed (no sign-up, no purchase). The method is the transcript's
menu steps and three values (radius 0.002, 0.1, 0.05). Blender 5.2.2 ARM64 on Lynx has every step; the
line-art half is scriptable headless, and the draw-over half is a person with a brush. **No replica:**
the two uses that would earn one sit on closed or dropped lines (previs R13 closed 11-08; the r19 3D
style kit dropped 11-19), and there is no GPU for proofs nothing would use (operator, 11-08).

## What landed

This note and its ledger lines. No corpus file changed, no project was touched, no row was banked.

## What the promotion read found

No row was an accept, so the read went to the facts the leads rest on: the saved copies of the three
primaries at the quoted lines, a re-run of the miner's headless probe on 5.2.2, the corpus homes the
miner named, the mage-arena retrospective line and gravitone's `music-clip` skill.

- **Held: the camera dependence is the occlusion default, not a limit.** Re-run on Blender 5.2.2 LTS,
  `--background --factory-startup`, CPU only: one cube with an object Line Art modifier gives
  **0 strokes with no scene camera and no error, 2 with an active camera, 5 with the occlusion range
  raised to level 3.** Defaults read from the modifier: `level_start` 0, `level_end` 0,
  `use_multiple_levels` false, `use_custom_camera` false, `radius` 0.0025. The manual: "the scene must
  have an active camera. The generated lines are only generated on portions of the object that a
  visible from this camera", and Occlusion Level "A value of 0 means visible lines (no occlusion)". So
  the source's "for whatever reason" [00:04:17] is a default.
- **Held: the line-width unit changed in 4.3.** Release notes, Blender 4.3 Grease Pencil, Deprecated
  Features: "Strokes are now always in "World Space" thickness mode. While the "Screen Space" option is
  no longer available." The modifier exposes `radius` (float, 0.0025) on 5.2.2 where 4.2.16 exposed
  `thickness` (int, 25). The video's "line radius" field name places him on 4.3 or later despite "I'm
  on an older version" [00:05:34], so every menu he uses exists unchanged in 5.2.2.
- **Narrowed: "0.002 is the 0.0025 default".** The miner reads the video's 0.002 [00:03:25] as the
  0.0025 default as the UI rounds it. Plausible, not checked: the UI's display precision was not probed.
- **Held: catches.** `headless-dcc-capability-limits` already states the silent no-op shape, "probe the
  effect, record the version", and names brush painting as a residual manual step (rows 1 and 3). The
  manual's warning that clearing baked line art "will also clear those strokes" drawn by hand is the
  generator-owned versus hand-owned split `machine-owned-regions` states for files (row 4).
- **Held: no seam today.** gravitone's `music-clip` "Inked looks on LTX" (skill 2.11.0 now; the miner
  read 2.10.0, the section is unchanged) measures its failure as "seeds smooth the hatching toward CG
  shading by 4 s" without an ink-holds motion line; a Blender line pass cannot touch that, because the
  video model draws every frame. The mage-arena retrospective says "Avoid directions that need
  hand-drawn line quality on animated 3D"; `toolkit-fit-slice-before-the-look-is-chosen` already
  carries "Line quality on moving geometry" as a slice element. PoF's route is PBR; Blender line art
  bakes to Grease Pencil strokes, not a UE runtime material.
- **No stylised-rendering subject.** `registry-query` on non-photoreal line art, toon and outline
  rendering returns image-to-3D gating, sprite production and character design, none of which owns a
  line pass. A lead with no home stays in this note; no subject was proposed for opening unattended.

## The leads

### Lead A: a view-dependent line generator needs its view (row 1)

**Claim (source's terms).** "You do actually need a camera in your scene for this to work" [00:03:51],
and no lines appear on the side the camera can't see. **Strip:** a view-dependent generator evaluated
without its view returns nothing, with no error; hidden lines are a default filter (occlusion level 0),
selectable by range, and Custom Camera is "Useful when baking multiple shots in different angles".
**Measured:** 0 / 2 / 5 strokes on 5.2.2 headless, above. **Home:** none as a technique. As an
amendment to `headless-dcc-capability-limits` it is one more instance of a stated shape (1/0/1, raw
+1). **Return condition:** a stylised or non-photoreal rendering subject exists (a forge decision,
E4), or the Lead C use returns and needs the headless setup written down.

### Lead B: set line width against scene scale, never copy a number (row 2)

**Claim (source's terms).** Radius 0.002 shows nothing, 0.1 is too thick, 0.05 reads as hand-drawn
[00:03:25]-[00:04:43]. **Strip:** since 4.3 generated stroke width is in world units, so a width is a
function of the subject's size and camera distance; a value from another scene, or a pre-4.3 tutorial's
"thickness 25", does not transfer. **Rule:** corroboration table (a dated fact with a primary).
**Home:** none; nothing in the corpus carries a stroke-unit fact. **Return condition:** as Lead A.

### Lead C: a line pass over fixed geometry for cross-cut look consistency (row 7)

**Claim.** The planner's use, not the source's: a line-art pass over a fixed 3D layout gives the same
drawn look in every cut, because the geometry does not drift; a line render could also stand where a
depth map was used as the control. **Boundary this adds** to
`toolkit-fit-slice-before-the-look-is-chosen`: an offline camera-projected line answers "line quality on moving geometry" for pre-rendered
frames (video keyframes, sprite sheets), never for a runtime look.

**Return condition:** the operator reopens 3D-layout keyframes (previs) or picks an inked look for a
multi-cut story. Consistency across cuts is the operator's named struggle (verdicts 11-19).

**Test design, when it returns (not banked: no host line today).** One TRELLIS asset or a simple
Blender layout, three shots at different camera angles, Line Art radius set per shot against camera
distance. Arm a: EEVEE line-art plus flat-shade keyframes into H3 Flex first/last-frame, 6-step.
Arm b: the same keyframes by image generation only, the current inked route. Optional arm c: the line
render as the control map for the H3 fun ControlNet union on disk; whether it accepts a line or canny
map is not verified and must be checked before the arm is written. Judge: does the drawn style hold
across the three cuts. Estimate: about 1 min CPU of line art a shot, seconds of GPU an EEVEE frame,
about 500 s an H3 clip, so about 1 h GPU for 2 arms x 3 shots. When it is banked it needs a named use,
the arm c control check, and the asset or layout chosen; none of those exists today.

## Candidates

Rule column: "Phase 5, +3" for scored rows; "corroboration table" for leads; "catch" for rows the
corpus already holds.

| # | Candidate | Voices | Anchor | G/R/C | Read | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Give a view-dependent line generator its view | S + manual + probe | [00:03:51]; [00:04:17] | 1/0/1 (raw +1) as an amendment | partial | **Lead A** | Phase 5, +3; lead under the corroboration table | `headless-dcc-capability-limits` holds the silent no-op shape. As a technique it has no subject (E4) |
| 2 | Line width is in world units since 4.3; set it against scene scale | S + 4.3 release notes + probe | [00:03:25]-[00:04:43] | n/a | real gap, homeless | **Lead B** | corroboration table | No home carries a stroke-unit fact |
| 3 | Project hand strokes onto the surface (placement Surface, not Origin) | S + manual | [00:05:34]-[00:06:00] | 1/2/1 (raw -1) | thin | Catch | Phase 5, +3 | `headless-dcc-capability-limits` names brush painting as the residual manual step; placement affects only new strokes |
| 4 | Keep hand strokes off the generated layer | manual (the video uses a separate Blank object) | [00:04:43]; manual Bake section | 1/1/1 (raw 0) | likely catch | Catch | Phase 5, +3 | `machine-owned-regions`, the same ownership split in another medium |
| 5 | Each Line Art modifier pays the full occlusion calculation | S + manual | [00:03:25] | 1/2/1 (raw -1) | thin | Untriaged | Phase 5, +3 | No home; "Use Cache" shares the first modifier's scene data |
| 6 | Lines render live in EEVEE and take light; also Cycles | S | [00:00:26]; [00:06:52] | n/a | thin | Untriaged | not scored (V4: nothing survives the strip) | Only `use_lights` = True was probed; no render |
| 7 | Line art over fixed geometry for cross-cut look consistency | planner | n/a | n/a | partial | **Lead C** | corroboration table | `toolkit-fit-slice-before-the-look-is-chosen`; mage-arena retrospective; no proof (V2 for any upper-layer form) |

Counts: accept 0 / lead 3 (rows 1, 2, 7) / currency 0 / catch 2 / untriaged 2.

## Instruments and plan: what was wrong

- **Plan, version risk.** The plan expected the video's older Blender to differ from 5.2.2. The field
  name "Line Radius" places the video on 4.3 or later, so the menu risk was moot; the one real change
  is the width unit, which the plan did not name.
- **Miner, the 4.2.16 probe.** It returned 0 strokes with a camera and 5 with the range raised. The
  miner calls this a probe quirk on the old data model; not evaluated, and it does not touch 5.2.2.

## Proposals (not landed)

- **Corpus, when a stylised-rendering subject is opened (E4):** Leads A and B as its first technique on
  the line pass, with the 5.2.2 probe numbers as the dated fact.
- **Corpus, when Lead C returns with a verdict:** the pre-rendered-frames boundary in
  `toolkit-fit-slice-before-the-look-is-chosen`. Not before a measured pair.

## Fetches: 4

Miner: yt-dlp metadata for the description; the Line Art modifier manual page; the Stroke Placement
manual page; the Blender 4.3 Grease Pencil release notes. Lander: no new fetch; the saved copies were
re-read at the quoted lines. Local: the miner's probe on 4.2.16 and 5.2.2, and the lander's re-run on
5.2.2, all headless on the CPU.

## Not verified

- The Cycles claim [00:06:52] and "reacts to light" in a render; only the layer's `use_lights` default.
- The UI's display of 0.0025 as 0.002.
- Whether Surface-placed strokes follow a deforming mesh without parenting.
- Whether the H3 fun ControlNet union takes a line or canny control.
- The exact Blender version in the video (4.3 or later by the field name).
