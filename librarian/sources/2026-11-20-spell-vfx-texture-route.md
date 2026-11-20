---
source: batch
kind: batch
url: "youtube:peHi4w1SKEA"
urls:
  - https://www.youtube.com/watch?v=peHi4w1SKEA
title: "Spell VFX texture route, /shift batch of 1 video from 1 channel"
author: "1 channel: Can It Code? (first-party practitioner build walkthrough; sponsored segment skipped; ends in a paid upsell)"
words: 1845
extracted: 11
accepted: 0
declined: 0
leads: 2
already_covered: 4
untriaged: 5
currency: 0
dispatched: 0
applied: 0
shipped: 0
held: 1
run_id: shift-1120-svfx
siblings: 2
fetches: 2
rescan_when: the operator's verdict on shift-replica-svfx-fireball-texture-route (rows 1-4 and 11); or PoF's UE project is restored on a machine (row 5); or a text-to-motion model is on disk and a PoF spellbook montage needs a gesture per spell (row 8); or a second channel builds game VFX from generated flipbooks; or 8 weeks elapse (2027-01-15)
---

# Spell VFX texture route, mined under /shift, 2026-11-20

Plan `plan-20261120-104354`, cluster `spell-vfx-texture-route`, board run `shift-1120-svfx`. The
question: how should a game spell's moving textures be made, and how is a spell built from them? One
miner read the transcript whole. No GPU, no ComfyUI call, no download, no render. Phase 7.7:
gate=skipped.

- **V** = `youtube:peHi4w1SKEA`, Can It Code?, "AI Can Now Make Game VFX. Here's My Workflow" (1,845
  words, 10:54). He builds four Diablo-like spells and their upgrades in Unreal, ports them to Godot,
  and compares three ways of making a flipbook. Tripo segment [00:01:42]-[00:03:06] skipped
  (sponsored). The spells and "three skills for Claude and Codex" sit behind a paid Patreon, not
  joined.

**Class and expected yield, stated first:** a practitioner build walkthrough. The operating half (what
happened to him while building) can yield one or two findings; the tour half (the Godot port, Kimodo,
monsters, loot) yields catches. The segment he is proudest of, the three-way comparison, has no
boundary: he judged his own clips by eye, from his own camera, with no blind pair and no per-effect
budget. Expected: catches, leads and a remake. That held: 0 accepted, 2 leads, 4 caught, 5
untriaged, 1 held replica.

**Voices.** One channel, so no convergence inside the cluster. The 2026-10-29 PC-games batch carries a
lead, "video-generated effects cut into flipbooks beat layered static frames up close", with the
return "a local render pair under Phase 6b". That note does not name the channel, so no convergence is
counted; the held row below is the bank answering that return.

**Admission.** The **+3 bar** governed rows 1, 4 and 11, the three scored rows. It comes from `/intake`
Phase 5 Step 3 (its v2.21 paragraph) and Step 4 as they stand, read against `SCORECARD.md` on
2026-11-20: the last nonzero fp is 2026-11-19 `layout-decision-placement` (fp=1), so there are not
three consecutive fp=0 runs since, and no run has recorded re-deriving a rejected row. The step-down
has not fired, and a step is a method edit, never a lander's setting. Row 4 is the one the bar
touches: 2/0/2 would clear +2 on score, but its home is the subject row 1 proposes, so E4 holds it
either way. Rows 2 and 7 are V2 vetoes, recorded untriaged and not scored. Leads 5 and 8 ran under the
corroboration table. `auto=0/2/1` (row 1 escalated). **fp=0**: the miner made no accept.

## What landed

This note, its ledger lines and one held replica row,
`shift-replica-svfx-fireball-texture-route` (GPU, estGpuMin 15). No corpus file changed, no code
changed, no project touched.

## What the promotion read found

The lander re-read the transcript at [00:03:06]-[00:08:42], PoF at `origin/master` 66dc1d35c
(`pipelines/vfx.ts` steps 1-6, `canon-seed.ts` art-vfx and vfx-budget, `craft/lenses/vfx.md`,
`toolsets/niagara.py`, `new-catalogs.ts`, `spellbook.ts`), mage-arena at 579737e (T58 lines 110-120,
T63's summary, commits 7672232, b09a8b2 and 56fa123, `CreateBudgetFxCommandlet.cpp`), gravitone at
d973342e (`pipeline/video/ltx-i2v-api.json` node by node and its `.md`, `pipeline/video/README.md`,
`lib/imaging/video/comfyLtx.ts`, `lib/imaging/local/codex.ts`), the model files on disk by name, and
the corpus homes the rows cite.

- **Held.** Steps 3 "Mesh / Sprite" and 4 "Material" of PoF's vfx track are `gallerySeed`
  placeholders that name no engine; step 2 declares the emitters `<slug>_burst, <slug>_smoke`,
  lifetime 0.6 s. Canon `vfx-budget` says "Restrained, readable — no gratuitous additive stacking".
  The lens's `element-layering-economy` calls "brute-force texture flipbooks where combined masks would
  do" the tell of non-professional work. Niagara tooling lists and spawns only. mage-arena T58 moved
  its glow to an alpha blend after two blind critics read additive fire drift to yellow-gold over
  bright sand; T63 cut translucent triangles from 406k to 23k with eye-facing flipbook cards and won
  9 of 9 blind school pairs; T72b, T72c and T73 each reverted Fire to T67. The models the row needs are
  on disk. No corpus subject covers game VFX (`registry-query` returns sprite, motion and concept
  hits only), and `palette-discipline-across-frames` excludes "effects and particle art whose value is
  in additive gradients".
- **Corrected (the PoF read).** The local PoF `master` is 2408 commits behind `origin/master`, and
  the miner read the local tree. At `origin/master` the seam is unchanged (steps 3-4 still name no
  engine; only step 6's checker moved, to `atMost` 0.552 ms), so the finding holds, but the row cites
  `origin/master` and checks steps 3-4 again at setup.
- **Corrected (the upscaler).** The plan listed the x2 latent upscaler and the miner dropped it at
  atlas cell size. On our wired route it is not a flag: gravitone's LTX graph is two-pass by
  construction (a half-size first pass, the upsampler `452:438`, a three-sigma second pass). The row
  makes a single-pass copy by rewiring two decode inputs and setting two size expressions, and falls
  back to the unchanged graph at 512x512 if ComfyUI refuses it. Neither renders above 512x512.
- **Corrected (smoke alpha).** Alpha from luminance, not BiRefNet, is right, but it needs the smoke
  drawn white on black so brightness carries density. The miner's "dark grey smoke on pure black"
  would come back near transparent. The rig tints it dark.
- **Corrected (the loop).** The miner left H3 FL2VA first=last as the core's loop closer. gravitone
  measured that pinning "reduced the motion to a slow breath", so the row closes the loop with a
  crossfade of the clip's own frames and checks the seam in time.
- **Found.** `comfyLtx.ts` `renderLtxClip` calls `/free` after each clip unless `release: false`,
  which `gpu-bank.md` forbids; the row says so. Only an image-to-video LTX graph is wired, so the
  pattern clip starts from a Codex still. mage-arena's build is a C++ commandlet on the Niagara editor
  API, and mage-arena-vr was decommissioned on 2026-10-29: it is evidence, never a second use. The
  source's video route also made "the burning ground" [00:06:26]-[00:06:52], a fourth element the row does not
  remake.

## Candidates

Rule column: "Phase 5, +3" for scored upper-layer rows; "V2" for vetoed rows; "corroboration table"
for leads; "catch" for rows the corpus already holds. G/R/C is the lander's.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A 3D effect is several parts with their own timing (cards, procedural particles and lights, meshes), not one generated clip | V + PoF lens + mage-arena T58/T63 | [00:03:06]-[00:04:32] | Untriaged, escalated E4, raw 4/0/XL | Phase 5, +3 | GAIN 3 new subject, +1 convergence (the source, PoF's lens from GDC talks and mage-arena's layered cards reached it apart). RISK 0: both trees opened. No game-VFX subject; `surface-and-imagery` holds 5 of 10, `engine-integration` and `content-pipeline` are full. A subject is a forge dispatch. Held behind the replica's verdict |
| 2 | Fix an effect's parts, order and timing from one play-camera clip before building it | V | [00:03:49]-[00:04:32] | Untriaged | V2 | Prose only. Partial prior art: `toolkit-fit-slice-before-the-look-is-chosen` fixes a look at the game camera with stills; `picture-as-timing-brief` times sound from a picture. Nothing times an effect from a motion reference. The replica's arm P tests it |
| 3 | Route each flipbook by realism: video, whole-atlas image, or code | V | [00:06:08]-[00:08:27] | Method caught; the ranking goes to the held row | catch + render | `declare-the-producer-per-asset-class` already decides a producer per class from a paired trial at the true viewing distance. His ranking is n=1 by eye. It converges with mage-arena's stalled code fire and conflicts with PoF's lens, so the row decides it per element |
| 4 | Fireball rig: stacked camera-facing cards, a tail of short-lived shrinking quads, a travelling light | V (textbook) | [00:04:32]-[00:05:29] | Untriaged, raw 2/0/2 | Phase 5, +3 | Training-data convergence, so no V2. Below +3; would clear +2 on score, but its home is row 1's subject (E4). It is the replica's shared rig |
| 5 | Author the engine effect by script, then check it frame by frame from the play camera | V | [00:05:29]-[00:05:54] | Lead | corroboration table | The judging half is caught (`frame-the-judged-shot-from-a-play-trace`). PoF's Niagara toolset only lists and spawns, and PoF's UE project is not on Lynx. mage-arena builds six systems in a C++ commandlet |
| 6 | Price each route (video 0.5-1 USD a clip, about 3 USD a spell; image and code free under subscription) | V | [00:06:52], [00:07:52] | Caught | catch | `cost-per-usable-economics`: cost per usable output with retries. Numbers recorded here only; the replica prices GPU and Codex seconds per accepted atlas |
| 7 | Port the effect spec across engines unchanged | V | [00:08:42]-[00:09:20] | Untriaged | V2 | Tour half, unmeasured. Godot is not installed and no fleet project targets it |
| 8 | Text-to-motion cast gesture per spell | V | [00:09:20]-[00:09:41] | Lead | corroboration table | `motion-source-route-by-action-class` routes text-to-motion for cyclic locomotion; a cast gesture is outside its tested boundary. No model on disk |
| 9 | Animate monsters from generated video onto your own rig | V | [00:09:41] | Caught | catch | `generated-video-motion-extraction` (mined 2026-10-24). PoF's monster route is already chosen (bake and fitted rig) |
| 10 | "Still runs more than 60 FPS" after the upgrades | V | [00:08:17]-[00:08:42] | Caught | catch | `cost-per-effect-before-effect-count`; PoF prices per class (0.48 ms of 0.8 ms). A frame rate is not a per-class budget |
| 11 | Choose additive or alpha by the ground the effect plays over (from the seam, not the source) | mage-arena T58 | `SPELL-VFX-T58-2026-10-25.md:115` | Untriaged, raw 1/1/1 | Phase 5, +3 | `overdraw-and-transparency-ceiling` picks a blend by what the tiler pays; the look condition is a boundary case. RISK 1: the home is contested between that headset subject and row 1's. Every replica route renders under both blends |

## Leads

- **Row 5, scripted Niagara authoring.** PoF's `toolsets/niagara.py` gains a build tool modelled on
  mage-arena's `CreateBudgetFxCommandlet` (emitter inputs set by name, sprite size, lifetime, loop) and
  a play-camera capture. **Return when** PoF's UE project is restored on a machine; it then carries the
  replica's kept route into an NS_ system with its 3 LOD tiers and reads the GPU ms the replica cannot.
- **Row 8, text-to-motion per spell.** **Return when** a text-to-motion model is on disk (a download
  waits for night and the operator) and a PoF spellbook montage needs a gesture per spell; PoF
  humanoids reuse one skeleton and ABP today.

## Held

- **`shift-replica-svfx-fireball-texture-route`** (replica, GPU, estGpuMin 15, CPU wall about an
  hour). One original fireball over PoF's stone floor from a high three-quarter ARPG camera. Arm P: one
  LTX clip of the whole spell sets the parts and their timing. Way 1: Codex still on black, LTX
  single-pass 512x512, cut to an 8x8 atlas, alpha from luminance. Way 2: Codex draws each 64-cell
  atlas whole, grid-tested. Way 3: PoF's lens default, two scrolling masks multiplied. One three.js
  rig in software Chromium; every route under additive and alpha blend, over PoF's floor and over pale
  sand (mage-arena's failing condition). Use: which texture route PoF's vfx steps 3-4 name per element
  (core, burst, smoke) and which blend the material declares, for `vfx-fire-impact` and Fireball
  `off-fire-01`. The operator picks per element, then keep developing, close or drop. UE GPU ms stays
  unmeasured.

## Proposals (not landed)

- **Row 1, a game-VFX subject (E4).** Bundle `game-production`, category
  `asset-production/surface-and-imagery` (5 of 10). Proposed techniques: a spell as parts with their own
  timing (row 1); timing fixed from a play-camera pattern clip (row 2, if arm P reads); the stacked-card
  core with a short-lived tail and a travelling light (row 4); the texture route per element, from the
  replica's verdict (row 3); the blend chosen by the ground as well as by cost (row 11). Must not absorb:
  `sprite-and-atlas-production`'s flat-art atlas acceptance, `overdraw-and-transparency-ceiling`'s cost
  rule, `generated-video-motion-extraction`. Open for the drafter: whether the blend rule is an
  amendment to the headset technique or lives here with a discriminator. Dispatch only after the
  replica's verdict, since a kept route is the subject's evidence.

## Replication

Material obtained word for word: the transcript and the description only. Stopped by a paywall
(Patreon: the spells and three skills) and by absence (he says the agent talks to the tools and he
types no prompts [00:01:16]). Translation: Seedance to LTX-2.5 distilled (on disk); his GPT image to
Codex image_gen, the main image engine; his code way to PoF's lens default; Niagara by script to a
three.js rig rendered headless (the operator's code-rendered route), since PoF's UE project is not on
Lynx; Tripo to TRELLIS (not remade, sponsored); Kimodo and Godot missing. The row is above.

## What the plan got right and wrong

- **Right:** the remake is the yield; Niagara by script and text-to-motion are leads; no game-VFX
  subject exists; the source's Way 2 is our main image engine unchanged.
- **Wrong:** the transcript was not cut at 08:42. "Fire is additive on black and needs no alpha" is
  contradicted by mage-arena's blind result and PoF canon. BiRefNet is the wrong default for smoke. The
  x2 upscaler is not needed at atlas cell size. It missed PoF's lens default and mage-arena's measured
  ceiling, and it read PoF's stale local tree.

## Plan homes

Rows drew on `generative-artifact-gating` (`declare-the-producer-per-asset-class`),
`standalone-headset-frame-budgets` (`overdraw-and-transparency-ceiling`), `render-submission-economy`
(`cost-per-effect-before-effect-count`), `generated-video-motion-extraction`, `concept-scene-parity`,
`tiling-texture-acceptance` (`wrap-around-edge-diff`, used in time by the row),
`sprite-and-atlas-production` and `generative-provider-routing` (`cost-per-usable-economics`).
`ability-authoring-to-engine` and `realtime-combat-semantics` drew no row.
