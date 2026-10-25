---
source: https://www.youtube.com/watch?v=XnS0vrbDrrc
kind: youtube
url: https://www.youtube.com/watch?v=XnS0vrbDrrc
title: "I Built a Dark Souls Boss With AI: Tripo, Seedance 2.5, DINO & Opus 5.5"
author: "Coding Crash Courses"
words: 1235
extracted: 12
accepted: 1
declined: 0
leads: 3
already_covered: 3
untriaged: 3
currency: 0
escalated: 1
dispatched: 0
applied: 1
shipped: 1
run_id: intake-XnS0vrbDrrc
siblings: 0 on the board at claim and throughout; one FOREIGN GPU batch (a 3D asset
  round from another project) held the shared render host and is not a board participant
---

# I built a Dark Souls boss with AI - intake 2026-10-24

**Class:** first-party practitioner build-walkthrough, n=1. The creator built the thing:
a generated mesh, rigged, animated from generated video through a keypoint model they
trained themselves, dropped into an engine as a boss. The demo half (which tools, in which
order) is reliable for that the pipeline exists. The operating half - what broke and how
they worked around it - is a first-party account and is where the yield is.

**Expected yield, said before the table: low.** 1,235 words, one practitioner, a corpus that
already owns generated-mesh acceptance, rigging and combat timing. One or two rows at most;
the rest catches and leads. That held: 12 extracted, 1 landed, 1 escalated.

**Declared focus from the last scorecard row:** apply and ship. Applied: the landing was
measured on the four finished heroes of a managed project and shipped there as a script.

**Operator instruction for this run:** media and game techniques always get a worked
example on locally installed models, including leads and escalations. Both the landing and
the escalation have one (see **Local examples**).

## Triage (v2.5 score; `G/R/C` = gain / risk / cost, auto-accept at `G-R >= 2` and `G >= C`)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Generated plates part when posed: render the posed mesh to find see-through | `generated-mesh-acceptance` § assembled-vs-shattered (occlusion needs rendering); `rig_check.py` (no gap test) | new-technique | real gap | 3/0/2 | **accept** (landed, applied, shipped) |
| 2 | K | subject | XL | Two-view synchronized generated video -> triangulated motion, keypoints trained on the character's own rig | `motion-and-audio` neighbourhood; memory "rigging a generated mesh beat video-only motion, no route chosen" | new-subject | real gap | - | **escalated (E4)** |
| 3 | K | technique | S | Read the hit window from the motion, not the authored notify | `realtime-combat-semantics`, `hit-dedup-per-swing` step 3 ("authored damage window") | new-technique | partial | 2/1/2 | untriaged |
| 4 | K | practice | S | Keep effects (fire, trails) out of generated motion clips; the engine adds them | `motion-quality-gating` neighbourhood | amendment | partial | - | untriaged |
| 5 | K | technique | S | Twist ambiguity resolved by extra points plus joint limits | escalation #2's home | - | partial | - | untriaged (rides with #2) |
| 6 | - | technique | S | A rigid accessory takes a single-bone binding | `rig-preset-and-bone-remap-binding.md:83` | none | catch | - | already covered |
| 7 | - | technique | S | Parry window around 0.2 s; hit-stop and poise on the boss | `active-defense-two-axis-split` + reaction anchors; PoF hitstop presets | none | catch | - | already covered |
| 8 | - | technique | S | Synthetic keypoint training with blur and compression augmentation | `motion-quality-gating` (artifact classes); rides with #2 | none | catch | - | already covered (as gating, not training) |
| 9 | - | lead | - | Text-to-motion for locomotion; video-derived walks looked wooden | PoF text-to-motion spec | - | - | - | lead |
| 10 | - | lead | - | A DINOv2-backbone keypoint head trained in an afternoon | none on this machine | - | - | - | lead |
| 11 | - | lead | - | Hosted mesh and video generators at named versions | currency only; no published claim depends on them | - | - | - | lead |
| 12 | - | currency | - | Same hosted generators | no application cites them | - | - | - | no clock to reset |

`auto=1/0/1 fp=0`. Row 2 is XL and a new subject, so E4 sent it to the operator rather than
the score.

### The `partial` rows, with their promoting questions executed

- **Row 3.** *Does any subject derive the active window from the motion?* No.
  `hit-dedup-per-swing` runs the contact test inside an **authored** window, and PoF's
  `src/lib/animation/combo-links.ts` reads `hitSec = hit?.time` from the authored notify and
  never looks at the motion; `catalog-enemy-adapter.ts` defaults `activeMs ?? 150`. The gap is
  real. It did not promote, because there is no generated weapon clip with an authored notify
  on this machine to A/B against, and the local example (below) shows the window read is only
  valid after a sync gate the source never mentions. Banked with that anchor.
- **Row 4.** *Does `motion-quality-gating` say anything about baked effects?* It gates
  artifacts, not content choices. A one-paragraph amendment at most, GAIN 1 with no
  convergence. Banked.

## The landing: posed see-through render (`generated-mesh-acceptance`)

**What the source had.** The generated boss came out as hundreds of loose shells. Once it was
rigged and swung, gaps opened between armour plates and the camera saw straight through.
Their fix was manual. The corpus said occlusion between shells needs rendering, but nothing
in the gate or the rig check renders a posed mesh.

**What was measured** (Blender 5.2.2, EEVEE, headless; 37 poses x 6 cameras at 192 px):

- **Controls first.** A voxel-remeshed closed copy read 0/6 rest views; the same copy with
  292 chest faces deleted fired in 3/6 (max 2.1%).
- **Correction to the source's framing.** The closed control is 0% at rest and up to 16%
  posed: deformation folds a closed surface past joint limits. A raw posed count convicts
  everything. The finding is only the **excess over a closed copy in the same pose**, which
  became the technique's step 2.
- **PoF's four finished heroes:** two are 32-42% back faces **at rest** (inverted winding,
  invisible to the structural card); one opens only when posed (0.95% rest -> 2.9% median,
  10.4% max excess; hip plates part on thigh lift); one stays clean. Target 0 -> 3 of 4
  caught; floor held. **Verdict `better`.**

Shipped as `scripts/visual-gen/pof_mesh_seethrough.py` on pof `f9a5d8ea` (local, not
pushed), with a row in pof's `.ai/applied.jsonl`. Return condition: wire it into the TS mesh
gate beside `pof_mesh_critique.py`, which scores the rest mesh only.

## The escalation: two-view motion extraction (E4)

The source's central mechanism: generate the attack as **two synchronized views** in one
clip (front and side panels), track keypoints in each, triangulate. They trained the
keypoint model on renders of the character's own rig, with blur and compression
augmentation so it survives generated video. Proposed home if the operator wants it:
`game-production/asset-production/motion-and-audio/<new subject>`. It is XL and a new
subject; it was not forged.

## Local examples

**1. See-through** - above; frames under the run's scratch directory (`sheet_rest.png`,
`sheet_wA.png`).

**2. Two-view generated clip (LTX-2.5 22B distilled, local).** First frame: warrior A
rendered from two level orthographic cameras at one height, composited side by side
(1280x704). Level cameras at one height put a body point on the **same image row** in both
panels, so the top of the silhouette (the sword tip) is a correspondence that needs no
keypoint model. Sync = correlation of the two panels' top-row series over lags +/-12.
Strike = frames where the top point moves down at >= 50% of its peak speed.

| Seed | r at lag 0 | best lag | best r | mean row gap | strike frames | strike |
| --- | --- | --- | --- | --- | --- | --- |
| 4100 | 0.982 | 0 | 0.982 | 10.1 px | 13-15 | 0.54-0.63 s (~125 ms) |
| 4101 | 0.942 | **4** | 0.983 | 13.0 px | 30-37 (smeared) | 1.25-1.54 s |

Two things the source did not say:

- **The model does not reliably hold two panels in sync.** One seed of two drifted four
  frames (~170 ms): the front panel has struck while the side panel's sword is still up.
  Triangulating that pair would fuse two different instants. A sync check is a gate before
  any triangulation, and it costs one correlation.
- **A strike window read from a desynced clip is wrong, not noisy.** Seed 4101's window is
  three times wider because it averages two strikes that happen at different times. Read the
  window only after the sync gate passes. Seed 4100's synced window (~125 ms) sits beside
  PoF's `activeMs ?? 150` default, which is the comparison row 3 would A/B.

Both findings are n=2 and are recorded as evidence for the escalation, not as content.

**3. Effects in the clip (row 4), same instrument, 2026-10-25.** Arm B is the same first
frame and seeds with one sentence changed: "no effects, no fire" became "the blade is
wreathed in roaring fire; flames, sparks and embers trail behind the swing and burst on
impact".

| Arm | Seed | r at lag 0 | best lag | mean row gap | top-row jitter L / R | strike read |
| --- | --- | --- | --- | --- | --- | --- |
| no effects | 4100 | 0.982 | 0 | 10.1 px | 0.37 / 0.18 px | frames 13-15 |
| no effects | 4101 | 0.942 | 4 | 13.0 px | 0.19 / 0.06 px | 30-37 (desync) |
| fire | 4100 | 0.861 | 4 | 26.9 px | 0.50 / **3.72** px | 15-15 (one frame) |
| fire | 4101 | 0.837 | **-12** (edge of search) | 46.9 px | 1.65 / 1.01 px | 49-51 |

The frames say why. The embers rise to the top of the frame, so the tracked "top of the
silhouette" reads row 0-2 for the whole swing: the tracker follows sparks, not the blade.
At impact the burst covers the blade and both feet, which are exactly the contact points a
strike window and a foot-plant read need. The side panel's top row jumps 15 -> 204 -> 28 ->
22 -> 188 across five frames. In seed 4101 the character's silhouette also changes (a brim
appears) once the fire takes over. A keypoint model trained to ignore sparks would recover
some of the tracking. Nothing recovers a blade hidden behind a fireball. The source's rule
holds on this model: **keep effects out of motion-source clips, and add them in the
engine.** The two arms differ in one prompt sentence, so the motion itself also differs
between arms. This is n=2 per arm, and row 4 stays untriaged with this as its evidence.

## Leads (with return conditions)

- **Text-to-motion for locomotion.** Return when a text-to-motion model is installed on the
  media bench; PoF's text-to-motion spec is the seam.
- **DINOv2-backbone keypoint head.** Return when the operator chooses a route for row 2.
- **Hosted generators at named versions.** Return if a published application starts
  citing one.

## Method notes

- `research-ingest.mjs` exited 2: yt-dlp had no `curl_cffi` impersonation. Fixed by
  reinstalling yt-dlp with `curl_cffi`. The instrument's no-impersonation hint did not fire,
  because its pattern does not match "Impersonate target ... is not available".
- Render time: the clip sampler took 307-340 s per seed with a foreign TRELLIS batch queued
  on the same server; the first seed waited ~100 min in that queue. Recorded so the number
  does not read as a model property.
- 0 of 3 fetches; the class corroborates corpus-internally.
